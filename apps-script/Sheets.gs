/*
 * Sheets.gs
 * Shared helper functions for reading and writing Google Sheets.
 *
 * Contains:
 *   - Reading rows as objects (header-based)
 *   - Appending new rows
 *   - Updating existing rows
 *   - Creating unique IDs (e.g., INS-001, CHK-001)
 *   - Formatting dates
 *   - Filtering active rows
 *
 * All other .gs files use these helpers instead of
 * writing raw Sheets API calls directly.
 */

/**
 * Returns a sheet by name or throws a clear error if it is missing.
 */
function getSheet(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: "' + sheetName + '".');
  }

  return sheet;
}

/**
 * Returns row-1 header names as strings.
 */
function getHeaders(sheetName) {
  var sheet = getSheet(sheetName);
  var lastColumn = sheet.getLastColumn();

  if (lastColumn === 0) {
    return [];
  }

  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(header) {
    return String(header).trim();
  });
}

/**
 * Returns non-empty data rows as header-keyed objects.
 * _rowNumber stores the row's 1-based position in the sheet.
 */
function getRowsAsObjects(sheetName) {
  var sheet = getSheet(sheetName);
  var headers = getHeaders(sheetName);
  var lastRow = sheet.getLastRow();

  if (headers.length === 0 || lastRow < 2) {
    return [];
  }

  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var rows = [];

  for (var rowIndex = 0; rowIndex < values.length; rowIndex++) {
    var rowValues = values[rowIndex];

    if (isEmptyRow_(rowValues)) {
      continue;
    }

    var rowObject = { _rowNumber: rowIndex + 2 };

    for (var columnIndex = 0; columnIndex < headers.length; columnIndex++) {
      var header = headers[columnIndex];
      if (header !== "") {
        rowObject[header] = rowValues[columnIndex];
      }
    }

    rows.push(rowObject);
  }

  return rows;
}

/**
 * Returns active rows. Sheets without an active column return all data rows.
 */
function getActiveRows(sheetName) {
  var headers = getHeaders(sheetName);
  var rows = getRowsAsObjects(sheetName);

  if (headers.indexOf("active") === -1) {
    return rows;
  }

  return rows.filter(function(row) {
    return isActiveValue_(row.active);
  });
}

/**
 * Appends one object using the sheet's existing header order.
 */
function appendRowObject(sheetName, object) {
  appendRowObjects(sheetName, [object]);
}

/**
 * Appends multiple objects using the sheet's existing header order.
 */
function appendRowObjects(sheetName, objects) {
  if (!objects || objects.length === 0) {
    return;
  }

  var sheet = getSheet(sheetName);
  var headers = getHeaders(sheetName);

  if (headers.length === 0) {
    throw new Error('Sheet "' + sheetName + '" has no headers in row 1.');
  }

  var values = objects.map(function(object) {
    object = object || {};

    return headers.map(function(header) {
      if (header === "" || object[header] === undefined || object[header] === null) {
        return "";
      }
      return object[header];
    });
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
}

/**
 * Updates one cell using a 1-based sheet row number and a header name.
 */
function updateCell(sheetName, rowNumber, headerName, value) {
  var sheet = getSheet(sheetName);
  var headers = getHeaders(sheetName);
  var columnNumber = headers.indexOf(headerName) + 1;

  if (columnNumber === 0) {
    throw new Error('Header "' + headerName + '" not found in sheet "' + sheetName + '".');
  }

  if (!rowNumber || rowNumber < 2) {
    throw new Error("Invalid data row number: " + rowNumber + ".");
  }

  sheet.getRange(rowNumber, columnNumber).setValue(value);
}

/**
 * Returns rows whose header value matches the requested value.
 */
function findRowsByValue(sheetName, headerName, value) {
  var headers = getHeaders(sheetName);

  if (headers.indexOf(headerName) === -1) {
    throw new Error('Header "' + headerName + '" not found in sheet "' + sheetName + '".');
  }

  return getRowsAsObjects(sheetName).filter(function(row) {
    return valuesMatch_(row[headerName], value);
  });
}

/**
 * Creates a readable unique ID such as CHK-20260613-142530-123-A1B2.
 * Extra arguments from older call sites are intentionally ignored.
 */
function createId(prefix) {
  var safePrefix = String(prefix || "ID").trim() || "ID";
  var timestamp = Utilities.formatDate(new Date(), "GMT", "yyyyMMdd-HHmmss-SSS");
  var randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return safePrefix + "-" + timestamp + "-" + randomPart;
}

/**
 * Normalizes Date or date-like string values to yyyy-MM-dd when possible.
 */
function formatDate(value) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, getSpreadsheetTimeZone_(), "yyyy-MM-dd");
  }

  var text = String(value).trim();
  var datePrefix = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (datePrefix) {
    return datePrefix[1];
  }

  var parsed = new Date(text);
  if (isNaN(parsed.getTime())) {
    return text;
  }

  return Utilities.formatDate(parsed, getSpreadsheetTimeZone_(), "yyyy-MM-dd");
}

/**
 * Returns an ISO-like timestamp suitable for log rows.
 */
function formatTimestamp(value) {
  var date = value === undefined || value === null || value === ""
    ? new Date()
    : value instanceof Date
      ? value
      : new Date(value);

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid timestamp value: " + value + ".");
  }

  return Utilities.formatDate(date, getSpreadsheetTimeZone_(), "yyyy-MM-dd'T'HH:mm:ss");
}

function isEmptyRow_(rowValues) {
  for (var i = 0; i < rowValues.length; i++) {
    var value = rowValues[i];
    if (value !== "" && value !== null) {
      return false;
    }
  }
  return true;
}

function isActiveValue_(value) {
  if (value === true || value === 1) {
    return true;
  }

  var normalized = String(value).trim().toLowerCase();
  return normalized === "true" ||
    normalized === "yes" ||
    normalized === "y" ||
    normalized === "1" ||
    normalized === "active";
}

function valuesMatch_(left, right) {
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }

  return String(left) === String(right);
}

function getSpreadsheetTimeZone_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() ||
    Session.getScriptTimeZone() ||
    "GMT";
}
