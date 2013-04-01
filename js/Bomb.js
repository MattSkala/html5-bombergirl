Bomb = Entity.extend({
    /**
     * Entity position on map grid
     */
    position: {},

    /**
     * How far the fire reaches when bomb explodes
     */
    strength: 1,

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
    timerMax: 1,

    exploded: false,

    init: function(position, strength) {
        this.strength = strength;

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

        // Fire in all directions!
        this.fire(this.position);
        for (var i = 0; i < 4; i++) {
            var dirX;
            var dirY;
            if (i == 0) { dirX = 1; dirY = 0; }
            else if (i == 1) { dirX = -1; dirY = 0; }
            else if (i == 2) { dirX = 0; dirY = 1; }
            else if (i == 3) { dirX = 0; dirY = -1; }

            for (var j = 1; j <= this.strength; j++) {
                var explode = true;
                var last = false;

                var position = { x: this.position.x + j * dirX, y: this.position.y + j * dirY };
                var material = gGameEngine.getTileMaterial(position);
                if (material == 'wall') { // One can not simply burn the wall
                    explode = false;
                    last = true;
                } else if (material == 'wood') {
                    explode = true;
                    last = true;
                }

                if (explode) {
                    this.fire(position);
                }
                if (last) {
                    break;
                }
            }
        }

        // Cache tiles
        var tiles = [];
        for (var i = 0; i < gGameEngine.tiles.length; i++) {
            var tile = gGameEngine.tiles[i];
            tiles.push(tile);
        }

        // Burn all wood around!
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

    fire: function(position) {
        var fireSpriteSheet = new createjs.SpriteSheet({
            images: [gGameEngine.fireImg],
            frames: { width: 33, height: 38, regX: 0, regY: 0 },
            animations: {
                idle: [0, 11, null, 5],
            }
        });
        var fire = new createjs.BitmapAnimation(fireSpriteSheet);
        fire.gotoAndPlay('idle');
        var pixels = gGameEngine.convertToBitmapPosition(position.x, position.y);
        fire.x = pixels.x + 2;
        fire.y = pixels.y - 5;
        gGameEngine.stage.addChild(fire);
        fire.addEventListener('animationend', function() {
            gGameEngine.stage.removeChild(fire);
        });
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