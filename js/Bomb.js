Bomb = Entity.extend({
    /**
     * Entity position on map grid
     */
    position: {},

    /**
     * Bitmap dimensions
     */
    size: {
        w: 19,
        h: 19
    },

    /**
     * Bitmap animation
     */
    bmp: null,

    /**
     * Timer in frames
     */
    timer: 0,

    /**
     * Max timer value in seconds
     */
    timerMax: 3,

    exploded: false,

    init: function(position) {
        var spriteSheet = new createjs.SpriteSheet({
            images: [gGameEngine.bombImg],
            frames: { width: this.size.w, height: this.size.h, regX: 0, regY: 0 },
            animations: {
                idle: [0, 2, 'idle'],
            }
        });
        this.bmp = new createjs.BitmapAnimation(spriteSheet);
        this.bmp.gotoAndPlay('idle');

        this.position = position;

        var pixels = gGameEngine.convertToBitmapPosition(position.x, position.y);
        this.bmp.x = pixels.x + this.size.w / 4;
        this.bmp.y = pixels.y + this.size.h / 4;
    },

    update: function() {
        if (this.exploded) { return; }

        this.timer++;
        if (this.timer > this.timerMax * gGameEngine.fps) {
            this.explode();
        }
    },

    explode: function() {
        this.exploded = true;

        // Burn all wood around!
        var tiles = gGameEngine.tiles;
        console.log('Explded: ' + this.position.x + ":" + this.position.y);
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            if (tile.material == 'wood'
                && ((tile.position.x == this.position.x - 1 && tile.position.y == this.position.y)
                    || (tile.position.x == this.position.x + 1 && tile.position.y == this.position.y)
                    || (tile.position.x == this.position.x && tile.position.y == this.position.y - 1)
                    || (tile.position.x == this.position.x && tile.position.y == this.position.y + 1) )) {
                tile.remove();
            }
        }

        this.remove();
    },

    remove: function() {
        gGameEngine.stage.removeChild(this.bmp);
        for (var i = 0; i < gGameEngine.bombs.length; i++) {
            var bomb = gGameEngine.bombs[i];
            if (this == bomb) {
                gGameEngine.bombs.splice(i, 1);
            }
        }
    }
});