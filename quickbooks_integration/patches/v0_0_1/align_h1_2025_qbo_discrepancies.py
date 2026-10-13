import frappe
from quickbooks_integration.patches.v0_0_1.reclassify_discrepancies_and_align_ledgers import execute as run_reclassify

def execute():
    """
    Migration Patch: Align H1 2025 QuickBooks Reconciliation Discrepancies
    - Aligns COGS Device (401040) valuation adjustment to 2025-06-30 (H1 cutoff).
    - Unbundles 6 Commission & Fine vouchers (₦358,406.90) from Office Expenses (403320) to Commission And Fines (403130).
    - Aligns Multi-Currency Forex Fluctuation (403010) translation adjustment (-₦461,211.92) to 2025-06-30.
    - Synchronizes all QuickBooks inventory, shrinkage, and valuation entries.
    - Fully idempotent and zero impact on native Movam operational entries.
    """
    run_reclassify()
