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

	//	keep recalibrating properties of enemies that advance past the right
	//	edge of the gameboard
	this.recalibrate();
	
	//	calculate the new position: pixels = pixels/sec * elapsed seconds
	this.x += (this.speed * dt);

	//	check for a collision with the player; if so, execute the player's die() method
	if (this.collisionWithThat(player) && (player.moves > 0)) {
		player.die();
	}
};


//***********************************************************************************
//***********************************************************************************
//	the Player class
//***********************************************************************************
//***********************************************************************************
let Player = function() {

	this.sprite = 'images/char-boy.png';
	
	this.state = "living";
	
	this.moves = 0;
	
	this.handleInput = function(key) {
		
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
		this.moves++;
	};

	//	when player dies via collision with enemy, shift the player off the right
	//	edge of the gameboard so that recalibrate() will reset it to the start position
	this.die = function() {
		this.xTile = canvasTilesX * 2;
		this.x = this.xFROMxTile();
		this.state = "dead";
		console.log("player killed");
	};

	this.update = function() {
		//	if the player is offscreen, it's a signal to reset his position
		//	to the starting tile
		if (this.xTile > canvasTilesX)
		{
			//	starting x position is next-to-last horizontal tile
			this.xTile = canvasTilesX - 2;
			//	starting y position is centered over bottom tile
			this.yTile = canvasTilesY - 1;
			
			this.x = this.xFROMxTile();
			this.y = this.yFROMyTile();
			
			this.state = "living";
			
			this.moves = 0;
		}
	};
	
};

Player.prototype = Entity.prototype;

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
let allEnemies = [];
for (let i = 0; i < enemyCount; i++)
{
	allEnemies.push(new Enemy());
}

player = new Player();


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

//main();