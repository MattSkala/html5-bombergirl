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
    this.wood_tiles = wood_tiles;
    this.wall_tiles = wall_tiles;
    this.bombs = bombs;
  },

  // asumption: the given action is possible/executable 
  generateSuccessor: function(bot_id, action) {
    // apply the action => get ghost new state  { id: 1, avaiableBombs: ?, position: ?, alive: ? }
    var botState = this._getBotStateCopy(bot_id);
    var nextPosition;

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
    exploded_bombs = _.each(this.bombs, function(bomb) {

    });
    
    
        
    
    // does the bomb kill the bot ??  

    // any wall got freed up ??
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
