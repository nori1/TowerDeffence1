define(	'game', ['wave', 'tower', 'enemy', 'perm', 'map', 'utils', 'entity', 'options', 'jquery' ],
	function ( Wave, Tower, Enemy, perm, Map, utils, Entity, options, $ ) {

        /*
         * Tower, Enemy, and Projectile inherit from Entity.
         */
 
		var _ = perm,
			m = Math,
			w = window,
			
			canvasHidden = document.getElementById('canvas-background'),
			// the gameContext which is drawn only once when game is initialized
			contextHidden = canvasHidden.getContext('2d'),
			gameCanvas = document.getElementById('canvas-main'),
			// the gameContext of the main canvas, which is redrawn every frame
			gameContext = gameCanvas.getContext('2d'),
			gameMouse = {
				'x': 0, 'y': 0, // real mouse coords
				'_x': 0, '_y': 0 // mouse coords on the grid
			};

		var Game = function () {
			this.enemies = [];
			this.enemyHitPoints = perm.enemy.INITIAL_HIT_POINTS;
			this.delay = 30; // add delay when fps > 30
			this.gameTick = m.floor( new Date().getTime() / 1000 );
			this.height = gameCanvas.height;
			this.mouseEntered = true;
			this.isActive = true;
			this.level = 1;
			this.lives = 10;
			this.map = new Map;
			this.money = 50;
			this.path = this.map.getPath();
			this.paused = false;
			this.projectiles = [];
			this.score = 1;
			this.towers = [];
			this.towerSelectedIndex = -1;
			this.towerSelectedType = -1;
			this.waves = [];
			this.width = gameCanvas.width;
			this.initialize();
		};

		Game.prototype.areEnemiesDestroyed = function () {
			for( var i = 0, k = this.enemies.length; i < k; ++i ) {
				if ( this.enemies[i] !== undefined ) return false;
			}
			return true;
		};

		Game.prototype.calculateFps = ( function () {
			var fpsContainer = $('#game-fps'),
				lastSecond = 0,
				fps = 0;
			return function () {
				var currentSecond = new Date().getSeconds();
				fps++;
				if( currentSecond !== lastSecond ) {
					fpsContainer.text( 'FPS: ' + fps);
					fps = 0;
					lastSecond = currentSecond;
				}
			}
		} () );

		Game.prototype.draw = function () {
			gameContext.drawImage( canvasHidden, 0, 0, this.width, this.height );
			for( var i = 0, k = this.towers.length; i < k; ++i ) {
				if( this.towers[i] !== undefined ) {
					this.towers[i].attack( gameContext );
				}
			}
			for( i = 0, k = this.enemies.length; i < k; ++i ) {
				if( this.enemies[i] !== undefined ) {
					this.enemies[i].draw( gameContext );
					this.enemies[i].move();
				}
			}
			for( i = 0, k = this.projectiles.length; i < k; ++i ) {
				if( this.projectiles[i] !== undefined ) {
					this.projectiles[i].animate( gameContext );
				}
			}
		};

		Game.prototype.drawPath = function () {
			contextHidden.fillStyle = '#777777';
			for( var g = this.height / 32, h = 0; h < g; h++ ) {
				for( var o = this.width / 32, p = 0; p < o; p++ ) {
					contextHidden.fillRect( h * 32, p * 32, 32, 32);
				}
			}
			contextHidden.fillStyle = '#999999';
			for( var i = 0, k = this.path.length - 1; i < k; i++ ) {
				for( var w = m.abs( this.path[i][0] - this.path[i+1][0] ); w >= 0; w-- ) {
					for( var h = m.abs( this.path[i][1] - this.path[i+1][1] ); h >= 0; h-- ) {
						contextHidden.fillRect(
							m.min(this.path[i][0],this.path[i+1][0])*32,
							m.min(this.path[i][1],this.path[i+1][1])*32,
							(m.abs(this.path[i+1][0]-this.path[i][0])+1)*32,
							(m.abs(this.path[i+1][1]-this.path[i][1])+1)*32
						);
					}
				}
			}
		};

		Game.prototype.handleInput = function () {

			var self = this;

			$('#canvas-main').on({
				'click': function ( event ) {
					// jQuery sets 'this' to the element being queried, 
					// so we have to use call() or apply()
					Game.prototype.updateMouseCoordinates.call( this, event );

					self.towerSelectedIndex = self.isTowerClicked();

					if ( self.towerSelectedIndex === -1 ) {
						if( self.towerSelectedType !== -1 && self.isTowerPlacementValid() ) {
							if( _.initialTowerCost[ self.towerSelectedType ] > self.money ) {
								console.log( 'Not enough money to build this tower. ' + 
									_.initialTowerCost[ self.towerSelectedType ] + ' needed.' );
							} else {
								self.money -= _.initialTowerCost[ self.towerSelectedType ];
								(new Tower({
									'damage': _.towerStats[ self.towerSelectedType ].damage[0],
									'game': self,
									'image': 'sprites.png',
									'speed': 1,
									'type': self.towerSelectedType,
									'x': gameMouse._x,
									'y': gameMouse._y
								}));
							}
						} else {
							self.towerSelectedType = -1;
						}
					} else {
						self.towers[ self.towerSelectedIndex ].selected = true;
						if( self.towers[ self.towerSelectedIndex ].level >= Tower.perm.MAX_LEVEL ) {
							$('#upgrade').attr('disabled', true).addClass('disabled');
						} else {
							$('#upgrade').attr('disabled', false).removeClass('disabled');	
						}
					}

					self.redrawHiddenCanvas();
				},
				'mousemove': ( function () {
					return function( event ) {
						Game.prototype.updateMouseCoordinates.call( this, event );
					}
				}()),
				'mouseenter': function () {
					self.mouseEntered = true;
				},
				'mouseleave': function () {
					self.mouseEntered = false;
				}
			});

			$('#game-tower-orc').click( function () {
				self.towerSelectedType = _.towerTypes.ORC;
			});

			$('#game-tower-heavy').click( function () {
				self.towerSelectedType = _.towerTypes.HEAVY;
			});

			$('#game-tower-canon').click( function () {
				self.towerSelectedType = _.towerTypes.CANON;
			});

			$('#game-tower-frost').click( function () {
				self.towerSelectedType = _.towerTypes.FROST;
			});

			$('#upgrade').click( function () {
				self.towers[ self.towerSelectedIndex ].upgrade();
				self.redrawHiddenCanvas();
			});

			$('#sell').click( function () {
				self.money += self.towers[ self.towerSelectedIndex ].moneyInvested;
				self.towers[ self.towerSelectedIndex ].destroy();
				self.redrawHiddenCanvas();
			});

			$('#spawn').click( function () {
				self.requestSpawn();
			});

			$('#pause').click( function () {
				if( self.paused === true ) {
					self.paused = false;
					this.innerHTML = 'Pause';
					self.loop();
				} else {
					self.paused = true;
					this.innerHTML = 'Resume';
				}
			});

			$('#show-health-bars').change( function () {
				options.showHealthBars = !options.showHealthBars;
			});

			$('.game-restart').click( function () {
				self.restart();
			});
		
			$('#game-submit').click( function () {
				self.submitScore();
			});

		};

		Game.prototype.initialize = function () {
			$('#upgrade, #sell').attr('disabled', true).addClass('disabled');
			// draw the map/path on hidden canvas
			this.drawPath();
			this.handleInput();
			this.loop();
		};

		Game.prototype.isTowerClicked = function () {
			var _selected_tower_index = -1
			for( var i = 0, k = this.towers.length; i < k; ++i ) {
				if( this.towers[i].containsPoint( gameMouse._x + 8, gameMouse._y + 8 )) {
					_selected_tower_index = i;
					this.towerSelectedType = -1;
				} else {
					this.towers[i].selected = false;
				}
			}
			if( _selected_tower_index === -1 ) {
				$('#upgrade, #sell').attr('disabled', true).addClass('disabled');
			} else {
				$('#upgrade, #sell').attr('disabled', false).removeClass('disabled');
				this.towers[_selected_tower_index].selected = true;
			}
			return _selected_tower_index;
		};

		Game.prototype.isTowerPlacementValid = function () {
			if( this.money < _.initialTowerCost[ this.towerSelectedType ] ) {
				return false;
			}
			var is_tower_placement_valid = true,
				temporary_rectangle = {
						'x': gameMouse._x, 'w': 32,
						'y': gameMouse._y, 'h': 32
				};
			check_intersection_loop: for( var i = this.towers.length - 1; i >= 0; --i) {
				if( this.towers[i].intersects( temporary_rectangle ) ) {
					is_tower_placement_valid = false;
					break check_intersection_loop;
				} 
			}
			if( is_tower_placement_valid ) {
				check_intersection_loop: for( var k = this.path.length - 1, i = 0; i < k; i++ ) {
					if( Entity.prototype.intersects.call( temporary_rectangle, {
						'x': m.min(this.path[i][0]*32,this.path[i+1][0]*32),
						'y': m.min(this.path[i][1]*32,this.path[i+1][1]*32),
						'w': m.abs(this.path[i][0]*32-this.path[i+1][0]*32),
						'h': m.abs(this.path[i][1]*32-this.path[i+1][1]*32)
					})){
						is_tower_placement_valid = false;
						break check_intersection_loop;
					}
				}
			}
			return is_tower_placement_valid;
		};

		Game.prototype.over = function () {
			this.isActive = false;
			gameContext.drawImage( canvasHidden, 0, 0, this.width, this.height );
			$('.game-button').attr('disabled',true).addClass('disabled');
			$('#game-over-message').removeClass('alert-error')
				.addClass('alert-info').text('Your score is ' + this.score + '.');
			$('#modal-game-over').modal();
		};

		Game.prototype.pause = function () {
			this.paused = true;
		};

		Game.prototype.loop = function () {
			// create a reference to this instance of Game
			var self = this;
			this.gameTick++;
			this.draw();
			this.update();
			this.calculateFps();

			if( this.isActive && !this.paused ) {	
				// requestAnimationFrame has to be called
				// from window's gameContext
				utils.requestFrame.call(w, function() {
					// pass the reference to loop function
					// in order to preserve 'this' functionality
					// of the game object
					Game.prototype.loop.call( self );
				});
			}
		};

		Game.prototype.redrawHiddenCanvas = function () {
			contextHidden.fillStyle = '#dadada';
			contextHidden.fillRect( 0, 0, this.width, this.height );
			this.drawPath();
			for( var i = 0, k = this.towers.length; i < k; ++i ) {
				if( this.towers[i] !== undefined ) {
					this.towers[i].draw( contextHidden );
				}
			}
		};

		Game.prototype.requestSpawn = function () {
			this.enemyHitPoints = m.round(this.enemyHitPoints * _.enemy.HIT_POINT_MULTIPLIER);
			this.waves.push( new Wave({
				'game': this,
				'level': this.level
			}));
			this.level++;
		};

		Game.prototype.restart = function () {
			location.reload();
		};

		Game.prototype.resume = function () {
			this.paused = false;
		};

		Game.prototype.spawnEnemies = function () {
			var _offset = null;
			for( var l = 0, k = this.waves.length; l < k; l++ ) {
				if( this.waves[l] !== undefined ) {
					if( this.gameTick % _.enemy.SPAWN_SPACING === this.waves[l].tick ) {
						this.waves[l].spawnEnemy();
					}
					if( this.waves[l].hasLastEnemySpawned() ) {
						this.waves.splice( l, 1 );
					}
				}
			}
		};
	
		Game.prototype.submitScore = function () {
			
			var self = this;
			
			if( $('#player-name').val() === "" ) {
				$('#game-over-message').addClass('alert-error')
					.removeClass('alert-info alert-success')
					.text('Player name cannot be empty!');
				return;
			}
			
			$.ajax({
				'type': 'post',
				'dataType': 'text',
				'data': {
					'game_player': $('#player-name').val(),
					'game_score': this.score,
					'game_map': this.map.getMapId()
				},
				'url': 'submit.php',
				'success': function () {
					$('#game-over-message').addClass('alert-success')
						.removeClass('alert-info alert-error')
						.text('Thanks, your score was submitted.');
					$('#game-score-submit-form').fadeOut(500);
				},
				'error': function () {
					$('#game-over-message').addClass('alert-error')
						.removeClass('alert-info alert-success')
						.text('Could not save your score. :(');
				}
			});
		
		};

		Game.prototype.update = ( function () {

			var gameLivesContainer = $('#game-lives'),
				gameMoneyContainer = $('#game-money'),
				gameScoreContainer = $('#game-score');

			return function () {
				gameMoneyContainer.text( 'Money: ' + this.money );
				gameLivesContainer.text( 'Lives: ' + this.lives );
				gameScoreContainer.text( 'Score: ' + this.score );

				if( this.mouseEntered && this.towerSelectedType !== -1 ) {
					gameContext.fillStyle = ( this.isTowerPlacementValid() ) ?
						'rgba(0, 200, 0, 0.5)' : 'rgba(200, 0, 0, 0.5)';
					gameContext.fillRect(gameMouse._x, gameMouse._y, 32, 32);
					utils.drawCircle(
						gameContext, gameMouse._x + 16,	gameMouse._y + 16,
						_.towerStats[ this.towerSelectedType ].range[0], 
						'rgba(100, 100, 100, 0.2)'
					);
				}

				if( this.lives <= 0 ) {
					this.over();
				}

				this.spawnEnemies();

				if( this.gameTick % _.enemy.SPAWN_SPACING === 0 && this.areEnemiesDestroyed() ) {
					this.requestSpawn();
				}
			}
		}());

		Game.prototype.updateMouseCoordinates = function ( event ) {
			gameMouse.x = event.pageX - this.offsetLeft;
			gameMouse.y = event.pageY - this.offsetTop;
			// calculate 2d coords for grid
			gameMouse._x = gameMouse.x - gameMouse.x % 8 - 16;
			if( gameMouse._x > this.width - 32 ) gameMouse._x = this.width - 32;
			gameMouse._y = gameMouse.y - gameMouse.y % 8 - 16;
			if( gameMouse._y > this.height - 32 ) gameMouse._y = this.height - 32;
		};

		return Game;
	
	}

);