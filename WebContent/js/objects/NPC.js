NPC = function(game, x, y, type){
	Phaser.Sprite.call(this, game, x, y, type);
	
	this.id = 0;
	
	this.name = "Lola";

	this.inventory = [];
	
	this.conversations = [{
		id: 1,
		ended: false,
		linesSpoken: 0,
		questId: 0,
		lines: [{
			spoken: false,
			line:  'Hi, my name is Lola.\nCan you kill the cultists in the graveyard so that\n I can visit my mothers grave?',
			isQuestion: true,
			isAccepted: false,
			isConfirmed: false,
		},
		{
			spoken: false,
			line:  'Thank you, brave Warrior!',
			isQuestion: false,
			isAccepted: false,
			isConfirmed: false,
		}]
	}];

	this.events.onAnimationComplete.add(function(){			
		this.animations.stop(true, true);	
	}, this);
};

NPC.prototype = Object.create(Character.prototype);

NPC.prototype.constructor = NPC;

NPC.prototype.chat = function(speaksWith){
	var question;
	for(var i = 0; i < this.conversations[0].lines.length; i++){
		/*TODO: om speaksWith inom räckhåll
		 * Annars pausa eller nollställ
		 */
		
		if(!this.conversations[0].lines[i].spoken){
			console.log(this.conversations[0].lines[i]);
			if(question === undefined || question.isConfirmed){
				this.conversations[0].lines[i].spoken = true;
				this.conversations[0].linesSpoken++;
				if(this.conversations[0].linesSpoken === this.conversations[0].lines.length){
					this.conversations[0].ended = true;
				}
				
				if(this.conversations[0].lines[i].isQuestion){
					question = this.conversations[0].lines[i];
				}
	
				return this.conversations[0].lines[i].line;
			}

		}
		
		if(question !== undefined){
			question = undefined;
		}
	}
};


