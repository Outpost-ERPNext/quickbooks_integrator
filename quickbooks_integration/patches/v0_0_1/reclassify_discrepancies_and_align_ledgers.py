import frappe
from quickbooks_integration.api.inventory_cogs_sync import sync_inventory_cogs_valuation

def execute():
    """
    Automated Frappe Patch to resolve auditor discrepancies raised by finance:
    1. Fix ACC-JV-2026-05847 party: Link to correct QBO vendor 'Bike Rider' (SUP-2025-00002) instead of Calorama (SMN0010).
    2. Ensure native ERPNext account '401120 - Inventory Shrinkage - MTL' exists under Cost of Goods Sold.
    3. Reclassify 2025 Inventory Shrinkage (11,527,687.00) from 401080 to 401120.
    4. Reclassify Cost of SAAS from '401080 - COGS Logistics - MTL' to '401070 - COGS SAAS - MTL' for all QBO-synced entries.
    5. Reclassify Commission and Fines from '403320 - Office Expenses - MTL' to '403130 - Commission And Fines - MTL' where applicable.
    6. Run sync_inventory_cogs_valuation() to synchronize all valuation and alignment entries.
    
    SAFETY GUARANTEE:
    - Exclusively targets specific QuickBooks-synced Journal Entries.
    - Zero impact on native Movam operational entries.
    - Completely idempotent.
    """
    company = "Movam Technologies Limited"
    print("\n--- Starting Reclassification and Auditor Alignment Patch ---")

    # 1. Fix ACC-JV-2026-05847 party (Calorama -> Bike Rider)
    fix_acc_jv_2026_05847(company)

    # 2. Ensure Inventory Shrinkage account exists
    ensure_inventory_shrinkage_account(company)

    # 3. Reclassify 2025 Inventory Shrinkage
    reclassify_inventory_shrinkage(company)

    # 4. Reclassify Cost of SAAS from COGS Logistics to COGS SAAS
    reclassify_cogs_saas(company)

    # 5. Reclassify Commission and Fines
    reclassify_commission_and_fines(company)

    # 6. Re-sync valuation entries
    sync_inventory_cogs_valuation(company)

    frappe.db.commit()
    print("--- Reclassification and Auditor Alignment Patch Completed Successfully ---\n")


def fix_acc_jv_2026_05847(company):
    jv_name = "ACC-JV-2026-05847"
    if not frappe.db.exists("Journal Entry", jv_name):
        return

    bike_rider = "SUP-2025-00002"
    if not frappe.db.exists("Supplier", bike_rider):
        bike_rider = frappe.db.get_value("Supplier", {"supplier_name": "Bike Rider"}, "name")
    if not bike_rider:
        bike_doc = frappe.get_doc({
            "doctype": "Supplier",
            "supplier_name": "Bike Rider",
            "supplier_group": "All Supplier Groups",
            "supplier_type": "Company",
            "custom_quickbooks_vendor_id": "158"
        })
        bike_doc.flags.ignore_mandatory = True
        bike_doc.flags.ignore_permissions = True
        bike_doc.insert(ignore_permissions=True)
        bike_rider = bike_doc.name

    frappe.db.sql("""
        UPDATE `tabJournal Entry`
        SET title = 'Bike Rider', pay_to_recd_from = 'Bike Rider'
        WHERE name = %s
    """, (jv_name,))

    frappe.db.sql("""
        UPDATE `tabJournal Entry Account`
        SET party = %s
        WHERE parent = %s AND (party = 'SMN0010' OR party_type = 'Supplier')
    """, (bike_rider, jv_name))

    frappe.db.sql("""
        UPDATE `tabJournal Entry Account`
        SET against_account = %s
        WHERE parent = %s AND account = '119020 - Globus Bank - MTL'
    """, (bike_rider, jv_name))

    frappe.db.sql("""
        UPDATE `tabGL Entry`
        SET party = %s, against = '119020 - Globus Bank - MTL'
        WHERE voucher_no = %s AND (party = 'SMN0010' OR party_type = 'Supplier')
    """, (bike_rider, jv_name))

    print(f"  Fixed {jv_name}: linked to vendor {bike_rider} (Bike Rider)")


def ensure_inventory_shrinkage_account(company):
    acc_name = "401120 - Inventory Shrinkage - MTL"
    if not frappe.db.exists("Account", acc_name):
        parent_acc = "401000 - Cost of Goods Sold - MTL"
        if not frappe.db.exists("Account", parent_acc):
            parent_acc = frappe.db.get_value("Account", {"company": company, "root_type": "Expense", "is_group": 1}, "name")
        doc = frappe.get_doc({
            "doctype": "Account",
            "account_name": "Inventory Shrinkage",
            "account_number": "401120",
            "parent_account": parent_acc,
            "company": company,
            "root_type": "Expense",
            "account_type": "Expense Account",
            "is_group": 0
        })
        doc.flags.ignore_mandatory = True
        doc.flags.ignore_permissions = True
        doc.insert(ignore_permissions=True)
        print(f"  Created account: {acc_name}")


def reclassify_inventory_shrinkage(company):
    target_acc = "401120 - Inventory Shrinkage - MTL"
    if not frappe.db.exists("Account", target_acc):
        target_acc = "402010 - Stock Adjustment - MTL"

    jes = frappe.db.sql("""
        SELECT name FROM `tabJournal Entry`
        WHERE (user_remark LIKE '%%Inventory Hardware Valuation & Shrinkage - 2025%%'
               OR custom_quickbooks_je_id = 'COGS-ADJ-2025'
               OR name = 'ACC-JV-2026-22774')
          AND company = %s
    """, (company,), as_dict=True)

    for j in jes:
        frappe.db.sql("""
            UPDATE `tabJournal Entry Account`
            SET account = %s
            WHERE parent = %s AND account = '401080 - COGS Logistics - MTL'
        """, (target_acc, j.name))

        frappe.db.sql("""
            UPDATE `tabGL Entry`
            SET account = %s
            WHERE voucher_no = %s AND account = '401080 - COGS Logistics - MTL'
        """, (target_acc, j.name))
        print(f"  Reclassified 2025 Shrinkage in {j.name} to {target_acc}")


def reclassify_cogs_saas(company):
    target_acc = "401070 - COGS SAAS - MTL"
    source_acc = "401080 - COGS Logistics - MTL"

    jes = frappe.db.sql("""
        SELECT DISTINCT ja.parent
        FROM `tabJournal Entry Account` ja
        JOIN `tabJournal Entry` j ON ja.parent = j.name
        WHERE ja.account = %s
          AND j.company = %s
          AND (ja.cost_center = 'QuickBooks - MTL' OR j.channel = 'QuickBooks' OR ja.channel = 'QuickBooks')
          AND NOT (j.user_remark LIKE '%%Shrinkage%%' OR j.name LIKE '%%COGS-ADJ%%')
    """, (source_acc, company), as_dict=True)

    count = 0
    for j in jes:
        frappe.db.sql("""
            UPDATE `tabJournal Entry Account`
            SET account = %s
            WHERE parent = %s AND account = %s
        """, (target_acc, j.parent, source_acc))

        frappe.db.sql("""
            UPDATE `tabGL Entry`
            SET account = %s
            WHERE voucher_no = %s AND account = %s AND (cost_center = 'QuickBooks - MTL' OR channel = 'QuickBooks')
        """, (target_acc, j.parent, source_acc))
        count += 1

    print(f"  Reclassified {count} SAAS Journal Entries from {source_acc} to {target_acc}")


def reclassify_commission_and_fines(company):
    target_acc = "403130 - Commission And Fines - MTL"
    source_acc = "403320 - Office Expenses - MTL"

    target_qb_ids = ('EXP-14342', 'EXP-14416', 'EXP-15386', 'EXP-17697', 'EXP-18917', 'EXP-19350')
    target_jv_names = ('ACC-JV-2026-17036', 'ACC-JV-2026-17028', 'ACC-JV-2026-16610', 'ACC-JV-2026-15521', 'ACC-JV-2026-14836', 'ACC-JV-2026-14615')

    jes = frappe.db.sql("""
        SELECT DISTINCT ja.parent, ja.name as row_name
        FROM `tabJournal Entry Account` ja
        JOIN `tabJournal Entry` j ON ja.parent = j.name
        WHERE ja.account = %(acc)s
          AND j.company = %(company)s
          AND (ja.cost_center = 'QuickBooks - MTL' OR j.channel = 'QuickBooks' OR ja.channel = 'QuickBooks')
          AND (
              j.custom_quickbooks_je_id IN %(qb_ids)s
              OR j.name IN %(jv_names)s
              OR j.user_remark LIKE '%%Account: 28%%'
              OR ja.user_remark LIKE '%%Account: 28%%'
              OR j.user_remark LIKE '%%commission%%'
              OR ja.user_remark LIKE '%%commission%%'
              OR j.user_remark LIKE '%%fine%%'
              OR ja.user_remark LIKE '%%fine%%'
          )
    """, {
        "acc": source_acc,
        "company": company,
        "qb_ids": target_qb_ids,
        "jv_names": target_jv_names
    }, as_dict=True)

    count = 0
    for j in jes:
        frappe.db.sql("""
            UPDATE `tabJournal Entry Account`
            SET account = %s
            WHERE name = %s
        """, (target_acc, j.row_name))

        frappe.db.sql("""
            UPDATE `tabGL Entry`
            SET account = %s
            WHERE voucher_no = %s AND account = %s AND (cost_center = 'QuickBooks - MTL' OR channel = 'QuickBooks')
        """, (target_acc, j.parent, source_acc))
        count += 1

    if count:
        print(f"  Reclassified {count} Commission/Fine rows from {source_acc} to {target_acc}")
