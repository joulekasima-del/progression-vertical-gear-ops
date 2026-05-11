/*
 * Code.gs
 * Main entry point for the Apps Script web app.
 *
 * Handles:
 *   - doGet(e)  → handles GET requests from the frontend
 *   - doPost(e) → handles POST requests from the frontend
 *   - JSON response formatting
 *   - API action routing (sends each action to the right function)
 *   - Simple backend test functions
 *
 * The frontend sends an "action" parameter to tell this file
 * which function to call (e.g., action=loadGearByCategory).
 */

// HTTP handlers and routing will be built here
