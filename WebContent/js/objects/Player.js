Player = function(game, x, y){
	Character.call(this, game, x, y, 'player');
	
	this.name = "Sune";
	
	this.health = 20;
	this.dexterity = 13;
	this.defense = 14;
	this.strength = 15; 

	/*Räknas ut*/
	this.primalDamage = 1;
	this.weaponDamage = 0;
	this.attackSpeed = 5;
	this.blockSpeed = 3;
	this.hit = 1;
	this.protection = 1;
	this.block = 1.2;
	this.reach = 2;
	/*---------*/
	
	this.groupCombatEnabled = false;
	this.timeGroupCombated = 0;
	this.maxGroupCombatTime = 500;
	this.groupCombatTime = 500;

	this.animations.add('idleRight', [0], 5, true);
	this.animations.add('right', [0, 1, 2], 5);
	this.animations.add('hitRight', [0, 3, 4], 5, true);
	this.animations.add('idleLeft', [5], 5, true);
	this.animations.add('left', [5, 6, 7], 5);
	this.animations.add('hitLeft', [5, 8, 9], 5, true);
	this.animations.add('idleUp', [10], 5, true);
	this.animations.add('up', [10, 11, 12], 5);
	this.animations.add('idleDown', [15], 5, true);
	this.animations.add('down', [15, 16, 17], 5);
	this.animations.add('hitDown', [15, 18, 19], 5, true);

	this.reachCircle = this.game.add.graphics();
	this.reachCircle.beginFill(0x000000, 1);
	this.reachCircle.drawCircle(this.x + (SPRITE_SIZE/2), this.y + (SPRITE_SIZE/2), this.reach * SPRITE_SIZE);
	this.reachCircle.alpha = 0.2;
	this.reachCircle.endFill();
	
	this.equipped = new Equipped(this.game, 0, 0);
	this.equipped.inputEnabled = true;
	this.equipped.input.enableDrag();
	this.equipped.scale.set(0);

	this.game.add.existing(this.equipped);
	this.equipped.fixedToCamera = true;
	
	this.inventory = new Inventory(this.game, 0, (48*4));
	this.inventory.inputEnabled = true;
	this.inventory.input.enableDrag();
	this.inventory.scale.set(0);

	this.game.add.existing(this.inventory);
	this.inventory.fixedToCamera = true;
	
	this.events.onAnimationComplete.add(function(self, animation){
		this.animations.stop(true, true);
		
		if(animation.name.includes("hit") && this.enemiesAttacked.length > 0){
			this.enemiesAttacked.pop().takeDamage(this, "primary");
		}
	}, this);
	
	this.wasd = {
		up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
		down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
		left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
		right: this.game.input.keyboard.addKey(Phaser.Keyboard.D)
	};
	
	this.keys = {
		equipped: this.game.input.keyboard.addKey(Phaser.Keyboard.TAB),
		inventory: this.game.input.keyboard.addKey(Phaser.Keyboard.I),
	};
	
	
	this.keys.equipped.onDown.add(function(){
		if(this.equipped.scale.isZero()){
			this.equipped.scale.set(1);
			this.game.world.bringToTop(this.equipped);
		}else{
			this.equipped.scale.set(0);
		}
	}, this);
	
	this.keys.inventory.onDown.add(function(){
		if(this.inventory.scale.isZero()){
			this.inventory.scale.set(1);
			this.game.world.bringToTop(this.inventory);
		}else{
			this.inventory.scale.set(0);
		}
	}, this);

	
	this.dmgTextColour = "#ff0000";
	
	//Init
	var startingWeapon = new Weapon(this.game, 0, 0, 'sword');
	startingWeapon.id = 1;
	startingWeapon.damage = 4; 
	startingWeapon.protection = 0; 
	startingWeapon.speed = 1.6;
	startingWeapon.block = 0;
	startingWeapon.twoHanded = true;
	
	var startingWeapon2 = new Weapon(this.game, 0, 0, 'sword2');
	startingWeapon2.id = 2;
	startingWeapon2.damage = 4; 
	startingWeapon2.protection = 0; 
	startingWeapon2.speed = 1.6;
	startingWeapon2.block = 0;
	startingWeapon2.twoHanded = true;
    
	//this.equip(startingWeapon, ['rightHand', 'leftHand']);
	this.inventory.add(startingWeapon, this);
	this.inventory.add(startingWeapon2, this);
};

Player.prototype = Object.create(Character.prototype);

Player.prototype.constructor = Player;

Player.prototype.checkActions = function(levelObjects){
	this.reachCircle.clear();
	this.reachCircle.beginFill(0x000000, 1);
	this.reachCircle.drawCircle(this.x + (SPRITE_SIZE/2), this.y + (SPRITE_SIZE/2), this.reach * SPRITE_SIZE);
	this.reachCircle.alpha = 0.2;
	this.reachCircle.endFill();
	
	if(this.groupCombatEnabled){
		//TODO: Kolla istället så att inte tiden för groupcobat har gått ut.
		this.engageGroupCombat(levelObjects.enemies);
	}
	
	if(this.groupCombatTime < this.maxGroupCombatTime){
		this.groupCombatTime--;
		
		if(this.groupCombatTime === 0){
			this.groupCombatTime = this.maxGroupCombatTime;
			this.timeGroupCombated = this.game.time.now;
		}
	}
	

	
	if(this.game.input.activePointer.leftButton.isDown && !this.groupCombatEnabled){
		this.engageSingleCombat(levelObjects.enemies);
	}else if(this.game.input.activePointer.rightButton.isDown){
		for(var i = 0; i < levelObjects.enemies.length; i++){
			var enemy = levelObjects.enemies[i];
	
			if(this.checkHitEnemy(enemy, this.game.input.activePointer.x + this.game.camera.x, this.game.input.activePointer.y + this.game.camera.y)){
				if(enemy.blockChanceTimeGap.isRunning){
					this.parryEnemy(enemy);
				}
			}
		}
	}
};
		
Player.prototype.engageSingleCombat = function(enemies){
	if(this.game.time.now - this.timeAttacked > this.getAttackSpeed()){
		this.playCombatAnimations();
		
		for(var i = 0; i < enemies.length; i++){
			var enemy = enemies[i];
			
			if(this.checkHitEnemy(enemy, this.game.input.activePointer.x +  this.game.camera.x, this.game.input.activePointer.y + this.game.camera.y)){
				this.enemiesAttacked.push(enemy);
			}
		}
		
		this.timeAttacked = this.game.time.now;
		
		if(this.equipped.rightHand !== undefined){
			if(this.equipped.rightHand.twoHanded){
				this.timeBlocked = this.game.time.now;
			}
		}
	}
};
		
Player.prototype.engageGroupCombat = function(enemies){
	var enemiesInCombatArea = [];
	var nextAttacker = null;
	
	//Find enemies within combat area
	for(var i = 0; i < enemies.length; i++){
		if(this.checkReach(enemies[i])){
			enemiesInCombatArea.push(enemies[i]);
		}
	}
	
	//Detect next enemy attack
	for(var i = 0; i < enemiesInCombatArea.length; i++){
		var enemy = enemiesInCombatArea[i];
		if(i === 0){
			nextAttacker = enemy;
		}else{
			if(enemy.timeAttacked > 0){
				var enemyRecoveryTimeLeft = ((this.getAttackSpeed() + (ENEMY_DIFFICULTY_DIVIDER / this.level)) + enemy.tempCooldownTime) - (this.game.time.now - enemy.timeAttacked);
				var prevEnemyRecoveryTimeLeft = ((nextAttacker.getAttackSpeed() + (ENEMY_DIFFICULTY_DIVIDER / this.level)) + nextAttacker.tempCooldownTime) - (this.game.time.now - nextAttacker.timeAttacked);
				
				if(enemyRecoveryTimeLeft < prevEnemyRecoveryTimeLeft){
					//TODO: Om samma - slumpa? Inom viss marginal och baserat på skill - slumpa?
					nextAttacker = enemy;
					this.waitingTime = prevEnemyRecoveryTimeLeft;
				}
			}

		}
	}
	
	if(nextAttacker !== null){
		//Try to parry the enemy attack
		console.log("parry: " + nextAttacker.id);
		
		this.parryEnemy(nextAttacker);
		console.log(this.setActiveWeaponFrame());
	}
};
		
Player.prototype.parryEnemy = function(nextAttacker){
	/*Räknar ut vilken animation som ska köras*/
	var xDifference = nextAttacker.x - this.x;
	var yDifference = nextAttacker.y - this.y;
	
	var xNormDifference = xDifference < 0 ? 0 - xDifference : xDifference;
	var yNormDifference = yDifference < 0 ? 0 - yDifference : yDifference;
	
	//console.log("xNormDifference: " + xNormDifference);
	//console.log("yNormDifference: " + yNormDifference);

	if(this.game.time.now - this.timeBlocked > (this.getBlockSpeed()) ){
		if(xNormDifference > yNormDifference){
			if(xDifference > 0){
				this.animations.play("idleRight", 5, false);
				this.lastDirection = "right";
			}else{
				this.animations.play("idleLeft", 5, false);
				this.lastDirection = "left";
			}
		}else if(yNormDifference > xNormDifference){
			if(yDifference > 0){
				this.animations.play("idleDown", 5, false);
				this.lastDirection = "down";
			}else{
				this.animations.play("idleUp", 5, false);
				this.lastDirection = "up";
			}
		}
		
		this.setActiveWeaponFrame();
		
		var parryResult = "failed";
		
		var parryValue = 0;
		
		var parryForce = 0;
		var attackForce = 0;
		
		if(this.strength > this.dexterity){
			parryForce = this.strength/10 + this.defense/10 + (this.block*(Math.floor((Math.random() * 6) + 1)));
		}else{
			parryForce = this.dexterity/10 + this.defense/10 + (this.block*(Math.floor((Math.random() * 6) + 1)));
		}
		
		if(nextAttacker.strength > nextAttacker.dexterity){
			attackForce = nextAttacker.strength/10 - nextAttacker.attackSpeed/10 + (nextAttacker.hit*(Math.floor((Math.random() * 6) + 1)));
		}else{
			attackForce = nextAttacker.strength/10 - nextAttacker.attackSpeed/10 + (nextAttacker.hit*(Math.floor((Math.random() * 6) + 1)));
		}
		
		parryValue = parryForce - attackForce;
		
		console.log(parryValue);
		
		if(parryValue < 0){
			parryResult = "failed";
		}else if(parryValue >= 0 && parryValue < 3){
			parryResult = "ok";
		}else if(parryValue >= 3 && parryValue < 5){
			parryResult = "good";
		}else if(parryValue >= 5){
			parryResult = "perfect";
		}
		
		console.log(parryResult);
		
		/*TODO: For now - only make harmful and threatening parries
		 * possible if using group combat mode.*/
		if(parryResult !=="failed" && this.groupCombatEnabled === false){
			parryResult = "ok";
		}
		
		switch(parryResult){
			case "failed" :
				break;
			case "ok" :
				nextAttacker.getBlocked(this, "unharmful");
				break;
			case "good":
				nextAttacker.takeDamage(this, "parry_good");
				nextAttacker.getBlocked(this, "threatening");
				break;
			case "perfect":
				nextAttacker.takeDamage(this, "parry_perfect");
				nextAttacker.getBlocked(this, "harmful");
				break;
		}
		
		this.timeBlocked = this.game.time.now;
		console.log(this.equipped);
		if(this.equipped.rightHand.twoHanded){
			this.timeAttacked = this.game.time.now;
		}
	}
};

Player.prototype.readInput = function(enemies){
	this.checkActions({enemies: enemies.children});

	if(this.wasd.up.isDown){
		this.body.velocity.y = -96;
		this.animations.play("up");
		this.lastDirection = "up";
		this.setActiveWeaponFrame();
	}else if(this.wasd.down.isDown){
		this.body.velocity.y = 96;
		this.animations.play("down");
		this.lastDirection = "down";
		this.setActiveWeaponFrame();
	}else if(this.wasd.left.isDown){
		this.body.velocity.x = -96;
		this.animations.play("left");
		this.lastDirection = "left";
		this.setActiveWeaponFrame();
	}else if(this.wasd.right.isDown){
		this.body.velocity.x = 96;
		this.animations.play("right");
		this.lastDirection = "right";
		this.setActiveWeaponFrame();
	}
};
		
/*TODO: Gör till generellt checkHit*/
Player.prototype.checkHitEnemy = function(enemy, mouseX, mouseY){
	if(this.checkReach(enemy)){
		if((mouseX >= enemy.x && mouseX < enemy.x + SPRITE_SIZE) && (mouseY >= enemy.y && mouseY < enemy.y + SPRITE_SIZE)){
			return true;
		}
	}

	return false;
};

Player.prototype.setActiveWeaponFrame = function(){
	if(this.equipped.rightHand !== undefined){
		this.equipped.rightHand.frame = this.getActiveEquipmentFrameNumber();
	}
	
	if(this.equipped.leftHand !== undefined){
		this.equipped.leftHand.frame = this.getActiveEquipmentFrameNumber();
	}
};

Character.prototype.getGroupCombatCooldownSpeed = function(){
	return GROUPCOMBATSPEED_COUNTERWEIGHT - (5 * GROUPCOMBATSPEED_MULTIPLIER);
};



