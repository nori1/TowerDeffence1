define( 'entity', ['utils', 'perm'], function ( utils, perm ) {

	var Entity = function ( args ) {
		this.game = args.game;
		this.h = args.h || perm.defaultEntityDimensions.HEIGHT;
		this.speed = args.speed;
		this.w = args.w || perm.defaultEntityDimensions.WIDTH;
		this.x = args.x;
		this.y = args.y;
	};

	Entity.defaultArgs = {
		'h': 20,
		'image': 'default.png',
		'speed': 0,
		'w': 20,
		'x': 0,
		'y': 0
	};

	Entity.getInstance = function () {
		return new Entity( Entity.defaultArgs );
	};

	Entity.prototype.getType = function () {
		return this.type;
	}

	Entity.insertInto = function ( containerArray, entityObject ) {
		var _index = null;
		for( var i = 0, k = containerArray.length; i < k; ++i ) {
			if( containerArray[i] === undefined ) {
				_index = i;
			}
		}
		if( _index !== null ) {
			containerArray[ _index ] = entityObject;
		} else {
			containerArray.push( entityObject );
		}
	}

	/*
	* @func used to add objects who inherit from Entity.prototype
	*	to their respective arrays of this.game object
	*/
	Entity.prototype.addToGame = function ( entity ) {
		if( entity.entityType === perm.entityTypes.PROJECTILE ) {
			Entity.insertInto( this.game.projectiles, entity );
		} else if( entity.entityType === perm.entityTypes.ENEMY ) {
			Entity.insertInto( this.game.enemies, entity );
		} else if ( entity.entityType === perm.entityTypes.TOWER ) {
			Entity.insertInto( this.game.towers, entity );
		}
	}

	Entity.prototype.draw = function ( canvasContext ) {
		canvasContext.drawImage( this.image, this.x, this.y, this.w, this.h );
	};

	Entity.prototype.destroy = function () {
		switch( this.entityType ) {
			case perm.entityTypes.ENEMY:
				delete this.game.enemies[ this.game.enemies.indexOf( this ) ];
				break;
			case perm.entityTypes.PROJECTILE:
				delete this.game.projectiles[ this.game.projectiles.indexOf( this ) ];
				break;
			case perm.entityTypes.TOWER:
				this.game.towers.splice( this.game.towers.indexOf( this ), 1 );
				break;
			default:
				break;
		};
	};

	/*
	* @func to check whether entities bounding rectangle 
	* contains the point (x,y) in coordinate system
	*/
	Entity.prototype.containsPoint = function ( x, y ) {
		return this.x <= x && this.x + this.w > x &&
			this.y <= y && this.y + this.h > y;
	};

	/*
	*	@param rect - object with 4 properties - x, y, w, h
	*/
	Entity.prototype.intersects = function( rect ) {
		rect.w = rect.w || 32, rect.h = rect.h || 32;
		return this.x < rect.x + rect.w && this.x + this.w > rect.x &&
			this.y < rect.y + rect.h && this.y + this.h > rect.y;
	}

	return Entity;
	
});