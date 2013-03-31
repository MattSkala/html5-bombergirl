Bomb = Entity.extend({
    /*
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

    init: function() {
        var spriteSheet = new createjs.SpriteSheet({
            images: [gGameEngine.bombImg],
            frames: { width: this.size.w, height: this.size.h, regX: 0, regY: 0 },
            animations: {
                idle: [0, 2, 'idle'],
            }
        });
        this.bmp = new createjs.BitmapAnimation(spriteSheet);
        this.bmp.gotoAndPlay('idle');
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
        gGameEngine.removeBomb(this);
    }
});