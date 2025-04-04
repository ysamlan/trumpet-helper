// Constants for staff rendering
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const STAFF_LINES = 5;
const LINE_SPACING = 12; // Vertical distance between lines
const STAFF_HEIGHT = (STAFF_LINES - 1) * LINE_SPACING;
const CLEF_X = 42; // X position of the clef
const CLEF_Y_OFFSET = 16; // Fine-tuning clef vertical position relative to center line
const STAFF_START_X = 50; // Where staff lines begin after clef
const STAFF_END_X_MARGIN = 10; // Margin from the right edge
const STROKE_COLOR = "#333"; // Color for lines and clef
const STROKE_WIDTH = 1.5;
const MAX_LEDGER_LINES = 4;
const LEDGER_LINE_EXTENSION = 8; // How far ledger line extends past cursor center
const CURSOR_RADIUS = LINE_SPACING / 2.5; // Radius of the cursor indicator
const CURSOR_COLOR = "rgba(50, 50, 200, 0.6)"; // Semi-transparent blue
const PLACED_NOTE_COLOR = "#666666"; // Lighter gray for placed note
const NOTE_HEAD_RX = LINE_SPACING / 2.2; // Horizontal radius for ellipse note head
const NOTE_HEAD_RY = LINE_SPACING / 2.8; // Vertical radius for ellipse note head

// --- Imports for Interaction ---
import { getFingering } from './data.js';
import { updateTrumpetSVG } from './trumpet.js';
import { getSampler, ensureAudioContextStarted } from './audio.js';

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
    // Use viewBox for scalability.
    // Calculate height needed for staff + MAX_LEDGER_LINES above and below, plus one extra space buffer.
    const totalVerticalSpaces = (STAFF_LINES - 1) + (MAX_LEDGER_LINES * 2) + 1; // Staff intervals + ledger lines + buffer
    const viewboxHeight = totalVerticalSpaces * LINE_SPACING;
    // Calculate top Y for viewBox: -(Spaces for max ledger lines + buffer space)
    const viewboxY = -(MAX_LEDGER_LINES + 0.5) * LINE_SPACING; // Start slightly above the 4th ledger line space
    // Example: MAX_LEDGER_LINES=4 -> viewboxY = -4.5 * 12 = -54
    // Example: viewboxHeight = (4 + 8 + 1) * 12 = 13 * 12 = 156
    // ViewBox will span Y=-54 to Y=102
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
    // Position Y based on the middle line (D5 line, Y=12, Step 2)
    const middleLineY = 2 * (LINE_SPACING / 2); // Calculate Y for Step 2
    clef.setAttribute("y", middleLineY + CLEF_Y_OFFSET);
    clef.setAttribute("font-size", `${STAFF_HEIGHT * 2.4}px`); // Adjust size relative to staff height
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

// --- Note Calculation Data (C Major) ---

// Maps vertical steps (half line spacings) relative to the TOP staff line (F5, Y=0, step=0)
// to note names in C Major. Covers range from 4 ledger lines above to 4 below.
// Based on standard Treble Clef notation (Lines EGBDF, Spaces FACE from bottom up).
const STEP_TO_NOTE_MAP = Object.freeze({
  // Notes above staff
  [-9]: "A6",  // Y=-54 (Space above 4th ledger)
  [-8]: "G6",  // Y=-48 (4th ledger line above)
  [-7]: "F6",  // Y=-42 (Space above 3rd ledger)
  [-6]: "E6",  // Y=-36 (3rd ledger line above)
  [-5]: "D6",  // Y=-30 (Space above 2nd ledger)
  [-4]: "C6",  // Y=-24 (2nd ledger line above)
  [-3]: "B5",  // Y=-18 (Space above 1st ledger)
  [-2]: "A5",  // Y=-12 (1st ledger line above)
  [-1]: "G5",  // Y=-6  (Space above staff)
  // Staff notes
  [0]: "F5",   // Y=0   (Line 1 - Top)
  [1]: "E5",   // Y=6   (Space 1)
  [2]: "D5",   // Y=12  (Line 2)
  [3]: "C5",   // Y=18  (Space 2)
  [4]: "B4",   // Y=24  (Line 3)
  [5]: "A4",   // Y=30  (Space 3)
  [6]: "G4",   // Y=36  (Line 4 - G Clef Line)
  [7]: "F4",   // Y=42  (Space 4 - Bottom Space)
  [8]: "E4",   // Y=48  (Line 5 - Bottom)
  // Notes below staff
  [9]: "D4",   // Y=54  (Space below staff)
  [10]: "C4",  // Y=60  (1st ledger line below - Middle C)
  [11]: "B3",  // Y=66  (Space below 1st ledger)
  [12]: "A3",  // Y=72  (2nd ledger line below)
  [13]: "G3",  // Y=78  (Space below 2nd ledger)
  [14]: "F3",  // Y=84  (3rd ledger line below)
  [15]: "E3",  // Y=90  (Space below 3rd ledger)
  [16]: "D3",  // Y=96  (4th ledger line below)
  [17]: "C3"   // Y=102 (Space below 4th ledger)
  // B2 would be Step 18 / Y=108
});


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
        // Notes on E5 line (Y=0) down to F5 space (Y=-6) need 0 lines.
        // The first ledger line (at Y=-12) is needed for the G5 line (snappedY=-12) and positions above it.
        if (snappedY <= -LINE_SPACING) { // G5 line or higher (Y <= -12)
            // Calculate how many lines are needed above the staff.
            // Formula derived by testing thresholds: n = ceil( (abs(snappedY) - halfSpacing) / LINE_SPACING )
            // Example G5 (snappedY=-12): -ceil((12-6)/12) = -ceil(0.5) = -1 (Correct)
            // Example A5 (snappedY=-18): -ceil((18-6)/12) = -ceil(1) = -1 (Correct)
            // Example B5 (snappedY=-24): -ceil((24-6)/12) = -ceil(1.5) = -2 (Correct)
            ledgerLinesNeeded = -Math.ceil( (Math.abs(snappedY) - halfSpacing) / LINE_SPACING );
        }
        // ledgerLinesNeeded remains 0 if the condition isn't met (i.e., snappedY > -18).
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
 * Calculates the note name (pitch and octave) based on the snapped Y position.
 * Assumes C Major key signature initially.
 * @param {number} snappedY - The Y coordinate snapped to the nearest line or space.
 * @returns {string | null} The note name (e.g., "C4", "F#5") or null if position is out of range.
 */
function getNoteFromPosition(snappedY) {
    const halfSpacing = LINE_SPACING / 2;
    const stepCalculation = snappedY / halfSpacing;
    const step = Math.round(stepCalculation); // Calculate step relative to E5 (step 0)
    console.log(`[getNoteFromPosition] Input snappedY: ${snappedY}`);
    console.log(`[getNoteFromPosition] halfSpacing: ${halfSpacing}`);
    console.log(`[getNoteFromPosition] Raw Step Calc (snappedY / halfSpacing): ${stepCalculation}`);
    console.log(`[getNoteFromPosition] Rounded Step: ${step}`);

    const noteName = STEP_TO_NOTE_MAP[step];
    console.log(`[getNoteFromPosition] Looked up Note Name: ${noteName || 'Not Found in Map'}`);

    if (noteName) {
        // console.log(`Snapped Y: ${snappedY}, Step: ${step} -> Note: ${noteName}`); // Original log, now redundant
        return noteName;
    } else {
        console.warn(`[getNoteFromPosition] No note defined for Step: ${step} (Snapped Y: ${snappedY})`);
        return null; // Position is outside the defined range
    }
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
    // const halfSpacing = LINE_SPACING / 2; // No longer needed for drawing condition

    const ledgerLineLength = CURSOR_RADIUS * 2 + LEDGER_LINE_EXTENSION * 2;
    const x1 = cursorX - ledgerLineLength / 2;
    const x2 = cursorX + ledgerLineLength / 2;

    if (ledgerLinesNeeded < 0) { // Lines above staff
        const numLines = Math.abs(ledgerLinesNeeded);
        // console.log(`Drawing ${numLines} ledger lines ABOVE staff (snappedY: ${snappedY}).`); // Keep for debugging if needed
        // Iterate from the first ledger line above (Y = -LINE_SPACING) up to the required number.
        for (let i = 1; i <= numLines; i++) {
            const lineY = -i * LINE_SPACING;
            // Draw the line regardless of snappedY; the number is determined by ledgerLinesNeeded
            const line = document.createElementNS(SVG_NAMESPACE, "line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", lineY);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", lineY);
            line.setAttribute("stroke", STROKE_COLOR);
            line.setAttribute("stroke-width", STROKE_WIDTH); // Use constant
            group.appendChild(line);
        }
    } else if (ledgerLinesNeeded > 0) { // Lines below staff
        const numLines = ledgerLinesNeeded;
        // console.log(`Drawing ${numLines} ledger lines BELOW staff (snappedY: ${snappedY}).`); // Keep for debugging if needed
        const bottomStaffLineY = (STAFF_LINES - 1) * LINE_SPACING; // Y position of the lowest staff line (F4)
        // Iterate from the first ledger line below (Y = bottomStaffLineY + LINE_SPACING) down to the required number.
        for (let i = 1; i <= numLines; i++) {
            const lineY = bottomStaffLineY + i * LINE_SPACING;
            // Draw the line regardless of snappedY; the number is determined by ledgerLinesNeeded
            const line = document.createElementNS(SVG_NAMESPACE, "line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", lineY);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", lineY);
            line.setAttribute("stroke", STROKE_COLOR);
            line.setAttribute("stroke-width", STROKE_WIDTH); // Use constant
            group.appendChild(line);
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
    console.log(`[MouseMove] Vertical Info: snappedY=${snappedY}, ledgerLinesNeeded=${ledgerLinesNeeded}`); // Log values used for rendering

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
    const { snappedY } = getVerticalPositionInfo(coords.y); // Get snapped Y for note calculation
    console.log(`[MouseDown] Coords: x=${coords.x.toFixed(2)}, y=${coords.y.toFixed(2)}`);
    console.log(`[MouseDown] Calculated Snapped Y for Note: ${snappedY}`); // Log the snappedY being passed

    const noteName = getNoteFromPosition(snappedY); // Call the function

    console.log(`[MouseDown] Final Result: Note Name = ${noteName || 'Out of range'}`); // Log the final result

    // --- Display Placed Note ---
    const placedNoteElement = svg.getElementById("placed-note");
    if (placedNoteElement) {
        if (noteName) {
            // Calculate horizontal position, constrained like the cursor
            const viewBoxWidth = parseFloat(svg.getAttribute("viewBox").split(' ')[2]);
            const cursorX = Math.max(
                STAFF_START_X + NOTE_HEAD_RX + LEDGER_LINE_EXTENSION, // Adjust for ellipse radius
                Math.min(coords.x, viewBoxWidth - STAFF_END_X_MARGIN - NOTE_HEAD_RX - LEDGER_LINE_EXTENSION)
            );

            placedNoteElement.setAttribute("cx", cursorX);
            placedNoteElement.setAttribute("cy", snappedY);
            // Optional: Adjust rotation center if rotating
            // placedNoteElement.setAttribute("transform", `rotate(-15 ${cursorX} ${snappedY})`);
            placedNoteElement.setAttribute("visibility", "visible");
            console.log(`[MouseDown] Displaying placed note at x=${cursorX.toFixed(2)}, y=${snappedY}`);
        } else {
            // Hide the note if the click was out of range
            placedNoteElement.setAttribute("visibility", "hidden");
            console.log(`[MouseDown] Hiding placed note (click out of range)`);
        }
    }

    // --- Update Trumpet Fingering Display ---
    const fingeringInfo = noteName ? getFingering(noteName) : null;
    const primaryFingering = fingeringInfo ? fingeringInfo.primary : null;
    console.log(`[MouseDown] Fingering Info:`, fingeringInfo);
    console.log(`[MouseDown] Calling updateTrumpetSVG with:`, primaryFingering);
    updateTrumpetSVG(primaryFingering); // Update trumpet visual

    // --- Trigger Audio ---
    // Ensure audio context is started (required on user gesture)
    ensureAudioContextStarted(); // No need to await, let it run in background

    const sampler = getSampler();
    if (noteName && sampler) {
        console.log(`[MouseDown] Triggering audio attack for: ${noteName}`);
        try {
            sampler.triggerAttack(noteName);
        } catch (error) {
            console.error(`Error triggering attack for note ${noteName}:`, error);
        }
        // Future: Display alternate fingerings (Phase 5)
    } else if (!sampler) {
        console.warn("[MouseDown] Sampler not ready, cannot play audio.");
    } else { // noteName is null
        // Future: Clear alternate fingerings display (Phase 5)
    }
}

function handleStaffMouseUp(event, svg) {
    // We don't necessarily need coordinates for mouseup action itself
    // const coords = getSVGCoordinates(svg, event);
    console.log(`Mouse Up detected (global listener).`);

    // --- Stop Audio ---
    const sampler = getSampler();
    if (sampler) {
        console.log("[MouseUp] Triggering audio release.");
        try {
            // Release all currently playing notes on this sampler
            sampler.triggerRelease();
        } catch (error) {
            console.error("Error triggering release:", error);
        }
    } else {
        // Sampler might not be ready yet, or failed to load. Log is handled in getSampler.
    }
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

    // Placed note indicator (initially hidden)
    const placedNote = document.createElementNS(SVG_NAMESPACE, "ellipse");
    placedNote.id = "placed-note";
    placedNote.setAttribute("rx", NOTE_HEAD_RX);
    placedNote.setAttribute("ry", NOTE_HEAD_RY);
    placedNote.setAttribute("fill", PLACED_NOTE_COLOR);
    placedNote.setAttribute("visibility", "hidden"); // Start hidden
    // Add slight rotation for a more traditional note head look
    // placedNote.setAttribute("transform", "rotate(-15)"); // Optional: Requires cx, cy for rotation center
    notesGroup.appendChild(placedNote); // Add to notes group

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


     // Get the calculated viewBox Y and Height to size the interaction layer correctly
     const [vbX, vbY, vbWidth, vbHeight] = svg.getAttribute("viewBox").split(' ').map(parseFloat);

     const interactionLayer = document.createElementNS(SVG_NAMESPACE, "rect");
     interactionLayer.setAttribute("x", STAFF_START_X);
     interactionLayer.setAttribute("y", vbY); // Match viewBox top
     interactionLayer.setAttribute("width", viewBoxWidth - STAFF_START_X); // Use calculated width
     interactionLayer.setAttribute("height", vbHeight); // Match viewBox height
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
