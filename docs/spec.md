# Trumpet Fingering Helper - Specification v1.0

## 1. Introduction

### 1.1. Purpose
To create a simple, interactive web-based tool for beginner trumpet players. The tool allows users to select a key signature, click on notes on a musical staff, hear the corresponding pitch, and see the standard trumpet fingering illustrated visually, without needing prior knowledge of sheet music notation conventions beyond note placement on the staff.

### 1.2. Target Audience
New trumpet players unfamiliar with reading standard sheet music but wanting to learn the association between notes, sounds, and fingerings within different key signatures.

### 1.3. Platform
Pure front-end web application using HTML, CSS, and JavaScript. No backend is required.

## 2. Core Features

### 2.1. Key Signature Selection
* **Default:** The tool loads with the key of C Major selected by default (no sharps or flats displayed next to the clef).
* **Selection Trigger:** A button (e.g., labeled with the current key or a "Change Key" icon) located near the clef/staff display opens the key selection interface.
* **Interface:** A popup displaying a radial menu representing the Circle of Fifths.
    * **Center Control:** A toggle in the center allows the user to switch the view between sharp keys and flat keys.
    * **Radial Options:** Each available key signature (filtered by the sharp/flat toggle) is displayed as an option on the radial menu. Each option shows:
        * A visual representation of the treble clef on a staff with the correct sharps or flats for that key.
        * The name of the Major key (e.g., "Bb", "G", "C").
    * **Selection:** Clicking on a key signature option selects it.
* **Action:** Upon selection, the popup closes automatically, and the main interface updates to display the new key signature next to the clef on the staff.

### 2.2. Note Selection & Display
* **Interface:** A treble clef, the current key signature, and a portion of a 5-line musical staff are displayed on the main screen (left side on wide screens, top on narrow screens).
* **Dynamic Ledger Lines:** The staff display is dynamic. As the user moves the mouse cursor above or below the standard 5 lines, up to 4 ledger lines will automatically appear in the relevant position to guide note selection.
* **Note Input:** The primary method for selecting a note is clicking directly on a line or space on the staff, including the dynamically displayed ledger lines.
* **Cursor:** The mouse cursor, when hovering over the staff area, should resemble a black whole note.
* **Accidental Override:**
    * A segmented control (or similar UI element) is located below the staff area.
    * Options: Natural (♮), Sharp (♯), Flat (♭).
    * Functionality:
        * Clicking ♯ or ♭ *before* clicking the staff applies that accidental to the selected note.
        * Clicking ♮ *before* clicking the staff forces the natural version of the note, overriding the key signature if necessary.
        * Clicking the staff *without* pre-selecting an accidental uses the note dictated by the current key signature.
    * **Reset:** After a note is clicked on the staff, the accidental selector automatically resets to a neutral state (no override active for the next click).
* **Visual Feedback on Staff:**
    * Upon clicking, the selected note pitch (determined by staff position, key signature, and any accidental override) is displayed on the staff at the clicked location.
    * This displayed note appears as a dark gray whole note.
    * If the played note required an accidental (explicitly selected or implied by the key signature, differing from the natural letter name), the corresponding symbol (♯, ♭, or ♮) appears immediately to the left of the gray note head.

### 2.3. Audio Feedback
* **Sound Engine:** Use Tone.js library with the `tonejs-instruments` package for sampled trumpet sounds.
* **Trigger:** Sound plays immediately upon mouse *down* when clicking a valid position on the staff.
* **Sustain:** The note sustains as long as the user holds the mouse button down.
* **Release:** The sound stops immediately upon mouse *up* (releasing the button).
* **Pitch:** The pitch played corresponds to the selected note on the staff, including any accidentals.

### 2.4. Fingering Display
* **Interface:** An SVG illustration of a trumpet is displayed (right side on wide screens, bottom on narrow screens).
    * **Orientation:** Sideways view, with the bell pointing to the right.
    * **Style:** Clean, clear illustration suitable for showing valve states.
* **Valve Indication:** When a note is selected:
    * The SVG updates instantly to show the fingering.
    * **Pressed Valves:** Appear visually lower than unpressed valves.
    * **Highlighting:** Pressed valves are highlighted with a distinct color for each valve (e.g., Valve 1 red, Valve 2 green, Valve 3 blue). Unpressed valves remain a default color.
    * **Numbering (Accessibility):** The number (1, 2, or 3) is displayed directly on the cap of each pressed valve.
* **Default Fingering:** The diagram initially shows the most common fingering for the selected note.

### 2.5. Alternate Fingerings
* **Interface:** A segmented control (or similar UI element) is displayed *below* the trumpet SVG diagram.
* **Visibility:** This control is populated only when the currently selected note has known alternate fingerings.
* **Labels:** Options are labeled with explicit valve combinations (e.g., "Open", "1", "2", "1-2", "1-3", "2-3", "1-2-3"). Only valid fingerings for the current note are shown.
* **Interaction:** Selecting an option from this control instantly updates the trumpet SVG diagram to show the chosen alternate fingering (position, color, number). The audio pitch does not change. The control highlights the currently displayed fingering.

## 3. Technical Specifications

### 3.1. Environment
* **Type:** Static Web Page
* **Languages:** HTML, CSS, JavaScript (ES6+)

### 3.2. Libraries/Dependencies
* **Tone.js:** For Web Audio API management and scheduling. (`https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js` or similar CDN)
* **tonejs-instruments:** For sampled trumpet sounds. (Loaded via Tone.js `Sampler` mechanism, potentially sourcing samples from a CDN like `https://unpkg.com/tonejs-instruments@4.9.0/samples/trumpet/`)
* **SVG:** Native browser support. SVG manipulation via JavaScript.

### 3.3. Initial State
* **Key Signature:** C Major.
* **Staff:** Blank, no note selected. Treble clef displayed.
* **Trumpet Diagram:** All valves shown in the 'up' (unpressed) state. No highlight colors active. Alternate fingering control is hidden or empty.
* **Audio:** No sound playing.

## 4. Data Handling

### 4.1. Note-to-Fingering Mapping
* **Storage:** The data structure mapping musical notes (e.g., "C4", "F#5") to their corresponding fingerings (primary and alternates) will be embedded directly within the JavaScript code.
* **Format:** A JavaScript object or Map is suitable, where keys represent notes (including octave) and values represent fingerings.
    * Example: `{'C4': { primary: [], alternates: [[1, 3]] }, 'C#4': { primary: [1, 2, 3], alternates: [[2, 3], [3]] }, ...}` (Valve numbers in arrays, empty array `[]` for open).
* **Range:** This mapping should cover the practical range of the Bb trumpet, at least from F#3 (below staff) to C6 (high C above staff), including common alternate fingerings.

## 5. Error Handling / Edge Cases

### 5.1. Notes Without Fingerings
* **Scenario:** User clicks a note on the staff (within the +/- 4 ledger line limit) for which no fingering data exists in the embedded map (e.g., extremely high/low notes, non-standard pitches).
* **Fingering Display:** The trumpet SVG shows all valves up (or a neutral state). The area below the SVG where fingerings are usually shown (including the alternate fingering control) displays "???" or a similar indicator.
* **Audio:**
    1.  The tool *attempts* to play the theoretical pitch using Tone.js and the trumpet sampler.
    2.  If Tone.js/sampler cannot produce the sound for that pitch, silence is played instead. No specific error sound is generated.

## 6. Responsiveness

### 6.1. Layout Adaptation
* The application layout must adapt to different screen widths.
* **Wide Screens (Desktop/Tablet Landscape):** Staff/Controls area on the left, Trumpet SVG/Fingering area on the right.
* **Narrow Screens (Mobile/Tablet Portrait):** Staff/Controls area on top, Trumpet SVG/Fingering area stacked below it.
* **Controls:** All interactive elements (buttons, selectors) must resize and reflow appropriately to remain usable on small screens. Font sizes should be legible across devices.
* **Radial Menu:** The key signature selection popup must be usable on touch devices.

## 7. Accessibility

### 7.1. Color Contrast
* Ensure sufficient color contrast for text, controls, and visual elements as per WCAG guidelines.
* The dark gray note on the staff should have good contrast against the staff lines/background.

### 7.2. Fingering Clarity
* Pressed valves are indicated by position (lower), unique color highlight, *and* a displayed number (1, 2, or 3) on the valve cap, providing redundancy for users with color vision deficiency.

### 7.3. Keyboard Navigation (Optional Enhancement)
* Consider basic keyboard navigation for controls (tabbing through buttons/selectors) if feasible within the project scope. Focus indicators should be clear.

### 7.4. Screen Reader Support (Optional Enhancement)
* Use semantic HTML where possible. Add ARIA attributes if necessary to describe controls and dynamic updates, especially for the fingering diagram changes (e.g., announcing the selected fingering).

## 8. Testing Plan

### 8.1. Unit Tests (Optional, if using a framework)
* Test data mapping logic: Ensure correct fingerings are returned for various notes.

### 8.2. Functional Testing (Manual or Automated)
* **Key Signature Selection:**
    * Verify default key is C Major.
    * Test opening the radial menu popup.
    * Test toggling between sharp/flat keys.
    * Test selecting various keys (e.g., G Major, F Major, D Major, Bb Major) and verify the staff display updates correctly.
    * Verify the popup closes after selection.
* **Note Selection & Display:**
    * Verify clicking different lines/spaces selects notes.
    * Verify ledger lines appear correctly on hover above/below the staff (up to 4).
    * Verify clicking notes on ledger lines works.
    * Test accidental selector: Select Sharp, click note, verify sharp note plays/displays. Repeat for Flat, Natural.
    * Verify accidental selector resets after click.
    * Verify placed gray note shows the correct pitch and accidental symbol (♯/♭/♮) when needed.
* **Audio Feedback:**
    * Verify sound plays on mouse down and stops on mouse up.
    * Verify correct pitches are played for various notes and key signatures.
    * Test sustain behavior.
* **Fingering Display:**
    * Verify SVG updates instantly on note selection.
    * Verify correct primary fingering is shown for various notes.
    * Verify pressed valves are lower, have distinct highlight colors, and display numbers (1/2/3).
    * Verify unpressed valves are in the 'up' state and default color.
* **Alternate Fingerings:**
    * Select notes known to have alternates (e.g., C#, Middle C).
    * Verify the alternate fingering control appears below the SVG.
    * Verify the control shows correct valve combo labels (e.g., "1-2-3", "2-3").
    * Verify clicking alternates updates the SVG correctly.
* **Error Handling:**
    * Select a note outside the typical trumpet range but within the ledger line limits.
    * Verify fingering area shows "???".
    * Verify audio attempts to play or is silent (no crash).
* **Responsiveness:**
    * Test on various screen widths (Desktop, Tablet, Mobile).
    * Verify layout stacks correctly on narrow screens.
    * Verify controls remain usable and legible.
* **Accessibility:**
    * Visually check valve numbering on pressed valves.
    * Use browser developer tools to simulate color blindness and check if fingerings remain distinguishable.
    * (If implemented) Test keyboard navigation and screen reader output.

### 8.3. Cross-Browser Testing
* Test functionality and appearance on latest versions of major browsers (Chrome, Firefox, Safari, Edge).

