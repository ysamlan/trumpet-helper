import { renderStaff, displayKeySignature } from './staff.js';
import { renderTrumpetSVG } from './trumpet.js';
import { initAudio } from './audio.js';
import { initAccidentalControls, resetAccidentalButtons, initAlternateFingeringControls } from './controls.js'; // Import alt fingering controls
import { keySignatures } from './data.js';
import { renderRadialMenu } from './key_selector.js';

// --- Application State ---
let currentKeySignature = "C Major"; // Default key signature
let selectedAccidental = null; // 'natural', 'sharp', 'flat', or null
let keySelectorMode = 'sharps'; // 'sharps' or 'flats' for the radial menu

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

        updateChangeKeyButtonText(); // Update button text
    } else {
        console.warn(`Attempted to set invalid key signature: ${keyName}`);
    }
}

/**
 * Gets the currently selected accidental override.
 * @returns {string | null} 'natural', 'sharp', 'flat', or null.
 */
export function getSelectedAccidental() {
    return selectedAccidental;
}

/**
 * Sets the selected accidental override state.
 * @param {string | null} accidentalType - 'natural', 'sharp', 'flat', or null.
 */
export function setSelectedAccidental(accidentalType) {
    if (['natural', 'sharp', 'flat', null].includes(accidentalType)) {
        selectedAccidental = accidentalType;
        console.log(`Selected accidental override set to: ${selectedAccidental}`);
        // Future: Could potentially update cursor appearance here
    } else {
        console.warn(`Attempted to set invalid accidental override: ${accidentalType}`);
    }
}


/**
 * Handles the selection of an accidental override.
 * (Will be fully implemented in Task 4.5 to update app state)
 * @param {string | null} accidentalType - 'natural', 'sharp', 'flat', or null if deselected.
 */
function handleAccidentalSelection(accidentalType) {
    console.log(`[App] Accidental selected via controls: ${accidentalType}`);
    setSelectedAccidental(accidentalType);
}

/**
 * Handles the selection of a key signature from the radial menu.
 * @param {string} keyName - The selected key signature name (e.g., "G Major").
 */
function handleKeySelection(keyName) {
    console.log(`[App] Key selected via modal: ${keyName}`);
    setCurrentKeySignature(keyName);
    hideKeyPopup();
}

/**
 * Toggles the display mode (sharps/flats) of the key signature selector.
 */
function toggleKeySelectorMode() {
    keySelectorMode = (keySelectorMode === 'sharps') ? 'flats' : 'sharps';
    console.log(`[App] Toggling key selector mode to: ${keySelectorMode}`);
    // Re-render the menu with the new mode
    renderRadialMenu('key-selection-area', keySelectorMode, handleKeySelection, toggleKeySelectorMode);
}

/**
 * Updates the text of the "Change Key" button.
 */
function updateChangeKeyButtonText() {
    const btn = document.getElementById('change-key-btn');
    if (btn) {
        btn.textContent = getCurrentKeySignature();
    }
}

/**
 * Shows the key signature selection popup.
 */
function showKeyPopup() {
    const popup = document.getElementById('key-popup');
    if (popup) {
        popup.classList.remove('hidden');
        console.log("Key signature popup shown.");
        // Render the radial menu when the popup is shown
        renderRadialMenu('key-selection-area', keySelectorMode, handleKeySelection, toggleKeySelectorMode);
    }
}

/**
 * Hides the key signature selection popup.
 */
function hideKeyPopup() {
    const popup = document.getElementById('key-popup');
    if (popup) {
        popup.classList.add('hidden');
        console.log("Key signature popup hidden.");
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

    // Initialize Controls
    initAccidentalControls(handleAccidentalSelection);
    initAlternateFingeringControls(); // Initialize alternate fingering buttons
    updateChangeKeyButtonText(); // Set initial button text

    // --- Initialize Modal ---
    const changeKeyBtn = document.getElementById('change-key-btn');
    const keyPopupOverlay = document.getElementById('key-popup-overlay');
    const keyPopupCloseBtn = document.getElementById('key-popup-close');

    if (changeKeyBtn) {
        changeKeyBtn.addEventListener('click', showKeyPopup);
    }
    if (keyPopupOverlay) {
        keyPopupOverlay.addEventListener('click', hideKeyPopup);
    }
    if (keyPopupCloseBtn) {
        keyPopupCloseBtn.addEventListener('click', hideKeyPopup);
    }


    console.log("Application initialized (audio loading in background).");
}

// Wait for the DOM to be ready before running the initialization code
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOMContentLoaded has already fired
    initializeApp();
}
