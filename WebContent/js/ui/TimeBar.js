TimeBar = function(game, x, y, colour, max){

	this.game = game;
	this.height = 50;
	this.max = max;
	this.colour = colour;
	this.parentX = x;
	this.parentY = y;
	
	this.graphics = game.add.graphics();
	this.graphics.beginFill(this.colour, 1);
	this.bar = this.graphics.drawRect(x, y, 20, -this.height);
	this.graphics.endFill();
	this.bar.fixedToCamera = true;
};


TimeBar.prototype.constructor = TimeBar;

TimeBar.prototype.updateProgress = function(progress, max){
	this.max = max;
	
	var perc = progress/this.max;

	if(perc < 1){
		this.graphics.destroy();
		this.graphics = this.game.add.graphics();
		this.graphics.beginFill(this.colour, 1);
		this.bar = this.graphics.drawRect(this.parentX, this.parentY, 20, -(perc*this.height));
		this.graphics.endFill();
		this.bar.fixedToCamera = true;
	}
};