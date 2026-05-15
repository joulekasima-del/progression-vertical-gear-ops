/*
 * ============================================================
 * rental-agreement.js
 * Progression Vertical Operations System
 *
 * Loads checkout data by ID and renders the rental agreement.
 * Opens from: gear-checkout-return after outdoor rental submit.
 * URL format: rental-agreement.html?id=CHK-001
 * ============================================================
 */

(async function() {

  // --- Get checkout_id from URL ---
  var params = new URLSearchParams(window.location.search);
  var checkoutId = params.get("id");

  var loadingEl = document.getElementById("loading");
  var errorScreen = document.getElementById("error-screen");
  var errorMessage = document.getElementById("error-message");
  var agreementEl = document.getElementById("agreement");

  if (!checkoutId) {
    showError("No checkout ID provided. Open this page from the rental check-out form.");
    return;
  }

  // --- Load checkout data from API ---
  var result = await callAPI("loadCheckoutById", { checkoutId: checkoutId });

  if (!result.success) {
    showError(result.error || "Could not load checkout data.");
    return;
  }

  if (!result.data || result.data.length === 0) {
    showError("No data found for checkout ID: " + checkoutId);
    return;
  }

  // --- Use the first row for shared fields ---
  var rows = result.data;
  var info = rows[0];

  // --- Populate header ---
  setText("ag-id", checkoutId);
  setText("ag-date", formatDisplayDate(info.date));

  // --- Customer ---
  setText("ag-customer-name", info.customer_name || "—");
  setText("ag-customer-email", info.customer_email || "—");
  setText("ag-customer-phone", info.customer_phone || "—");

  // --- Rental period ---
  setText("ag-checkout-date", formatDisplayDate(info.date));
  var returnText = formatDisplayDate(info.planned_return_date);
  if (info.planned_return_time) {
    returnText += " (" + info.planned_return_time + ")";
  }
  setText("ag-return-date", returnText);
  setText("ag-rental-days", info.rental_days ? info.rental_days + " day" + (Number(info.rental_days) > 1 ? "s" : "") : "—");

  // --- Items table ---
  var itemsBody = document.getElementById("ag-items");
  var html = "";

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    html += "<tr>";
    html += "<td>" + escapeHtml(row.gear_name || "") + "</td>";
    html += "<td>" + escapeHtml(row.size || "—") + "</td>";
    html += '<td class="num">' + (row.taken_qty || 0) + "</td>";
    html += '<td class="num">฿' + Number(row.daily_rate || 0).toLocaleString() + "</td>";
    html += '<td class="num">฿' + Number(row.item_total || 0).toLocaleString() + "</td>";
    html += "</tr>";
  }

  itemsBody.innerHTML = html;

  // --- Pricing ---
  var subtotal = Number(info.subtotal_amount || 0);
  var discount = Number(info.discount_amount || 0);
  var total = Number(info.total_amount || 0);

  setText("ag-subtotal", "฿" + subtotal.toLocaleString());
  setText("ag-total", "฿" + total.toLocaleString());

  if (discount > 0) {
    var discountRow = document.getElementById("ag-discount-row");
    discountRow.classList.remove("hidden");
    setText("ag-discount-label", info.discount_type || "");
    setText("ag-discount", "-฿" + discount.toLocaleString());
  }

  // --- Deposit ---
  setText("ag-deposit-type", info.deposit_type || "—");

  var amountRow = document.getElementById("ag-deposit-amount-row");
  var noteRow = document.getElementById("ag-deposit-note-row");

  if (info.deposit_type === "Cash" && info.deposit_amount) {
    setText("ag-deposit-amount", "฿" + Number(info.deposit_amount).toLocaleString());
    amountRow.style.display = "";
  } else {
    amountRow.style.display = "none";
  }

  if (info.deposit_note) {
    setText("ag-deposit-note", info.deposit_note);
    noteRow.style.display = "";
  } else {
    noteRow.style.display = "none";
  }

  // --- Staff ---
  setText("ag-staff-name", info.checkout_staff_name || "—");

  // --- Show agreement, hide loading ---
  loadingEl.classList.add("hidden");
  agreementEl.classList.remove("hidden");


  // === Helpers ===

  function showError(msg) {
    loadingEl.classList.add("hidden");
    errorMessage.textContent = msg;
    errorScreen.classList.remove("hidden");
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function formatDisplayDate(dateVal) {
    if (!dateVal) return "—";

    var d;

    // Handle ISO strings like "2026-05-14T17:00:00.000Z"
    // and simple date strings like "2026-05-14"
    var str = String(dateVal);
    if (str.indexOf("T") > -1 || str.indexOf("-") > -1) {
      d = new Date(str);
    } else if (dateVal instanceof Date) {
      d = dateVal;
    } else {
      return str;
    }

    // Check valid date
    if (isNaN(d.getTime())) return str;

    // Format: "14 May 2026"
    var months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
    var day = d.getDate();
    var month = months[d.getMonth()];
    var year = d.getFullYear();

    return day + " " + month + " " + year;
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

})();
