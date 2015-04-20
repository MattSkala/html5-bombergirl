/* EX:
{
  bots : [
    { id: 1, avaiableBombs: 2, position: { x: 1, y: 2 }, alive: true },
    { id: 2, avaiableBombs: 1, position: { x: 1, y: 2 }, alive: false }
  ],
  wood_tiles : [
    { position: { x:1, y:1 } }
    { position: { x:1, y:2 } }
    { position: { x:1, y:3 } }
  ],
  wall_tiles : [
    { position: { x:1, y:1 } }
    { position: { x:1, y:2 } }
    { position: { x:1, y:3 } }
  ],
  bombs: [
    { position: { x:1, y:1 } , 
      strength: 1, 
      timer: 2, t
      timerMax: 2, 
      exploded: false,
      fire: [
        { position: { x:1, y:1 } } 
      ]
    }
  ]
} 
*/

GameState = Class.extend({
  POSSIBLE_ACTIONS: ['up', 'down', 'left', 'right', 'bomb'],
  bots: [],
  wood_tiles: [],
  wall_tiles: [],
  bombs: [],

  init: function(bots, wood_tiles, wall_tiles, bombs) {
    this.bots = bots;
    this.wood_tiles = this._buildPositionToMaterialHash(wood_tiles, 'wood');
    this.wall_tiles = this._buildPositionToMaterialHash(wall_tiles, 'wall');;
    this.bombs = bombs;
  },

  _buildPositionToMaterialHash: function(tiles, type) {
    var hash = {};
    
    _.each(tiles, function(tile) {
      hash[tile.poisition] = type;    
    });

    return hash;
  },

  // asumption: the given action is possible/executable 
  generateSuccessor: function(bot_id, action) {
    // apply the action => get ghost new state  { id: 1, avaiableBombs: ?, position: ?, alive: ? }
    var botState = this._getBotStateCopy(bot_id);
    var nextPosition;
    var newBombs;

    if (!botState.alive) {
      console.log('trying to generate successor state when bot is dead');
      return;
    }

    nextPosition = Utils.nextPositionAfterAction(action, botState.position);

    if (action === 'bomb') {
      botState.avaiableBombs = botState.avaiableBombs - 1; 
    } 

    // is next poisition gonna make the boss killed 
    botState.alive = !isFireCollision(nextPosition);

    // increment bombs' timers + check if any bomb explode ?? 
    // + other bombs affected ?? + wood walls affected ??
    newBombs = _.chain(this.bombs).filter(function(bomb) { 
      return !bomb.exploded;
    }).map(function(bomb) {   
      return { 
                position: bomb.position, 
                strength: bomb.strength, 
                timer: bomb.timer + 1, 
                timerMax: bomb.timerMax,
                exploded: bomb.exploded,
                fires: []
              };
    }).value();

    _.each(newBombs, function(bomb) {
     if (bomb.timer > bomb.timerMax * createjs.Ticker.getMeasuredFPS()) {
        this._explode(bomb);
      }     
    });
    
        
    
    // does the bomb kill the bot ??  

    // any wall got freed up ??
  },

  _explode: function(bomb) {
    bomb.exploded = true;    
    var positions = this._getDangerPositions(bomb);
    _.each(positions, function(position) {
      bomb.fires.push(position);
    });
  },

  _getDangerPositions: function(bomb) {
    var positions = [];
    positions.push(bomb.position);

    for (var i = 0; i < 4; i++) {
        var dirX;
        var dirY;
        if (i == 0) { dirX = 1; dirY = 0; }
        else if (i == 1) { dirX = -1; dirY = 0; }
        else if (i == 2) { dirX = 0; dirY = 1; }
        else if (i == 3) { dirX = 0; dirY = -1; }

        for (var j = 1; j <= bomb.strength; j++) {
            var explode = true;
            var last = false;

            var position = { x: bomb.position.x + j * dirX, y: bomb.position.y + j * dirY };

            var material = this._getTileMaterial(position);
            if (material === 'wall') { 
                explode = false;
                last = true;
            } else if (material === 'wood') {
                explode = true;
                last = true;
            }

            if (explode) {
                positions.push(position);
            }

            if (last) {
                break;
            }
        }
    }

    return positions;
  },

  _getTileMaterial: function(position) {
    var wood = this.wood_tiles[position];
    return wood ? 'wood' : this.wall_tiles[position];
  },

  isFireCollision: function(position) {
    var len = this.bombs.length;
    for (var i = 0; i < len; i++) {
        var bomb = this.bombs[i];
        for (var j = 0; j < bomb.fires.length; j++) {
            var fire = bomb.fires[j];
            var collision = bomb.exploded && fire.position.x == position.x && fire.position.y == position.y;
            if (collision) {
                return true;
            }
        }
    }
    return false;
  },

  // return a sub-set of GameState.POSSIBLE_ACTIONS
  getPossibleActionsForBot: function(bot_id) {
    var that = this;
    return _.filter(this.POSSIBLE_ACTIONS, function(action) {
        return that._doable_action(bot_id, action);        
    })
  },

  _doable_action: function(bot_id, action) {
    var botState = this._getBotState(bot_id);

    if (!botState.alive) {
      return false;
    }

    var nextPosition = Utils.nextPositionAfterAction(action, botState.position);
    if(action === 'bomb' && botState.avaiableBombs <= 0) {
      return false;        
    } 

    return this._isGrassPosition(nextPosition) && !this._isBombPosition(nextPosition);
  },

  _isBombPosition: function(position) {
    return _.any(this.bombs, function(bomb) {
      return bomb.position.x === position.x && bomb.position.y === position.y;    
    });
  },

  _isGrassPosition: function(position) {
    var isWoodTile = _.any(this.wood_tiles, function(tile) {
      return tile.position.x === position.x && tile.position.y === position.y;    
    });

    var isWallTile = _.any(this.wall_tiles, function(tile) {
      return tile.position.x === position.x && tile.position.y === position.y;    
    });

    return !isWoodTile && !isWallTile;
  },

  _getBotState: function(bot_id) {
    return _.find(this.bots, function(bot) {
      return bot.id === bot_id;    
    });
  },

  _getBotStateCopy: function(bot_id) {
    var botState = _.find(this.bots, function(bot) {
      return bot.id === bot_id;    
    });

    var copy = {};
    copy.id = botState.id;
    copy.position = {}
    copy.position.x = botState.position.x;
    copy.position.y = botState.position.y;
    copy.avaiableBombs = botState.avaiableBombs;
    copy.alive = botState.alive;
    return copy;
  }
});
