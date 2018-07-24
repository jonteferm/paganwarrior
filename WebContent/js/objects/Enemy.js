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
	
	this.path;
	this.timeSincePathCalc = 0;
	this.currentPathMilestone;
	this.pathStepsFinished = 0;
	this.timeSinceDirectionChange = 0;
	
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

Enemy.prototype.takeActions = function(levelObjects){
	this.drawReachCircle();
	
	var reachOpponent = false;
	
	if(this.timeSincePathCalc === ENEMY_PATHCALCULATION_SPEED){
		this.timeSincePathCalc = 0;
	}
	
	if(this.timeSincePathCalc > 0){
		this.timeSincePathCalc ++;
	}
	

	for(var i = 0; i < levelObjects.opponents.length; i++){
		var opponent = levelObjects.opponents[i];

		reachOpponent = this.checkReach(opponent);
	}


	if(reachOpponent){
		console.log(reachOpponent);
		this.body.velocity.x = 0;
		this.body.velocity.y = 0;
		this.resetPath();
		
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
				this.playCombatAnimations(levelObjects.player);
				
				this.timeAttacked = this.game.time.now;
				//console.log("enemy " + this.id + " strikes player!");
				opponent.takeDamage(this, "primary");
		
				this.tempCooldownTime = 0;
			
				return "attackedPlayer";
			}	
		}
	}else{
		//console.log("enemy" + this.id + " do not reach");
		if(this.checkSpotPlayer(levelObjects.player.x, levelObjects.player.y)){
			var goalX = levelObjects.player.x + (SPRITE_SIZE);
			var goalY = levelObjects.player.y + (SPRITE_SIZE);

			this.moveTo(goalX, goalY, levelObjects.layer, levelObjects.pathfinder);
		}
	}
};

Enemy.prototype.checkSpotPlayer = function(playerX, playerY){
	if(
		(this.x + this.perception * SPRITE_SIZE >= playerX || this.x - this.perception * SPRITE_SIZE >= playerX) && 
		(this.y + this.perception * SPRITE_SIZE >= playerY || this.y - this.perception * SPRITE_SIZE >= playerY)
	){
		return true;
	}
};
		
Enemy.prototype.makeMovement = function(velocity){

	this.body.velocity.x = velocity.x*80;
	this.body.velocity.y = velocity.y*80;
	
	var walkUp = this.body.velocity.y < 0.5;
	var walkDown = this.body.velocity.y > 0.5;
	var walkRight = this.body.velocity.x > 0.5;
	var walkLeft = this.body.velocity.x < 0.5;
	
	var walkDiagonally = this.body.velocity.x > 0 && this.body.velocity.y > 0;
	
	if(!walkDiagonally){
		if(walkLeft){
			this.runAnimation("left");
			this.setActiveWeaponFrame();
		}else if(walkRight){
			this.runAnimation("right");
			this.setActiveWeaponFrame();
		}else if(walkUp){
			this.runAnimation("up");
		}else if(walkDown){
			this.runAnimation("down")
		}	
	}else{
		if(walkUp && walkRight){
			this.runAnimation("rightUp");
		}else if(walkDown && walkRight){
			this.runAnimation("rightDown");
		}else if(walkUp && walkLeft){
			this.runAnimation("leftUp");
		}else if(walkDown && walkLeft){
			this.runAnimation("leftDown");
		}
	}
};

Enemy.prototype.runAnimation = function(animationName){
	if(!this.isPlaying){
		//console.log(this.id);
		//console.log(animationName);

		
		if(this.timeSinceDirectionChange === 0){
			this.animations.play(animationName);
			this.lastDirection = animationName;	
		}else{
			this.animations.play(this.lastDirection);
		}
		
		if(this.timeSinceDirectionChange === 10){
			this.timeSinceDirectionChange = 0;
		}else{
			this.timeSinceDirectionChange++;
		}
	}
};

Enemy.prototype.calculatePath = function(layer, pathfinder, player){
	var self = this;
	
    pathfinder.setCallbackFunction(function(path) {
        path = path || [];
        
        self.path = path;

        self.timeSincePathCalc = 1;
        
        //console.log("Path calculated, ", path);
        //self.currentPathMilestone = undefined;
    });
    
    pathfinder.preparePathCalculation([layer.getTileX(this.x), layer.getTileY(this.y)], [layer.getTileX(player.x),  layer.getTileX(player.y)]);
	pathfinder.calculatePath();
};

Enemy.prototype.moveTo = function(goalX, goalY, layer, pathfinder){
	var distanceReset = false;
	var pathFinished =  this.path !== undefined && this.pathStepsFinished === this.path.length;
	console.log(this.path);
	console.log(this.pathStepsFinished);
	
	if(this.timeSincePathCalc === 0 || (this.timeSincePathCalc && pathFinished)){
		 this.calculatePath(layer, pathfinder, new Phaser.Point(goalX, goalY));
		 distanceReset = true;
		 this.pathStepsFinished = 0;
	}
   
    if(this.path !== undefined && this.path.length > 0){
    	//console.log(this.currentPathMilestone);
    	
    	if(this.currentPathMilestone === undefined){
    		//console.log("INIT milestone enemy ", this.id);
    		this.currentPathMilestone = this.path[0];
    	}
		
    	if(this.currentPathMilestone !== undefined){
    		//console.log("movesTo: " + this.currentPathMilestone.x + " " + this.currentPathMilestone.y);
    		var distance = Phaser.Point.distance({x: this.position.x/SPRITE_SIZE, y: this.position.y/SPRITE_SIZE}, this.currentPathMilestone);
    		
    		//console.log(distance);
    		if(distance < 1 || distanceReset){
	    		//console.log("NY milestone enemy " + this.id + ": ");
	    		//console.log(this.currentPathMilestone);
	 
	    		if(this.pathStepsFinished !== this.path.length){
		    		this.currentPathMilestone = this.path[this.pathStepsFinished];
		    		this.pathStepsFinished ++;
	    		}

	    		distanceReset = false;
	    	}else{
	    		velocity = new Phaser.Point(this.currentPathMilestone.x - (this.position.x/SPRITE_SIZE), this.currentPathMilestone.y - (this.position.y/SPRITE_SIZE));
	    		velocity.normalize();
	    		
	    		this.makeMovement(velocity);
	    	}
    	}
    
    }
};

Enemy.prototype.resetPath = function(){
	this.timeSincePathCalc = 0;
	this.path = undefined;
	this.pathStepsFinished = 0;
};


Enemy.prototype.setActiveWeaponFrame = function(){
	if(this.equipped.rightHand !== undefined){
		this.equipped.rightHand.frame = this.getActiveEquipmentFrameNumber();
	}
	
	if(this.equipped.leftHand !== undefined){
		this.equipped.leftHand.frame = this.getActiveEquipmentFrameNumber();
	}
};

