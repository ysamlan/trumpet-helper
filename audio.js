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

// Base URL for the local samples directory
const LOCAL_SAMPLES_BASE_URL = "tonejs-instruments/samples/";

/**
 * Initializes the audio sampler using Tone.Sampler and local samples.
 * Returns a promise that resolves with the sampler instance when loaded,
 * or rejects if there's an error or Tone.js is unavailable.
 * @returns {Promise<Tone.Sampler>} A promise resolving with the trumpet sampler instance.
 */
export function initAudio() {
    return new Promise((resolve, reject) => {
        // Check dependencies
        if (typeof Tone === 'undefined') {
            audioLoadError = "Tone.js not available.";
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
            // Optionally, return a promise that resolves with the existing sampler
            // once loading completes, or just reject/warn.
            return reject(new Error("Initialization in progress."));
        }

        isAudioLoading = true;
        audioLoadError = null;
        console.log("Initializing audio sampler with Tone.Sampler...");

        try {
            // Define the samples for Tone.Sampler
            const samples = {
                "A3": "A3.[mp3|ogg]",
                "A#4": "As4.[mp3|ogg]",
                "C4": "C4.[mp3|ogg]",
                "C6": "C6.[mp3|ogg]",
                "D5": "D5.[mp3|ogg]",
                "D#4": "Ds4.[mp3|ogg]",
                "F3": "F3.[mp3|ogg]",
                "F4": "F4.[mp3|ogg]",
                "F5": "F5.[mp3|ogg]",
                "G4": "G4.[mp3|ogg]",
                "A5": "A5.[mp3|ogg]",
                // Add other necessary notes if available in the samples directory
            };

            trumpetSampler = new Tone.Sampler({
                urls: samples,
                baseUrl: LOCAL_SAMPLES_BASE_URL + "trumpet/", // Point to the trumpet subdirectory
                release: 0.4, // Set release time
                onload: () => {
                    console.log("Trumpet sampler loaded successfully.");
                    trumpetSampler.toDestination(); // Connect to master output
                    isAudioLoading = false;
                    resolve(trumpetSampler);
                },
                onerror: (error) => {
                    console.error("Error loading trumpet sampler:", error);
                    audioLoadError = error;
                    isAudioLoading = false;
                    trumpetSampler = null; // Ensure sampler is null on error
                    reject(error);
                }
            });

            // Optional: Monitor Tone.loaded promise if needed for global loading state
            // Tone.loaded().then(() => { console.log("All Tone buffers loaded (global)."); });

        } catch (error) {
            console.error("Failed to create Tone.Sampler:", error);
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
