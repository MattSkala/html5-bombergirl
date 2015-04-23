/* EX:
{
  bots : [
    { id: 1, avaiableBombs: 2, position: { x: 1, y: 2 }, alive: true },
    { id: 2, avaiableBombs: 1, position: { x: 1, y: 2 }, alive: false }
  ],
  tiles : 2 dimenional array,
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
  tiles: [],
  bombs: [],

  tilesX: 17,
  tilesY: 13,
  id:0,

  init: function(bots, tiles, bombs, id) {
    this.bots = bots;
    this.tiles = tiles;
    this.bombs = bombs;
    this.id = id;
  },

  getMe: function() {
    for (var i = 0; i < this.bots.length; i++) {
      var bot = this.bots[i];
      if (bot.id === this.id) {
        return bot;
      }
    }
    return null;
  },

  getOthers: function() {
    var result = [];
    for (var i = 0; i < this.bots.length; i++) {
      var bot = this.bots[i];
      if (bot.id !== this.id && bot.alive) {
        result.push(bot);
      }
    }
    return result;
  },

  getPathTo: function (bot) {
    var self = this;
    var visited = [];
    for (var i = 0; i < this.tilesX; i++) {
      var a = [];
      for (var j = 0; j < this.tilesY.length; j++)
        a.push(false);
      visited.push(a);
    }

    var queue = [[this.getMe().position]];

    while (queue.length) {
      var path = queue.shift();
      var pos = path[path.length - 1];

      if (this._isBotPosition(pos) && pos.x == bot.position.x && pos.y === bot.position.y)
        return path;

      if (visited[pos.x][pos.y])
        continue;

      visited[pos.x][pos.y] = true;

      var positions = getAdjacentPos(pos);
      _.each(positions, function (pos) {
        if (!visited[pos.x][pos.y]) {
          queue.push(path.concat([pos]));
        }
      });
    }

    return null;

    function getAdjacentPos(pos) {
      var y = pos.y;
      var x = pos.x;

      var result = [];

      if (x > 0)
        result.push({x: x - 1, y: y});
      if (y > 0)
        result.push({x: x, y: y - 1});
      if (x < self.tilesX - 1)
        result.push({x: x + 1, y: y});
      if (y < self.tilesY - 1)
        result.push({x: x, y: y + 1});

      result = _.filter(result, function (p) {
        return (!self._isWoodPosition(p) && !self._isWallPosition(p) && self.isSafe(p));
      });

      return result;
    }
  },

  isSafe: function(position) {
        for (var i = 0; i < gGameEngine.bombs.length; i++) {
            var bomb = gGameEngine.bombs[i];
            var fires = bomb.getDangerPositions();
            for (var j = 0; j < fires.length; j++) {
                var fire = fires[j];
                if (Utils.comparePositions(fire, position)) {
                    return false;
                }
            }
        }
        return true;
    },

    getNearWood: function(position) {
        for (var i = 0; i < 4; i++) {
            var dirX;
            var dirY;
            if (i == 0) { dirX = 1; dirY = 0; }
            else if (i == 1) { dirX = -1; dirY = 0; }
            else if (i == 2) { dirX = 0; dirY = 1; }
            else if (i == 3) { dirX = 0; dirY = -1; }

            var p2 = { x: position.x + dirX, y: position.y + dirY };
            if (gGameEngine.getTileMaterial(p2) == 'wood') {
                return gGameEngine.getTile(p2);
            }
        }
    },

  // asumption: the given action is possible/executable
  generateSuccessor: function(bot_id, action) {
    var newBots;
    var newTiles;
    var newBombs;
    var nextPosition;

    // apply the action => get ghost new state  { id: 1, avaiableBombs: ?, position: ?, alive: ? }
    var botState = this._getBotState(bot_id);
    if (!botState.alive) {
      console.log('trying to generate successor state when bot is dead');
      return;
    }

    nextPosition = Utils.nextPositionAfterAction(action, botState.position);

    newBots = this._getSuccessorBotStates(bot_id, action, nextPosition);
    newBombs = this._getSuccessorBombStates(botState, action);
    newTiles = this._getSuccessorTileStates(newBombs);

    return new GameState(newBots, newTiles, newBombs, bot_id);
  },

  _getSuccessorTileStates: function(newBombStates) {
    var newTileStates= [];
    for (var j = 0; j < this.tilesX; j++) {
      newTileStates[j] = [];
      for (var i = 0; i < this.tilesY; i++) {
        newTileStates[j][i] = this.tiles[j][i];
      }
    }

    // any wall got destroyed
    _.each(newBombStates, function(bomb) {
      if (bomb.exploded) {
        _.each(bomb.fires, function(position) {
          if (newTileStates[position.x][position.y] === 'wood') {
            newTileStates[position.x][position.y] = 'grass';
          }
        });
      }
    });
    return newTileStates;
  },

  _getSuccessorBombStates: function(bot, action) {
    var self = this;
     // increment bombs' timers + check if any bomb explode + fire them??
    var newBombs = _.chain(this.bombs).filter(function(bomb) {
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
        self._explode(bomb);
      }
    });

    if (action === 'bomb') {
      newBombs.push({
        position: { x: bot.position.x, y: bot.position.y },
        strength: bot.bombStrength,
        timer: 0,
        timerMax: 2,
        exploded: false,
        fires: []
      });
    }

    return newBombs;
  },

  _getSuccessorBotStates: function(bot_id, action, nextPosition) {
    var self = this;
    return _.map(this.bots, function(bot) {
      if(bot.id === bot_id) {
        var newBotState = self._copy_bot_state(bot);
        if (action === 'bomb') {
          newBotState.avaiableBombs = newBotState.avaiableBombs - 1;
        }
        // is next poisition gonna make the boss killed
        newBotState.alive = !self.isFireCollision(nextPosition);
        newBotState.position = nextPosition;
        return newBotState;
      } else {
        return self._copy_bot_state(bot);
      }
    });
  },

  _copy_bot_state: function(bot) {
    return {
      id: bot.id,
      avaiableBombs: bot.avaiableBombs,
      position: { x: bot.position.x, y: bot.position.y },
      alive: bot.alive,
      bombStrength: bot.bombStrength
    };
  },

  // explode the bombs and return an arrays of `wood` wall positions got destroyed
  // explode other bombs in range
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

            var material = this.tiles[position.x][position.y];
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

  _getAdjacentPos: function (pos) {
    // debugger
    var y = pos.y;
    var x = pos.x;

    var result = [];

    // if (x > 0)
      result.push({x: x - 1, y: y});
    // if (y > 0)
      result.push({x: x, y: y - 1});
    // if (x < self.tilesX - 1)
      result.push({x: x + 1, y: y});
    // if (y < self.tilesY - 1)
      result.push({x: x, y: y + 1});

    return result;
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
    return this.tiles[position.x][position.y] === 'grass';
  },

  _isWoodPosition: function (pos) {
    return this.tiles[pos.x][pos.y] === 'wood';
  },

  _isBotPosition: function(position) {
    return _.any(this.bots, function(bot) {
      return bot.position.x === position.x && bot.position.y === position.y;
    });
  },

  isDanger: function (position) {
    var self = this;
    var positions = this._getAdjacentPos(position);

    return _.every(positions, function (p) {
      return self._isBombPosition(p) || self._isWoodPosition(p) || self._isWallPosition(p);
    });
  },

  getWood: function () {
    var result = [];

    for (var i = 0; i < this.tilesX; i++) {
      for (var j = 0; j < this.tilesY; j++) {
        var pos = {x: i, y: j};

        if (this._isWoodPosition(pos))
          result.push(pos);
      }
    }

    return result;
  },

  _isWallPosition: function (pos) {
    return this.tiles[pos.x][pos.y] === 'wall';
  },

  _getBotState: function(bot_id) {
    return _.find(this.bots, function(bot) {
      return bot.id === bot_id;
    });
  }
});
