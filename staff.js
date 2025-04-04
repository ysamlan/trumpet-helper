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
    // Calculate position relative to the top line (E5 = Y=0), rounding to nearest half-step (line or space)
    const position = Math.round(yCoord / halfSpacing);
    const snappedY = position * halfSpacing;
    console.log(`Raw Y: ${yCoord.toFixed(2)}, Snapped Y: ${snappedY}`); // Log raw and snapped Y

    let ledgerLinesNeeded = 0;
    const topStaffLineY = 0;
    const bottomStaffLineY = STAFF_HEIGHT; // Y=48 (F4 line)

    if (snappedY < topStaffLineY) { // Notes above staff (E5 line is Y=0)
        // Ledger lines start for notes above G5 (Y=-12)
        // A5 space (Y=-18) needs 1 line. B5 line (Y=-24) needs 1 line.
        // C6 space (Y=-30) needs 2 lines. D6 line (Y=-36) needs 2 lines.
        if (snappedY <= -LINE_SPACING - halfSpacing) { // A5 space or higher
            // Calculate how many lines are needed above the staff.
            // Formula: ceil( abs(Y_coord / LineSpacing) - 1 )
            ledgerLinesNeeded = -Math.ceil( Math.abs(snappedY / LINE_SPACING) - 1);
        }
        // Notes from F5 space (Y=-6) to G5 line (Y=-12) need 0 lines.
        // Notes on E5 line (Y=0) need 0 lines.
        // ledgerLinesNeeded remains 0 if the condition isn't met.

    } else if (snappedY > bottomStaffLineY) { // Notes below staff (F4 line is Y=48)
        // Ledger lines start for notes below E4 (Y=54)
        // D4 line (Y=60) needs 1 line. C4 space (Y=66) needs 1 line.
        // B3 line (Y=72) needs 2 lines. A3 space (Y=78) needs 2 lines.
        if (snappedY >= bottomStaffLineY + LINE_SPACING) { // D4 line or lower
            // Calculate how many lines are needed below the staff.
            // Formula: ceil( (Y_coord - BottomLineY - HalfSpacing) / LineSpacing )
            ledgerLinesNeeded = Math.ceil( (snappedY - bottomStaffLineY - halfSpacing) / LINE_SPACING );
        }
        // Notes on F4 line (Y=48) or E4 space (Y=54) need 0 lines.
        // ledgerLinesNeeded remains 0 if the condition isn't met.
    }

    console.log(`Calculated ledgerLinesNeeded (before clamp): ${ledgerLinesNeeded}`); // Log calculated value

    // Clamp ledger lines
    const clampedLedgerLines = Math.max(-MAX_LEDGER_LINES, Math.min(MAX_LEDGER_LINES, ledgerLinesNeeded));
    console.log(`Clamped ledgerLinesNeeded: ${clampedLedgerLines}`); // Log clamped value

    return { snappedY, ledgerLinesNeeded: clampedLedgerLines };
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
    const halfSpacing = LINE_SPACING / 2; // Define halfSpacing here

    const ledgerLineLength = CURSOR_RADIUS * 2 + LEDGER_LINE_EXTENSION * 2;
    const x1 = cursorX - ledgerLineLength / 2;
    const x2 = cursorX + ledgerLineLength / 2;

    if (ledgerLinesNeeded < 0) { // Lines above staff
        const numLines = Math.abs(ledgerLinesNeeded);
        console.log(`Drawing ${numLines} ledger lines ABOVE staff (snappedY: ${snappedY}).`); // Log how many lines to attempt
        for (let i = 1; i <= numLines; i++) {
            // Calculate Y position for each ledger line above the staff
            // Lines are needed at Y = -12 (G5), -24 (A5), -36 (C6), -48 (E6)
            const lineY = -i * LINE_SPACING;
             // Only draw the line if the cursor is *on* or *through* it
             // If cursor is on C6 space (snappedY=-30), need A5 line (-24)
             // If cursor is on C6 line (snappedY=-36), need A5 line (-24) and C6 line (-36)
             // Draw line if lineY >= snappedY (e.g., line at -24, cursor at -30 (B5 space) -> draw; cursor at -24 (B5 line) -> draw)
             const drawCondition = lineY >= snappedY - halfSpacing;
             console.log(`  Line ${i} (Y=${lineY}): Draw? ${drawCondition} (lineY >= snappedY - halfSpacing -> ${lineY} >= ${snappedY} - ${halfSpacing})`);
            if (drawCondition) { // Draw if cursor is at or below this line's position
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
        console.log(`Drawing ${numLines} ledger lines BELOW staff (snappedY: ${snappedY}).`); // Log how many lines to attempt
        for (let i = 1; i <= numLines; i++) {
            // Calculate Y position for each ledger line below the staff
            // Lines are needed at Y = 60 (D4), 72 (B3), 84 (G3), 96 (E3)
            const lineY = bottomStaffLineY + i * LINE_SPACING;
            // Only draw the line if the cursor is *on* or *through* it
            // If cursor is on C4 space (snappedY=66), need D4 line (60)
            // If cursor is on B3 line (snappedY=72), need D4 line (60) and B3 line (72)
            // Draw line if lineY <= snappedY (e.g., line at 60, cursor at 66 (C4 space) -> draw; cursor at 72 (B3 line) -> draw)
            const drawCondition = lineY <= snappedY + halfSpacing;
             console.log(`  Line ${i} (Y=${lineY}): Draw? ${drawCondition} (lineY <= snappedY + halfSpacing -> ${lineY} <= ${snappedY} + ${halfSpacing})`);
            if (drawCondition) { // Draw if cursor is at or above this line's position
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
