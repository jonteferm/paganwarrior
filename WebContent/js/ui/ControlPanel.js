ControlPanel = function(game, x, y){
	Phaser.Sprite.call(this, game, x, y, 'panel');
	
	this.game = game;
	this.player = this.game.state.states.level.player;

	this.gameLogTextHeight = 0;
	this.gameLog = [];
	this.gameLogHistory = [];

	const TIMEBAR_ROW_Y = 540;

	this.keys = {switchCombatStyle: this.game.input.keyboard.addKey(Phaser.Keyboard.C)};	

	this.keys.switchCombatStyle.onDown.add(function(){
		if(!this.player.groupCombatEnabled){
			if(this.player.timeGroupCombated === 0 || (this.game.time.now - this.player.timeGroupCombated < this.player.getGroupCombatCooldownSpeed())){
				this.player.groupCombatEnabled = true;
				this.player.groupCombatTime--;
			}
		}else{
			this.player.groupCombatEnabled = false;
		}
	
		this.keys.switchCombatStyle.isDown = false;
		this.updateCombatModeText();

	}, this);
	
	
    this.game.add.existing(this);
    
	this.attackBar = new TimeBar(this.game, 486, TIMEBAR_ROW_Y, 0xff8811, this.player.getAttackSpeed());
	this.blockBar = new TimeBar(this.game, 486+40, TIMEBAR_ROW_Y, 0xaaaaaa, this.player.getBlockSpeed());
	this.groupCombatBar = new TimeBar(this.game, 486+120, TIMEBAR_ROW_Y, 0xffffff, this.player.getGroupCombatCooldownSpeed());
	this.groupCombatTimeBar = new TimeBar(this.game, 486+180, TIMEBAR_ROW_Y, 0x0000ff, this.player.maxGroupCombatTime);
	
	this.attackBarText = this.game.add.bitmapText(476, TIMEBAR_ROW_Y, 'font', "Attack", 16);
	this.attackBarText.smoothed = true;
	this.attackBarText.fixedToCamera = true;
	
	this.blockBarText = this.game.add.bitmapText(486+35, TIMEBAR_ROW_Y, 'font', "Block", 16);
	this.blockBarText.smoothed = true;
	this.blockBarText.fixedToCamera = true;
	
	this.groupCombatBarText = this.game.add.bitmapText(486+100, TIMEBAR_ROW_Y, 'font', "Cooldown", 16);
	this.groupCombatBarText.smoothed = true;
	this.groupCombatBarText.fixedToCamera = true;
	
	this.groupCombatTimeBarText = this.game.add.bitmapText(486+175, TIMEBAR_ROW_Y, 'font', "Time", 16);
	this.groupCombatTimeBarText.smoothed = true;
	this.groupCombatTimeBarText.fixedToCamera = true;
	
	this.groupCombatBarText = this.game.add.bitmapText(486+110, 460, 'font', "GROUP COMBAT", 16);
	this.groupCombatBarText.smoothed = true;
	this.groupCombatBarText.fixedToCamera = true;
	
	this.groupCombatBarText = this.game.add.bitmapText(486+110, 461, 'font', "_____________", 16);
	this.groupCombatBarText.smoothed = true;
	this.groupCombatBarText.fixedToCamera = true;
	
	this.updateCombatModeText();
	this.updatePlayerStatsText();
	
	this.addText("Welcome brave adventurer!");
};

ControlPanel.prototype = Object.create(Phaser.Sprite.prototype);

ControlPanel.prototype.constructor = ControlPanel;

ControlPanel.prototype.addText = function(text){
	var bitmapText = this.game.add.bitmapText(10, 450, 'font',text, 16);
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

	this.combatModeText = this.game.add.bitmapText(486, 460, 'font',this.player.groupCombatEnabled ? "Combat: Group" : "Combat: Single", 16);
	this.combatModeText.smoothed = true;
	this.combatModeText.fixedToCamera = true;
};

ControlPanel.prototype.updatePlayerStatsText = function(){
	if(this.playerHealthText !== undefined){
		this.playerHealthText.destroy();
	}
	
	this.playerHealthText = this.game.add.bitmapText(486, 445, 'font',"Health: " + this.player.health, 16);
	this.playerHealthText.smoothed = true;
	this.playerHealthText.fixedToCamera = true;
};

ControlPanel.prototype.updateAttackBar = function(){
	
};

ControlPanel.prototype.updateBlockBar = function(){
	
};

