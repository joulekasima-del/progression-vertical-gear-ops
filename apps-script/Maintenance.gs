/*
 * Maintenance.gs
 * One-off safe maintenance helpers for schema/header updates.
 */

/*
 * Read-only contract audit. This checks the active spreadsheet before feature
 * work or deployment. It reports missing tabs, headers, and known data-format
 * warnings, but it never creates, fixes, or modifies sheets.
 */
function auditCurrentSheetContract() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var contracts = getCurrentSheetContracts_();
  var sheets = [];
  var missingSheetCount = 0;
  var missingHeaderCount = 0;
  var blockingIssues = [];

  for (var i = 0; i < contracts.length; i++) {
    var contract = contracts[i];
    var sheet = spreadsheet.getSheetByName(contract.sheetName);
    var existingHeaders = sheet ? getAuditHeaders_(sheet) : [];
    var missingHeaders = [];
    var extraNotes = [];

    for (var h = 0; h < contract.requiredHeaders.length; h++) {
      var requiredHeader = contract.requiredHeaders[h];
      if (existingHeaders.indexOf(requiredHeader) === -1) {
        missingHeaders.push(requiredHeader);
      }
    }
    missingHeaderCount += missingHeaders.length;

    if (!sheet) {
      missingSheetCount++;

      if (contract.currentlyBlocking) {
        blockingIssues.push("Missing required sheet: " + contract.sheetName);
      } else {
        extraNotes.push("Non-blocking for current workflows; required before Slack Report.");
      }
    } else {
      if (missingHeaders.length > 0) {
        var missingMessage = contract.sheetName + " is missing headers: " + missingHeaders.join(", ");
        if (contract.currentlyBlocking) {
          blockingIssues.push(missingMessage);
        } else {
          extraNotes.push(missingMessage + ". Required before Slack Report.");
        }
      }
    }

    if (sheet && contract.masterUsesActive && existingHeaders.indexOf("active") === -1) {
      extraNotes.push('Missing "active" header; getActiveRows() will return all non-empty rows.');
    }

    if (contract.sheetName === "CHECKOUT_LOG") {
      if (existingHeaders.indexOf("size_breakdown") !== -1 &&
          existingHeaders.indexOf("size") === -1) {
        blockingIssues.push(
          'CHECKOUT_LOG has "size_breakdown" but not "size"; current checkout, return, and print code uses "size".'
        );
        extraNotes.push('"size_breakdown" is not used by the current implementation.');
      }
    }

    if (sheet && contract.sheetName === "OUTDOOR_RENTAL_MASTER" &&
        existingHeaders.indexOf("size_required") !== -1) {
      var invalidSizeRequired = findInvalidYesNoValues_(sheet, existingHeaders.indexOf("size_required") + 1);
      if (invalidSizeRequired.length > 0) {
        extraNotes.push(
          'size_required should contain only "Yes" or "No". Invalid rows: ' +
          invalidSizeRequired.join(", ")
        );
      }
    }

    if (sheet) {
      var duplicateHeaders = findDuplicateHeaders_(existingHeaders);
      if (duplicateHeaders.length > 0) {
        extraNotes.push("Duplicate headers found: " + duplicateHeaders.join(", "));
      }
    }

    sheets.push({
      sheetName: contract.sheetName,
      exists: Boolean(sheet),
      requiredHeaders: contract.requiredHeaders,
      existingHeaders: existingHeaders,
      missingHeaders: missingHeaders,
      extraNotes: extraNotes
    });
  }

  var result = {
    ok: blockingIssues.length === 0,
    checkedAt: formatTimestamp(),
    sheets: sheets,
    summary: {
      missingSheetCount: missingSheetCount,
      missingHeaderCount: missingHeaderCount,
      blockingIssues: blockingIssues
    }
  };

  return result;
}

/*
 * Read-only compact contract audit for Apps Script logs.
 */
function auditCurrentSheetContractSummary() {
  var result = auditCurrentSheetContract();
  var problemSheets = result.sheets.filter(function(sheet) {
    return !sheet.exists ||
      sheet.missingHeaders.length > 0 ||
      sheet.extraNotes.length > 0;
  }).map(function(sheet) {
    return {
      sheetName: sheet.sheetName,
      exists: sheet.exists,
      missingHeaders: sheet.missingHeaders,
      extraNotes: sheet.extraNotes
    };
  });

  var summary = {
    ok: result.ok,
    checkedAt: result.checkedAt,
    missingSheetCount: result.summary.missingSheetCount,
    missingHeaderCount: result.summary.missingHeaderCount,
    blockingIssues: result.summary.blockingIssues,
    problemSheets: problemSheets
  };

  Logger.log(JSON.stringify(summary, null, 2));
  return summary;
}

function getCurrentSheetContracts_() {
  return [
    {
      sheetName: "GEAR_MASTER",
      requiredHeaders: ["gear_type_id", "gear_name", "category", "expected_qty", "active"],
      masterUsesActive: true,
      currentlyBlocking: true
    },
    {
      sheetName: "COURSE_MASTER",
      requiredHeaders: ["course_id", "course_name", "program_purpose", "activity_type", "active"],
      masterUsesActive: true,
      currentlyBlocking: true
    },
    {
      sheetName: "COURSE_GEAR_TEMPLATE",
      requiredHeaders: ["course_id", "course_name", "gear_type_id", "gear_name", "suggested_qty", "active"],
      masterUsesActive: true,
      currentlyBlocking: true
    },
    {
      sheetName: "GEAR_REGISTER",
      requiredHeaders: [
        "category", "item_type", "item_description", "brand_model", "size", "qty",
        "counted", "purchase_date", "location", "condition", "notes", "last_inspected"
      ],
      masterUsesActive: false,
      currentlyBlocking: true
    },
    {
      sheetName: "OUTDOOR_RENTAL_MASTER",
      requiredHeaders: [
        "rental_item_id", "gear_type_id", "item_name", "size_required",
        "daily_rate", "active", "notes"
      ],
      masterUsesActive: true,
      currentlyBlocking: true
    },
    {
      sheetName: "INSPECTION_LOG",
      requiredHeaders: [
        "submission_id", "date", "inspector", "category", "gear_type_id", "gear_name",
        "expected_qty", "actual_qty", "good_qty", "monitor_qty", "retired_qty",
        "missing_qty", "notes", "created_at"
      ],
      masterUsesActive: false,
      currentlyBlocking: true
    },
    {
      sheetName: "RETIRED_GEAR_LOG",
      requiredHeaders: [
        "retired_id", "inspection_submission_id", "date", "inspector", "category",
        "gear_type_id", "gear_name", "retired_qty", "damage_detail", "photo_url",
        "moved_to_retired_box", "action_needed", "created_at"
      ],
      masterUsesActive: false,
      currentlyBlocking: true
    },
    {
      sheetName: "CHECKOUT_LOG",
      requiredHeaders: [
        "checkout_id", "checkout_type", "date", "guide_name", "course_id", "course_name",
        "program_purpose", "activity_type", "course_time", "gear_type_id", "gear_name",
        "suggested_qty", "taken_qty", "size", "equipment_number", "notes", "status",
        "created_at", "customer_name", "customer_email", "customer_phone",
        "checkout_staff_name", "planned_return_date", "planned_return_time", "deposit_type",
        "deposit_amount", "deposit_note", "rental_days", "daily_rate", "item_total",
        "discount_type", "discount_amount", "subtotal_amount", "total_amount",
        "policy_acceptance_required", "agreement_printed", "customer_signature_collected"
      ],
      masterUsesActive: false,
      currentlyBlocking: true
    },
    {
      sheetName: "RETURN_LOG",
      requiredHeaders: [
        "return_id", "checkout_id", "date_returned", "guide_name", "course_id", "course_name",
        "gear_type_id", "gear_name", "taken_qty", "returned_qty", "same_amount",
        "issue_detail", "damage_photo_url", "return_status", "created_at", "return_staff_name",
        "planned_return_date", "actual_return_date", "actual_return_time", "late_return",
        "extra_day_charge", "dirty_condition_charge", "damage_or_loss_charge",
        "deposit_returned", "deposit_return_note", "final_amount_due", "return_note"
      ],
      masterUsesActive: false,
      currentlyBlocking: true
    },
    {
      sheetName: "WEEKLY_REPORT_LOG",
      requiredHeaders: ["report_id", "week_start", "week_end", "report_text", "slack_sent", "sent_at"],
      masterUsesActive: false,
      currentlyBlocking: false
    }
  ];
}

function getAuditHeaders_(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) return [];

  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(header) {
    return String(header).trim();
  });
}

function findInvalidYesNoValues_(sheet, columnNumber) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, columnNumber, lastRow - 1, 1).getValues();
  var invalidRows = [];

  for (var i = 0; i < values.length; i++) {
    var value = String(values[i][0]).trim();
    if (value !== "Yes" && value !== "No") {
      invalidRows.push((i + 2) + '="' + value + '"');
    }
  }

  return invalidRows;
}

function findDuplicateHeaders_(headers) {
  var seen = {};
  var duplicates = [];

  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    if (header === "") continue;

    if (seen[header] && duplicates.indexOf(header) === -1) {
      duplicates.push(header);
    }
    seen[header] = true;
  }

  return duplicates;
}

function createMissingGearRegisterSheet() {
  var sheetName = "GEAR_REGISTER";
  var headers = [
    "category",
    "item_type",
    "item_description",
    "brand_model",
    "size",
    "qty",
    "counted",
    "purchase_date",
    "location",
    "condition",
    "notes",
    "last_inspected"
  ];
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  var result;

  if (sheet) {
    result = {
      created: false,
      sheetName: sheetName,
      headers: headers,
      message: sheetName + " already exists; no changes made."
    };
    Logger.log(JSON.stringify(result, null, 2));
    return result;
  }

  sheet = spreadsheet.insertSheet(sheetName);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  try {
    sheet.setFrozenRows(1);
  } catch (error) {
    // The sheet and required header row are still valid if freezing is unavailable.
  }

  result = {
    created: true,
    sheetName: sheetName,
    headers: headers,
    message: sheetName + " created with the required header row."
  };
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function ensurePhase7SheetHeaders() {
  var gearRegisterHeaders = [
    "category",
    "item_type",
    "item_description",
    "brand_model",
    "size",
    "qty",
    "counted",
    "purchase_date",
    "location",
    "condition",
    "notes",
    "last_inspected"
  ];

  var result = {
    course_master: ensureHeaders_("COURSE_MASTER", ["program_purpose", "activity_type"]),
    checkout_log: ensureHeaders_("CHECKOUT_LOG", ["program_purpose", "activity_type"]),
    gear_register: ensureGearRegisterHeaders_(gearRegisterHeaders)
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function ensureGearRegisterHeaders_(requiredHeaders) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("GEAR_REGISTER");
  var created = false;

  if (!sheet) {
    sheet = ss.insertSheet("GEAR_REGISTER");
    created = true;
  }

  sheet.getRange(1, 1, 1, sheet.getMaxColumns()).breakApart();

  var firstHeaderRange = sheet.getRange(1, 1, 1, requiredHeaders.length);
  firstHeaderRange.setValues([requiredHeaders]);
  clearDuplicateHeadersAfter_("GEAR_REGISTER", requiredHeaders);

  var result = ensureHeaders_("GEAR_REGISTER", requiredHeaders);
  result.created = created;
  return result;
}

function clearDuplicateHeadersAfter_(tabName, requiredHeaders) {
  var sheet = getSheet(tabName);
  var lastCol = sheet.getLastColumn();

  if (lastCol <= requiredHeaders.length) return;

  var extraRange = sheet.getRange(1, requiredHeaders.length + 1, 1, lastCol - requiredHeaders.length);
  var extraHeaders = extraRange.getValues()[0];
  var changed = false;

  for (var i = 0; i < extraHeaders.length; i++) {
    var value = String(extraHeaders[i]).trim();
    if (requiredHeaders.indexOf(value) !== -1) {
      extraHeaders[i] = "";
      changed = true;
    }
  }

  if (changed) {
    extraRange.setValues([extraHeaders]);
  }
}

function ensureHeaders_(tabName, requiredHeaders) {
  var sheet = getSheet(tabName);
  var lastCol = sheet.getLastColumn();
  var existing = lastCol > 0
    ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(value) {
        return String(value).trim();
      })
    : [];

  var added = [];
  for (var i = 0; i < requiredHeaders.length; i++) {
    var header = requiredHeaders[i];
    if (existing.indexOf(header) === -1) {
      existing.push(header);
      added.push(header);
    }
  }

  if (added.length > 0) {
    sheet.getRange(1, 1, 1, existing.length).setValues([existing]);
  }

  return {
    tab: tabName,
    added: added,
    headers: existing
  };
}

function ensureTabWithHeaders_(tabName, requiredHeaders) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  var created = false;

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    created = true;
  }

  var result = ensureHeaders_(tabName, requiredHeaders);
  result.created = created;
  return result;
}
