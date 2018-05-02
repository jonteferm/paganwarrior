/**
 * Level state.
 */
function Level() {
	Phaser.State.call(this);
	// TODO: generated method.
	this.conversationOpen = false;
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State.prototype);
Level.prototype = proto;
Level.prototype.constructor = Level;

Door.prototype = Object.create(Phaser.Sprite.prototype);

Level.prototype = {
	create: function(){
		if(this.game.state.current === 'level'){
			this.map = this.game.add.tilemap('oryxtiles2');
		}else if(this.game.state.current === 'level2'){
			this.map = this.game.add.tilemap('oryxtiles3');
		}

		this.map.addTilesetImage('tiles', 'tiles');
		//this.map.addTilesetImage('tilesLightForest', 'tilesLightForest');
		//this.map.addTilesetImage('tilesAutumn', 'tilesAutumn');
		//this.map.addTilesetImage('tree', 'tree');
		this.map.addTilesetImage('trees', 'trees');
		this.map.addTilesetImage('autumn48', 'autumn48');
		this.map.addTilesetImage('wood48', 'wood48');
		this.map.addTilesetImage('lightForest48', 'lightForest48');

		this.backgroundLayer = this.map.createLayer('backgroundLayer', 768, 768);
		this.blockLayer = this.map.createLayer('blockLayer', 768, 768 );
		this.treeLayer = this.map.createLayer('treeLayer', 768, 768);
		this.lowerTreeLayer = this.map.createLayer('lowerTreeLayer', 768, 768);
		this.lesserObjectsLayer = this.map.createLayer('lesserObjectsLayer', 768, 768);
		
		this.pathfinder = this.game.plugins.add(Phaser.Plugin.PathFinderPlugin);
		
		//TODO: Hitta alla walkable tiles i lagren
		console.log(this.map.layers);
		
		var grid = [];
		var walkables = [];
		
		var counter = 0;
		for(var i = 0; i < 17; i++){
			grid[i] = [];
			for(var j = 0; j < 16; j++){
				grid[i].push(counter);
				
				//TODO: Kolla alla lager
				//console.log(this.blockLayer.layer.data[i][j].index === -1);

				if(this.blockLayer.layer.data[i][j].index === -1 && this.treeLayer.layer.data[i][j].index === -1){

					walkables.push(counter);
				}
				
				counter ++;
			}
		}
		
		console.log("grid", grid);
		console.log("walkables", walkables);
		
		this.pathfinder.setGrid(grid, walkables);
	

	    this.map.setCollisionBetween(1, 3000, true, 'blockLayer');
	    this.map.setCollisionBetween(1, 3000, true, 'lowerTreeLayer');

	    this.backgroundLayer.resizeWorld();

	    this.createItems();
	 	this.createDoors();
		
		this.spawnEnemies(this.map);
		this.spawnNpcs(this.map);
		this.setEntryPoints(this.map); 
		
		this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); };
		
	    var playerStart = this.findObjectsByType('playerStart', this.map, 'objectLayer')[0];
	    this.player = new Player(this.game, playerStart.x, playerStart.y);
	    this.game.add.existing(this.player);
	    this.game.physics.arcade.enable(this.player);
	    this.game.camera.follow(this.player);
		this.player.body.setSize(13,32,16,9);
	
		this.controlPanel = new ControlPanel(this.game, this.player);
		
		this.player.game.controlPanel = this.controlPanel;
	},

	update: function(){
		this.game.physics.arcade.collide(this.player, this.blockLayer, this.handleWall);
		this.game.physics.arcade.overlap(this.player, this.items, this.pickupItem, null, this);
		this.game.physics.arcade.collide(this.player, this.doors, this.handleDoor, null, this);
		this.game.physics.arcade.collide(this.player, this.lowerTreeLayer, this.handleWall);
		this.game.physics.arcade.overlap(this.player, this.entryPoints, this.changeLevel);
		
		this.game.physics.arcade.collide(this.enemies, this.blockLayer);
		this.game.physics.arcade.collide(this.enemies, this.lowerTreeLayer);
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


		this.player.readInput(this.enemies);
		
		for(var i = 0; i < this.enemies.children.length; i++){
			var enemy = this.enemies.children[i];
			
			if(enemy.health > 0){
				var actionTaken = enemy.takeActions({player: this.player, opponents: [this.player], layer: this.backgroundLayer, pathfinder: this.pathfinder});
				if(actionTaken === "attackedPlayer"){
					this.controlPanel.updatePlayerStatsText();
				}
			}
		}
		
		if(this.player.timeAttacked > 0){
			this.controlPanel.attackBar.updateProgress(this.game.time.now - this.player.timeAttacked, this.player.getAttackSpeed());
		}
		
		if(this.player.timeBlocked > 0){
			this.controlPanel.blockBar.updateProgress(this.game.time.now - this.player.timeBlocked, this.player.getBlockSpeed());
		}
		
		//console.log(this.player.timeGroupCombated);
		
		if(this.player.timeGroupCombated > 0){
			this.controlPanel.groupCombatBar.updateProgress(this.game.time.now - this.player.timeGroupCombated, this.player.getGroupCombatCooldownSpeed());
		}

		if(this.player.groupCombatTime !== this.player.maxGroupCombatTime && this.player.groupCombatTime > 0){
			this.controlPanel.groupCombatTimeBar.updateProgress(this.player.groupCombatTime, this.player.maxGroupCombatTime);
		}
	},

	collisionHandlerPlayerAndEnemy: function(player, enemy){
		player.body.velocity.x = 0;
		player.body.velocity.y = 0;
		enemy.body.velocity.x = 0;
		enemy.body.velocity.y = 0;
		enemy.animations.stop();
	},
	
	collisionHandlerPlayerAndNPC: function(player, npc){
		if(!this.conversationOpen){
			this.conversation = new Conversation(this.game, 0, 0, player, npc);
			this.conversation.inputEnabled = true;
			this.conversation.input.enableDrag();
			this.conversation.scale.set(1);
			this.conversationOpen = true;

			this.game.add.existing(this.conversation);
			this.conversation.fixedToCamera = true;
			
			this.conversation.exitButton.events.onInputDown.add(function(){
				this.conversation.destroy();
				this.conversationOpen = false;
			}, this);
			
		}

		//this.addText(NPC.name + ": " + NPC.chat(player));
	},
	
	collisionHandlerEnemyAndEnemy: function(enemy1, enemy2){

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

	spawnEnemies: function(map){
		this.enemies = this.game.add.group();
		this.enemies.enableBody = true;
	    this.game.physics.arcade.enable(this.enemies);
		
		var enemyStartPositions = this.findObjectsByType('enemyStart', map, 'objectLayer');
		
		for(var i = 0; i < enemyStartPositions.length; i++){
			var enemyStart = enemyStartPositions[i];
			var enemy = new Enemy(this.game, enemyStart.x, enemyStart.y, 'enemyfootman');
			
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
	
	setEntryPoints: function(map){
		this.entryPoints = this.game.add.group();
		this.entryPoints.enableBody = true;
		this.game.physics.arcade.enable(this.entryPoints);
		
		var levelEntryPoints = this.findObjectsByType('levelEntryPoint', map, 'objectLayer');
		
		for(var i = 0; i < levelEntryPoints.length; i++){
			var levelEntryPoint = levelEntryPoints[i];
			
			var entryPoint = new EntryPoint(this.game, levelEntryPoint.x, levelEntryPoint.y);
			
			this.entryPoints.add(entryPoint);
		}
	},
	
	changeLevel: function(player, entryPoint){
		entryPoint.changeLevel();
	}
};


