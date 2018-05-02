Enemy = function(game, x, y, type){
	Character.call(this, game, x, y, type);
	
	this.name = "Enemy";


	this.health = 10;
	this.dexterity = 13;
	this.defense = 14;
	this.strength = 15; 
	
	/*Räknas ut*/
	this.primalDamage = 1;
	this.weaponDamage = 2;
	this.protection = 1;
	this.attackSpeed = 1;
	this.hit = 1;
	this.reach = 1;
	this.perception = 5;
	/*---------*/
	
	this.inventory = [];

	this.tempCooldownTime = 0;
	
	this.enemyAttacked;

	this.animations.add('idleRight', [0], 5, true);
	this.animations.add('right', [0, 1, 2], 5);
	this.animations.add('hitRight', [0, 3, 4], 5, true);
	this.animations.add('idleRightDown', [20], 5, true);
	this.animations.add('rightDown', [20, 21, 22], 5); 
	this.animations.add('hitRightDown', [0, 23, 24], 5, true);
	this.animations.add('idleLeftDown', [25], 5, true);
	this.animations.add('leftDown', [25, 26, 27], 5);
	this.animations.add('hitLeftDown', [25, 28, 29], 5, true);
	this.animations.add('idleRightUp', [30], 5, true);
	this.animations.add('rightUp', [30, 31, 32], 5);
	this.animations.add('hitRightUp', [30, 33, 34], 5, true);
	this.animations.add('idleLeftUp', [35], 5, true);
	this.animations.add('leftUp', [35, 36, 37], 5);
	this.animations.add('hitLeftUp', [35, 38, 39], 5, true);
	this.animations.add('idleLeft', [5], 5, true);
	this.animations.add('left', [5, 6, 7], 5);
	this.animations.add('hitLeft', [5, 8, 9], 5, true);
	this.animations.add('idleUp', [10], 5, true);
	this.animations.add('up', [10, 11, 12], 5);
	this.animations.add('idleDown', [15], 5, true);
	this.animations.add('down', [15, 16, 17], 5);
	this.animations.add('hitDown', [15, 18, 19], 5, true);
	
	var weapon = new Weapon(this.game, 0, 0, 'sword');
	
	this.equipped = {
			chest: {name: "chainmail", type: "armor", damage: 0, protection: 1},
			rightHand: this.addChild(weapon),
			leftHand: weapon
	};

	this.events.onAnimationComplete.add(function(self, animation){			
		this.animations.stop(true, true);
		
		if(animation.name.includes("hit") && this.enemyAttacked != undefined){
			this.enemyAttacked.takeDamage(this, "primary");
		}
	}, this);
};

Enemy.prototype = Object.create(Character.prototype);

Enemy.prototype.constructor = Enemy;

Enemy.prototype.checkSpotPlayer = function(playerX, playerY){
	if(
		(this.x + this.perception * SPRITE_SIZE >= playerX || this.x - this.perception * SPRITE_SIZE >= playerX) && 
		(this.y + this.perception * SPRITE_SIZE >= playerY || this.y - this.perception * SPRITE_SIZE >= playerY)
	){
		return true;
	}
};
		
Enemy.prototype.makeMovement = function(playerX, playerY){
	if((this.y > playerY + SPRITE_SIZE || this.y < playerY - SPRITE_SIZE) || (this.x > playerX + SPRITE_SIZE || this.x < playerX - SPRITE_SIZE)){				
		var verticalDifference = this.y > playerY ? this.y - playerY : playerY - this.y;
		var horizontalDifference = this.x > playerX ? this.x - playerX : playerX - this.x;

		/*console.log(verticalDifference);
		console.log(horizontalDifference);
		console.log("playerX: " + playerX + ", this.x: " + this.x);
		console.log("playerY: " + playerY + ", this.y: " + this.y);
		console.log(this.x - playerX);*/
		
		if((playerY < this.y) && (verticalDifference > horizontalDifference)){
			if(this.x - playerX <= -48){
				this.body.velocity.y = -40;
				this.body.velocity.x = 40;
				this.animations.play("rightUp");
				this.lastDirection = "rightUp";
			}else if(this.x - playerX >= 24) {
				this.body.velocity.y = -40;
				this.body.velocity.x = -40;
				this.animations.play("leftUp");
				this.lastDirection = "leftUp";
			}else{
				this.body.velocity.y = -80;
				this.animations.play("up");
				this.lastDirection = "up";
			}
			
			//this.setActiveWeaponFrame();
		}else if((playerY > this.y) && (verticalDifference > horizontalDifference)){
			if(this.x - playerX <= -48){
				this.body.velocity.y = 40;
				this.body.velocity.x = 40;
				this.animations.play("rightDown");
				this.lastDirection = "rightDown";
			}else if(this.x - playerX >= 24) {
				this.body.velocity.y = 40;
				this.body.velocity.x = -40;
				this.animations.play("leftDown");
				this.lastDirection = "leftDown";
			}else{
				this.body.velocity.y = 80;
				this.animations.play("down");
				this.lastDirection = "down";
			}
			//this.setActiveWeaponFrame();
		}else if((playerX < this.x) && (horizontalDifference > verticalDifference)){
			this.body.velocity.x = -80;
			this.animations.play("left");
			this.lastDirection = "left";
			this.setActiveWeaponFrame();
		}else if((playerX > this.x) && (horizontalDifference > verticalDifference)){
			this.body.velocity.x = 80;
			this.animations.play("right");
			this.lastDirection = "right";
			this.setActiveWeaponFrame();
		}
	}
};

Enemy.prototype.faceDirection = function(playerX, playerY){
	
};
		
Enemy.prototype.takeActions = function(levelObjects){
	var reachOpponent = false;
	
	if(this.checkSpotPlayer(levelObjects.player.x, levelObjects.player.y)){
	    levelObjects.pathfinder.setCallbackFunction(function(path) {
	    	console.log(path);
	        path = path || [];
	        
	        console.log("PATH: ", path);
	      
	    });
	    
	    console.log(this.x);
	    console.log(this.y);
		
	    levelObjects.pathfinder.preparePathCalculation([levelObjects.layer.getTileX(this.x), levelObjects.layer.getTileY(this.y)], [levelObjects.layer.getTileX(levelObjects.player.x),  levelObjects.layer.getTileX(levelObjects.player.y)]);
		levelObjects.pathfinder.calculatePath();
		
		//this.makeMovement(levelObjects.player.x, levelObjects.player.y);	
	}
	
	for(var i = 0; i < levelObjects.opponents.length; i++){
		var opponent = levelObjects.opponents[i];

		reachOpponent = this.checkReach(opponent);
	}
	
	if(reachOpponent){
		if(this.game.time.now - this.timeAttacked > (this.getAttackSpeed() + (ENEMY_DIFFICULTY_DIVIDER / this.level)) + this.tempCooldownTime){
			var attackWarning = this.game.add.text(this.x + (this.hitCount * 5), this.y - (this.hitCount * 5), "!", {
				font: "18px Arial",
				fill: "#66ffff",
			});
		    
			this.blockChanceTimeGap = this.game.add.tween(attackWarning).to({alpha: 0}, 500, null, true);
	
			this.blockChanceTimeGap.onComplete.add(function(){
				attackWarning.destroy();
			});

			if(this.game.time.now - this.timeAttacked > (((this.getAttackSpeed() + (ENEMY_DIFFICULTY_DIVIDER / this.level)) + this.tempCooldownTime) + 500)){
				this.playCombatAnimations();
				
				this.timeAttacked = this.game.time.now;
				console.log("enemy " + this.id + " strikes player!");
				opponent.takeDamage(this, "primary");
		
				this.tempCooldownTime = 0;
			
				return "attackedPlayer";
			}	
		}
	}
};

Enemy.prototype.setActiveWeaponFrame = function(){
	if(this.equipped.rightHand !== undefined){
		console.log(this.getActiveEquipmentFrameNumber());
		this.equipped.rightHand.frame = this.getActiveEquipmentFrameNumber();
	}
	
	if(this.equipped.leftHand !== undefined){
		this.equipped.leftHand.frame = this.getActiveEquipmentFrameNumber();
	}
};