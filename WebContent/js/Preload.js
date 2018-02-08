/**
 * Preloader state.
 */
function Preload() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State.prototype);
Preload.prototype = proto;
Preload.prototype.constructor = Preload;

Preload.prototype.preload = function() {
	// Load the assets of the game, including the scripts.
	this.load.pack("level", "assets/pack1.json");
	this.load.pack("level2", "assets/pack2.json");
};

Preload.prototype.create = function() {
	
	// Add the next states of the game
	//this.game.state.add("menu", Menu);
	this.game.state.add("level", Level);

	//this.game.state.start("menu");
	this.game.state.start("level");
};
