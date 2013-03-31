GameEngine = Class.extend({
    stage: null,

    playerImg: null,
    tilesImgs: {},

    init: function() {
    },

    load: function() {
        console.log("Launching HTML5 Bomberman!");

        this.stage = new createjs.Stage("canvas");

        var queue = new createjs.LoadQueue();
        var that = this;
        queue.addEventListener("complete", function() {
            that.playerImg = queue.getResult("player");
            that.tilesImgs.grass = queue.getResult("tile_grass");
            that.tilesImgs.wall = queue.getResult("tile_wall");
            that.tilesImgs.wood = queue.getResult("tile_wood");
            that.setup();
        });
        queue.loadManifest([
            {id: "player", src: "img/player.png"},
            {id: "tile_grass", src: "img/tile_grass.png"},
            {id: "tile_wall", src: "img/tile_wall.png"},
            {id: "tile_wood", src: "img/tile_wood.png"}
        ]);
    },

    setup: function() {
        // Set background
        var tilesX = 19;
        var tilesY = 13;
        var tileSize = 32;

        // Draw tiles
        for (var i = 0; i < tilesY; i++) {
            for (var j = 0; j < tilesX; j++) {
                var tile;
                var isWall;
                if ((i == 0 || j == 0 || i == tilesY - 1 || j == tilesX - 1)
                    || (j % 2 == 0 && i % 2 == 0)) {
                    tile = new createjs.Bitmap(this.tilesImgs.wall);
                    isWall = true;
                } else {
                    tile = new createjs.Bitmap(this.tilesImgs.grass);
                    isWall = false;
                }
                tile.x = j * tileSize;
                tile.y = i * tileSize;
                this.stage.addChild(tile);

                // Draw wood tiles
                if (!isWall && !(i <= 2 && j <= 2)
                    && !(i >= tilesY - 3 && j >= tilesX - 3)
                    && !(i <= 2 && j >= tilesX - 3)
                    && !(i >= tilesY - 3 && j <= 2)) {
                    var wood = new createjs.Bitmap(this.tilesImgs.wood);
                    wood.x = j * tileSize;
                    wood.y = i * tileSize;
                    this.stage.addChild(wood);
                }
            }
        }

        // Start loop
        createjs.Ticker.addEventListener("tick", function() { gGameEngine.update(); });
    },

    update: function() {
        this.stage.update();
    }
});

gGameEngine = new GameEngine();