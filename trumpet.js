/**
 * @fileoverview
 * Handles rendering and updating the trumpet SVG diagram.
 */

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// --- Styling Constants (can be used later for updates) ---
const VALVE_CAP_COLOR_UP = "#A66300"; // Default color from SVG
const VALVE_CAP_COLOR_DOWN_1 = "#FF6347"; // Example: Tomato Red for valve 1
const VALVE_CAP_COLOR_DOWN_2 = "#90EE90"; // Example: Light Green for valve 2
const VALVE_CAP_COLOR_DOWN_3 = "#ADD8E6"; // Example: Light Blue for valve 3
const VALVE_DOWN_TRANSFORM = "translateY(15)"; // How much to move caps down visually

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


// Future: Add updateTrumpetSVG function here
// This function will need to select elements by their new IDs (#valve-cap-1, etc.)
// and apply transforms/style changes.
