# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - Post-Review Refactoring & Improvements

This update addresses all feedback received from the code review, focusing on gameplay feel, responsive design, and code architecture.

###  Gameplay & User Experience
- **Fast Clicks Enabled:** Removed blocking `await` calls inside the click handler. Players can now rapidly open bars consecutively without waiting for the previous animation to finish.
- **Smooth Reset Animation:** Replaced the instant teleportation on reset with a cinematic sequence. The tiger smoothly walks back into the cage, and the bars slam shut in front of it.
- **Cursor Feedback:** Bars that are already unlocked no longer show a pointer cursor, preventing the illusion that they are still interactable.

###  Visuals & Responsive Layout
- **Portrait Mode Redesign:** Added an adaptive layout for mobile devices. In portrait mode, the scene zooms in, and the UI plate is moved above the cage to maximize screen space and eliminate empty areas.
- **UI Plate Z-Index Fix:** Raised the plate's Z-index above the bars. When the left bars slide out, they now elegantly slide *behind* the plate instead of over it.
- **Tiger Exit Animation:** Adjusted the tiger's z-index dynamically so it jumps in front of the cage and bars when freed, then slides back behind them upon reset.
- **Developer Signature:** Added a subtle, fixed-position developer signature to the bottom right corner.

###  Architecture & Code Quality
- **Eliminated "Magic Numbers":** Moved all hardcoded values (positions, text styles, sizes, animation timings, easing curves) into `src/config.ts`. The codebase is now easily tunable from a single location.
- **Separation of Concerns (SoC):** 
  - Extracted the cage, tiger, and bars logic into a dedicated `Cage.ts` class.
  - Extracted the LED indicator logic into `PipManager.ts`.
  - `Game.ts` now acts purely as an orchestrator.
- **Helper Functions:** Created `wait(seconds)` in `src/utils/wait.ts` using GSAP's `delayedCall` to avoid repeating Promise-wrapped delays.
- **Modular Code Generator:** Extracted the Fisher-Yates shuffle algorithm into `src/utils/codeGenerator.ts`.
- **Encapsulation Fix:** Removed direct access to private fields (e.g., `b['closedX']`). State is now handled via proper methods (`slamShut()`, `open()`).
