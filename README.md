# udacity_arcade_game

## Udacity Arcade Game Project

This is a project for Udacity's Front-End Development program.  It is an arcade-style game combining HTML, CSS, and JavaScript.

## Dependencies

* ./css/style.css

* ./js/globals.js
* ./js/app.js
* ./js/engine.js
* ./js/resources.js

* ./images/geometry2.png
* ./images/char-boy.png
* ./images/enemy-bug.png
* ./images/Gem Blue.png
* ./images/Gem Green.png
* ./images/Gem Orange.png
* ./images/Star.png
* ./images/Selector.png
* ./images/stone-block.png
* ./images/water-block.png
* ./images/grass-block.png

* ./index.html

## Setup

Open index.html in a modern browser to start the game.  Use the keyboard up/down/right/left arrows to move the player piece.

## Objective

There are 3 game levels.  The game is concluded when 300 points are amassed.

In level 0, points are awarded when the player reaches the row of stone blocks (the scoring position) beneath the water.  Any collision with a bug will reset play without points being awarded.  Points awarded are the number of moves required to reach the scoring position.  Amassing at least 8 points in level 0 will advance the game to level 1.

In level 1, points are awarded when the player reaches the blue gemstone.  Collisions with bugs reset play with no points awarded.  Points awarded are the number of moves required to reach the gemstone, multiplied by 2. Amassing at least 48 points in level 1 will advance the game to level 2.

In level 2, points are awarded when the player reaches both green gemstones while avoiding contact with the bugs.  Points awarded are three times the number of moves to reach both gemstones.  Amassing at least 92 points in level 2 will advance the game to level 3.

In level 3, points are awareded when the player reaches the three orange gemstones while avoiding contact with the bugs.  Points awarded are four times the number of moves to reach the three gemstones.

## Contributing

This code is a class project, and contributions are not accepted.
