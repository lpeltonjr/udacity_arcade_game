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
const canvasHeight = canvasTilesY * tileAbsWidth;

//	bottom row of tiles is full height (171 pixels; remaining vertical space is
//	divided equally between remaining (canvasTilesY - 1) tiles; NOTE that received
//	code had 83 pixels for that height, but calculation yields 87
//const tileVisHeight = 83;
const tileSlop = 4;
const tileAbsHeight = 171;
const tileVisHeight = ((canvasHeight - tileAbsHeight) / (canvasTilesY - 1)) - tileSlop;

//	these speed settings for enemy bugs are entirely arbitrary
const slowSpeed = 5;
const fastSpeed = 20;

const enemyCount = 9;
//	*****************************************************************************
//	*****************************************************************************
//	NOTE also that I'm not changing the var declarations in these files to 'const' or
//	'let' because the code is already written and works; the Udacity guidelines say not to
//	use 'var', so I suppose the provided code was written before ECMAscript 6 was released
//	*****************************************************************************
//	*****************************************************************************
