Bot = Player.extend({
    /**
     * Current direction
     */
    direction: 'up',

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
    targetPosition: {},
    targetBitmapPosition: {},

    update: function() {
         if (!this.alive) {
            return;
        }

        if (!this.targetPosition.x) {
            this.findTargetPosition();
        }

        if (Math.abs(this.targetBitmapPosition.x - this.bmp.x) == 0
            && Math.abs(this.targetBitmapPosition.y - this.bmp.y) == 0) {
            this.findTargetPosition();
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

        // Change direction when there would be collision
        if (gGameEngine.getTileMaterial(target) != 'grass') {
            this.excludeDirections.push(this.action);
            this.changeDirection();
            this.findTargetPosition();
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

    move: function() {
        this.animate(this.direction);

        var position = { x: this.bmp.x, y: this.bmp.y };
        position.x += this.velocity * this.dirX;
        position.y += this.velocity * this.dirY;

        if (this.detectWallCollision(position)) {
            this.rejectDirections.push(this.direction);
            // Change direction
            this.changeDirection();
        } else {
            // Update position
            this.excludeDirections = [];
            this.bmp.x = position.x;
            this.bmp.y = position.y;
            this.updatePosition();
        }
    },

    changeDirection: function() {
        var min = 1;
        var max = 4;
        var rand = Math.floor(Math.random() * (max - min + 1)) + min;

        if (rand == 1 && this.excludeDirections.indexOf('up') === -1) {
            this.dirY = -1;
            this.dirX = 0;
            this.direction = 'up';
        } else if (rand == 2 && this.excludeDirections.indexOf('right') === -1) {
            this.dirY = 0;
            this.dirX = 1;
            this.direction = 'right';
        } else if (rand == 3 && this.excludeDirections.indexOf('down') === -1) {
            this.dirY = 1;
            this.dirX = 0;
            this.direction = 'down';
        } else if (rand == 4 && this.excludeDirections.indexOf('left') === -1) {
            this.dirY = 0;
            this.dirX = -1;
            this.direction = 'left';
        }
    },

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
    }
});