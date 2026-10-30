import frappe
from quickbooks_integration.api.inventory_cogs_sync import sync_inventory_cogs_valuation

def execute():
    """
    Migration Patch: Account for H1 2025 Inventory Shrinkage (Biswajit Balance Sheet Audit)
    - Re-aligns Inventory Shrinkage entry (SHRINKAGE-ADJ-2025, ₦11,527,687.00) posting date to 2025-06-30.
    - Offsets the stock shrinkage against 234010 - Retained Earnings - MTL, bringing
      120000 - Stock Assets - MTL from ₦11,608,849.50 to ₦81,162.50 (exact QuickBooks balance)
      and accounting for the inventory write-off in 234010 - Retained Earnings - MTL.
    - Zero impact on native Movam operational entries (Lagos, Abuja, Benin, etc.).
    - Fully idempotent.
    """
    company = "Movam Technologies Limited"
    print("\n--- Starting Account for Inventory Shrinkage Migration Patch ---")

    # 1. Align Journal Entry and GL entries for SHRINKAGE-ADJ-2025
    align_shrinkage_entry(company)

    # 2. Run sync_inventory_cogs_valuation to ensure all QBO inventory adjustments are synced
    sync_inventory_cogs_valuation(company)

    frappe.db.commit()
    print("--- Account for Inventory Shrinkage Patch Completed Successfully ---\n")

def align_shrinkage_entry(company):
    target_date = "2025-06-30"
    target_debit_acc = "234010 - Retained Earnings - MTL"
    target_credit_acc = "120010 - Stock In Hand - Device - MTL"
    if not frappe.db.exists("Account", target_credit_acc):
        target_credit_acc = "120020 - Asset Warehouse - MTL"

    custom_id = "SHRINKAGE-ADJ-2025"
    remark = "QuickBooks Inventory Hardware Valuation & Shrinkage - 2025"

    jes = frappe.db.sql("""
        SELECT name FROM `tabJournal Entry`
        WHERE (custom_quickbooks_je_id = %s
               OR user_remark LIKE %s
               OR name = 'ACC-JV-2026-23052')
          AND company = %s
    """, (custom_id, f"%{remark}%", company), as_dict=True)

    for j in jes:
        jv_name = j.name
        # Update Journal Entry header
        frappe.db.sql("""
            UPDATE `tabJournal Entry`
            SET posting_date = %s,
                user_remark = %s
            WHERE name = %s
        """, (target_date, remark, jv_name))

        # Update debit account to 234010 - Retained Earnings - MTL
        frappe.db.sql("""
            UPDATE `tabJournal Entry Account`
            SET account = %s
            WHERE parent = %s AND (debit > 0 OR account LIKE '%%401120%%' OR account LIKE '%%Shrinkage%%')
        """, (target_debit_acc, jv_name))

        # Update credit account to target_credit_acc
        frappe.db.sql("""
            UPDATE `tabJournal Entry Account`
            SET account = %s
            WHERE parent = %s AND (credit > 0 OR account LIKE '%%1200%%')
        """, (target_credit_acc, jv_name))

        # Update GL entries posting date and accounts
        frappe.db.sql("""
            UPDATE `tabGL Entry`
            SET posting_date = %s
            WHERE voucher_no = %s
        """, (target_date, jv_name))

        frappe.db.sql("""
            UPDATE `tabGL Entry`
            SET account = %s
            WHERE voucher_no = %s AND (debit > 0 OR account LIKE '%%401120%%' OR account LIKE '%%Shrinkage%%')
        """, (target_debit_acc, jv_name))

        frappe.db.sql("""
            UPDATE `tabGL Entry`
            SET account = %s
            WHERE voucher_no = %s AND (credit > 0 OR account LIKE '%%1200%%')
        """, (target_credit_acc, jv_name))

        print(f"  [ALIGNED] {jv_name}: posting_date -> {target_date}, debit -> {target_debit_acc}, credit -> {target_credit_acc}")

