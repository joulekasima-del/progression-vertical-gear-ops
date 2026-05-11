/*
 * ============================================================
 * inspection.js
 * Progression Vertical Operations System
 * ============================================================
 *
 * Features:
 *   1. Load gear by category (from API)
 *   2. Quantity validation
 *   3. Submit inspection (saves to INSPECTION_LOG)
 *
 * Depends on:
 *   - ../shared/config.js  (API URL)
 *   - ../shared/api.js     (callAPI function)
 * ============================================================
 */


// ============================================================
// REFERENCES — grab HTML elements we need to work with
// ============================================================

var categoryButtons    = document.querySelectorAll(".category-btn");
var stepCategory       = document.getElementById("step-category");
var stepGearList       = document.getElementById("step-gear-list");
var stepSuccess        = document.getElementById("step-success");
var selectedCatName    = document.getElementById("selected-category-name");
var gearCount          = document.getElementById("gear-count");
var gearListContainer  = document.getElementById("gear-list-container");
var submitSection      = document.getElementById("submit-section");
var submitBtn          = document.getElementById("submit-btn");
var validationSummary  = document.getElementById("validation-summary");
var inspectorInput     = document.getElementById("inspector-name");
var dateInput          = document.getElementById("inspection-date");
var successDetails     = document.getElementById("success-details");
var newInspectionBtn   = document.getElementById("new-inspection-btn");


// ============================================================
// STATE — track what the user has selected
// ============================================================

var currentCategory = null;  // The currently selected category
var currentGearList = [];    // The gear items returned from the API


// ============================================================
// INIT — set today's date as default
// ============================================================

dateInput.value = new Date().toISOString().split("T")[0];


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
// SUBMIT BUTTON CLICK
// ============================================================

submitBtn.addEventListener("click", function() {
  submitInspection();
});


// ============================================================
// NEW INSPECTION BUTTON — resets the form
// ============================================================

newInspectionBtn.addEventListener("click", function() {
  // Reset state
  currentCategory = null;
  currentGearList = [];

  // Reset UI
  categoryButtons.forEach(function(b) { b.classList.remove("active"); });
  inspectorInput.value = "";
  dateInput.value = new Date().toISOString().split("T")[0];

  // Show category selection, hide other sections
  stepCategory.classList.remove("hidden");
  stepGearList.classList.add("hidden");
  stepSuccess.classList.add("hidden");

  // Scroll to top
  window.scrollTo(0, 0);
});


// ============================================================
// loadGear — calls the API and renders the inspection form
// ============================================================

async function loadGear(category) {

  // Show the gear list section, hide submit until form renders
  stepGearList.classList.remove("hidden");
  submitSection.classList.add("hidden");

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

  // Save the gear list for later use
  currentGearList = result.data;

  // Update the count badge
  gearCount.textContent = result.data.length + " items";

  // Render the inspection form (cards with inputs)
  renderInspectionForm(result.data);

  // Show the submit section
  submitSection.classList.remove("hidden");

  // Run initial validation (all blank = disabled submit)
  validateAllRows();
}


// ============================================================
// renderInspectionForm — builds a card for each gear item
// ============================================================

function renderInspectionForm(gearItems) {

  var html = "";

  for (var i = 0; i < gearItems.length; i++) {
    var item = gearItems[i];

    html += '<div class="inspection-card" id="card-' + i + '">';

    // --- Card header: gear name + ID ---
    html += '  <div class="card-header">';
    html += '    <span class="card-gear-name">' + escapeHtml(item.gear_name) + '</span>';
    html += '    <span class="gear-id">' + escapeHtml(item.gear_type_id) + '</span>';
    html += '  </div>';

    // --- Expected qty (read-only) ---
    html += '  <div class="qty-row qty-row-expected">';
    html += '    <label>Expected</label>';
    html += '    <span class="expected-value">' + item.expected_qty + '</span>';
    html += '  </div>';

    // --- Actual qty input ---
    html += '  <div class="qty-row">';
    html += '    <label for="actual-' + i + '">Actual</label>';
    html += '    <input type="number" id="actual-' + i + '" class="qty-input"';
    html += '      data-row="' + i + '" data-field="actual"';
    html += '      min="0" placeholder="0" inputmode="numeric" />';
    html += '  </div>';

    // --- Quality breakdown: Good / Monitor / Retired ---
    html += '  <div class="quality-group">';
    html += '    <div class="quality-label">Quality breakdown</div>';
    html += '    <div class="quality-inputs">';

    // Good
    html += '      <div class="quality-field">';
    html += '        <label for="good-' + i + '">Good</label>';
    html += '        <input type="number" id="good-' + i + '" class="qty-input qty-good"';
    html += '          data-row="' + i + '" data-field="good"';
    html += '          min="0" placeholder="0" inputmode="numeric" />';
    html += '      </div>';

    // Monitor
    html += '      <div class="quality-field">';
    html += '        <label for="monitor-' + i + '">Monitor</label>';
    html += '        <input type="number" id="monitor-' + i + '" class="qty-input qty-monitor"';
    html += '          data-row="' + i + '" data-field="monitor"';
    html += '          min="0" placeholder="0" inputmode="numeric" />';
    html += '      </div>';

    // Retired
    html += '      <div class="quality-field">';
    html += '        <label for="retired-' + i + '">Retired</label>';
    html += '        <input type="number" id="retired-' + i + '" class="qty-input qty-retired"';
    html += '          data-row="' + i + '" data-field="retired"';
    html += '          min="0" placeholder="0" inputmode="numeric" />';
    html += '      </div>';

    html += '    </div>'; // end quality-inputs
    html += '  </div>';   // end quality-group

    // --- Missing qty (auto-calculated) ---
    html += '  <div class="qty-row qty-row-missing">';
    html += '    <label>Missing</label>';
    html += '    <span id="missing-' + i + '" class="missing-value">—</span>';
    html += '  </div>';

    // --- Notes (optional, per item) ---
    html += '  <div class="notes-row">';
    html += '    <input type="text" id="notes-' + i + '" class="notes-input"';
    html += '      placeholder="Notes (optional)" autocomplete="off" />';
    html += '  </div>';

    // --- Validation message (shown when totals don't match) ---
    html += '  <div id="warning-' + i + '" class="card-warning hidden"></div>';

    html += '</div>'; // end inspection-card
  }

  // Insert into the page
  gearListContainer.innerHTML = html;

  // Attach input event listeners to all quantity inputs
  var allInputs = gearListContainer.querySelectorAll(".qty-input");
  allInputs.forEach(function(input) {
    input.addEventListener("input", function() {
      var rowIndex = parseInt(input.getAttribute("data-row"));
      validateRow(rowIndex);
      validateAllRows();
    });
  });
}


// ============================================================
// getInputValue — reads an input value, returns 0 for blank/negative
// ============================================================

function getInputValue(id) {
  var el = document.getElementById(id);
  if (!el) return 0;

  var val = parseInt(el.value, 10);

  // Treat blank, NaN, or negative as 0
  if (isNaN(val) || val < 0) return 0;

  return val;
}


// ============================================================
// validateRow — checks one gear item row
// ============================================================

function validateRow(rowIndex) {
  var item = currentGearList[rowIndex];
  var expected = item.expected_qty;

  // Read input values
  var actual  = getInputValue("actual-" + rowIndex);
  var good    = getInputValue("good-" + rowIndex);
  var monitor = getInputValue("monitor-" + rowIndex);
  var retired = getInputValue("retired-" + rowIndex);

  // Calculate quality total and missing
  var qualityTotal = good + monitor + retired;
  var missing = expected - actual;

  // Update the missing qty display
  var missingEl = document.getElementById("missing-" + rowIndex);
  var warningEl = document.getElementById("warning-" + rowIndex);
  var cardEl    = document.getElementById("card-" + rowIndex);

  // Show missing value (or dash if actual is 0/blank)
  var actualInput = document.getElementById("actual-" + rowIndex);
  if (actualInput.value === "") {
    missingEl.textContent = "—";
    missingEl.className = "missing-value";
  } else {
    missingEl.textContent = missing;
    if (missing > 0) {
      missingEl.className = "missing-value missing-alert";
    } else if (missing < 0) {
      missingEl.className = "missing-value missing-over";
    } else {
      missingEl.className = "missing-value missing-ok";
    }
  }

  // Check if any quality inputs have been entered
  var goodInput    = document.getElementById("good-" + rowIndex);
  var monitorInput = document.getElementById("monitor-" + rowIndex);
  var retiredInput = document.getElementById("retired-" + rowIndex);
  var hasQualityInput = goodInput.value !== "" || monitorInput.value !== "" || retiredInput.value !== "";

  // Validate: Actual must equal Good + Monitor + Retired
  if (actualInput.value === "" && !hasQualityInput) {
    warningEl.classList.add("hidden");
    warningEl.textContent = "";
    cardEl.classList.remove("card-error", "card-valid");
  } else if (actualInput.value === "") {
    warningEl.classList.remove("hidden");
    warningEl.textContent = "⚠ Enter Actual Qty first.";
    cardEl.classList.add("card-error");
    cardEl.classList.remove("card-valid");
  } else if (actual !== qualityTotal) {
    warningEl.classList.remove("hidden");
    warningEl.textContent = "⚠ Actual (" + actual + ") ≠ Good + Monitor + Retired (" + qualityTotal + ")";
    cardEl.classList.add("card-error");
    cardEl.classList.remove("card-valid");
  } else {
    warningEl.classList.add("hidden");
    warningEl.textContent = "";
    cardEl.classList.remove("card-error");
    cardEl.classList.add("card-valid");
  }
}


// ============================================================
// validateAllRows — checks every row and updates the submit button
// ============================================================

function validateAllRows() {
  var totalRows = currentGearList.length;
  var validRows = 0;
  var errorRows = 0;

  for (var i = 0; i < totalRows; i++) {
    var actualInput = document.getElementById("actual-" + i);
    var actual      = getInputValue("actual-" + i);
    var good        = getInputValue("good-" + i);
    var monitor     = getInputValue("monitor-" + i);
    var retired     = getInputValue("retired-" + i);
    var qualityTotal = good + monitor + retired;

    if (actualInput.value === "") {
      continue;
    }

    if (actual === qualityTotal) {
      validRows++;
    } else {
      errorRows++;
    }
  }

  // Also check if inspector name is filled
  var hasInspector = inspectorInput.value.trim() !== "";

  // Update validation summary
  if (errorRows > 0) {
    validationSummary.innerHTML =
      '<div class="summary-error">⚠ ' + errorRows + ' item' + (errorRows > 1 ? 's have' : ' has') +
      ' mismatched totals. Fix before submitting.</div>';
  } else if (!hasInspector) {
    validationSummary.innerHTML =
      '<div class="summary-info">Enter your name above to enable submit.</div>';
  } else if (validRows < totalRows) {
    var remaining = totalRows - validRows;
    validationSummary.innerHTML =
      '<div class="summary-info">' + validRows + ' of ' + totalRows +
      ' items completed. ' + remaining + ' remaining.</div>';
  } else {
    validationSummary.innerHTML =
      '<div class="summary-ok">✓ All ' + totalRows + ' items validated. Ready to submit.</div>';
  }

  // Enable submit only when all rows valid AND inspector name filled
  if (validRows === totalRows && totalRows > 0 && hasInspector) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}


// ============================================================
// submitInspection — collects form data and sends to API
//
// Builds one object per gear item row and sends them all
// to the backend in a single POST request.
// The backend creates one shared submission_id for all rows.
// ============================================================

async function submitInspection() {

  // Prevent double-clicks
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";

  // Collect inspector info
  var inspector = inspectorInput.value.trim();
  var date = dateInput.value;

  // Build an array of row data (one per gear item)
  var rows = [];

  for (var i = 0; i < currentGearList.length; i++) {
    var item = currentGearList[i];
    var actual  = getInputValue("actual-" + i);
    var good    = getInputValue("good-" + i);
    var monitor = getInputValue("monitor-" + i);
    var retired = getInputValue("retired-" + i);
    var missing = item.expected_qty - actual;
    var notesEl = document.getElementById("notes-" + i);
    var notes   = notesEl ? notesEl.value.trim() : "";

    rows.push({
      gear_type_id: item.gear_type_id,
      gear_name:    item.gear_name,
      expected_qty: item.expected_qty,
      actual_qty:   actual,
      good_qty:     good,
      monitor_qty:  monitor,
      retired_qty:  retired,
      missing_qty:  missing,
      notes:        notes
    });
  }

  // Build the payload
  var payload = {
    date:      date,
    inspector: inspector,
    category:  currentCategory,
    rows:      rows
  };

  // Send to the API
  var result = await callAPI("submitInspection", payload, "POST");

  // Handle errors
  if (!result.success) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Inspection";
    alert("Error submitting inspection: " + (result.error || "Unknown error"));
    return;
  }

  // Success — show the success screen
  stepCategory.classList.add("hidden");
  stepGearList.classList.add("hidden");
  stepSuccess.classList.remove("hidden");

  successDetails.textContent =
    currentCategory + " inspection by " + inspector +
    " on " + date + " — " + rows.length + " items saved." +
    " (ID: " + result.submissionId + ")";

  window.scrollTo(0, 0);
}


// ============================================================
// INSPECTOR NAME — re-validate when name changes
// ============================================================

inspectorInput.addEventListener("input", function() {
  validateAllRows();
});


// ============================================================
// escapeHtml — prevents XSS by escaping special characters
// ============================================================

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
