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
// COURSE SELECTION — future feature will load gear template
// ============================================================

courseSelect.addEventListener("change", function() {
  var courseId = courseSelect.value;

  if (!courseId) {
    courseGearContainer.innerHTML = "";
    return;
  }

  // Placeholder — gear template loading will be built next
  courseGearContainer.innerHTML =
    '<div class="status-message">Course selected. Gear template loading coming next.</div>';
});


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
