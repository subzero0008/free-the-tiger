# Free the Tiger 🐯

A mini-game developed as part of a Frontend Game Developer challenge. The goal is simple: open the cage and let the tiger out!

##  About the Task
The game starts with a locked cage. Six bars keep the tiger inside—three on the left and three on the right. A random code is generated and logged in the browser console. The player must click the bars in the exact order of the code. 
- **Correct click:** The bar slides out with a smooth animation.
- **Wrong click:** All opened bars slam shut, a new code is generated, and the player must start over.
- **Victory:** Open all 6 bars in the correct order to free the tiger. The "Going Wild!" text appears, and after a few seconds, the game resets.
 Screenshots
| Gameplay (Locked Cage) | Victory (Going Wild!) |
| :---: | :---: |
| ![Gameplay](https://i.imgur.com/3W4Izrh.jpeg) | ![Victory](https://i.imgur.com/WT2UWan.jpeg) |

## Technologies Used
- **TypeScript** - For strict typing and Object-Oriented architecture.
- **PIXI.js (v8)** - For high-performance 2D WebGL rendering.
- **GSAP (GreenSock)** - For smooth, timeline-based animations.
- **Vite** - For blazing-fast local development and bundling.

##  Features & Bonus Points
- **Object-Oriented Approach:** Clean separation of concerns using classes (`Game`, `Bar`).
- **Responsive Layout:** The game adapts perfectly to any screen size (desktop, tablet, mobile) without cropping or black bars. Background uses a "cover" approach, while gameplay elements use a "contain" approach.
- **Async/Await:** No `setTimeout` or `setInterval` used for game logic. All delays and animations are handled via Promises and GSAP.
- **Dynamic Shadows:** Each bar has a shadow that moves and slams shut along with the bar.
- **Lock Meter:** A control panel on the left shows the status of the bars using 6 LED pips (turns green on correct click, red and shakes on wrong click).
- **Interactive Console:** The required sequence is randomly generated and printed to the browser console.

##  How to Run Locally

Follow these steps to get the game running on your local machine:

1. **Clone the repository:**
   
   git clone https://github.com/subzero0008/free-the-tiger.git
  
2. **Clone the repository:**
  cd free-the-tiger

3. **Clone the repository:**
npm install

4. **Clone the repository:**
npm run dev

5. **Play the game::**
Open the provided local URL (usually http://localhost:5173) in your browser.
Important: Press F12 or right-click and select "Inspect" to open the Browser Console and see the secret code!

##  How to play?
Open the Browser Console.

Look for a pink message looking like this: 🔒  CODE: 3, 1, 5, 2, 6, 4.

Click the bars on the screen in that exact order.

Bars 1, 2, 3 are on the left. Bars 4, 5, 6 are on the right.

Don't make a mistake!

##  Author
Yulian Yuriev




