Player = function(game, x, y){
	Character.call(this, game, x, y, 'player');
	
	this.equipped = {
		rightHand: {
			name: "broadsword", 
			type: "weapon", 
			damage: 4, 
			protection: 0, 
			attackRate: 1.6 ,
			block: 0,
		},
	};

	this.name = "Sune";
	
	this.health = 20;
	this.dexterity = 13;
	this.defense = 14;
	this.strength = 15; 

	/*Räknas ut*/
	this.primalDamage = 1; //TODO: Lägg till uträkning
	this.weaponDamage = 0;
	this.attackRate = 3;
	this.hit = 1;
	this.protection = 1;
	this.block = 1.2;
	this.reach = 2;
	/*---------*/
	
	this.groupCombatEnabled = false;

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
	this.reachCircle.drawCircle(this.x+24, this.y+24, this.reach*48);
	this.reachCircle.alpha = 0.2;
	this.reachCircle.endFill();
	
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
	
	this.combatKeys = {
		switchCombatStyle: this.game.input.keyboard.addKey(Phaser.Keyboard.C)
	};
	
	
	this.dmgTextColour = "#ff0000";
};

Player.prototype = Object.create(Character.prototype);

Player.prototype.constructor = Player;

Player.prototype.checkActions = function(levelObjects){
	this.reachCircle.clear();
	this.reachCircle.beginFill(0x000000, 1);
	this.reachCircle.drawCircle(this.x+24, this.y+24, this.reach*48);
	this.reachCircle.alpha = 0.2;
	this.reachCircle.endFill();
	
	if(this.groupCombatEnabled){
		this.engageGroupCombat(levelObjects.enemies);
	}
	
	if(this.game.input.activePointer.leftButton.isDown && !this.groupCombatEnabled){
		this.engageSingleCombat(levelObjects.enemies);
	}else if(this.game.input.activePointer.rightButton.isDown){
		for(var i = 0; i < levelObjects.enemies.length; i++){
			var enemy = levelObjects.enemies[i];
			
			if(this.checkHitEnemy(enemy, this.game.input.activePointer.x+this.game.camera.x, this.game.input.activePointer.y+this.game.camera.y)){
				this.parryEnemy(enemy);
			}
		}
	}else if(this.wasd.up.isDown){
		this.body.velocity.y = -96;
		this.animations.play("up");
		this.lastDirection = "up";
	}else if(this.wasd.down.isDown){
		this.body.velocity.y = 96;
		this.animations.play("down");
		this.lastDirection = "down";
	}else if(this.wasd.left.isDown){
		this.body.velocity.x = -96;
		this.animations.play("left");
		this.lastDirection = "left";
	}else if(this.wasd.right.isDown){
		this.body.velocity.x = 96;
		this.animations.play("right");
		this.lastDirection = "right";
	}
};
		
Player.prototype.engageSingleCombat = function(enemies){
	if(this.game.time.now - this.timeAttacked > this.attackRate*1000){
		if(this.lastDirection === "down"){
			this.animations.play("hitDown", 5, false);
		}else if(this.lastDirection === "left"){
			this.animations.play("hitLeft", 5, false);
		}else if(this.lastDirection === "right"){
			this.animations.play("hitRight", 5, false);
		}
		
		for(var i = 0; i < enemies.length; i++){
			var enemy = enemies[i];
			
			if(this.checkHitEnemy(enemy, this.game.input.activePointer.x+this.game.camera.x, this.game.input.activePointer.y+this.game.camera.y)){
				this.enemiesAttacked.push(enemy);
			}
		}

		this.timeAttacked = this.game.time.now;
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
					var enemyRecoveryTimeLeft = ((enemy.attackRate*1000) + enemy.tempCooldownTime) - (this.game.time.now - enemy.timeAttacked);
					var prevEnemyRecoveryTimeLeft = ((nextAttacker.attackRate*1000) + nextAttacker.tempCooldownTime) - (this.game.time.now - nextAttacker.timeAttacked);
					
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

		this.timeAttacked = this.game.time.now; //TODO: Ska all parry räknas som attacked?
	}
};
		
Player.prototype.parryEnemy = function(nextAttacker){
	//TODO: calculate how the parry went.
	
	/*Räknar ut vilken animation som ska köras*/
	var xDifference = nextAttacker.x - this.x;
	var yDifference = nextAttacker.y - this.y;
	
	var xNormDifference = xDifference < 0 ? 0 - xDifference : xDifference;
	var yNormDifference = yDifference < 0 ? 0 - yDifference : yDifference;
	
	//console.log("xNormDifference: " + xNormDifference);
	//console.log("yNormDifference: " + yNormDifference);
	

	if(this.game.time.now - this.timeBlocked > (this.attackRate*500)){
		if(xNormDifference > yNormDifference){
			if(xDifference > 0){
				this.animations.play("idleRight", 5, false);
			}else{
				this.animations.play("idleLeft", 5, false);
			}
		}else if(yNormDifference > xNormDifference){
			if(yDifference > 0){
				this.animations.play("idleDown", 5, false);
			}else{
				this.animations.play("idleUp", 5, false);
			}
		}
		
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
			attackForce = nextAttacker.strength/10 - nextAttacker.attackRate/10 + (nextAttacker.hit*(Math.floor((Math.random() * 6) + 1)));
		}else{
			attackForce = nextAttacker.strength/10 - nextAttacker.attackRate/10 + (nextAttacker.hit*(Math.floor((Math.random() * 6) + 1)));
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
	}
};
		
/*TODO: Gör till generellt checkHit*/
Player.prototype.checkHitEnemy = function(enemy, mouseX, mouseY){
	if(this.checkReach(enemy)){
		if((mouseX >= enemy.x && mouseX < enemy.x + 48) && (mouseY >= enemy.y && mouseY < enemy.y + 48)){
			return true;
		}
	}

	return false;
};



