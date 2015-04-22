// Move Heuristics: take in state, return move score
// gGameEngine already taken

var MoveHeuristics = {};

MoveHeuristics.lazy = function(state) {
    return 0;
};

MoveHeuristics.hysterical = function(state) {
    return Math.random();
};


// Bomb Heuristics: take in state, return should plant bomb
var BombHeuristics = {};

BombHeuristics.passive = function(state) {
    return false;
};

BombHeuristics.pyro = function(state) {
    return true;
};

