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
 *   4. Retired gear logging (saves to RETIRED_GEAR_LOG)
 *
 * Depends on:
 *   - ../shared/config.js  (API URL)
 *   - ../shared/api.js     (callAPI function)
 * ============================================================
 */


// ============================================================
// REFERENCES
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
// STATE
// ============================================================

var currentCategory = null;
var currentGearList = [];


// ============================================================
// INIT — set today's date as default
// ============================================================

dateInput.value = new Date().toISOString().split("T")[0];


// ============================================================
// CATEGORY BUTTON CLICKS
// ============================================================

categoryButtons.forEach(function(btn) {
  btn.addEventListener("click", function() {
    var category = btn.getAttribute("data-category");
    categoryButtons.forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
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
  currentCategory = null;
  currentGearList = [];
  categoryButtons.forEach(function(b) { b.classList.remove("active"); });
  inspectorInput.value = "";
  dateInput.value = new Date().toISOString().split("T")[0];
  stepCategory.classList.remove("hidden");
  stepGearList.classList.add("hidden");
  stepSuccess.classList.add("hidden");
  window.scrollTo(0, 0);
});


// ============================================================
// loadGear — calls the API and renders the inspection form
// ============================================================

async function loadGear(category) {
  stepGearList.classList.remove("hidden");
  submitSection.classList.add("hidden");
  selectedCatName.textContent = category;
  gearCount.textContent = "";
  gearListContainer.innerHTML = '<div class="status-message loading">Loading gear…</div>';

  var result = await callAPI("loadGearByCategory", { category: category });

  if (!result.success) {
    gearListContainer.innerHTML =
      '<div class="status-message error">Error: ' + (result.error || "Unknown error") + '</div>';
    return;
  }

  if (!result.data || result.data.length === 0) {
    gearListContainer.innerHTML =
      '<div class="status-message empty">No active gear found for ' + category + '.</div>';
    return;
  }

  currentGearList = result.data;
  gearCount.textContent = result.data.length + " items";
  renderInspectionForm(result.data);
  submitSection.classList.remove("hidden");
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

    // Card header
    html += '  <div class="card-header">';
    html += '    <span class="card-gear-name">' + escapeHtml(item.gear_name) + '</span>';
    html += '    <span class="gear-id">' + escapeHtml(item.gear_type_id) + '</span>';
    html += '  </div>';

    // Expected qty
    html += '  <div class="qty-row qty-row-expected">';
    html += '    <label>Expected</label>';
    html += '    <span class="expected-value">' + item.expected_qty + '</span>';
    html += '  </div>';

    // Actual qty
    html += '  <div class="qty-row">';
    html += '    <label for="actual-' + i + '">Actual</label>';
    html += '    <input type="number" id="actual-' + i + '" class="qty-input"';
    html += '      data-row="' + i + '" data-field="actual"';
    html += '      min="0" placeholder="0" inputmode="numeric" />';
    html += '  </div>';

    // Quality breakdown
    html += '  <div class="quality-group">';
    html += '    <div class="quality-label">Quality breakdown</div>';
    html += '    <div class="quality-inputs">';

    html += '      <div class="quality-field">';
    html += '        <label for="good-' + i + '">Good</label>';
    html += '        <input type="number" id="good-' + i + '" class="qty-input qty-good"';
    html += '          data-row="' + i + '" data-field="good"';
    html += '          min="0" placeholder="0" inputmode="numeric" />';
    html += '      </div>';

    html += '      <div class="quality-field">';
    html += '        <label for="monitor-' + i + '">Monitor</label>';
    html += '        <input type="number" id="monitor-' + i + '" class="qty-input qty-monitor"';
    html += '          data-row="' + i + '" data-field="monitor"';
    html += '          min="0" placeholder="0" inputmode="numeric" />';
    html += '      </div>';

    html += '      <div class="quality-field">';
    html += '        <label for="retired-' + i + '">Retired</label>';
    html += '        <input type="number" id="retired-' + i + '" class="qty-input qty-retired"';
    html += '          data-row="' + i + '" data-field="retired"';
    html += '          min="0" placeholder="0" inputmode="numeric" />';
    html += '      </div>';

    html += '    </div>';
    html += '  </div>';

    // Missing qty
    html += '  <div class="qty-row qty-row-missing">';
    html += '    <label>Missing</label>';
    html += '    <span id="missing-' + i + '" class="missing-value">—</span>';
    html += '  </div>';

    // Notes
    html += '  <div class="notes-row">';
    html += '    <input type="text" id="notes-' + i + '" class="notes-input"';
    html += '      placeholder="Notes (optional)" autocomplete="off" />';
    html += '  </div>';

    // --- Retired gear section (hidden by default, shown when retired > 0) ---
    html += '  <div id="retired-section-' + i + '" class="retired-section hidden">';
    html += '    <div class="retired-header">⚠ Retired Gear Details</div>';

    // Damage detail (required)
    html += '    <div class="retired-field">';
    html += '      <label for="damage-' + i + '">Damage Detail <span class="required">*</span></label>';
    html += '      <input type="text" id="damage-' + i + '" class="retired-input"';
    html += '        placeholder="Describe the damage or reason for retiring" autocomplete="off" />';
    html += '    </div>';

    // Moved to retired box (checkbox)
    html += '    <div class="retired-field retired-checkbox-row">';
    html += '      <label>';
    html += '        <input type="checkbox" id="moved-' + i + '" />';
    html += '        Moved to retired box';
    html += '      </label>';
    html += '      <span id="moved-warning-' + i + '" class="moved-warning hidden">Must be checked</span>';
    html += '    </div>';

    // Action needed (optional)
    html += '    <div class="retired-field">';
    html += '      <label for="action-' + i + '">Action Needed</label>';
    html += '      <input type="text" id="action-' + i + '" class="retired-input"';
    html += '        placeholder="e.g., Order replacement, Manager review (optional)" autocomplete="off" />';
    html += '    </div>';

    html += '  </div>'; // end retired-section

    // Validation warning
    html += '  <div id="warning-' + i + '" class="card-warning hidden"></div>';

    html += '</div>'; // end inspection-card
  }

  gearListContainer.innerHTML = html;

  // Attach listeners to quantity inputs
  var allInputs = gearListContainer.querySelectorAll(".qty-input");
  allInputs.forEach(function(input) {
    input.addEventListener("input", function() {
      var rowIndex = parseInt(input.getAttribute("data-row"));
      toggleRetiredSection(rowIndex);
      validateRow(rowIndex);
      validateAllRows();
    });
  });

  // Attach listeners to retired fields (damage, moved checkbox)
  for (var j = 0; j < gearItems.length; j++) {
    (function(idx) {
      var damageInput = document.getElementById("damage-" + idx);
      var movedCheckbox = document.getElementById("moved-" + idx);

      damageInput.addEventListener("input", function() {
        validateRow(idx);
        validateAllRows();
      });

      movedCheckbox.addEventListener("change", function() {
        // Update the warning visibility
        var movedWarning = document.getElementById("moved-warning-" + idx);
        if (movedCheckbox.checked) {
          movedWarning.classList.add("hidden");
        } else {
          movedWarning.classList.remove("hidden");
        }
        validateRow(idx);
        validateAllRows();
      });
    })(j);
  }
}


// ============================================================
// toggleRetiredSection — show/hide retired fields based on qty
// ============================================================

function toggleRetiredSection(rowIndex) {
  var retired = getInputValue("retired-" + rowIndex);
  var section = document.getElementById("retired-section-" + rowIndex);

  if (retired > 0) {
    section.classList.remove("hidden");
  } else {
    section.classList.add("hidden");
  }
}


// ============================================================
// getInputValue — reads input value, returns 0 for blank/negative
// ============================================================

function getInputValue(id) {
  var el = document.getElementById(id);
  if (!el) return 0;
  var val = parseInt(el.value, 10);
  if (isNaN(val) || val < 0) return 0;
  return val;
}


// ============================================================
// isRetiredValid — checks if retired fields are valid for a row
// Returns true if retired = 0, or if retired > 0 and fields OK
// ============================================================

function isRetiredValid(rowIndex) {
  var retired = getInputValue("retired-" + rowIndex);

  // No retired items = no validation needed
  if (retired === 0) return true;

  // Check damage detail is filled
  var damageEl = document.getElementById("damage-" + rowIndex);
  if (!damageEl || damageEl.value.trim() === "") return false;

  // Check moved to retired box is checked
  var movedEl = document.getElementById("moved-" + rowIndex);
  if (!movedEl || !movedEl.checked) return false;

  return true;
}


// ============================================================
// validateRow — checks one gear item row
// ============================================================

function validateRow(rowIndex) {
  var item = currentGearList[rowIndex];
  var expected = item.expected_qty;

  var actual  = getInputValue("actual-" + rowIndex);
  var good    = getInputValue("good-" + rowIndex);
  var monitor = getInputValue("monitor-" + rowIndex);
  var retired = getInputValue("retired-" + rowIndex);

  var qualityTotal = good + monitor + retired;
  var missing = expected - actual;

  var missingEl   = document.getElementById("missing-" + rowIndex);
  var warningEl   = document.getElementById("warning-" + rowIndex);
  var cardEl      = document.getElementById("card-" + rowIndex);
  var actualInput = document.getElementById("actual-" + rowIndex);

  // Update missing display
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

  // Check quality inputs
  var goodInput    = document.getElementById("good-" + rowIndex);
  var monitorInput = document.getElementById("monitor-" + rowIndex);
  var retiredInput = document.getElementById("retired-" + rowIndex);
  var hasQualityInput = goodInput.value !== "" || monitorInput.value !== "" || retiredInput.value !== "";

  // Determine warning message
  if (actualInput.value === "" && !hasQualityInput) {
    warningEl.classList.add("hidden");
    warningEl.textContent = "";
    cardEl.classList.remove("card-error", "card-valid", "card-retired");
  } else if (actualInput.value === "") {
    warningEl.classList.remove("hidden");
    warningEl.textContent = "⚠ Enter Actual Qty first.";
    cardEl.classList.add("card-error");
    cardEl.classList.remove("card-valid", "card-retired");
  } else if (actual !== qualityTotal) {
    warningEl.classList.remove("hidden");
    warningEl.textContent = "⚠ Actual (" + actual + ") ≠ Good + Monitor + Retired (" + qualityTotal + ")";
    cardEl.classList.add("card-error");
    cardEl.classList.remove("card-valid", "card-retired");
  } else if (retired > 0 && !isRetiredValid(rowIndex)) {
    // Quantities match but retired details incomplete
    warningEl.classList.remove("hidden");
    warningEl.textContent = "⚠ Fill in retired gear details: damage description and confirm moved to box.";
    cardEl.classList.add("card-retired");
    cardEl.classList.remove("card-error", "card-valid");
  } else {
    warningEl.classList.add("hidden");
    warningEl.textContent = "";
    cardEl.classList.remove("card-error", "card-retired");
    cardEl.classList.add("card-valid");
    // Add retired styling if has retired items
    if (retired > 0) {
      cardEl.classList.add("card-retired-valid");
    } else {
      cardEl.classList.remove("card-retired-valid");
    }
  }
}


// ============================================================
// validateAllRows — checks every row and updates submit button
// ============================================================

function validateAllRows() {
  var totalRows = currentGearList.length;
  var validRows = 0;
  var errorRows = 0;
  var retiredIncomplete = 0;

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

    if (actual !== qualityTotal) {
      errorRows++;
    } else if (retired > 0 && !isRetiredValid(i)) {
      retiredIncomplete++;
    } else {
      validRows++;
    }
  }

  var hasInspector = inspectorInput.value.trim() !== "";

  // Update summary
  if (errorRows > 0) {
    validationSummary.innerHTML =
      '<div class="summary-error">⚠ ' + errorRows + ' item' + (errorRows > 1 ? 's have' : ' has') +
      ' mismatched totals. Fix before submitting.</div>';
  } else if (retiredIncomplete > 0) {
    validationSummary.innerHTML =
      '<div class="summary-error">⚠ ' + retiredIncomplete + ' item' + (retiredIncomplete > 1 ? 's need' : ' needs') +
      ' retired gear details completed.</div>';
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

  if (validRows === totalRows && totalRows > 0 && hasInspector) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}


// ============================================================
// submitInspection — collects form data and sends to API
// Now includes retired gear data when retired_qty > 0
// ============================================================

async function submitInspection() {
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";

  var inspector = inspectorInput.value.trim();
  var date = dateInput.value;

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

    var rowData = {
      gear_type_id: item.gear_type_id,
      gear_name:    item.gear_name,
      expected_qty: item.expected_qty,
      actual_qty:   actual,
      good_qty:     good,
      monitor_qty:  monitor,
      retired_qty:  retired,
      missing_qty:  missing,
      notes:        notes
    };

    // Add retired gear details if retired > 0
    if (retired > 0) {
      var damageEl = document.getElementById("damage-" + i);
      var movedEl  = document.getElementById("moved-" + i);
      var actionEl = document.getElementById("action-" + i);

      rowData.damage_detail       = damageEl ? damageEl.value.trim() : "";
      rowData.moved_to_retired_box = movedEl && movedEl.checked ? "Yes" : "No";
      rowData.action_needed       = actionEl ? actionEl.value.trim() : "";
    }

    rows.push(rowData);
  }

  var payload = {
    date:      date,
    inspector: inspector,
    category:  currentCategory,
    rows:      rows
  };

  var result = await callAPI("submitInspection", payload, "POST");

  if (!result.success) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Inspection";
    alert("Error submitting inspection: " + (result.error || "Unknown error"));
    return;
  }

  // Success screen
  stepCategory.classList.add("hidden");
  stepGearList.classList.add("hidden");
  stepSuccess.classList.remove("hidden");

  var retiredCount = result.retiredCount || 0;
  var details = currentCategory + " inspection by " + inspector +
    " on " + date + " — " + rows.length + " items saved.";
  if (retiredCount > 0) {
    details += " " + retiredCount + " retired gear record" + (retiredCount > 1 ? "s" : "") + " logged.";
  }
  details += " (ID: " + result.submissionId + ")";

  successDetails.textContent = details;
  window.scrollTo(0, 0);
}


// ============================================================
// INSPECTOR NAME — re-validate when name changes
// ============================================================

inspectorInput.addEventListener("input", function() {
  validateAllRows();
});


// ============================================================
// escapeHtml — prevents XSS
// ============================================================

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
