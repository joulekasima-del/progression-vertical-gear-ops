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
var stepOutdoorRental     = document.getElementById("step-outdoor-rental");
var btnOutdoorRental      = document.getElementById("btn-outdoor-rental");
var rentalBackToMenu      = document.getElementById("rental-back-to-menu");
var rentalItemsContainer  = document.getElementById("rental-items-container");
var rentalCustomerName    = document.getElementById("rental-customer-name");
var rentalCustomerEmail   = document.getElementById("rental-customer-email");
var rentalCustomerPhone   = document.getElementById("rental-customer-phone");
var rentalCheckoutDate    = document.getElementById("rental-checkout-date");
var rentalReturnDate      = document.getElementById("rental-return-date");
var rentalReturnTime      = document.getElementById("rental-return-time");
var rentalDateWarning     = document.getElementById("rental-date-warning");
var rentalStaffName       = document.getElementById("rental-staff-name");
var rentalDepositType     = document.getElementById("rental-deposit-type");
var depositCashField      = document.getElementById("deposit-cash-field");
var rentalDepositAmount   = document.getElementById("rental-deposit-amount");
var depositNoteField      = document.getElementById("deposit-note-field");
var rentalDepositNote     = document.getElementById("rental-deposit-note");
var rentalSubmitSection   = document.getElementById("rental-submit-section");
var rentalValidation      = document.getElementById("rental-validation");
var rentalSubmitBtn       = document.getElementById("rental-submit-btn");


// ============================================================
// STATE
// ============================================================

var currentCourseGear = [];  // Gear template items for selected course
var selectedCourseName = ""; // Name of selected course
var currentRentalItems = []; // Rental items from OUTDOOR_RENTAL_MASTER


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

// Open Outdoor Rental Check-Out
btnOutdoorRental.addEventListener("click", function() {
  stepMenu.classList.add("hidden");
  stepOutdoorRental.classList.remove("hidden");
  initRentalForm();
  loadRentalItems();
});

// Back to menu from rental
rentalBackToMenu.addEventListener("click", function() {
  stepOutdoorRental.classList.add("hidden");
  stepMenu.classList.remove("hidden");
  resetRentalForm();
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
// initRentalForm — sets default dates
// ============================================================

function initRentalForm() {
  var today = new Date().toISOString().split("T")[0];
  rentalCheckoutDate.value = today;

  // Default return date to tomorrow
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  rentalReturnDate.value = tomorrow.toISOString().split("T")[0];

  // Reset other fields
  rentalCustomerName.value = "";
  rentalCustomerEmail.value = "";
  rentalCustomerPhone.value = "";
  rentalStaffName.value = "";
  rentalDepositType.value = "";
  rentalDepositAmount.value = "10000";
  rentalDepositNote.value = "";
  depositCashField.classList.add("hidden");
  depositNoteField.classList.add("hidden");
  rentalDateWarning.classList.add("hidden");
  rentalSubmitSection.classList.add("hidden");
  currentRentalItems = [];
}


// ============================================================
// resetRentalForm — clears everything
// ============================================================

function resetRentalForm() {
  rentalCustomerName.value = "";
  rentalCustomerEmail.value = "";
  rentalCustomerPhone.value = "";
  rentalCheckoutDate.value = "";
  rentalReturnDate.value = "";
  rentalStaffName.value = "";
  rentalDepositType.value = "";
  rentalDepositAmount.value = "10000";
  rentalDepositNote.value = "";
  depositCashField.classList.add("hidden");
  depositNoteField.classList.add("hidden");
  rentalDateWarning.classList.add("hidden");
  rentalSubmitSection.classList.add("hidden");
  rentalItemsContainer.innerHTML = "";
  currentRentalItems = [];
}


// ============================================================
// DEPOSIT TYPE TOGGLE — show/hide deposit fields
// ============================================================

rentalDepositType.addEventListener("change", function() {
  var type = rentalDepositType.value;

  if (type === "Cash") {
    depositCashField.classList.remove("hidden");
    depositNoteField.classList.add("hidden");
  } else if (type === "Passport") {
    depositCashField.classList.add("hidden");
    depositNoteField.classList.remove("hidden");
    rentalDepositNote.placeholder = "Passport country (do NOT enter full passport number)";
  } else if (type === "Other") {
    depositCashField.classList.add("hidden");
    depositNoteField.classList.remove("hidden");
    rentalDepositNote.placeholder = "Describe the deposit arrangement";
  } else {
    depositCashField.classList.add("hidden");
    depositNoteField.classList.add("hidden");
  }

  validateRental();
});


// ============================================================
// DATE VALIDATION — warn if return is before checkout
// ============================================================

rentalCheckoutDate.addEventListener("change", function() { validateDates(); validateRental(); });
rentalReturnDate.addEventListener("change", function() { validateDates(); validateRental(); });

function validateDates() {
  var checkout = rentalCheckoutDate.value;
  var returnD = rentalReturnDate.value;

  if (checkout && returnD && returnD < checkout) {
    rentalDateWarning.textContent = "⚠ Return date is before check-out date.";
    rentalDateWarning.classList.remove("hidden");
  } else {
    rentalDateWarning.classList.add("hidden");
  }
}


// ============================================================
// RENTAL FORM INPUT LISTENERS — re-validate on every change
// ============================================================

rentalCustomerName.addEventListener("input", function() { validateRental(); });
rentalCustomerPhone.addEventListener("input", function() { validateRental(); });
rentalStaffName.addEventListener("input", function() { validateRental(); });
rentalDepositAmount.addEventListener("input", function() { validateRental(); });


// ============================================================
// loadRentalItems — fetches active rental items with prices
// ============================================================

async function loadRentalItems() {
  rentalItemsContainer.innerHTML =
    '<div class="status-message loading">Loading rental items…</div>';

  var result = await callAPI("loadOutdoorRentalItems", {});

  if (!result.success) {
    rentalItemsContainer.innerHTML =
      '<div class="status-message error">Error: ' + (result.error || "Unknown error") + '</div>';
    return;
  }

  if (!result.data || result.data.length === 0) {
    rentalItemsContainer.innerHTML =
      '<div class="status-message empty">No active rental items found.</div>';
    return;
  }

  currentRentalItems = result.data;
  renderRentalItems(result.data);
  rentalSubmitSection.classList.remove("hidden");
  validateRental();
}


// ============================================================
// renderRentalItems — builds rental item cards with qty inputs
// ============================================================

function renderRentalItems(items) {
  var html = '<div class="gear-template-header">';
  html += '  <span>' + items.length + ' rental items</span>';
  html += '  <span>THB/day</span>';
  html += '</div>';

  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    html += '<div class="rental-item-card">';

    // Item name, price, qty
    html += '  <div class="rental-item-row">';
    html += '    <div class="rental-item-info">';
    html += '      <span class="rental-item-name">' + escapeHtml(item.item_name) + '</span>';
    html += '    </div>';
    html += '    <div class="rental-item-price">฿' + item.daily_rate + '</div>';
    html += '    <div class="rental-item-qty">';
    html += '      <input type="number" id="rental-qty-' + i + '" class="qty-input rental-qty"';
    html += '        value="0" min="0" inputmode="numeric" data-row="' + i + '" />';
    html += '    </div>';
    html += '  </div>';

    // Size field (only if size_required = Yes)
    if (item.size_required === "Yes") {
      html += '  <div class="rental-size-row" id="rental-size-row-' + i + '">';
      html += '    <label for="rental-size-' + i + '">Size</label>';
      html += '    <input type="text" id="rental-size-' + i + '" class="rental-size-input"';
      html += '      placeholder="e.g., S, M, L, 40, 42" autocomplete="off" />';
      html += '  </div>';
    }

    html += '</div>';
  }

  rentalItemsContainer.innerHTML = html;

  // Attach qty input listeners
  var qtyInputs = rentalItemsContainer.querySelectorAll(".rental-qty");
  qtyInputs.forEach(function(input) {
    input.addEventListener("input", function() {
      validateRental();
    });
  });
}


// ============================================================
// validateRental — checks all required fields
// ============================================================

function validateRental() {
  var errors = [];

  // Customer name
  if (rentalCustomerName.value.trim() === "") {
    errors.push("Customer name is required.");
  }

  // Customer phone
  if (rentalCustomerPhone.value.trim() === "") {
    errors.push("Customer phone is required.");
  }

  // Return date
  if (rentalReturnDate.value === "") {
    errors.push("Planned return date is required.");
  }

  // Date order
  if (rentalCheckoutDate.value && rentalReturnDate.value && rentalReturnDate.value < rentalCheckoutDate.value) {
    errors.push("Return date cannot be before check-out date.");
  }

  // Staff name
  if (rentalStaffName.value.trim() === "") {
    errors.push("Check-out staff name is required.");
  }

  // Deposit type
  var depositType = rentalDepositType.value;
  if (depositType === "") {
    errors.push("Deposit type is required.");
  }

  // Cash deposit amount
  if (depositType === "Cash") {
    var amt = parseInt(rentalDepositAmount.value, 10);
    if (isNaN(amt) || amt <= 0) {
      errors.push("Deposit amount is required for cash deposit.");
    }
  }

  // At least one rental item with qty > 0
  var totalItems = 0;
  for (var i = 0; i < currentRentalItems.length; i++) {
    var el = document.getElementById("rental-qty-" + i);
    var val = el ? parseInt(el.value, 10) : 0;
    if (!isNaN(val) && val > 0) {
      totalItems++;
    }
  }
  if (currentRentalItems.length > 0 && totalItems === 0) {
    errors.push("Select at least one rental item (quantity > 0).");
  }

  // Update validation summary
  if (errors.length > 0) {
    rentalValidation.innerHTML =
      '<div class="summary-error">⚠ ' + errors[0] + '</div>';
    rentalSubmitBtn.disabled = true;
  } else {
    rentalValidation.innerHTML =
      '<div class="summary-ok">✓ ' + totalItems + ' item' + (totalItems > 1 ? 's' : '') +
      ' ready. All details complete.</div>';
    rentalSubmitBtn.disabled = false;
  }
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
