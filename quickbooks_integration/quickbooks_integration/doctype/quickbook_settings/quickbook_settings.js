// Copyright (c) 2025, maddy and contributors
// For license information, please see license.txt

frappe.ui.form.on("Quickbook Settings", {
    refresh(frm) {
        // Hide sidebar and expand to full width
        if (frm.page && frm.page.sidebar) {
            frm.page.sidebar.hide();
        }
        frm.page.wrapper.find(".form-sidebar").hide();
        frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10").addClass("col-md-12");

        frm.clear_custom_buttons();

        // 1. Primary Action: Connect QuickBooks
        frm.add_custom_button(__("Connect QuickBooks"), function () {
            frappe.call({
                method: "quickbooks_integration.api.oauth.get_auth_url",
                callback: function (r) {
                    if (r.message) {
                        window.open(r.message, "_blank");
                    } else {
                        frappe.msgprint(__("Failed to generate authorization URL."));
                    }
                }
            });
        }).addClass("btn-primary");

        // 1b. Standalone Action: Compare P&L
        frm.add_custom_button(__(`
            <span style="display:inline-flex; align-items:center; gap:6px; font-weight:600;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                Compare P&L
            </span>
        `), function () {
            show_pl_comparison_dialog();
        });

        // 1c. Standalone Action: Compare Balance Sheet
        frm.add_custom_button(__(`
            <span style="display:inline-flex; align-items:center; gap:6px; font-weight:600;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                Compare Balance Sheet
            </span>
        `), function () {
            show_bs_comparison_dialog();
        });

        // 2. Grouped Dropdown: Accounting & Transactions Sync
        frm.add_custom_button(__("Fetch Bills"), function () {
            frappe.call({
                method: "quickbooks_integration.api.bill_sync.enqueue_sync_bills",
                callback: function (r) {
                    frappe.show_alert({
                        message: r.message || __("Bill sync started in background..."),
                        indicator: "blue"
                    }, 8);
                }
            });
        }, __("Sync Transactions"));

        frm.add_custom_button(__("Fetch Invoices"), function () {
            frappe.call({
                method: "quickbooks_integration.api.invoice_sync.enqueue_sync_invoices",
                callback: function (r) {
                    frappe.show_alert({
                        message: r.message || __("Invoice sync started in background..."),
                        indicator: "blue"
                    }, 8);
                }
            });
        }, __("Sync Transactions"));

        frm.add_custom_button(__("Fetch Journal Entries"), function() {
            frappe.call({
                method: "quickbooks_integration.api.journal_entries_sync.enqueue_sync_journal_entries",
                callback: function(r) {
                    frappe.show_alert({
                        message: r.message || __("Journal Entries sync started in background..."),
                        indicator: "blue"
                    }, 8);
                }
            });
        }, __("Sync Transactions"));

        frm.add_custom_button(__("Fetch Payments"), function() {
            frappe.call({
                method: "quickbooks_integration.api.payments_sync.enqueue_sync_payments",
                callback: function(r) {
                    frappe.show_alert({
                        message: r.message || __("Payments sync started in background..."),
                        indicator: "blue"
                    }, 8);
                }
            });
        }, __("Sync Transactions"));

        frm.add_custom_button(__("Fetch Transfers"), function() {
            frappe.call({
                method: "quickbooks_integration.api.banking_and_returns_sync.enqueue_sync_transfers",
                callback: function(r) {
                    frappe.show_alert({
                        message: r.message || __("Transfers sync started in background..."),
                        indicator: "blue"
                    }, 8);
                }
            });
        }, __("Sync Transactions"));

        frm.add_custom_button(__("Fetch Deposits"), function() {
            frappe.call({
                method: "quickbooks_integration.api.banking_and_returns_sync.enqueue_sync_deposits",
                callback: function(r) {
                    frappe.show_alert({
                        message: r.message || __("Deposits sync started in background..."),
                        indicator: "blue"
                    }, 8);
                }
            });
        }, __("Sync Transactions"));

        frm.add_custom_button(__("Fetch Credit Memos"), function() {
            frappe.call({
                method: "quickbooks_integration.api.banking_and_returns_sync.enqueue_sync_credit_memos",
                callback: function(r) {
                    frappe.show_alert({
                        message: r.message || __("Credit Memos sync started in background..."),
                        indicator: "blue"
                    }, 8);
                }
            });
        }, __("Sync Transactions"));

        frm.add_custom_button(__("Fetch Vendor Credits"), function() {
            frappe.call({
                method: "quickbooks_integration.api.banking_and_returns_sync.enqueue_sync_vendor_credits",
                callback: function(r) {
                    frappe.show_alert({
                        message: r.message || __("Vendor Credits sync started in background..."),
                        indicator: "blue"
                    }, 8);
                }
            });
        }, __("Sync Transactions"));

        frm.add_custom_button(__("Fetch Direct Expenses"), function() {
            frappe.call({
                method: "quickbooks_integration.api.purchase_expenses_sync.enqueue_sync_purchases",
                callback: function(r) {
                    frappe.show_alert({
                        message: r.message || __("Direct Expenses sync started in background..."),
                        indicator: "blue"
                    }, 8);
                }
            });
        }, __("Sync Transactions"));

        frm.add_custom_button(__("Fetch Inventory & COGS"), function() {
            frappe.call({
                method: "quickbooks_integration.api.inventory_cogs_sync.enqueue_sync_inventory_cogs",
                callback: function(r) {
                    frappe.show_alert({
                        message: r.message || __("Inventory & COGS sync started in background..."),
                        indicator: "blue"
                    }, 8);
                }
            });
        }, __("Sync Transactions"));

        frm.add_custom_button(__("Stop / Cancel Sync"), function() {
            frappe.confirm(__("Are you sure you want to stop any currently running background sync?"), function() {
                frappe.call({
                    method: "quickbooks_integration.api.journal_entries_sync.cancel_sync",
                    callback: function(r) {
                        frappe.show_alert({
                            message: r.message || __("Sync stop signal sent."),
                            indicator: "orange"
                        }, 8);
                    }
                });
            });
        }, __("Sync Transactions"));

        frm.add_custom_button(__("Re-apply All Tags"), function() {
            frappe.call({
                method: "quickbooks_integration.api.bulk_tagging.run_from_ui",
                freeze: true,
                freeze_message: __("Re-applying all QuickBooks tags to ERPNext documents..."),
                callback: function(r) {
                    frappe.msgprint({
                        title: __("Tags Refreshed Successfully"),
                        message: r.message || __("All QuickBooks tags have been linked and verified in ERPNext."),
                        indicator: "green"
                    });
                }
            });
        }, __("Sync Transactions"));

        // 3. Grouped Dropdown: Master Data Sync
        frm.add_custom_button(__("Fetch Customers"), function () {
            frappe.call({
                method: "quickbooks_integration.api.customer_sync.sync_quickbooks_customers",
                freeze: true,
                freeze_message: __("Syncing Customers..."),
                callback: function (r) {
                    frappe.msgprint(r.message || __("Customers synced successfully."));
                }
            });
        }, __("Master Data"));

        frm.add_custom_button(__("Fetch Vendors"), function () {
            frappe.call({
                method: "quickbooks_integration.api.vendor_sync.sync_quickbooks_vendors",
                freeze: true,
                freeze_message: __("Syncing Vendors..."),
                callback: function (r) {
                    frappe.msgprint(r.message || __("Vendors synced successfully."));
                }
            });
        }, __("Master Data"));

        frm.add_custom_button(__("Fetch Items"), function () {
            frappe.call({
                method: "quickbooks_integration.api.item_sync.sync_quickbooks_items",
                freeze: true,
                freeze_message: __("Syncing Items..."),
                callback: function (r) {
                    frappe.msgprint(r.message || __("Items synced."));
                }
            });
        }, __("Master Data"));

        frm.add_custom_button(__("Fetch Accounts"), function () {
            frappe.call({
                method: "quickbooks_integration.api.account_sync.sync_quickbooks_chart_of_accounts",
                freeze: true,
                freeze_message: __("Syncing Chart of Accounts..."),
                callback: function (r) {
                    frappe.msgprint(r.message || __("Accounts synced."));
                }
            });
        }, __("Master Data"));

        frm.add_custom_button(__("Fetch Employees"), function () {
            frappe.call({
                method: "quickbooks_integration.api.employee_sync.sync_quickbooks_employees",
                freeze: true,
                freeze_message: __("Syncing Employees..."),
                callback: function (r) {
                    frappe.msgprint(r.message || __("Employees synced."));
                }
            });
        }, __("Master Data"));

        frm.add_custom_button(__("Fetch Company Info"), function () {
            frappe.call({
                method: "quickbooks_integration.api.comapany_info.get_quickbooks_company_info",
                freeze: true,
                freeze_message: __("Fetching Company Info..."),
                callback: function (r) {
                    if (r.message) {
                        frappe.msgprint(__("Company Info: ") + JSON.stringify(r.message, null, 2));
                    }
                }
            });
        }, __("Master Data"));

        // 4. Render In-Form Quick Actions Panel
        render_sync_dashboard(frm);
    }
});

function render_sync_dashboard(frm) {
    if (frm.dashboard_rendered) return;
    frm.dashboard_rendered = true;

    const isConnected = !!frm.doc.access_token;
    const env = frm.doc.environment || "sandbox";

    const initial_html = `
        <div class="qb-dashboard" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
                <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">QuickBooks Sync Center</h4>
                        <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 12px; background: ${isConnected ? '#ecfdf5' : '#fef2f2'}; color: ${isConnected ? '#059669' : '#dc2626'};">
                            ${isConnected ? '● Connected' : '● Disconnected'}
                        </span>
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 3px;">
                        Environment: <strong>${env.toUpperCase()}</strong> | Company ID: <strong>${frm.doc.realm_id || 'Not set'}</strong>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-default btn-xs" id="qb-refresh-counts-btn" style="font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Refresh Counts
                    </button>
                    <button class="btn btn-default btn-xs" id="qb-cancel-sync-btn" style="color: #dc2626; border-color: #fca5a5; font-weight: 600;">
                        Stop Sync
                    </button>
                </div>
            </div>

            <div id="qb-sync-cards-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
                <div style="grid-column: 1 / -1; text-align: center; padding: 24px; color: #64748b; font-size: 13px;">
                    <span class="spinner-border spinner-border-sm" role="status" style="margin-right: 6px;"></span>
                    Loading live QuickBooks & ERPNext document counts...
                </div>
            </div>
        </div>
    `;

    frm.dashboard.set_headline(initial_html);

    // Fetch and populate counts
    load_sync_center_counts(frm);

    // Bind Global Header Handlers
    setTimeout(() => {
        frm.page.main.find("#qb-refresh-counts-btn").on("click", function() {
            load_sync_center_counts(frm, true);
        });

        frm.page.main.find("#qb-cancel-sync-btn").on("click", function() {
            frappe.confirm(__("Are you sure you want to stop any currently running background sync?"), function() {
                frappe.call({
                    method: "quickbooks_integration.api.journal_entries_sync.cancel_sync",
                    callback: function(r) {
                        frappe.show_alert({ message: r.message || __("Sync stop signal sent."), indicator: "orange" }, 8);
                    }
                });
            });
        });
    }, 200);
}

function load_sync_center_counts(frm, show_toast = false) {
    const $btn = frm.page.main.find("#qb-refresh-counts-btn");
    $btn.prop("disabled", true).text("Refreshing...");

    frappe.call({
        method: "quickbooks_integration.api.sync_center_counts.get_sync_counts_summary",
        callback: function(r) {
            $btn.prop("disabled", false).html(`
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                Refresh Counts
            `);

            if (r.message && Array.isArray(r.message)) {
                render_sync_cards(frm, r.message);
                if (show_toast) {
                    frappe.show_alert({ message: __("Sync document counts refreshed"), indicator: "green" }, 4);
                }
            }
        },
        error: function() {
            $btn.prop("disabled", false).text("Refresh Counts");
        }
    });
}

function render_sync_cards(frm, items) {
    const container = frm.page.main.find("#qb-sync-cards-container");
    if (!container.length) return;

    let html = "";
    items.forEach(item => {
        const isComplete = item.percentage >= 100 && item.qb_count > 0;
        const isPartial = item.percentage > 0 && !isComplete;

        let badgeBg = "#f1f5f9";
        let badgeColor = "#64748b";
        let badgeText = `${item.percentage}%`;

        if (isComplete) {
            badgeBg = "#ecfdf5";
            badgeColor = "#059669";
            badgeText = `✓ ${item.percentage}% Synced`;
        } else if (isPartial) {
            badgeBg = "#eff6ff";
            badgeColor = "#2563eb";
            badgeText = `⏳ ${item.percentage}%`;
        }

        let barColor = isComplete ? "#10b981" : "#3b82f6";

        html += `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-weight: 700; font-size: 13px; color: #0f172a;">${item.label}</span>
                        <span style="font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 10px; background: ${badgeBg}; color: ${badgeColor};">
                            ${badgeText}
                        </span>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                        <span style="color: #64748b;">QB: <strong style="color: #0f172a;">${(item.qb_count || 0).toLocaleString()}</strong></span>
                        <span style="color: #64748b;">ERP: <strong style="color: ${item.erp_count > 0 ? '#2563eb' : '#64748b'};">${(item.erp_count || 0).toLocaleString()}</strong></span>
                    </div>

                    <div style="background: #e2e8f0; height: 5px; border-radius: 3px; overflow: hidden; margin-bottom: 10px;">
                        <div style="width: ${Math.min(item.percentage, 100)}%; height: 100%; background: ${barColor}; transition: width 0.4s ease;"></div>
                    </div>
                </div>

                <button class="btn btn-default btn-xs qb-card-sync-btn" id="${item.btn_id}" data-method="${item.method}" data-label="${item.label}" style="width: 100%; font-weight: 600; font-size: 11.5px; padding: 5px 0;">
                    Fetch ${item.label}
                </button>
            </div>
        `;
    });

    container.html(html);

    // Bind Card Sync Handlers
    container.find(".qb-card-sync-btn").on("click", function() {
        const $this = $(this);
        const method = $this.data("method");
        const label = $this.data("label");

        $this.prop("disabled", true).text(`Syncing ${label}...`);

        frappe.call({
            method: method,
            callback: function(r) {
                frappe.show_alert({
                    message: r.message || __(`${label} sync started in background...`),
                    indicator: "blue"
                }, 8);
                $this.prop("disabled", false).text(`Fetch ${label}`);
                // Refresh counts after 4 seconds
                setTimeout(() => load_sync_center_counts(frm), 4000);
            },
            error: function() {
                $this.prop("disabled", false).text(`Fetch ${label}`);
            }
        });
    });
}

function show_pl_comparison_dialog() {
    let d = new frappe.ui.Dialog({
        title: $(`
            <div style="display: flex; align-items: center; gap: 10px; font-weight: 700; color: #0f172a; font-size: 15px;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #0f172a; color: #f8fafc; display: inline-flex; align-items: center; justify-content: center;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                </div>
                <span>Profit & Loss Audit & Comparison</span>
            </div>
        `),
        size: "extra-large",
        fields: [
            { fieldname: "persistent_hero", fieldtype: "HTML" },
            { fieldname: "top_toolbar", fieldtype: "HTML" },
            { fieldname: "summary_cards", fieldtype: "HTML" },
            { fieldname: "table_container", fieldtype: "HTML" }
        ],
        primary_action_label: __("Close"),
        primary_action: function() { d.hide(); }
    });

    d.show();

    function render_persistent_hero() {
        let hero_html = `
            <div style="background: #0f172a; border-radius: 12px; padding: 18px 22px; color: #fff; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span style="background: rgba(255, 255, 255, 0.1); color: #94a3b8; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.6px;">Financial Audit</span>
                            <span style="font-size: 12px; color: #cbd5e1; font-weight: 500;">Fiscal Years 2022 – 2025</span>
                        </div>
                        <h4 style="margin: 0; color: #fff; font-size: 16px; font-weight: 700; letter-spacing: -0.2px;">QuickBooks vs ERPNext P&L Statement</h4>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Comparative reconciliation between QuickBooks Online reported revenue/expenses and ERPNext General Ledger.</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 500;">Cost Center: <strong style="color: #f8fafc;">QuickBooks - MTL</strong></div>
                    </div>
                </div>
            </div>
        `;
        d.get_field("persistent_hero").$wrapper.html(hero_html);
    }

    render_persistent_hero();

    let current_view = "all_years";
    let current_filter = "all";
    let search_query = "";
    let cached_data = null;

    function render_toolbar() {
        let toolbar_html = `
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                <div style="display: inline-flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 3px; gap: 3px;" id="qb-pl-view-pills">
                    <button type="button" data-view="all_years" style="cursor: pointer; border: none; font-size: 12px; font-weight: ${current_view === 'all_years' ? '600' : '500'}; padding: 6px 14px; border-radius: 7px; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s ease; ${current_view === 'all_years' ? 'background: #0f172a; color: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.1);' : 'background: transparent; color: #64748b;'}">
                        Overview (2022–2025)
                    </button>
                    ${["2022", "2023", "2024", "2025"].map(yr => `
                        <button type="button" data-view="${yr}" style="cursor: pointer; border: none; font-size: 12px; font-weight: ${current_view === yr ? '600' : '500'}; padding: 6px 14px; border-radius: 7px; transition: all 0.15s ease; ${current_view === yr ? 'background: #0f172a; color: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.1);' : 'background: transparent; color: #64748b;'}">
                            ${yr}
                        </button>
                    `).join("")}
                </div>

                <div style="display: flex; align-items: center; gap: 10px;">
                    ${current_view !== 'all_years' ? `
                        <div style="display: inline-flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 2px; gap: 2px;" id="qb-pl-filter-tabs">
                            <button type="button" data-filter="all" style="cursor: pointer; border: none; font-size: 11.5px; font-weight: ${current_filter === 'all' ? '600' : '500'}; padding: 5px 10px; border-radius: 6px; transition: all 0.15s ease; ${current_filter === 'all' ? 'background: #ffffff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.06);' : 'background: transparent; color: #64748b;'}">All Accounts</button>
                            <button type="button" data-filter="diff" style="cursor: pointer; border: none; font-size: 11.5px; font-weight: ${current_filter === 'diff' ? '600' : '500'}; padding: 5px 10px; border-radius: 6px; transition: all 0.15s ease; ${current_filter === 'diff' ? 'background: #ffffff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.06);' : 'background: transparent; color: #64748b;'}">Variances Only</button>
                            <button type="button" data-filter="match" style="cursor: pointer; border: none; font-size: 11.5px; font-weight: ${current_filter === 'match' ? '600' : '500'}; padding: 5px 10px; border-radius: 6px; transition: all 0.15s ease; ${current_filter === 'match' ? 'background: #ffffff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.06);' : 'background: transparent; color: #64748b;'}">Reconciled</button>
                        </div>

                        <div style="position: relative; width: 180px;">
                            <input type="text" id="qb-pl-search-input" placeholder="Search accounts..." value="${search_query}" style="width: 100%; padding: 5px 10px 5px 28px; font-size: 11.5px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; outline: none; color: #0f172a;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 9px; top: 8px; pointer-events: none;">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    ` : ''}

                    <button type="button" id="qb-pl-refresh-btn" title="Refresh Live Data" style="cursor: pointer; border: 1px solid #e2e8f0; background: #ffffff; border-radius: 8px; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; color: #475569; transition: all 0.15s ease;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        d.get_field("top_toolbar").$wrapper.html(toolbar_html);

        d.get_field("top_toolbar").$wrapper.find("#qb-pl-view-pills button").on("click", function() {
            current_view = $(this).attr("data-view");
            render_toolbar();
            fetch_and_render_data();
        });

        d.get_field("top_toolbar").$wrapper.find("#qb-pl-refresh-btn").on("click", function() {
            cached_data = null;
            fetch_and_render_data();
        });

        d.get_field("top_toolbar").$wrapper.find("#qb-pl-filter-tabs button").on("click", function() {
            current_filter = $(this).attr("data-filter");
            render_toolbar();
            render_table_view();
        });

        d.get_field("top_toolbar").$wrapper.find("#qb-pl-search-input").on("input", function() {
            search_query = $(this).val().toLowerCase().trim();
            render_table_view();
        });
    }

    function fetch_and_render_data() {
        d.get_field("summary_cards").$wrapper.html(`
            <div style="text-align: center; padding: 28px; color: #64748b; font-size: 13px;">
                <span class="spinner-border spinner-border-sm text-secondary" role="status" style="margin-right: 6px;"></span>
                Loading live Profit & Loss comparison data...
            </div>
        `);
        d.get_field("table_container").$wrapper.html("");

        let target_year = current_view === "all_years" ? "2024" : current_view;

        frappe.call({
            method: "quickbooks_integration.api.pl_comparator.get_pl_comparison",
            args: { year: target_year },
            callback: function(r) {
                if (!r.message) {
                    d.get_field("summary_cards").$wrapper.html(`<div style="color:#ef4444; text-align:center; padding: 15px;">Failed to load comparison data.</div>`);
                    return;
                }
                cached_data = r.message;
                render_summary_cards();
                render_table_view();
            }
        });
    }

    function render_summary_cards() {
        if (!cached_data) return;

        let inc_label = "Total Revenue";
        let cogs_label = "Cost of Sales (COGS)";
        let exp_label = "Operating Expenses";
        let net_label = "Net Profit / (Loss)";

        let erp_inc = 0, qbo_inc = 0, inc_diff = 0;
        let erp_cogs = 0, qbo_cogs = 0, cogs_diff = 0;
        let erp_exp = 0, qbo_exp = 0, exp_diff = 0;
        let erp_net = 0, qbo_net = 0, net_diff = 0;

        if (current_view === "all_years") {
            let ay = cached_data.all_years || [];
            erp_inc = ay.reduce((acc, y) => acc + (flt(y.erp_income) || 0), 0);
            qbo_inc = ay.reduce((acc, y) => acc + (flt(y.qbo_income) || 0), 0);
            erp_cogs = ay.reduce((acc, y) => acc + (flt(y.erp_cogs) || 0), 0);
            qbo_cogs = ay.reduce((acc, y) => acc + (flt(y.qbo_cogs) || 0), 0);
            erp_exp = ay.reduce((acc, y) => acc + (flt(y.erp_exp) || 0), 0);
            qbo_exp = ay.reduce((acc, y) => acc + (flt(y.qbo_exp) || 0), 0);
            erp_net = ay.reduce((acc, y) => acc + (flt(y.erp_net) || 0), 0);
            qbo_net = ay.reduce((acc, y) => acc + (flt(y.qbo_net) || 0), 0);
        } else {
            let sum = cached_data.summary || {};
            erp_inc = sum.erp_income || 0; qbo_inc = sum.qbo_income || 0;
            erp_cogs = sum.erp_cogs || 0; qbo_cogs = sum.qbo_cogs || 0;
            erp_exp = sum.erp_expenses || 0; qbo_exp = sum.qbo_expenses || 0;
            erp_net = sum.erp_net_profit || 0; qbo_net = sum.qbo_net_profit || 0;
        }

        inc_diff = round_num(erp_inc - qbo_inc);
        cogs_diff = round_num(erp_cogs - qbo_cogs);
        exp_diff = round_num(erp_exp - qbo_exp);
        net_diff = round_num(erp_net - qbo_net);

        function make_kpi_card(title, erp_val, qbo_val, diff_val, is_highlight = false) {
            let diff_color = Math.abs(diff_val) < 1.0 ? '#64748b' : (diff_val > 0 ? '#059669' : '#b45309');
            let diff_prefix = diff_val > 0 ? '+' : '';
            let diff_display = Math.abs(diff_val) < 1.0 ? '₦0.00' : `${diff_prefix}₦${format_currency(diff_val)}`;

            return `
                <div style="background: ${is_highlight ? '#f8fafc' : '#ffffff'}; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px;">
                        ${title}
                    </div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;">
                        ₦${format_currency(erp_val)}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 8px; font-size: 11px; color: #475569;">
                        <span>QBO: <strong>₦${format_currency(qbo_val)}</strong></span>
                        <span style="font-weight: 600; color: ${diff_color};">Var: ${diff_display}</span>
                    </div>
                </div>
            `;
        }

        let cards_html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px;">
                ${make_kpi_card(inc_label, erp_inc, qbo_inc, inc_diff)}
                ${make_kpi_card(cogs_label, erp_cogs, qbo_cogs, cogs_diff)}
                ${make_kpi_card(exp_label, erp_exp, qbo_exp, exp_diff)}
                ${make_kpi_card(net_label, erp_net, qbo_net, net_diff, true)}
            </div>
        `;
        d.get_field("summary_cards").$wrapper.html(cards_html);
    }

    function render_table_view() {
        if (!cached_data) return;

        if (current_view === "all_years") {
            let ay = cached_data.all_years || [];
            let my_rows = ay.map(y => {
                let diff_val = round_num(flt(y.erp_net) - flt(y.qbo_net));
                let diff_color = Math.abs(diff_val) < 1.0 ? '#64748b' : (diff_val > 0 ? '#059669' : '#b45309');
                let diff_display = Math.abs(diff_val) < 1.0 ? '₦0.00' : `${diff_val > 0 ? '+' : ''}₦${format_currency(diff_val)}`;
                let status_badge = Math.abs(diff_val) < 1.0
                    ? `<span style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">Reconciled</span>`
                    : `<span style="background: #fffbeb; color: #b45309; border: 1px solid #fef3c7; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">Timing Variance</span>`;

                return `
                    <tr class="qb-pl-year-row" data-year="${y.year}" style="border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.15s ease;" title="Click to view line items for ${y.year}">
                        <td style="padding: 12px 14px; font-weight: 700; color: #0f172a; font-size: 12.5px;">Fiscal Year ${y.year}</td>
                        <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #475569; font-size: 12px;">₦${format_currency(y.qbo_income)}</td>
                        <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #0f172a; font-weight: 600; font-size: 12px;">₦${format_currency(y.erp_income)}</td>
                        <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #475569; font-size: 12px;">₦${format_currency(y.qbo_cogs)}</td>
                        <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #0f172a; font-weight: 600; font-size: 12px;">₦${format_currency(y.erp_cogs)}</td>
                        <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #475569; font-size: 12px;">₦${format_currency(y.qbo_exp)}</td>
                        <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #0f172a; font-weight: 600; font-size: 12px;">₦${format_currency(y.erp_exp)}</td>
                        <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #475569; font-size: 12px;">₦${format_currency(y.qbo_net)}</td>
                        <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #0f172a; font-weight: 700; font-size: 12px;">₦${format_currency(y.erp_net)}</td>
                        <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: ${diff_color}; font-weight: 600; font-size: 12px;">${diff_display}</td>
                        <td style="padding: 12px 14px; text-align: center;">${status_badge}</td>
                    </tr>
                `;
            }).join("");

            let table_html = `
                <div style="border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; overflow: hidden;">
                    <div style="background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 11.5px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Multi-Year Statement Breakdown (2022 – 2025)</span>
                        <span style="font-size: 11px; color: #64748b;">Click any year row to view account level details</span>
                    </div>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                                <tr>
                                    <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase;">Period</th>
                                    <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">QBO Rev</th>
                                    <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">ERP Rev</th>
                                    <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">QBO COGS</th>
                                    <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">ERP COGS</th>
                                    <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">QBO OpEx</th>
                                    <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">ERP OpEx</th>
                                    <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">QBO Net</th>
                                    <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">ERP Net</th>
                                    <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">Variance</th>
                                    <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: center;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${my_rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            d.get_field("table_container").$wrapper.html(table_html);

            d.get_field("table_container").$wrapper.find(".qb-pl-year-row").on("click", function() {
                let yr = $(this).attr("data-year");
                if (yr) {
                    current_view = yr;
                    render_toolbar();
                    fetch_and_render_data();
                }
            });
            return;
        }

        // Year Detailed Categories View
        let sum = cached_data.summary || {};
        let top_cats = [
            { name: "Total Income (Revenue)", qbo: sum.qbo_income || 0, erp: sum.erp_income || 0 },
            { name: "Cost of Goods Sold (COGS)", qbo: sum.qbo_cogs || 0, erp: sum.erp_cogs || 0 },
            { name: "Gross Profit", qbo: (sum.qbo_income || 0) - (sum.qbo_cogs || 0), erp: (sum.erp_income || 0) - (sum.erp_cogs || 0) },
            { name: "Operating Expenses (OpEx)", qbo: sum.qbo_expenses || 0, erp: sum.erp_expenses || 0 },
            { name: "Depreciation & Other", qbo: sum.qbo_other_expenses || 0, erp: sum.erp_other_expenses || 0 },
            { name: "Net Profit / (Loss)", qbo: sum.qbo_net_profit || 0, erp: sum.erp_net_profit || 0, is_total: true }
        ];

        let cat_rows = top_cats.map(c => {
            let diff = round_num(c.erp - c.qbo);
            let diff_color = Math.abs(diff) < 1.0 ? '#64748b' : (diff > 0 ? '#059669' : '#b45309');
            let diff_str = Math.abs(diff) < 1.0 ? "₦0.00" : `${diff > 0 ? '+' : ''}₦${format_currency(diff)}`;
            let status_badge = Math.abs(diff) < 1.0
                ? `<span style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 2px 7px; border-radius: 6px; font-size: 11px; font-weight: 600;">Reconciled</span>`
                : `<span style="background: #fffbeb; color: #b45309; border: 1px solid #fef3c7; padding: 2px 7px; border-radius: 6px; font-size: 11px; font-weight: 600;">Variance</span>`;

            return `
                <tr style="border-bottom: 1px solid #e2e8f0; background: ${c.is_total ? '#f8fafc' : '#ffffff'}; font-weight: ${c.is_total ? '700' : '500'};">
                    <td style="padding: 11px 14px; font-size: 12px; color: #0f172a;">${c.name}</td>
                    <td style="padding: 11px 14px; text-align: right; font-size: 12px; font-family: monospace; color: #475569;">₦${format_currency(c.qbo)}</td>
                    <td style="padding: 11px 14px; text-align: right; font-size: 12px; font-family: monospace; color: #0f172a; font-weight: 600;">₦${format_currency(c.erp)}</td>
                    <td style="padding: 11px 14px; text-align: right; font-size: 12px; font-family: monospace; color: ${diff_color}; font-weight: 600;">${diff_str}</td>
                    <td style="padding: 11px 14px; text-align: center;">${status_badge}</td>
                </tr>
            `;
        }).join("");

        let table_html = `
            <div style="border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; overflow: hidden;">
                <div style="background: #f8fafc; padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 11.5px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                    Fiscal Year ${current_view} Statement Breakdown
                </div>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                        <tr>
                            <th style="padding: 9px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase;">Category Head</th>
                            <th style="padding: 9px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">QuickBooks Online</th>
                            <th style="padding: 9px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">ERPNext General Ledger</th>
                            <th style="padding: 9px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">Variance</th>
                            <th style="padding: 9px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cat_rows}
                    </tbody>
                </table>
            </div>
        `;
        d.get_field("table_container").$wrapper.html(table_html);
    }

    render_toolbar();
    fetch_and_render_data();
}

function show_bs_comparison_dialog() {
    let d = new frappe.ui.Dialog({
        title: $(`
            <div style="display: flex; align-items: center; gap: 10px; font-weight: 700; color: #0f172a; font-size: 15px;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #0f172a; color: #f8fafc; display: inline-flex; align-items: center; justify-content: center;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                </div>
                <span>Balance Sheet Audit & Reconciliation</span>
            </div>
        `),
        size: "extra-large",
        fields: [
            { fieldname: "persistent_hero", fieldtype: "HTML" },
            { fieldname: "top_toolbar", fieldtype: "HTML" },
            { fieldname: "summary_cards", fieldtype: "HTML" },
            { fieldname: "table_container", fieldtype: "HTML" }
        ],
        primary_action_label: __("Close"),
        primary_action: function() { d.hide(); }
    });

    d.show();

    function render_persistent_hero() {
        let hero_html = `
            <div style="background: #0f172a; border-radius: 12px; padding: 18px 22px; color: #fff; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span style="background: rgba(255, 255, 255, 0.1); color: #94a3b8; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.6px;">Balance Sheet Audit</span>
                            <span style="font-size: 12px; color: #cbd5e1; font-weight: 500;">Fiscal Years 2022 – 2025</span>
                        </div>
                        <h4 style="margin: 0; color: #fff; font-size: 16px; font-weight: 700; letter-spacing: -0.2px;">QuickBooks vs ERPNext Balance Sheet Statement</h4>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Direct comparison between QuickBooks Online cumulative accounts and ERPNext General Ledger balances.</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 500;">Cost Center: <strong style="color: #f8fafc;">QuickBooks - MTL</strong></div>
                    </div>
                </div>
            </div>
        `;
        d.get_field("persistent_hero").$wrapper.html(hero_html);
    }

    render_persistent_hero();

    let current_view = "all_years";
    let current_filter = "all";
    let search_query = "";
    let cached_data = null;

    function render_toolbar() {
        let toolbar_html = `
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                <div style="display: inline-flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 3px; gap: 3px;" id="qb-bs-view-pills">
                    <button type="button" data-view="all_years" style="cursor: pointer; border: none; font-size: 12px; font-weight: ${current_view === 'all_years' ? '600' : '500'}; padding: 6px 14px; border-radius: 7px; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s ease; ${current_view === 'all_years' ? 'background: #0f172a; color: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.1);' : 'background: transparent; color: #64748b;'}">
                        Overview (2022–2025)
                    </button>
                    ${["2022", "2023", "2024", "2025"].map(yr => `
                        <button type="button" data-view="${yr}" style="cursor: pointer; border: none; font-size: 12px; font-weight: ${current_view === yr ? '600' : '500'}; padding: 6px 14px; border-radius: 7px; transition: all 0.15s ease; ${current_view === yr ? 'background: #0f172a; color: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.1);' : 'background: transparent; color: #64748b;'}">
                            ${yr}
                        </button>
                    `).join("")}
                </div>

                <div style="display: flex; align-items: center; gap: 10px;">
                    ${current_view !== 'all_years' ? `
                        <div style="display: inline-flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 2px; gap: 2px;" id="qb-bs-filter-tabs">
                            <button type="button" data-filter="all" style="cursor: pointer; border: none; font-size: 11.5px; font-weight: ${current_filter === 'all' ? '600' : '500'}; padding: 5px 10px; border-radius: 6px; transition: all 0.15s ease; ${current_filter === 'all' ? 'background: #ffffff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.06);' : 'background: transparent; color: #64748b;'}">All Items</button>
                            <button type="button" data-filter="diff" style="cursor: pointer; border: none; font-size: 11.5px; font-weight: ${current_filter === 'diff' ? '600' : '500'}; padding: 5px 10px; border-radius: 6px; transition: all 0.15s ease; ${current_filter === 'diff' ? 'background: #ffffff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.06);' : 'background: transparent; color: #64748b;'}">Variances Only</button>
                            <button type="button" data-filter="match" style="cursor: pointer; border: none; font-size: 11.5px; font-weight: ${current_filter === 'match' ? '600' : '500'}; padding: 5px 10px; border-radius: 6px; transition: all 0.15s ease; ${current_filter === 'match' ? 'background: #ffffff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.06);' : 'background: transparent; color: #64748b;'}">Reconciled</button>
                        </div>

                        <div style="position: relative; width: 180px;">
                            <input type="text" id="qb-bs-search-input" placeholder="Search accounts..." value="${search_query}" style="width: 100%; padding: 5px 10px 5px 28px; font-size: 11.5px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; outline: none; color: #0f172a;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 9px; top: 8px; pointer-events: none;">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    ` : ''}

                    <button type="button" id="qb-bs-refresh-btn" title="Refresh Live Data" style="cursor: pointer; border: 1px solid #e2e8f0; background: #ffffff; border-radius: 8px; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; color: #475569; transition: all 0.15s ease;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        d.get_field("top_toolbar").$wrapper.html(toolbar_html);

        d.get_field("top_toolbar").$wrapper.find("#qb-bs-view-pills button").on("click", function() {
            current_view = $(this).attr("data-view");
            render_toolbar();
            fetch_and_render_data();
        });

        d.get_field("top_toolbar").$wrapper.find("#qb-bs-refresh-btn").on("click", function() {
            cached_data = null;
            fetch_and_render_data();
        });

        d.get_field("top_toolbar").$wrapper.find("#qb-bs-filter-tabs button").on("click", function() {
            current_filter = $(this).attr("data-filter");
            render_toolbar();
            render_table_view();
        });

        d.get_field("top_toolbar").$wrapper.find("#qb-bs-search-input").on("input", function() {
            search_query = $(this).val().toLowerCase().trim();
            render_table_view();
        });
    }

    function fetch_and_render_data() {
        d.get_field("summary_cards").$wrapper.html(`
            <div style="text-align: center; padding: 28px; color: #64748b; font-size: 13px;">
                <span class="spinner-border spinner-border-sm text-secondary" role="status" style="margin-right: 6px;"></span>
                Loading live Balance Sheet comparison data...
            </div>
        `);
        d.get_field("table_container").$wrapper.empty();

        let req_year = current_view === "all_years" ? "2025" : current_view;

        frappe.call({
            method: "quickbooks_integration.api.bs_comparator.get_bs_comparison",
            args: { year: req_year },
            callback: function(r) {
                if (r.message) {
                    cached_data = r.message;
                    render_summary_cards();
                    render_table_view();
                } else {
                    d.get_field("summary_cards").$wrapper.html(`
                        <div style="color: #ef4444; padding: 15px; text-align: center; font-size: 13px;">
                            Failed to load Balance Sheet comparison data. Please check connection.
                        </div>
                    `);
                }
            }
        });
    }

    function render_summary_cards() {
        if (!cached_data) return;

        let s = cached_data.summary || {};

        function make_bs_card(title, erp_val, qbo_val, diff_val, is_highlight = false) {
            let diff_color = Math.abs(diff_val) < 1.0 ? '#64748b' : (diff_val > 0 ? '#059669' : '#b45309');
            let diff_prefix = diff_val > 0 ? '+' : '';
            let diff_display = Math.abs(diff_val) < 1.0 ? '₦0.00' : `${diff_prefix}₦${format_currency(diff_val)}`;

            return `
                <div style="background: ${is_highlight ? '#f8fafc' : '#ffffff'}; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px;">
                        ${title}
                    </div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;">
                        ₦${format_currency(erp_val)}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 8px; font-size: 11px; color: #475569;">
                        <span>QBO: <strong>₦${format_currency(qbo_val)}</strong></span>
                        <span style="font-weight: 600; color: ${diff_color};">Var: ${diff_display}</span>
                    </div>
                </div>
            `;
        }

        let cards_html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px;">
                ${make_bs_card("Total Assets", s.erp_assets, s.qbo_assets, s.assets_diff)}
                ${make_bs_card("Total Liabilities", s.erp_liabilities, s.qbo_liabilities, s.liabilities_diff)}
                ${make_bs_card("Shareholders' Equity", s.erp_equity, s.qbo_equity, s.equity_diff)}
                ${make_bs_card("Total Liab & Equity", s.erp_total_liab_equity, s.qbo_total_liab_equity, s.tle_diff, true)}
            </div>
        `;
        d.get_field("summary_cards").$wrapper.html(cards_html);
    }

    function render_table_view() {
        if (!cached_data) return;

        if (current_view === "all_years") {
            render_all_years_table();
        } else {
            render_detail_table();
        }
    }

    function render_all_years_table() {
        let years = cached_data.all_years || [];

        let rows_html = years.map(y => {
            let ast_diff = round_num(y.erp_assets - y.qbo_assets);
            let lib_diff = round_num(y.erp_liab - y.qbo_liab);
            let eq_diff = round_num(y.erp_equity - y.qbo_equity);

            let status_badge = (Math.abs(ast_diff) < 1.0 && Math.abs(lib_diff) < 1.0)
                ? `<span style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 6px;">Reconciled</span>`
                : `<span style="background: #fffbeb; color: #b45309; border: 1px solid #fef3c7; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 6px;">Timing Variance</span>`;

            return `
                <tr class="qb-bs-year-row" data-year="${y.year}" style="border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.15s ease;" title="Click to view itemized audit for ${y.year}">
                    <td style="padding: 12px 14px; font-weight: 700; color: #0f172a; font-size: 12.5px;">Fiscal Year ${y.year}</td>
                    <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #475569; font-size: 12px;">₦${format_currency(y.qbo_assets)}</td>
                    <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #0f172a; font-weight: 600; font-size: 12px;">₦${format_currency(y.erp_assets)}</td>
                    <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: ${Math.abs(ast_diff) < 1 ? '#64748b' : '#b45309'}; font-size: 12px;">${Math.abs(ast_diff) < 1 ? '₦0.00' : `${ast_diff > 0 ? '+' : ''}₦${format_currency(ast_diff)}`}</td>
                    <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #475569; font-size: 12px;">₦${format_currency(y.qbo_liab)}</td>
                    <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #0f172a; font-weight: 600; font-size: 12px;">₦${format_currency(y.erp_liab)}</td>
                    <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #475569; font-size: 12px;">₦${format_currency(y.qbo_equity)}</td>
                    <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #0f172a; font-weight: 600; font-size: 12px;">₦${format_currency(y.erp_equity)}</td>
                    <td style="padding: 12px 14px; text-align: center;">${status_badge}</td>
                </tr>
            `;
        }).join("");

        let table_html = `
            <div style="border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; overflow: hidden;">
                <div style="background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 11.5px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Multi-Year Balance Sheet Summary (2022 – 2025)</span>
                    <span style="font-size: 11px; color: #64748b;">Click any year row to view account level details</span>
                </div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                            <tr>
                                <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase;">Year</th>
                                <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">QBO Assets</th>
                                <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">ERP Assets</th>
                                <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">Asset Variance</th>
                                <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">QBO Liab</th>
                                <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">ERP Liab</th>
                                <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">QBO Equity</th>
                                <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">ERP Equity</th>
                                <th style="padding: 10px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: center;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows_html}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        d.get_field("table_container").$wrapper.html(table_html);

        d.get_field("table_container").$wrapper.find(".qb-bs-year-row").on("click", function() {
            let yr = $(this).attr("data-year");
            if (yr) {
                current_view = yr;
                render_toolbar();
                fetch_and_render_data();
            }
        });
    }

    function render_detail_table() {
        let details = cached_data.detail_rows || [];

        let filtered = details.filter(r => {
            if (current_filter === "diff" && r.status === "MATCH") return false;
            if (current_filter === "match" && r.status !== "MATCH") return false;
            if (search_query) {
                let text = (r.qbo_item + " " + r.erp_account + " " + r.category).toLowerCase();
                if (!text.includes(search_query)) return false;
            }
            return true;
        });

        let rows_html = filtered.map(r => {
            let is_match = r.status === "MATCH";
            let badge = is_match
                ? `<span style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 6px;">Reconciled</span>`
                : `<span style="background: #fffbeb; color: #b45309; border: 1px solid #fef3c7; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 6px;">Timing Variance</span>`;

            let diff_str = Math.abs(r.difference) < 1 ? "₦0.00" : `${r.difference > 0 ? '+' : ''}₦${format_currency(r.difference)}`;
            let diff_color = Math.abs(r.difference) < 1 ? '#64748b' : (r.difference > 0 ? '#059669' : '#b45309');

            return `
                <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
                    <td style="padding: 10px 14px; font-weight: 600; color: #64748b; font-size: 11px;">${r.category}</td>
                    <td style="padding: 10px 14px; font-weight: 700; color: #0f172a;">${r.qbo_item}</td>
                    <td style="padding: 10px 14px; color: #475569; font-size: 11.5px;">${r.erp_account}</td>
                    <td style="padding: 10px 14px; text-align: right; font-family: monospace; color: #475569;">₦${format_currency(r.qbo_amount)}</td>
                    <td style="padding: 10px 14px; text-align: right; font-family: monospace; color: #0f172a; font-weight: 600;">₦${format_currency(r.erp_amount)}</td>
                    <td style="padding: 10px 14px; text-align: right; font-family: monospace; color: ${diff_color}; font-weight: 600;">${diff_str}</td>
                    <td style="padding: 10px 14px; text-align: center;">${badge}</td>
                </tr>
            `;
        }).join("");

        let table_html = `
            <div style="border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; overflow: hidden;">
                <div style="background: #f8fafc; padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center;">
                    <span>Fiscal Year ${current_view} Itemized Line Audit</span>
                    <span style="font-size: 11px; color: #64748b; font-weight: 500; text-transform: none;">Showing ${filtered.length} of ${details.length} items</span>
                </div>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                        <tr>
                            <th style="padding: 8px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase;">Category</th>
                            <th style="padding: 8px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase;">QuickBooks Line Item</th>
                            <th style="padding: 8px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase;">ERPNext Account Head</th>
                            <th style="padding: 8px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">QuickBooks</th>
                            <th style="padding: 8px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">ERPNext</th>
                            <th style="padding: 8px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">Variance</th>
                            <th style="padding: 8px 14px; font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows_html}
                    </tbody>
                </table>
            </div>
        `;

        d.get_field("table_container").$wrapper.html(table_html);
    }

    render_toolbar();
    fetch_and_render_data();
}

function round_num(v) {
    return Math.round((flt(v) || 0) * 100.0) / 100.0;
}

function format_currency(v) {
    return (flt(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}




