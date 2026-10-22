import frappe
from quickbooks_integration.patches.v0_0_1.reclassify_discrepancies_and_align_ledgers import reclassify_prepayment_ledgers

def execute():
    """
    Migration Patch: Separate Merged Prepayment Accounts (Biswajit Balance Sheet Audit)
    - Reclassifies 12 Business Promotion prepayments from 116050 to 116020.
    - Reclassifies 10 Transportation prepayments from 116050 to 116040.
    - Fully idempotent with zero impact on native Movam operational entries.
    """
    company = "Movam Technologies Limited"
    print("\n--- Starting Separate Prepayment Accounts Migration Patch ---")
    reclassify_prepayment_ledgers(company)
    frappe.db.commit()
    print("--- Separate Prepayment Accounts Patch Completed Successfully ---\n")
