Weapon = function(game, x, y, type){
	Item.call(this, game, x, y, type);

	this.animations.add('right', [0, 1, 2], true);
	this.animations.add('rightDown', [12, 13, 14], true);
	this.animations.add('rightUp', [18, 19, 20], true);
	this.animations.add('left', [3, 4, 5], true);
	this.animations.add('leftDown', [15, 16, 17], true);
	this.animations.add('leftUp', [21, 22, 23], true);
	this.animations.add('up', [6, 7, 8], true);
	this.animations.add('down', [9, 10, 11], true);

	this.events.onAnimationComplete.add(function(self, animation){
		this.animations.stop(true, true);
	}, this);
};

Weapon.prototype = Object.create(Item.prototype);

Weapon.prototype.constructor = Weapon;