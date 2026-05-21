# Progression Vertical Operations System

This document is the introduction/context file for using Claude AI to help build the Progression Vertical Climbing Gym operations system from scratch.

Claude should read this first before writing any code.

## Project Goal

Build a beginner-friendly operations system for **Progression Vertical Climbing Gym**.

The system has two connected web apps:

1. **Gear Inspection Web App**
2. **Gear Check-Out & Return System**

Both apps share the same Google Sheets database and use the same Google Apps Script backend/API.

The system must be:

- Easy for beginner coders to understand and edit later
- Fast for staff to use during daily operations
- Mobile-friendly
- Practical for hybrid gym staff roles
- Simple enough to host on GitHub Pages
- Professional enough for real gym operations

## Gym Context

Progression Vertical staff work in hybrid roles.

Wall staff may also work at the front desk, and front desk staff may also support wall or gym-floor tasks.

The system should therefore be simple, clear, and usable with only a few minutes of staff training.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Hosting: GitHub Pages
- Database: Google Sheets
- Backend/API/automation: Google Apps Script
- Weekly report notification: Slack Incoming Webhook
- No complex backend server

## Important Build Rules

- Build one feature at a time.
- Do not build the whole system in one large code response.
- Do not rewrite unrelated files.
- Keep code beginner-friendly and clearly commented.
- Tell me exactly which files changed.
- Tell me exactly how to test each change.
- Frontend files go in GitHub/GitHub Pages.
- Apps Script should only contain backend `.gs` files.
- Gear lists must come from Google Sheets, not hard-coded frontend data.
- Course gear templates must come from Google Sheets, not hard-coded frontend data.
- Outdoor rental item prices must come from Google Sheets, not hard-coded frontend data.

## Feature Planning Template

Before coding any feature, use this template:

```text
# Feature: [name]

## Goal
What should this do?

## User
Who uses it?

## Inputs
What information does it need?

## Output
What should it produce?

## Data Used
Which Google Sheets tabs does it read or write?

## Depends On
Which features, files, or tabs must exist before this one?

## Files
Which frontend files and which .gs files will be created or changed?

## Rules
What logic must it follow?

## Steps
1.
2.
3.

## Edge Cases
What unusual situations should it handle?

## Success Test
How do I know it works?
```

## High-Level System Flow

```text
Staff use GitHub Pages web apps
        ↓
Web apps call Google Apps Script API
        ↓
Apps Script reads/writes Google Sheets
        ↓
Google Sheets acts as the shared database
        ↓
Apps Script builds weekly report
        ↓
Slack receives Friday operations summary
```

## Main System Layers

### 1. Staff Web Apps

The staff-facing apps are hosted on GitHub Pages.

They include:

- Home page / app launcher
- Gear Inspection app
- Gear Check-Out & Return app
- Print-friendly Outdoor Rental Agreement page

### 2. Apps Script Backend

Google Apps Script handles:

- API requests from the frontend
- Reading Google Sheets
- Writing Google Sheets
- Creating IDs
- Calculating dashboards
- Building weekly reports
- Sending Slack messages
- Installing scheduled triggers

### 3. Google Sheets Database

Google Sheets is the source of truth.

It stores:

- Gear master data
- Course master data
- Course gear templates
- Outdoor rental item prices
- Inspection logs
- Retired gear logs
- Checkout logs
- Return logs
- Weekly report logs

### 4. Slack Weekly Reporting

Every Friday, Apps Script sends a weekly summary to Slack channel:

```text
#team-ops-vert
```

The report should also be saved in the Google Sheet.

## Recommended Repo Structure

```text
progression-vertical-ops/
  index.html
  README.md

  shared/
    config.js
    api.js
    styles.css

  gear-inspection/
    index.html
    inspection.css
    inspection.js

  gear-checkout-return/
    index.html
    checkout-return.css
    checkout-return.js

  print/
    rental-agreement.html
    rental-agreement.css
    rental-agreement.js

  apps-script/
    Setup.gs
    Code.gs
    Sheets.gs
    Api.gs
    Reports.gs
    Slack.gs

  docs/
    google-sheets-setup.md
    apps-script-api-setup.md
    gear-inspection-setup.md
    checkout-return-setup.md
    outdoor-rental-setup.md
    slack-setup.md
    github-pages-setup.md
```

## Apps Script File Responsibilities

### Setup.gs

Creates:

- Missing Google Sheet tabs
- Header rows
- Starter sample data
- Optional Friday report trigger

### Code.gs

Handles:

- `doGet`
- `doPost`
- JSON responses
- API action routing
- Simple backend test functions

### Sheets.gs

Contains shared helpers for:

- Reading rows as objects
- Appending rows
- Updating rows
- Creating IDs
- Formatting dates
- Checking active rows

### Api.gs

Contains app-specific API functions:

- Load gear by category
- Load courses
- Load course gear templates
- Load outdoor rental items
- Submit inspections
- Submit checkouts
- Submit outdoor rental checkouts
- Load pending returns
- Submit returns
- Load dashboards

### Reports.gs

Builds the weekly report:

- Course gear usage
- Outdoor rental usage
- Return status summary
- Inspection status summary
- Retired gear report
- Attention-needed list

### Slack.gs

Handles:

- Slack Incoming Webhook setup
- Sending Slack messages
- Testing Slack messages

## Google Sheets Database

Use one Google Sheet named:

```text
Progression Vertical Gear Operations Database
```

## Database Tabs

### GEAR_MASTER

Purpose:
Shared gear catalog used by the inspection app and future individual gear tracking.

Columns:

```text
gear_type_id
gear_name
category
expected_qty
active
future_individual_id_ready_notes
```

Categories:

```text
FIT
Gym
Caving
Outdoor Rental
Route Setting
```

Important:
Version 1 does not use individual gear IDs. The `gear_type_id` should remain stable so individual item IDs can be added later.

### COURSE_MASTER

Purpose:
Course list for course gear check-out.

Columns:

```text
course_id
course_name
active
```

### COURSE_GEAR_TEMPLATE

Purpose:
Default suggested gear needed for each course.

Columns:

```text
course_id
course_name
gear_type_id
gear_name
suggested_qty
active
```

### OUTDOOR_RENTAL_MASTER

Purpose:
Outdoor rental item list and pricing.

Rental prices must come from this sheet, not from hard-coded frontend data.

Columns:

```text
rental_item_id
gear_type_id
item_name
size_required
daily_rate
active
notes
```

Starter items:

```text
Helmet | size_required TRUE | 100
Harness | size_required TRUE | 100
Shoes | size_required TRUE | 100
Rope (60 M) | size_required FALSE | 300
Chalk Bag and Chalk | size_required FALSE | 50
ATC and Locking Carabiner | size_required FALSE | 150
Gri Gri and Locking Carabiner | size_required FALSE | 400
Small Locking Carabiner | size_required FALSE | 50
Large Locking Carabiner | size_required FALSE | 50
Quickdraw Set (15 Draws) | size_required FALSE | 200
60 cm Nylon Runner | size_required FALSE | 50
100 cm Nylon Runner | size_required FALSE | 50
Crazy Horse Guidebook | size_required FALSE | 100
```

Size rule:
Size-required rental items should use Size + Qty breakdown rows in the web app. Do not use one total quantity box plus one free-text size box for these items.

Example:

```text
Helmet
S: 2
M: 3

Calculated taken_qty = 5
size_breakdown = S:2, M:3
```

### INSPECTION_LOG

Purpose:
Stores submitted daily inspections.

Columns:

```text
submission_id
date
inspector
category
gear_type_id
gear_name
expected_qty
actual_qty
good_qty
monitor_qty
retired_qty
missing_qty
notes
created_at
```

### RETIRED_GEAR_LOG

Purpose:
Stores extra details when inspected gear is retired.

Columns:

```text
retired_id
inspection_submission_id
date
inspector
category
gear_type_id
gear_name
retired_qty
damage_detail
photo_url
moved_to_retired_box
action_needed
created_at
```

Version 1 note:
No photo upload or photo link is required in the app. `photo_url` can stay blank.

### CHECKOUT_LOG

Purpose:
Stores both course gear check-outs and outdoor rental check-outs.

Columns:

```text
checkout_id
checkout_type
date
guide_name
course_id
course_name
course_time
gear_type_id
gear_name
suggested_qty
taken_qty
size_breakdown
notes
status
created_at
```

Outdoor rental extra columns:

```text
customer_name
customer_email
customer_phone
checkout_staff_name
planned_return_date
planned_return_time
deposit_type
deposit_amount
deposit_note
rental_days
discount_type
discount_amount
subtotal_amount
total_amount
policy_acceptance_required
agreement_printed
customer_signature_collected
```

Important:

- Course checkout rows use `checkout_type = Course`.
- Outdoor rental rows use `checkout_type = Outdoor Rental`.
- All rows for the same checkout share the same `checkout_id`.
- Status starts as `Pending Return`.
- For course checkouts, `course_time` is a session dropdown value, not a clock time.

Allowed `course_time` values:

```text
Full-Day
AM-Half-Day
PM-Half-Day
```

### RETURN_LOG

Purpose:
Stores course gear returns and outdoor rental returns.

Columns:

```text
return_id
checkout_id
date_returned
guide_name
course_id
course_name
gear_type_id
gear_name
taken_qty
returned_qty
same_amount
issue_detail
damage_photo_url
return_status
created_at
```

Outdoor rental extra columns:

```text
return_staff_name
planned_return_date
actual_return_date
actual_return_time
late_return
extra_day_charge
dirty_condition_charge
damage_or_loss_charge
deposit_returned
deposit_return_note
final_amount_due
return_note
```

Version 1 note:
No damage photo is required in the app. `damage_photo_url` can stay blank.

### WEEKLY_REPORT_LOG

Purpose:
Stores a copy of each weekly Slack report.

Columns:

```text
report_id
week_start
week_end
report_text
slack_sent
sent_at
```

## Web App 1: Gear Inspection

Purpose:
Daily gear inspection by category.

Inspection is submitted per category.

Categories:

```text
FIT
Gym
Caving
Outdoor Rental
Route Setting
```

Workflow:

```text
Category → Gear list → Quantity check → Quality check → Retired gear report → Submit
```

Fields:

```text
Date
Inspector
Category
Gear list from Google Sheets
Expected Qty
Actual Qty
Good Qty
Monitor Qty
Retired Qty
Missing Qty
Notes
```

Validation:

```text
Actual Qty = Good Qty + Monitor Qty + Retired Qty
Missing Qty = Expected Qty - Actual Qty
```

If the numbers do not match, show a clear warning and block submission.

Retired gear logic:
If `Retired Qty > 0`, show:

```text
Damage detail
Confirm moved to retired box: Yes / No
Action needed / extra note
```

No photo field is needed in version 1.

Dashboard statuses:

```text
Pending
Completed
Completed with issue
Completed with retired gear
```

## Web App 2: Gear Check-Out & Return System

Title:

```text
Gear Check-Out & Return System
```

Thai display name:

```text
ระบบเบิก-คืนอุปกรณ์
```

Main page options:

```text
1. Start Gear Check-Out
2. Outdoor Rental Check-Out
3. Pending Gear Return Tasks
```

## Course Gear Check-Out

Purpose:
Track gear leaving the gear room for courses and confirm gear return after the course.

Fields:

```text
Date
Guide / staff name
Course name
Course session
Needed gear list
Quantity taken
Notes
```

Rules:

- Course list comes from `COURSE_MASTER`.
- Needed gear list comes from `COURSE_GEAR_TEMPLATE`.
- FIT-related gear checkouts may include three activity groups:
  - FIT Course
  - Scouting
  - Instructor Training
- FIT course names should be collected from Progression Vertical website course information and confirmed internally before entering final sheet rows.
- Indoor caving courses should be excluded from Course Gear Check-Out because the gear is used at the gym and should only need quantity/quality inspection for now.
- For now, add course names to `COURSE_MASTER` first and skip `COURSE_GEAR_TEMPLATE` until gear type and suggested quantity are confirmed later.
- If the course list becomes long, consider adding an activity group filter before the course dropdown.
- Course session is selected from a dropdown: `Full-Day`, `AM-Half-Day`, `PM-Half-Day`.
- Do not use a clock input for course time in version 1.
- Submitting creates rows in `CHECKOUT_LOG`.
- Status starts as `Pending Return`.
- All rows in one checkout share the same `checkout_id`.

## Outdoor Rental Check-Out

Purpose:
Record outdoor rental gear, customer details, deposit details, and print a completed rental agreement/disclaimer for customer signature.

Fields:

```text
Customer name
Customer email
Customer phone
Checkout date
Planned return date
Planned return time
Rental item list
Quantity
Size breakdown for size-required items
Equipment number if available
Deposit type
Deposit amount
Deposit note
Checkout staff name
Rental days
Discount type
Discount amount
Subtotal
Total
Agreement printed
Customer signature collected
```

Deposit type options:

```text
Cash - 10,000 THB
Passport
Other
```

Privacy rule:
Do not require full passport number in version 1. If passport is used as deposit, store only that passport was held, plus optional note.

Rules:

- Rental item list and prices come from `OUTDOOR_RENTAL_MASTER`.
- Deposit is required.
- Checkout staff name is required.
- Customer details are required.
- At least one rental item is required.
- App calculates subtotal, discount, and total.
- Helmet, Harness, and Shoes require size breakdown rows.
- For size-required items, total quantity is calculated from Size + Qty rows.
- Save calculated total quantity to `taken_qty`.
- Save size details to `size_breakdown`.
- Submission writes to `CHECKOUT_LOG`.
- Status starts as `Pending Return`.
- App generates a print-friendly rental agreement with filled details.
- Staff confirms whether customer signature was collected.

## Printable Outdoor Rental Agreement

The printed document must include both:

1. Filled-out rental details
2. Agreement/disclaimer text for customer signature

Implementation notes:

- Print files live in `print/`.
- Main files:
  - `print/rental-agreement.html`
  - `print/rental-agreement.css`
  - `print/rental-agreement.js`
- The print page loads checkout data by `checkout_id` from the URL query parameter, for example:

```text
print/rental-agreement.html?id=CHK-001
```

- Apps Script includes a `loadCheckoutById` API action and a matching route.
- Outdoor rental success screen should show a `Print Rental Agreement` button.
- The frontend should keep the most recent rental checkout ID so the print button opens the correct agreement.
- Date formatting must handle Google Sheets ISO timestamps, such as `2026-05-14T17:00:00.000Z`, and display the local Thailand date, for example `15 May 2026`.
- Print CSS should be optimized for A4.
- Screen-only buttons should be hidden in `@media print`.
- Customer Details and Rental Period should be grouped in a side-by-side two-column row.
- Deposit should appear in the left column and Pricing in the right column.
- The agreement should be compact enough to fit all 13 rental items, terms, and signatures on a single A4 page.
- Current compact print styling uses smaller print text, tight spacing, compact tables, and compact signature lines.

Printed document sections:

```text
Progression Vertical Climbing Gym
Equipment Rental Agreement

Check-Out Date
Planned Return Date
Customer Name
Email
Telephone Number
Deposit Type
Deposit Amount / Deposit Note
Checkout Staff Name
Rental Days
Discount
Subtotal
Total Price
```

Rental item table:

```text
Item Description
Size / Size Breakdown
Equipment #
Quantity
Daily Rate
Total Cost
```

Agreement/disclaimer should include:

- Customer understands rock climbing has inherent risks.
- Customer confirms they are skilled and knowledgeable in the use and limitations of the rented equipment.
- Customer accepts full responsibility for their actions while using the equipment.
- Customer will not hold Progression Vertical Climbing Gym liable for accidents, injuries, or damages while using the rented equipment.
- Customer confirms they inspected the rented equipment before taking it.
- Customer accepts responsibility for damaged, lost, or stolen equipment.
- Damaged, lost, or stolen equipment may be charged at current replacement price.
- Equipment must be returned by the agreed return date and time.
- Late returns may be charged as an additional rental day.
- Dirty equipment or equipment requiring serious maintenance may be charged an additional cleaning/maintenance fee.
- Customer confirms they are at least 18 years old.

Signature section:

```text
Customer Name: _______________________________

Customer Signature: __________________________

Date: ___________________

Staff Name: _________________________________
```

## Gear Return

Purpose:
Complete pending course gear returns and outdoor rental returns.

Dashboard shows unfinished tasks from `CHECKOUT_LOG`.

Statuses:

```text
Pending Return
Completed
Completed with Issue
Overdue
```

Return fields:

```text
Gear name
Quantity taken
Returned quantity
Same amount? Yes / No
Issue detail
Notes
```

Outdoor rental return extra fields:

```text
Return staff name
Actual return date
Actual return time
Late return
Extra day charge
Dirty condition charge
Damage or loss charge
Deposit returned
Deposit return note
Final amount due
Return note
```

Rules:

- If all returned quantities match taken quantities, mark `Completed`.
- If anything is missing, damaged, dirty, late, or charged, mark `Completed with Issue`.
- If task is still open after checkout date/planned return date, mark `Overdue`.

## Weekly Slack Report

Send automatically every Friday to:

```text
#team-ops-vert
```

Use Slack Incoming Webhook.

Report should include:

### 1. Course Gear Usage

- Course name
- Number of sessions that week
- Main gear used
- Total quantity taken

### 2. Outdoor Rental Usage

- Number of outdoor rental checkouts
- Main rental items
- Total rental value
- Pending/overdue rental returns

### 3. Gear Check-Out / Return Summary

- Completed count
- Completed with Issue count
- Pending Return count
- Overdue count

### 4. Gear Inspection Summary

- Category
- Completed days
- Missing days
- Categories with issue

### 5. Retired Gear Report

- Category
- Gear name
- Retired quantity
- Damage detail
- Whether moved to retired box

### 6. Attention Needed

Short list of items needing staff or manager review.

Examples:

```text
- Please review 1 missing helmet from Top Rope Safety Course.
- Outdoor rental CHK-123 is overdue.
- 1 harness retired and needs manager review.
```

## UI Requirements

Design should be:

- Mobile-first
- Simple
- Fast for staff to use during work
- Clean and not too fancy
- Large buttons
- Clear section titles
- Easy dropdowns
- Friendly but professional

Colors:

```text
Background: light neutral
Buttons: strong but calm color
Warning: orange
Danger/retired: red
Success/completed: green
```

Staff should not need more than a few minutes of training.

## Form Styling Rules

Use shared form classes so fields look consistent across the app.

Recommended classes:

```text
form-section
form-grid
form-field
form-control
```

Apply the same `.form-control` style to:

```text
input[type="text"]
input[type="email"]
input[type="tel"]
input[type="number"]
input[type="date"]
select
textarea
```

Rules:

- All fields should be full width inside their parent container.
- Inputs and selects should share the same height, border, border radius, padding, font size, and focus style.
- Mobile layout should be one column.
- Desktop may use two columns for natural pairs, such as date pairs or discount type/value.
- Even in two-column layout, each field should fill its column width.
- Do not style individual fields by ID, such as `#email`, `#phone`, or `#depositAmount`, unless there is a truly unique reason.
- Prefer reusable design-system classes over one-off CSS.

## Recommended Build Order

1. Confirm Google Sheets database tabs and headers.
2. Build `Setup.gs`.
3. Build Apps Script API foundation.
4. Deploy Apps Script Web App.
5. Build shared frontend files.
6. Build Gear Inspection app.
7. Test Gear Inspection app.
8. Build Course Gear Check-Out.
9. Build Outdoor Rental Check-Out.
10. Build Printable Rental Agreement.
11. Collect FIT Course, outdoor caving, Scouting, and Instructor Training course names.
12. Convert course names into COURSE_MASTER rows only.
13. Later, return to COURSE_GEAR_TEMPLATE and decide whether Course Gear Check-Out needs an activity group filter.
14. Build Pending Return dashboard.
15. Build Gear Return workflow.
16. Build Outdoor Rental Return extras.
17. Build Weekly Slack Report.
18. Deploy frontend to GitHub Pages.
19. Test on mobile with staff-style scenarios.
20. Write staff instructions.

## Claude Prompting Pattern

Use this pattern for every feature:

```text
Here is the feature spec.

Please review it first.
If anything is unclear or risky, ask questions before coding.
Then implement only this feature.
Do not rewrite unrelated files.
Keep the code beginner-friendly.
Tell me exactly which files changed.
Tell me exactly how to test it.
```

## Success Criteria For The Whole System

The system works when:

- Staff can inspect all 5 categories daily.
- Gear inspection data saves to Google Sheets.
- Retired gear is logged clearly.
- Staff can check out course gear.
- Staff can return course gear.
- Staff can process outdoor rentals.
- Outdoor rental agreement prints with filled details and disclaimer.
- Customer can sign the printed agreement.
- Staff can record deposit and return details.
- Pending and overdue returns are visible.
- Weekly Slack report sends automatically.
- The frontend runs from GitHub Pages.
- The backend runs from Apps Script.
- The database remains Google Sheets.
- A beginner can understand the folder/file structure.
