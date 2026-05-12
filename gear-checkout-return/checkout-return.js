/*
 * ============================================================
 * checkout-return.js
 * Progression Vertical Operations System
 * ============================================================
 *
 * Features:
 *   1. Main menu navigation
 *   2. Load course list from COURSE_MASTER
 *
 * Depends on:
 *   - ../shared/config.js  (API URL)
 *   - ../shared/api.js     (callAPI function)
 * ============================================================
 */


// ============================================================
// REFERENCES
// ============================================================

var stepMenu             = document.getElementById("step-menu");
var stepCourseCheckout   = document.getElementById("step-course-checkout");
var btnCourseCheckout    = document.getElementById("btn-course-checkout");
var btnBackToMenu        = document.getElementById("back-to-menu");
var courseSelect         = document.getElementById("course-select");
var courseGearContainer  = document.getElementById("course-gear-container");


// ============================================================
// MENU NAVIGATION
// ============================================================

// Open Course Gear Check-Out
btnCourseCheckout.addEventListener("click", function() {
  stepMenu.classList.add("hidden");
  stepCourseCheckout.classList.remove("hidden");

  // Load courses when entering the form
  loadCourses();
});

// Back to menu
btnBackToMenu.addEventListener("click", function() {
  stepCourseCheckout.classList.add("hidden");
  stepMenu.classList.remove("hidden");

  // Reset the form
  courseSelect.value = "";
  courseGearContainer.innerHTML = "";
});


// ============================================================
// loadCourses — fetches active courses and populates dropdown
// ============================================================

async function loadCourses() {
  // Show loading in the dropdown
  courseSelect.innerHTML = '<option value="">Loading courses…</option>';
  courseSelect.disabled = true;

  var result = await callAPI("loadCourses", {});

  // Handle errors
  if (!result.success) {
    courseSelect.innerHTML =
      '<option value="">Error loading courses</option>';
    courseGearContainer.innerHTML =
      '<div class="status-message error">Error: ' + (result.error || "Unknown error") + '</div>';
    return;
  }

  // Handle empty results
  if (!result.data || result.data.length === 0) {
    courseSelect.innerHTML =
      '<option value="">No active courses found</option>';
    return;
  }

  // Build dropdown options
  var html = '<option value="">— Choose a course —</option>';

  for (var i = 0; i < result.data.length; i++) {
    var course = result.data[i];
    html += '<option value="' + escapeAttr(course.course_id) + '">';
    html += escapeHtml(course.course_name);
    html += '</option>';
  }

  courseSelect.innerHTML = html;
  courseSelect.disabled = false;
}


// ============================================================
// COURSE SELECTION — loads gear template for selected course
// ============================================================

courseSelect.addEventListener("change", function() {
  var courseId = courseSelect.value;

  if (!courseId) {
    courseGearContainer.innerHTML = "";
    return;
  }

  loadCourseGearTemplate(courseId);
});


// ============================================================
// loadCourseGearTemplate — fetches suggested gear for a course
// ============================================================

async function loadCourseGearTemplate(courseId) {
  // Show loading
  courseGearContainer.innerHTML =
    '<div class="status-message loading">Loading gear template…</div>';

  var result = await callAPI("loadCourseGearTemplate", { courseId: courseId });

  // Handle errors
  if (!result.success) {
    courseGearContainer.innerHTML =
      '<div class="status-message error">Error: ' + (result.error || "Unknown error") + '</div>';
    return;
  }

  // Handle empty template
  if (!result.data || result.data.length === 0) {
    courseGearContainer.innerHTML =
      '<div class="status-message empty">No gear template found for this course.</div>';
    return;
  }

  // Render gear list with quantity inputs
  renderCourseGearList(result.data);
}


// ============================================================
// renderCourseGearList — builds gear cards with taken_qty inputs
//
// Each card shows:
//   - Gear name and ID
//   - Suggested qty (from template)
//   - Taken qty (staff adjusts)
//   - Notes (optional)
// ============================================================

function renderCourseGearList(gearItems) {
  var html = '<div class="gear-template-header">';
  html += '  <span>' + gearItems.length + ' gear items</span>';
  html += '</div>';

  for (var i = 0; i < gearItems.length; i++) {
    var item = gearItems[i];

    html += '<div class="gear-card">';

    // Card header
    html += '  <div class="gear-card-header">';
    html += '    <span class="gear-card-name">' + escapeHtml(item.gear_name) + '</span>';
    html += '    <span class="gear-id">' + escapeHtml(item.gear_type_id) + '</span>';
    html += '  </div>';

    // Suggested qty (read-only) and Taken qty (editable)
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

    // Notes
    html += '  <input type="text" id="gear-notes-' + i + '" class="notes-input"';
    html += '    placeholder="Notes (optional)" autocomplete="off" />';

    html += '</div>'; // end gear-card
  }

  courseGearContainer.innerHTML = html;
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
