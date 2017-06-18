Character = function(game, x, y, type){
	Phaser.Sprite.call(this, game, x, y, type);
	
	this.id = 0;
	this.name = "";
	
	this.health = 0;
	this.dexterity = 0;
	this.defense = 0;
	this.strength = 0; 
	
	/*Räknas ut*/
	this.primalDamage = 0; //TODO: Lägg till uträkning
	this.weaponDamage = 0;
	this.attackRate = 0;
	this.hit = 0;
	this.protection = 0;
	this.block = 0;
	this.reach = 0;
	/*---------*/
	

	/*States*/
	this.lastDirction = "";
	this.timeAttacked = 0;
	this.timeBlocked = 0;
	this.hitCount = 0;
	this.attacking = false;
	this.waitingTime = 0;
	this.enemiesAttacked = [];
	this.canBeBlocked = false;
	/*------*/
	
	this.inventory = [];
	
	this.equipped = {
			
	};
	
	/*Presentation*/
	this.dmgTextColour = "#00ff66";
	/*------------*/
};

Character.prototype = Object.create(Phaser.Sprite.prototype);

Character.prototype.constructor = Character;

Character.prototype.countStats = function(){
	for (var property in this.equipped) {
		if (this.equipped.hasOwnProperty(property)) {
			var item = this.equipped[property];
			
			if(item.type === "weapon"){
				this.weaponDamage += item.damage;
			}else if(item.type === "primal"){
				this.primalDamage += item.damage;
			}
		  
	 	  	this.protection += item.protection;
			this.attackRate -= item.attackRate;
		}
	}
};
	
Character.prototype.checkReach = function(opponent){
	var totalReachRight = (this.x + 48) + this.reach*48;
	var totalReachLeft = this.x - this.reach*48;
	var totalReachUp = this.y - this.reach*48;
	var totalReachDown = (this.y + 48) + this.reach*48;
	
	if(
		((this.x <= opponent.x && totalReachRight >= opponent.x) || (this.x >= opponent.x && totalReachLeft <= opponent.x + 48))  && 
		((this.y >= opponent.y && totalReachUp <= (opponent.y + 48)) || (this.y <= opponent.y && totalReachDown >= (opponent.y)) )
	){
		return true;
	}
	
	return false;
};
		
Character.prototype.getBlocked = function(attacker, blockType){
	if(this.canBeBlocked){
		if(blockType === "threatening"){
			this.tempCooldownTime = 3000;
		}
		
		if(this.game !== null){
		    var blockedText = this.game.add.text(this.x, this.y-10, "B", {
				font: "16px Arial",
				fill: "#0066ff",
			});
		    
			var blockedTextFadeOut = this.game.add.tween(blockedText).to({alpha: 0}, 800, null, true);

			//TODO: Kommer ligga i ett event som baseras på samma tid som blockerings-animationen
			blockedTextFadeOut.onComplete.add(function(){
				blockedText.destroy();
			});
		    
			this.timeAttacked = this.game.time.now;
		}
	}
};
		
Character.prototype.takeDamage = function(attacker, attackType){
	var damageDealt = 0;
	var damageTaken = 0;

	if(attackType === "primary"){
		damageDealt = attacker.weaponDamage; //TODO: Inte riktigt va?
	}else if(attackType === "parry_good"){
		//TODO: Calculate the damage of parry.
		damageDealt = attacker.weaponDamage/2;
	}

	damageTaken = damageDealt - this.protection;

	/*As there is no case for every incoming attackType - the damageTaken
	 * can be negative and thus add to the health of the attacked.*/
	if(damageTaken >= 0 && this.game !== null){
		this.health -= damageTaken;
		
		console.log(this.name + " " + this.id + ": " + this.health);
		
	    var dmgText = this.game.add.text(this.x+(this.hitCount*5), this.y-(this.hitCount*5), "-"+damageTaken, {
			font: "16px Arial",
			fill: this.dmgTextColour,
		});
	    
		this.game.time.events.add(attacker.attackRate, function(){
			/*The attackers game reference have to be used here because this object
			 * cease to exist by the the time the event kicks in.*/
			var dmgTextFadeOut = attacker.game.add.tween(dmgText).to({alpha: 0}, 1500, null, true);

			dmgTextFadeOut.onComplete.add(function(){
				dmgText.destroy();
			});
		}, this);
		
	    
	}	


	if(damageTaken > 0){
		//todo: Spela blod-animation.
		
		this.hitCount++;
		if(this.hitCount === 3){
			this.hitCount = 0;
		}

	}

	if(this.health < 1){
		this.destroy();
	}
};