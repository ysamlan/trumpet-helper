/**
 * @fileoverview
 * Renders the radial key signature selection menu.
 */

import { keySignatures } from './data.js';

const RADIUS = 100; // Radius of the circle for key buttons
const CENTER_X = 150; // Center X of the container (relative)
const CENTER_Y = 110; // Center Y of the container (relative)
const BUTTON_RADIUS = 25; // Radius of each key button
const TOGGLE_BUTTON_SIZE = 60; // Size of the central toggle button
const INFO_DISPLAY_Y_OFFSET = 35; // Offset below the center for hover info

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
    container.style.width = `${CENTER_X * 2}px`;
    container.style.height = `${CENTER_Y * 2}px`;
    container.style.margin = 'auto';

    // Add info display element
    const infoDisplay = document.createElement('div');
    infoDisplay.id = 'key-info-display';
    container.appendChild(infoDisplay);

    const keysToShow = Object.entries(keySignatures).filter(([keyName, keyInfo]) => {
        if (keyInfo.accidental === null) return true; // Always show C Major (0 accidentals)
        return mode === 'sharps' ? keyInfo.accidental === '#' : keyInfo.accidental === 'b';
    });

    // Sort keys based on the number of accidentals for Circle of Fifths layout
    keysToShow.sort(([, a], [, b]) => {
        const countA = a.notes.length;
        const countB = b.notes.length;
        // For flats, reverse the sort order (more flats = counter-clockwise)
        // Sort by number of accidentals (flats reversed)
        return mode === 'flats' ? countB - countA : countA - countB;
    });

    // Find C Major's index in the sorted list to calculate offset
    const cMajorIndex = keysToShow.findIndex(([keyName]) => keyName === "C Major");
    const angleStep = (2 * Math.PI) / keysToShow.length;
    // Calculate offset needed to place C Major at the top (-PI/2)
    const angleOffset = -(cMajorIndex * angleStep);

    keysToShow.forEach(([keyName, keyInfo], index) => {
        // Calculate angle with offset to place C Major at the top
        const angle = -Math.PI / 2 + index * angleStep + angleOffset;
        const x = CENTER_X + RADIUS * Math.cos(angle) - BUTTON_RADIUS;
        const y = CENTER_Y + RADIUS * Math.sin(angle) - BUTTON_RADIUS;

        const button = document.createElement('button');
        button.classList.add('key-option-btn');
        // Simplify display name (e.g., "G Major" -> "G") and format accidentals
        const simpleKeyName = keyName.split(' ')[0];
        const displayKeyName = simpleKeyName.replace('#', '♯').replace('b', '♭');
        button.textContent = displayKeyName; // Use formatted name for button text
        button.dataset.keyname = keyName; // Store original name in dataset
        // Format full key name for aria-label
        const displayFullKeyName = keyName.replace('#', '♯').replace('b', '♭');
        button.setAttribute('aria-label', `Select ${displayFullKeyName}`);
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;

        button.addEventListener('click', () => {
            keySelectCallback(keyName);
        });

        // Add hover listeners for info display
        button.addEventListener('mouseover', () => {
            const numAccidentals = keyInfo.notes.length;
            // Use proper symbols for info display
            const accidentalSymbol = keyInfo.accidental === '#' ? '♯' : (keyInfo.accidental === 'b' ? '♭' : '');
            infoDisplay.textContent = numAccidentals > 0 ? `${numAccidentals} ${accidentalSymbol}` : '0';
        });
        button.addEventListener('mouseout', () => {
            infoDisplay.textContent = ''; // Clear on mouse out
        });


        container.appendChild(button);
    });

    // Add central toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'key-mode-toggle';
    // Use proper symbols for toggle button text and labels
    const currentSymbol = mode === 'sharps' ? '♯' : '♭';
    const otherSymbol = mode === 'sharps' ? '♭' : '♯';
    const toggleActionLabel = `Switch to ${otherSymbol} Keys`;
    toggleButton.textContent = currentSymbol; // Show symbol for current mode
    toggleButton.title = toggleActionLabel; // Keep title for tooltips
    toggleButton.setAttribute('aria-label', toggleActionLabel); // Use formatted label
    toggleButton.style.left = `${CENTER_X - TOGGLE_BUTTON_SIZE / 2}px`;
    toggleButton.style.top = `${CENTER_Y - TOGGLE_BUTTON_SIZE / 2}px`;

    toggleButton.addEventListener('click', toggleModeCallback); // Wire up toggle callback

    container.appendChild(toggleButton);

}
