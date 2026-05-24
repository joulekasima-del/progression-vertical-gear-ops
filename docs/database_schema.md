# Progression Vertical Database Schema

Source of truth: Google Sheet named `Progression Vertical Gear Operations Database`.

Do not rename sheet tabs or row-1 column headers after the apps are connected.

## Master Data Tabs

### GEAR_MASTER

Used by Gear Inspection and future individual gear tracking.

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

### COURSE_MASTER

Used by Course Gear Check-Out.

```text
course_id
course_name
program_purpose
activity_type
active
```

Notes:

- `program_purpose` options are `FIT Course`, `Adventure / Private Guiding`, `Scouting`, and `Instructor Training`.
- `activity_type` options are `Climbing`, `Caving`, and `Climbing + Caving`.
- Indoor caving courses are excluded from Course Gear Check-Out for now because their gear is used at the gym and handled through inspection.
- COURSE_GEAR_TEMPLATE rows will be completed later when gear types and suggested quantities are confirmed.

### COURSE_GEAR_TEMPLATE

Future course gear templates.

```text
course_id
course_name
gear_type_id
gear_name
suggested_qty
active
```

### GEAR_REGISTER

Combined read-only gear register for future template and inspection planning.

```text
category
item_type
item_description
brand_model
size
qty
counted
purchase_date
location
condition
notes
last_inspected
```

Categories:

```text
FIT
GYM
RENTAL
CAVE
```

### OUTDOOR_RENTAL_MASTER

Used by Outdoor Rental Check-Out.

```text
rental_item_id
gear_type_id
item_name
size_required
daily_rate
active
notes
```

Starter rental items:

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
120cm Nylon Runner | size_required FALSE | 50
Crazy Horse Guidebook | size_required FALSE | 100
```

Size-required rental items use Size + Qty rows in the app. The calculated total goes to `taken_qty`; details go to `size_breakdown`.

## Operation Log Tabs

### INSPECTION_LOG

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

Version 1: `photo_url` can stay blank.

### CHECKOUT_LOG

Stores Course checkouts and Outdoor Rental checkouts.

```text
checkout_id
checkout_type
date
guide_name
course_id
course_name
program_purpose
activity_type
course_time
gear_type_id
gear_name
suggested_qty
taken_qty
size_breakdown
notes
status
created_at
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

Rules:

- `checkout_type` is `Course` or `Outdoor Rental`.
- Course `course_time` is a session label: `Full-Day`, `AM-Half-Day`, or `PM-Half-Day`.
- Course checkouts save `program_purpose` and `activity_type` for reports and pending-return context.
- Status starts as `Pending Return`.

### RETURN_LOG

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

Version 1: `damage_photo_url` can stay blank.

### WEEKLY_REPORT_LOG

```text
report_id
week_start
week_end
report_text
slack_sent
sent_at
```

## Spreadsheet Editing Rules

Safe to edit directly:

- Master rows in `GEAR_MASTER`
- Master rows in `COURSE_MASTER`
- Rows in `GEAR_REGISTER`
- Future template rows in `COURSE_GEAR_TEMPLATE`
- Rental item rows and prices in `OUTDOOR_RENTAL_MASTER`

Avoid unless intentionally maintaining records:

- Renaming tabs
- Renaming headers
- Deleting log rows
- Moving headers away from row 1
