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

        // Show fire
        var fireSpriteSheet = new createjs.SpriteSheet({
            images: [gGameEngine.fireImg],
            frames: { width: 33, height: 38, regX: 0, regY: 0 },
            animations: {
                idle: [0, 11, null, 5],
            }
        });
        var fire = new createjs.BitmapAnimation(fireSpriteSheet);
        fire.gotoAndPlay('idle');
        var pixels = gGameEngine.convertToBitmapPosition(this.position.x, this.position.y);
        fire.x = pixels.x + 2;
        fire.y = pixels.y - 5;
        gGameEngine.stage.addChild(fire);
        fire.addEventListener('animationend', function() {
            gGameEngine.stage.removeChild(fire);
        });


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