import { renderStaff } from './staff.js';
import { renderTrumpetSVG } from './trumpet.js';
import { initAudio } from './audio.js';
// Future imports will go here (e.g., controls)
import { keySignatures } from './data.js'; // Import for validation

// --- Application State ---
let currentKeySignature = "C Major"; // Default key signature

/**
 * Gets the currently selected key signature name.
 * @returns {string} The name of the current key signature (e.g., "C Major", "G Major").
 */
export function getCurrentKeySignature() {
    return currentKeySignature;
}

/**
 * Sets the current key signature.
 * @param {string} keyName - The name of the key signature to set.
 */
export function setCurrentKeySignature(keyName) {
    if (keySignatures[keyName]) {
        currentKeySignature = keyName;
        console.log(`Key signature set to: ${currentKeySignature}`);
        // Future: Update key signature display on staff (Task 4.3)
        // Future: Update change key button text (Task 4.8)
    } else {
        console.warn(`Attempted to set invalid key signature: ${keyName}`);
    }
}


/**
 * Initializes the application.
 * Waits for the DOM to be fully loaded.
 */
async function initializeApp() { // Make async to await SVG rendering
    console.log("Initializing Trumpet Fingering Helper...");

    // Render the initial UI components
    renderStaff('staff-area');
    await renderTrumpetSVG('trumpet-area'); // Wait for SVG to load and render

    // Initialize Audio (async, handles loading internally)
    initAudio()
        .then(() => {
            console.log("Audio system initialized successfully.");
            // You could enable audio-dependent UI elements here if needed
        })
        .catch(error => {
            console.error("Audio system initialization failed:", error);
            // Display a message to the user or disable audio features
            // Example: document.getElementById('audio-error-message').textContent = "Audio failed to load.";
        });

    // initControls(); // Future step

    console.log("Application initialized (audio loading in background).");
}

// Wait for the DOM to be ready before running the initialization code
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOMContentLoaded has already fired
    initializeApp();
}
