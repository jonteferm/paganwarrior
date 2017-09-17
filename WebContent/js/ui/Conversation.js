Conversation = function(game, x, y, player, npc){
	Phaser.Sprite.call(this, game, x, y, 'conversation');
	this.activeConversation = npc.conversations[0]; //TODO: Fixa

	this.addText(npc.name + ": " + npc.chat(player));
	
	this.keys = {
			yes: this.game.input.keyboard.addKey(Phaser.Keyboard.Y),
			no: this.game.input.keyboard.addKey(Phaser.Keyboard.N),
	};
		
	this.keys.yes.onDown.add(function(){
		//Svarar bara på senaste
		for(var i = this.activeConversation.lines.length-1; i >= 0; i--){
			if(this.activeConversation.lines[i].spoken && this.activeConversation.lines[i].isQuestion){
				this.activeConversation.lines[i].isAccepted = true;
				this.activeConversation.lines[i].isConfirmed = true;
			}
		}
		
		this.addText(npc.name + ": " + npc.chat(player));
	}, this);
	
	this.exitButton = this.addChild(this.game.make.sprite(48*13, 0, 'exitBtn'));
	this.exitButton.inputEnabled = true;
};

Conversation.prototype = Object.create(Phaser.Sprite.prototype);

Conversation.prototype.constructor = Conversation;

Conversation.prototype.addText = function(text){
	var yPos = 58;
	var lineTopMargin = 0;
	
	if(this.children.length > 0){
		lineTopMargin = 10;
		
		for(var i = 0; i < this.children.length; i++){
			yPos += this.children[i].textHeight;
		}
	}
	
	var bitmapText = this.addChild(this.game.add.bitmapText(58, yPos+lineTopMargin, 'font',text, 16));
	
	var line = "";
	
	for(var i = 0; i < 68; i++){
		line += "_";
	}
	
	this.addChild(this.game.add.bitmapText(58, (yPos+bitmapText.textHeight), 'font', line, 16));

};
