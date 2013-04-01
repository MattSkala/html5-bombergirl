Bot = Player.extend({
    /**
     * Current direction
     */
    direction: 'up',
    lastDirection: '',

    /**
     * Directions that are not allowed to go because of collision
     */
    excludeDirections: [],

    /**
     * Current X axis direction
     */
    dirX: 0,

    /**
     * Current Y axis direction
     */
    dirY: -1,

    /**
     * Target position on map we are heading to
     */
    previousPosition: {},
    targetPosition: {},
    targetBitmapPosition: {},

    bombs: [],
    bombsMax: 1,

    wait: false,

    init: function(position) {
        this._super(position);
        this.findTargetPosition();
        this.bombs = [];
    },

    update: function() {
         if (!this.alive || this.wait) {
            return;
        }

        if (this.targetBitmapPosition.x == this.bmp.x && this.targetBitmapPosition.y == this.bmp.y) {
            // If we bumped into the wood, burn it!
            var wood = this.getNearWood();
            if (wood) {
                this.plantBomb();
            }
            this.findTargetPosition();
            this.moveToTargetPosition();
        } else {
            this.moveToTargetPosition();
        }

        if (this.detectFireCollision()) {
            // Bot has to die
            this.die();
        }
    },

    /**
     * Finds the next tile position where we should move.
     */
    findTargetPosition: function() {
        var target = { x: this.position.x, y: this.position.y };
        target.x += this.dirX;
        target.y += this.dirY;

        // Change direction when we can not go straight anymore
        if (gGameEngine.getTileMaterial(target) != 'grass') {
            var targets = this.getPossibleTargets();
            // Do not go the same way if possible
            if (targets.length > 1) {
                var previousPosition = this.getPreviousPosition();
                for (var i = 0; i < targets.length; i++) {
                    var item = targets[i];
                    if (item.x == previousPosition.x && item.y == previousPosition.y) {
                        targets.splice(i, 1);
                    }
                }
            }
            this.targetPosition = this.getRandomTarget(targets);
            this.loadTargetPosition(this.targetPosition);
            this.targetBitmapPosition = gGameEngine.convertToBitmapPosition(this.targetPosition.x, this.targetPosition.y);
        } else {
            this.excludeDirections = [];
            this.targetPosition = target;
            this.targetBitmapPosition = gGameEngine.convertToBitmapPosition(target.x, target.y);
        }
    },

    /**
     * Moves a step forward to target position.
     */
    moveToTargetPosition: function() {
        this.animate(this.direction);

        this.bmp.x += this.dirX * this.velocity;
        this.bmp.y += this.dirY * this.velocity;

        this.updatePosition();
    },

    /**
     * Returns near grass tiles.
     */
    getPossibleTargets: function() {
        var targets = [];
        for (var i = 0; i < 4; i++) {
            var dirX;
            var dirY;
            if (i == 0) { dirX = 1; dirY = 0; }
            else if (i == 1) { dirX = -1; dirY = 0; }
            else if (i == 2) { dirX = 0; dirY = 1; }
            else if (i == 3) { dirX = 0; dirY = -1; }

            var position = { x: this.position.x + dirX, y: this.position.y + dirY };
            if (gGameEngine.getTileMaterial(position) == 'grass') {
                targets.push(position);
            }
        }
        return targets;
    },

    /**
     * Loads vectors and animation name for target position.
     */
    loadTargetPosition: function(position) {
        this.dirX = position.x - this.position.x;
        this.dirY = position.y - this.position.y;
        if (this.dirX == 1 && this.dirY == 0) {
            this.direction = 'right';
        } else if (this.dirX == -1 && this.dirY == 0) {
            this.direction = 'left';
        } else if (this.dirX == 0 && this.dirY == 1) {
            this.direction = 'down';
        } else if (this.dirX == 0 && this.dirY == -1) {
            this.direction = 'up';
        }
    },

    /**
     * Gets previous position by current position and direction vector.
     */
    getPreviousPosition: function() {
        var previous = { x: this.targetPosition.x, y: this.targetPosition.y };
        //console.log(previous);
        previous.x -= this.dirX;
        previous.y -= this.dirY;
        console.log(previous);
        return previous;
    },

    /**
     * Returns random item from array.
     */
    getRandomTarget: function(targets) {
        return targets[Math.floor(Math.random() * targets.length)];
    },

    /**
     * Game is over when no bots left.
     */
    die: function() {
        this._super();
        var anyoneAlive = false;
        for (var i = 0; i < gGameEngine.bots.length; i++) {
            var bot = gGameEngine.bots[i];
            // Remove bot
            if (bot == this) {
                gGameEngine.bots.splice(i, 1);
            }
            if (bot.alive) {
                anyoneAlive = true;
            }
        }
        if (!anyoneAlive) {
            gGameEngine.gameOver('win');
        }
    },

    /**
     * Checks whether there is any wood around
     */
    getNearWood: function() {
        for (var i = 0; i < 4; i++) {
            var dirX;
            var dirY;
            if (i == 0) { dirX = 1; dirY = 0; }
            else if (i == 1) { dirX = -1; dirY = 0; }
            else if (i == 2) { dirX = 0; dirY = 1; }
            else if (i == 3) { dirX = 0; dirY = -1; }

            var position = { x: this.position.x + dirX, y: this.position.y + dirY };
            if (gGameEngine.getTileMaterial(position) == 'wood') {
                return gGameEngine.getTile(position);
            }
        }
    },

    /**
     * Places the bomb in current position
     */
    plantBomb: function() {
        if (this.bombs.length < this.bombsMax) {
            var bomb = new Bomb(this.position, this.bombStrength);
            gGameEngine.stage.addChild(bomb.bmp);
            this.bombs.push(bomb);
            gGameEngine.bombs.push(bomb);
            var that = this;

            // Change direction
            //this.changeDirection();

            bomb.setExplodeListener(function() {
                gGameEngine.removeFromArray(that.bombs, bomb);
                that.wait = false;
            });
        }
    }
});