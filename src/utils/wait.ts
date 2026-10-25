import gsap from 'gsap';

/**
 * A Promise-based delay utility.
 * 
 * Uses GSAP's `delayedCall` instead of `setTimeout` to keep all timing
 * synced with the animation engine. This ensures that pauses and animations
 * stay in perfect harmony and can be awaited with `async/await`.
 * 
 * @param seconds - The duration of the delay in seconds
 * @returns A Promise that resolves after the given time has elapsed
 */
export const wait = (seconds: number): Promise<void> => {
  return new Promise(resolve => gsap.delayedCall(seconds, resolve));
};