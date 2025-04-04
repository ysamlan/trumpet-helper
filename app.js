import { renderStaff } from './staff.js';
// Future imports will go here (e.g., trumpet, audio, data, controls)

/**
 * Initializes the application.
 * Waits for the DOM to be fully loaded.
 */
function initializeApp() {
    console.log("Initializing Trumpet Fingering Helper...");

    // Render the initial UI components
    renderStaff('staff-area');
    // renderTrumpetSVG('trumpet-area'); // Future step
    // initAudio(); // Future step
    // initControls(); // Future step

    console.log("Application initialized.");
}

// Wait for the DOM to be ready before running the initialization code
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOMContentLoaded has already fired
    initializeApp();
}
