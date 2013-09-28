define( 'map', function () {

	var PATHS = [
		[ [ 0, 4 ], [ 4, 4 ], [ 4, 6 ], [ 2, 6 ], [ 2, 2 ], [ 8, 2 ], [ 8, 8 ], [ 10, 8 ], [ 10, 5 ], [ 6, 5 ], [ 6, 12 ], [ 14, 12 ], [ 14, 1 ], [ 17, 1 ] ],
		[ [ 0, 8 ], [ 17, 8 ] ],
		[ [ 0, 12 ], [ 10, 12 ], [ 10, 4 ], [ 4, 4 ], [ 4, 9 ], [ 13, 9 ], [ 13, 15 ], [ 17, 15 ] ]
	];

	Map = function ( args ) {
		this.pathId = Math.floor( Math.random() * PATHS.length );
	};

	Map.prototype.getMapId = function () {
		return this.pathId;
	};

	Map.prototype.getStartCoordinates = function () {
		return {
			'x': PATHS[ this.pathId ][0][0] * 32,
			'y': PATHS[ this.pathId ][0][1] * 32
		};
	};

	Map.prototype.getPath = function () {
		return PATHS[ this.pathId ];
	};
	
	return Map;
	
});