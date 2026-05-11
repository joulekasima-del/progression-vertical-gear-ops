/*
 * ============================================================
 * api.js
 * Progression Vertical Operations System
 * ============================================================
 *
 * Purpose:
 *   Shared API helper used by all frontend apps.
 *   Provides a single function to call the Apps Script backend.
 *
 * Depends on:
 *   config.js must be loaded first (provides CONFIG.APP_SCRIPT_URL)
 *
 * Usage:
 *   // GET request (for loading data)
 *   const result = await callAPI("loadGearByCategory", { category: "FIT" });
 *
 *   // POST request (for submitting data)
 *   const result = await callAPI("submitInspection", inspectionData, "POST");
 *
 *   // Check the result
 *   if (result.success) {
 *     console.log(result.data);
 *   } else {
 *     console.error(result.error);
 *   }
 * ============================================================
 */


/**
 * callAPI — sends a request to the Apps Script backend
 *
 * @param {string} action   - The API action name (e.g., "loadCourses")
 * @param {object} params   - Data to send (key-value pairs)
 * @param {string} method   - "GET" (default) or "POST"
 * @returns {object}        - The JSON response: { success, data?, error? }
 */
async function callAPI(action, params, method) {

  // Default to GET if no method specified
  method = method || "GET";

  try {

    var response;

    if (method === "GET") {
      // ---- GET request ----
      // Build URL with query parameters: ?action=xxx&category=yyy
      var url = CONFIG.APP_SCRIPT_URL + "?action=" + encodeURIComponent(action);

      // Add any extra parameters to the URL
      if (params) {
        var keys = Object.keys(params);
        for (var i = 0; i < keys.length; i++) {
          url += "&" + encodeURIComponent(keys[i]) + "=" + encodeURIComponent(params[keys[i]]);
        }
      }

      response = await fetch(url);

    } else {
      // ---- POST request ----
      // Send data as JSON in the request body
      response = await fetch(CONFIG.APP_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: action,
          data: params || {}
        })
      });
    }

    // Parse the JSON response
    var result = await response.json();
    return result;

  } catch (error) {
    // Network error, timeout, or JSON parse error
    console.error("API call failed:", action, error);
    return { success: false, error: "Network error. Please check your connection and try again." };
  }
}
