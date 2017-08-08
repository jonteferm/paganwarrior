Item = function(game, x, y, type){
	Phaser.Sprite.call(this, game, x, y, type);

	this.id = 0;
	this.name = "";
	this.twoHanded = false;

	this.damage = 0;
	this.protection = 0;
	this.speed = 0;
	this.block = 0;
};


Item.prototype = Object.create(Phaser.Sprite.prototype);

Item.prototype.constructor = Item;