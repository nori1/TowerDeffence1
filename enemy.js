define( 'enemy', ['utils', 'entity', 'perm', 'options'], function ( utils, Entity, perm, options ) {

	var Enemy = utils.inheritConstructor( Entity.getInstance(), function ( args ) {
		Entity.call( this, args );
		this.bounty = args.bounty;
		this.corridor = 1;
		this.entityType = perm.entityTypes.ENEMY;
		this.hitPointsGreen = this.w;
		this.hitPointsRed = 0;
		this.hitPoints = args.hitPoints;
		this.level = args.level;
		this.maxHitPoints = args.hitPoints;
		this.offset = args.offset;
		this.ticksSlowed = 0;
		this.traveled = 0;
		this.addToGame( this );
	});

	Enemy.fn.draw = function ( canvasContext ) {
		canvasContext.fillStyle = 'black';
		canvasContext.fillRect( this.x, this.y, this.w, this.h );
		if( options.showHealthBars ) {
			canvasContext.fillStyle = 'rgb(0, 255, 0)';
			canvasContext.fillRect( this.x, this.y, this.hitPointsGreen, 2 );
			canvasContext.fillStyle = 'rgb(255, 0, 0)';
			canvasContext.fillRect( this.x + this.hitPointsGreen, this.y, this.hitPointsRed, 2 );
		}
	};

	Enemy.fn.move = function () {
		var a, // axis
			i, // index
			p = this.game.path,
			c = this.corridor;
		// is moving horizontally or vertically?
		( p[c][0] != p[c-1][0] ) ? (a = 'x', i = 0) : (a = 'y', i = 1);
		if( --this.ticksSlowed <= 0 ) this.speed = 2;
		// which direction should it be moving
		(p[c][i] * 32 > p[c-1][i] * 32 - this.offset) 
			? this[a] += this.speed
			: this[a] -= this.speed;
		// has entered the next corridor?
		if ( Math.abs( this[a] - p[c][i] * 32 - 8 - this.offset ) < 2 ) {
			this.corridor++;
		}
		this.traveled += this.speed;
		if( this.x >= this.game.width || this.y >= this.game.height ) {
			this.destroy();
			this.game.lives--;
		}
	};

	Enemy.fn.takeDamage = function ( damage ) {
		this.hitPoints -= damage;
		if ( this.hitPoints > 0 ) {
			this.hitPointsGreen = Math.ceil( this.hitPoints / this.maxHitPoints * this.w );
			this.hitPointsRed = Math.floor(
				(this.maxHitPoints - this.hitPoints) / this.maxHitPoints * this.w
			);
		} else {
			this.destroy();
			this.game.money += this.bounty;
			this.game.score += this.level;
			return true;
		}
	};
	
	return Enemy;

});