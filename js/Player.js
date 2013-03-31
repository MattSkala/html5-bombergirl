Player = Class.extend({
    velocity: 5,
    size: {
        w: 27,
        h: 40
    },
    bmp: null,

    init: function(img) {
        var spriteSheet = new createjs.SpriteSheet({
            images: [img],
            frames: { width: this.size.w, height: this.size.h, regX: 14, regY: 7 },
            animations: {
                idle: [0, 0, 'idle'],
                down: [0, 3, 'down', 4],
                left: [4, 7, 'left', 4],
                up: [8, 11, 'up', 4],
                right: [12, 15, 'right', 4]
            }
        });
        this.bmp = new createjs.BitmapAnimation(spriteSheet);
        this.bmp.gotoAndPlay('idle');
    },

    update: function() {
        var tileSize = gGameEngine.tileSize;
        var mapHeight = gGameEngine.tilesY * tileSize;
        var mapWidth = gGameEngine.tilesX * tileSize;
        if (gInputEngine.actions['up']&& this.bmp.y > tileSize * 1.1) {
            this.animate('up');
            this.bmp.y -= this.velocity;
        } else if (gInputEngine.actions['down'] && this.bmp.y < mapHeight - 2 * tileSize) {
            this.animate('down');
            this.bmp.y += this.velocity;
        } else if (gInputEngine.actions['left'] && this.bmp.x > tileSize + this.size.w / 2) {
            this.animate('left');
            this.bmp.x -= this.velocity;
        } else if (gInputEngine.actions['right'] && this.bmp.x < mapWidth - tileSize - this.size.w / 2) {
            this.animate('right');
            this.bmp.x += this.velocity;
        } else {
            this.animate('idle');
        }
    },

    /**
     * Changes animation if not already current.
     */
    animate: function(animation) {
        if (this.bmp.currentAnimation.indexOf(animation) === -1) {
            this.bmp.gotoAndPlay(animation);
        }
    }
});