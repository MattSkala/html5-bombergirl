Player = Entity.extend({
    /**
     * Moving speed in pixels per frame
     */
    velocity: 2,

    /**
     * Max number of bombs user can spawn
     */
    bombsMax: 10,

    /**
     * How far the fire reaches when bomb explodes
     */
    bombStrength: 1,

    /**
     * Entity position on map grid
     */
    position: {},

    /**
     * Bitmap dimensions
     */
    size: {
        w: 27,
        h: 40
    },

    /**
     * Bitmap animation
     */
    bmp: null,

    init: function(position) {
        var spriteSheet = new createjs.SpriteSheet({
            images: [gGameEngine.playerImg],
            frames: { width: this.size.w, height: this.size.h, regX: 14, regY: 7 },
            animations: {
                idle: [0, 0, 'idle'],
                down: [0, 3, 'down', 10],
                left: [4, 7, 'left', 10],
                up: [8, 11, 'up', 10],
                right: [12, 15, 'right', 10]
            }
        });
        this.bmp = new createjs.BitmapAnimation(spriteSheet);

        this.position = position;
        var pixels = gGameEngine.convertToBitmapPosition(position.x, position.y);
        this.bmp.x = pixels.x + this.size.w / 2;
        this.bmp.y = pixels.y + this.size.h / 2;
    },

    update: function() {
        var position = { x: this.bmp.x, y: this.bmp.y };

        if (gInputEngine.actions['up']
            && this.bmp.y > gGameEngine.tileSize * 1.1) {
            this.animate('up');
            position.y -= this.velocity;
        } else if (gInputEngine.actions['down']
            && this.bmp.y < gGameEngine.size.h - 2 * gGameEngine.tileSize) {
            this.animate('down');
            position.y += this.velocity;
        } else if (gInputEngine.actions['left']
            && this.bmp.x > gGameEngine.tileSize + this.size.w / 2) {
            this.animate('left');
            position.x -= this.velocity;
        } else if (gInputEngine.actions['right']
            && this.bmp.x < gGameEngine.size.w - gGameEngine.tileSize - this.size.w / 2) {
            this.animate('right');
            position.x += this.velocity;
        } else {
            this.animate('idle');
        }

        if (position.x != this.bmp.x || position.y != this.bmp.y) {
            if (this.handleCollision(position)) {
                this.bmp.x = position.x;
                this.bmp.y = position.y;
                this.updatePosition();
            }
        }
    },

    /**
     * Calculates and updates entity position according to its actual bitmap position
     */
    updatePosition: function() {
        this.position = gGameEngine.convertToEntityPosition(this.bmp.x, this.bmp.y);
    },

    /**
     * Returns false when collision is detected and we should not move to target position.
     */
    handleCollision: function(position) {
        var player = {};
        player.left = position.x;
        player.top = position.y;
        player.right = player.left + this.size.w * 0.40;
        player.bottom = player.top + this.size.h * 0.7;

        // Check possible collision with all wall and wood tiles
        var tiles = gGameEngine.tiles;
        for (var i = 0; i < tiles.length; i++) {
            var tilePosition = tiles[i].position;

            var tile = {};
            tile.left = tilePosition.x * gGameEngine.tileSize;
            tile.top = tilePosition.y * gGameEngine.tileSize;
            tile.right = tile.left + gGameEngine.tileSize + 10;
            tile.bottom = tile.top + gGameEngine.tileSize - 5;

            if (gGameEngine.intersectRect(player, tile)) {
                return false;
            }
        }
        return true;
    },

    /**
     * Changes animation if requested animation is not already current.
     */
    animate: function(animation) {
        if (!this.bmp.currentAnimation || this.bmp.currentAnimation.indexOf(animation) === -1) {
            this.bmp.gotoAndPlay(animation);
        }
    }
});