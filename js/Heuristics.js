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
        // console.log(wood[i]);
        othersDist.push(Utils.manhattanDistance(me.position,wood[i]));
    }
    var arrayMin = Function.prototype.apply.bind(Math.min, null);
    var min = arrayMin(othersDist);
    min = 1.0/min;
    value += min;
    // console.log(value);
    return value;
};

MoveHeuristics.cautious = function(state) {
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
    else {
        console.log(state);
        // debugger;
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
        bomb: BombHeuristics.aggressive
    }
};

