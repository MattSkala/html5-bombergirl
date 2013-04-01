GameEngine = Class.extend({
    tileSize: 32,
    tilesX: 15,
    tilesY: 11,
    size: {},
    fps: 50,

    stage: null,
    player: null,
    tiles: [],
    bombs: [],

    playerImg: null,
    tilesImgs: {},
    bombImg: null,
    fireImg: null,

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
            that.playerImg = queue.getResult("player");
            that.playerDeadImg = queue.getResult("playerDead");
            that.tilesImgs.grass = queue.getResult("tile_grass");
            that.tilesImgs.wall = queue.getResult("tile_wall");
            that.tilesImgs.wood = queue.getResult("tile_wood");
            that.bombImg = queue.getResult("bomb");
            that.fireImg = queue.getResult("fire");
            that.setup();
        });
        queue.loadManifest([
            {id: "player", src: "img/player.png"},
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

        // Draw player
        this.player = new Player({ x: 1, y: 1 });
        this.stage.addChild(this.player.bmp);

        // Subscribe to bomb key
        gInputEngine.addListener('bomb', this.spawnBomb);

        // Start loop
        createjs.Ticker.addEventListener("tick", gGameEngine.update);
        createjs.Ticker.setFPS(this.fps);
    },

    update: function() {
        gGameEngine.player.update();
        for (var i = 0; i < gGameEngine.bombs.length; i++) {
            var bomb = gGameEngine.bombs[i];
            bomb.update();
        }

        gGameEngine.stage.update();
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
        position.x = Math.floor(x / gGameEngine.tileSize);
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

    gameOver: function() {
        // Game over text
        var text = new createjs.Text("Game Over :(", "35px Helvetica", "#ffffff");
        text.x = this.size.w / 2 - text.getMeasuredWidth() / 2;
        text.y = this.size.h / 2 - text.getMeasuredHeight() / 2;
        text.shadow = new createjs.Shadow("#000000", 5, 5, 10);
        text.textBaseline = "alphabetic";
        this.stage.addChild(text);

        // Try again button
        var btnTop = 50;
        var rectW = 130;
        var rectH = 35;
        var rectX = this.size.w / 2 - rectW / 2;
        var rectY = this.size.h / 2 - rectH / 2 + btnTop;
        var btnGraphics = new createjs.Graphics().beginFill("#ffffff").drawRect(rectX, rectY, rectW, rectH);
        var btn = new createjs.Shape(btnGraphics);
        this.stage.addChild(btn);

        var btnText = new createjs.Text("Play again", "16px Helvetica", "#000000");
        btnText.x = this.size.w / 2 - btnText.getMeasuredWidth() / 2;
        btnText.y = this.size.h / 2 - btnText.getMeasuredHeight() / 2 + btnTop;
        this.stage.addChild(btnText);

        btn.addEventListener('click', function() {
            gGameEngine.restart();
        });
    },

    restart: function() {
        this.stage.removeAllChildren();
        this.setup();
    }
});

gGameEngine = new GameEngine();