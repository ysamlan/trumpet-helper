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
 * Initializes the audio sampler using the local Tonejs-Instruments library.
 * Returns a promise that resolves with the sampler instance when loaded,
 * or rejects if there's an error or Tone.js/SampleLibrary is unavailable.
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
        if (typeof SampleLibrary === 'undefined') {
            audioLoadError = "SampleLibrary (Tonejs-Instruments.js) not available.";
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
        console.log("Initializing audio sampler via SampleLibrary...");

        // Use SampleLibrary to load only the trumpet
        try {
            loadedSamples = SampleLibrary.load({
                instruments: ['trumpet'],
                baseUrl: LOCAL_SAMPLES_BASE_URL,
                // Note: SampleLibrary doesn't have direct onload/onerror callbacks in the options.
                // We rely on Tone.Buffer.on('load') and Tone.Buffer.on('error') instead.
            });

            // --- Setup Load/Error Handlers using Tone.Buffer events ---
            let loadHandler, errorHandler; // To store handler references for removal

            loadHandler = () => {
                console.log("Tone.Buffer finished loading.");
                if (loadedSamples && loadedSamples.trumpet) {
                    trumpetSampler = loadedSamples.trumpet;
                    trumpetSampler.release = 0.1; // Shorten release time for quicker note stop
                    trumpetSampler.toMaster(); // Connect to output (using .toMaster() based on demo)
                    console.log("Trumpet sampler configured successfully.");
                    isAudioLoading = false;
                    // Clean up listeners
                    Tone.Buffer.off('load', loadHandler);
                    Tone.Buffer.off('error', errorHandler);
                    resolve(trumpetSampler);
                } else {
                    // This case might happen if loading finished but the trumpet object wasn't created
                    const errorMsg = "SampleLibrary load completed, but trumpet sampler is missing.";
                    console.error(errorMsg);
                    audioLoadError = new Error(errorMsg);
                    isAudioLoading = false;
                    trumpetSampler = null;
                    loadedSamples = null;
                    // Clean up listeners
                    Tone.Buffer.off('load', loadHandler);
                    Tone.Buffer.off('error', errorHandler);
                    reject(audioLoadError);
                }
            };

            errorHandler = (error) => {
                console.error("Tone.Buffer error during loading:", error);
                audioLoadError = error;
                isAudioLoading = false;
                trumpetSampler = null;
                loadedSamples = null;
                 // Clean up listeners
                Tone.Buffer.off('load', loadHandler);
                Tone.Buffer.off('error', errorHandler);
                reject(error);
            };

            // Attach the handlers
            Tone.Buffer.on('load', loadHandler);
            Tone.Buffer.on('error', errorHandler);

            // Check if Tone.js might have already loaded everything synchronously
            // (less likely with multiple samples, but good practice)
            if (Tone.Buffer.loaded) {
                console.log("Tone.Buffer already loaded, triggering handler manually.");
                // Timeout to ensure promise setup completes before handler runs
                setTimeout(loadHandler, 0);
            } else {
                 console.log("Waiting for Tone.Buffer 'load' event...");
            }

        } catch (error) {
            console.error("Failed to initiate SampleLibrary.load:", error);
            audioLoadError = error;
            isAudioLoading = false;
            trumpetSampler = null;
            loadedSamples = null;
            reject(error);
        }
    });
}

/**
 * Returns the initialized trumpet sampler instance obtained via SampleLibrary.
 * Returns null if the sampler is not yet loaded or failed to load.
 * @returns {Tone.Sampler | null}
 */
export function getSampler() {
    // trumpetSampler is now populated by the load handler
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
