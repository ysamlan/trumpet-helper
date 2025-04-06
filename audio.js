/**
 * @fileoverview
 * Manages audio playback using Tone.js and trumpet samples.
 */

// Ensure Tone.js is loaded (it should be available globally via the script tag)
if (typeof Tone === 'undefined') {
    console.error("Tone.js is not loaded. Make sure the script tag is included in index.html.");
    // Optionally, throw an error or disable audio features
}

let trumpetSampler = null;
let isAudioLoading = false;
let audioLoadError = null;
let loadedSamples = null; // To store the object returned by SampleLibrary

/**
 * Initializes the audio sampler using Tone.js v15.0.4 via CDN and local samples.
 * Returns a promise that resolves with the sampler instance when loaded,
 * or rejects if there's an error or Tone.js is unavailable.
 * @returns {Promise<Tone.Sampler>} A promise resolving with the trumpet sampler instance.
 */
export function initAudio() {
    return new Promise(async (resolve, reject) => { // Make the wrapping function async
        // Check dependencies
        if (typeof Tone === 'undefined') {
            audioLoadError = "Tone.js (v15.0.4 from CDN) not available.";
            console.error(audioLoadError);
            return reject(new Error(audioLoadError));
        }

        // Check initialization state
        if (trumpetSampler) {
            console.log("Audio sampler already initialized.");
            return resolve(trumpetSampler);
        }
        if (isAudioLoading) {
            console.warn("Audio initialization already in progress.");
            return reject(new Error("Initialization in progress."));
        }

        isAudioLoading = true;
        audioLoadError = null;
        console.log("Initializing audio sampler via Tone.js v15.0.4 with local samples...");

        try {
            // Define the notes and their corresponding local audio files
            // Keys MUST be valid Scientific Pitch Notation or MIDI numbers.
            // Values MUST match the filenames in the samples directory.
            const trumpetSamples = {
                "A3": "A3.mp3",     // Assuming A3.mp3 exists
                "C4": "C4.mp3",     // Assuming C4.mp3 exists
                "D#4": "Ds4.mp3",   // Use standard SPN key "D#4", maps to filename "Ds4.mp3"
                // "F#4": "Fs4.mp3", // Add if Fs4.mp3 exists
                // "A4": "A4.mp3",   // Add if A4.mp3 exists
                // "C5": "C5.mp3",   // Add if C5.mp3 exists
                // "D#5": "Ds5.mp3", // Add if Ds5.mp3 exists
                // "F#5": "Fs5.mp3", // Add if Fs5.mp3 exists
                "A5": "A5.mp3",     // Assuming A5.mp3 exists
                "C6": "C6.mp3"      // Assuming C6.mp3 exists
                // Add other notes corresponding to available .mp3 files in the directory
            };

            // Create the Sampler instance using the global Tone object from CDN
            trumpetSampler = new Tone.Sampler({
                urls: trumpetSamples,
                release: 0.4, // Keep or adjust the release time as needed
                baseUrl: 'tonejs-instruments/samples/trumpet/', // Correct local path
                // Note: The 'onerror' callback is not directly supported in the Sampler constructor options in newer Tone.js versions.
                // Errors are typically handled via the Tone.loaded() promise.
            }).toDestination(); // Connect directly to destination

            // Wait for the sampler to load all samples
            await Tone.loaded();

            console.log('Audio initialized and samples loaded.');
            isAudioLoading = false;
            resolve(trumpetSampler);

        } catch (error) {
            console.error("Failed to initialize Tone.Sampler:", error);
            audioLoadError = error;
            isAudioLoading = false;
            trumpetSampler = null;
            reject(error);
        }
    });
}

/**
 * Returns the initialized trumpet sampler instance.
 * Returns null if the sampler is not yet loaded or failed to load.
 * @returns {Tone.Sampler | null}
 */
export function getSampler() {
    if (isAudioLoading) {
        console.warn("Audio sampler is still loading.");
        return null;
    }
    if (audioLoadError) {
        console.error("Audio sampler failed to load:", audioLoadError);
        return null;
    }
    if (!trumpetSampler) {
        console.warn("Trumpet sampler is not initialized.");
        return null;
    }
    return trumpetSampler;
}

/**
 * Ensures the AudioContext is started, necessary for browsers that
 * require user interaction before starting audio playback.
 * Should be called in response to a user gesture (e.g., a button click).
 */
export async function ensureAudioContextStarted() {
    if (Tone.context.state !== 'running') {
        console.log('AudioContext not running, attempting to start...');
        try {
            await Tone.start();
            console.log('AudioContext started successfully.');
        } catch (e) {
            console.error('Failed to start AudioContext:', e);
            // Optionally, display a message to the user indicating audio issues.
        }
    }
}
