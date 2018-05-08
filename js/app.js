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

	if (scoreboard.pause === 0)
	{
		//	keep recalibrating properties of enemies that advance past the right
		//	edge of the gameboard
		this.recalibrate();
	
		//	calculate the new position: pixels = pixels/sec * elapsed seconds
		this.x += (this.speed * dt);

		//	check for a collision with the player; if so, execute the player's die() method
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
		
	this.movesSinceReset = 0;
	
	//	delay counter (in seconds) between player movement and checking that move scores;
	//	if we check immediately, the player never appears to make the move because
	//	the update method spirits it back to the starting position before it is rendered
	//	at the scoring position
	this.decayTimer;

	
	this.handleInput = function(key) {
		
		if (this.state === PLAY)
		{
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
		
			this.x = this.xFROMxTile();
			this.y = this.yFROMyTile();

			this.movesSinceReset++;
			scoreboard.movesUpdate();
		
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
			console.log("player killed");
		}
	};
	
	this.score = function() {

		if (this.state === PLAY) {
			
			scoreboard.points += (this.movesSinceReset * (scoreboard.gameLevel + 1));
			this.movesSinceReset = 0;		
			scoreboard.scoreUpdate();

 			this.sprite = 'images/Star.png';
			this.state = REST;
			this.decayTimer = SCORE_DELAY;			
		}
	};
	
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

		if (this.state === PLAY) {
			
			if (this.timerExpired(dt) === true)
			{
				if (this.yTile === 1) this.score();
			}

			//	if the player is offscreen, it's a signal to reset his position
			//	to the starting tile
			if (this.xTile > canvasTilesX) {
				//	starting x position is next-to-last horizontal tile
				this.xTile = canvasTilesX - 2;
				//	starting y position is centered over bottom tile
				this.yTile = canvasTilesY - 1;
			
				this.x = this.xFROMxTile();
				this.y = this.yFROMyTile();
				scoreboard.pause = 0;
			}
			
		} else {

			if (this.state === REST) {
				
				this.yTile = canvasTilesY - 1;
				if (this.y >= this.yFROMyTile()) {
					
					this.state = PLAY;
					this.sprite = 'images/char-boy.png';
					
				} else {
				
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
//	the Scoreboard class
//***********************************************************************************
//***********************************************************************************
const levelString = [
	"Reach the water without encountering an enemy!",
	"Touch the gem without encountering an enemy!",
	"Touch each gem without encountering an enemy!"
];

//	represents the information on the scoreboard
function Scoreboard() {
	
	this.moves = -1;
	//	this is a reference to the "moves" counter in the HTML
	this.movesElement = null;
	
	this.points = 0;
	//	this is a reference to the "points" counter in the HTML
	this.pointsElement = null;
	
	this.gameLevel = 0;
	this.levelElement = null;

	this.pause = 0;
	
	//	this method is called whenever the player is moved
	this.movesUpdate = function () {

		if (this.movesElement !== null) {
			this.moves++;
			this.movesElement.textContent = this.moves.toString();
		}
	};
	
	//	this method is called when the player has scored
	this.scoreUpdate = function() {
		
		if (this.pointsElement !== null) {
			this.pointsElement.textContent = this.points.toString();
		}
//		scoreboard.pause = 1;
	};
	
	//	this method is called to change the displayed gameLevel
	this.levelUpdate = function() {
		if (this.levelElement !== null) {
			this.levelElement.textContent = this.gameLevel.toString();
		}
		//	also provide contextual instructions at the bottom of the window
		document.querySelector(".instructions").textContent = levelString[this.gameLevel];
	};

	//	this will prevent any further updates to the displayed number of moves or the displayed time;
	//	it severs connection to the HTML, so that the updates won't be attempted
	this.freezeBoard = function () {
		
		this.movesElement = null;
	};
	
	
	this.initScoreboard = function () {
		
		if (this.movesElement === null) {
			this.movesElement = document.querySelector(".move-num");
		}
		this.movesUpdate();
		
		if (this.pointsElement === null) {
			this.pointsElement = document.querySelector(".score-num");
		}
		
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



