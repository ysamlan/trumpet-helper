/**
 * @fileoverview
 * Handles rendering and updating the trumpet SVG diagram.
 */

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// --- SVG Dimensions and Styling ---
const TRUMPET_SVG_WIDTH = 300; // ViewBox width
const TRUMPET_SVG_HEIGHT = 150; // ViewBox height
const VALVE_CASING_WIDTH = 25;
const VALVE_CASING_HEIGHT = 60;
const VALVE_CASING_SPACING = 10; // Space between casings
const VALVE_CAP_RADIUS = 10;
const VALVE_CAP_OFFSET_Y = -5; // Offset from top of casing
const VALVE_START_X = (TRUMPET_SVG_WIDTH - (3 * VALVE_CASING_WIDTH + 2 * VALVE_CASING_SPACING)) / 2; // Center the valves
const VALVE_CASING_Y = (TRUMPET_SVG_HEIGHT - VALVE_CASING_HEIGHT) / 2; // Center vertically

const CASING_COLOR = "#cccccc"; // Light gray
const VALVE_CAP_COLOR_UP = "#aaaaaa"; // Medium gray for unpressed caps
// Colors for pressed states will be added later

/**
 * Creates and appends an SVG element to the container for the trumpet diagram.
 * @param {string} containerId - The ID of the container element.
 * @returns {SVGSVGElement | null} The created SVG element or null if container not found.
 */
function createTrumpetSVGContainer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container element with ID "${containerId}" not found.`);
        return null;
    }
    container.innerHTML = ''; // Clear placeholder

    const svg = document.createElementNS(SVG_NAMESPACE, "svg");
    svg.setAttribute("viewBox", `0 0 ${TRUMPET_SVG_WIDTH} ${TRUMPET_SVG_HEIGHT}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.display = "block";
    svg.style.margin = "auto";
    svg.style.maxWidth = `${TRUMPET_SVG_WIDTH}px`; // Control max size

    container.appendChild(svg);
    return svg;
}

/**
 * Renders the static trumpet SVG diagram (valve casings and caps).
 * @param {string} containerId - The ID of the HTML element to render the trumpet into.
 */
export function renderTrumpetSVG(containerId) {
    const svg = createTrumpetSVGContainer(containerId);
    if (!svg) return;

    // Group for valve parts
    const valvesGroup = document.createElementNS(SVG_NAMESPACE, "g");
    valvesGroup.id = "valves-group";
    svg.appendChild(valvesGroup);

    // Draw valve casings and caps
    for (let i = 0; i < 3; i++) {
        const valveIndex = i + 1; // 1, 2, 3
        const casingX = VALVE_START_X + i * (VALVE_CASING_WIDTH + VALVE_CASING_SPACING);

        // Casing
        const casing = document.createElementNS(SVG_NAMESPACE, "rect");
        casing.setAttribute("x", casingX);
        casing.setAttribute("y", VALVE_CASING_Y);
        casing.setAttribute("width", VALVE_CASING_WIDTH);
        casing.setAttribute("height", VALVE_CASING_HEIGHT);
        casing.setAttribute("fill", CASING_COLOR);
        casing.setAttribute("rx", 3); // Slightly rounded corners
        casing.setAttribute("ry", 3);
        valvesGroup.appendChild(casing);

        // Valve Cap (Circle) - Initial 'up' state
        const capCenterX = casingX + VALVE_CASING_WIDTH / 2;
        const capCenterY = VALVE_CASING_Y + VALVE_CAP_OFFSET_Y; // Positioned above the casing

        const cap = document.createElementNS(SVG_NAMESPACE, "circle");
        cap.id = `valve-cap-${valveIndex}`; // Assign ID: valve-cap-1, valve-cap-2, valve-cap-3
        cap.setAttribute("cx", capCenterX);
        cap.setAttribute("cy", capCenterY);
        cap.setAttribute("r", VALVE_CAP_RADIUS);
        cap.setAttribute("fill", VALVE_CAP_COLOR_UP);
        cap.setAttribute("stroke", "#555555");
        cap.setAttribute("stroke-width", 1);
        // Add a data attribute to store the default Y position for easy reset later
        cap.dataset.defaultY = capCenterY;
        valvesGroup.appendChild(cap);
    }

    console.log(`Trumpet SVG rendered in #${containerId}`);
}

// Future: Add updateTrumpetSVG function here
