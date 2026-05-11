/*
 * ============================================================
 * inspection.js
 * Progression Vertical Operations System
 * ============================================================
 *
 * Purpose:
 *   Handles the Gear Inspection app logic.
 *
 * Current feature: Load gear by category
 *   - Staff tap a category button
 *   - App calls the API to load active gear for that category
 *   - App renders the gear list in a table
 *
 * Depends on:
 *   - ../shared/config.js  (API URL)
 *   - ../shared/api.js     (callAPI function)
 * ============================================================
 */


// ============================================================
// REFERENCES — grab HTML elements we need to work with
// ============================================================

var categoryButtons   = document.querySelectorAll(".category-btn");
var stepGearList      = document.getElementById("step-gear-list");
var selectedCatName   = document.getElementById("selected-category-name");
var gearCount         = document.getElementById("gear-count");
var gearListContainer = document.getElementById("gear-list-container");


// ============================================================
// STATE — track what the user has selected
// ============================================================

var currentCategory = null;  // The currently selected category
var currentGearList = [];    // The gear items returned from the API


// ============================================================
// CATEGORY BUTTON CLICKS
// When staff tap a category, highlight it and load gear.
// ============================================================

categoryButtons.forEach(function(btn) {
  btn.addEventListener("click", function() {

    // Get the category from the button's data attribute
    var category = btn.getAttribute("data-category");

    // Update visual state: remove "active" from all, add to clicked
    categoryButtons.forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");

    // Save current category and load gear
    currentCategory = category;
    loadGear(category);
  });
});


// ============================================================
// loadGear — calls the API and renders the gear list
// ============================================================

async function loadGear(category) {

  // Show the gear list section
  stepGearList.classList.remove("hidden");

  // Update the category name display
  selectedCatName.textContent = category;
  gearCount.textContent = "";

  // Show loading spinner
  gearListContainer.innerHTML = '<div class="status-message loading">Loading gear…</div>';

  // Call the API
  var result = await callAPI("loadGearByCategory", { category: category });

  // Handle errors
  if (!result.success) {
    gearListContainer.innerHTML =
      '<div class="status-message error">Error: ' + (result.error || "Unknown error") + '</div>';
    return;
  }

  // Handle empty results
  if (!result.data || result.data.length === 0) {
    gearListContainer.innerHTML =
      '<div class="status-message empty">No active gear found for ' + category + '.</div>';
    return;
  }

  // Save the gear list for later use (inspection form will need it)
  currentGearList = result.data;

  // Update the count badge
  gearCount.textContent = result.data.length + " items";

  // Render the gear table
  renderGearTable(result.data);
}


// ============================================================
// renderGearTable — builds an HTML table from gear data
// ============================================================

function renderGearTable(gearItems) {

  // Build table header
  var html = '<table class="gear-table">';
  html += '<thead><tr>';
  html += '<th>ID</th>';
  html += '<th>Gear Name</th>';
  html += '<th>Expected Qty</th>';
  html += '</tr></thead>';

  // Build table body — one row per gear item
  html += '<tbody>';

  for (var i = 0; i < gearItems.length; i++) {
    var item = gearItems[i];

    html += '<tr>';
    html += '<td class="gear-id">' + escapeHtml(item.gear_type_id) + '</td>';
    html += '<td>' + escapeHtml(item.gear_name) + '</td>';
    html += '<td>' + item.expected_qty + '</td>';
    html += '</tr>';
  }

  html += '</tbody></table>';

  // Insert into the page
  gearListContainer.innerHTML = html;
}


// ============================================================
// escapeHtml — prevents XSS by escaping special characters
//
// Always use this when inserting user/database data into HTML.
// ============================================================

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
