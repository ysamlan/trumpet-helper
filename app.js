import { renderStaff } from './staff.js';
import { renderTrumpetSVG } from './trumpet.js';
// Future imports will go here (e.g., audio, data, controls)

/**
 * Initializes the application.
 * Waits for the DOM to be fully loaded.
 */
async function initializeApp() { // Make async to await SVG rendering
    console.log("Initializing Trumpet Fingering Helper...");

    // Render the initial UI components
    renderStaff('staff-area');
    await renderTrumpetSVG('trumpet-area'); // Wait for SVG to load and render
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
