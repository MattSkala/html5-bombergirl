// Move Heuristics: take in state, return move score
// gGameEngine already taken

var MoveHeuristics = {};

MoveHeuristics.lazy = function(state) {
    return 0;
};

MoveHeuristics.hysterical = function(state) {
    return Math.random();
};

MoveHeuristics.shy = function(state) {
    var value = 0;
    var others = state.getOthers();
    var me = state.getMe();
    var othersDist = [];
    for (var i = others.length -1; i>=0 ; i--) {
        othersDist.push(Utils.manhattanDistance(me.position,others[i].position));
    }
    var arrayMax = Function.prototype.apply.bind(Math.max, null);
    var max= arrayMax(othersDist);
    max = 1.0/max;
    value += max;
    return value;
};

MoveHeuristics.outgoing = function(state) {
    var value = 0;
    var others = state.getOthers();
    var me = state.getMe();
    var othersDist =[];
    for (var i = others.length - 1; i>=0 ; i--) {
        othersDist.push(Utils.manhattanDistance(me.position,others[i].position));
    }
    var arrayMin = Function.prototype.apply.bind(Math.min, null);
    var min = arrayMin(othersDist);
    min = 1.0/min;
    value += min;
    return value;
};

MoveHeuristics.cautious = function(state) {
    console.log(state);
    var me = state.getMe();
    console.log(me);
    if (state.isSafe(me.position)) {
        return 1;
    }
    return 0;
}

// Bomb Heuristics: take in state, return should plant bomb
var BombHeuristics = {};

BombHeuristics.passive = function(state) {
    return false;
};

BombHeuristics.pyro = function(state) {
    return true;
};

BombHeuristics.aggressive = function(state) {
    console.log("feojnsdfnsdfdfkls;ofgwjlr");
    var others = state.getOthers();
    for (var i = others.length - 1; i >= 0; i--) {
        var path = state.getPathTo(others[i]);
        if (path && path.length < 5)
            return true;
    };
    return false;
};

BombHeuristics.spleunker = function(state) {
    var me = state.getMe();
    return state.getNearWood(me.position);
};

