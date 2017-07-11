Enemy = function(game, x, y, type){
	Character.call(this, game, x, y, type);
	
	this.name = "Enemy";
	this.equipped = {
		chest: {name: "chainmail", type: "armor", damage: 0, protection: 1},
	};

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

    this.animations.add('right', [0,1], 10, true);
	this.animations.add('left', [2,3], 10, true);

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
		if(playerY > this.y){
			this.body.velocity.y = 80;
		}else if(playerY < this.y){
			this.body.velocity.y = -80;
		}

		if(playerX > this.x){
			this.body.velocity.x = 80;
			this.animations.play("right");
		}else if(playerX < this.x){
			this.body.velocity.x = -80;
			this.animations.play("left");
		}
	}
};
		
Enemy.prototype.takeActions = function(levelObjects){
	var reachOpponent = false;
	
	if(this.checkSpotPlayer(levelObjects.player.x, levelObjects.player.y)){
		this.makeMovement(levelObjects.player.x, levelObjects.player.y);	
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
				this.timeAttacked = this.game.time.now;
				console.log("enemy " + this.id + " strikes player!");
				opponent.takeDamage(this, "primary");
		
				this.tempCooldownTime = 0;
			
				return "attackedPlayer";
			}	
		}
	}
};