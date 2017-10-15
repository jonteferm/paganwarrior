ControlPanel = function(game, player){
	this.game = game;
	this.player = player;

	var graphics = game.add.graphics();
	
	graphics.beginFill(0x000000, 1);
	this.gamePanel = graphics.drawRect(0, 768, 768, -142);
	graphics.endFill();
	this.gamePanel.fixedToCamera = true;

	this.gameLogTextHeight = 0;
	this.gameLog = [];
	this.gameLogHistory = [];


	this.addText("Welcome brave adventurer!");

	this.updateCombatModeText();
	this.updatePlayerStatsText();

	this.keys = {switchCombatStyle: this.game.input.keyboard.addKey(Phaser.Keyboard.C)};	

	this.keys.switchCombatStyle.onDown.add(function(){
		this.player.groupCombatEnabled = !this.player.groupCombatEnabled;
		this.keys.switchCombatStyle.isDown = false;
		this.updateCombatModeText();
	}, this);

};

ControlPanel.prototype.constructor = ControlPanel;

ControlPanel.prototype.addText = function(text){
	var bitmapText = this.game.add.bitmapText(10, 630, 'font',text, 16);
	bitmapText.smoothed = true;
	this.gameLog.push(bitmapText);
	this.gameLog[this.gameLog.length-1].fixedToCamera = true;
	this.gameLogTextHeight += this.gameLog[this.gameLog.length-1].height;

	if(this.gameLogTextHeight >= 93){
		var firstItem = this.gameLog.shift();
		firstItem.visible = false;
		this.gameLogHistory.push(firstItem);
		this.gameLogTextHeight -= firstItem.height;
	}

	if(this.gameLog.length > 0){
		for(var i = this.gameLog.length-1; i > 0; i--){
			if(i > 0){
				var prevText = "";
				var height = 0;
				prevText = this.gameLog[i-1].text;
				height = this.gameLog[i].height;
				this.gameLog[i-1].destroy();
				this.gameLog[i-1] = this.game.add.bitmapText(10, (this.gameLog[i].y + (16*(height/15.5))), 'font', prevText, 16);
				
				this.gameLog[i-1].fixedToCamera = true;
			}
		}
	}
	
};

ControlPanel.prototype.updateCombatModeText = function(){
	if(this.combatModeText !== undefined){
		this.combatModeText.destroy();
	}

	this.combatModeText = this.game.add.bitmapText(630, 630, 'font',this.player.groupCombatEnabled ? "Combat: Group" : "Combat: Single", 16);
	this.combatModeText.smoothed = true;
	this.combatModeText.fixedToCamera = true;
};

ControlPanel.prototype.updatePlayerStatsText = function(){
	if(this.playerHealthText !== undefined){
		this.playerHealthText.destroy();
	}
	
	this.playerHealthText = this.game.add.bitmapText(630, 650, 'font',"Health: " + this.player.health, 16);
	this.playerHealthText.smoothed = true;
	this.playerHealthText.fixedToCamera = true;
};
