Equipped = function(game, x, y){
	Phaser.Sprite.call(this, game, x, y, 'equipped');

	this.rightHand;
	this.leftHand;
};

Equipped.prototype = Object.create(Phaser.Sprite.prototype);

Equipped.prototype.constructor = Equipped;

Equipped.prototype.add = function(item, placements, carrier){
	for(var i = 0; i < placements.length; i++){
		if(placements[i] === "rightHand" && this.rightHand !== undefined){
			carrier.store(this.rightHand, carrier);
			carrier.removeChild(this.rightHand);
		}else if(placements[i] === "leftHand" && this.leftHand !== undefined){
			if(!this.leftHand.twoHanded){
				carrier.store(this.leftHand, carrier);
			}
			carrier.removeChild(this.leftHand);
		}
		
		switch(placements[i]){
			case 'rightHand':
				this.addChild(this.game.make.sprite(-10, 50, item.type));
				
				var statsText = this.addChild(
						this.game.add.bitmapText(5, 80, 'smallFont',"D:" + 
						item.damage + " S:" + item.speed, 12));
				
	
				this.rightHand = item;
				break;
			case 'leftHand':
				var child = this.game.make.sprite(80, 50, item.type);
				if(item.twoHanded){
					child.alpha = 0.5;
				}
				
				this.addChild(child);
				
				this.leftHand = item;
				break;
		}
	}
};