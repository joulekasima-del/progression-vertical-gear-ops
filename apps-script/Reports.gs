/*
 * Reports.gs
 * Builds the weekly operations report.
 *
 * Report sections:
 *   1. Course gear usage (sessions, gear, quantities)
 *   2. Outdoor rental usage (checkouts, items, revenue, overdue)
 *   3. Gear check-out/return summary (completed, issues, pending, overdue)
 *   4. Gear inspection summary (completed days, missing days, issues)
 *   5. Retired gear report (category, item, qty, damage, retired box status)
 *   6. Attention needed list (items needing staff/manager review)
 *
 * The report text is:
 *   - Sent to Slack via Slack.gs
 *   - Saved to WEEKLY_REPORT_LOG tab
 *
 * Triggered every Friday by a time-based trigger (set up in Setup.gs).
 */

// Report builder functions will be built here
