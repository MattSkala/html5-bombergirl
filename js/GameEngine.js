GameEngine = Class.extend({
    tileSize: 32,
    tilesX: 17,
    tilesY: 11,
    size: {},
    fps: 50,
    botsCount: 3, /* 0 - 3 */

    stage: null,
    player: null,
    bots: [],
    tiles: [],
    bombs: [],

    playerBoyImg: null,
    playerGirlImg: null,
    tilesImgs: {},
    bombImg: null,
    fireImg: null,

    playing: true,

    init: function() {
        this.size = {
            w: this.tileSize * this.tilesX,
            h: this.tileSize * this.tilesY
        };
    },

    load: function() {
        console.log("Launching HTML5 Bomberman!");

        // Init canvas
        this.stage = new createjs.Stage("canvas");

        // Load assets
        var queue = new createjs.LoadQueue();
        var that = this;
        queue.addEventListener("complete", function() {
            that.playerBoyImg = queue.getResult("playerBoy");
            that.playerGirlImg = queue.getResult("playerGirl");
            that.playerDeadImg = queue.getResult("playerDead");
            that.tilesImgs.grass = queue.getResult("tile_grass");
            that.tilesImgs.wall = queue.getResult("tile_wall");
            that.tilesImgs.wood = queue.getResult("tile_wood");
            that.bombImg = queue.getResult("bomb");
            that.fireImg = queue.getResult("fire");
            that.setup();
        });
        queue.loadManifest([
            {id: "playerBoy", src: "img/george.png"},
            {id: "playerGirl", src: "img/betty.png"},
            {id: "playerDead", src: "img/player_dead.png"},
            {id: "tile_grass", src: "img/tile_grass.png"},
            {id: "tile_wall", src: "img/tile_wall.png"},
            {id: "tile_wood", src: "img/tile_wood.png"},
            {id: "bomb", src: "img/bomb.png"},
            {id: "fire", src: "img/fire.png"}
        ]);
    },

    setup: function() {
        if (!gInputEngine.bindings.length) {
            gInputEngine.setup();
        }

        this.bombs = [];
        this.tiles = [];
        // Draw tiles
        for (var i = 0; i < this.tilesY; i++) {
            for (var j = 0; j < this.tilesX; j++) {
                if ((i == 0 || j == 0 || i == this.tilesY - 1 || j == this.tilesX - 1)
                    || (j % 2 == 0 && i % 2 == 0)) {
                    // Wall tiles
                    var tile = new Tile('wall', {x: j, y: i});
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else {
                    // Grass tiles
                    var tile = new Tile('grass', {x: j, y: i});
                    this.stage.addChild(tile.bmp);

                    // Wood tiles
                    if (!(i <= 2 && j <= 2)
                        && !(i >= this.tilesY - 3 && j >= this.tilesX - 3)
                        && !(i <= 2 && j >= this.tilesX - 3)
                        && !(i >= this.tilesY - 3 && j <= 2)) {
                        var wood = new Tile('wood', {x: j, y: i});
                        this.stage.addChild(wood.bmp);
                        this.tiles.push(wood);
                    }
                }
            }
        }

        this.spawnBots();

        // Draw player
        this.player = new Player({ x: 1, y: 1 });

        // Subscribe to bomb key
        gInputEngine.addListener('bomb', this.spawnBomb);

        // Start loop
        if (!createjs.Ticker.hasEventListener('tick')) {
            createjs.Ticker.addEventListener('tick', gGameEngine.update);
            createjs.Ticker.setFPS(this.fps);
        }

        this.playing = true;
    },

    update: function() {
        // Player
        gGameEngine.player.update();

        // Bots
        for (var i = 0; i < gGameEngine.bots.length; i++) {
            var bot = gGameEngine.bots[i];
            bot.update();
        }

        // Bombs
        for (var i = 0; i < gGameEngine.bombs.length; i++) {
            var bomb = gGameEngine.bombs[i];
            bomb.update();
        }

        // Stage
        gGameEngine.stage.update();
    },

    spawnBots: function() {
        this.bots = [];

        if (this.botsCount >= 1) {
            var bot = new Bot({ x: this.tilesX - 2, y: this.tilesY - 2 });
            this.bots.push(bot);
        }

        if (this.botsCount >= 2) {
            var bot2 = new Bot({ x: 1, y: this.tilesY - 2 });
            this.bots.push(bot2);
        }

        if (this.botsCount >= 3) {
            var bot3 = new Bot({ x: this.tilesX - 2, y: 1 });
            this.bots.push(bot3);
        }
    },

    spawnBomb: function() {
        if (gGameEngine.bombs.length < gGameEngine.player.bombsMax) {
            var bomb = new Bomb(gGameEngine.player.position, gGameEngine.player.bombStrength);
            gGameEngine.stage.addChild(bomb.bmp);
            gGameEngine.bombs.push(bomb);
        }
    },

    /**
     * Convert bitmap pixels position to entity on grid position
     */
    convertToEntityPosition: function(x, y) {
        var position = {};
        position.x = Math.round(x / gGameEngine.tileSize);
        position.y = Math.round(y /gGameEngine.tileSize);
        return position;
    },

    /**
     * Convert entity on grid position to bitmap pixels position
     */
    convertToBitmapPosition: function(x, y) {
        var position = {};
        position.x = x * gGameEngine.tileSize;
        position.y = y * gGameEngine.tileSize;
        return position;
    },

    /**
     * Checks whether two rectangles intersect.
     */
    intersectRect: function(a, b) {
        return (a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom);
    },

    /**
     * Returns tile at given position.
     */
    getTile: function(position) {
        for (var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            if (tile.position.x == position.x && tile.position.y == position.y) {
                return tile;
            }
        }
    },

    /**
     * Returns tile material at given position.
     */
    getTileMaterial: function(position) {
        var tile = this.getTile(position);
        return (tile) ? tile.material : 'grass' ;
    },

    gameOver: function(status) {
        if (!gGameEngine.playing) { return; }
        gGameEngine.playing = false;

        // Game over text
        var message = (status == 'win') ? "You Win! ;D" : "Game Over :(";
        var text = new createjs.Text(message, "35px Helvetica", "#ffffff");
        text.x = this.size.w / 2 - text.getMeasuredWidth() / 2;
        text.y = this.size.h / 2 - text.getMeasuredHeight() / 2;
        text.shadow = new createjs.Shadow("#000000", 5, 5, 10);
        text.textBaseline = "alphabetic";
        this.stage.addChild(text);

        // Play again button
        var btnTop = 50;
        var rectW = 130;
        var rectH = 35;
        var rectX = this.size.w / 2 - rectW / 2;
        var rectY = this.size.h / 2 - rectH / 2 + btnTop;
        var btnGraphics = new createjs.Graphics().beginFill("#ffffff").drawRect(rectX, rectY, rectW, rectH);
        var btn = new createjs.Shape(btnGraphics);
        btn.shadow = new createjs.Shadow("#000000", 5, 5, 10);
        this.stage.addChild(btn);

        var btnText = new createjs.Text("Play again", "16px Helvetica", "#000000");
        btnText.x = this.size.w / 2 - btnText.getMeasuredWidth() / 2;
        btnText.y = this.size.h / 2 - btnText.getMeasuredHeight() / 2 + btnTop;
        this.stage.addChild(btnText);
        this.stage.enableMouseOver();
        btn.addEventListener('mouseover', function() {
            btnGraphics.beginFill("#dddddd");
            btnGraphics.drawRect(rectX, rectY, rectW, rectH);
        });
        btn.addEventListener('mouseout', function() {
            btnGraphics.beginFill("#ffffff");
            btnGraphics.drawRect(rectX, rectY, rectW, rectH);
        });
        btn.addEventListener('mousedown', function() {
            btnGraphics.beginFill("#aaaaaa");
            btnGraphics.drawRect(rectX, rectY, rectW, rectH);
        });
        btn.addEventListener('click', function() {
            gGameEngine.restart();
        });

        gInputEngine.removeAllListeners();

        gInputEngine.addListener('restart', function() {
            gGameEngine.restart();
        });
    },

    restart: function() {
        gInputEngine.removeAllListeners();
        gGameEngine.stage.removeAllChildren();
        gGameEngine.setup();
    },

    removeFromArray: function(array, item) {
        for (var i = 0; i < array.length; i++) {
            if (item == array[i]) {
                array.splice(i, 1);
            }
        }
        return array;
    }
});

gGameEngine = new GameEngine();