/* EX:
{
  bots : [
    { id: 1, avaiableBombs: 2, position: { x: 1, y: 2 }, alive: true },
    { id: 2, avaiableBombs: 1, position: { x: 1, y: 2 }, alive: false }
  ],
  wood_tiles : [
    { position: { x:1, y:1 }, material: 'grass' }
    { position: { x:1, y:2 }, material: 'wood' }
    { position: { x:1, y:3 }, material: 'wall' }
  ],
  wall_tiles : [
    { position: { x:1, y:1 }, material: 'grass' }
    { position: { x:1, y:2 }, material: 'wood' }
    { position: { x:1, y:3 }, material: 'wall' }
  ],
  bombs: [
    { position: { x:1, y:1 }, timeToExplosion: 3 }
  ],
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
    })  
  }
});
