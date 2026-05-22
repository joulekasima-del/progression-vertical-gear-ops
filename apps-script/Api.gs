/*
 * ============================================================
 * Api.gs
 * Progression Vertical Operations System
 * ============================================================
 *
 * Purpose:
 *   App-specific API functions that are called by Code.gs routing.
 *   Each function reads or writes data using Sheets.gs helpers.
 *
 * Current functions (read-only foundation):
 *   loadGearByCategory(category)  → GEAR_MASTER
 *   loadCourses()                 → COURSE_MASTER
 *   loadCourseGearTemplate(id)    → COURSE_GEAR_TEMPLATE
 *   loadOutdoorRentalItems()      → OUTDOOR_RENTAL_MASTER
 *
 * Future functions (will be added as features are built):
 *   submitInspection(data)        → INSPECTION_LOG + RETIRED_GEAR_LOG
 *   submitCheckout(data)          → CHECKOUT_LOG
 *   submitOutdoorRental(data)     → CHECKOUT_LOG
 *   loadPendingReturns()          → CHECKOUT_LOG
 *   submitReturn(data)            → RETURN_LOG + CHECKOUT_LOG
 *   loadDashboard()               → various logs
 * ============================================================
 */


// ============================================================
// loadGearByCategory — loads active gear items for one category
//
// Called by: Gear Inspection app (to build the inspection form)
// Reads: GEAR_MASTER
//
// Example:
//   loadGearByCategory("FIT")
//   → { success: true, data: [ { gear_type_id: "FIT-001", ... }, ... ] }
//
// Categories: FIT, Gym, Caving, Outdoor Rental, Route Setting
// ============================================================

function loadGearByCategory(category) {
  // Validate that a category was provided
  if (!category) {
    return { success: false, error: "Missing required parameter: category" };
  }

  // Get all active gear items
  var allGear = getActiveRows("GEAR_MASTER");

  // Filter to only the requested category
  var filtered = allGear.filter(function(item) {
    return item.category === category;
  });

  // Clean up internal fields before sending to frontend
  var cleanData = filtered.map(function(item) {
    return {
      gear_type_id: item.gear_type_id,
      gear_name: item.gear_name,
      category: item.category,
      expected_qty: item.expected_qty
    };
  });

  return { success: true, data: cleanData };
}


// ============================================================
// loadCourses — loads all active courses
//
// Called by: Check-Out app (course selection dropdown)
// Reads: COURSE_MASTER
//
// Example:
//   loadCourses()
//   → { success: true, data: [ { course_id: "CRS-001", course_name: "Top Rope Safety Course" }, ... ] }
// ============================================================

function loadCourses() {
  // Get all active courses
  var activeCourses = getActiveRows("COURSE_MASTER");

  // Clean up internal fields before sending to frontend
  var cleanData = activeCourses.map(function(course) {
    return {
      course_id: course.course_id,
      course_name: course.course_name
    };
  });

  return { success: true, data: cleanData };
}


// ============================================================
// loadCourseGearTemplate — loads the suggested gear for a course
//
// Called by: Check-Out app (auto-fills gear list after course selection)
// Reads: COURSE_GEAR_TEMPLATE
//
// Example:
//   loadCourseGearTemplate("CRS-001")
//   → { success: true, data: [ { gear_type_id: "GYM-001", gear_name: "Harness", suggested_qty: 8 }, ... ] }
// ============================================================

function loadCourseGearTemplate(courseId) {
  // Validate that a course ID was provided
  if (!courseId) {
    return { success: false, error: "Missing required parameter: courseId" };
  }

  // Get all active templates
  var allTemplates = getActiveRows("COURSE_GEAR_TEMPLATE");

  // Filter to only the requested course
  var filtered = allTemplates.filter(function(item) {
    return item.course_id === courseId;
  });

  // Clean up internal fields before sending to frontend
  var cleanData = filtered.map(function(item) {
    return {
      course_id: item.course_id,
      course_name: item.course_name,
      gear_type_id: item.gear_type_id,
      gear_name: item.gear_name,
      suggested_qty: item.suggested_qty
    };
  });

  return { success: true, data: cleanData };
}


// ============================================================
// loadOutdoorRentalItems — loads active rental items with prices
//
// Called by: Check-Out app (outdoor rental item selection)
// Reads: OUTDOOR_RENTAL_MASTER
//
// Example:
//   loadOutdoorRentalItems()
//   → { success: true, data: [ { rental_item_id: "RNT-001", item_name: "Helmet", daily_rate: 100, ... }, ... ] }
//
// Prices must come from this sheet, not hard-coded frontend data.
// ============================================================

function loadOutdoorRentalItems() {
  // Get all active rental items
  var activeItems = getActiveRows("OUTDOOR_RENTAL_MASTER");

  // Clean up internal fields before sending to frontend
  var cleanData = activeItems.map(function(item) {
    return {
      rental_item_id: item.rental_item_id,
      gear_type_id: item.gear_type_id,
      item_name: item.item_name,
      size_required: item.size_required,
      daily_rate: item.daily_rate,
      notes: item.notes
    };
  });

  return { success: true, data: cleanData };
}


// ============================================================
// submitInspection — saves inspection to INSPECTION_LOG
// and retired gear details to RETIRED_GEAR_LOG
//
// Called by: Gear Inspection app (submit button)
// Writes: INSPECTION_LOG (one row per gear item)
//         RETIRED_GEAR_LOG (one row per item with retired_qty > 0)
// ============================================================

function submitInspection(data) {

  // --- Validate required fields ---
  if (!data.inspector || data.inspector.trim() === "") {
    return { success: false, error: "Missing required field: inspector name." };
  }

  if (!data.category) {
    return { success: false, error: "Missing required field: category." };
  }

  if (!data.rows || data.rows.length === 0) {
    return { success: false, error: "No gear items to submit." };
  }

  // --- Generate a shared submission_id for all rows ---
  var submissionId = createId("INS", "INSPECTION_LOG", "submission_id");
  var timestamp = formatTimestamp();
  var date = data.date || formatDate(new Date());

  // --- Build row objects for INSPECTION_LOG ---
  var logRows = [];
  var retiredRows = [];

  for (var i = 0; i < data.rows.length; i++) {
    var row = data.rows[i];

    // INSPECTION_LOG row (always)
    logRows.push({
      submission_id: submissionId,
      date:          date,
      inspector:     data.inspector.trim(),
      category:      data.category,
      gear_type_id:  row.gear_type_id,
      gear_name:     row.gear_name,
      expected_qty:  row.expected_qty,
      actual_qty:    row.actual_qty,
      good_qty:      row.good_qty,
      monitor_qty:   row.monitor_qty,
      retired_qty:   row.retired_qty,
      missing_qty:   row.missing_qty,
      notes:         row.notes || "",
      created_at:    timestamp
    });

    // RETIRED_GEAR_LOG row (only if retired_qty > 0)
    if (row.retired_qty > 0) {
      var retiredId = createId("RET", "RETIRED_GEAR_LOG", "retired_id");

      retiredRows.push({
        retired_id:                retiredId,
        inspection_submission_id:  submissionId,
        date:                      date,
        inspector:                 data.inspector.trim(),
        category:                  data.category,
        gear_type_id:              row.gear_type_id,
        gear_name:                 row.gear_name,
        retired_qty:               row.retired_qty,
        damage_detail:             row.damage_detail || "",
        photo_url:                 "",  // Not used in version 1
        moved_to_retired_box:      row.moved_to_retired_box || "No",
        action_needed:             row.action_needed || "",
        created_at:                timestamp
      });
    }
  }

  // --- Write all rows ---
  appendRowObjects("INSPECTION_LOG", logRows);

  if (retiredRows.length > 0) {
    appendRowObjects("RETIRED_GEAR_LOG", retiredRows);
    Logger.log("Retired gear logged: " + retiredRows.length + " row(s)");
  }

  Logger.log("Inspection submitted: " + submissionId + " (" + logRows.length + " rows)");

  return {
    success: true,
    submissionId: submissionId,
    rowCount: logRows.length,
    retiredCount: retiredRows.length
  };
}


// ============================================================
// loadDashboard — returns inspection status per category for a date
//
// Called by: Gear Inspection dashboard
// Reads: INSPECTION_LOG
//
// Returns status for each of the 5 categories:
//   - "Pending"                   → no rows for this category today
//   - "Completed"                 → all items good, nothing missing
//   - "Completed with issue"      → has missing or monitor items
//   - "Completed with retired gear" → has retired items
//
// If both retired and issues exist, retired takes priority.
// ============================================================

function loadDashboard(date) {
  // Default to today if no date provided
  if (!date) {
    date = formatDate(new Date());
  }

  // Read all inspection rows
  var allRows = getRowsAsObjects("INSPECTION_LOG");

  // Filter to the requested date
  // Dates in the sheet may be Date objects or strings, so normalize both
  var dateRows = allRows.filter(function(row) {
    var rowDate = row.date;

    // If it's a Date object, format it
    if (rowDate instanceof Date) {
      rowDate = formatDate(rowDate);
    } else {
      rowDate = String(rowDate).trim();
    }

    return rowDate === date;
  });

  // Group rows by category
  var categories = ["FIT", "Gym", "Caving", "Outdoor Rental", "Route Setting"];
  var statuses = {};

  for (var c = 0; c < categories.length; c++) {
    var cat = categories[c];

    // Find all rows for this category on this date
    var catRows = dateRows.filter(function(row) {
      return row.category === cat;
    });

    if (catRows.length === 0) {
      // No inspection submitted for this category
      statuses[cat] = { status: "Pending", items: 0 };
      continue;
    }

    // Check for retired, missing, or monitor items
    var hasRetired = false;
    var hasMissing = false;
    var hasMonitor = false;

    for (var r = 0; r < catRows.length; r++) {
      var row = catRows[r];

      if (Number(row.retired_qty) > 0) {
        hasRetired = true;
      }
      if (Number(row.missing_qty) > 0) {
        hasMissing = true;
      }
      if (Number(row.monitor_qty) > 0) {
        hasMonitor = true;
      }
    }

    // Determine status (retired takes priority over issue)
    var status;
    if (hasRetired) {
      status = "Completed with retired gear";
    } else if (hasMissing || hasMonitor) {
      status = "Completed with issue";
    } else {
      status = "Completed";
    }

    statuses[cat] = {
      status: status,
      items: catRows.length
    };
  }

  return { success: true, data: statuses };
}


// ============================================================
// submitCheckout — saves a course gear checkout to CHECKOUT_LOG
//
// Called by: Gear Check-Out app (submit button)
// Writes: CHECKOUT_LOG (one row per gear item)
//
// All rows share one checkout_id. Status = "Pending Return".
// ============================================================

function submitCheckout(data) {

  // --- Validate required fields ---
  if (!data.guide_name || data.guide_name.trim() === "") {
    return { success: false, error: "Missing required field: guide/staff name." };
  }

  if (!data.course_id) {
    return { success: false, error: "Missing required field: course." };
  }

  if (!data.rows || data.rows.length === 0) {
    return { success: false, error: "No gear items to check out." };
  }

  // Check at least one item has taken_qty > 0
  var hasGear = false;
  for (var j = 0; j < data.rows.length; j++) {
    if (Number(data.rows[j].taken_qty) > 0) {
      hasGear = true;
      break;
    }
  }
  if (!hasGear) {
    return { success: false, error: "At least one item must have a quantity greater than 0." };
  }

  // --- Generate a shared checkout_id ---
  var checkoutId = createId("CHK", "CHECKOUT_LOG", "checkout_id");
  var timestamp = formatTimestamp();
  var date = data.date || formatDate(new Date());

  // --- Build row objects for CHECKOUT_LOG ---
  var logRows = [];

  for (var i = 0; i < data.rows.length; i++) {
    var row = data.rows[i];

    logRows.push({
      checkout_id:   checkoutId,
      checkout_type: "Course",
      date:          date,
      guide_name:    data.guide_name.trim(),
      course_id:     data.course_id,
      course_name:   data.course_name || "",
      course_time:   data.course_time || "",
      gear_type_id:  row.gear_type_id,
      gear_name:     row.gear_name,
      suggested_qty: row.suggested_qty,
      taken_qty:     row.taken_qty,
      notes:         row.notes || "",
      status:        "Pending Return",
      created_at:    timestamp
    });
  }

  // --- Write all rows ---
  appendRowObjects("CHECKOUT_LOG", logRows);

  Logger.log("Checkout submitted: " + checkoutId + " (" + logRows.length + " rows)");

  return {
    success: true,
    checkoutId: checkoutId,
    rowCount: logRows.length
  };
}


// ============================================================
// submitOutdoorRental — saves an outdoor rental checkout
//
// Called by: Gear Check-Out app (outdoor rental submit)
// Writes: CHECKOUT_LOG (one row per rental item with qty > 0)
//
// All rows share one checkout_id.
// Status = "Pending Return".
// Outdoor-specific columns: customer, deposit, pricing.
// ============================================================

function submitOutdoorRental(data) {

  // --- Validate required fields ---
  if (!data.customer_name || data.customer_name.trim() === "") {
    return { success: false, error: "Missing required field: customer name." };
  }

  if (!data.customer_phone || data.customer_phone.trim() === "") {
    return { success: false, error: "Missing required field: customer phone." };
  }

  if (!data.checkout_staff_name || data.checkout_staff_name.trim() === "") {
    return { success: false, error: "Missing required field: staff name." };
  }

  if (!data.deposit_type) {
    return { success: false, error: "Missing required field: deposit type." };
  }

  if (!data.rows || data.rows.length === 0) {
    return { success: false, error: "No rental items selected." };
  }

  // --- Generate a shared checkout_id ---
  var checkoutId = createId("CHK", "CHECKOUT_LOG", "checkout_id");
  var timestamp = formatTimestamp();
  var date = data.date || formatDate(new Date());

  // --- Build row objects for CHECKOUT_LOG ---
  var logRows = [];

  for (var i = 0; i < data.rows.length; i++) {
    var row = data.rows[i];

    logRows.push({
      // Shared columns
      checkout_id:               checkoutId,
      checkout_type:             "Outdoor Rental",
      date:                      date,
      guide_name:                "",
      course_id:                 "",
      course_name:               "",
      course_time:               "",
      gear_type_id:              row.gear_type_id || "",
      gear_name:                 row.gear_name || "",
      suggested_qty:             "",
      taken_qty:                 row.taken_qty,
      size:                      row.size || "",
      equipment_number:          "",
      notes:                     row.notes || "",
      status:                    "Pending Return",
      created_at:                timestamp,
      // Outdoor rental columns
      customer_name:             data.customer_name.trim(),
      customer_email:            data.customer_email || "",
      customer_phone:            data.customer_phone.trim(),
      checkout_staff_name:       data.checkout_staff_name.trim(),
      planned_return_date:       data.planned_return_date || "",
      planned_return_time:       data.planned_return_time || "",
      deposit_type:              data.deposit_type,
      deposit_amount:            data.deposit_amount || "",
      deposit_note:              data.deposit_note || "",
      rental_days:               data.rental_days || 0,
      daily_rate:                row.daily_rate || 0,
      item_total:                row.item_total || 0,
      discount_type:             data.discount_type || "",
      discount_amount:           data.discount_amount || 0,
      subtotal_amount:           data.subtotal_amount || 0,
      total_amount:              data.total_amount || 0,
      policy_acceptance_required: "Yes",
      agreement_printed:         "No",
      customer_signature_collected: "No"
    });
  }

  // --- Write all rows ---
  appendRowObjects("CHECKOUT_LOG", logRows);

  Logger.log("Outdoor rental submitted: " + checkoutId + " (" + logRows.length + " rows)");

  return {
    success: true,
    checkoutId: checkoutId,
    rowCount: logRows.length
  };
}


// ============================================================
// loadCheckoutById — loads all CHECKOUT_LOG rows for a checkout_id
//
// Called by: Rental Agreement print page
// Reads: CHECKOUT_LOG
//
// Returns all rows for the given checkout_id so the print page
// can render customer details, items, pricing, and deposit info.
// ============================================================

function loadCheckoutById(checkoutId) {
  if (!checkoutId) {
    return { success: false, error: "Missing required parameter: checkoutId." };
  }

  var rows = findRowsByValue("CHECKOUT_LOG", "checkout_id", checkoutId);

  if (rows.length === 0) {
    return { success: false, error: "No checkout found with ID: " + checkoutId };
  }

  // Clean up internal fields
  var cleanRows = rows.map(function(row) {
    var obj = {};
    var keys = Object.keys(row);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] !== "_rowNumber") {
        obj[keys[i]] = row[keys[i]];
      }
    }
    return obj;
  });

  return { success: true, data: cleanRows };
}


// ============================================================
// updateCheckoutField — updates one field on all rows of a checkout
//
// Called by: Signature confirmation on rental success screen
// Updates: CHECKOUT_LOG
//
// Only allows updating safe fields:
//   agreement_printed, customer_signature_collected
// ============================================================

function updateCheckoutField(data) {
  if (!data.checkoutId) {
    return { success: false, error: "Missing checkoutId." };
  }

  if (!data.field) {
    return { success: false, error: "Missing field name." };
  }

  // Only allow updating these specific fields (safety check)
  var allowedFields = ["agreement_printed", "customer_signature_collected"];
  if (allowedFields.indexOf(data.field) === -1) {
    return { success: false, error: "Field not allowed: " + data.field };
  }

  // Find all rows with this checkout_id
  var rows = getRowsAsObjects("CHECKOUT_LOG");
  var updated = 0;

  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].checkout_id) === String(data.checkoutId)) {
      updateCell("CHECKOUT_LOG", rows[i]._rowNumber, data.field, data.value || "");
      updated++;
    }
  }

  if (updated === 0) {
    return { success: false, error: "No rows found for checkout: " + data.checkoutId };
  }

  Logger.log("Updated " + data.field + " = " + data.value + " on " + updated + " rows for " + data.checkoutId);

  return { success: true, updated: updated };
}


// ============================================================
// loadPendingReturns — loads open return tasks grouped by checkout_id
//
// Called by: Pending Gear Returns dashboard
// Reads: CHECKOUT_LOG
//
// Groups rows by checkout_id where status = "Pending Return".
// Returns one summary per checkout with its item list.
// ============================================================

function loadPendingReturns() {
  var allRows = getRowsAsObjects("CHECKOUT_LOG");

  // Filter to open statuses
  var openRows = allRows.filter(function(row) {
    var s = String(row.status);
    return s === "Pending Return" || s === "Overdue";
  });

  if (openRows.length === 0) {
    return { success: true, data: [] };
  }

  // Group by checkout_id
  var groups = {};
  for (var i = 0; i < openRows.length; i++) {
    var row = openRows[i];
    var id = String(row.checkout_id);

    if (!groups[id]) {
      // Format dates for display
      var dateStr = row.date;
      if (dateStr instanceof Date) { dateStr = formatDate(dateStr); }
      var returnDateStr = row.planned_return_date;
      if (returnDateStr instanceof Date) { returnDateStr = formatDate(returnDateStr); }

      groups[id] = {
        checkout_id:                id,
        checkout_type:              row.checkout_type || "Course",
        date:                       String(dateStr),
        guide_name:                 row.guide_name || "",
        course_id:                  row.course_id || "",
        course_name:                row.course_name || "",
        course_time:                row.course_time || "",
        customer_name:              row.customer_name || "",
        customer_email:             row.customer_email || "",
        customer_phone:             row.customer_phone || "",
        checkout_staff_name:        row.checkout_staff_name || "",
        planned_return_date:        String(returnDateStr),
        planned_return_time:        row.planned_return_time || "",
        deposit_type:               row.deposit_type || "",
        deposit_amount:             row.deposit_amount || "",
        deposit_note:               row.deposit_note || "",
        rental_days:                row.rental_days || "",
        agreement_printed:          row.agreement_printed || "No",
        customer_signature_collected: row.customer_signature_collected || "No",
        status:                     row.status,
        items:                      [],
        item_count:                 0
      };
    }

    // Add this item to the group
    groups[id].items.push({
      gear_type_id: row.gear_type_id || "",
      gear_name:    row.gear_name || "",
      taken_qty:    row.taken_qty || 0,
      size:         row.size || "",
      daily_rate:   row.daily_rate || 0,
      item_total:   row.item_total || 0,
      notes:        row.notes || ""
    });

    groups[id].item_count = groups[id].items.length;
  }

  // Convert to array, sorted by date (newest first)
  var result = Object.keys(groups).map(function(id) { return groups[id]; });
  result.sort(function(a, b) {
    return b.date.localeCompare(a.date);
  });

  return { success: true, data: result };
}


// ============================================================
// submitReturn — saves course and outdoor rental returns
//
// Called by: Pending Gear Returns detail screen
// Writes: RETURN_LOG (one row per returned gear item)
// Updates: CHECKOUT_LOG status for every row in this checkout
//
// Course returns use returned quantities and issue detail.
// Outdoor Rental returns also save charges, deposit handling,
// actual return time, and final amount due.
// ============================================================

function submitReturn(data) {

  // --- Validate required fields ---
  var checkoutId = data.checkout_id || data.checkoutId;
  if (!checkoutId) {
    return { success: false, error: "Missing required field: checkout_id." };
  }

  if (!data.rows || data.rows.length === 0) {
    return { success: false, error: "No return rows to submit." };
  }

  // Confirm this checkout exists before writing return rows.
  var checkoutRows = findRowsByValue("CHECKOUT_LOG", "checkout_id", checkoutId);
  if (checkoutRows.length === 0) {
    return { success: false, error: "No checkout found with ID: " + checkoutId };
  }

  var checkoutType = checkoutRows[0].checkout_type || data.checkout_type || "Course";
  var isOutdoorRental = checkoutType === "Outdoor Rental";

  if (checkoutType !== "Course" && !isOutdoorRental) {
    return { success: false, error: "Unsupported checkout type: " + checkoutType };
  }

  if (isOutdoorRental) {
    if (!data.return_staff_name || data.return_staff_name.trim() === "") {
      return { success: false, error: "Missing required field: return staff name." };
    }
    if (!data.actual_return_date) {
      return { success: false, error: "Missing required field: actual return date." };
    }
    if (!data.actual_return_time) {
      return { success: false, error: "Missing required field: actual return time." };
    }
    if (!data.deposit_returned) {
      return { success: false, error: "Missing required field: deposit returned." };
    }
    var checkoutDepositType = String(checkoutRows[0].deposit_type || data.deposit_type || "");
    var passportDeposit = checkoutDepositType.toLowerCase() === "passport";
    var depositFullyReturned = passportDeposit
      ? data.deposit_returned === "Yes"
      : (data.deposit_returned === "Full" || data.deposit_returned === "Yes");
    if (!depositFullyReturned && !data.deposit_return_note) {
      return { success: false, error: "Deposit return note is required if deposit was not fully returned." };
    }
  }

  var hasIssue = false;
  var needsIssueDetail = false;
  for (var i = 0; i < data.rows.length; i++) {
    var row = data.rows[i];
    var takenQty = Number(row.taken_qty) || 0;
    var returnedQty = Number(row.returned_qty) || 0;

    if (returnedQty > takenQty) {
      return { success: false, error: "Returned quantity cannot be greater than taken quantity." };
    }

    if (returnedQty !== takenQty) {
      hasIssue = true;
      needsIssueDetail = true;
    }
  }

  var extraDayCharge = Math.max(Number(data.extra_day_charge) || 0, 0);
  var dirtyConditionCharge = Math.max(Number(data.dirty_condition_charge) || 0, 0);
  var damageOrLossCharge = Math.max(Number(data.damage_or_loss_charge) || 0, 0);
  var finalAmountDue = Math.max(Number(data.final_amount_due) || 0, 0);
  var lateReturn = data.late_return || "No";

  if (isOutdoorRental) {
    var depositTypeForStatus = String(checkoutRows[0].deposit_type || data.deposit_type || "");
    var isPassportDeposit = depositTypeForStatus.toLowerCase() === "passport";
    var depositFullyReturnedForStatus = isPassportDeposit
      ? data.deposit_returned === "Yes"
      : (data.deposit_returned === "Full" || data.deposit_returned === "Yes");

    if (lateReturn === "Yes" ||
        extraDayCharge > 0 ||
        dirtyConditionCharge > 0 ||
        damageOrLossCharge > 0 ||
        finalAmountDue > 0 ||
        !depositFullyReturnedForStatus) {
      hasIssue = true;
    }

    if (damageOrLossCharge > 0) {
      needsIssueDetail = true;
    }
  }

  var issueDetail = data.issue_detail || "";
  if (needsIssueDetail && issueDetail.trim() === "") {
    return { success: false, error: "Issue detail is required for missing gear or damage/loss." };
  }

  var returnStatus = hasIssue ? "Completed with Issue" : "Completed";
  var dateReturned = data.date_returned || data.actual_return_date || formatDate(new Date());
  var timestamp = formatTimestamp();
  var returnRows = [];
  var depositReturnNote = data.deposit_return_note || "";
  if (isOutdoorRental && data.deposit_amount_returned !== undefined && data.deposit_amount_returned !== "") {
    var amountLabel = String(checkoutRows[0].deposit_type || data.deposit_type || "").toLowerCase() === "passport"
      ? "Charge collected"
      : "Deposit amount returned";
    depositReturnNote = depositReturnNote
      ? depositReturnNote + " | " + amountLabel + ": " + data.deposit_amount_returned
      : amountLabel + ": " + data.deposit_amount_returned;
  }

  // --- Build RETURN_LOG rows ---
  for (var r = 0; r < data.rows.length; r++) {
    var item = data.rows[r];
    var sameAmount = String(item.same_amount || "");
    if (sameAmount === "") {
      sameAmount = Number(item.returned_qty) === Number(item.taken_qty) ? "Yes" : "No";
    }

    returnRows.push({
      return_id:             "",
      checkout_id:           checkoutId,
      date_returned:         dateReturned,
      guide_name:            data.guide_name || checkoutRows[0].guide_name || "",
      course_id:             data.course_id || checkoutRows[0].course_id || "",
      course_name:           data.course_name || checkoutRows[0].course_name || "",
      gear_type_id:          item.gear_type_id || "",
      gear_name:             item.gear_name || "",
      taken_qty:             item.taken_qty || 0,
      returned_qty:          item.returned_qty || 0,
      same_amount:           sameAmount,
      issue_detail:          item.issue_detail || issueDetail,
      damage_photo_url:      "",
      return_status:         returnStatus,
      created_at:            timestamp,
      return_staff_name:     data.return_staff_name || "",
      planned_return_date:   data.planned_return_date || checkoutRows[0].planned_return_date || "",
      actual_return_date:    data.actual_return_date || dateReturned,
      actual_return_time:    data.actual_return_time || "",
      late_return:           isOutdoorRental ? lateReturn : "",
      extra_day_charge:      isOutdoorRental ? extraDayCharge : "",
      dirty_condition_charge: isOutdoorRental ? dirtyConditionCharge : "",
      damage_or_loss_charge: isOutdoorRental ? damageOrLossCharge : "",
      deposit_returned:      isOutdoorRental ? data.deposit_returned : "",
      deposit_return_note:   isOutdoorRental ? depositReturnNote : "",
      final_amount_due:      isOutdoorRental ? finalAmountDue : "",
      return_note:           item.return_note || data.return_note || ""
    });
  }

  // Write rows one at a time so createId() stays sequential.
  for (var w = 0; w < returnRows.length; w++) {
    returnRows[w].return_id = createId("RTN", "RETURN_LOG", "return_id");
    appendRowObject("RETURN_LOG", returnRows[w]);
  }

  // --- Update CHECKOUT_LOG status for all rows in this checkout ---
  var updated = 0;
  for (var c = 0; c < checkoutRows.length; c++) {
    updateCell("CHECKOUT_LOG", checkoutRows[c]._rowNumber, "status", returnStatus);
    updated++;
  }

  Logger.log("Return submitted: " + checkoutId + " (" + returnRows.length + " rows, status: " + returnStatus + ")");

  return {
    success: true,
    checkoutId: checkoutId,
    rowCount: returnRows.length,
    updated: updated,
    returnStatus: returnStatus
  };
}
