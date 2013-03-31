GameEngine = Class.extend({
    tileSize: 32,
    tilesX: 19,
    tilesY: 13,
    size: {},
    fps: 60,

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
            var y = i * this.tileSize;
            for (var j = 0; j < this.tilesX; j++) {
                var x = j * this.tileSize;
                if ((i == 0 || j == 0 || i == this.tilesY - 1 || j == this.tilesX - 1)
                    || (j % 2 == 0 && i % 2 == 0)) {
                    // Wall tiles
                    var tile = new createjs.Bitmap(this.tilesImgs.wall);
                    tile.x = x;
                    tile.y = y;
                    this.stage.addChild(tile);
                    this.tiles.push(tile);
                } else {
                    // Grass tiles
                    var tile = new createjs.Bitmap(this.tilesImgs.grass);
                    tile.x = x;
                    tile.y = y;
                    this.stage.addChild(tile);

                    // Wood tiles
                    if (!(i <= 2 && j <= 2)
                        && !(i >= this.tilesY - 3 && j >= this.tilesX - 3)
                        && !(i <= 2 && j >= this.tilesX - 3)
                        && !(i >= this.tilesY - 3 && j <= 2)) {
                        var wood = new createjs.Bitmap(this.tilesImgs.wood);
                        wood.x = x;
                        wood.y = y;
                        this.stage.addChild(wood);
                        this.tiles.push(wood);
                    }
                }
            }
        }

        // Draw player
        this.player = new Player();
        this.player.bmp.x = this.tileSize * 1.5;
        this.player.bmp.y = this.tileSize * 1.1;
        this.stage.addChild(this.player.bmp);

        // Subscribe to bomb key
        gInputEngine.addListener('bomb', this.spawnBomb);

        // Start loop
        createjs.Ticker.addEventListener("tick", function() { gGameEngine.update(); });
        createjs.Ticker.setFPS(this.fps);
    },

    update: function() {
        this.player.update();
        for (var i = 0; i < this.bombs.length; i++) {
            var bomb = this.bombs[i];
            bomb.update();
        }

        this.stage.update();
    },

    spawnBomb: function() {
        if (gGameEngine.bombs.length < gGameEngine.player.bombsMax) {
            var bomb = new Bomb();
            bomb.bmp.x = gGameEngine.player.bmp.x - bomb.size.w/2;
            bomb.bmp.y = gGameEngine.player.bmp.y;
            gGameEngine.stage.addChild(bomb.bmp);
            gGameEngine.bombs.push(bomb);
        }
    },

    removeBomb: function(entity) {
        this.stage.removeChild(entity.bmp);
        for (var i = 0; i < this.bombs.length; i++) {
            var bomb = this.bombs[i];
            if (entity == bomb) {
                this.bombs.splice(i, 1);
            }
        }
    }
});

gGameEngine = new GameEngine();