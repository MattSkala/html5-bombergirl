Agent = Bot.extend({

    personality: {
        threatened: {
            move: MoveHeuristics.lazy,
            bomb: BombHeuristics.passive
        },
        walledIn: {
            move: MoveHeuristics.lazy,
            bomb: BombHeuristics.passive
        },
        neutral: {
            move: MoveHeuristics.lazy,
            bomb: BombHeuristics.passive
        }
    },

    pickMove: function(heuristic) {
        var actions = this.getPossibleActions(); // REPLACE WITH AN CODE
        // console.log(actions);
        var maxMove = "idle"; 
        var maxScore = heuristic("idle");
        for (var i = actions.length - 1; i >= 0; i--) {
            var act = actions[i];
            var score = heuristic(act);
            if (score >= maxScore) {
                maxScore = score;
                maxMove = act;
            } 
        };
        return maxMove;
    },

    pickBomb: function(heuristic) {
        console.log(heuristic);
        return heuristic();
    },

    update: function() {
         if (!this.alive) {
            this.fade();
            return;
        }

        var position = { x: this.bmp.x, y: this.bmp.y };

        // AI
        var currBehavior = this.decideBehavior();
        console.log("here");
        console.log(this.personality);

        // BOMB
        if (this.pickBomb(currBehavior.bomb)) {
            this.plantBomb();
        }

        // MOVEMENT
        var move = this.pickMove(currBehavior.move);

        var dirX = 0;
        var dirY = 0;
        if (move === 'up') {
            this.animate('up');
            position.y -= this.velocity;
            dirY = -1;
        } else if (move === 'down') {
            this.animate('down');
            position.y += this.velocity;
            dirY = 1;
        } else if (move === 'left') {
            this.animate('left');
            position.x -= this.velocity;
            dirX = -1;
        } else if (move === 'right') {
            this.animate('right');
            position.x += this.velocity;
            dirX = 1;
        } else {
            this.animate('idle');
        }

        if (position.x != this.bmp.x || position.y != this.bmp.y) {
            if (!this.detectBombCollision(position)) {
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
        if (!this.isSafe(this)) {
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
        return false;
    }

});