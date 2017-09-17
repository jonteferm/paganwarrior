Inventory = function(game, x, y) {
	Phaser.Sprite.call(this, game, x, y, 'inventory');
	
	this.content = [];
};

Inventory.prototype = Object.create(Phaser.Sprite.prototype);

Inventory.prototype.constructor = Inventory;

Inventory.prototype.add = function(item, carrier) {
	this.content.push(item);
	
	var inventorySpace = this.addChild(this.game.make.sprite(0+(48*(this.content.length-1)), 48, item.type));
	
	inventorySpace.inputEnabled = true;
	
	var statsText = inventorySpace.addChild(
			this.game.add.bitmapText(5, 48-12, 'smallFont',"D:" + 
			item.damage + " S:" + item.speed, 12));

	inventorySpace.events.onInputDown.add(function(){
		carrier.equip(item, ['rightHand', 'leftHand'], carrier);
		inventorySpace.destroy();
		statsText.destroy();
		
		
		var newContent = [];
		
		for(var i = 0; i < this.content.length; i++){
			if(this.content[i] !== item){

				newContent.push(this.content[i]);
			}
		}
		
		this.content = newContent;
		
		console.log(this.content);
	}, this);

	
	
};