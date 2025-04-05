/**
 * @fileoverview
 * Renders the radial key signature selection menu.
 */

import { keySignatures } from './data.js';

const RADIUS = 120; // Radius of the circle for key buttons
const CENTER_X = 150; // Center X of the container (relative)
const CENTER_Y = 110; // Center Y of the container (relative)
const BUTTON_RADIUS = 25; // Radius of each key button
const TOGGLE_BUTTON_SIZE = 60; // Size of the central toggle button

/**
 * Renders the radial key signature selection menu.
 * @param {string} containerId - The ID of the container element (#key-selection-area).
 * @param {'sharps' | 'flats'} mode - Which set of keys to display ('sharps' or 'flats').
 * @param {function(string)} keySelectCallback - Function to call when a key is selected.
 * @param {function()} toggleModeCallback - Function to call when the mode toggle is clicked.
 */
export function renderRadialMenu(containerId, mode, keySelectCallback, toggleModeCallback) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Key selection container #${containerId} not found.`);
        return;
    }
    container.innerHTML = ''; // Clear previous content (like placeholder)
    container.style.position = 'relative'; // Needed for absolute positioning of buttons
    container.style.width = `${CENTER_X * 2}px`; // Set container size based on layout
    container.style.height = `${CENTER_Y * 2}px`;
    container.style.margin = 'auto'; // Center the container if needed

    const keysToShow = Object.entries(keySignatures).filter(([keyName, keyInfo]) => {
        if (keyInfo.accidental === null) return true; // Always show C Major
        return mode === 'sharps' ? keyInfo.accidental === '#' : keyInfo.accidental === 'b';
    });

    // Sort keys based on the number of accidentals for Circle of Fifths layout
    keysToShow.sort(([, a], [, b]) => {
        const countA = a.notes.length;
        const countB = b.notes.length;
        // For flats, reverse the sort order (more flats = counter-clockwise)
        return mode === 'flats' ? countB - countA : countA - countB;
    });

    const angleStep = (2 * Math.PI) / keysToShow.length;

    keysToShow.forEach(([keyName, keyInfo], index) => {
        // Start at the top (12 o'clock) and go clockwise
        const angle = -Math.PI / 2 + index * angleStep;
        const x = CENTER_X + RADIUS * Math.cos(angle) - BUTTON_RADIUS;
        const y = CENTER_Y + RADIUS * Math.sin(angle) - BUTTON_RADIUS;

        const button = document.createElement('button');
        button.classList.add('key-option-btn');
        // Simplify display name (e.g., "G Major" -> "G")
        const displayName = keyName.split(' ')[0];
        button.textContent = displayName;
        button.dataset.keyname = keyName;
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;

        button.addEventListener('click', () => {
            keySelectCallback(keyName);
        });

        container.appendChild(button);
    });

    // Add central toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'key-mode-toggle';
    // Show the symbol for the CURRENT mode, title describes the action (switch to other mode)
    toggleButton.textContent = mode === 'sharps' ? '♯' : '♭';
    toggleButton.title = mode === 'sharps' ? 'Switch to Flat Keys' : 'Switch to Sharp Keys';
    toggleButton.style.left = `${CENTER_X - TOGGLE_BUTTON_SIZE / 2}px`;
    toggleButton.style.top = `${CENTER_Y - TOGGLE_BUTTON_SIZE / 2}px`;

    toggleButton.addEventListener('click', toggleModeCallback); // Wire up toggle callback

    container.appendChild(toggleButton);

    console.log(`Rendered radial menu for ${mode} keys.`);
}
