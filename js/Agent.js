Agent = Bot.extend({

    personality: {
        threatened: {
            move: MoveHeuristics.lazy,
            bomb: BombHeuristics.passive
        },
        walledIn: {
            move: MoveHeuristics.lazy,
            bomb: BombHeuristics.spleunker
        },
        neutral: {
            move: MoveHeuristics.lazy,
            bomb: BombHeuristics.spleunker
        }
    },

    facing: "idle",

    pickMove: function(heuristic) {
        // var actions = this.getPossibleActions(); // REPLACE WITH AN CODE
        // console.log("start");
        var maxMove = "idle"; 
        var gs = gGameEngine.getCurrentGameState(this.id);
        var actions = gs.getPossibleActionsForBot(this.id);
        var maxScore = heuristic(gs.generateSuccessor(this.id, "idle"));
        // console.log("start");
        for (var i = actions.length - 1; i >= 0; i--) {
            var act = actions[i];
            var score = heuristic(gs.generateSuccessor(this.id, act));
            if (score >= maxScore) {
                maxScore = score;
                maxMove = act;
            } 
        };
        return maxMove;
    },

    pickBomb: function(heuristic) {
        return heuristic(gGameEngine.getCurrentGameState(this.id));
    },

    update: function() {
         if (!this.alive) {
            this.fade();
            return;
        }

        var position = { x: this.bmp.x, y: this.bmp.y };
        var pos2 = { x: this.bmp.x, y: this.bmp.y };

        // AI
        var currBehavior = this.decideBehavior();

        // console.log(gGameEngine.getCurrentGameState(this.id));
        var move = "idle";
        var didBomb = false;
        // BOMB
        if (this.pickBomb(currBehavior.bomb)) {
            didBomb = this.plantBomb();
        }
        // MOVEMENT
        if (!didBomb)
            move = this.pickMove(currBehavior.move);

        var dirX = 0;
        var dirY = 0;
        if (move === 'up') {
            this.animate('up');
            position.y -= this.velocity;
            dirY = -1;
            facing = "up";
        } else if (move === 'down') {
            this.animate('down');
            position.y += this.velocity;
            dirY = 1;
            facing = "down";
        } else if (move === 'left') {
            this.animate('left');
            position.x -= this.velocity;
            dirX = -1;
            facing = "left";
        } else if (move === 'right') {
            this.animate('right');
            position.x += this.velocity;
            dirX = 1;
            facing = "right";
        } else {
            this.animate('idle');
            facing = "idle";
        }

        if (position.x != this.bmp.x || position.y != this.bmp.y) {
            if (!this.detectBombCollision(position) || this.detectBombCollision(pos2)) {
                if (this.detectWallCollision(position)) {
                    // If we are on the corner, move to the aisle
                    var cornerFix = this.getCornerFix(dirX, dirY);
                    if (cornerFix) {
                        var fixX = 0;
                        var fixY = 0;
                        if (dirX) {
                            fixY = (cornerFix.y - this.bmp.y) > 0 ? 1 : -1;
                        } else {
                            fixX = (cornerFix.x - this.bmp.x) > 0 ? 1 : -1;
                        }
                        this.bmp.x += fixX * this.velocity;
                        this.bmp.y += fixY * this.velocity;
                        this.updatePosition();
                    }
                } else {
                    this.bmp.x = position.x;
                    this.bmp.y = position.y;
                    this.updatePosition();
                }
            }
        }

        // DEATH
        if (this.detectFireCollision()) {
            // Bot has to die
            this.die();
        }

    },

    decideBehavior: function() {
        // Threatened
        if (!this.isSafe(this.position)) {
            return this.personality.threatened;
        }
        // Walled In
        if (this.isWalledIn()) {
            return this.personality.walledIn;
        }
        // Neutral
        return this.personality.neutral;
    },

    isWalledIn: function() {
        var gs = gGameEngine.getCurrentGameState(this.id);
        for (var i = gs.getOthers().length - 1; i >= 0; i--) {
            var bot = gs.getOthers()[i];
            var path = gs.getPathTo(bot);
            if (path) {
                return false;
            }
        }
        return true;
    }

});