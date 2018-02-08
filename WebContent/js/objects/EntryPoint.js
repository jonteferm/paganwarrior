EntryPoint = function(game, x, y, toLevel){
	Phaser.Sprite.call(this, game, x, y, 'next');

	this.toLevel = toLevel;
	
};

EntryPoint.prototype = Object.create(Phaser.Sprite.prototype);

EntryPoint.prototype.constructor = EntryPoint;

EntryPoint.prototype.changeLevel = function(){
	console.log("next level");
	
	this.game.state.add("level2", Level);

	this.game.state.start("level2");
};
