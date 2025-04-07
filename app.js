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
let announcerTimeout = null; // Timeout ID for clearing the announcer

/**
 * Updates the aria-live region with a message for screen readers.
 * Debounces messages slightly to prevent rapid-fire announcements.
 * @param {string} message - The message to announce.
 */
export function announce(message) {
    const announcer = document.getElementById('aria-announcer');
    if (announcer) {
        // Clear previous timeout if exists
        if (announcerTimeout) {
            clearTimeout(announcerTimeout);
        }
        // Update immediately
        announcer.textContent = message;
        // Set a timeout to clear the announcer after a short delay
        // This helps ensure repeated announcements of the same thing are read
        announcerTimeout = setTimeout(() => {
            if (announcer.textContent === message) { // Only clear if it hasn't changed again
                announcer.textContent = '';
            }
            announcerTimeout = null;
        }, 1500); // Clear after 1.5 seconds
    } else {
        console.warn("Aria announcer element not found.");
    }
}


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

        // Update key signature display on staff
        const staffSvg = document.getElementById('staff-area')?.querySelector('svg');
        if (staffSvg) {
            displayKeySignature(currentKeySignature, staffSvg);
        } else {
            console.warn("Could not find staff SVG to update key signature display.");
        }

        updateChangeKeyButtonText(); // Update button text
        // Format key name for announcement
        const displayKeyName = currentKeySignature.replace('#', '♯').replace('b', '♭');
        announce(`Key signature set to ${displayKeyName}`); // Announce change
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
    setSelectedAccidental(accidentalType);
    if (accidentalType) {
        announce(`${accidentalType.charAt(0).toUpperCase() + accidentalType.slice(1)} override selected`);
    } else {
        // Optionally announce deselection, or stay silent
        // announce("Accidental override cleared");
    }
}

/**
 * Handles the selection of a key signature from the radial menu.
 * @param {string} keyName - The selected key signature name (e.g., "G Major").
 */
function handleKeySelection(keyName) {
    setCurrentKeySignature(keyName);
    hideKeyPopup();
}

/**
 * Toggles the display mode (sharps/flats) of the key signature selector.
 */
function toggleKeySelectorMode() {
    keySelectorMode = (keySelectorMode === 'sharps') ? 'flats' : 'sharps';
    // Re-render the menu with the new mode
    renderRadialMenu('key-selection-area', keySelectorMode, handleKeySelection, toggleKeySelectorMode);
}

/**
 * Updates the text of the "Change Key" button.
 */
function updateChangeKeyButtonText() {
    const btn = document.getElementById('change-key-btn');
    if (btn) {
        const fullKeyName = getCurrentKeySignature();
        // Extract the root note part (e.g., "C" from "C Major", "Bb" from "Bb Major")
        let keyRoot = fullKeyName.split(' ')[0];
        // Replace ASCII accidentals with proper symbols for display
        const displayKeyRoot = keyRoot.replace('#', '♯').replace('b', '♭');
        btn.textContent = `Key: ${displayKeyRoot}`; // Set text like "Key: C", "Key: F♯"
    }
}

/**
 * Shows the key signature selection popup.
 */
function showKeyPopup() {
    const popup = document.getElementById('key-popup');
    if (popup) {
        popup.classList.remove('hidden');
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

    // Initialize About Section Toggle
    initAboutSectionToggle();

    console.log("Application initialized (audio loading in background).");
}

// Wait for the DOM to be ready before running the initialization code
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOMContentLoaded has already fired
    initializeApp();
}

/**
 * Initializes the toggle functionality for the About section.
 */
function initAboutSectionToggle() {
    const toggleButton = document.getElementById('about-toggle');
    const contentDiv = document.getElementById('about-content');
    const indicator = toggleButton?.querySelector('.toggle-indicator'); // Get indicator span

    if (!toggleButton || !contentDiv || !indicator) {
        console.warn('About section toggle elements not found.');
        return;
    }

    toggleButton.addEventListener('click', () => {
        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';

        // Toggle ARIA attributes
        toggleButton.setAttribute('aria-expanded', !isExpanded);
        contentDiv.setAttribute('aria-hidden', isExpanded);

        // Update indicator text (optional, CSS handles rotation)
        // indicator.textContent = isExpanded ? '►' : '▼';

        // Announce state change
        announce(`About section ${isExpanded ? 'collapsed' : 'expanded'}`);
    });

    // Ensure initial state matches HTML (optional, but good practice)
    const initiallyExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
    contentDiv.setAttribute('aria-hidden', !initiallyExpanded);
    // indicator.textContent = initiallyExpanded ? '▼' : '►';
}
