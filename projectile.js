define( 'projectile', ['entity', 'utils', 'perm'], function ( Entity, utils, perm ) {
	
	var Projectile = utils.inheritConstructor( Entity.getInstance(), function ( args ) {
		Entity.call( this, args );
		this.damage = args.damage;
		this.entityType = perm.entityTypes.PROJECTILE;
		this.exploded = false;
		this.explosionTicks = 1;
		this.explosionRadius = args.explosionRadius;
		this.follow = args.follow;
		this.maxSpeed = args.speed;
		this.moveTo = args.moveTo;
		this.speed = this.calculateSpeed();
		this.target = args.target;
		this.type = args.type;
		this.addToGame( this );
	});
	
	Projectile.EXPLOSION_COLOR = 'rgba(255,0,0,0.5)';
	
	/*
	 * @func static
	 */
	Projectile.calculateDelta = function ( x1, x2, y1, y2 ) {
		return { // delta X and delta Y
			'x': Math.abs(x1 - x2),
			'y': Math.abs(y1 - y2)
		};
	};
	
	Projectile.fn.calculateSpeed = function () {
		var _delta = Projectile.calculateDelta( 
			this.x, this.moveTo.x, 
			this.y, this.moveTo.y 
		);
		return this.speed = {
			'x': ( _delta.x < _delta.y ) ?
				this.maxSpeed * _delta.x / _delta.y : this.maxSpeed,
			'y': ( _delta.x > _delta.y ) ?
				this.maxSpeed * _delta.y / _delta.x : this.maxSpeed
		};
	};
	
	Projectile.fn.calculateMoveTo = function () {
		this.moveTo = {
			'x': this.game.enemies[ this.target ].x + 6,
			'y': this.game.enemies[ this.target ].y + 6
		};
	};
	
	Projectile.fn.moveToTarget = function () {
		if( this.follow === true ) {
		   /*
			* TODO change target at max level
			*/
			if( this.game.enemies[ this.target ] !== undefined ) {
				this.calculateMoveTo();
			} else {
				this.target = null;
			}
			this.calculateSpeed();
		}
		this.x += ( this.x > this.moveTo.x ) ? -this.speed.x : this.speed.x;
		this.y += ( this.y > this.moveTo.y ) ? -this.speed.y : this.speed.y;
	};
	
	Projectile.fn.draw = function ( canvasContext ) {
		utils.drawCircle( 
			canvasContext, this.x, this.y, 
			( this.exploded ) ? this.explosionRadius : 2,
			Projectile.EXPLOSION_COLOR 
		);
	};
	
	Projectile.fn.isTargetReached = function () {
		var _delta = Projectile.calculateDelta( this.x, this.moveTo.x, this.y, this.moveTo.y );
		return _delta.x <= this.speed.x && _delta.y <= this.speed.y;
	};
	
	Projectile.fn.intersects = function ( rect ) {
		return this.explosionRadius + perm.enemy.WIDTH >= Math.sqrt(
			Math.pow( rect.x + rect.w / 2 - this.x + this.w / 2, 2 ) +
			Math.pow( rect.y + rect.h / 2 - this.y + this.h / 2, 2 )
		);
	};
	
	Projectile.fn.animate = function ( canvasContext ) {
		if( this.exploded === true ) {
			if( !this.explosionTicks ) {
				this.destroy();
			} else {
				this.explosionTicks--;
			}
		} else {
			this.moveToTarget();
			if( this.isTargetReached() ) {
				this.exploded = true;
				if( this.type === perm.towerTypes.CANON && this.target !== null ) {
					this.game.enemies[ this.target ].takeDamage( this.damage );
				} else if ( this.type === perm.towerTypes.HEAVY ) {
					for ( var p = this.game.enemies.length, k = 0; p > k; k++ ) {
						if( this.game.enemies[k] && this.intersects( this.game.enemies[k] ) ) {
							this.game.enemies[k].takeDamage( this.damage );
						}
					}
				}
			}
		}
		this.draw( canvasContext );
	};
	
	return Projectile;
	
});