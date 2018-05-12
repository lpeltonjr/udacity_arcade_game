//	global helper for calculating random values without repeating the formula over and over
function randomValue(lowerLimit, upperLimit) {
	return (Math.floor(Math.random() * (upperLimit - lowerLimit)) + lowerLimit);
}

//	this reloads the page, effectively restarting the game
function resetGame(event) {
	document.location.reload();
}

//	this is the very end of the game
function showClosingMessage() {

	//	perform last-minute updates to the final score information:
		//	set the move count
	document.querySelector(".final-moves").textContent = scoreboard.totalScoringMoves.toString();
	document.querySelector(".final-count").textContent = scoreboard.points.toString();

	//	activate the restart icon on the final page
	document.querySelector(".final-restart").addEventListener("click", resetGame);
	
	//	remove the game and make the final score page visible
	document.querySelector(".score-panel").remove();
	document.querySelector(".instructions").remove();
	document.querySelector("canvas").remove();
	document.querySelector(".final-info").classList.toggle("invisible", false);
}

//***********************************************************************************
//***********************************************************************************
//	the Entity class -- used to establish inheritance
//***********************************************************************************
//***********************************************************************************
//	base class in entity prototype chain
let Entity = function(image) {
	
	this.sprite;
};

//	initially locate all entities off the right edge of the gameboard; this will
//	serve to trigger the recalibrate methods of the entities;
//	this is a primitive property, so it will be copied to child objects
Entity.prototype.x = canvasWidth * 2;
Entity.prototype.xTile = canvasTilesX * 2;

//	the vertical position will be initialized by the recalibration methods;
//	this is a primitive property, so it will be copied to child objects
Entity.prototype.y = 0;
Entity.prototype.yTile = 0;

//	width in pixels of an entity image -- for detecting collisions
Entity.prototype.width = tileAbsWidth;

//	given a tile row number, this function returns the entity's required y value in pixels
Entity.prototype.yFROMyTile = function() {
	return(this.yTile * tileVisHeight - entityVerticalShift);
};

//	given a tile column number, this function returns the entity's required x value in pixels
Entity.prototype.xFROMxTile = function() {
	return (this.xTile * this.width);
};

//	this method will be common to all entities;
//	as a method, this single function is referenced by all child objects
Entity.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);	
};

//	given reference to another entity, this method returns true if
//	this entity has collided with it
Entity.prototype.collisionWithThat = function(that) {
	
	//	collisions require identical y values and overlap of at least half the image element width
	if (this.y === that.y) {
		if (Math.abs(this.x - that.x) < (this.width / 2)) {
			return true;
		}
	}

	return false;
};


//***********************************************************************************
//***********************************************************************************
//	the Enemy class -- player must avoid these
//***********************************************************************************
//***********************************************************************************
let Enemy = function() {

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
	
	//	actual speed will be initialized in the recalibration method for this object
	this.speed = 0;
};

//	an Enemy is an Entity, no matter how bad
Enemy.prototype = Entity.prototype;

//	this handles enemy movement: x and y positions, as well as speed,
//	are recalibrated after an enemy passes beyond right border of the gameboard;
Enemy.prototype.recalibrate = function() {
	
	if (this.x > canvasWidth) {
		//	start the enemy somewhere off the left side of the board such that it is
		//	offset from other enemies moved off the left side of the board
		this.xTile = randomValue(1, canvasTilesX);
		this.x = this.xFROMxTile() * -1;
		
		//	reposition the enemy on a random vertical tile, but not in the water
		//	(thus the lower limit is 1, not 0) and not on the 2 rows of grass tiles
		this.yTile = randomValue(1, (canvasTilesY - 2));
		this.y = this.yFROMyTile();
		
		//	assign a new speed to the enemy
		this.speed = randomValue(slowSpeed, fastSpeed);
	}
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks -- IN (FRACTIONAL) SECONDS !!!!
Enemy.prototype.update = function(dt) {

	//	if there's time, I'll implement a pause function for the game but it may be a future
	//	enhancement
	if (scoreboard.pause === 0)	{
		//	keep recalibrating properties of enemies that advance past the right
		//	edge of the gameboard
		this.recalibrate();
	
		//	calculate the new position: pixels = pixels/sec * elapsed seconds
		this.x += (this.speed * dt);

		//	check for a collision with the player; if so, execute the player's die() method;
		if (this.collisionWithThat(player)) {
			player.die();
		}
	}
};


//***********************************************************************************
//***********************************************************************************
//	the Player class
//***********************************************************************************
//***********************************************************************************
const SCORE_DELAY = 0.33;

//	states for player and trinkets
const PLAY = 0;
const REST = 1;
const DEAD = 2;

//	defines the player start position on the board
const playerStartX = canvasTilesX - 2;
const playerStartY = canvasTilesY - 1;

let Player = function() {

	this.sprite = 'images/char-boy.png';
	
	this.state = PLAY;
		
	//	when the player reaches a scoring position, a multiple of this quantity
	//	is added to the score; this rewards the user for keeping the player alive
	//	over greater numbers of moves (maybe a low score should be rewarded intead, but
	//	this sounds like as good a reason as any to reward a high score, which is easier to implement)
	this.movesSinceReset = 0;
	
	//	this timer is refreshed whenever the player moves; it is used to delay resultant
	//	actions (scoring, etc.)
	this.decayTimer;

	//	this is the callback for processing keyboard events
	this.handleInput = function(key) {
		
		//	facilitates detection of movement at the bottom of this function
		let prevXtile = this.xTile;
		let prevYtile = this.yTile;

		//	ignore keyboard events unless the player is actually in play
		if (this.state === PLAY) {
			
			//	sorry, but I'm placing the braces for switch statements as I do in C, not as Udacity
			//	requires for JavaScript; it just DOESN'T look right to have the brace on the same line as 'switch';
			//	there may be other places where my braces are aligned this way; I tried catching them all, but
			//	I've coded this way in C for 30 years; it's pretty much automatic for me
			switch (key)
			{
				case 'left':
					if (this.xTile > 0) {
						this.xTile--;
					}
					break;

				case 'right':
					if (this.xTile < (canvasTilesX - 1)) {
						this.xTile++;
					}
					break;

				case 'up':
					//	move up, but not into the water tiles
					if (this.yTile > 1) {
						this.yTile--;
					}
					break;

				case 'down':
					if (this.yTile < (canvasTilesY - 1)) {
						this.yTile++;
					}
					break;

				default:
					break;
			}
		
			//	unlike the enemies, the player moves by tiles; translate the tile movement
			//	into pixel movement, which is what the update/render methods require
			this.x = this.xFROMxTile();
			this.y = this.yFROMyTile();

			//	if movement occurred, update the movement counter
			if ((prevXtile !== this.xTile) || (prevYtile !== this.yTile)) {
				scoreboard.movesUpdate(++this.movesSinceReset);
			}
		
			//	refresh the decayTimer; it may or may not cause something to happen when it
			//	expires; depends on object states
			this.decayTimer = SCORE_DELAY;
		}
	};

	//	when player dies via collision with enemy, shift the player off the right
	//	edge of the gameboard as an indicator to recalibrate() that it must be reset to the start position
	this.die = function() {
		
		if (this.state === PLAY) {

			this.xTile = canvasTilesX * 2;
			this.movesSinceReset = 0;
			scoreboard.movesUpdate(this.movesSinceReset);

			//	list the trinkets currently in the PLAY state on the gameboard
			let activeTrinkets = allTrinkets.filter(function(item) {return (item.state === PLAY);});
			//	to restart the game, there must be a number of active (PLAY) trinkets equal to the
			//	current game level
			let missingTrinkets = scoreboard.gameLevel - activeTrinkets.length;
			while (missingTrinkets > 0)
			{
				allTrinkets.push(new Trinket());
				allTrinkets[allTrinkets.length - 1].init(scoreboard.gameLevel);
				missingTrinkets--;
			}
		}
	};
	
	//	this method is called when the player reaches a scoring position
	this.score = function() {

		if (this.state === PLAY) {
			
			//	list the trinkets currently in the PLAY state on the gameboard
			let activeTrinkets = allTrinkets.filter(function(item) {return (item.state === PLAY);});
			//	for levels with multiple trinkets on the board at once, scoring only occurs when all visible
			//	trinkets have been gathered
			if (activeTrinkets.length < 2)
			{
				//	point quantity awarded at a scoring position depends on the game level; higher
				//	levels garner more points per score
				scoreboard.points += (this.movesSinceReset * (scoreboard.gameLevel + 1));
				scoreboard.scoreUpdate(this.movesSinceReset);
			
				//	the move counter is reset following a score; moves are now tallied
				//	for the next scoring event
				this.movesSinceReset = 0;
				scoreboard.movesUpdate(this.movesSinceReset);
			}

			//	the player sprite changes to signify scoring; refresh the decay timer to keep
			//	the new sprite on the tile long enough to be visible
 			this.sprite = 'images/Star.png';
			this.decayTimer = SCORE_DELAY;

			//	this prevents scoring twice or more on the same tile; it also suspends player movement
			//	based on key presses
			this.state = REST;			
		}
	};
	
	//	the decayTimer processing method; true if timer has just now expired; false otherwise
	this.timerExpired = function(dt) {

		if (this.decayTimer > 0.0) {
			this.decayTimer -= dt;
			if (this.decayTimer <= 0.0)
			{
				return true;
			}
		}
		return false;
	};


	this.update = function(dt) {

		//	player updates during PLAY state
		if (this.state === PLAY) {
			
			//	if the player has been located on a scoring tile for the decayTimer duration
			//	(long enough to be rendered on the tile), score
			if (this.timerExpired(dt) === true) {
				
				//	if player is on a top tile, where all scoring positions are located
				if (this.yTile === 1) {
					
					//	all top tiles are scoring tiles in level 0
					if (scoreboard.gameLevel === 0) {
						this.score();

					//	in other levels, the scoring tiles are those containing trinkets
					} else {

						allTrinkets.forEach(function(trinket) {
							//	if the player occupies same tile as a trinket in PLAY ...
							if ((trinket.state === PLAY) && (trinket.xTile === this.xTile)) {
								//	score and begin player's score animation
								this.score();
								//	launch trinket's score animation, too
								trinket.state = REST;
							}
						}, this);
					}
				}
			}

			//	if the player is offscreen, it's a signal to reset his position
			//	to the starting tile; this only happens when the player is killed by an enemy
			if (this.xTile > canvasTilesX) {
				
				this.xTile = playerStartX;
				this.yTile = playerStartY;
			
				this.x = this.xFROMxTile();
				this.y = this.yFROMyTile();
			}
			
		//	for player updates during REST state ...
		} else {

			//	if the player is in the state REST, following a score ...
			if (this.state === REST) {

				//	the player will be returned to the starting row and column, so
				//	set yTile and xTile to the final positions without setting x, y -- for comparison
				this.yTile = playerStartY;
				this.xTile = playerStartX;
				
				//	if the player has returned to the starting row, swap back to the normal sprite
				//	and resume play
				if (this.y >= this.yFROMyTile()) {
					//	ensure starting x position is correct in case it wasn't corrected
					//	before y position was corrected
					this.y = this.yFROMyTile();
					this.x = this.xFROMxTile();
					this.state = PLAY;
					this.sprite = 'images/char-boy.png';
					
					//	see whether the game level should be advanced and do it, if required
					scoreboard.levelAdvance();
					
				//	otherwise the player's position is to be corrected to the starting position
				} else {
				
					//	lower the player to the starting row,column as quickly as possible
					let fs = fastSpeed * dt;
					//	y correction
					this.y += fs;
					//	x correction, avoiding horizontal jitter
					let xDelta = this.x - this.xFROMxTile();
					if (Math.abs(xDelta) > fs) {
						if (xDelta > 0) this.x -= fs;
						else if (xDelta < 0) this.x += fs;
					}
				}
			}
		}
	};
};

Player.prototype = Entity.prototype;

//***********************************************************************************
//***********************************************************************************
//	the Trinket class
//***********************************************************************************
//***********************************************************************************
function Trinket() {
	//	the trinket's avatar will be initialized from the levelData object
	this.sprite = "";
	
	this.state = PLAY;
	
	this.init = function(level) {
		//	set the gamepiece for the new trinket
		this.sprite = levelData[level].addedTrinket;
		this.yTile = 1;
		this.y = this.yFROMyTile();
			
		//	construct an array of all xTile properties of trinkets created so far (except this one)
		let placedTrinkets = allTrinkets.map(function(item) {
			if ((item.xTile !== null) && (item !== this) && (item.state !== DEAD))
			{
				return(item.xTile);
			}
		}, this);
		
		//	construct another array of all xTile properties excluding what are listed in placedTrinkets
		let tileCols = [];
		for (let i = 0; i < canvasTilesX; i++)
		{
			if (placedTrinkets.includes(i) === false)
			{
				tileCols.push(i);
			}
		}
		
		//	take a random sample of available xTile values as this trinket's xTile value
		this.xTile = tileCols[randomValue(0, tileCols.length)]
		this.x = this.xFROMxTile();
		
		this.state = PLAY;
	};

	
	this.update = function(dt) {

		//	if the trinket's state indicates it is to be or is being removed from the board ...
		if (this.state === REST) {

			//	use the "selector" image for the trinket from this point forward
			this.sprite = "images/Selector.png";
			//	this is the trinket's ultimate destination -- 3 tiles below the bottom of the board,
			//	out of sight
			this.yTile = canvasTilesY + 3;

			//	once the trinket has reached its final destination, mark it inactive
			if (this.y >= this.yFROMyTile()) {

				this.state = DEAD;
									
				//	otherwise, animate the trip to the final destination
			} else {
				
				this.y += (fastSpeed * dt);
			}
		}
	};	
}

Trinket.prototype = Entity.prototype;

//	array of all trinkets -- active (PLAY, REST) or inactive (DEAD) -- on (or off) the canvas
let allTrinkets = [];

//***********************************************************************************
//***********************************************************************************
//	the Scoreboard class
//***********************************************************************************
//***********************************************************************************

//	represents the information on the scoreboard
function Scoreboard() {
	
	//	this is a reference to the "moves" counter in the HTML
	this.movesElement = null;
	
	//	tracks cumulative total of moves that resulted in scoring
	this.totalScoringMoves = 0;
	
	this.points = 0;
	//	this is a reference to the "points" counter in the HTML
	this.pointsElement = null;
	
	this.gameLevel = 0;
	this.levelElement = null;
	
	//	this property may be used to pause game play, if coded (haven't done that yet)
	this.pause = 0;
	
	//	this method is called whenever the player is moved
	this.movesUpdate = function(moves) {

		if (this.movesElement !== null) {

			this.movesElement.textContent = moves.toString();
		}
	};
	
	//	this method is called when the player has scored
	this.scoreUpdate = function(moves) {
		
		if (this.pointsElement !== null) {
			this.pointsElement.textContent = this.points.toString();
			this.totalScoringMoves += moves;
		}
	};
	
	//	this method is called to change the displayed gameLevel
	this.levelUpdate = function() {
		if (this.levelElement !== null) {
			this.levelElement.textContent = this.gameLevel.toString();
		}
		//	also provide contextual instructions at the bottom of the window
		document.querySelector(".instructions").textContent = levelData[this.gameLevel].instruction;
	};
	
	//	checks for necessity of advancing game level based on score; does this if required;
	//	also checks whether game is over based on scoring threshold
	this.levelAdvance = function() {

		//	list the trinkets currently in the PLAY state on the gameboard
		let activeTrinkets = allTrinkets.filter(function(item) {return (item.state === PLAY);});

		//	the game level cannot be advanced until all visible trinkets have been collected
		if (activeTrinkets.length === 0) {

			//	if game over scoring threshold is breached
			if (this.points >= gameOverScore) {
				
				showClosingMessage();
				
			//	else if play continues ...
			} else {
				
			
				//	when a point threshold for a particular game level is reached, advance the game
				//	to the next level
				if (this.points >= levelData[this.gameLevel].pointThresh) {

					this.gameLevel++;
			
					//	each level is harder: an additional enemy is added
					if (allEnemies.length < maxEnemyCount) {
					
						allEnemies.push(new Enemy());
					}
			
					//	destroy the trinket array and reconstruct it
					allTrinkets.length = 0;
				
					this.levelUpdate();
				}
			
				//	if scoring occurred, the trinkets have been moved off the board -- resupply them when
				//	they're all off the board
				for (let i = 0; i < this.gameLevel; i++) {
					//	the number of trinkets on the gameboard corresponds to the game level
					allTrinkets.push(new Trinket());
					//	set the gamepiece for the new trinket
					allTrinkets[allTrinkets.length - 1].init(this.gameLevel);				
				}
			}
		}
	};

	
	this.initScoreboard = function () {
		
		if (this.movesElement === null) {
			this.movesElement = document.querySelector(".move-num");
		}
		this.movesUpdate(0);
		
		if (this.pointsElement === null) {
			this.pointsElement = document.querySelector(".score-num");
		}
		this.scoreUpdate(0);
		
		if (this.levelElement === null) {
			this.levelElement = document.querySelector(".level-num");
		}
		this.levelUpdate();
	};
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
let allEnemies = [];
for (let i = 0; i < initialEnemyCount; i++)
{
	allEnemies.push(new Enemy());
}

let player = new Player();

//	create and initialize the scoreboard
let scoreboard = new Scoreboard();
scoreboard.initScoreboard();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});



