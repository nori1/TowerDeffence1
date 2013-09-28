define( 'tower', ['utils', 'entity', 'perm', 'projectile'], function ( utils, Entity, perm, Projectile ) {
	
	/*
	 * Ultimate at lvl 10
	 * ORC Crit - %
	 * FROST Ministun - %
	 * CANON - if current target is destroyed, create two projectiles which target another enemy - always
	 * HEAVY - add follow - always
	 */

	var Tower = utils.inheritConstructor( Entity.getInstance(), function ( args ) {
		Entity.call( this, args );
		this.cooldown = 0; // how many game ticks to wait before shooting
		this.damage = args.damage;
		this.entityType = perm.entityTypes.TOWER;
		this.type = args.type;
		this.color = perm.towerColors[ this.type ];
		this.level = 0;
		this.moneyInvested = perm.initialTowerCost[ this.type ];
		this.range = perm.towerStats[ this.type ].range[0];
		this.selected = false;
		this.target = -1;
		this.addToGame( this );
	});

	Tower.perm = {
		'FROST_SLOW_TICKS': 600,
		'FROST_SLOW_MULTIPLIER': 0.9,
		'FROST_STUN_TICKS': 5,
		'FROST_ULTI_CHANCE': 0.2,
		'MAX_LEVEL': 9,
		'ORC_ULTI_CHANCE': 0.5
	}

	Tower.fn.isMaxLevel = function () {
		return this.level === Tower.perm.MAX_LEVEL;
	}

	Tower.fn.attack = function ( canvasContext ) {
		var is_target_destroyed = false;
		if( this.cooldown === 0 ) {
			if( !this.isInRange( this.game.enemies[this.target] ) ) {
				this.findTarget();
			}
			if( this.target !== -1 ) {
				switch( this.type ) {
					case perm.towerTypes.ORC:
						utils.drawLine(	canvasContext, this, this.game.enemies[ this.target ] );
						if( this.level === Tower.perm.MAX_LEVEL && Math.random() >= Tower.perm.ORC_ULTI_CHANCE ) {
							is_target_destroyed = this.game.enemies[ this.target ].takeDamage( this.damage * 2 );
						} else {
							is_target_destroyed = this.game.enemies[ this.target ].takeDamage( this.damage );
						}
						if( is_target_destroyed ) {
							this.target = -1;
						}
						break;
					case perm.towerTypes.FROST:
						utils.drawLine(	canvasContext, this, this.game.enemies[ this.target ] );
						//if( this.level === Tower.MAXLEVEL && Math.random() >= Tower.perm.FROST_ULTI_CHANCE ) {
						//	this.game.enemies[ this.target ].ticksStunned = Tower.perm.FROST_STUN_TICKS;
						//}
						if( this.game.enemies[ this.target ].ticksSlowed < Tower.perm.FROST_SLOW_TICKS + this.level ) {
							this.game.enemies[ this.target ].ticksSlowed = Tower.perm.FROST_SLOW_TICKS + this.level;
							this.game.enemies[ this.target ].speed *= Tower.perm.FROST_SLOW_MULTIPLIER;
						}
						if( this.game.enemies[ this.target ].takeDamage( this.damage ) ) {
							this.target = -1;
						}
						break;
					case perm.towerTypes.CANON:
					case perm.towerTypes.HEAVY:
						this.createProjectile();
						break;
					default:
						break;
				}
				this.cooldown = perm.towerStats[ this.type ].speed[ this.level ];
			}
		} else {
			this.cooldown--;
		}
	};

	Tower.fn.isInRange = function ( entity ) {
		return !!entity && this.range >= Math.sqrt(
			Math.pow(this.x + this.w / 2 - entity.x + 6, 2 ) + 
			Math.pow(this.y + this.h / 2 - entity.y + 6, 2 )
		);
	};

	Tower.fn.createProjectile = function () {
    	var _options = {
                'damage': this.damage,
                'game': this.game,
                'h': 16,
                'moveTo': {
                    'x': this.game.enemies[ this.target ].x + 6,
                    'y': this.game.enemies[ this.target ].y + 6
                },
                'target': this.target,
                'type': this.type,
                'w': 16,
                'x': this.x + this.w / 2,
                'y': this.y + this.h / 2
            };
		if( this.type === perm.towerTypes.HEAVY ) {
            if( this.isMaxLevel() ) {
                _options.follow = true;
            } else {
                _options.follow = false;
            }
            _options.speed = 2;
            _options.explosionRadius = 40;
		} else if ( this.type === perm.towerTypes.CANON ) {
			_options.explosionRadius = 3;
			_options.follow = true;
            _options.speed = 4;
        }
		return new Projectile( _options );
	};

	Tower.fn.findTarget = function () {
		this.target = -1
		for( var i = 0, k = this.game.enemies.length; i < k; i++ ) {
			if( this.isInRange(this.game.enemies[i]) ) {
				if( !this.game.enemies[ this.target ] || 
					this.game.enemies[i].traveled > this.game.enemies[this.target].traveled ) {
						this.target = this.game.enemies.indexOf( this.game.enemies[i] );
				}
			}
		}
	};

	Tower.fn.draw = function ( canvasContext ) {
		
		if( this.selected ) {
			utils.drawCircle(
				canvasContext, 
				this.x + this.w / 2,
				this.y + this.h / 2,
				this.range,
				perm.tower.HIGHLIGHT_COLOR
			);
		}
		canvasContext.save();
		
		if( this.isMaxLevel() ) {
			canvasContext.shadowBlur = 3;  
			canvasContext.shadowColor = this.color;
		}
	
		canvasContext.fillStyle = this.color;
		canvasContext.fillRect( this.x, this.y, 32, 32 );
		canvasContext.restore();
		
	};

	Tower.fn.sell = function () {
		this.game.money += this.moneyInvested * perm.towerRefundPercentage;
		this.destroy();
		this.game.redrawHiddenCanvas();
	};

	Tower.fn.upgrade = ( function () {
		var _stats = ['damage', 'speed', 'range'];
		return function () {
			if( this.level === Tower.perm.MAX_LEVEL ) {
				return;
			}
			this.color = utils.lightenHexColor( this.color, 'a' );
			if( this.game.money >= perm.towerUpgradeCost[ this.level ] ) {
				if( ++this.level === 9 ) {
					$('#upgrade').attr('disabled', true).addClass('disabled');
				}
				this.game.money -= perm.towerUpgradeCost[ this.level ];
				this.moneyInvested += perm.towerUpgradeCost[ this.level ];
				for( var k = _stats.length - 1; k >= 0; --k ) {
					this[ _stats[k] ] = perm.towerStats[ this.type ][ _stats[k] ][ this.level ];
				}
			}
		}
	}());
	
	return Tower;
	
});