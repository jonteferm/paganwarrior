const SPRITE_SIZE = 48; //Tile size of the character sprites.
const ATTACKSPEED_MULTIPLIER = 10; //Attack speed is multiplied by this so that the attack speed value can be kept in same format as other stats.
const ATTACKSPEED_COUNTERWEIGHT = 2000; //Used as the base attack speed in milliseconds. The (speed*multiplier) is subtracted from this value.
const BLOCKSPEED_MULTIPLIER = 10; //Block speed is multiplied by this so that the attack speed value can be kept in same format as other stats.
const BLOCKSPEED_COUNTERWEIGHT = 1800; //Used as the base block speed in milliseconds. The (speed*multiplier) is subtracted from this value.
const ENEMY_DIFFICULTY_DIVIDER = 3000; //Divided by enemy level and used to regulate e.g. attack speed as a modifer.
const GROUPCOMBATSPEED_MULTIPLIER = 10; //Group combat cooldown speed is multiplied by this so that the attack speed value can be kept in same format as other stats.
const GROUPCOMBATSPEED_COUNTERWEIGHT = 10000;