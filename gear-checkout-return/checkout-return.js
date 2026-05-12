/*
 * ============================================================
 * checkout-return.js
 * Progression Vertical Operations System
 * ============================================================
 *
 * Features:
 *   1. Main menu navigation
 *   2. Load course list from COURSE_MASTER
 *   3. Load course gear template
 *   4. Submit course gear checkout
 *
 * Depends on:
 *   - ../shared/config.js  (API URL)
 *   - ../shared/api.js     (callAPI function)
 * ============================================================
 */


// ============================================================
// REFERENCES
// ============================================================

var stepMenu              = document.getElementById("step-menu");
var stepCourseCheckout    = document.getElementById("step-course-checkout");
var stepCheckoutSuccess   = document.getElementById("step-checkout-success");
var btnCourseCheckout     = document.getElementById("btn-course-checkout");
var btnBackToMenu         = document.getElementById("back-to-menu");
var guideNameInput        = document.getElementById("guide-name");
var checkoutDateInput     = document.getElementById("checkout-date");
var courseTimeInput       = document.getElementById("course-time");
var courseSelect          = document.getElementById("course-select");
var courseGearContainer   = document.getElementById("course-gear-container");
var checkoutSubmitSection = document.getElementById("checkout-submit-section");
var checkoutValidation    = document.getElementById("checkout-validation");
var checkoutSubmitBtn     = document.getElementById("checkout-submit-btn");
var checkoutSuccessDetails = document.getElementById("checkout-success-details");
var newCheckoutBtn        = document.getElementById("new-checkout-btn");


// ============================================================
// STATE
// ============================================================

var currentCourseGear = [];  // Gear template items for selected course
var selectedCourseName = ""; // Name of selected course


// ============================================================
// INIT — set today's date and current time
// ============================================================

checkoutDateInput.value = new Date().toISOString().split("T")[0];


// ============================================================
// MENU NAVIGATION
// ============================================================

btnCourseCheckout.addEventListener("click", function() {
  stepMenu.classList.add("hidden");
  stepCourseCheckout.classList.remove("hidden");
  loadCourses();
});

btnBackToMenu.addEventListener("click", function() {
  stepCourseCheckout.classList.add("hidden");
  stepMenu.classList.remove("hidden");
  resetCheckoutForm();
});

newCheckoutBtn.addEventListener("click", function() {
  stepCheckoutSuccess.classList.add("hidden");
  stepMenu.classList.remove("hidden");
  resetCheckoutForm();
});


// ============================================================
// resetCheckoutForm — clears all form fields
// ============================================================

function resetCheckoutForm() {
  courseSelect.value = "";
  courseGearContainer.innerHTML = "";
  checkoutSubmitSection.classList.add("hidden");
  guideNameInput.value = "";
  checkoutDateInput.value = new Date().toISOString().split("T")[0];
  courseTimeInput.value = "Full-Day";
  currentCourseGear = [];
  selectedCourseName = "";
}


// ============================================================
// loadCourses — fetches active courses and populates dropdown
// ============================================================

async function loadCourses() {
  courseSelect.innerHTML = '<option value="">Loading courses…</option>';
  courseSelect.disabled = true;

  var result = await callAPI("loadCourses", {});

  if (!result.success) {
    courseSelect.innerHTML = '<option value="">Error loading courses</option>';
    courseGearContainer.innerHTML =
      '<div class="status-message error">Error: ' + (result.error || "Unknown error") + '</div>';
    return;
  }

  if (!result.data || result.data.length === 0) {
    courseSelect.innerHTML = '<option value="">No active courses found</option>';
    return;
  }

  var html = '<option value="">— Choose a course —</option>';
  for (var i = 0; i < result.data.length; i++) {
    var course = result.data[i];
    html += '<option value="' + escapeAttr(course.course_id) + '"';
    html += ' data-name="' + escapeAttr(course.course_name) + '">';
    html += escapeHtml(course.course_name);
    html += '</option>';
  }

  courseSelect.innerHTML = html;
  courseSelect.disabled = false;
}


// ============================================================
// COURSE SELECTION — loads gear template
// ============================================================

courseSelect.addEventListener("change", function() {
  var courseId = courseSelect.value;
  var selectedOption = courseSelect.options[courseSelect.selectedIndex];
  selectedCourseName = selectedOption.getAttribute("data-name") || "";

  if (!courseId) {
    courseGearContainer.innerHTML = "";
    checkoutSubmitSection.classList.add("hidden");
    currentCourseGear = [];
    return;
  }

  loadCourseGearTemplate(courseId);
});


// ============================================================
// loadCourseGearTemplate — fetches suggested gear
// ============================================================

async function loadCourseGearTemplate(courseId) {
  courseGearContainer.innerHTML =
    '<div class="status-message loading">Loading gear template…</div>';
  checkoutSubmitSection.classList.add("hidden");

  var result = await callAPI("loadCourseGearTemplate", { courseId: courseId });

  if (!result.success) {
    courseGearContainer.innerHTML =
      '<div class="status-message error">Error: ' + (result.error || "Unknown error") + '</div>';
    return;
  }

  if (!result.data || result.data.length === 0) {
    courseGearContainer.innerHTML =
      '<div class="status-message empty">No gear template found for this course.</div>';
    return;
  }

  currentCourseGear = result.data;
  renderCourseGearList(result.data);
  checkoutSubmitSection.classList.remove("hidden");
  validateCheckout();
}


// ============================================================
// renderCourseGearList — builds gear cards with taken_qty inputs
// ============================================================

function renderCourseGearList(gearItems) {
  var html = '<div class="gear-template-header">';
  html += '  <span>' + gearItems.length + ' gear items</span>';
  html += '</div>';

  for (var i = 0; i < gearItems.length; i++) {
    var item = gearItems[i];

    html += '<div class="gear-card">';

    html += '  <div class="gear-card-header">';
    html += '    <span class="gear-card-name">' + escapeHtml(item.gear_name) + '</span>';
    html += '    <span class="gear-id">' + escapeHtml(item.gear_type_id) + '</span>';
    html += '  </div>';

    html += '  <div class="gear-card-row">';
    html += '    <div class="gear-card-field">';
    html += '      <label>Suggested</label>';
    html += '      <span class="suggested-value">' + item.suggested_qty + '</span>';
    html += '    </div>';
    html += '    <div class="gear-card-field">';
    html += '      <label for="taken-' + i + '">Taking</label>';
    html += '      <input type="number" id="taken-' + i + '" class="qty-input"';
    html += '        value="' + item.suggested_qty + '"';
    html += '        min="0" inputmode="numeric"';
    html += '        data-row="' + i + '" />';
    html += '    </div>';
    html += '  </div>';

    html += '  <input type="text" id="gear-notes-' + i + '" class="notes-input"';
    html += '    placeholder="Notes (optional)" autocomplete="off" />';

    html += '</div>';
  }

  courseGearContainer.innerHTML = html;

  // Attach input listeners for validation
  var allInputs = courseGearContainer.querySelectorAll(".qty-input");
  allInputs.forEach(function(input) {
    input.addEventListener("input", function() {
      validateCheckout();
    });
  });
}


// ============================================================
// validateCheckout — checks form and enables/disables submit
// ============================================================

function validateCheckout() {
  var guideName = guideNameInput.value.trim();
  var courseId = courseSelect.value;

  // Count items with taken > 0
  var totalTaken = 0;
  for (var i = 0; i < currentCourseGear.length; i++) {
    var el = document.getElementById("taken-" + i);
    var val = el ? parseInt(el.value, 10) : 0;
    if (!isNaN(val) && val > 0) {
      totalTaken++;
    }
  }

  // Build validation message
  if (!guideName) {
    checkoutValidation.innerHTML =
      '<div class="summary-info">Enter guide/staff name to continue.</div>';
    checkoutSubmitBtn.disabled = true;
  } else if (!courseId) {
    checkoutValidation.innerHTML =
      '<div class="summary-info">Select a course to continue.</div>';
    checkoutSubmitBtn.disabled = true;
  } else if (totalTaken === 0) {
    checkoutValidation.innerHTML =
      '<div class="summary-error">⚠ At least one item must have a quantity greater than 0.</div>';
    checkoutSubmitBtn.disabled = true;
  } else {
    checkoutValidation.innerHTML =
      '<div class="summary-ok">✓ ' + totalTaken + ' item' + (totalTaken > 1 ? 's' : '') +
      ' ready to check out.</div>';
    checkoutSubmitBtn.disabled = false;
  }
}


// ============================================================
// INPUT LISTENERS — re-validate when guide name changes
// ============================================================

guideNameInput.addEventListener("input", function() {
  validateCheckout();
});


// ============================================================
// SUBMIT — sends checkout data to API
// ============================================================

checkoutSubmitBtn.addEventListener("click", function() {
  submitCourseCheckout();
});

async function submitCourseCheckout() {
  checkoutSubmitBtn.disabled = true;
  checkoutSubmitBtn.textContent = "Submitting…";

  var guideName = guideNameInput.value.trim();
  var date = checkoutDateInput.value;
  var courseTime = courseTimeInput.value;
  var courseId = courseSelect.value;

  // Build gear rows
  var rows = [];
  for (var i = 0; i < currentCourseGear.length; i++) {
    var item = currentCourseGear[i];
    var takenEl = document.getElementById("taken-" + i);
    var takenQty = takenEl ? parseInt(takenEl.value, 10) : 0;
    if (isNaN(takenQty) || takenQty < 0) takenQty = 0;

    var notesEl = document.getElementById("gear-notes-" + i);
    var notes = notesEl ? notesEl.value.trim() : "";

    rows.push({
      gear_type_id:  item.gear_type_id,
      gear_name:     item.gear_name,
      suggested_qty: item.suggested_qty,
      taken_qty:     takenQty,
      notes:         notes
    });
  }

  var payload = {
    checkout_type: "Course",
    date:          date,
    guide_name:    guideName,
    course_id:     courseId,
    course_name:   selectedCourseName,
    course_time:   courseTime,
    rows:          rows
  };

  var result = await callAPI("submitCheckout", payload, "POST");

  if (!result.success) {
    checkoutSubmitBtn.disabled = false;
    checkoutSubmitBtn.textContent = "Check Out Gear";
    alert("Error: " + (result.error || "Unknown error"));
    return;
  }

  // Show success
  stepCourseCheckout.classList.add("hidden");
  stepCheckoutSuccess.classList.remove("hidden");

  var itemCount = result.rowCount || rows.length;
  checkoutSuccessDetails.textContent =
    selectedCourseName + " — " + itemCount + " gear items checked out by " +
    guideName + " on " + date + ". Status: Pending Return. (ID: " + result.checkoutId + ")";

  window.scrollTo(0, 0);
}


// ============================================================
// escapeHtml / escapeAttr — prevent XSS
// ============================================================

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
