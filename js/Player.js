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
        w: 48,
        h: 48
    },

    /**
     * Bitmap animation
     */
    bmp: null,

    alive: true,

    init: function(position) {
        var img = this instanceof Bot ? gGameEngine.playerGirlImg : gGameEngine.playerBoyImg;
        var spriteSheet = new createjs.SpriteSheet({
            images: [img],
            frames: { width: this.size.w, height: this.size.h, regX: 12, regY: 12 },
            animations: {
                idle: [0, 0, 'idle'],
                down: [0, 3, 'down', 10],
                left: [4, 7, 'left', 10],
                up: [8, 11, 'up', 10],
                right: [12, 15, 'right', 10],
                dead: [0, 0, 'dead', 10]
            }
        });
        this.bmp = new createjs.BitmapAnimation(spriteSheet);

        this.position = position;
        var pixels = gGameEngine.convertToBitmapPosition(position.x, position.y);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;

        gGameEngine.stage.addChild(this.bmp);
    },

    update: function() {
        if (!gGameEngine.playing || !this.alive) {
            return;
        }
        var position = { x: this.bmp.x, y: this.bmp.y };

        if (gInputEngine.actions['up']) {
            this.animate('up');
            position.y -= this.velocity;
        } else if (gInputEngine.actions['down']) {
            this.animate('down');
            position.y += this.velocity;
        } else if (gInputEngine.actions['left']) {
            this.animate('left');
            position.x -= this.velocity;
        } else if (gInputEngine.actions['right']) {
            this.animate('right');
            position.x += this.velocity;
        } else {
            this.animate('idle');
        }

        if (position.x != this.bmp.x || position.y != this.bmp.y) {
            if (!this.detectWallCollision(position)) {
                this.bmp.x = position.x;
                this.bmp.y = position.y;
                this.updatePosition();
            }
        }

        if (this.detectFireCollision()) {
            // We have to die
            this.die();
            gGameEngine.gameOver('lose');
        }
    },

    /**
     * Calculates and updates entity position according to its actual bitmap position
     */
    updatePosition: function() {
        this.position = gGameEngine.convertToEntityPosition(this.bmp.x, this.bmp.y);
    },

    /**
     * Returns true when collision is detected and we should not move to target position.
     */
    detectWallCollision: function(position) {
        var player = {};
        player.left = position.x;
        player.top = position.y;
        player.right = player.left + this.size.w;
        player.bottom = player.top + this.size.h;

        // Check possible collision with all wall and wood tiles
        var tiles = gGameEngine.tiles;
        for (var i = 0; i < tiles.length; i++) {
            var tilePosition = tiles[i].position;

            var tile = {};
            tile.left = tilePosition.x * gGameEngine.tileSize + 25;
            tile.top = tilePosition.y * gGameEngine.tileSize + 20;
            tile.right = tile.left + gGameEngine.tileSize - 30;
            tile.bottom = tile.top + gGameEngine.tileSize - 30;

            if(gGameEngine.intersectRect(player, tile)) {
                return true;
            }
        }
        return false;
    },

    detectFireCollision: function() {
        var bombs = gGameEngine.bombs;
        for (var i = 0; i < bombs.length; i++) {
            var bomb = bombs[i];
            for (var j = 0; j < bomb.fires.length; j++) {
                var fire = bomb.fires[j];
                if (bomb.exploded && fire.position.x == this.position.x && fire.position.y == this.position.y) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Changes animation if requested animation is not already current.
     */
    animate: function(animation) {
        if (!this.bmp.currentAnimation || this.bmp.currentAnimation.indexOf(animation) === -1) {
            this.bmp.gotoAndPlay(animation);
        }
    },

    die: function() {
        this.alive = false;

        gGameEngine.stage.removeChild(this.bmp);
        /*
        var posX = this.bmp.x;
        var posY = this.bmp.y;
        var spriteSheet = new createjs.SpriteSheet({
            images: [gGameEngine.playerDeadImg],
            frames: { width: 36, height: 33, regX: 0, regY: 0 },
            animations: {
                die: [0, 6, null, 10],
                dead: [7]
            }
        });
        this.bmp = new createjs.BitmapAnimation(spriteSheet);

        this.bmp.x = posX;
        this.bmp.y = posY;
        gGameEngine.stage.addChild(this.bmp);
        this.bmp.gotoAndPlay('dead');
        var bmp = this.bmp;
        this.bmp.addEventListener('animationend', function() {
            bmp.stop();
        });

        // Allow player walking on dead bodies
        gGameEngine.stage.setChildIndex(gGameEngine.player.bmp, gGameEngine.stage.getNumChildren() - 1);
        */
    }
});