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

    try {
        const response = await fetch(svgPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const svgText = await response.text();

        // Parse the SVG text
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");

        if (!svgElement) {
            throw new Error("Could not find SVG element in fetched file.");
        }

        // Find the valve cap paths (elements with fill:#A66300;)
        const valveCapPaths = svgElement.querySelectorAll('path[style*="fill:#A66300;"]');

        if (valveCapPaths.length < 3) {
            console.warn(`Expected at least 3 valve cap paths (fill:#A66300;), but found ${valveCapPaths.length}. IDs might be incorrect.`);
        } else {
            // Assign IDs based on visual order (left-to-right in the SVG source)
            // Path 1 (index 0) is middle valve -> valve-cap-2
            // Path 2 (index 1) is left valve -> valve-cap-1
            // Path 3 (index 2) is right valve -> valve-cap-3
            if (valveCapPaths[1]) valveCapPaths[1].id = 'valve-cap-1';
            if (valveCapPaths[0]) valveCapPaths[0].id = 'valve-cap-2';
            if (valveCapPaths[2]) valveCapPaths[2].id = 'valve-cap-3';
            console.log("Assigned IDs to valve caps:", {
                cap1: valveCapPaths[1]?.id,
                cap2: valveCapPaths[0]?.id,
                cap3: valveCapPaths[2]?.id
            });
        }

        // Adjust SVG attributes for embedding
        svgElement.setAttribute("width", "100%");
        svgElement.setAttribute("height", "100%");
        // Preserve aspect ratio, meet means scale down to fit, slice would crop
        svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
        // Optional: Remove fixed width/height if present in the source SVG
        svgElement.removeAttribute("width");
        svgElement.removeAttribute("height");

        // Append the modified SVG to the container
        container.appendChild(svgElement);

        console.log(`Trumpet SVG loaded from ${svgPath} and rendered in #${containerId}`);

    } catch (error) {
        console.error(`Failed to load or render trumpet SVG from ${svgPath}:`, error);
        container.innerHTML = '<p style="color: red; text-align: center;">Error loading trumpet diagram.</p>';
    }
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
            console.log(`Valve ${i} pressed.`);

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
            console.log(`Valve ${i} released.`);

            // Remove valve number text if it exists
            const textId = `valve-number-${i}`;
            const textElement = svg.getElementById(textId);
            if (textElement) {
                textElement.remove();
            }
        }
    }
}
