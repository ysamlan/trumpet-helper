# Trumpet Fingering Helper - Project TODO List

## Phase 1: Basic Structure & Staff Interaction

* [X] **1.1:** Set up `index.html` with boilerplate and main layout divs (`#app-container`, `#staff-area`, `#controls-area`, `#trumpet-area`, `#fingering-options-area`).
* [X] **1.2:** Create `style.css`, link it, and add basic CSS for side-by-side layout (using panels if desired) and visual placeholders for the main areas.
* [X] **1.3:** Create `staff.js` with `renderStaff` function to draw static 5-line staff and treble clef using SVG in `#staff-area`. Call from `app.js`.
* [X] **1.4:** Add `mousemove`, `mousedown`, `mouseup` listeners to the staff SVG interaction layer (`#staff-interaction-layer`) in `staff.js` to log coordinates/position info.
* [X] **1.5:** Implement dynamic ledger line display logic in `staff.js` `mousemove` handler (add/remove lines, max 4).
* [X] **1.5:** Implement visual cursor indicator (`#cursor-indicator` SVG circle/note) in `staff.js` that follows mouse and snaps vertically to lines/spaces. Hide on `mouseleave`.
* [X] **1.6:** Implement `getNoteFromPosition(snappedY)` in `staff.js` to calculate note name (pitch+octave) based on snapped Y coordinate (assume C Major initially). Log note on click.
* [X] **1.7:** Implement display of clicked note: Add `#placed-note` SVG ellipse in `staff.js`. On `mousedown`, position it at the click coordinates and make it visible (dark gray).

## Phase 2: Fingering Data & Display

* [X] **2.1:** Create `data.js` and define/export `fingeringData` object mapping notes (e.g., "C4") to `{ primary: [], alternates: [[]] }`. Populate with sample data (C4-G4).
* [X] **2.2:** Create `trumpet.js` with `renderTrumpetSVG` function to draw static trumpet SVG (side view, bell right, valves up) in `#trumpet-area`. Assign IDs (`#valve-cap-1`, etc.) to valve caps. Call from `app.js`.
* [X] **2.3:** Add exported `getFingering(noteName)` function to `data.js` to look up notes in `fingeringData` and return the fingering object or `null`.
* [X] **2.4:** Add exported `updateTrumpetSVG(fingeringArray)` function to `trumpet.js` to lower/raise valve caps (`#valve-cap-X`) using `transform: translateY` based on the input array or null.
* [X] **2.5:** Enhance `updateTrumpetSVG` to add/remove valve-specific CSS highlight classes (`.valve-pressed-X`) and add/remove SVG `<text>` elements (`.valve-number`) displaying "1", "2", or "3" on pressed valve caps.
* [X] **2.5:** Add CSS rules for `.valve-pressed-X` highlight colors and `.valve-number` text styling in `style.css`.
* [X] **2.6:** Modify `staff.js` `mousedown` handler: Import necessary functions, call `getFingering`, and call `updateTrumpetSVG` with the primary fingering (or null).

## Phase 3: Audio Integration

* [X] **3.1:** Add Tone.js CDN script tag to `index.html`. (Note: Now replaced with local scripts)
* [X] **3.2:** Create `audio.js` with `initAudio` async function to create/load `Tone.Sampler` with trumpet samples (using `unpkg` URLs) and `getSampler` function. Call `initAudio` from `app.js` and handle loading state/feedback. (Note: Now uses local SampleLibrary)
* [X] **3.3:** Modify `staff.js` `mousedown` handler to get sampler and call `sampler.triggerAttack(noteName)`. Ensure `Tone.start()` is called on user gesture if needed.
* [X] **3.3:** Add global `mouseup` listener (e.g., on `window`) to get sampler and call `sampler.triggerRelease()`.
* [X] **3.4:** Confirm `mousedown` logic attempts `triggerAttack` even if `getFingering` returns null.

## Phase 4: Key Signatures & Accidentals

* [X] **4.1:** Update `data.js` to define and export `keySignatures` object mapping key names to `{ notes: [], accidental: '#'/'b' }` structure. Populate for major keys.
* [X] **4.2:** Add `currentKeySignature` state management to `app.js` (getter/setter functions).
* [X] **4.2:** Modify `getNoteFromPosition` in `staff.js` to return base note info `{ baseNote, octave, noteName }`.
* [X] **4.2:** Modify `staff.js` `mousedown` handler to use `currentKeySignature` state and `keySignatures` data to calculate the final `noteName` based on key rules.
* [X] **4.3:** Create `displayKeySignature(keyName, svgElement)` function in `staff.js` to draw/clear sharp/flat symbols on the main staff SVG based on `keySignatures` data. Define standard Y positions for accidentals.
* [X] **4.3:** Call `displayKeySignature` initially and whenever key state changes in `app.js`.
* [X] **4.4:** Add HTML buttons (`#accidental-natural`, etc.) with `data-accidental` attributes to `controls-area`.
* [X] **4.4:** Add CSS for segmented control appearance and `.active` state for accidental buttons.
* [X] **4.4:** Create `controls.js` with `initAccidentalControls(callback)` and `resetAccidentalButtons()` functions. Initialize in `app.js`.
* [X] **4.5:** Add `selectedAccidental` state management to `app.js` (getter/setter, updated by callback from `initAccidentalControls`).
* [X] **4.5:** Modify `staff.js` `mousedown` note calculation logic to prioritize `selectedAccidental` over key signature rules when determining the final `noteName`.
* [X] **4.6:** Implement display of accidental symbol (`#placed-accidental` SVG text) next to `#placed-note` in `staff.js` `mousedown` handler, based on whether the final note required an explicit or key-signature accidental (including naturals overriding key sig).
* [X] **4.7:** Call `setSelectedAccidental(null)` and `resetAccidentalButtons()` at the end of the `staff.js` `mousedown` handler.
* [X] **4.8:** Add "Change Key" button (`#change-key-btn`) and modal HTML (`#key-popup`, overlay, content area, close button) to `index.html`.
* [X] **4.8:** Add CSS for basic modal show/hide functionality (`.hidden` class) and styling.
* [X] **4.8:** Add JS in `app.js` to handle showing/hiding the key popup via button/close/overlay clicks. Add `updateChangeKeyButtonText`.
* [X] **4.9:** Create `key_selector.js` with `renderRadialMenu(containerId, mode, callback)` function to dynamically create radial key options (buttons with `data-keyname`) and central toggle button inside `#key-selection-area`.
* [X] **4.9:** Add CSS for radial layout and button styling within the popup.
* [X] **4.10:** Implement `handleKeySelection(keyName)` in `app.js` (updates state, updates main staff sig, updates button text, hides popup). Wire it as the callback in `renderRadialMenu`. Add logic to toggle button in `key_selector.js` to re-render menu with opposite mode. Call `renderRadialMenu` when popup is shown.

## Phase 5: Alternate Fingerings & Final Polish

* [X] **5.1:** Add CSS rules in `style.css` for dynamically created `.fingering-option-btn` elements inside `#fingering-options-area` (layout, appearance, `.active` state).
* [X] **5.2:** Create helper `formatFingering(array)` in `trumpet.js` to return string ("Open", "1-3", etc.).
* [X] **5.2:** Modify `staff.js` `mousedown`: If `fingeringInfo` exists, clear `#fingering-options-area`, create/append buttons for primary + alternates (using `formatFingering` for text, storing array in `dataset.fingering`), add `.active` to primary, make area visible. Hide/clear area if no `fingeringInfo`.
* [X] **5.3:** Add `initAlternateFingeringControls()` function (e.g., in `trumpet.js` or `app.js`) with delegated event listener on `#fingering-options-area`. On button click, get fingering array from dataset, call `updateTrumpetSVG`, update `.active` button states. Call this init function in `app.js`.
* [X] **5.4:** Modify `staff.js` `mousedown`: If `fingeringInfo` is null, call `updateTrumpetSVG(null)`, clear `#fingering-options-area`, set its `textContent` to "???", make area visible.
* [ ] **5.5:** Add media queries and CSS rules in `style.css` to handle responsive layout (stacking staff/trumpet areas on narrow screens). Adjust widths, spacing, font sizes as needed.
* [ ] **5.6:** Perform final accessibility review: Add `aria-label`s where needed, check color contrasts, verify valve numbers are clear, test basic keyboard navigation. (Optional: Implement `aria-live` region for announcements).

## Phase 6: Deploy

* [ ] Add readme links to the deployed version of the app, and github repo links from the webapp.
* [ ] Add readme and bottom-of-app links to https://www.svgrepo.com/svg/190518/trumpet (source of our trumpet icon) and to https://github.com/nbrosowsky/tonejs-instruments
* [ ] Add readme and license file - make this MIT license.
* [ ] Create github actions to deploy to github pages for the repo, including minifying code.