GameEngine = Class.extend({
    tileSize: 32,
    tilesX: 19,
    tilesY: 13,
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
            that.tilesImgs.grass = queue.getResult("tile_grass");
            that.tilesImgs.wall = queue.getResult("tile_wall");
            that.tilesImgs.wood = queue.getResult("tile_wood");
            that.bombImg = queue.getResult("bomb");
            that.fireImg = queue.getResult("fire");
            that.setup();
        });
        queue.loadManifest([
            {id: "player", src: "img/player.png"},
            {id: "tile_grass", src: "img/tile_grass.png"},
            {id: "tile_wall", src: "img/tile_wall.png"},
            {id: "tile_wood", src: "img/tile_wood.png"},
            {id: "bomb", src: "img/bomb.png"},
            {id: "fire", src: "img/fire.png"}
        ]);
    },

    setup: function() {
        gInputEngine.setup();

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
            var bomb = new Bomb(gGameEngine.player.position);
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
    }
});

gGameEngine = new GameEngine();