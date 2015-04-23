// Move Heuristics: take in state, return move score
// gGameEngine already taken

var MoveHeuristics = {};

MoveHeuristics.lazy = function(state) {
    return 0;
};

MoveHeuristics.hysterical = function(state) {
    return Math.random();
};

// Moves away from other bots
MoveHeuristics.shy = function(state) {
    var value = 0;
    var others = state.getOthers();
    var me = state.getMe();
    if (state.isSafe(me.position))
        value += 1;
    var othersDist = [];
    for (var i = others.length -1; i>=0 ; i--) {
        var path = state.getPathTo(others[i]);
        if (path)
            othersDist.push(path.length);
    }
    var arrayMin = Function.prototype.apply.bind(Math.min, null);
    var min= arrayMin(othersDist);
    min = 1.0/min;
    value -= min;
    return value;
};

// Moves towards other bots
MoveHeuristics.outgoing = function(state) {
    var value = 0;
    var others = state.getOthers();
    var me = state.getMe();
    if (state.isSafe(me.position))
        value += 1;
    var othersDist =[];
    for (var i = others.length - 1; i>=0 ; i--) {
        var path = state.getPathTo(others[i]);
        if (path && path.length)
            othersDist.push(path.length);
    }
    var arrayMin = Function.prototype.apply.bind(Math.min, null);
    var min = arrayMin(othersDist);
    if (min == 1)
        value -= 1;
    min = 1.0/min;
    value += min;
    return value;
};

MoveHeuristics.obsessive = function(state) {
    var value = 0;
    var others = state.getOthers();
    var me = state.getMe();
    if (state.isSafe(me.position))
        value += 1;
    var othersDist =[];
    for (var i = others.length - 1; i>=0 ; i--) {
        var path = state.getPathTo(others[i]);
        if (path)
            othersDist.push(path.length);
    }
    var arrayMin = Function.prototype.apply.bind(Math.min, null);
    var min = arrayMin(othersDist);
    min = 1.0/min;
    value += min;
    return value;
};

// Moves towards wood
MoveHeuristics.curious = function(state) {
    var value = 0;
    var me = state.getMe();
    if (state.isSafe(me.position))
        value += 1;
    var wood = state.getWood();
    var othersDist =[];
    for (var i = wood.length - 1; i>=0 ; i--) {
        var dist = Utils.manhattanDistance(me.position,wood[i]);
        if (dist === 2 && dist === Utils.distance(me.position, wood[i]))
        {
            var pos = wood[i];
            var pos2 = me.position;
            var middle = { x: (pos.x + pos2.x) / 2, y: (pos.y + pos2.y) / 2 };
            if (state._isWallPosition(middle)) {
                dist += 2;
            }
        }
        othersDist.push(dist);
    }
    var arrayMin = Function.prototype.apply.bind(Math.min, null);
    var min = arrayMin(othersDist);
    
    min = 1.0/min;
    value += min;
    return value;
};

MoveHeuristics.brave = function(state) {
    var me = state.getMe();
    if (state.isSafe(me.position)) {
        return 1;
    }
    return 0;
}

MoveHeuristics.coward = function(state) {
    var value = 0;
    var bombs = state.bombs;
    var me = state.getMe();
    if (!state.isDanger(me.position)) {
        value += 1;
    }
    var bombDist = [];
    for(var i = bombs.length -1; i>=0 ; i--) {
        bombDist.push(Utils.manhattanDistance(me.position,bombs[i].position));
    }
    var arrayMin = Function.prototype.apply.bind(Math.min, null);
    var min = arrayMin(bombDist);
    min = 1.0/min;
    value -= min;
    return value;
};

// Bomb Heuristics: take in state, return should plant bomb
var BombHeuristics = {};

BombHeuristics.passive = function(state) {
    return false;
};

BombHeuristics.pyro = function(state) {
    return true;
};

BombHeuristics.cautious = function(state) {
    var me = state.getMe();
    var bombs = state.bombs;
    var dangers = [];
    for(var i = bombs.length -1 ; i>=0 ; i--) {
        var bomb = new Bomb(bombs[i], 0);
        dangers.push(bomb.getDangerPositions());
    }
    for(var i= dangers.length -1 ; i>=0 ; i--) {
        if (Utils.manhattanDistance(me.position,dangers[i]) < 3)
            return false;
    }
    return true;
};

BombHeuristics.bold = function(state) {
    return Math.random() < 0.99;
};

BombHeuristics.hesitant = function(state) {
    return Math.random() > 0.999;
};

BombHeuristics.aggressive = function(state) {
    var others = state.getOthers();
    for (var i = others.length - 1; i >= 0; i--) {
        var path = state.getPathTo(others[i]);
        if (path && path.length < 3)// && !state.getNearWood(state.getMe().position))
            return true;
    };
    return false;
};

BombHeuristics.spleunker = function(state) {
    var me = state.getMe();
    return state.getNearWood(me.position);
};

var Personalities = {};

Personalities.Vanilla = {
    threatened: {
        move: MoveHeuristics.coward,
        bomb: BombHeuristics.passive
    },
    walledIn: {
        move: MoveHeuristics.curious,
        bomb: BombHeuristics.spleunker
    },
    neutral: {
        move: MoveHeuristics.outgoing,
        bomb: BombHeuristics.cautious
    }
};

Personalities.Macho = {
    threatened: {
        move: MoveHeuristics.coward,
        bomb: BombHeuristics.aggressive
    },
    walledIn: {
        move: MoveHeuristics.curious,
        bomb: BombHeuristics.spleunker
    },
    neutral: {
        move: MoveHeuristics.outgoing,
        bomb: BombHeuristics.aggressive
    }
};

Personalities.Shy = {
    threatened: {
        move: MoveHeuristics.coward,
        bomb: BombHeuristics.passive
    },
    walledIn: {
        move: MoveHeuristics.curious,
        bomb: BombHeuristics.hesitant
    },
    neutral: {
        move: MoveHeuristics.shy,
        bomb: BombHeuristics.hesitant
    }
};

Personalities.Psycho = {
    threatened: {
        move: MoveHeuristics.outgoing,
        bomb: BombHeuristics.pyro
    },
    walledIn: {
        move: MoveHeuristics.curious,
        bomb: BombHeuristics.spleunker
    },
    neutral: {
        move: MoveHeuristics.outgoing,
        bomb: BombHeuristics.pyro
    }
};



