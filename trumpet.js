/**
 * @fileoverview
 * Handles rendering and updating the trumpet SVG diagram.
 */

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// --- Styling Constants (can be used later for updates) ---
const VALVE_CAP_COLOR_UP = "#A66300"; // Default color from SVG
const VALVE_CAP_COLOR_DOWN_1 = "#FF6347"; // Tomato Red for valve 1
const VALVE_CAP_COLOR_DOWN_2 = "#90EE90"; // Light Green for valve 2
const VALVE_CAP_COLOR_DOWN_3 = "#ADD8E6"; // Light Blue for valve 3
const VALVE_DOWN_TRANSFORM = "translate(0, 15)"; // SVG transform syntax for moving down
const VALVE_NUMBER_TEXT_COLOR = "#000000"; // Black for valve numbers
const VALVE_NUMBER_FONT_SIZE = "14px"; // Font size for valve numbers

/**
 * Fetches and injects the trumpet SVG from an external file, assigning IDs to valve caps.
 * @param {string} containerId - The ID of the HTML element to render the trumpet into.
 * @param {string} svgPath - The path to the trumpet SVG file.
 */
export async function renderTrumpetSVG(containerId, svgPath = 'trumpet.svg') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container element with ID "${containerId}" not found.`);
        return;
    }
    container.innerHTML = ''; // Clear placeholder or previous SVG

        // --- Store the SVG content as a string literal ---
        const svgString = `<?xml version="1.0" encoding="iso-8859-1"?>
<svg height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
	 viewBox="0 0 512 512" xml:space="preserve">
<g>
	<path style="fill:#DEB714;" d="M241.067,376.147h-83.865c-36.546,0-66.279-29.732-66.279-66.279v-70.862h216.424v70.862
		C307.347,346.414,277.613,376.147,241.067,376.147z M125.123,273.205v36.662c0,17.689,14.391,32.079,32.08,32.079h83.865
		c17.688,0,32.08-14.39,32.08-32.08v-36.662L125.123,273.205L125.123,273.205z"/>
	<path style="fill:#DEB714;" d="M512,150.094c0-7.865-6.376-14.241-14.241-14.241h-0.024c-4.048,0-7.866,1.883-10.334,5.092
		c-15.836,20.585-33.657,35.489-52.448,48.572c-27.529,19.166-59.975,29.288-93.517,29.288H17.1v54.323h324.335
		c33.413,0,66.096,10.197,93.517,29.289c18.663,12.994,36.369,27.783,52.123,48.151c2.685,3.47,6.839,5.514,11.227,5.514h0.027
		c7.549,0,13.669-6.12,13.669-13.669v-192.32H512z"/>
	<path style="fill:#DEB714;" d="M267.534,262.232c-9.444,0-17.1-7.656-17.1-17.1v-57.899c0-9.444,7.656-17.1,17.1-17.1
		s17.1,7.656,17.1,17.1v57.899C284.634,254.576,276.978,262.232,267.534,262.232z"/>
</g>
<path style="fill:#A66300;" d="M285.015,184.333h-34.96c-9.444,0-17.1-7.656-17.1-17.1c0-9.444,7.656-17.1,17.1-17.1h34.96
	c9.444,0,17.1,7.656,17.1,17.1C302.115,176.677,294.459,184.333,285.015,184.333z"/>
<path style="fill:#DEB714;" d="M199.135,262.232c-9.444,0-17.1-7.656-17.1-17.1v-57.899c0-9.444,7.656-17.1,17.1-17.1
	c9.444,0,17.1,7.656,17.1,17.1v57.899C216.235,254.576,208.578,262.232,199.135,262.232z"/>
<path style="fill:#A66300;" d="M216.615,184.333h-34.96c-9.444,0-17.1-7.656-17.1-17.1c0-9.444,7.656-17.1,17.1-17.1h34.96
	c9.444,0,17.1,7.656,17.1,17.1C233.715,176.677,226.059,184.333,216.615,184.333z"/>
<path style="fill:#DEB714;" d="M335.934,262.232c-9.444,0-17.1-7.656-17.1-17.1v-57.899c0-9.444,7.656-17.1,17.1-17.1
	c9.444,0,17.1,7.656,17.1,17.1v57.899C353.034,254.576,345.378,262.232,335.934,262.232z"/>
<path style="fill:#A66300;" d="M353.415,184.333h-34.96c-9.444,0-17.1-7.656-17.1-17.1c0-9.444,7.656-17.1,17.1-17.1h34.96
	c9.444,0,17.1,7.656,17.1,17.1C370.515,176.677,362.859,184.333,353.415,184.333z"/>
<path style="fill:#FACE17;" d="M512,245.968v-95.874c0-7.865-6.376-14.241-14.241-14.241h-0.024c-4.048,0-7.866,1.883-10.334,5.092
	c-15.836,20.585-33.657,35.489-52.448,48.572c-27.529,19.166-59.975,29.288-93.517,29.288H17.1v27.162H512V245.968z"/>
<g>
	<path style="fill:#FBDB4A;" d="M497.759,135.853h-0.024c-4.048,0-7.866,1.883-10.334,5.092c-3.848,5.001-7.815,9.663-11.882,14.048
		v181.953c3.952,4.262,7.811,8.78,11.556,13.622c2.685,3.47,6.839,5.514,11.227,5.514h0.027c7.549,0,13.669-6.12,13.669-13.669
		v-192.32C512,142.229,505.624,135.853,497.759,135.853z"/>
	<path style="fill:#FBDB4A;" d="M17.1,290.23c-9.444,0-17.1-7.656-17.1-17.1v-54.323c0-9.444,7.656-17.1,17.1-17.1
		s17.1,7.656,17.1,17.1v54.323C34.2,282.573,26.544,290.23,17.1,290.23z"/>
</g>
</svg>`;

        // --- Inject the SVG string ---
        container.innerHTML = svgString;

        // --- Re-select the SVG element and assign IDs ---
        const svgElement = container.querySelector('svg');
        if (!svgElement) {
            console.error('[SVG Debug] Could not find SVG element after setting innerHTML.');
            container.innerHTML = '<p style="color: red; text-align: center;">Error rendering trumpet diagram.</p>';
            return;
        }

        // Find the valve cap paths (elements with fill:#A66300;)
        const valveCapPaths = svgElement.querySelectorAll('path[style*="fill:#A66300;"]');

        if (valveCapPaths.length < 3) {
            console.warn(`[SVG Debug] Expected at least 3 valve cap paths (fill:#A66300;), but found ${valveCapPaths.length}. IDs might be incorrect.`);
        } else {
            // Assign IDs based on visual order (left-to-right in the SVG source)
            // Path 1 (index 0) is middle valve -> valve-cap-2
            // Path 2 (index 1) is left valve -> valve-cap-1
            // Path 3 (index 2) is right valve -> valve-cap-3
            if (valveCapPaths[1]) valveCapPaths[1].id = 'valve-cap-1';
            if (valveCapPaths[0]) valveCapPaths[0].id = 'valve-cap-2';
            if (valveCapPaths[2]) valveCapPaths[2].id = 'valve-cap-3';
        }

        // Adjust SVG attributes for embedding
        svgElement.setAttribute("width", "100%");
        svgElement.setAttribute("height", "100%");
        svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
        // Remove fixed width/height if present in the source SVG (already done in the string, but good practice)
        svgElement.removeAttribute("width");
        svgElement.removeAttribute("height");
}


/**
 * Updates the visual state of the trumpet valve caps based on the fingering.
 * @param {number[] | null} fingeringArray - An array of pressed valve numbers (e.g., [1, 3], []) or null for open/reset.
 */
export function updateTrumpetSVG(fingeringArray) {
    // Ensure fingeringArray is an array, even if null is passed
    const pressedValves = new Set(fingeringArray || []); // Use a Set for efficient lookup

    // Find the SVG element within the trumpet area
    const container = document.getElementById('trumpet-area');
    const svg = container?.querySelector('svg');
    if (!svg) {
        console.warn("Trumpet SVG element not found for updating.");
        return;
    }

    for (let i = 1; i <= 3; i++) {
        const valveCap = svg.getElementById(`valve-cap-${i}`);
        if (!valveCap) {
            console.warn(`Valve cap element #valve-cap-${i} not found.`);
            continue;
        }

        if (pressedValves.has(i)) {
            // --- Valve Pressed ---
            // Apply transform
            valveCap.setAttribute("transform", VALVE_DOWN_TRANSFORM);
            // Add highlight class
            valveCap.classList.add(`valve-pressed-${i}`);

            // Add valve number text if it doesn't exist
            const textId = `valve-number-${i}`;
            if (!svg.getElementById(textId)) {
                const textElement = document.createElementNS(SVG_NAMESPACE, "text");
                textElement.id = textId;
                textElement.classList.add('valve-number'); // For general styling

                // Get cap's bounding box to position text (relative to transformed cap)
                const capBBox = valveCap.getBBox();
                const textX = capBBox.x + capBBox.width / 2;
                // Adjust Y slightly to center within the cap visually
                const textY = capBBox.y + capBBox.height / 2 + 5; // Adjust +5 based on font size/baseline

                textElement.setAttribute("x", textX);
                textElement.setAttribute("y", textY);
                // Apply the same transform as the cap so it moves with it
                textElement.setAttribute("transform", VALVE_DOWN_TRANSFORM); // Use updated constant
                textElement.textContent = i.toString();

                // Append text to the SVG (or a specific group if preferred)
                // Appending to the main SVG ensures it's on top
                svg.appendChild(textElement);
            }

        } else {
            // --- Valve Released ---
            // Remove transform
            valveCap.removeAttribute("transform");
            // Remove highlight class
            valveCap.classList.remove(`valve-pressed-${i}`);

            // Remove valve number text if it exists
            const textId = `valve-number-${i}`;
            const textElement = svg.getElementById(textId);
            if (textElement) {
                textElement.remove();
            }
        }
    }
}

/**
 * Formats a fingering array into a display string.
 * E.g., [] => "Open", [1, 3] => "1-3"
 * @param {number[]} fingeringArray - The array of valve numbers.
 * @returns {string} The formatted string representation.
 */
export function formatFingering(fingeringArray) {
    if (!fingeringArray || fingeringArray.length === 0) {
        return "Open";
    }
    // Sort numerically and join with hyphens
    return [...fingeringArray].sort((a, b) => a - b).join('-');
}
