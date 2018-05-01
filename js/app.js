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

//	the vertical position will be initialized by the recalibration methods;
//	this is a primitive property, so it will be copied to child objects
Entity.prototype.y = 0;

//	width in pixels of an entity image -- for detecting collisions
Entity.prototype.width = tileAbsWidth;

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

	if ((this.y === that.y) && (that.state !== "dead")) {
		//	if this entity is ahead of that entity ...
		if (this.x > that.x) {
			intersectX = that.x + that.width - this.x;
		} else {
			intersectX = this.x + this.width - that.x;
		}
	
		//	collision will occur at the center of a tile, not at the left corner
		if ((intersectX > (this.width / 2)) && (intersectX <= this.width)) {
			that.state = "dead";
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
	
	this.state = "living";

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
		this.x = randomValue(1, canvasTilesX) * tileAbsWidth * -1;
		//	reposition the enemy on a random vertical tile, but not in the water
		//	(thus the lower limit is 1, not 0)
		this.y = (randomValue(1, canvasTilesY) * tileVisHeight) - entityVerticalShift;
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
	if (this.collisionWithThat(player)) {
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
	
	this.handleInput = function(key) {
		
		switch (key)
		{
			case 'left':
				if (this.x >= this.width) {
					this.x -= this.width;
				}
				break;

			case 'right':
				if ((canvasWidth - this.x) > this.width) {
					this.x += this.width;
				}
				break;

			case 'up':
				if (this.y > (tileVisHeight - entityVerticalShift)) {
					this.y -= tileVisHeight;
				}
				break;

			case 'down':
				if (this.y < (((canvasTilesY - 1) * tileVisHeight) - entityVerticalShift))
				{
					this.y += tileVisHeight;
				}
				break;

			default:
				break;
		}
	};

	//	when player dies via collision with enemy, shift the player off the right
	//	edge of the gameboard so that recalibrate() will reset it to the start position
	this.die = function() {
		this.x = canvasWidth * 2;
		console.log("player killed");
	};

	this.update = function() {
		//	if the player is offscreen, it's a signal to reset his position
		//	to the starting tile
		if (this.x > canvasWidth)
		{
			//	starting x position is next-to-last horizontal tile
			this.x = canvasWidth - (2 * this.width);
			//	starting y position is centered over bottom tile
			this.y = ((canvasTilesY - 1) * tileVisHeight) - entityVerticalShift;
			
			this.state = "living";
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