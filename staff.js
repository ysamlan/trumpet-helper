// Constants for staff rendering
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const STAFF_LINES = 5;
const LINE_SPACING = 12; // Vertical distance between lines
const STAFF_HEIGHT = (STAFF_LINES - 1) * LINE_SPACING;
const CLEF_X = 10; // X position of the clef
const CLEF_Y_OFFSET = 3; // Fine-tuning clef vertical position relative to center line
const STAFF_START_X = 50; // Where staff lines begin after clef
const STAFF_END_X_MARGIN = 10; // Margin from the right edge
const STROKE_COLOR = "#333"; // Color for lines and clef
const STROKE_WIDTH = 1.5;

/**
 * Creates and appends an SVG element to the container.
 * @param {string} containerId - The ID of the container element.
 * @returns {SVGSVGElement} The created SVG element.
 */
function createSVG(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container element with ID "${containerId}" not found.`);
        return null;
    }
    // Clear previous content (like placeholder text)
    container.innerHTML = '';

    const svg = document.createElementNS(SVG_NAMESPACE, "svg");
    // Use viewBox for scalability, adjust aspect ratio as needed
    // Width is somewhat arbitrary, height is based on staff + margins
    const viewboxHeight = STAFF_HEIGHT + LINE_SPACING * 4; // Extra space above/below
    const viewboxY = -LINE_SPACING * 2; // Center the staff vertically
    svg.setAttribute("viewBox", `0 ${viewboxY} 400 ${viewboxHeight}`); // Example width 400
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%"); // Adjust as needed, or set fixed height
    svg.style.display = "block"; // Prevent extra space below inline elements
    svg.style.margin = "auto"; // Center if container is wider
    svg.style.maxWidth = "600px"; // Max width for the SVG itself

    container.appendChild(svg);
    return svg;
}

/**
 * Draws the 5 staff lines.
 * @param {SVGSVGElement} svg - The SVG element to draw into.
 * @param {number} width - The width of the SVG element (used to draw lines).
 */
function drawStaffLines(svg, width) {
    const staffEndX = width - STAFF_END_X_MARGIN;
    for (let i = 0; i < STAFF_LINES; i++) {
        const y = i * LINE_SPACING;
        const line = document.createElementNS(SVG_NAMESPACE, "line");
        line.setAttribute("x1", STAFF_START_X);
        line.setAttribute("y1", y);
        line.setAttribute("x2", staffEndX);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", STROKE_COLOR);
        line.setAttribute("stroke-width", STROKE_WIDTH);
        svg.appendChild(line);
    }
}

/**
 * Draws the treble clef.
 * @param {SVGSVGElement} svg - The SVG element to draw into.
 */
function drawTrebleClef(svg) {
    const clef = document.createElementNS(SVG_NAMESPACE, "text");
    clef.setAttribute("x", CLEF_X);
    // Position Y based on the middle line (G4 line), index 1 from top (0-indexed)
    const middleLineY = 1 * LINE_SPACING;
    clef.setAttribute("y", middleLineY + CLEF_Y_OFFSET);
    clef.setAttribute("font-size", `${STAFF_HEIGHT * 1.5}px`); // Adjust size relative to staff height
    clef.setAttribute("dominant-baseline", "middle"); // Better vertical alignment
    clef.setAttribute("fill", STROKE_COLOR);
    clef.textContent = "\u{1D11E}"; // Unicode for Treble Clef (G clef)
    svg.appendChild(clef);
}

/**
 * Renders the musical staff (lines and clef) within the specified container.
 * @param {string} containerId - The ID of the HTML element to render the staff into.
 */
export function renderStaff(containerId) {
    const svg = createSVG(containerId);
    if (!svg) return;

    // Get the effective width from the viewBox attribute for line drawing
    const viewBoxWidth = parseFloat(svg.getAttribute("viewBox").split(' ')[2]);

    drawStaffLines(svg, viewBoxWidth);
    drawTrebleClef(svg);

    // Add a placeholder group for notes, accidentals, etc. later
    const notesGroup = document.createElementNS(SVG_NAMESPACE, "g");
    notesGroup.id = "notes-group";
    svg.appendChild(notesGroup);

     const interactionLayer = document.createElementNS(SVG_NAMESPACE, "rect");
     interactionLayer.setAttribute("x", STAFF_START_X);
     interactionLayer.setAttribute("y", -LINE_SPACING * 2); // Cover area above/below staff
     interactionLayer.setAttribute("width", viewBoxWidth - STAFF_START_X);
     interactionLayer.setAttribute("height", STAFF_HEIGHT + LINE_SPACING * 4);
     interactionLayer.setAttribute("fill", "transparent"); // Make it invisible
     interactionLayer.id = "staff-interaction-layer"; // ID for attaching events
     svg.appendChild(interactionLayer);

    console.log(`Staff rendered in #${containerId}`);
}
