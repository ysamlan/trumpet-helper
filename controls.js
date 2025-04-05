/**
 * @fileoverview
 * Manages UI controls like accidental buttons.
 */

const ACCIDENTAL_NATURAL = "\u266E";
const ACCIDENTAL_SHARP = "\u266F";
const ACCIDENTAL_FLAT = "\u266D";

const controlsContainerId = 'accidental-controls'; // ID of the button container

/**
 * Initializes the accidental selection buttons.
 * @param {function(string | null)} callback - Function to call when an accidental is selected.
 *                                             Receives 'natural', 'sharp', 'flat', or null.
 */
export function initAccidentalControls(callback) {
    const container = document.getElementById(controlsContainerId);
    if (!container) {
        console.error(`Accidental controls container #${controlsContainerId} not found.`);
        return;
    }

    container.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button || !button.dataset.accidental) {
            return; // Click wasn't on a button or button lacks data attribute
        }

        const selectedAccidental = button.dataset.accidental;
        let newActiveState = true;

        // Toggle behavior: If the clicked button is already active, deactivate it.
        if (button.classList.contains('active')) {
            button.classList.remove('active');
            newActiveState = false;
            console.log(`Accidental deselected: ${selectedAccidental}`);
            callback(null); // Notify callback that selection was cleared
        } else {
            // Deactivate any other active button
            resetAccidentalButtons();
            // Activate the clicked button
            button.classList.add('active');
            console.log(`Accidental selected: ${selectedAccidental}`);
            callback(selectedAccidental); // Notify callback of the new selection
        }
    });

    console.log("Accidental controls initialized.");
}

/**
 * Resets the accidental buttons to their default (inactive) state.
 */
export function resetAccidentalButtons() {
    const container = document.getElementById(controlsContainerId);
    if (!container) return;

    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => btn.classList.remove('active'));
    console.log("Accidental buttons reset.");
}
