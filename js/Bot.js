Bot = Player.extend({
    /**
     * Current direction
     */
    direction: 'up',

    /**
     * Directions that are not allowed to go because of collision
     */
    rejectDirections: [],

    /**
     * Current X axis direction
     */
    dirX: 0,

    /**
     * Current Y axis direction
     */
    dirY: -1,

    update: function() {
         if (!this.alive) {
            return;
        }
        var position = { x: this.bmp.x, y: this.bmp.y };

        this.move();

        if (this.detectFireCollision()) {
            // We have to die
            this.die();
        }
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
            this.rejectDirections = [];
            this.bmp.x = position.x;
            this.bmp.y = position.y;
            this.updatePosition();
        }
    },

    changeDirection: function() {
        var min = 1;
        var max = 4;
        var rand = Math.floor(Math.random() * (max - min + 1)) + min;

        if (rand == 1 && this.rejectDirections.indexOf('up') === -1) {
            this.dirY = -1;
            this.dirX = 0;
            this.direction = 'up';
        } else if (rand == 2 && this.rejectDirections.indexOf('right') === -1) {
            this.dirY = 0;
            this.dirX = 1;
            this.direction = 'right';
        } else if (rand == 3 && this.rejectDirections.indexOf('bottom') === -1) {
            this.dirY = 1;
            this.dirX = 0;
            this.direction = 'bottom';
        } else if (rand == 4 && this.rejectDirections.indexOf('left') === -1) {
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