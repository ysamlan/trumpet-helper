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
const MAX_LEDGER_LINES = 4;
const LEDGER_LINE_EXTENSION = 8; // How far ledger line extends past cursor center
const CURSOR_RADIUS = LINE_SPACING / 2.5; // Radius of the cursor indicator
const CURSOR_COLOR = "rgba(50, 50, 200, 0.6)"; // Semi-transparent blue

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
 * Converts mouse event coordinates to SVG coordinates.
 * @param {SVGSVGElement} svg - The SVG element.
 * @param {MouseEvent} event - The mouse event.
 * @returns {{x: number, y: number}} SVG coordinates.
 */
function getSVGCoordinates(svg, event) {
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: svgPoint.x, y: svgPoint.y };
}

// --- Helper Functions for Interaction ---

/**
 * Calculates the snapped vertical position (line or space) and required ledger lines.
 * @param {number} yCoord - The raw Y coordinate from the mouse event.
 * @returns {{snappedY: number, ledgerLinesNeeded: number}}
 *          - snappedY: The Y coordinate snapped to the nearest line or space.
 *          - ledgerLinesNeeded: Positive for lines below staff, negative for lines above. 0 if on staff.
 */
function getVerticalPositionInfo(yCoord) {
    const halfSpacing = LINE_SPACING / 2;
    // Calculate position relative to the top line (E5), rounding to nearest half-step (line or space)
    const position = Math.round(yCoord / halfSpacing);
    const snappedY = position * halfSpacing;

    let ledgerLinesNeeded = 0;
    const topStaffLineY = 0;
    const bottomStaffLineY = STAFF_HEIGHT;

    if (snappedY < topStaffLineY) { // Above staff
        // Calculate how many lines *above* the top line (negative value)
        // Line C6 is at -LINE_SPACING, D6 space is -LINE_SPACING*1.5, E6 line is -LINE_SPACING*2 etc.
        // Snapped Y = 0 (E5 line), -6 (F5 space), -12 (G5 line), -18 (A5 space), -24 (B5 line), -30 (C6 space), -36 (D6 line)
        // We need ledger lines for C6 (-36), A5 (-24), F5 (-12) -> these are lines
        if (snappedY <= -LINE_SPACING) { // C6 or higher requires ledger lines
             ledgerLinesNeeded = -Math.ceil(Math.abs(snappedY / LINE_SPACING));
             // Ensure it's a line position if snappedY is a multiple of LINE_SPACING
             if (snappedY % LINE_SPACING !== 0) {
                 // It's a space above a ledger line, the line count is correct,
                 // but we draw based on the line below it.
                 // Example: D6 space (snappedY = -42), needs 2 lines (C6, A5). ceil(42/12)=4. Needs adjustment?
                 // Let's rethink: Count lines *away* from the staff boundary.
                 // C6 (snappedY = -36) is 1 ledger line. Line index = -2.
                 // A5 (snappedY = -24) is 1 ledger line. Line index = -1.
                 // G5 (snappedY = -12) is 0 ledger lines. Line index = 0.
                 // F5 (snappedY = -6) is 0 ledger lines. Space index = 0.5
                 // E5 (snappedY = 0) is 0 ledger lines. Line index = 1.

                 // Calculate based on distance from nearest staff line (0 or STAFF_HEIGHT)
                 const stepsAbove = Math.round(Math.abs(snappedY) / LINE_SPACING);
                 if (stepsAbove >= 1 && snappedY % LINE_SPACING === 0) { // It's a line position above
                     ledgerLinesNeeded = -stepsAbove;
                 } else if (stepsAbove >= 1) { // It's a space position above
                     ledgerLinesNeeded = -stepsAbove; // Needs line below it
                 }
            }
             // Correct calculation: How many LINE_SPACING steps away is the line?
             const lineIndex = Math.floor(snappedY / LINE_SPACING); // 0=E5, -1=G5, -2=B5, -3=D6
             if (lineIndex <= -1) { // G5 or higher
                 // Ledger lines needed for G5, B5, D6 etc. (Lines at index -1, -2, -3...)
                 ledgerLinesNeeded = lineIndex; // e.g., G5 -> -1 ledger line (none), B5 -> -2 lines (A5), D6 -> -3 lines (C6, A5)
                 // Let's try again: Count lines *beyond* the staff.
                 // SnappedY = 0 (E5), -12 (G5), -24 (A5), -36 (C6), -48 (E6)
                 // SnappedY = -6 (F5), -18 (G#5/Ab5 space), -30 (B5 space), -42 (D6 space)
                 if (snappedY <= -LINE_SPACING) { // G5 or higher
                     // Need line for A5 (-24), C6 (-36), E6 (-48)
                     // Need line for G5 space (-18), B5 space (-30), D6 space (-42)
                     // Number of lines = floor(abs(snappedY - halfSpacing) / LINE_SPACING)
                     ledgerLinesNeeded = -Math.floor((Math.abs(snappedY) + halfSpacing) / LINE_SPACING);
                 }
            }
        }
    } else if (snappedY > bottomStaffLineY) { // Below staff
        // Calculate how many lines *below* the bottom line (positive value)
        // Bottom line Y = STAFF_HEIGHT (F4)
        // Snapped Y = 48 (F4), 54 (E4 space), 60 (D4 line), 66 (C4 space), 72 (B3 line), 78 (A3 space), 84 (G3 line)
        // Need ledger lines for D4 (60), B3 (72), G3 (84) -> these are lines
        if (snappedY >= bottomStaffLineY + LINE_SPACING) { // D4 or lower requires ledger lines
            // Number of lines = floor((snappedY - bottomStaffLineY - halfSpacing) / LINE_SPACING) + 1?
            // D4 (60): floor((60 - 48 - 6)/12) = floor(6/12)=0. Needs 1.
            // C4 (66): floor((66 - 48 - 6)/12) = floor(12/12)=1. Needs 1 (D4 line).
            // B3 (72): floor((72 - 48 - 6)/12) = floor(18/12)=1. Needs 2.
            // A3 (78): floor((78 - 48 - 6)/12) = floor(24/12)=2. Needs 2 (B3 line).
            // G3 (84): floor((84 - 48 - 6)/12) = floor(30/12)=2. Needs 3.
            ledgerLinesNeeded = Math.floor((snappedY - bottomStaffLineY + halfSpacing) / LINE_SPACING);
        }
    }

    // Clamp ledger lines
    ledgerLinesNeeded = Math.max(-MAX_LEDGER_LINES, Math.min(MAX_LEDGER_LINES, ledgerLinesNeeded));

    return { snappedY, ledgerLinesNeeded };
}

/**
 * Updates the visibility and position of ledger lines.
 * @param {SVGSVGElement} svg - The main SVG element.
 * @param {SVGGElement} group - The SVG group element for ledger lines.
 * @param {number} ledgerLinesNeeded - Positive for below, negative for above.
 * @param {number} snappedY - The snapped Y position of the cursor.
 * @param {number} cursorX - The X position of the cursor.
 */
function updateLedgerLines(svg, group, ledgerLinesNeeded, snappedY, cursorX) {
    group.innerHTML = ''; // Clear existing lines

    const ledgerLineLength = CURSOR_RADIUS * 2 + LEDGER_LINE_EXTENSION * 2;
    const x1 = cursorX - ledgerLineLength / 2;
    const x2 = cursorX + ledgerLineLength / 2;

    if (ledgerLinesNeeded < 0) { // Lines above staff
        const numLines = Math.abs(ledgerLinesNeeded);
        for (let i = 1; i <= numLines; i++) {
            // Calculate Y position for each ledger line above the staff
            // Top line is E5 (Y=0). G5 is Y=-12. A5 is Y=-24. B5 is Y=-36. C6 is Y=-48? No, C6 is Y=-36
            // Let's use standard notation mapping later. For now, just draw lines based on count.
            // Lines are needed at Y = -12, -24, -36, -48
            const lineY = -i * LINE_SPACING;
             // Only draw the line if the cursor is *on* or *through* it
             // If cursor is on C6 space (snappedY=-30), need A5 line (-24)
             // If cursor is on C6 line (snappedY=-36), need A5 line (-24) and C6 line (-36)
             // Draw line if lineY >= snappedY
            if (lineY >= snappedY - halfSpacing) { // Draw if cursor is at or below this line's position
                const line = document.createElementNS(SVG_NAMESPACE, "line");
                line.setAttribute("x1", x1);
                line.setAttribute("y1", lineY);
                line.setAttribute("x2", x2);
                line.setAttribute("y2", lineY);
                line.setAttribute("stroke", STROKE_COLOR);
                line.setAttribute("stroke-width", STROKE_WIDTH);
                group.appendChild(line);
            }
        }
    } else if (ledgerLinesNeeded > 0) { // Lines below staff
        const numLines = ledgerLinesNeeded;
        const bottomStaffLineY = STAFF_HEIGHT;
        for (let i = 1; i <= numLines; i++) {
            // Calculate Y position for each ledger line below the staff
            // Bottom line F4 (Y=48). D4 is Y=60. C4 is Y=72. B3 is Y=84? No, B3 is Y=72
            // Lines are needed at Y = 60, 72, 84, 96
            const lineY = bottomStaffLineY + i * LINE_SPACING;
            // Only draw the line if the cursor is *on* or *through* it
            // If cursor is on C4 space (snappedY=66), need D4 line (60)
            // If cursor is on B3 line (snappedY=72), need D4 line (60) and B3 line (72)
            // Draw line if lineY <= snappedY
            const halfSpacing = LINE_SPACING / 2;
            if (lineY <= snappedY + halfSpacing) { // Draw if cursor is at or above this line's position
                const line = document.createElementNS(SVG_NAMESPACE, "line");
                line.setAttribute("x1", x1);
                line.setAttribute("y1", lineY);
                line.setAttribute("x2", x2);
                line.setAttribute("y2", lineY);
                line.setAttribute("stroke", STROKE_COLOR);
                line.setAttribute("stroke-width", STROKE_WIDTH);
                group.appendChild(line);
            }
        }
    }
}


// --- Event Handlers ---

function handleStaffMouseMove(event, svg) {
    const coords = getSVGCoordinates(svg, event);
    // console.log(`Mouse Move - SVG Coords: x=${coords.x.toFixed(2)}, y=${coords.y.toFixed(2)}`);

    // Ensure cursor stays within horizontal bounds where lines are drawn
    const viewBoxWidth = parseFloat(svg.getAttribute("viewBox").split(' ')[2]);
    const cursorX = Math.max(STAFF_START_X + CURSOR_RADIUS + LEDGER_LINE_EXTENSION, Math.min(coords.x, viewBoxWidth - STAFF_END_X_MARGIN - CURSOR_RADIUS - LEDGER_LINE_EXTENSION));


    const { snappedY, ledgerLinesNeeded } = getVerticalPositionInfo(coords.y);

    // Update Cursor
    const cursorIndicator = svg.getElementById("cursor-indicator");
    if (cursorIndicator) {
        cursorIndicator.setAttribute("cx", cursorX);
        cursorIndicator.setAttribute("cy", snappedY);
        cursorIndicator.setAttribute("visibility", "visible");
    }

    // Update Ledger Lines
    const ledgerLinesGroup = svg.getElementById("ledger-lines-group");
    if (ledgerLinesGroup) {
        updateLedgerLines(svg, ledgerLinesGroup, ledgerLinesNeeded, snappedY, cursorX);
    }
}

function handleStaffMouseLeave(event, svg) {
    // Hide Cursor
    const cursorIndicator = svg.getElementById("cursor-indicator");
    if (cursorIndicator) {
        cursorIndicator.setAttribute("visibility", "hidden");
    }

    // Clear Ledger Lines
    const ledgerLinesGroup = svg.getElementById("ledger-lines-group");
    if (ledgerLinesGroup) {
        ledgerLinesGroup.innerHTML = ''; // Clear lines
    }
     console.log("Mouse Leave Staff");
}


function handleStaffMouseDown(event, svg) {
    const coords = getSVGCoordinates(svg, event);
    console.log(`Mouse Down - SVG Coords: x=${coords.x.toFixed(2)}, y=${coords.y.toFixed(2)}`);
    // Future: Place note, trigger sound
}

function handleStaffMouseUp(event, svg) {
    const coords = getSVGCoordinates(svg, event);
    console.log(`Mouse Up - SVG Coords: x=${coords.x.toFixed(2)}, y=${coords.y.toFixed(2)}`);
    // Future: Stop sound
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

    // Group for ledger lines
    const ledgerLinesGroup = document.createElementNS(SVG_NAMESPACE, "g");
    ledgerLinesGroup.id = "ledger-lines-group";
    svg.appendChild(ledgerLinesGroup);

    // Cursor indicator (initially hidden)
    const cursorIndicator = document.createElementNS(SVG_NAMESPACE, "circle");
    cursorIndicator.id = "cursor-indicator";
    cursorIndicator.setAttribute("r", CURSOR_RADIUS);
    cursorIndicator.setAttribute("fill", CURSOR_COLOR);
    cursorIndicator.setAttribute("visibility", "hidden"); // Start hidden
    svg.appendChild(cursorIndicator);


     const interactionLayer = document.createElementNS(SVG_NAMESPACE, "rect");
     interactionLayer.setAttribute("x", STAFF_START_X);
     interactionLayer.setAttribute("y", -LINE_SPACING * 2); // Cover area above/below staff
     interactionLayer.setAttribute("width", viewBoxWidth - STAFF_START_X);
     interactionLayer.setAttribute("height", STAFF_HEIGHT + LINE_SPACING * 4);
     interactionLayer.setAttribute("fill", "transparent"); // Make it invisible
     interactionLayer.id = "staff-interaction-layer"; // ID for attaching events
     svg.appendChild(interactionLayer);

    // Attach event listeners to the interaction layer
    interactionLayer.addEventListener('mousemove', (e) => handleStaffMouseMove(e, svg));
    interactionLayer.addEventListener('mousedown', (e) => handleStaffMouseDown(e, svg));
    // Mouseup might be better on the window to catch releases outside the SVG
    window.addEventListener('mouseup', (e) => {
        // Check if the mouse *down* originated within the staff area if needed,
        // but for now, just log any mouseup.
        // We pass the SVG element for coordinate conversion context if needed later.
        handleStaffMouseUp(e, svg);
    });
    // Add mouseleave to hide cursor/ledger lines
    interactionLayer.addEventListener('mouseleave', (e) => handleStaffMouseLeave(e, svg));


    console.log(`Staff rendered in #${containerId}`);
}
