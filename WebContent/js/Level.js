/**
 * Level state.
 */
function Level() {
	Phaser.State.call(this);
	// TODO: generated method.
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State.prototype);
Level.prototype = proto;
Level.prototype.constructor = Level;

Item.prototype = Object.create(Phaser.Sprite.prototype);

Door.prototype = Object.create(Phaser.Sprite.prototype);

Level.prototype = {
		create: function(){
			this.map = this.game.add.tilemap('oryxtiles');
			this.map.addTilesetImage('tiles', 'tiles');
			this.map.addTilesetImage('tree', 'tree');

			this.backgroundLayer = this.map.createLayer('backgroundLayer', 768, 768);
			this.blockLayer = this.map.createLayer('blockLayer', 768, 768 );

		    this.map.setCollisionBetween(1, 3000, true, 'blockLayer');

		    this.backgroundLayer.resizeWorld();

		    this.createItems();
		 	this.createDoors();

		    var playerStart = this.findObjectsByType('playerStart', this.map, 'objectLayer')[0];
		    this.player = new Player(this.game, playerStart.x, playerStart.y);
		    this.game.add.existing(this.player);
		    this.game.physics.arcade.enable(this.player);
		    this.game.camera.follow(this.player);
			this.player.countStats();
			this.player.body.setSize(13,32,16,9);

			this.spawnEnemies(this.map);
			this.spawnNpcs(this.map);

			var graphics = this.game.add.graphics();
			
			graphics.beginFill(0x000000, 1);
			this.gamePanel = graphics.drawRect(0, 768, 768, -352);
			graphics.endFill();
			this.gamePanel.fixedToCamera = true;
			

			this.gameLogTextHeight = 0;
			this.gameLog = [];
			this.gameLogHistory = [];

			this.addText("Welcome brave adventurer!");	
			
			this.updateCombatModeText(false);
			
			this.updatePlayerStatsText(this.player);
			
			this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); };
		},

		update: function(){
			this.game.physics.arcade.collide(this.player, this.blockLayer, this.handleWall);
			this.game.physics.arcade.overlap(this.player, this.items, this.pickupItem, null, this);
			this.game.physics.arcade.collide(this.player, this.doors, this.handleDoor, null, this);
			
			this.game.physics.arcade.collide(this.enemies, this.blockLayer);
			this.enemies.setAll('body.immovable', true);
			this.npcs.setAll('body.immovable', true);
			this.game.physics.arcade.collide(this.player, this.enemies, this.collisionHandlerPlayerAndEnemy, null, this);
			this.game.physics.arcade.collide(this.player, this.npcs, this.collisionHandlerPlayerAndNPC, null, this);
			this.enemies.setAll('body.immovable', false);
			this.game.physics.arcade.collide(this.enemies, this.enemies, this.collisionHandlerEnemyAndEnemy);


			if(this.player !== null){
				this.player.body.velocity.y = 0;
				this.player.body.velocity.x = 0;

			}

			if(this.player.combatKeys.switchCombatStyle.isDown){
				this.player.groupCombatEnabled = !this.player.groupCombatEnabled;
				this.player.combatKeys.switchCombatStyle.isDown = false;
				this.updateCombatModeText(this.player.groupCombatEnabled);
			}
			
			this.player.checkActions({enemies: this.enemies.children});

			for(var i = 0; i < this.enemies.children.length; i++){
			
				var enemy = this.enemies.children[i];
				if(enemy.health > 0){
					var actionTaken = enemy.takeActions({player: this.player, opponents: [this.player]});
					if(actionTaken === "attackedPlayer"){
						this.updatePlayerStatsText(this.player);
					}
				}
			}
		
		},

		collisionHandlerPlayerAndEnemy: function(player, enemy){
			player.body.velocity.x = 0;
			player.body.velocity.y = 0;
			enemy.body.velocity.x = 0;
			enemy.body.velocity.y = 0;
			enemy.animations.stop();

		},
		
		collisionHandlerPlayerAndNPC: function(player, NPC){
			if(!NPC.conversations[0].ended){
				this.addText(NPC.name + ": " + NPC.chat(player));
			}
		},

		pickupItem: function(character,item){
			character.inventory.push(item.key);
			console.log(item);
			console.log("Character inventory: " + character.inventory);
			item.destroy();
		},

		handleDoor: function(character, door){
			door.open();

			if(character.y > door.y ){
					character.body.y = door.y - 48;
			}else{
				character.y = door.y + 48;
			}
		},

		createItems: function(){
			this.items = this.game.add.group();
			this.items.enableBody = true;
			result = this.findObjectsByType('item', this.map, 'objectLayer');

			result.forEach(function(element){
				var newItem = new Item(this.game, element.x, element.y, element.properties.sprite);

				Object.keys(element.properties).forEach(function(key){
					newItem[key] = element.properties[key];
				});
				
				this.items.add(newItem);

			}, this);
		},

		createDoors: function(){
			this.doors = this.game.add.group();
			this.doors.enableBody = true;
		    this.game.physics.arcade.enable(this.doors);
			result = this.findObjectsByType('door', this.map, 'objectLayer');

			result.forEach(function(element){
				var newDoor = new Door(this.game, element.x, element.y, element.properties.sprite1, element.properties.sprite2);

				Object.keys(element.properties).forEach(function(key){
					newDoor[key] = element.properties[key];
				});


				this.doors.add(newDoor);

			}, this);

			for(var i = 0; i < this.doors.children.length; i++){
				this.doors.children[i].body.moves = false;
			}
		},

		findObjectsByType: function(type, map, layer){
			var res = new Array();

			map.objects[layer].forEach(function(element){
				if(element.type === type){
					element.y -= map.tileHeight;
					res.push(element);
				}
			});	
			return res;
		},

		addText: function(text){
			var bitmapText = this.game.add.bitmapText(10, 430, 'font',text, 16);
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
			
		},

		spawnEnemies: function(map){
			this.enemies = this.game.add.group();
			this.enemies.enableBody = true;
		    this.game.physics.arcade.enable(this.enemies);
			
			var enemyStartPositions = this.findObjectsByType('enemyStart', map, 'objectLayer');
			
			for(var i = 0; i < enemyStartPositions.length; i++){
				var enemyStart = enemyStartPositions[i];
				var enemy = new Enemy(this.game, enemyStart.x, enemyStart.y, 'cultist');
				
				enemy.id = i;
				
				//TODO: enemy.countStats();
				this.enemies.add(enemy);
			}
		},
		
		spawnNpcs: function(map){
			this.npcs = this.game.add.group();
			this.npcs.enableBody = true;
			this.game.physics.arcade.enable(this.npcs);
			
			var npcStartPositions = this.findObjectsByType('npcStart', map, 'objectLayer');
			
			for(var i = 0; i < npcStartPositions.length; i++){
				var npcStart = npcStartPositions[i];
				
				var npc = new NPC(this.game, npcStart.x, npcStart.y, npcStart.properties.sprite);

				npc.id = i;
				
				this.npcs.add(npc);
			}
		},
		
		updateCombatModeText: function(groupCombatEnabled){
			if(this.combatModeText !== undefined){
				this.combatModeText.destroy();
			}

			this.combatModeText = this.game.add.bitmapText(410, 430, 'font',groupCombatEnabled ? "Combat: Group" : "Combat: Single", 16);
			this.combatModeText.smoothed = true;
			this.combatModeText.fixedToCamera = true;
		},
		
		updatePlayerStatsText: function(player){
			console.log(player.health);
			if(this.playerHealthText !== undefined){
				this.playerHealthText.destroy();
			}
			
			this.playerHealthText = this.game.add.bitmapText(410, 450, 'font',"Health: " + player.health, 16);
			this.playerHealthText.smoothed = true;
			this.playerHealthText.fixedToCamera = true;
		}
};


