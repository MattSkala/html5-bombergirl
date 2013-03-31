Player = Class.extend({
    animation: null,

    init: function(img) {
        var spriteSheet = new createjs.SpriteSheet({
            images: [img],
            frames: { width: 27, height: 40, regX: 14, regY: 7 },
            animations: {
                down: [0, 3, "down", 4],
                left: [4, 7, "left", 4],
                top: [8, 11, "top", 4],
                right: [12, 15, "right", 4]
            }
        });
        this.animation = new createjs.BitmapAnimation(spriteSheet);
        this.animation.gotoAndPlay("down");
    },

    update: function() {
    }

});