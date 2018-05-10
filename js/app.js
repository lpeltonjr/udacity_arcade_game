function randomValue(lowerLimit, upperLimit) {
	return (Math.floor(Math.random() * (upperLimit - lowerLimit)) + lowerLimit);
}


//***********************************************************************************
//***********************************************************************************
//	the Entity class -- used only to establish inheritance
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
	
	let intersectX;
	let intersectY;

	//	collisions require identical y values
	if (this.y === that.y) {
		//	if this entity is ahead of that entity ...
		if (this.x > that.x) {
			intersectX = that.x + that.width - this.x;
		} else {
			intersectX = this.x + this.width - that.x;
		}
	
		//	collision will occur at the center of a tile, not at the left corner
		if ((intersectX > (this.width / 2)) && (intersectX <= this.width)) {
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
		//	(thus the lower limit is 1, not 0)
		this.yTile = randomValue(1, canvasTilesY);
		this.y = this.yFROMyTile();
		
		//	assign a new speed to the enemy
		this.speed = randomValue(slowSpeed, fastSpeed);
	}
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks -- IN SECONDS !!!!
Enemy.prototype.update = function(dt) {

	if (scoreboard.pause === 0)	{
		//	keep recalibrating properties of enemies that advance past the right
		//	edge of the gameboard
		this.recalibrate();
	
		//	calculate the new position: pixels = pixels/sec * elapsed seconds
		this.x += (this.speed * dt);

		//	check for a collision with the player; if so, execute the player's die() method;
		//	we don't allow the player to die on the starting tile unless moves have occurred
		if (this.collisionWithThat(player) && (player.movesSinceReset > 0)) {
			player.die();
		}
	}
};


//***********************************************************************************
//***********************************************************************************
//	the Player class
//***********************************************************************************
//***********************************************************************************
const SCORE_DELAY = 0.5;
const PLAY = 0;
const REST = 1;
const DEAD = 2;

let Player = function() {

	this.sprite = 'images/char-boy.png';
	
	this.state = PLAY;
		
	//	when the player reaches a scoring position, a multiple of this quantity
	//	is added to the score; this rewards the user for keeping the player alive
	//	over greater numbers of moves
	this.movesSinceReset = 0;
	
	//	this timer is refreshed whenever the player moves; it is used to delay resultant
	//	actions (scoring, etc.)
	this.decayTimer;

	//	this is the callback for processing keyboard events
	this.handleInput = function(key) {
		
		let prevXtile = this.xTile;
		let prevYtile = this.yTile;

		//	ignore keyboard events unless the player is actually in play
		if (this.state === PLAY) {
			
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
			//	expires; depends on game state
			this.decayTimer = SCORE_DELAY;
		}
	};

	//	when player dies via collision with enemy, shift the player off the right
	//	edge of the gameboard so that recalibrate() will reset it to the start position
	this.die = function() {
		
		if (this.state === PLAY)
		{
			this.xTile = canvasTilesX * 2;
			this.movesSinceReset = 0;
			scoreboard.movesUpdate(this.movesSinceReset);
		}
	};
	
	//	this method is called when the player reaches a scoring position
	this.score = function() {

		if (this.state === PLAY) {
			
			//	point quantity awarded at a scoring position depends on the game level; higher
			//	levels garner more points per score
			scoreboard.points += (this.movesSinceReset * (scoreboard.gameLevel + 1));
			scoreboard.scoreUpdate();
			
			//	the move counter is reset following a score; moves will next be tallied
			//	for the next scoring event
			this.movesSinceReset = 0;
			scoreboard.movesUpdate(this.movesSinceReset);

			//	the player becomes a star to indicate scoring
 			this.sprite = 'images/Star.png';
			this.decayTimer = SCORE_DELAY;

			//	this prevents scoring twice or more on the same tile; it also halts player movement
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
			if (this.timerExpired(dt) === true)
			{
				//	this must be game-level specific
				//	if player is on a top tile, just below the water, they are all scoring
				//	tiles in level 1
				if (this.yTile === 1) this.score();
			}

			//	if the player is offscreen, it's a signal to reset his position
			//	to the starting tile; this only happens when the player is killed by an enemy
			if (this.xTile > canvasTilesX) {
				//	starting x position is next-to-last horizontal tile
				this.xTile = canvasTilesX - 2;
				//	starting y position is centered over bottom tile
				this.yTile = canvasTilesY - 1;
			
				this.x = this.xFROMxTile();
				this.y = this.yFROMyTile();
			}
			
		//	player updates during REST state
		} else {

			//	if the player is in the state REST, following a score ...
			if (this.state === REST) {

				//	the star will be returned to the starting row without changing the column;
				//	set yTile to the final position for use in comparison
				this.yTile = canvasTilesY - 1;
				//	if the star has returned to the starting row, swap back to the player sprite
				//	and resume play
				if (this.y >= this.yFROMyTile()) {
					
					this.state = PLAY;
					this.sprite = 'images/char-boy.png';
					//	see whether the game level should be advanced and do it, if required
					scoreboard.levelAdvance();
					
					
				//	otherwise the star/player is being lowered to the starting row;
				} else {
				
					//	whether the decayTimer just expired or has been expired for a while,
					//	lower the player to the starting row
					if ((this.decayTimer <= 0.0) || (this.timerExpired(dt) === true)) {
						this.y += (fastSpeed * dt);
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
	this.sprite = "";
}

Trinket.prototype = Entity.prototype;

let allTrinkets = [];

//***********************************************************************************
//***********************************************************************************
//	the Scoreboard class
//***********************************************************************************
//***********************************************************************************
//	instructions displayed beneath gameboard for each level
const levelString = [
	"Reach the water without encountering an enemy!",
	"Touch the gem without encountering an enemy!",
	"Touch each gem without encountering an enemy!"
];

//	represents the information on the scoreboard
function Scoreboard() {
	
	//	this is a reference to the "moves" counter in the HTML
	this.movesElement = null;
	
	this.points = 0;
	//	this is a reference to the "points" counter in the HTML
	this.pointsElement = null;
	
	this.gameLevel = 0;
	this.levelElement = null;
	
	//	this property may be used to pause game play
	this.pause = 0;
	
	//	this method is called whenever the player is moved
	this.movesUpdate = function(moves) {

		if (this.movesElement !== null) {

			this.movesElement.textContent = moves.toString();
		}
	};
	
	//	this method is called when the player has scored
	this.scoreUpdate = function() {
		
		if (this.pointsElement !== null) {
			this.pointsElement.textContent = this.points.toString();
		}
	};
	
	//	this method is called to change the displayed gameLevel
	this.levelUpdate = function() {
		if (this.levelElement !== null) {
			this.levelElement.textContent = this.gameLevel.toString();
		}
		//	also provide contextual instructions at the bottom of the window
		document.querySelector(".instructions").textContent = levelString[this.gameLevel];
	};
	
	this.levelAdvance = function() {

		let idx = 0;

		//	when a point threshold for a particular game level is reached, advance the game
		//	to the next level
		if (this.points >= levelPtThresh[this.gameLevel]) {
			//	each level is harder: an additional enemy is added
			allEnemies.push(new Enemy());
			
			//	the number of trinkets on the gameboard corresponds to the game level
			allTrinkets.push(new Trinket());
			//	set the gamepiece for the new trinket
			allTrinkets[allTrinkets.length - 1].sprite = levelTrinkets[(this.gameLevel + 1)];
			//	reposition as many trinkets as are on the board -- each must be located on the
			//	top row beneath the water, yTile === 1; there is no point in randomizing the xTile
			//	assignment, since there are only 5 columns
			allTrinkets.forEach(function(trinket) {
				trinket.yTile = 1;
				trinket.y = trinket.yFROMyTile();
				trinket.xTile = idx;
				trinket.x = trinket.xFROMxTile();
				idx += 2;
			});
			
			this.gameLevel++;
			this.levelUpdate();
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
		this.scoreUpdate();
		
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
for (let i = 0; i < enemyCount; i++)
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



