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

// URLs for the trumpet samples from tonejs-instruments on unpkg CDN
const trumpetSamples = {
    "A3": "A3.mp3",
    "A#4": "As4.mp3", // Note: Tone.js uses 's' for sharp in sample names
    "C4": "C4.mp3",
    "C5": "C5.mp3",
    "D#4": "Ds4.mp3",
    "F3": "F3.mp3",
    "F#4": "Fs4.mp3", // Note: F#4 sample seems missing, using Fs4 as placeholder
    "G#3": "Gs3.mp3",
};

// Base URL for the samples
const SAMPLES_BASE_URL = "https://unpkg.com/tonejs-instruments@4.9.0/samples/trumpet/";

/**
 * Initializes the Tone.js Sampler for trumpet sounds.
 * Returns a promise that resolves with the sampler instance when loaded,
 * or rejects if there's an error or Tone.js is unavailable.
 * @returns {Promise<Tone.Sampler>}
 */
export function initAudio() {
    return new Promise((resolve, reject) => {
        if (typeof Tone === 'undefined') {
            audioLoadError = "Tone.js not available.";
            console.error(audioLoadError);
            return reject(new Error(audioLoadError));
        }

        if (trumpetSampler) {
            console.log("Audio already initialized.");
            return resolve(trumpetSampler); // Already initialized
        }
        if (isAudioLoading) {
            console.warn("Audio initialization already in progress.");
            // Could potentially return a promise that resolves when the ongoing load finishes
            // For now, let's just reject to avoid complexity
            return reject(new Error("Initialization in progress."));
        }

        isAudioLoading = true;
        audioLoadError = null;
        console.log("Initializing audio sampler...");

        try {
            trumpetSampler = new Tone.Sampler({
                urls: trumpetSamples,
                baseUrl: SAMPLES_BASE_URL,
                onload: () => {
                    console.log("Trumpet samples loaded successfully.");
                    isAudioLoading = false;
                    resolve(trumpetSampler);
                },
                onerror: (error) => {
                    console.error("Error loading trumpet samples:", error);
                    audioLoadError = error;
                    isAudioLoading = false;
                    trumpetSampler = null; // Ensure sampler is null on error
                    reject(error);
                }
            }).toDestination(); // Connect the sampler to the main output

            // Optional: Add volume control or effects here
            // trumpetSampler.volume.value = -6; // Example: Lower volume slightly

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
    return trumpetSampler;
}

/**
 * Checks if the audio context is running and starts it if necessary.
 * This often needs to be triggered by a user gesture (like a click).
 * @returns {Promise<void>} A promise that resolves when the context is running.
 */
export async function ensureAudioContextStarted() {
    if (typeof Tone !== 'undefined' && Tone.context.state !== 'running') {
        console.log('Audio context is not running, attempting to start...');
        try {
            await Tone.start();
            console.log('Audio context started successfully.');
        } catch (error) {
            console.error('Failed to start audio context:', error);
            // Handle the error appropriately, maybe disable audio features
        }
    } else if (typeof Tone !== 'undefined') {
        // console.log('Audio context is already running.'); // Optional log
    }
}
