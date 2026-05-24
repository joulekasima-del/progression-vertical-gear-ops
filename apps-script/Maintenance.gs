/*
 * Maintenance.gs
 * One-off safe maintenance helpers for schema/header updates.
 */

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
