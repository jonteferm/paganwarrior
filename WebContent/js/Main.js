window.onload = function() {
	// Create your Phaser game and inject it into an auto-created canvas.
	// We did it in a window.onload event, but you can do it anywhere (requireJS
	// load, anonymous function, jQuery dom ready, - whatever floats your boat)
	var game = new Phaser.Game(768, 624, Phaser.AUTO, null, null, false, false);

	// Add the boot state, the other states are added by demand.
	game.state.add("boot", Boot);
	game.state.start("boot");
};
