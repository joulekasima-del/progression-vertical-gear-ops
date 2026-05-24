/*
 * ============================================================
 * Code.gs
 * Progression Vertical Operations System
 * ============================================================
 *
 * Purpose:
 *   Main entry point for the Apps Script web app.
 *   Handles HTTP requests from the frontend, routes each
 *   request to the correct function, and returns JSON.
 *
 * How it works:
 *   1. Frontend sends a request with an "action" parameter
 *   2. doGet or doPost receives the request
 *   3. handleRequest() routes it to the correct Api.gs function
 *   4. The result is returned as JSON
 *
 * How to deploy:
 *   1. Click Deploy → New Deployment
 *   2. Type: Web app
 *   3. Execute as: Me
 *   4. Who has access: Anyone
 *   5. Copy the web app URL into shared/config.js
 * ============================================================
 */


// ============================================================
// doGet — handles GET requests from the frontend
// Used for loading/reading data (gear lists, courses, etc.)
//
// The frontend calls:
//   fetch(URL + "?action=loadCourses")
//   fetch(URL + "?action=loadGearByCategory&category=FIT")
//   fetch(URL + "?action=loadGearRegister&category=FIT")
// ============================================================

function doGet(e) {
  try {
    // Read parameters from the URL query string
    var params = e.parameter || {};
    var action = params.action || "";

    // Route to the correct function and get the result
    var result = handleRequest(action, params);

    // Return JSON response
    return sendJSON(result);

  } catch (error) {
    return sendJSON({ success: false, error: error.message });
  }
}


// ============================================================
// doPost — handles POST requests from the frontend
// Used for submitting/writing data (inspections, checkouts, etc.)
//
// The frontend calls:
//   fetch(URL, {
//     method: "POST",
//     body: JSON.stringify({ action: "submitInspection", data: {...} })
//   })
// ============================================================

function doPost(e) {
  try {
    // Parse the JSON body from the request
    var body = JSON.parse(e.postData.contents);
    var action = body.action || "";
    var data = body.data || {};

    // Merge action into data so handleRequest has everything
    data.action = action;

    // Route to the correct function and get the result
    var result = handleRequest(action, data);

    // Return JSON response
    return sendJSON(result);

  } catch (error) {
    return sendJSON({ success: false, error: error.message });
  }
}


// ============================================================
// handleRequest — routes an action to the correct function
//
// This is the central router. Every API action goes through here.
// To add a new action, just add a new case to the switch.
// ============================================================

function handleRequest(action, params) {

  switch (action) {

    // --- Gear Inspection ---
    case "loadGearByCategory":
      return loadGearByCategory(params.category);

    case "submitInspection":
      return submitInspection(params);

    case "loadDashboard":
      return loadDashboard(params.date);

    // --- Course Gear Check-Out ---
    case "loadCourses":
      return loadCourses();

    case "loadGearRegister":
      return loadGearRegister(params.category);

    case "loadCourseGearTemplate":
      return loadCourseGearTemplate(params.courseId);

    case "submitCheckout":
      return submitCheckout(params);

    case "submitOutdoorRental":
      return submitOutdoorRental(params);

    case "loadCheckoutById":
      return loadCheckoutById(params.checkoutId);

    case "updateCheckoutField":
      return updateCheckoutField(params);

    // --- Pending Returns ---
    case "loadPendingReturns":
      return loadPendingReturns();

    case "submitReturn":
      return submitReturn(params);

    // --- Outdoor Rental Check-Out ---
    case "loadOutdoorRentalItems":
      return loadOutdoorRentalItems();

    // --- Health check ---
    case "ping":
      return { success: true, message: "API is running." };

    // --- Unknown action ---
    default:
      return { success: false, error: "Unknown action: " + action };
  }
}


// ============================================================
// sendJSON — wraps a result object in a proper JSON response
//
// Apps Script requires returning a ContentService TextOutput
// for web app responses. This helper does that.
// ============================================================

function sendJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// TEST FUNCTIONS — Run these from the Apps Script editor
// to verify the API works before connecting the frontend.
// ============================================================

/**
 * Test: Ping the API.
 * Expected: Logs { success: true, message: "API is running." }
 */
function testPing() {
  var result = handleRequest("ping", {});
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * Test: Load active courses from COURSE_MASTER.
 * Expected: Logs a list of active courses with course_id and course_name.
 * This is the main success test for the API foundation.
 */
function testApiGetCourses() {
  var result = handleRequest("loadCourses", {});
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * Test: Load gear for a specific category.
 * Expected: Logs gear items from GEAR_MASTER where category = "FIT".
 */
function testApiGetGear() {
  var result = handleRequest("loadGearByCategory", { category: "FIT" });
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * Test: Load course gear template for a specific course.
 * Expected: Logs suggested gear for CRS-001 (Top Rope Safety Course).
 */
function testApiGetCourseGearTemplate() {
  var result = handleRequest("loadCourseGearTemplate", { courseId: "CRS-001" });
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * Test: Load outdoor rental items and prices.
 * Expected: Logs all active rental items with daily rates.
 */
function testApiGetRentalItems() {
  var result = handleRequest("loadOutdoorRentalItems", {});
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * Test: Unknown action should return an error.
 * Expected: Logs { success: false, error: "Unknown action: foobar" }
 */
function testUnknownAction() {
  var result = handleRequest("foobar", {});
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * Test: Submit a sample inspection with retired gear.
 * Expected: Logs success, writes to INSPECTION_LOG and RETIRED_GEAR_LOG.
 */
function testSubmitInspection() {
  var result = handleRequest("submitInspection", {
    date: "2025-06-01",
    inspector: "Test User",
    category: "FIT",
    rows: [
      { gear_type_id: "FIT-001", gear_name: "Harness", expected_qty: 20, actual_qty: 20, good_qty: 19, monitor_qty: 1, retired_qty: 0, missing_qty: 0, notes: "" },
      { gear_type_id: "FIT-002", gear_name: "Helmet",  expected_qty: 20, actual_qty: 18, good_qty: 16, monitor_qty: 1, retired_qty: 1, missing_qty: 2, notes: "2 missing", damage_detail: "Cracked shell", moved_to_retired_box: "Yes", action_needed: "Order replacement" }
    ]
  });
  Logger.log(JSON.stringify(result, null, 2));
}
