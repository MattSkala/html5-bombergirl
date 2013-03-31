Player = Entity.extend({
    /**
     * Moving speed in pixels per frame
     */
    velocity: 2,

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

    hit: 13,

    /**
     * Max number of bombs user can spawn
     */
    bombsMax: 1,

    init: function() {
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
            }
        }
    },

    /**
     * Returns false when collision is detected and we should not move to target position.
     */
    handleCollision: function(position) {
        var pX = position.x + this.size.w/2;
        var pY = position.y + this.size.h/2;

        // Check possible collision with all wall and wood tiles
        var tiles = gGameEngine.tiles;
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            // early returns speed it up
            var tHit = 10;
            var tX = tile.x + gGameEngine.tileSize * 0.9;
            var tY = tile.y + gGameEngine.tileSize * 0.5;
            if (tX - tHit > pX + this.hit) { continue; }
            if (tX + tHit < pX - this.hit) { continue; }
            if (tY - tHit > pY + this.hit) { continue; }
            if (tY + tHit < pY - this.hit) { continue; }

            // now do the circle distance test
            var dist = Math.sqrt(Math.pow(Math.abs(pX - tX), 2) + Math.pow(Math.abs(pY - tY), 2));
            if (this.hit + tHit > dist) {
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