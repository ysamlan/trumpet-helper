**Prompt 1.1 (HTML Boilerplate & Basic Layout)**
```text
Based on the project specification for the Trumpet Fingering Helper, create the initial `index.html` file. Include:
1.  Standard HTML5 boilerplate (`<!DOCTYPE html>`, `html`, `head`, `body`).
2.  Basic `<meta>` tags (charset, viewport).
3.  A `<title>`.
4.  A link to a `style.css` file (which we'll create next).
5.  Inside the `<body>`, create a main container div (e.g., `<div id="app-container">`).
6.  Inside the container, add placeholder divs with IDs: `staff-area`, `controls-area`, `trumpet-area`, `fingering-options-area`.
Provide the complete HTML code.
Prompt 1.2 (Basic CSS Styling)Create the `style.css` file referenced in the previous HTML. Add CSS rules to:
1.  Apply basic resets (e.g., `box-sizing: border-box;`).
2.  Style `body` and `#app-container` (e.g., set font-family to sans-serif, control basic margins/padding).
3.  Use Flexbox or Grid on `#app-container` to arrange the main areas. Group them conceptually: create styles for a `.left-panel` containing `staff-area` and `controls-area`, and a `.right-panel` containing `trumpet-area` and `fingering-options-area`. Arrange `.left-panel` and `.right-panel` side-by-side within `#app-container` for a wide-screen default view.
4.  Give each of the four main area divs (`staff-area`, etc.) distinct background colors and minimum heights (e.g., `200px`) so their positions are clearly visible.
Provide the complete CSS code. Update the HTML from Prompt 1.1 to include the `.left-panel` and `.right-panel` wrapper divs if needed for the CSS structure.
Prompt 1.3 (Render Static Staff - SVG)Create a JavaScript file, e.g., `staff.js`. Write an exported function `renderStaff(containerId)` that:
1.  Selects the container element by its ID (e.g., 'staff-area').
2.  Clears any existing content in the container.
3.  Creates an SVG element dynamically and appends it to the container. Set appropriate width (e.g., 100%) and viewBox (e.g., `0 0 800 150`). Make the SVG focusable (`tabindex="0"`).
4.  Inside the SVG, draws 5 horizontal lines representing the staff. Define constants for line spacing (e.g., `STAFF_LINE_SPACING = 15`) and calculate Y positions relative to the viewBox. Make lines black, 1px thick. Store the Y position of the top staff line (E5) and bottom staff line (F4) in constants or module variables.
5.  Draws a Treble Clef symbol (using an SVG `<path>` or a `<text>` element with the Unicode character '𝄞') at the beginning of the staff. Position it correctly relative to the staff lines.
6.  Create a main `app.js` file. Import `renderStaff` from `staff.js`. Call `renderStaff('staff-area')` when the DOM is loaded.
7.  Update `index.html` to include `<script type="module" src="app.js"></script>`. Ensure `staff.js` uses `export` for the function.
Provide the complete code for `staff.js`, `app.js`, and any necessary updates to `index.html`.
Prompt 1.4 (Staff Hover & Click Detection)Modify `staff.js`. Enhance the `renderStaff` function (or add a new initialization function called after rendering):
1.  Get a reference to the created staff SVG element.
2.  Add event listeners to the SVG for `mousemove`, `mousedown`, and `mouseup`.
3.  In the `mousemove` handler, get the mouse coordinates relative to the SVG element (use `event.offsetX`, `event.offsetY` or calculate from client coordinates and `getBoundingClientRect`). Calculate which line or space the mouse is currently over using `STAFF_LINE_SPACING`. Log this information (e.g., "Hovering over line 5", "Hovering over space 2") to the console.
4.  In the `mousedown` handler, get the coordinates and log similar information indicating a click event (e.g., "Clicked on line 4").
Provide the updated JavaScript code for `staff.js`.
Prompt 1.5 (Dynamic Ledger Line Display)Modify `staff.js`.
1.  Define constants for maximum ledger lines (`MAX_LEDGER_LINES = 4`) and ledger line width (e.g., `LEDGER_LINE_WIDTH = 40`).
2.  Create helper functions within `staff.js`:
    * `clearLedgerLines(svgElement)`: Removes all SVG elements with a specific class, e.g., `.ledger-line`.
    * `addLedgerLine(svgElement, x, y)`: Creates a short horizontal SVG `<line>` element with class `.ledger-line` at the given x, y coordinates (centered horizontally at x) and appends it to the `svgElement`.
3.  In the `renderStaff` function (or init), create an SVG `<circle>` element with `id="cursor-indicator"`, set radius (e.g., `STAFF_LINE_SPACING / 2`), fill (e.g., 'black'), initially hidden (`visibility="hidden"`).
4.  Modify the `mousemove` handler:
    * Get mouse coordinates (`x`, `y`).
    * Calculate the snapped Y coordinate (`snappedY`) corresponding to the nearest staff line or space (including potential ledger line positions up to `MAX_LEDGER_LINES` above/below).
    * Call `clearLedgerLines()`.
    * Determine if `snappedY` corresponds to a ledger line position. If so, calculate the required ledger line Y positions between the staff and `snappedY` and call `addLedgerLine()` for each, passing the current mouse `x` for horizontal centering.
    * Update the `#cursor-indicator`'s `cx` to `x` and `cy` to `snappedY`. Set its `visibility` to `visible`.
5.  Add a `mouseleave` event listener to the staff SVG that calls `clearLedgerLines()` and hides the `#cursor-indicator`.
Provide the updated JavaScript code for `staff.js`.
Prompt 1.6 (Calculate Note from Click Position - Basic C Major)Modify `staff.js`.
1.  Define a reference note and its Y position (e.g., `REFERENCE_NOTE = "B4"` for the middle line, `MIDDLE_LINE_Y = ...`).
2.  Create an exported function `getNoteFromPosition(yCoord)`:
    * Calculate the number of steps (half-lines) the `yCoord` is away from the `REFERENCE_NOTE`'s Y position (`MIDDLE_LINE_Y`). Remember `y` decreases going up.
    * Define an array representing the diatonic scale sequence relative to the reference note (e.g., starting from B4 in C Major: `['B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', ...] extending downwards too ['A4', 'G4', ... F3 etc.]`). Ensure this covers the range of 4 ledger lines above/below.
    * Use the calculated step difference to find the corresponding note name string from the array.
    * Return the note name string (e.g., "C4", "G5", "F3").
3.  In the `mousedown` event handler, get the `snappedY` from the cursor indicator's position. Call `noteName = getNoteFromPosition(snappedY)` and log `noteName` to the console.
Provide the updated JavaScript code for `staff.js`.
Prompt 1.7 (Display Clicked Note - Gray note head)Modify `staff.js`.
1.  In the `renderStaff` function (or init), create an SVG `<ellipse>` element with `id="placed-note"`. Style it like a whole note head (e.g., `rx=STAFF_LINE_SPACING*0.6`, `ry=STAFF_LINE_SPACING*0.45`), fill it with 'darkgray', and set `visibility="hidden"`.
2.  In the `mousedown` event handler:
    * Get the `snappedY` and current cursor `x` (from the cursor indicator's position).
    * Call `noteName = getNoteFromPosition(snappedY)`.
    * Update the `#placed-note`'s `cx` to `x` and `cy` to `snappedY`. Set its `visibility` to `visible`.
    * Store the calculated `noteName` in a module-level variable `currentNote` within `staff.js` (or handle state later in `app.js`).
Provide the updated JavaScript code for `staff.js`.
Prompt 2.1 (Define Fingering Data Structure)Create a new file `data.js`.
1.  Define and export a constant JavaScript object named `fingeringData`.
2.  The keys of `fingeringData` should be note name strings (e.g., "C4", "F#5").
3.  The values should be objects with two properties:
    * `primary`: An array representing the primary fingering (e.g., `[]` for open, `[2]` for second valve, `[1, 3]` for first and third).
    * `alternates`: An array of arrays, where each inner array is an alternate fingering (e.g., `[[1, 3], [2, 3]]`). Can be an empty array `[]` if no alternates.
4.  Populate `fingeringData` with sample entries for at least C4, C#4, D4, E4, F4, F#4, G4. Include alternates where appropriate (e.g., for C#4).
Provide the complete code for `data.js`.
Prompt 2.2 (Basic Trumpet SVG)Create a new file `trumpet.js`.
1.  Write an exported function `renderTrumpetSVG(containerId)` that:
    * Selects the container element (e.g., 'trumpet-area') and clears it.
    * Creates an SVG element, sets width/viewBox (e.g., `0 0 300 150`).
    * Draws a basic representation of a trumpet (side view, bell right) using SVG paths or shapes. Keep it relatively simple.
    * Draws three valve casings and three valve caps (circles or rectangles) on top, in the default 'up' position.
    * Assign unique IDs to the movable valve cap elements: `valve-cap-1`, `valve-cap-2`, `valve-cap-3`.
2.  In `app.js`, import `renderTrumpetSVG` and call it for the 'trumpet-area' container on DOM load.
Provide the complete code for `trumpet.js` and the necessary updates to `app.js`.
Prompt 2.3 (Function to Get Fingering for Note)Modify `data.js`.
1.  Add an exported function `getFingering(noteName)` that takes a note name string as input.
2.  Inside the function, it should access the `fingeringData` object and return the corresponding value (the object `{ primary: ..., alternates: ... }`) if the `noteName` exists as a key.
3.  If the `noteName` is not found in `fingeringData`, the function should return `null`.
Provide the updated code for `data.js`.
Prompt 2.4 (Function to Update SVG - Position)Modify `trumpet.js`.
1.  Define a constant `VALVE_PRESSED_OFFSET_Y` (e.g., 10).
2.  Create an exported function `updateTrumpetSVG(fingeringArray)` that takes an array (e.g., `[1, 3]`) or `null`.
3.  Inside the function:
    * Iterate through valve numbers 1, 2, 3.
    * For each valve number, select the corresponding valve cap element (e.g., `#valve-cap-1`).
    * Check if the current valve number is present in the `fingeringArray`.
    * If present, apply a `transform="translateY(VALVE_PRESSED_OFFSET_Y)"` attribute to the valve cap element.
    * If not present (or if `fingeringArray` is null), remove the `transform` attribute or set it to `translateY(0)`.
Provide the updated code for `trumpet.js`.
Prompt 2.5 (Add Color Highlight & Numbering)Modify `trumpet.js` and `style.css`.
1.  **In `style.css`:** Define CSS rules for highlighting pressed valves:
    * `.valve-pressed-1 { fill: #FF6347; } /* Tomato Red */`
    * `.valve-pressed-2 { fill: #90EE90; } /* Light Green */`
    * `.valve-pressed-3 { fill: #87CEFA; } /* Light Sky Blue */`
    * Define styles for `.valve-number` text elements (e.g., `font-size`, `fill`, `text-anchor="middle"`, `dominant-baseline="middle"`, `pointer-events="none"`).
2.  **In `trumpet.js`, modify `updateTrumpetSVG(fingeringArray)`:**
    * Inside the loop iterating through valves 1, 2, 3:
        * Get the valve cap element.
        * Remove existing highlight classes (`valve-pressed-1`, etc.) and number text (`.valve-number`) associated with *this specific valve* first.
        * If the valve is pressed (in `fingeringArray`):
            * Add the corresponding highlight class (e.g., `valve-pressed-1`).
            * Create an SVG `<text>` element with class `.valve-number`. Set its content to the valve number ("1", "2", or "3"). Calculate its `x` and `y` attributes to position it centered on the valve cap (adjust `y` slightly if needed due to the `translateY` transform). Append this text element to the SVG.
3.  Ensure the SVG rendering function (`renderTrumpetSVG`) defines the initial valve cap fill color or relies on a default CSS style.
Provide the updated code for `trumpet.js` and the new CSS rules for `style.css`.
Prompt 2.6 (Wire Note Selection -> Fingering Display)Modify `staff.js`.
1.  At the top, import `getFingering` from `data.js` and `updateTrumpetSVG` from `trumpet.js`.
2.  Modify the `mousedown` event handler:
    * After calculating `noteName = getNoteFromPosition(...)`:
    * Call `const fingeringInfo = getFingering(noteName);`.
    * If `fingeringInfo` is not null, call `updateTrumpetSVG(fingeringInfo.primary);`.
    * If `fingeringInfo` is null, call `updateTrumpetSVG(null);`.
Provide the updated code for `staff.js`.
Prompt 3.1 (Include Tone.js)Modify `index.html`.
1.  Add the Tone.js library script tag via CDN *before* your custom script tags (`app.js`, etc.). Use a specific version, e.g.:
    `<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js"></script>`
Provide the updated `index.html`.
Prompt 3.2 (Initialize Trumpet Sampler)Create a new file `audio.js`.
1.  Define a module-level variable `sampler = null;`.
2.  Create and export an `async function initAudio()`. Inside it:
    * Log "Initializing audio...".
    * Create the sampler: `sampler = new Tone.Sampler({ urls: { "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3", "A5": "A5.mp3" }, release: 1, baseUrl: "https://unpkg.com/tonejs-instruments@4.9.0/samples/trumpet/" }).toDestination();`
    * Use `await Tone.loaded();` to wait for samples to load.
    * Log "Audio ready.".
    * Handle potential errors during loading with try/catch.
3.  Export a function `getSampler()` that returns the `sampler` instance.
4.  Modify `app.js`: Import `initAudio` from `audio.js`. Call `initAudio()` when the DOM is loaded. Add basic user feedback, e.g., disable staff interaction until audio is ready or show a loading message.
Provide the code for `audio.js` and the necessary updates to `app.js`.
Prompt 3.3 (Play Note on Click/Hold, Stop on Release)Modify `staff.js`.
1.  Import `getSampler` from `audio.js`.
2.  Modify the `mousedown` handler:
    * After determining the final `noteName`:
    * Get the sampler instance: `const sampler = getSampler();`.
    * If `sampler` exists (is loaded), call `sampler.triggerAttack(noteName);`. Add a check `Tone.context.state !== 'running'` and call `Tone.start()` if needed (for user gesture requirement).
3.  Modify the `mouseup` handler (ensure it's attached to `window` or `document.body` to catch releases outside the staff):
    * Get the sampler instance: `const sampler = getSampler();`.
    * If `sampler` exists, call `sampler.triggerRelease();`.
Provide the updated code for `staff.js`. Ensure the mouseup listener is correctly added in `app.js` or `staff.js` initialization.
Prompt 3.4 (Handle Audio - No Fingering)Review the `mousedown` handler in `staff.js` from the previous step.
Confirm that `sampler.triggerAttack(noteName)` is called *after* `noteName` is determined, regardless of whether `getFingering(noteName)` returned null or valid data. If the logic currently prevents playing audio when fingering is null, modify it to *always* attempt `triggerAttack` with the calculated `noteName`.
Provide the potentially updated `mousedown` handler code in `staff.js`.
Prompt 4.1 (Implement Key Signature Data)Modify `data.js`.
1.  Define and export a constant object `keySignatures`.
2.  Populate it with entries for major keys (at least C, G, D, A, E, F, Bb, Eb, Ab).
3.  The structure for each key should be: `"Key Name": { notes: ["NoteLetter", ...], accidental: "#" or "b" }`.
    * Example: `"G Major": { notes: ["F"], accidental: "#" }`, `"F Major": { notes: ["B"], accidental: "b" }`, `"D Major": { notes: ["F", "C"], accidental: "#" }`.
    * Include C Major: `"C Major": { notes: [], accidental: null }`.
Provide the updated code for `data.js`.
Prompt 4.2 (Update Note Calculation - Key Signature)Modify `staff.js` and `app.js`.
1.  **In `app.js`:** Define a state variable `let currentKeySignature = "C Major";`. Export functions `getCurrentKeySignature()` and `setCurrentKeySignature(keyName)` to manage this state.
2.  **In `staff.js`:**
    * Import `getCurrentKeySignature` from `app.js` and `keySignatures` from `data.js`.
    * Modify `getNoteFromPosition(yCoord)`:
        * Remove the hardcoded C Major scale logic.
        * Determine the base note letter (A-G) and octave based on `yCoord` relative to a known reference (e.g., middle line B4).
        * Return an object `{ baseNote: 'B', octave: 4, noteName: 'B4' }` containing the base letter, octave, and the initial note name assuming C Major.
    * Modify the `mousedown` handler:
        * Call `const noteInfo = getNoteFromPosition(snappedY);`.
        * Get the current key: `const keyName = getCurrentKeySignature();`.
        * Get key signature rules: `const rules = keySignatures[keyName];`.
        * Check if `noteInfo.baseNote` is in `rules.notes`. If yes, append `rules.accidental` to the base note to create the final `noteName` (e.g., "F" + "#" -> "F#"). Otherwise, use the initial `noteInfo.noteName`. Store this final name.
        * Continue with display/audio logic using the final `noteName`.
Provide the updated code for `staff.js` and `app.js`.
Prompt 4.3 (Display Key Signature)Modify `staff.js` and `app.js`.
1.  **In `staff.js`:**
    * Import `keySignatures` from `data.js`.
    * Define standard Y positions for sharps/flats on the treble clef (e.g., `SHARP_POSITIONS = { F: y1, C: y2, ... }`, `FLAT_POSITIONS = { B: y3, E: y4, ... }`).
    * Create an exported function `displayKeySignature(keyName, staffSvgElement)`:
        * Select and remove any existing SVG elements with class `.key-signature-symbol` from `staffSvgElement`.
        * Get the rules: `const rules = keySignatures[keyName];`.
        * If `rules.notes.length > 0`: Determine the X position (e.g., after the clef). Loop through the standard order of sharps/flats. For each required accidental in `rules.notes`, create an SVG `<text>` element with class `.key-signature-symbol`, set content ("♯" or "♭"), position it at the correct X and standard Y position (`SHARP_POSITIONS` or `FLAT_POSITIONS`), and append it.
2.  **In `app.js`:**
    * Import `displayKeySignature`.
    * After calling `renderStaff`, get the staff SVG element reference.
    * Call `displayKeySignature(getCurrentKeySignature(), staffSvgElement)` initially.
    * Modify `setCurrentKeySignature(keyName)` to also call `displayKeySignature(keyName, staffSvgElement)`.
Provide the updated code for `staff.js` and `app.js`.
Prompt 4.4 (Accidental Selector UI)Modify `index.html` and `style.css`. Create `controls.js`.
1.  **In `index.html`:** Inside `controls-area`, add three buttons:
    `<button id="accidental-natural" data-accidental="natural">♮</button>`
    `<button id="accidental-sharp" data-accidental="sharp">♯</button>`
    `<button id="accidental-flat" data-accidental="flat">♭</button>`
2.  **In `style.css`:** Add styles for these buttons to look like a segmented control. Include styles for an `.accidental-btn.active` class (e.g., darker background, inset border).
3.  **Create `controls.js`:**
    * Export an `initAccidentalControls(callback)` function. It takes a callback function to be called when an accidental is selected/deselected.
    * Inside, get references to the three buttons.
    * Add event listeners to each button. On click:
        * Get the `data-accidental` value.
        * If the clicked button is already active, set `selectedAccidental` to `null` and remove the active class.
        * Otherwise, set `selectedAccidental` to the button's value, remove active class from all buttons, add active class to the clicked button.
        * Call the `callback(selectedAccidental)`.
    * Export a function `resetAccidentalButtons()` that removes the active class from all buttons.
4.  **In `app.js`:** Import `initAccidentalControls`, `resetAccidentalButtons`. Add state `let selectedAccidental = null;`. Call `initAccidentalControls((acc) => { selectedAccidental = acc; });`. Make `resetAccidentalButtons` accessible for later steps.
Provide code for `index.html` update, `style.css` additions, `controls.js`, and `app.js` updates.
Prompt 4.5 (Accidental Override Logic)Modify the `mousedown` handler in `staff.js`. Modify `app.js` to export state access.
1.  **In `app.js`:** Export `getSelectedAccidental()` which returns the `selectedAccidental` state variable.
2.  **In `staff.js`:**
    * Import `getSelectedAccidental` from `app.js`.
    * Modify the `mousedown` handler's note calculation logic:
        * Get `noteInfo = getNoteFromPosition(snappedY);`.
        * Get `const explicitAccidental = getSelectedAccidental();`.
        * Get `const keyName = getCurrentKeySignature();`.
        * Determine the final `noteName`:
            * Start with `let finalNote = noteInfo.baseNote;`
            * If `explicitAccidental === 'sharp'`, append '#'.
            * If `explicitAccidental === 'flat'`, append 'b'.
            * If `explicitAccidental === 'natural'`, keep as base note (do nothing here).
            * If `explicitAccidental === null` (no override): Check key signature `rules = keySignatures[keyName]`. If `noteInfo.baseNote` is in `rules.notes`, append `rules.accidental`.
            * Append the `noteInfo.octave` to `finalNote`. This is the final `noteName`.
        * Use this final `noteName` for display, audio, and fingering lookup.
Provide the updated code for `staff.js` and `app.js`.
Prompt 4.6 (Implement Accidental Display)Modify `staff.js`.
1.  In `renderStaff` (or init), create an SVG `<text>` element `id="placed-accidental"`, initially empty and hidden (`visibility="hidden"`). Style it appropriately (size, position relative to note head).
2.  Modify the `mousedown` handler:
    * After determining the `finalNoteName` and positioning the `#placed-note` element:
    * Determine if an accidental symbol is needed *visually*. This occurs if:
        * `finalNoteName` contains '#' or 'b'.
        * OR `explicitAccidental` was 'natural' AND the key signature *would have* applied an accidental to this base note.
    * If a symbol is needed:
        * Set the `textContent` of `#placed-accidental` to '♯', '♭', or '♮' accordingly.
        * Calculate its `x` position (e.g., slightly left of `#placed-note`.cx) and `y` position (`#placed-note`.cy). Update attributes.
        * Set `visibility="visible"`.
    * If no symbol is needed, set `visibility="hidden"` for `#placed-accidental`.
Provide the updated code for `staff.js`.
Prompt 4.7 (Accidental Selector Reset Logic)Modify `staff.js` and `app.js`.
1.  **In `app.js`:** Export `setSelectedAccidental(acc)` function to update the state. Ensure `resetAccidentalButtons` from `controls.js` is imported and accessible/exported if needed.
2.  **In `staff.js`:**
    * Import `setSelectedAccidental` from `app.js` and `resetAccidentalButtons` from `controls.js`.
    * In the `mousedown` handler, *after* all note processing (calculation, display, audio, fingering):
        * Call `setSelectedAccidental(null);`.
        * Call `resetAccidentalButtons();`.
Provide the updated code for `staff.js` and `app.js`.
Prompt 4.8 (Key Signature Button & Popup Placeholder)Modify `index.html`, `style.css`, and `app.js`.
1.  **In `index.html`:**
    * Inside `controls-area`, add `<button id="change-key-btn">C Major</button>`.
    * Somewhere in `<body>` (outside `#app-container` is fine), add the modal structure:
        `<div id="key-popup" class="modal hidden">
           <div class="modal-overlay"></div>
           <div class="modal-content">
             <button id="close-key-popup-btn" class="close-btn">&times;</button>
             <h3>Select Key Signature</h3>
             <div id="key-selection-area"></div>
           </div>
         </div>`
2.  **In `style.css`:** Add styles:
    * `.modal`: `position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 1000;`
    * `.modal.hidden`: `display: none;`
    * `.modal-overlay`: `position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: -1;`
    * `.modal-content`: `background-color: white; padding: 20px; border-radius: 8px; position: relative; min-width: 300px; max-width: 90%;`
    * `.close-btn`: Style appropriately (position absolute top-right, appearance).
3.  **In `app.js`:**
    * Add function `toggleKeyPopup(show)` that adds/removes the `.hidden` class from `#key-popup`.
    * Add event listener to `#change-key-btn` to call `toggleKeyPopup(true)`.
    * Add event listener to `#close-key-popup-btn` to call `toggleKeyPopup(false)`.
    * Add event listener to `.modal-overlay` to call `toggleKeyPopup(false)`.
    * Export a function `updateChangeKeyButtonText(keyName)` that sets the text content of `#change-key-btn`.
Provide the updated `index.html`, `style.css`, and `app.js`.
Prompt 4.9 (Radial Menu UI)Modify `style.css` and create `key_selector.js`.
1.  **In `style.css`:** Add styles for `#key-selection-area` and its children:
    * Make `#key-selection-area` suitable for positioning items radially (e.g., `position: relative; height: 250px; width: 250px; margin: 20px auto;`).
    * Style `.key-option` buttons (e.g., `position: absolute; width: 50px; height: 50px; border-radius: 50%; ...`).
    * Style `#key-toggle-sharp-flat` button positioned in the center.
2.  **Create `key_selector.js`:**
    * Import `keySignatures` from `data.js`.
    * Export `renderRadialMenu(containerId, mode, keySelectCallback)`. Mode is 'sharps' or 'flats'.
    * Inside, clear the container. Add the central toggle button `#key-toggle-sharp-flat`.
    * Filter `keySignatures` based on `mode` (sharps have '#' or null accidental, flats have 'b'). Include C Major in both. Limit to 7 sharps/flats.
    * Calculate positions on a circle (using sine/cosine).
    * For each key, create a `.key-option` button, set its text/content (e.g., key name), position it using `style.left`, `style.top`, add `data-keyname`, and attach a click listener that calls `keySelectCallback(keyName)`. Append to container.
    * Add listener to the toggle button to re-render with the opposite mode.
3.  **In `app.js`:** Import `renderRadialMenu`. When the `#change-key-btn` is clicked (before showing popup), call `renderRadialMenu('key-selection-area', 'sharps', handleKeySelection)`. Define `handleKeySelection(keyName)` function.
Provide code for `style.css` updates, `key_selector.js`, and `app.js` updates.
Prompt 4.10 (Key Selection Logic)Modify `app.js`.
1.  Define the `handleKeySelection(keyName)` function:
    * Call `setCurrentKeySignature(keyName)` (which should also trigger `displayKeySignature`).
    * Call `updateChangeKeyButtonText(keyName)`.
    * Call `toggleKeyPopup(false)` to hide the modal.
2.  Ensure `setCurrentKeySignature` updates the state variable and calls `displayKeySignature`.
3.  Ensure `updateChangeKeyButtonText` updates the button text.
4.  Refine `renderRadialMenu` in `key_selector.js` to potentially include mini SVG previews of the key signature on each `.key-option` button (optional enhancement, can use simplified drawing).
Provide the updated `app.js` and potentially refined `key_selector.js`.
Prompt 5.1 (Alt Fingering UI)Modify `style.css`.
1.  Ensure the container `<div id="fingering-options-area">` exists in `index.html`.
2.  Add CSS rules for buttons that will be dynamically added inside `#fingering-options-area`. Style them like small tabs or buttons (e.g., `display: inline-block; margin: 2px; padding: 5px 10px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;`).
3.  Add styles for `.fingering-option-btn.active` (e.g., `background-color: #ddd; border-color: #aaa;`).
4.  Style the container itself if needed (e.g., `min-height: 30px; text-align: center; margin-top: 10px;`).
Provide the updated `style.css`.
Prompt 5.2 (Populate Alt Selector)Modify `staff.js`. Create helper in `trumpet.js`.
1.  **In `trumpet.js`:** Create exported helper `formatFingering(fingeringArray)` that takes `[1, 3]` and returns "1-3", takes `[]` and returns "Open", etc.
2.  **In `staff.js`:**
    * Import `formatFingering` from `trumpet.js`.
    * Modify the `mousedown` handler:
        * Get reference to `fingeringOptionsArea = document.getElementById('fingering-options-area')`. Clear its content: `fingeringOptionsArea.innerHTML = '';`. Hide it initially.
        * After getting `fingeringInfo = getFingering(noteName)`:
        * If `fingeringInfo` is not null:
            * Create button for `fingeringInfo.primary`. Set text using `formatFingering`. Add class `fingering-option-btn` and `active`. Store fingering array in `dataset.fingering = JSON.stringify(fingeringInfo.primary)`. Append.
            * If `fingeringInfo.alternates` exists, loop through them. Create buttons similarly, but without `active` class. Append.
            * Make `fingeringOptionsArea` visible.
Provide updated `staff.js` and `trumpet.js`.
Prompt 5.3 (Wire Alt Selector)Modify `trumpet.js` (or `app.js`).
1.  Add an initialization function `initAlternateFingeringControls()` in `trumpet.js` (or `app.js`).
2.  Inside, get reference to `#fingering-options-area`.
3.  Add a delegated event listener to this area for clicks on `.fingering-option-btn`.
4.  In the event handler:
    * Get the clicked button element.
    * Retrieve the fingering array from `dataset.fingering`. Use `JSON.parse()`.
    * Call `updateTrumpetSVG()` with the parsed array.
    * Remove `.active` class from all buttons within the area.
    * Add `.active` class to the clicked button.
5.  Call `initAlternateFingeringControls()` in `app.js` on DOM load.
Provide the updated `trumpet.js` (or `app.js`) code.
Prompt 5.4 (Implement "???" Display)Modify `staff.js`.
1.  Modify the `mousedown` handler:
    * Inside the block where `fingeringInfo = getFingering(noteName)`:
    * If `fingeringInfo` is null:
        * Call `updateTrumpetSVG(null);` (ensure valves are up/neutral).
        * Get reference to `fingeringOptionsArea`. Clear it (`innerHTML = ''`).
        * Set its `textContent = '???';`.
        * Make `fingeringOptionsArea` visible.
    * Ensure the logic from Step 5.2 (populating buttons) only runs if `fingeringInfo` is *not* null.
Provide the updated `staff.js`.
Prompt 5.5 (Implement Responsive CSS)Modify `style.css`.
1.  Add a media query, e.g., `@media (max-width: 768px) { ... }`.
2.  Inside the media query:
    * Target the main layout container (`#app-container` or the parent of `.left-panel`, `.right-panel`). Change its `flex-direction` to `column` or adjust Grid properties to stack the panels/areas vertically.
    * Adjust widths of panels/areas to `100%` or near that.
    * Adjust margins/padding for better spacing in the stacked view.
    * Check if font sizes need adjustment for readability on smaller screens.
    * Ensure the key selection popup (`#key-popup .modal-content`) still looks good and doesn't take up excessive screen height.
Provide the updated `style.css` with the media query and responsive rules.
Prompt 5.6 (Final Accessibility Checks & Refinements)Perform a final review of the generated HTML, CSS, and JavaScript code.
1.  **HTML:** Add `aria-label` attributes to icon-only buttons (like the key signature popup close button, potentially the toggle button). Ensure interactive elements like buttons and the staff SVG are focusable.
2.  **CSS:** Use a browser accessibility checker tool to verify color contrasts meet WCAG AA standards, especially for text, button backgrounds, and the valve highlight colors against the valve background.
3.  **JavaScript:** Verify that the valve numbers (1, 2, 3) are correctly added/removed along with the highlights in `updateTrumpetSVG`. Consider adding an `aria-live` region (e.g., a visually hidden `div`) and updating its text content whenever a note is played or fingering changes, announcing something like "Played C4, Fingering Open" or "Changed fingering to 1-3". This is an enhancement if time permits.
4.  **Testing:** Briefly test keyboard navigation (tabbing through controls, using Enter/Space to activate buttons). Test focus indicators.
Provide any necessary code modifications to HTML or JavaScript based on this review, focusing on ARIA labels and potentially the `aria-live` region implementation. Add comments explaining the accessibility enhancements.
Final Prompt Example (Wiring everything - Revised)Reviewing all the generated modules (`staff.js`, `trumpet.js`, `audio.js`, `data.js`, `controls.js`, `key_selector.js`, `app.js`) and `index.html` / `style.css`:
1.  Ensure all necessary functions and variables are correctly exported and imported between modules. Verify script tags in `index.html` have `type="module"` and correct paths.
2.  Confirm that `app.js` correctly initializes all components on DOM load (`DOMContentLoaded` event): renders staff, renders trumpet, initializes audio, initializes controls, sets initial key signature state, displays initial key signature on staff, sets initial button text.
3.  Trace the event flow for key interactions:
    * Staff `mousedown`: Verify it correctly calculates note (using state: key sig, selected accidental), updates placed note display (with accidental symbol), updates fingering display (calling `getFingering`, `updateTrumpetSVG`, populating/clearing alt fingerings or showing '???'), triggers audio (`triggerAttack`), and resets accidental selector state/UI.
    * `window` `mouseup`: Verify it calls `triggerRelease`.
    * Accidental button click: Verify it updates `selectedAccidental` state and button UI.
    * Alternate fingering button click: Verify it updates SVG and button UI.
    * Change Key button click: Verify it renders and shows the popup.
    * Key Popup interaction (toggle, key select, close): Verify state updates (`currentKeySignature`), UI updates (main key sig display, button text), and popup visibility are handled correctly.
4.  Confirm state variables (`currentKeySignature`, `selectedAccidental`) are managed appropriately in `app.js` and accessed correctly by other modules via exported getter/setter functions.
5.  Verify responsive CSS rules function as expected when resizing the viewport.
Provide the final, integrated code for `app.js`. Include comprehensive comments explaining the initialization sequence and the main event handling logic, highlighting how different modules interact. If any minor fixes or integration adjustments are needed in other modules based on this review, include those updated files as well.
