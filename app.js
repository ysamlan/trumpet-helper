import { renderStaff, displayKeySignature } from './staff.js';
import { renderTrumpetSVG } from './trumpet.js';
import { initAudio } from './audio.js';
import { initAccidentalControls, resetAccidentalButtons } from './controls.js'; // Import controls
import { keySignatures } from './data.js';

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

        // Update key signature display on staff
        const staffSvg = document.getElementById('staff-area')?.querySelector('svg');
        if (staffSvg) {
            displayKeySignature(currentKeySignature, staffSvg);
        } else {
            console.warn("Could not find staff SVG to update key signature display.");
        }

        // Future: Update change key button text (Task 4.8)
    } else {
        console.warn(`Attempted to set invalid key signature: ${keyName}`);
    }
}

/**
 * Handles the selection of an accidental override.
 * (Will be fully implemented in Task 4.5 to update app state)
 * @param {string | null} accidentalType - 'natural', 'sharp', 'flat', or null if deselected.
 */
function handleAccidentalSelection(accidentalType) {
    console.log(`[App] Accidental selected via controls: ${accidentalType}`);
    // TODO (Task 4.5): Update selectedAccidental state here
    // setSelectedAccidental(accidentalType);
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

    // Initialize Controls
    initAccidentalControls(handleAccidentalSelection);

    console.log("Application initialized (audio loading in background).");
}

// Wait for the DOM to be ready before running the initialization code
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOMContentLoaded has already fired
    initializeApp();
}
