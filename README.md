## Project Title

## GBDA302 Week 6 Side Quest

## Authors

Tracey Chen 21057118 t44chen

---

## Description

A 2D pixel game where play as a fox racing against the clock. The objective is to navigate a multi-tiered tile-based level to find a randomly spawning treasure chest before the 30-second timer runs out.

---

## Setup and Interaction Instructions

- A or D / Left or Right Arrow: Horizontal movement
- W or Up Arrow: Jump
- R: Restart the game (Available only on the Win/Lose screen)

---

## Iteration Notes

a.Post-Playtest:

- Audio Implementation: Integrated sound effects for jumping, falling, and running.
- Game Loop & State Machine: Added a 30-second countdown timer that waits for the player's first movement to begin. Introduced a state machine (PLAYING, WIN, LOSE) to freeze physics and controls when the game ends, bringing up a custom end screen with a "Press R to restart" feature.
- UI Improvement: Attempted to use standard fonts (Arial, Calibri, Times New Roman) directly on the canvas.
- Asset Scaling & Test Hitbox: Uploaded a custom treasure.png asset. The original image was too large, so it was visually scaled down using .resize(). Also test and fix the hitbox.

---

## Assets

Process & Decision Documentation
running.mp3 (From Pixabay)
jumping.mp3 (From Pixabay)
falling.mp3 (From Pixabay)
treasure.png (From Pngtree)

---

## References

Week 6 Example 3

---

## GenAI

The game was designed by Tracey Chen, but she used GenAI to write the code.

---
