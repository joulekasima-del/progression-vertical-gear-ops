/*
 * ============================================================
 * inspection.js
 * Progression Vertical Operations System
 * ============================================================
 *
 * Features:
 *   1. Load gear by category (from API)
 *   2. Quantity validation:
 *      - Actual must equal Good + Monitor + Retired
 *      - Missing = Expected - Actual
 *      - Submit blocked until all rows validate
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
var stepGearList       = document.getElementById("step-gear-list");
var selectedCatName    = document.getElementById("selected-category-name");
var gearCount          = document.getElementById("gear-count");
var gearListContainer  = document.getElementById("gear-list-container");
var submitSection      = document.getElementById("submit-section");
var submitBtn          = document.getElementById("submit-btn");
var validationSummary  = document.getElementById("validation-summary");


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
// with quantity input fields
//
// Each card has:
//   - Gear name and ID (read-only)
//   - Expected Qty (read-only, from Google Sheets)
//   - Actual Qty (staff enters this)
//   - Good / Monitor / Retired Qty (quality breakdown)
//   - Missing Qty (auto-calculated: Expected - Actual)
//   - Validation status icon
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
//
// Rules:
//   1. Actual must equal Good + Monitor + Retired
//   2. Missing = Expected - Actual
//   3. Show warning if rule 1 fails
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
    // Highlight missing qty if items are missing
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
    // Row not started yet — no warning
    warningEl.classList.add("hidden");
    warningEl.textContent = "";
    cardEl.classList.remove("card-error", "card-valid");
  } else if (actualInput.value === "") {
    // Quality entered but no actual — warn
    warningEl.classList.remove("hidden");
    warningEl.textContent = "⚠ Enter Actual Qty first.";
    cardEl.classList.add("card-error");
    cardEl.classList.remove("card-valid");
  } else if (actual !== qualityTotal) {
    // Mismatch — show warning
    warningEl.classList.remove("hidden");
    warningEl.textContent = "⚠ Actual (" + actual + ") ≠ Good + Monitor + Retired (" + qualityTotal + ")";
    cardEl.classList.add("card-error");
    cardEl.classList.remove("card-valid");
  } else {
    // Valid — hide warning
    warningEl.classList.add("hidden");
    warningEl.textContent = "";
    cardEl.classList.remove("card-error");
    cardEl.classList.add("card-valid");
  }
}


// ============================================================
// validateAllRows — checks every row and updates the submit button
//
// Submit is enabled only when:
//   - Every row has an Actual value entered
//   - Every row passes the quality total check
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
      // Not yet filled in — not valid, not error
      continue;
    }

    if (actual === qualityTotal) {
      validRows++;
    } else {
      errorRows++;
    }
  }

  // Update validation summary
  if (errorRows > 0) {
    validationSummary.innerHTML =
      '<div class="summary-error">⚠ ' + errorRows + ' item' + (errorRows > 1 ? 's have' : ' has') +
      ' mismatched totals. Fix before submitting.</div>';
  } else if (validRows < totalRows) {
    var remaining = totalRows - validRows;
    validationSummary.innerHTML =
      '<div class="summary-info">' + validRows + ' of ' + totalRows +
      ' items completed. ' + remaining + ' remaining.</div>';
  } else {
    validationSummary.innerHTML =
      '<div class="summary-ok">✓ All ' + totalRows + ' items validated. Ready to submit.</div>';
  }

  // Enable submit only when all rows are valid
  if (validRows === totalRows && totalRows > 0) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}


// ============================================================
// escapeHtml — prevents XSS by escaping special characters
// ============================================================

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
