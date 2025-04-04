/**
 * @fileoverview
 * Contains the mapping of musical notes to trumpet fingerings.
 */

/**
 * Trumpet Fingering Data.
 * Maps note names (pitch + octave, e.g., "C4", "F#5") to their fingerings.
 * - `primary`: An array representing the most common fingering (valve numbers 1, 2, 3). Empty array `[]` means open (no valves pressed).
 * - `alternates`: An array of arrays, each sub-array representing an alternate fingering.
 *
 * Note: This initial version only includes a sample range (C4-G4).
 * It needs to be expanded to cover the full practical range of the trumpet (F#3 to C6+).
 * Sharps are used for chromatic notes (e.g., C#4 instead of Db4). The application logic
 * will need to handle equivalence if needed later.
 */
const fingeringData = Object.freeze({
    // --- Sample Data (C4 to G4) ---
    "C4": { primary: [], alternates: [[1, 3], [1, 2, 3]] }, // Middle C (Open, Alt 1-3 or 1-2-3)
    "C#4": { primary: [1, 2, 3], alternates: [[1, 2]] },   // C# / Db (1-2-3, Alt 1-2) - Note: [3] is often flat
    "D4": { primary: [1, 3], alternates: [] },             // D (1-3)
    "D#4": { primary: [2, 3], alternates: [] },             // D# / Eb (2-3)
    "E4": { primary: [1, 2], alternates: [] },             // E (1-2)
    "F4": { primary: [1], alternates: [] },                // F (1)
    "F#4": { primary: [2], alternates: [[1, 3]] },         // F# / Gb (2, Alt 1-3)
    "G4": { primary: [], alternates: [[1, 2]] },           // G (Open, Alt 1-2)

    // --- To be expanded ---
    // Example structure for notes outside the sample range:
    // "F#3": { primary: [1, 2, 3], alternates: [] },
    // "G3": { primary: [1, 3], alternates: [] },
    // ...
    // "A4": { primary: [1, 2], alternates: [] },
    // "A#4": { primary: [1], alternates: [[2, 3]] },
    // "B4": { primary: [2], alternates: [] },
    // "C5": { primary: [1], alternates: [] },
    // ...
    // "C6": { primary: [1], alternates: [] }, // High C
});

/**
 * Retrieves the fingering information for a given note.
 * @param {string} noteName - The note name (e.g., "C4", "F#5").
 * @returns {{primary: number[], alternates: number[][]} | null} The fingering object or null if not found.
 */
export function getFingering(noteName) {
    return fingeringData[noteName] || null;
}

// Export the raw data too, in case it's needed elsewhere directly
export { fingeringData };
