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

//	array of objects defining game characteristics per game level;
//	pointThresh:	when the points exceed this value, the level will be incremented
//	addedTrinket:	these are placed on the top row; player must reach them to score
//	instruction:	displayed beneath the gameboard
const levelData = [

	//	level 0 characteristics
//	{	"pointThresh"	:	16,
	{	"pointThresh"	:	4,
		"addedTrinket"	:	null,
		"instruction"	:	"Reach the water, avoiding enemy collisions!"
	},
	
	//	level 1 characteristics
	{	"pointThresh"	:	48,
		"addedTrinket"	:	"images/Gem Blue.png",
		"instruction"	:	"Reach 1 gem, avoiding enemy collisions!"
	},
	
	//	level 2 characteristics
	{	"pointThresh"	:	96,
		"addedTrinket"	:	"images/Gem Green.png",
		"instruction"	:	"Reach 2 gems, avoiding enemy collisions!"
	},
	
	//	level 3 characteristics
	{	"pointThresh"	:	10000,
		"addedTrinket"	:	"images/Gem Orange.png",
		"instruction"	:	"Reach 3 gems, avoiding enemy collisions!"
	}
];


//	*****************************************************************************
//	*****************************************************************************
//	NOTE also that I'm not changing the var declarations in received files to 'const' or
//	'let' because the code is already written and works; the Udacity guidelines say not to
//	use 'var', so I suppose the provided code was written before ECMAscript 6 was released?
//	*****************************************************************************
//	*****************************************************************************
