# Progression Vertical Testing Checklist

Use this checklist before marking a feature done, committing, pushing, or redeploying.

## Gear Inspection

### Normal Inspection

- Select each category: FIT, Gym, Caving, Outdoor Rental, Route Setting.
- Confirm gear list loads from `GEAR_MASTER`.
- Enter valid quantities.
- Submit.
- Confirm rows appear in `INSPECTION_LOG`.
- Confirm dashboard changes from Pending to Completed.

### Missing Gear

- Set Actual Qty lower than Expected Qty.
- Confirm Missing Qty calculates automatically.
- Submit.
- Confirm `missing_qty` is saved.
- Confirm dashboard shows Completed with issue.

### Retired Gear

- Set Retired Qty greater than 0.
- Confirm retired fields appear.
- Enter damage detail.
- Confirm moved to retired box = Yes.
- Submit.
- Confirm rows appear in `INSPECTION_LOG` and `RETIRED_GEAR_LOG`.

## Course Gear Check-Out

### Course List

- Open Course Gear Check-Out.
- Confirm course dropdown loads from `COURSE_MASTER`.
- Confirm indoor caving courses are not shown if excluded from checkout.

### Course Session

- Confirm course session is a dropdown, not a clock input.
- Confirm options:

```text
Full-Day
AM-Half-Day
PM-Half-Day
```

### Course Checkout

- Enter guide/staff name.
- Select date, course session, and course.
- Enter taken quantities.
- Submit.
- Confirm rows appear in `CHECKOUT_LOG`.
- Confirm `checkout_type = Course`.
- Confirm status is `Pending Return`.

## Outdoor Rental Check-Out

### Customer And Deposit Form

- Confirm all fields use consistent full-width form styling.
- Enter customer name, email, phone.
- Enter checkout staff name.
- Select deposit type.
- Confirm Cash requires amount.
- Confirm Passport does not require full passport number.

### Size Breakdown

- Confirm Helmet, Harness, and Shoes use Size + Qty rows.
- Enter Helmet S:2 and M:3.
- Confirm calculated `taken_qty = 5`.
- Confirm `size_breakdown` is saved.
- Confirm non-sized items use simple quantity.

### Pricing

- Select multiple rental items.
- Confirm subtotal calculates from daily rate x quantity x rental days.
- Apply discount.
- Confirm total cannot be negative.

### Submit Rental

- Submit outdoor rental checkout.
- Confirm rows appear in `CHECKOUT_LOG`.
- Confirm `checkout_type = Outdoor Rental`.
- Confirm status is `Pending Return`.
- Confirm customer/deposit/pricing details are saved.

## Printable Rental Agreement

### Print Page

- Click Print Rental Agreement from rental success screen.
- Confirm URL includes checkout ID, such as `?id=CHK-001`.
- Confirm data loads through `loadCheckoutById`.
- Confirm Google Sheets ISO dates display as Thailand-local readable dates.

### Print Content

- Confirm page includes:
  - Customer details
  - Rental period
  - All selected rental items
  - Size breakdown where needed
  - Deposit details
  - Pricing
  - Agreement terms
  - Customer printed full name
  - Customer signature/date
  - Progression Staff / Witness full name, nickname, signature/initial, date/time

### A4 Print Fit

- Use a rental with all 13 rental items.
- Open print preview.
- Confirm all 13 items, terms, and signature area fit on one A4 page.
- Confirm screen-only buttons are hidden in print preview.

## Pending Return Dashboard

- Confirm Course and Outdoor Rental pending tasks appear.
- Confirm Overdue tasks appear after expected return date has passed.
- Confirm opening a task shows original gear list.
- Confirm outdoor rental tasks show customer/deposit/signature attention where relevant.

## Return Workflows

### Course Return

- Return all quantities exactly.
- Confirm status becomes Completed.
- Return with missing/damaged item.
- Confirm status becomes Completed with Issue.

### Outdoor Rental Return

- Enter return staff name and actual return date/time.
- Enter returned quantities.
- Record late, dirty, damage/loss charges if needed.
- Record deposit returned and note.
- Confirm `RETURN_LOG` saves charge/deposit details.
- Confirm checkout status updates.

## Weekly Slack Report

- Run test report function.
- Confirm report includes:
  - Course gear usage
  - Outdoor rental usage
  - Return status counts
  - Inspection completion
  - Retired gear
  - Attention needed
- Confirm report saves in `WEEKLY_REPORT_LOG`.
- Confirm Slack test message arrives in `#team-ops-vert`.

## Deployment Checks

### GitHub Pages

- Confirm `shared/config.js` has the current Apps Script Web App URL.
- Push frontend changes.
- Open GitHub Pages URL on desktop and mobile.
- Test Gear Inspection, Gear Check-Out & Return, Outdoor Rental, and Print Agreement.

### Apps Script

- If `.gs` files changed, paste/sync changes into Apps Script.
- Create a new deployment version.
- Confirm deployed Web App URL still works.
- Re-test affected frontend action.

