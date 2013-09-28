define( 'wave', ['enemy', 'game', 'entity', 'perm'], function ( Enemy, Game, Entity, _ ) {
	
	var Wave = function ( args ) {
		this.level = args.level;
		this.enemiesToSpawn = 10;
		this.game = args.game;
		this.tick = args.game.gameTick % _.enemy.SPAWN_SPACING;
	};
	
	Wave.prototype.spawnEnemy = function () {
		var _offset = Math.floor( Math.random() * 6 );
		(new Enemy({
			'bounty': _.enemy.INITIAL_BOUNTY + Math.floor( this.game.level / 4 ),
			'game': this.game,
			'h': 12,
			'level': this.level,
			'hitPoints': this.game.enemyHitPoints,
			'offset': _offset,
			'speed': 1,
			'w': 12,
			'x': this.game.map.getStartCoordinates().x,
			'y': _offset + 6 + this.game.map.getStartCoordinates().y
		}));
		this.enemiesToSpawn--;
	};
	
	Wave.prototype.hasLastEnemySpawned = function () {
		return this.enemiesToSpawn === 0;
	};
	
	return Wave;
	
});