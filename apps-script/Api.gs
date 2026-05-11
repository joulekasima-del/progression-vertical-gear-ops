/*
 * Api.gs
 * App-specific API functions called by Code.gs routing.
 *
 * Contains:
 *   - loadGearByCategory    → reads GEAR_MASTER by category
 *   - loadCourses           → reads COURSE_MASTER
 *   - loadCourseGearTemplate → reads COURSE_GEAR_TEMPLATE by course
 *   - loadOutdoorRentalItems → reads OUTDOOR_RENTAL_MASTER
 *   - submitInspection      → writes to INSPECTION_LOG + RETIRED_GEAR_LOG
 *   - submitCheckout        → writes to CHECKOUT_LOG (course type)
 *   - submitOutdoorRental   → writes to CHECKOUT_LOG (outdoor rental type)
 *   - loadPendingReturns    → reads CHECKOUT_LOG where status = Pending Return
 *   - submitReturn          → writes to RETURN_LOG + updates CHECKOUT_LOG status
 *   - loadDashboard         → reads logs for dashboard summary
 *
 * Each function receives parameters from the frontend
 * and uses Sheets.gs helpers to read/write data.
 */

// API functions will be built here
