//	*****************************************************************************
//	*****************************************************************************
//	add global constants for game dimensions -- it isn't possible to access some
//	of these via the ctx.canvas properties, since ctx isn't defined when some of
//	the methods in app.js are initially called; I don't want to use hard-coded numbers
//	because I was taught it is bad coding practice
//	*****************************************************************************
//	number of gameboard tiles in horizontal direction
const canvasTilesX = 5;
//	number of gameboard tiles in vertical direction
const canvasTilesY = 6;
//	absolute width in pixels of a gameboard tile
const tileAbsWidth	= 101;

const canvasWidth = canvasTilesX * tileAbsWidth;


//	bottom row of tiles is full height (171 pixels; remaining vertical space is
//	divided equally between remaining (canvasTilesY - 1) tiles; NOTE that received
//	code had 83 pixels for that height, but calculation yields 87; tileSlop corrects 87 to 83
//const tileSlop = 4;
const tileAbsHeight = 171;
const tileVisHeight = 83;
const canvasHeight = tileAbsHeight + ((canvasTilesY - 1) * tileVisHeight);
//	this centers the entity vertically on a visible tile
const entityVerticalShift = (tileAbsHeight - tileVisHeight) / 4;

//const canvasHeight = 500;

//	these speed settings for enemy bugs are entirely arbitrary, in pixels/sec;
//	set the slowest speed so that it takes 2 seconds to cross the canvas;
//	set the highest speed at a multiple of that
const slowSpeed = canvasWidth / 2;
const fastSpeed = slowSpeed * 3;

//	this isn't specified in the project rubric, so I've just picked a number; in a multi-level game
//	it should be less on easier levels and more on higher levels
const enemyCount = 3;

//	at 16 points achieved in level 0, advance to level 1;
//	at 48 points achieved in level 1, advance to level 2;
//	at 96 points achieved in level 2, advance to level 3;
//	set an outrageous number to prevent advancing beyond level 3
const levelPtThresh = [16, 48, 96, 10000];

const levelTrinkets = [
	"",
	"images/Gem Blue.png",
	"images/Gem Green.png",
	"images/Gem Orange.png",
	""
];
//	*****************************************************************************
//	*****************************************************************************
//	NOTE also that I'm not changing the var declarations in received files to 'const' or
//	'let' because the code is already written and works; the Udacity guidelines say not to
//	use 'var', so I suppose the provided code was written before ECMAscript 6 was released?
//	*****************************************************************************
//	*****************************************************************************
