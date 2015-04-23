// Move Heuristics: take in state, return move score
// gGameEngine already taken

var MoveHeuristics = {};

MoveHeuristics.lazy = function(state) {
    return 0;
};

MoveHeuristics.hysterical = function(state) {
    return Math.random();
};

MoveHeuristics.cautious = function(state) {
    if (state.getMe().isSafe(state.getMe().position)) {
        return 1;
    }
    console.log("unsafe");
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
    return me.getNearWood();
};

