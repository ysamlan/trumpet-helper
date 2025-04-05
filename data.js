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
    "F#3": { primary: [1, 2, 3], alternates: [] },
    "G3": { primary: [1, 3], alternates: [] },
    "G#3": { primary: [2, 3], alternates: [] },
    "A3": { primary: [1, 2], alternates: [] },
    "A#3": { primary: [1], alternates: [] },
    "B3": { primary: [2], alternates: [] },
    "C4": { primary: [], alternates: [] },
    "C#4": { primary: [1, 2, 3], alternates: [] },
    "D4": { primary: [1, 3], alternates: [] },
    "D#4": { primary: [2, 3], alternates: [] },
    "E4": { primary: [1, 2], alternates: [] },
    "F4": { primary: [1], alternates: [] },
    "F#4": { primary: [2], alternates: [[1, 2, 3]] },
    "G4": { primary: [], alternates: [[1, 3]] },
    "G#4": { primary: [2, 3], alternates: [] },
    "A4": { primary: [1, 2], alternates: [] },
    "A#4": { primary: [1], alternates: [[1, 2, 3]] },
    "B4": { primary: [2], alternates: [[1, 3]] },
    "C5": { primary: [], alternates: [[2, 3]] },
    "C#5": { primary: [1, 2], alternates: [[1, 2, 3]] },
    "D5": { primary: [1], alternates: [[1, 3]] },
    "D#5": { primary: [2], alternates: [[2, 3]] },
    "E5": { primary: [], alternates: [[1, 2, 3], [1, 2]] },
    "F5": { primary: [1], alternates: [[1, 3]] },
    "F#5": { primary: [2], alternates: [[1, 2, 3], [2, 3]] },
    "G5": { primary: [], alternates: [[1, 3], [1, 2]] },
    "G#5": { primary: [2, 3], alternates: [[1], [1, 2, 3]] },
    "A5": { primary: [1, 2], alternates: [[1, 3]] },
    "A#5": { primary: [1], alternates: [[1, 2, 3], [2, 3], []] },
    "B5": { primary: [2], alternates: [[1, 3], [1, 2]] },
    "C6": { primary: [], alternates: [[1], [2, 3], [1, 2, 3]] },
    "C#6": { primary: [2], alternates: [[1, 2], [1, 3], [1, 2, 3]] },
    "D6": { primary: [], alternates: [[1], [2, 3]] },
    "D#6": { primary: [2], alternates: [[1, 2]] },
    "E6": { primary: [], alternates: [[1]] },
    "F6": { primary: [1], alternates: [[2]] },
    "F#6": { primary: [2], alternates: [[]] },
    "G6": { primary: [], alternates: [] }
});

/**
 * Retrieves the fingering information for a given note.
 * @param {string} noteName - The note name (e.g., "C4", "F#5").
 * @returns {{primary: number[], alternates: number[][]} | null} The fingering object or null if not found.
 */
export function getFingering(noteName) {
    const normalizedNote = normalizeNoteName(noteName);
    console.log(`[getFingering] Original: ${noteName}, Normalized: ${normalizedNote}`);
    return fingeringData[normalizedNote] || null;
}

/**
 * Normalizes a note name to its enharmonic equivalent primarily using sharps,
 * matching the keys used in the fingeringData object.
 * Handles E#/Fb and B#/Cb edge cases.
 * @param {string} noteName - The note name to normalize (e.g., "Bb4", "E#4", "Cb5").
 * @returns {string} The normalized note name (e.g., "A#4", "F4", "B4").
 */
function normalizeNoteName(noteName) {
    if (!noteName || noteName.length < 2) return noteName; // Basic validation

    let note = noteName.slice(0, -1); // e.g., "Bb", "E#", "C"
    let octave = parseInt(noteName.slice(-1), 10);

    // Standard flat to sharp conversions
    const flatToSharpMap = {
        "Bb": "A#",
        "Eb": "D#",
        "Ab": "G#",
        "Db": "C#",
        "Gb": "F#"
    };

    if (flatToSharpMap[note]) {
        return flatToSharpMap[note] + octave;
    }

    // Handle E#/Fb and B#/Cb cases
    switch (note) {
        case "E#": return "F" + octave;
        case "Fb": return "E" + octave;
        case "B#": return "C" + (octave + 1);
        case "Cb": return "B" + (octave - 1);
        default:   return noteName; // Already sharp or natural (A-G)
    }
}


/**
 * Key Signature Data.
 * Maps key names to the notes affected and the type of accidental.
 * - `notes`: Array of note letters (A-G) that are sharp or flat in this key.
 * - `accidental`: '#' for sharp keys, 'b' for flat keys, null for C Major.
 */
const keySignatures = Object.freeze({
    // Sharp Keys (Order: F C G D A E B)
    "C Major": { notes: [], accidental: null },
    "G Major": { notes: ["F"], accidental: "#" },
    "D Major": { notes: ["F", "C"], accidental: "#" },
    "A Major": { notes: ["F", "C", "G"], accidental: "#" },
    "E Major": { notes: ["F", "C", "G", "D"], accidental: "#" },
    "B Major": { notes: ["F", "C", "G", "D", "A"], accidental: "#" },
    "F# Major": { notes: ["F", "C", "G", "D", "A", "E"], accidental: "#" },
    "C# Major": { notes: ["F", "C", "G", "D", "A", "E", "B"], accidental: "#" },

    // Flat Keys (Order: B E A D G C F)
    "F Major": { notes: ["B"], accidental: "b" },
    "Bb Major": { notes: ["B", "E"], accidental: "b" },
    "Eb Major": { notes: ["B", "E", "A"], accidental: "b" },
    "Ab Major": { notes: ["B", "E", "A", "D"], accidental: "b" },
    "Db Major": { notes: ["B", "E", "A", "D", "G"], accidental: "b" },
    "Gb Major": { notes: ["B", "E", "A", "D", "G", "C"], accidental: "b" },
    "Cb Major": { notes: ["B", "E", "A", "D", "G", "C", "F"], accidental: "b" },
});


// Export the raw data too, in case it's needed elsewhere directly
export { fingeringData, keySignatures };
