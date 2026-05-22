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
var rentalDiscountSection = document.getElementById("rental-discount-section");
var rentalDiscountType    = document.getElementById("rental-discount-type");
var rentalDiscountValue   = document.getElementById("rental-discount-value");
var rentalPricingSection  = document.getElementById("rental-pricing-section");
var pricingDays           = document.getElementById("pricing-days");
var pricingSubtotal       = document.getElementById("pricing-subtotal");
var pricingDiscountRow    = document.getElementById("pricing-discount-row");
var pricingDiscount       = document.getElementById("pricing-discount");
var pricingTotal          = document.getElementById("pricing-total");
var stepRentalSuccess     = document.getElementById("step-rental-success");
var rentalSuccessDetails  = document.getElementById("rental-success-details");
var newRentalBtn          = document.getElementById("new-rental-btn");
var printAgreementBtn     = document.getElementById("print-agreement-btn");
var confirmPrinted        = document.getElementById("confirm-printed");
var confirmSigned         = document.getElementById("confirm-signed");
var confirmPrintedStatus  = document.getElementById("confirm-printed-status");
var confirmSignedStatus   = document.getElementById("confirm-signed-status");
var confirmWarning        = document.getElementById("confirm-warning");
var btnPendingReturns     = document.getElementById("btn-pending-returns");
var stepPendingReturns    = document.getElementById("step-pending-returns");
var returnsBackToMenu     = document.getElementById("returns-back-to-menu");
var pendingReturnsContainer = document.getElementById("pending-returns-container");
var stepReturnDetail      = document.getElementById("step-return-detail");
var detailBackToList      = document.getElementById("detail-back-to-list");
var returnDetailHeader    = document.getElementById("return-detail-header");
var returnDetailItems     = document.getElementById("return-detail-items");


// ============================================================
// STATE
// ============================================================

var currentCourseGear = [];  // Gear template items for selected course
var selectedCourseName = ""; // Name of selected course
var currentRentalItems = []; // Rental items from OUTDOOR_RENTAL_MASTER
var lastRentalCheckoutId = ""; // Last submitted rental checkout_id
var pendingReturnGroups = []; // Grouped pending return tasks
var currentReturnGroup = null; // Pending return task currently open in detail view

var RENTAL_DAMAGE_POLICY = {
  "Helmet": { label: "Half Dome Helmet", price: 2699 },
  "Harness": { label: "Momentum 4S Harness", price: 3799 },
  "Shoes": { label: "Rover", price: 3299 },
  "Rope (60 M)": { label: "10MM XEROS UIAA Dry Rope", price: 13999 },
  "Chalk Bag and Chalk": { label: "Progression Chalk Bag 2025", price: 599 },
  "ATC and Locking Carabiner": { label: "Big Air XP Package", price: 1599 },
  "Gri Gri and Locking Carabiner": { label: "Gri Gri PETZL and Locking Carabiner", price: 4599 },
  "Gri Gri PETZl and Locking Carabiner": { label: "Gri Gri PETZL and Locking Carabiner", price: 4599 },
  "Small Locking Carabiner": { label: "HotForge Screwgate Carabiner", price: 599 },
  "Large Locking Carabiner": { label: "Rocklock Screwgate Carabiner", price: 659 },
  "Quickdraw Set (15 Draws)": { label: "HotForge Quickdraw", price: 999, perDraw: true },
  "60 cm Nylon Runner": { label: "60cm Nylon Runner", price: 399 },
  "60cm Nylon Runner": { label: "60cm Nylon Runner", price: 399 },
  "120cm Nylon Runner": { label: "120cm Nylon Runner", price: 499 },
  "Crazy Horse Guidebook": { label: "Crazy Horse Guidebook", price: 495 }
};


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

// New check-out from rental success
newRentalBtn.addEventListener("click", function() {
  stepRentalSuccess.classList.add("hidden");
  stepMenu.classList.remove("hidden");
  resetRentalForm();
});

// Print rental agreement
printAgreementBtn.addEventListener("click", function() {
  if (lastRentalCheckoutId) {
    window.open("../print/rental-agreement.html?id=" + encodeURIComponent(lastRentalCheckoutId), "_blank");
  }
});

// Confirm agreement printed
confirmPrinted.addEventListener("change", function() {
  if (confirmPrinted.checked) {
    updateSignatureStatus("agreement_printed", "Yes");
    confirmPrintedStatus.textContent = "✓ Saved";
    confirmPrintedStatus.className = "confirm-status confirm-saved";
    // Enable signature checkbox
    confirmSigned.disabled = false;
    confirmWarning.classList.add("hidden");
  } else {
    updateSignatureStatus("agreement_printed", "No");
    confirmPrintedStatus.textContent = "";
    // Disable and uncheck signature
    confirmSigned.checked = false;
    confirmSigned.disabled = true;
    confirmSignedStatus.textContent = "";
    updateSignatureStatus("customer_signature_collected", "No");
    confirmWarning.classList.remove("hidden");
  }
});

// Confirm signature collected
confirmSigned.addEventListener("change", function() {
  if (confirmSigned.checked) {
    updateSignatureStatus("customer_signature_collected", "Yes");
    confirmSignedStatus.textContent = "✓ Saved";
    confirmSignedStatus.className = "confirm-status confirm-saved";
    confirmWarning.classList.add("hidden");
  } else {
    updateSignatureStatus("customer_signature_collected", "No");
    confirmSignedStatus.textContent = "";
    confirmWarning.classList.remove("hidden");
  }
});

// Update a single field on all CHECKOUT_LOG rows for this checkout
async function updateSignatureStatus(field, value) {
  if (!lastRentalCheckoutId) return;

  await callAPI("updateCheckoutField", {
    checkoutId: lastRentalCheckoutId,
    field: field,
    value: value
  }, "POST");
}

// Submit outdoor rental
rentalSubmitBtn.addEventListener("click", function() {
  submitOutdoorRental();
});

// Open Pending Gear Returns
btnPendingReturns.addEventListener("click", function() {
  stepMenu.classList.add("hidden");
  stepPendingReturns.classList.remove("hidden");
  loadPendingReturns();
});

// Back to menu from pending returns
returnsBackToMenu.addEventListener("click", function() {
  stepPendingReturns.classList.add("hidden");
  stepMenu.classList.remove("hidden");
});

// Back to list from detail
detailBackToList.addEventListener("click", function() {
  stepReturnDetail.classList.add("hidden");
  stepPendingReturns.classList.remove("hidden");
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
  rentalDiscountSection.classList.add("hidden");
  rentalPricingSection.classList.add("hidden");
  rentalDiscountType.value = "None";
  rentalDiscountValue.value = "0";
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
  rentalDiscountSection.classList.add("hidden");
  rentalPricingSection.classList.add("hidden");
  rentalDiscountType.value = "None";
  rentalDiscountValue.value = "0";
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

rentalCheckoutDate.addEventListener("change", function() { validateDates(); calculatePricing(); validateRental(); });
rentalReturnDate.addEventListener("change", function() { validateDates(); calculatePricing(); validateRental(); });

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
// DISCOUNT INPUT LISTENERS — recalculate on change
// ============================================================

rentalDiscountType.addEventListener("change", function() { calculatePricing(); validateRental(); });
rentalDiscountValue.addEventListener("input", function() { calculatePricing(); validateRental(); });


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
  rentalDiscountSection.classList.remove("hidden");
  rentalPricingSection.classList.remove("hidden");
  calculatePricing();
  validateRental();
}


// ============================================================
// renderRentalItems — builds rental item cards
// Size-required items get add/remove size rows.
// Non-size items get a simple qty box.
// ============================================================

function renderRentalItems(items) {
  var html = '<div class="gear-template-header">';
  html += '  <span>' + items.length + ' rental items</span>';
  html += '  <span>THB/day</span>';
  html += '</div>';

  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    html += '<div class="rental-item-card" id="rental-card-' + i + '">';

    // Item name and price
    html += '  <div class="rental-item-row">';
    html += '    <div class="rental-item-info">';
    html += '      <span class="rental-item-name">' + escapeHtml(item.item_name) + '</span>';
    html += '    </div>';
    html += '    <div class="rental-item-price">฿' + item.daily_rate + '</div>';

    if (item.size_required === "Yes") {
      // Size-required: show total (calculated) instead of input
      html += '    <div class="rental-item-total">';
      html += '      Qty: <span id="rental-total-' + i + '" class="rental-total-value">0</span>';
      html += '    </div>';
    } else {
      // Non-size: simple qty input
      html += '    <div class="rental-item-qty">';
      html += '      <input type="number" id="rental-qty-' + i + '" class="qty-input rental-qty"';
      html += '        value="0" min="0" inputmode="numeric" data-row="' + i + '" />';
      html += '    </div>';
    }

    html += '  </div>'; // end rental-item-row

    // Size breakdown section (only for size-required items)
    if (item.size_required === "Yes") {
      html += '  <div class="size-breakdown" id="size-breakdown-' + i + '">';
      html += '    <div class="size-rows" id="size-rows-' + i + '">';
      html += '      <!-- Size rows inserted by JS -->';
      html += '    </div>';
      html += '    <button type="button" class="btn-add-size" data-row="' + i + '">+ Add size</button>';
      html += '  </div>';
    }

    html += '</div>'; // end rental-item-card
  }

  rentalItemsContainer.innerHTML = html;

  // Attach qty input listeners (non-size items)
  var qtyInputs = rentalItemsContainer.querySelectorAll(".rental-qty");
  qtyInputs.forEach(function(input) {
    input.addEventListener("input", function() {
      calculatePricing();
      validateRental();
    });
  });

  // Attach "Add size" button listeners
  var addBtns = rentalItemsContainer.querySelectorAll(".btn-add-size");
  addBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      var rowIndex = parseInt(btn.getAttribute("data-row"));
      addSizeRow(rowIndex);
    });
  });
}


// ============================================================
// addSizeRow — adds a new size + qty row for a size-required item
// ============================================================

function addSizeRow(itemIndex) {
  var container = document.getElementById("size-rows-" + itemIndex);
  var rowCount = container.querySelectorAll(".size-entry").length;
  var rowId = itemIndex + "-" + rowCount;

  var html = '<div class="size-entry" id="size-entry-' + rowId + '">';
  html += '  <input type="text" class="size-entry-size" id="size-val-' + rowId + '"';
  html += '    placeholder="Size (S, M, L, 38…)" autocomplete="off" />';
  html += '  <input type="number" class="size-entry-qty" id="size-qty-' + rowId + '"';
  html += '    value="1" min="1" inputmode="numeric" />';
  html += '  <button type="button" class="size-entry-remove" data-entry="' + rowId + '"';
  html += '    data-item="' + itemIndex + '">✕</button>';
  html += '</div>';

  container.insertAdjacentHTML("beforeend", html);

  // Attach listeners to the new row
  var sizeInput = document.getElementById("size-val-" + rowId);
  var qtyInput = document.getElementById("size-qty-" + rowId);
  var removeBtn = container.querySelector('[data-entry="' + rowId + '"]');

  sizeInput.addEventListener("input", function() {
    updateSizeTotal(itemIndex);
    calculatePricing();
    validateRental();
  });

  qtyInput.addEventListener("input", function() {
    updateSizeTotal(itemIndex);
    calculatePricing();
    validateRental();
  });

  removeBtn.addEventListener("click", function() {
    var entry = document.getElementById("size-entry-" + rowId);
    entry.remove();
    updateSizeTotal(itemIndex);
    calculatePricing();
    validateRental();
  });

  updateSizeTotal(itemIndex);
  calculatePricing();
  validateRental();

  // Focus the new size input
  sizeInput.focus();
}


// ============================================================
// updateSizeTotal — recalculates total qty from size rows
// ============================================================

function updateSizeTotal(itemIndex) {
  var container = document.getElementById("size-rows-" + itemIndex);
  var qtyInputs = container.querySelectorAll(".size-entry-qty");
  var total = 0;

  qtyInputs.forEach(function(input) {
    var val = parseInt(input.value, 10);
    if (!isNaN(val) && val > 0) {
      total += val;
    }
  });

  var totalEl = document.getElementById("rental-total-" + itemIndex);
  if (totalEl) {
    totalEl.textContent = total;
    // Highlight if has items
    if (total > 0) {
      totalEl.classList.add("has-qty");
    } else {
      totalEl.classList.remove("has-qty");
    }
  }
}


// ============================================================
// getRentalItemQty — gets the total qty for a rental item
// Works for both size-required (summed) and simple items.
// ============================================================

function getRentalItemQty(itemIndex) {
  var item = currentRentalItems[itemIndex];

  if (item.size_required === "Yes") {
    // Sum from size rows
    var container = document.getElementById("size-rows-" + itemIndex);
    if (!container) return 0;
    var qtyInputs = container.querySelectorAll(".size-entry-qty");
    var total = 0;
    qtyInputs.forEach(function(input) {
      var val = parseInt(input.value, 10);
      if (!isNaN(val) && val > 0) total += val;
    });
    return total;
  } else {
    // Simple qty input
    var el = document.getElementById("rental-qty-" + itemIndex);
    var val = el ? parseInt(el.value, 10) : 0;
    return (!isNaN(val) && val > 0) ? val : 0;
  }
}


// ============================================================
// getSizeBreakdown — returns size breakdown string for an item
// e.g., "S×2, M×3, L×1"
// Returns empty string if no sizes.
// ============================================================

function getSizeBreakdown(itemIndex) {
  var item = currentRentalItems[itemIndex];
  if (item.size_required !== "Yes") return "";

  var container = document.getElementById("size-rows-" + itemIndex);
  if (!container) return "";

  var entries = container.querySelectorAll(".size-entry");
  var parts = [];

  entries.forEach(function(entry) {
    var sizeInput = entry.querySelector(".size-entry-size");
    var qtyInput = entry.querySelector(".size-entry-qty");
    var size = sizeInput ? sizeInput.value.trim() : "";
    var qty = qtyInput ? parseInt(qtyInput.value, 10) : 0;

    if (size && !isNaN(qty) && qty > 0) {
      parts.push(size + "×" + qty);
    }
  });

  return parts.join(", ");
}


// ============================================================
// getRentalDays — calculates days between checkout and return
// Minimum 1 day (same-day rental counts as 1).
// ============================================================

function getRentalDays() {
  var checkout = rentalCheckoutDate.value;
  var returnD = rentalReturnDate.value;

  if (!checkout || !returnD) return 0;
  if (returnD < checkout) return 0;

  var d1 = new Date(checkout);
  var d2 = new Date(returnD);
  var diffMs = d2 - d1;
  var diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Same-day rental = 1 day minimum
  return Math.max(diffDays, 1);
}


// ============================================================
// calculatePricing — updates subtotal, discount, total display
//
// Subtotal = sum of (daily_rate × qty × rental_days) per item
// Discount = fixed amount or percentage of subtotal
// Total = subtotal - discount (never negative)
// ============================================================

function calculatePricing() {
  var rentalDays = getRentalDays();
  var subtotal = 0;

  // Calculate subtotal from all items
  for (var i = 0; i < currentRentalItems.length; i++) {
    var item = currentRentalItems[i];
    var qty = getRentalItemQty(i);
    var rate = Number(item.daily_rate) || 0;

    subtotal += rate * qty * rentalDays;
  }

  // Calculate discount
  var discountType = rentalDiscountType.value;
  var discountInput = parseFloat(rentalDiscountValue.value) || 0;
  var discountAmount = 0;

  if (discountType === "Fixed") {
    discountAmount = discountInput;
  } else if (discountType === "Percent") {
    discountAmount = Math.round(subtotal * discountInput / 100);
  }

  // Total cannot be negative
  var total = Math.max(subtotal - discountAmount, 0);

  // Update display
  pricingDays.textContent = rentalDays > 0 ? rentalDays + (rentalDays === 1 ? " day" : " days") : "—";
  pricingSubtotal.textContent = "฿" + subtotal.toLocaleString();
  pricingTotal.textContent = "฿" + total.toLocaleString();

  // Show/hide discount row
  if (discountAmount > 0) {
    pricingDiscountRow.classList.remove("hidden");
    pricingDiscount.textContent = "-฿" + discountAmount.toLocaleString();
  } else {
    pricingDiscountRow.classList.add("hidden");
  }
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
  var missingSizeLabel = false;
  for (var i = 0; i < currentRentalItems.length; i++) {
    var qty = getRentalItemQty(i);
    if (qty > 0) {
      totalItems++;

      // For size-required items, check that every size row has a label
      if (currentRentalItems[i].size_required === "Yes") {
        var container = document.getElementById("size-rows-" + i);
        if (container) {
          var entries = container.querySelectorAll(".size-entry");
          entries.forEach(function(entry) {
            var sizeInput = entry.querySelector(".size-entry-size");
            var qtyInput = entry.querySelector(".size-entry-qty");
            var sizeVal = sizeInput ? sizeInput.value.trim() : "";
            var qtyVal = qtyInput ? parseInt(qtyInput.value, 10) : 0;
            if (qtyVal > 0 && sizeVal === "") {
              missingSizeLabel = true;
            }
          });
        }
      }
    }
  }

  if (missingSizeLabel) {
    errors.push("Enter a size label for every size row.");
  }

  if (currentRentalItems.length > 0 && totalItems === 0) {
    errors.push("Select at least one rental item (add sizes or set quantity > 0).");
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
// submitOutdoorRental — collects all form data and sends to API
// ============================================================

async function submitOutdoorRental() {
  rentalSubmitBtn.disabled = true;
  rentalSubmitBtn.textContent = "Submitting…";

  var rentalDays = getRentalDays();

  // Calculate discount
  var discType = rentalDiscountType.value;
  var discInput = parseFloat(rentalDiscountValue.value) || 0;

  // Build subtotal and item rows
  var subtotal = 0;
  var rows = [];

  for (var i = 0; i < currentRentalItems.length; i++) {
    var item = currentRentalItems[i];
    var qty = getRentalItemQty(i);

    if (qty === 0) continue; // Skip items with no quantity

    var rate = Number(item.daily_rate) || 0;
    var itemTotal = rate * qty * rentalDays;
    subtotal += itemTotal;

    // Get size breakdown for size-required items
    var sizeText = "";
    if (item.size_required === "Yes") {
      sizeText = getSizeBreakdown(i);
    }

    rows.push({
      gear_type_id:  item.gear_type_id,
      gear_name:     item.item_name,
      taken_qty:     qty,
      size:          sizeText,
      daily_rate:    rate,
      item_total:    itemTotal,
      notes:         ""
    });
  }

  // Calculate discount amount
  var discountAmount = 0;
  if (discType === "Fixed") {
    discountAmount = discInput;
  } else if (discType === "Percent") {
    discountAmount = Math.round(subtotal * discInput / 100);
  }
  var total = Math.max(subtotal - discountAmount, 0);

  // Build payload
  var payload = {
    checkout_type:       "Outdoor Rental",
    date:                rentalCheckoutDate.value,
    customer_name:       rentalCustomerName.value.trim(),
    customer_email:      rentalCustomerEmail.value.trim(),
    customer_phone:      rentalCustomerPhone.value.trim(),
    checkout_staff_name: rentalStaffName.value.trim(),
    planned_return_date: rentalReturnDate.value,
    planned_return_time: rentalReturnTime.value,
    deposit_type:        rentalDepositType.value,
    deposit_amount:      rentalDepositType.value === "Cash" ? (parseInt(rentalDepositAmount.value, 10) || 0) : "",
    deposit_note:        rentalDepositNote.value.trim(),
    rental_days:         rentalDays,
    discount_type:       discType === "None" ? "" : discType,
    discount_amount:     discountAmount,
    subtotal_amount:     subtotal,
    total_amount:        total,
    rows:                rows
  };

  var result = await callAPI("submitOutdoorRental", payload, "POST");

  if (!result.success) {
    rentalSubmitBtn.disabled = false;
    rentalSubmitBtn.textContent = "Check Out Rental Gear";
    alert("Error: " + (result.error || "Unknown error"));
    return;
  }

  // Show success
  lastRentalCheckoutId = result.checkoutId;
  stepOutdoorRental.classList.add("hidden");
  stepRentalSuccess.classList.remove("hidden");

  // Reset confirmation checkboxes
  confirmPrinted.checked = false;
  confirmSigned.checked = false;
  confirmSigned.disabled = true;
  confirmPrintedStatus.textContent = "";
  confirmSignedStatus.textContent = "";
  confirmWarning.classList.remove("hidden");

  rentalSuccessDetails.textContent =
    payload.customer_name + " — " + result.rowCount + " items, " +
    rentalDays + " day" + (rentalDays > 1 ? "s" : "") +
    ", Total ฿" + total.toLocaleString() +
    ". Status: Pending Return. (ID: " + result.checkoutId + ")";

  window.scrollTo(0, 0);
}


// ============================================================
// loadPendingReturns — loads open checkout tasks from API
// ============================================================

async function loadPendingReturns() {
  pendingReturnsContainer.innerHTML =
    '<div class="status-message loading">Loading pending returns…</div>';

  var result = await callAPI("loadPendingReturns", {});

  if (!result.success) {
    pendingReturnsContainer.innerHTML =
      '<div class="status-message error">Error: ' + (result.error || "Unknown error") + '</div>';
    return;
  }

  if (!result.data || result.data.length === 0) {
    pendingReturnsContainer.innerHTML =
      '<div class="status-message empty">No pending returns. All gear is accounted for.</div>';
    return;
  }

  pendingReturnGroups = result.data;
  renderPendingReturns(result.data);
}


// ============================================================
// renderPendingReturns — renders task cards grouped by checkout_id
// ============================================================

function renderPendingReturns(groups) {
  var html = '<div class="gear-template-header">';
  html += '  <span>' + groups.length + ' pending return' + (groups.length > 1 ? 's' : '') + '</span>';
  html += '</div>';

  for (var i = 0; i < groups.length; i++) {
    var g = groups[i];

    html += '<div class="return-task-card" data-index="' + i + '">';

    // Type badge
    var typeBadge = g.checkout_type === "Course"
      ? '<span class="type-badge type-course">Course</span>'
      : '<span class="type-badge type-rental">Rental</span>';

    html += '  <div class="return-task-top">';
    html += '    ' + typeBadge;
    html += '    <span class="return-task-id">' + escapeHtml(g.checkout_id) + '</span>';
    html += '  </div>';

    // Main info
    if (g.checkout_type === "Course") {
      html += '  <div class="return-task-title">' + escapeHtml(g.course_name) + '</div>';
      html += '  <div class="return-task-meta">';
      html += '    <span>Guide: ' + escapeHtml(g.guide_name) + '</span>';
      html += '    <span>' + escapeHtml(g.date) + ' · ' + escapeHtml(g.course_time) + '</span>';
      html += '  </div>';
    } else {
      html += '  <div class="return-task-title">' + escapeHtml(g.customer_name) + '</div>';
      html += '  <div class="return-task-meta">';
      html += '    <span>Staff: ' + escapeHtml(g.checkout_staff_name) + '</span>';
      html += '    <span>Return: ' + escapeHtml(g.planned_return_date) + '</span>';
      html += '  </div>';

      // Attention flags for outdoor rental
      var flags = [];
      if (g.agreement_printed !== "Yes") flags.push("Not printed");
      if (g.customer_signature_collected !== "Yes") flags.push("No signature");
      if (g.deposit_type === "Passport") flags.push("Passport held");

      if (flags.length > 0) {
        html += '  <div class="return-task-flags">';
        for (var f = 0; f < flags.length; f++) {
          html += '<span class="flag-badge">' + flags[f] + '</span>';
        }
        html += '  </div>';
      }
    }

    // Item count
    html += '  <div class="return-task-footer">';
    html += '    <span>' + g.item_count + ' gear item' + (g.item_count > 1 ? 's' : '') + '</span>';
    html += '    <span class="return-task-arrow">View →</span>';
    html += '  </div>';

    html += '</div>';
  }

  pendingReturnsContainer.innerHTML = html;

  // Attach click handlers to each card
  var cards = pendingReturnsContainer.querySelectorAll(".return-task-card");
  cards.forEach(function(card) {
    card.addEventListener("click", function() {
      var idx = parseInt(card.getAttribute("data-index"));
      openReturnDetail(idx);
    });
  });
}


// ============================================================
// openReturnDetail — shows the gear list for a pending return
// ============================================================

function openReturnDetail(groupIndex) {
  var g = pendingReturnGroups[groupIndex];
  if (!g) return;

  currentReturnGroup = g;
  stepPendingReturns.classList.add("hidden");
  stepReturnDetail.classList.remove("hidden");

  // Header
  var hHtml = '<div class="detail-card">';

  if (g.checkout_type === "Course") {
    hHtml += '<div class="return-task-top">';
    hHtml += '  <span class="type-badge type-course">Course</span>';
    hHtml += '  <span class="return-task-id">' + escapeHtml(g.checkout_id) + '</span>';
    hHtml += '</div>';
    hHtml += '<h2>' + escapeHtml(g.course_name) + '</h2>';
    hHtml += '<div class="detail-meta">Guide: ' + escapeHtml(g.guide_name) + ' · ' + escapeHtml(g.date) + ' · ' + escapeHtml(g.course_time) + '</div>';
  } else {
    hHtml += '<div class="return-task-top">';
    hHtml += '  <span class="type-badge type-rental">Rental</span>';
    hHtml += '  <span class="return-task-id">' + escapeHtml(g.checkout_id) + '</span>';
    hHtml += '</div>';
    hHtml += '<h2>' + escapeHtml(g.customer_name) + '</h2>';
    hHtml += '<div class="detail-meta">';
    hHtml += '  ' + escapeHtml(g.customer_phone) + ' · Staff: ' + escapeHtml(g.checkout_staff_name);
    hHtml += '</div>';
    hHtml += '<div class="detail-meta">';
    hHtml += '  Checkout: ' + escapeHtml(g.date) + ' · Return: ' + escapeHtml(g.planned_return_date);
    if (g.planned_return_time) hHtml += ' (' + escapeHtml(g.planned_return_time) + ')';
    hHtml += '</div>';
    hHtml += '<div class="detail-meta">Deposit: ' + escapeHtml(g.deposit_type);
    if (g.deposit_amount) hHtml += ' ฿' + Number(g.deposit_amount).toLocaleString();
    hHtml += '</div>';
  }

  hHtml += '</div>';
  returnDetailHeader.innerHTML = hHtml;

  var iHtml = "";

  if (g.checkout_type === "Course") {
    iHtml = renderCourseReturnForm(g);
  } else {
    iHtml = renderOutdoorRentalReturnForm(g);
  }

  returnDetailItems.innerHTML = iHtml;

  if (g.checkout_type === "Course") {
    attachCourseReturnListeners();
    validateCourseReturn();
  } else {
    attachOutdoorRentalReturnListeners();
    validateOutdoorRentalReturn();
  }

  window.scrollTo(0, 0);
}


// ============================================================
// renderOutdoorRentalReturnForm — builds outdoor rental return inputs
// ============================================================

function renderOutdoorRentalReturnForm(g) {
  var today = new Date().toISOString().split("T")[0];
  var now = new Date();
  var hh = String(now.getHours());
  var mm = String(now.getMinutes());
  if (hh.length < 2) hh = "0" + hh;
  if (mm.length < 2) mm = "0" + mm;
  var currentTime = hh + ":" + mm;

  var html = '<div class="detail-card">';
  html += '<div class="return-form-header">';
  html += '  <div>';
  html += '    <h3>Return Outdoor Rental</h3>';
  html += '    <p>Record returned quantities, condition, charges, and deposit handling.</p>';
  html += '  </div>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '  <label for="rental-return-staff">Return Staff Name <span class="required">*</span></label>';
  html += '  <input type="text" id="rental-return-staff" class="return-text-input" placeholder="Your name" autocomplete="off" />';
  html += '</div>';

  html += '<div class="return-form-grid">';
  html += '  <div class="form-group">';
  html += '    <label for="rental-planned-return-date">Planned Return Date</label>';
  html += '    <input type="date" id="rental-planned-return-date" class="return-text-input" value="' + escapeHtml(normalizeDateValue(g.planned_return_date)) + '" readonly />';
  html += '  </div>';
  html += '  <div class="form-group">';
  html += '    <label for="rental-actual-return-date">Actual Return Date <span class="required">*</span></label>';
  html += '    <input type="date" id="rental-actual-return-date" class="return-text-input" value="' + today + '" />';
  html += '  </div>';
  html += '  <div class="form-group">';
  html += '    <label for="rental-actual-return-time">Actual Return Time <span class="required">*</span></label>';
  html += '    <input type="time" id="rental-actual-return-time" class="return-text-input" value="' + currentTime + '" />';
  html += '  </div>';
  html += '</div>';

  for (var i = 0; i < g.items.length; i++) {
    var item = g.items[i];
    var takenQty = Number(item.taken_qty) || 0;
    var policy = getRentalDamagePolicy(item.gear_name);
    var policyText = policy
      ? policy.label + " - " + formatTHB(policy.price) + (policy.perDraw ? " per draw" : "")
      : "No policy price found for this item.";
    var isQuickdraw = policy && policy.perDraw;

    html += '<div class="course-return-item rental-return-item" data-row="' + i + '">';
    html += '  <div class="course-return-main">';
    html += '    <div>';
    html += '      <div class="course-return-name">' + escapeHtml(item.gear_name) + '</div>';
    html += '      <div class="course-return-meta">';
    html += '        Taken: ' + takenQty;
    if (item.size) html += ' · Size: ' + escapeHtml(item.size);
    html += '      </div>';
    html += '    </div>';
    html += '    <div class="course-return-qty">';
    html += '      <label for="rental-return-qty-' + i + '">Returned</label>';
    html += '      <input type="number" id="rental-return-qty-' + i + '" class="return-qty-input rental-return-qty"';
    html += '        value="' + takenQty + '" min="0" max="' + takenQty + '" inputmode="numeric" data-row="' + i + '" />';
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="course-return-status" id="rental-return-status-' + i + '">Same amount: Yes</div>';
    html += '  <div class="rental-condition-grid">';
    html += '    <div class="form-group">';
    html += '      <label for="rental-condition-' + i + '">Condition</label>';
    html += '      <select id="rental-condition-' + i + '" class="return-select rental-condition" data-row="' + i + '">';
    html += '        <option value="Good" selected>Good</option>';
    html += '        <option value="Damaged">Damaged</option>';
    html += '        <option value="Lost">Lost</option>';
    html += '      </select>';
    html += '    </div>';
    html += '    <div class="form-group">';
    if (isQuickdraw) {
      html += '      <label for="rental-affected-qty-' + i + '">Damaged/Lost Draws</label>';
      html += '      <input type="number" id="rental-affected-qty-' + i + '" class="return-text-input rental-affected-qty" value="0" min="0" max="' + (takenQty * 15) + '" inputmode="numeric" data-row="' + i + '" />';
    } else {
      html += '      <label for="rental-affected-qty-' + i + '">Damaged/Lost Qty</label>';
      html += '      <input type="number" id="rental-affected-qty-' + i + '" class="return-text-input rental-affected-qty" value="0" min="0" max="' + takenQty + '" inputmode="numeric" data-row="' + i + '" />';
    }
    html += '      <div class="return-field-note">' + escapeHtml(policyText) + '</div>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';
  }

  html += '<div class="return-form-section-title">Late Return</div>';
  html += '<div class="rental-summary-grid">';
  html += '  <div class="rental-summary-box">';
  html += '    <span>Daily Rate of Rental Items Taken</span>';
  html += '    <strong id="rental-daily-total-display">0 THB</strong>';
  html += '  </div>';
  html += '  <div class="rental-summary-box">';
  html += '    <span>Extra Days</span>';
  html += '    <strong id="rental-extra-days-display">0 Days</strong>';
  html += '  </div>';
  html += '  <div class="rental-summary-box">';
  html += '    <span>Extra Charge</span>';
  html += '    <strong id="rental-extra-charge-display">0 THB</strong>';
  html += '  </div>';
  html += '</div>';
  html += '<input type="hidden" id="rental-extra-day-charge" value="0" />';
  html += '<input type="hidden" id="rental-late-return" value="No" />';

  html += '<div class="return-form-section-title">Damage/Loss Charge</div>';
  html += '<div class="form-group">';
  html += '  <label for="rental-damage-charge">Damage/Loss Charge</label>';
  html += '  <input type="number" id="rental-damage-charge" class="return-text-input rental-charge-input" value="0" min="0" readonly />';
  html += '  <div id="rental-damage-charge-note" class="return-field-note">Calculated from damaged, lost, or missing equipment.</div>';
  html += '</div>';

  html += '<div class="return-form-section-title">Deposit</div>';
  html += '<div class="return-field-note">Deposit type: ' + escapeHtml(g.deposit_type || "Not recorded") + '</div>';
  html += '<div class="return-form-grid">';
  if (String(g.deposit_type || "").toLowerCase() === "passport") {
    html += '  <div class="form-group">';
    html += '    <label for="rental-deposit-returned">Passport Returned <span class="required">*</span></label>';
    html += '    <select id="rental-deposit-returned" class="return-select">';
    html += '      <option value="Yes" selected>Yes</option>';
    html += '      <option value="No">No</option>';
    html += '    </select>';
    html += '  </div>';
    html += '  <div class="form-group">';
    html += '    <label for="rental-deposit-amount-returned">Charge Collected</label>';
    html += '    <input type="number" id="rental-deposit-amount-returned" class="return-text-input" value="0" min="0" inputmode="numeric" />';
    html += '  </div>';
  } else {
    html += '  <div class="form-group">';
    html += '    <label for="rental-deposit-returned">Deposit Returned <span class="required">*</span></label>';
    html += '    <select id="rental-deposit-returned" class="return-select">';
    html += '      <option value="Full" selected>Full</option>';
    html += '      <option value="Partial">Partial</option>';
    html += '      <option value="No">No</option>';
    html += '    </select>';
    html += '  </div>';
    html += '  <div class="form-group">';
    html += '    <label for="rental-deposit-amount-returned">Amount Returned</label>';
    html += '    <input type="number" id="rental-deposit-amount-returned" class="return-text-input" value="' + (Number(g.deposit_amount) || 0) + '" min="0" inputmode="numeric" />';
    html += '  </div>';
  }
  html += '  <div class="form-group">';
  html += '    <label for="rental-final-amount-due">Final Amount Due</label>';
  html += '    <input type="number" id="rental-final-amount-due" class="return-text-input" value="0" min="0" readonly />';
  html += '  </div>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '  <label for="rental-deposit-return-note">Deposit Return Note</label>';
  html += '  <textarea id="rental-deposit-return-note" class="return-textarea" placeholder="Only needed if deposit/passport was not fully returned"></textarea>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '  <label for="rental-return-issue">Issue Detail</label>';
  html += '  <textarea id="rental-return-issue" class="return-textarea" placeholder="Required for missing gear or damage/loss"></textarea>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '  <label for="rental-return-note">Return Notes</label>';
  html += '  <textarea id="rental-return-note" class="return-textarea" placeholder="Optional notes"></textarea>';
  html += '</div>';

  html += '<div id="rental-return-validation"></div>';
  html += '<button id="rental-return-submit" class="btn btn-primary btn-full" type="button">Submit Outdoor Rental Return</button>';
  html += '</div>';
  return html;
}


// ============================================================
// updateLateReturnCharge — auto-fills late return charge
// ============================================================

function updateLateReturnCharge() {
  if (!currentReturnGroup || currentReturnGroup.checkout_type === "Course") return;

  var actualDate = getFieldValue("rental-actual-return-date");
  var plannedDate = normalizeDateValue(currentReturnGroup.planned_return_date);
  var extraDays = getExtraReturnDays(plannedDate, actualDate);
  var dailyTotal = getOutdoorRentalDailyTotal();
  var charge = Math.max(extraDays * dailyTotal, 0);

  var lateEl = document.getElementById("rental-late-return");
  if (lateEl) lateEl.value = extraDays > 0 ? "Yes" : "No";

  var chargeEl = document.getElementById("rental-extra-day-charge");
  if (chargeEl) chargeEl.value = charge;

  setTextContent("rental-daily-total-display", formatTHB(dailyTotal));
  setTextContent("rental-extra-days-display", extraDays + (extraDays === 1 ? " Day" : " Days"));
  setTextContent("rental-extra-charge-display", formatTHB(charge));

  calculateOutdoorRentalReturnTotal();
}

function updateDamageLossCharge() {
  var result = calculateDamageLossCharge();
  var chargeEl = document.getElementById("rental-damage-charge");
  if (chargeEl) chargeEl.value = result.total;

  var noteEl = document.getElementById("rental-damage-charge-note");
  if (noteEl) {
    noteEl.textContent = result.details.length > 0
      ? result.details.join("; ")
      : "Calculated from damaged, lost, or missing equipment.";
  }

  calculateOutdoorRentalReturnTotal();
}


// ============================================================
// attachOutdoorRentalReturnListeners — watches rental return form
// ============================================================

function attachOutdoorRentalReturnListeners() {
  var watched = returnDetailItems.querySelectorAll("input, select, textarea");
  watched.forEach(function(el) {
    el.addEventListener("input", function() {
      if (el.id === "rental-actual-return-date") updateLateReturnCharge();
      if (isRentalDamageField(el)) updateDamageLossCharge();
      validateOutdoorRentalReturn();
    });
    el.addEventListener("change", function() {
      if (el.id === "rental-actual-return-date") updateLateReturnCharge();
      if (el.classList.contains("rental-condition")) ensureAffectedQtyForCondition(el);
      if (isRentalDamageField(el)) updateDamageLossCharge();
      validateOutdoorRentalReturn();
    });
  });

  var submitBtn = document.getElementById("rental-return-submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", function() {
      submitOutdoorRentalReturn();
    });
  }
  updateLateReturnCharge();
  updateDamageLossCharge();
}


// ============================================================
// calculateOutdoorRentalReturnTotal — sums return charges
// ============================================================

function calculateOutdoorRentalReturnTotal() {
  var extra = getMoneyValue("rental-extra-day-charge");
  var damage = getMoneyValue("rental-damage-charge");
  var total = Math.max(extra + damage, 0);
  var totalEl = document.getElementById("rental-final-amount-due");
  if (totalEl) totalEl.value = total;
  return total;
}


// ============================================================
// validateOutdoorRentalReturn — validates Step 28 rental rules
// ============================================================

function validateOutdoorRentalReturn() {
  if (!currentReturnGroup || currentReturnGroup.checkout_type === "Course") return false;

  var errors = [];
  var hasIssue = false;
  var needsIssueDetail = false;

  var staffEl = document.getElementById("rental-return-staff");
  var dateEl = document.getElementById("rental-actual-return-date");
  var timeEl = document.getElementById("rental-actual-return-time");
  var issueEl = document.getElementById("rental-return-issue");
  var depositReturnedEl = document.getElementById("rental-deposit-returned");
  var depositNoteEl = document.getElementById("rental-deposit-return-note");
  var isPassportDeposit = String(currentReturnGroup.deposit_type || "").toLowerCase() === "passport";

  if (!staffEl || staffEl.value.trim() === "") {
    errors.push("Return staff name is required.");
  }

  if (!dateEl || dateEl.value === "") {
    errors.push("Actual return date is required.");
  }

  if (!timeEl || timeEl.value === "") {
    errors.push("Actual return time is required.");
  }

  for (var i = 0; i < currentReturnGroup.items.length; i++) {
    var item = currentReturnGroup.items[i];
    var takenQty = Number(item.taken_qty) || 0;
    var input = document.getElementById("rental-return-qty-" + i);
    var returnedQty = input ? parseInt(input.value, 10) : NaN;
    var statusEl = document.getElementById("rental-return-status-" + i);
    var condition = getFieldValue("rental-condition-" + i);
    var affectedQty = parseInt(getFieldValue("rental-affected-qty-" + i), 10);
    if (isNaN(affectedQty) || affectedQty < 0) affectedQty = 0;
    var chargeQty = getRentalItemChargeQty(i, item, isNaN(returnedQty) ? 0 : returnedQty);

    if (isNaN(returnedQty) || returnedQty < 0) {
      errors.push("Returned quantities must be zero or more.");
      returnedQty = 0;
    }

    if (returnedQty > takenQty) {
      errors.push("Returned quantity cannot be greater than taken quantity.");
    }

    if (condition !== "Good" && affectedQty <= 0) {
      errors.push("Enter damaged/lost quantity for any item marked damaged or lost.");
    }

    if (statusEl) {
      if (returnedQty === takenQty && chargeQty === 0) {
        statusEl.textContent = "Same amount: Yes";
        statusEl.className = "course-return-status ok";
      } else {
        hasIssue = true;
        needsIssueDetail = true;
        statusEl.textContent = chargeQty > 0
          ? "Charge qty: " + chargeQty
          : "Same amount: No";
        statusEl.className = "course-return-status issue";
      }
    }
  }

  updateLateReturnCharge();
  updateDamageLossCharge();

  var lateReturn = getFieldValue("rental-late-return");
  var extraCharge = getMoneyValue("rental-extra-day-charge");
  var damageCharge = getMoneyValue("rental-damage-charge");
  var finalAmount = calculateOutdoorRentalReturnTotal();
  var depositReturned = depositReturnedEl ? depositReturnedEl.value : "";

  if (lateReturn === "Yes" || extraCharge > 0 || damageCharge > 0) {
    hasIssue = true;
  }

  if (damageCharge > 0) {
    needsIssueDetail = true;
  }

  if ((isPassportDeposit && depositReturned !== "Yes") ||
      (!isPassportDeposit && depositReturned !== "Full")) {
    hasIssue = true;
    if (!depositNoteEl || depositNoteEl.value.trim() === "") {
      errors.push(isPassportDeposit
        ? "Passport note is required if the passport was not returned."
        : "Deposit return note is required if deposit was not fully returned.");
    }
  }

  if (needsIssueDetail && (!issueEl || issueEl.value.trim() === "")) {
    errors.push("Issue detail is required for missing gear or damage/loss.");
  }

  if (finalAmount < 0) {
    errors.push("Final amount due cannot be negative.");
  }

  var validationEl = document.getElementById("rental-return-validation");
  var submitBtn = document.getElementById("rental-return-submit");

  if (errors.length > 0) {
    if (validationEl) {
      validationEl.innerHTML = '<div class="summary-error">⚠ ' + escapeHtml(errors[0]) + '</div>';
    }
    if (submitBtn) submitBtn.disabled = true;
    return false;
  }

  if (validationEl) {
    validationEl.innerHTML = hasIssue
      ? '<div class="summary-info">This return will be saved as Completed with Issue. Final amount due: ฿' + finalAmount.toLocaleString() + '.</div>'
      : '<div class="summary-ok">✓ Rental return is complete. This will be saved as Completed.</div>';
  }
  if (submitBtn) submitBtn.disabled = false;
  return true;
}


// ============================================================
// submitOutdoorRentalReturn — saves rental return rows
// ============================================================

async function submitOutdoorRentalReturn() {
  if (!validateOutdoorRentalReturn()) return;

  var submitBtn = document.getElementById("rental-return-submit");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
  }

  var issueDetail = getFieldValue("rental-return-issue").trim();
  var returnNote = getFieldValue("rental-return-note").trim();
  var damageLossSummary = buildDamageLossSummary();
  var savedIssueDetail = issueDetail;
  if (damageLossSummary) {
    savedIssueDetail = savedIssueDetail
      ? savedIssueDetail + " | Charges: " + damageLossSummary
      : "Charges: " + damageLossSummary;
  }
  var hasIssue = false;
  var rows = [];

  for (var i = 0; i < currentReturnGroup.items.length; i++) {
    var item = currentReturnGroup.items[i];
    var takenQty = Number(item.taken_qty) || 0;
    var returnedQty = parseInt(getFieldValue("rental-return-qty-" + i), 10);
    if (isNaN(returnedQty) || returnedQty < 0) returnedQty = 0;

    var sameAmount = returnedQty === takenQty;
    var itemChargeQty = getRentalItemChargeQty(i, item, returnedQty);
    if (!sameAmount || itemChargeQty > 0) hasIssue = true;

    rows.push({
      gear_type_id:  item.gear_type_id || "",
      gear_name:     item.gear_name,
      taken_qty:     takenQty,
      returned_qty:  returnedQty,
      same_amount:   sameAmount ? "Yes" : "No",
      issue_detail:  itemChargeQty > 0 || !sameAmount ? savedIssueDetail : "",
      return_note:   returnNote
    });
  }

  var lateReturn = getFieldValue("rental-late-return");
  var extraCharge = getMoneyValue("rental-extra-day-charge");
  var damageCharge = getMoneyValue("rental-damage-charge");
  var depositReturned = getFieldValue("rental-deposit-returned");
  var finalAmount = calculateOutdoorRentalReturnTotal();

  if (lateReturn === "Yes" || extraCharge > 0 || damageCharge > 0 ||
      (String(currentReturnGroup.deposit_type || "").toLowerCase() === "passport" && depositReturned !== "Yes") ||
      (String(currentReturnGroup.deposit_type || "").toLowerCase() !== "passport" && depositReturned !== "Full")) {
    hasIssue = true;
  }

  var returnStatus = hasIssue ? "Completed with Issue" : "Completed";

  var payload = {
    checkout_id:              currentReturnGroup.checkout_id,
    checkoutId:               currentReturnGroup.checkout_id,
    checkout_type:            "Outdoor Rental",
    date_returned:            getFieldValue("rental-actual-return-date"),
    actual_return_date:       getFieldValue("rental-actual-return-date"),
    actual_return_time:       getFieldValue("rental-actual-return-time"),
    return_staff_name:        getFieldValue("rental-return-staff").trim(),
    planned_return_date:      currentReturnGroup.planned_return_date || "",
    issue_detail:             savedIssueDetail,
    return_note:              returnNote,
    return_status:            returnStatus,
    status:                   returnStatus,
    late_return:              lateReturn,
    extra_day_charge:         extraCharge,
    dirty_condition_charge:   0,
    damage_or_loss_charge:    damageCharge,
    deposit_returned:         depositReturned,
    deposit_return_note:      getFieldValue("rental-deposit-return-note").trim(),
    deposit_amount_returned:  getMoneyValue("rental-deposit-amount-returned"),
    final_amount_due:         finalAmount,
    rows:                     rows
  };

  var result = await callAPI("submitReturn", payload, "POST");

  if (!result.success) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Outdoor Rental Return";
    }
    alert("Error: " + (result.error || "Unknown error"));
    return;
  }

  stepReturnDetail.classList.add("hidden");
  stepPendingReturns.classList.remove("hidden");
  pendingReturnsContainer.innerHTML =
    '<div class="status-message loading">Outdoor rental return saved. Refreshing pending returns…</div>';
  loadPendingReturns();
  window.scrollTo(0, 0);
}


// ============================================================
// getFieldValue / getMoneyValue — small return form helpers
// ============================================================

function getFieldValue(id) {
  var el = document.getElementById(id);
  return el ? el.value : "";
}

function getMoneyValue(id) {
  var val = parseFloat(getFieldValue(id));
  return (!isNaN(val) && val > 0) ? val : 0;
}

function setTextContent(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

function formatTHB(amount) {
  return (Number(amount) || 0).toLocaleString() + " THB";
}

function isRentalDamageField(el) {
  return el && (
    el.classList.contains("rental-return-qty") ||
    el.classList.contains("rental-condition") ||
    el.classList.contains("rental-affected-qty")
  );
}

function ensureAffectedQtyForCondition(conditionEl) {
  if (!conditionEl || conditionEl.value === "Good") return;
  var rowIndex = conditionEl.getAttribute("data-row");
  var qtyEl = document.getElementById("rental-affected-qty-" + rowIndex);
  if (!qtyEl) return;
  var currentQty = parseInt(qtyEl.value, 10);
  if (isNaN(currentQty) || currentQty <= 0) qtyEl.value = 1;
}

function getRentalDamagePolicy(gearName) {
  return RENTAL_DAMAGE_POLICY[gearName] || null;
}

function getRentalItemChargeQty(rowIndex, item, returnedQty) {
  var policy = getRentalDamagePolicy(item.gear_name);
  if (!policy) return 0;

  var takenQty = Number(item.taken_qty) || 0;
  var missingQty = Math.max(takenQty - returnedQty, 0);
  var condition = getFieldValue("rental-condition-" + rowIndex);
  var affectedQty = parseInt(getFieldValue("rental-affected-qty-" + rowIndex), 10);
  if (isNaN(affectedQty) || affectedQty < 0) affectedQty = 0;

  if (policy.perDraw) {
    return (missingQty * 15) + affectedQty;
  }

  return missingQty + (condition === "Good" ? 0 : affectedQty);
}

function calculateDamageLossCharge() {
  var result = { total: 0, details: [] };
  if (!currentReturnGroup || !currentReturnGroup.items) return result;

  for (var i = 0; i < currentReturnGroup.items.length; i++) {
    var item = currentReturnGroup.items[i];
    var policy = getRentalDamagePolicy(item.gear_name);
    if (!policy) continue;

    var takenQty = Number(item.taken_qty) || 0;
    var returnedQty = parseInt(getFieldValue("rental-return-qty-" + i), 10);
    if (isNaN(returnedQty) || returnedQty < 0) returnedQty = 0;

    var chargeQty = getRentalItemChargeQty(i, item, returnedQty);
    if (chargeQty <= 0) continue;

    var charge = chargeQty * policy.price;
    result.total += charge;
    result.details.push(item.gear_name + ": " + chargeQty + " × " + formatTHB(policy.price));
  }

  return result;
}

function buildDamageLossSummary() {
  if (!currentReturnGroup || !currentReturnGroup.items) return "";
  var parts = [];

  for (var i = 0; i < currentReturnGroup.items.length; i++) {
    var item = currentReturnGroup.items[i];
    var policy = getRentalDamagePolicy(item.gear_name);
    if (!policy) continue;

    var returnedQty = parseInt(getFieldValue("rental-return-qty-" + i), 10);
    if (isNaN(returnedQty) || returnedQty < 0) returnedQty = 0;

    var chargeQty = getRentalItemChargeQty(i, item, returnedQty);
    if (chargeQty <= 0) continue;

    var condition = getFieldValue("rental-condition-" + i);
    parts.push(item.gear_name + " - " + condition + "/Missing qty: " + chargeQty);
  }

  return parts.join("; ");
}

function getOutdoorRentalDailyTotal() {
  if (!currentReturnGroup || !currentReturnGroup.items) return 0;

  var total = 0;
  for (var i = 0; i < currentReturnGroup.items.length; i++) {
    var item = currentReturnGroup.items[i];
    var rate = Number(item.daily_rate) || 0;
    var qty = Number(item.taken_qty) || 0;
    total += rate * qty;
  }
  return total;
}

function getExtraReturnDays(plannedDate, actualDate) {
  if (!plannedDate || !actualDate) return 0;
  var planned = new Date(plannedDate + "T00:00:00");
  var actual = new Date(actualDate + "T00:00:00");
  if (isNaN(planned.getTime()) || isNaN(actual.getTime()) || actual <= planned) return 0;
  return Math.round((actual - planned) / (1000 * 60 * 60 * 24));
}

function normalizeDateValue(value) {
  if (!value) return "";
  var str = String(value);
  return str.length >= 10 ? str.slice(0, 10) : str;
}


// ============================================================
// renderCourseReturnForm — builds course return inputs
// ============================================================

function renderCourseReturnForm(g) {
  var html = '<div class="detail-card">';
  html += '<div class="return-form-header">';
  html += '  <div>';
  html += '    <h3>Return Course Gear</h3>';
  html += '    <p>Enter what came back. Matching quantities close the task as Completed.</p>';
  html += '  </div>';
  html += '</div>';

  for (var i = 0; i < g.items.length; i++) {
    var item = g.items[i];
    var takenQty = Number(item.taken_qty) || 0;

    html += '<div class="course-return-item" data-row="' + i + '">';
    html += '  <div class="course-return-main">';
    html += '    <div>';
    html += '      <div class="course-return-name">' + escapeHtml(item.gear_name) + '</div>';
    html += '      <div class="course-return-meta">Taken: ' + takenQty + '</div>';
    html += '    </div>';
    html += '    <div class="course-return-qty">';
    html += '      <label for="return-qty-' + i + '">Returned</label>';
    html += '      <input type="number" id="return-qty-' + i + '" class="return-qty-input"';
    html += '        value="' + takenQty + '" min="0" max="' + takenQty + '" inputmode="numeric" data-row="' + i + '" />';
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="course-return-status" id="return-status-' + i + '">Same amount: Yes</div>';
    html += '</div>';
  }

  html += '<div class="form-group">';
  html += '  <label for="course-return-issue">Issue Detail</label>';
  html += '  <textarea id="course-return-issue" class="return-textarea" placeholder="Required if anything is missing or damaged"></textarea>';
  html += '</div>';

  html += '<div class="form-group">';
  html += '  <label for="course-return-note">Return Notes</label>';
  html += '  <textarea id="course-return-note" class="return-textarea" placeholder="Optional notes"></textarea>';
  html += '</div>';

  html += '<div id="course-return-validation"></div>';
  html += '<button id="course-return-submit" class="btn btn-primary btn-full" type="button">Submit Course Return</button>';
  html += '</div>';

  return html;
}


// ============================================================
// attachCourseReturnListeners — watches course return fields
// ============================================================

function attachCourseReturnListeners() {
  var qtyInputs = returnDetailItems.querySelectorAll(".return-qty-input");
  qtyInputs.forEach(function(input) {
    input.addEventListener("input", function() {
      validateCourseReturn();
    });
  });

  var issueEl = document.getElementById("course-return-issue");
  if (issueEl) {
    issueEl.addEventListener("input", function() {
      validateCourseReturn();
    });
  }

  var submitBtn = document.getElementById("course-return-submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", function() {
      submitCourseReturn();
    });
  }
}


// ============================================================
// validateCourseReturn — validates Step 27 course return rules
// ============================================================

function validateCourseReturn() {
  if (!currentReturnGroup || currentReturnGroup.checkout_type !== "Course") return false;

  var errors = [];
  var hasIssue = false;

  for (var i = 0; i < currentReturnGroup.items.length; i++) {
    var item = currentReturnGroup.items[i];
    var takenQty = Number(item.taken_qty) || 0;
    var input = document.getElementById("return-qty-" + i);
    var returnedQty = input ? parseInt(input.value, 10) : NaN;
    var statusEl = document.getElementById("return-status-" + i);

    if (isNaN(returnedQty) || returnedQty < 0) {
      errors.push("Returned quantities must be zero or more.");
      returnedQty = 0;
    }

    if (returnedQty > takenQty) {
      errors.push("Returned quantity cannot be greater than taken quantity.");
    }

    if (statusEl) {
      if (returnedQty === takenQty) {
        statusEl.textContent = "Same amount: Yes";
        statusEl.className = "course-return-status ok";
      } else {
        hasIssue = true;
        statusEl.textContent = "Same amount: No";
        statusEl.className = "course-return-status issue";
      }
    }
  }

  var issueEl = document.getElementById("course-return-issue");
  var issueDetail = issueEl ? issueEl.value.trim() : "";

  if (hasIssue && issueDetail === "") {
    errors.push("Issue detail is required when a returned quantity does not match.");
  }

  var validationEl = document.getElementById("course-return-validation");
  var submitBtn = document.getElementById("course-return-submit");

  if (errors.length > 0) {
    if (validationEl) {
      validationEl.innerHTML = '<div class="summary-error">⚠ ' + escapeHtml(errors[0]) + '</div>';
    }
    if (submitBtn) submitBtn.disabled = true;
    return false;
  }

  if (validationEl) {
    validationEl.innerHTML = hasIssue
      ? '<div class="summary-info">This return will be saved as Completed with Issue.</div>'
      : '<div class="summary-ok">✓ All quantities match. This return will be saved as Completed.</div>';
  }
  if (submitBtn) submitBtn.disabled = false;
  return true;
}


// ============================================================
// submitCourseReturn — saves course return rows and closes task
// ============================================================

async function submitCourseReturn() {
  if (!validateCourseReturn()) return;

  var submitBtn = document.getElementById("course-return-submit");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
  }

  var issueEl = document.getElementById("course-return-issue");
  var noteEl = document.getElementById("course-return-note");
  var issueDetail = issueEl ? issueEl.value.trim() : "";
  var returnNote = noteEl ? noteEl.value.trim() : "";
  var hasIssue = false;
  var rows = [];

  for (var i = 0; i < currentReturnGroup.items.length; i++) {
    var item = currentReturnGroup.items[i];
    var takenQty = Number(item.taken_qty) || 0;
    var input = document.getElementById("return-qty-" + i);
    var returnedQty = input ? parseInt(input.value, 10) : 0;
    if (isNaN(returnedQty) || returnedQty < 0) returnedQty = 0;

    var sameAmount = returnedQty === takenQty;
    if (!sameAmount) hasIssue = true;

    rows.push({
      gear_type_id:  item.gear_type_id || "",
      gear_name:     item.gear_name,
      taken_qty:     takenQty,
      returned_qty:  returnedQty,
      same_amount:   sameAmount ? "Yes" : "No",
      issue_detail:  sameAmount ? "" : issueDetail,
      return_note:   returnNote
    });
  }

  var today = new Date().toISOString().split("T")[0];
  var returnStatus = hasIssue ? "Completed with Issue" : "Completed";

  var payload = {
    checkout_id:       currentReturnGroup.checkout_id,
    checkoutId:        currentReturnGroup.checkout_id,
    checkout_type:     "Course",
    date_returned:     today,
    actual_return_date: today,
    guide_name:        currentReturnGroup.guide_name,
    course_id:         currentReturnGroup.course_id,
    course_name:       currentReturnGroup.course_name,
    issue_detail:      issueDetail,
    return_note:       returnNote,
    return_status:     returnStatus,
    status:            returnStatus,
    rows:              rows
  };

  var result = await callAPI("submitReturn", payload, "POST");

  if (!result.success) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Course Return";
    }
    alert("Error: " + (result.error || "Unknown error"));
    return;
  }

  stepReturnDetail.classList.add("hidden");
  stepPendingReturns.classList.remove("hidden");
  pendingReturnsContainer.innerHTML =
    '<div class="status-message loading">Course return saved. Refreshing pending returns…</div>';
  loadPendingReturns();
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
