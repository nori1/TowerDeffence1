define( 'perm', {
	defaultEntityDimensions: {
		'HEIGHT': 32,
		'WIDTH': 32
	},
	entityTypes: {
		'TOWER': 0,
		'ENEMY': 1,
		'PROJECTILE': 2
	},
	towerTypes: {
		'ORC': 0,
		'HEAVY': 1,
		'CANON': 2,
		'FROST': 3
	},
	towerColors: {
		'0': '#cc2222',
		'1': '#57E1A1',
		'2': '#F2A00C',
		'3': '#1278ab'
	},
	initialTowerCost: {
		'0': 25,
		'1': 30,
		'2': 45,
		'3': 50
	},
	tower: {
		'HIGHLIGHT_COLOR': 'rgba(255, 255, 255, 0.05)'
	},
	towerUpgradeCost: [ 50, 80, 120, 180, 230, 300, 450, 600, 800, 1000 ],
	towerStats: {
		'0': {
			'damage': [ 11, 15, 25, 40, 75, 125, 200, 280, 360, 450 ],
			'range': [ 180, 185, 190, 195, 200, 205, 210, 217, 225, 235 ],
			'speed': [ 60, 58, 56, 54, 52, 50, 48, 46, 43, 40 ]
		},
		'1': {
			'damage': [ 5, 9, 13, 25, 40, 70, 100, 150, 225, 300 ],
			'range': [100, 115, 120, 125, 130, 135, 140, 146, 153, 160 ],
			'speed': [ 110, 108, 105, 102, 98, 94, 90, 86, 81, 75 ]
		},
		'2': {
			'damage': [ 20, 30, 50, 80, 150, 250, 400, 650, 850, 1200 ],
			'range': [ 200, 205, 210, 215, 220, 225, 230, 237, 245, 255 ],
			'speed': [ 70, 68, 66, 64, 62, 60, 58, 56, 53, 50 ]
		},
		'3': {
			'damage': [ 2, 5, 10, 20, 32, 45, 60, 80, 100, 125 ],
			'range': [ 100, 105, 110, 115, 120, 125, 130, 136, 143, 150 ],
			'speed': [ 90, 88, 85, 82, 78, 74, 70, 66, 61, 55 ]
		}
	},
	// how much % of money invested is returned when a tower is sold
	towerRefundPercentage: 0.5,
	enemy: {
		'BOUNTY_MULTIPLIER': 1.05,
		'COUNT_PER_SPAWN': 10,
		'INITIAL_HIT_POINTS': 10,
		'INITIAL_BOUNTY': 5,
		'HIT_POINT_MULTIPLIER': 1.05,
		'SPAWN_SPACING': 7,
		'HEIGHT': 12,
		'WIDTH': 12
	}
});