/*
  Week 6 — Example 3: Expanded Tile-Based Level with Camera Follow, Fall Reset, and Scrolling Background

  Course: GBDA302 | Instructors: Dr. Karen Cochrane & David Han
  Date: Feb. 26, 2026

  Controls:
    A or D (Left / Right Arrow)   Horizontal movement
    W (Up Arrow)                  Jump
    Space Bar                     Attack

  Tile key:
    g = groundTile.png       (surface ground)
    d = groundTileDeep.png   (deep ground, below surface)
    L = platformLC.png       (platform left cap)
    R = platformRC.png       (platform right cap)
    [ = wallL.png            (wall left side)
    ] = wallR.png            (wall right side)
      = empty (no sprite)
*/

let player, sensor, treasure;
let bgLayers = [];
let playerImg, bgForeImg, bgMidImg, bgFarImg, treasureImg;

// UI variables for our HTML overlay
let uiDiv, endDiv;

// Audio variables
let runSound, jumpSound, fallSound;

let playerAnis = {
  idle: { row: 0, frames: 4, frameDelay: 10 },
  run: { row: 1, frames: 4, frameDelay: 3 },
  jump: { row: 2, frames: 3, frameDelay: Infinity, frame: 0 },
  attack: { row: 3, frames: 6, frameDelay: 2 },
};

let ground, groundDeep, platformsL, platformsR, wallsL, wallsR;
let groundTile1Img,
  groundTile2Img,
  platforTileLImg,
  platforTileRImg,
  wallTileLImg,
  wallTileRImg;

let attacking = false;
let attackFrameCounter = 0;

// --- GAME LOGIC VARIABLES ---
let gameState = "PLAYING";
let timeLeft = 30;
let timerStarted = false;
let lastTick = 0;

// Coordinate grids (column and row) targeting the upper platforms
let spawnPoints = [
  { c: 17, r: 1 },
  { c: 5, r: 2 },
  { c: 11, r: 2 },
  { c: 23, r: 2 },
  { c: 4, r: 4 },
  { c: 15, r: 4 },
  { c: 21, r: 4 },
];

// --- TILE MAP ---
let level = [
  "                    g                   ", // row  0
  "                                        ", // row  1
  "                LggR                    ", // row  2
  "     LR   LgR          LR               ", // row  3: upper platforms
  "                                        ", // row  4
  "   LgggR       LR   LgR                 ", // row  5: mid platforms
  "         LgR            g   LggggR      ", // row  6: walls + low platform
  "               LgR                      ", // row  7
  "                                    LggR", // row  8
  "          LgR               LR  LR  [dd]", // row  9: mid-right platform
  "          [d]        gggg           [dd]", // row 10: wall below mid-right platform
  "ggggg  gggggggg   ggggggg  g ggggggggggg", // row 11: surface ground WITH GAPS
  "ddddd  dddddddd   ddddddd    ddddddddddd", // row 12: deep ground
];

// --- LEVEL CONSTANTS ---
const TILE_W = 24;
const TILE_H = 24;

const FRAME_W = 32;
const FRAME_H = 32;

const LEVELW = TILE_W * level[0].length;
const LEVELH = TILE_H * level.length;

const VIEWTILE_W = 10;
const VIEWTILE_H = 8;
const VIEWW = TILE_W * VIEWTILE_W;
const VIEWH = TILE_H * VIEWTILE_H;

const PLAYER_START_Y = LEVELH - TILE_H * 4;
const GRAVITY = 10;

function preload() {
  playerImg = loadImage("assets/foxSpriteSheet.png");
  bgFarImg = loadImage("assets/background_layer_1.png");
  bgMidImg = loadImage("assets/background_layer_2.png");
  bgForeImg = loadImage("assets/background_layer_3.png");
  groundTile1Img = loadImage("assets/groundTile.png");
  groundTile2Img = loadImage("assets/groundTileDeep.png");
  platformTileLImg = loadImage("assets/platformLC.png");
  platformTileRImg = loadImage("assets/platformRC.png");
  wallTileLImg = loadImage("assets/wallL.png");
  wallTileRImg = loadImage("assets/wallR.png");

  treasureImg = loadImage("assets/treasure.png");

  runSound = loadSound("assets/running.mp3");
  jumpSound = loadSound("assets/jumping.mp3");
  fallSound = loadSound("assets/falling.mp3");
}

function setup() {
  new Canvas(VIEWW, VIEWH, "pixelated");
  noSmooth();

  applyIntegerScale();
  window.addEventListener("resize", applyIntegerScale);

  allSprites.pixelPerfect = true;
  world.gravity.y = GRAVITY;

  // --- HTML UI OVERLAY ---
  uiDiv = createDiv(
    '<div style="font-family: \'Times New Roman\', serif; font-size: 32px; font-weight: bold;">Find the treasure before time runs out<br><span id="time-span" style="font-size: 42px;">30s</span></div>',
  );
  uiDiv.position(0, 0);
  uiDiv.style("width", "100%");
  uiDiv.style("background", "rgba(0, 0, 0, 0.6)");
  uiDiv.style("color", "white");
  uiDiv.style("text-align", "center");
  uiDiv.style("padding", "15px 0");
  uiDiv.style("pointer-events", "none");

  endDiv = createDiv(
    '<div id="end-title" style="font-family: \'Times New Roman\', serif; font-size: 64px; font-weight: bold;"></div><div style="font-family: \'Times New Roman\', serif; font-size: 32px; margin-top: 15px; color: white;">Press R to restart</div>',
  );
  endDiv.position(0, 0);
  endDiv.style("width", "100%");
  endDiv.style("height", "100%");
  endDiv.style("background", "rgba(0, 0, 0, 0.8)");
  endDiv.style("display", "none");
  endDiv.style("flex-direction", "column");
  endDiv.style("justify-content", "center");
  endDiv.style("align-items", "center");
  endDiv.style("pointer-events", "none");

  // --- TILE GROUPS ---
  ground = new Group();
  ground.physics = "static";
  ground.img = groundTile1Img;
  ground.tile = "g";

  groundDeep = new Group();
  groundDeep.physics = "static";
  groundDeep.img = groundTile2Img;
  groundDeep.tile = "d";

  platformsL = new Group();
  platformsL.physics = "static";
  platformsL.img = platformTileLImg;
  platformsL.tile = "L";

  platformsR = new Group();
  platformsR.physics = "static";
  platformsR.img = platformTileRImg;
  platformsR.tile = "R";

  wallsL = new Group();
  wallsL.physics = "static";
  wallsL.img = wallTileLImg;
  wallsL.tile = "[";

  wallsR = new Group();
  wallsR.physics = "static";
  wallsR.img = wallTileRImg;
  wallsR.tile = "]";

  new Tiles(level, 0, 0, TILE_W, TILE_H);

  // --- PLAYER ---
  player = new Sprite(FRAME_W, PLAYER_START_Y, FRAME_W, FRAME_H);
  player.spriteSheet = playerImg;
  player.rotationLock = true;
  player.anis.w = FRAME_W;
  player.anis.h = FRAME_H;
  player.anis.offset.y = -8;
  player.addAnis(playerAnis);

  player.ani = "idle";
  player.w = 18;
  player.h = 12;
  player.friction = 0;
  player.bounciness = 0;

  // --- TREASURE ---
  treasureImg.resize(24, 0);

  treasure = new Sprite();
  treasure.img = treasureImg;
  // Force the physical collision box to be much smaller than the original image file
  treasure.w = 16;
  treasure.h = 16;
  treasure.collider = "static";
  treasure.overlaps(player);

  resetLevel(false);

  // --- GROUND SENSOR ---
  sensor = new Sprite();
  sensor.x = player.x;
  sensor.y = player.y + player.h / 2;
  sensor.w = player.w;
  sensor.h = 2;
  sensor.mass = 0.01;
  sensor.removeColliders();
  sensor.visible = false;
  let sensorJoint = new GlueJoint(player, sensor);
  sensorJoint.visible = false;

  // --- BACKGROUND  ---
  bgLayers = [
    { img: bgFarImg, speed: 0.2 },
    { img: bgMidImg, speed: 0.4 },
    { img: bgForeImg, speed: 0.6 },
  ];

  world.autoStep = false;
}

function draw() {
  background(69, 61, 79);

  if (gameState === "PLAYING") {
    world.step();

    // --- TIMER LOGIC ---
    if (!timerStarted) {
      if (kb.pressing("left") || kb.pressing("right") || kb.presses("up")) {
        timerStarted = true;
        lastTick = millis();
      }
    } else {
      if (millis() - lastTick >= 1000 && timeLeft > 0) {
        timeLeft--;
        lastTick = millis();
        document.getElementById("time-span").innerText = timeLeft + "s";
      }
    }

    // --- CAMERA ---
    camera.width = VIEWW;
    camera.height = VIEWH;

    let targetX = constrain(
      player.x,
      VIEWW / 2,
      LEVELW - VIEWW / 2 - TILE_W / 2,
    );
    let targetY = constrain(
      player.y,
      VIEWH / 2 - TILE_H * 2,
      LEVELH - VIEWH / 2 - TILE_H,
    );

    camera.x = Math.round(lerp(camera.x || targetX, targetX, 0.1));
    camera.y = Math.round(lerp(camera.y || targetY, targetY, 0.1));

    // --- PLAYER CONTROLS ---
    let grounded =
      sensor.overlapping(ground) ||
      sensor.overlapping(platformsL) ||
      sensor.overlapping(platformsR);

    // -- ATTACK INPUT --
    if (grounded && !attacking && kb.presses("space")) {
      attacking = true;
      attackFrameCounter = 0;
      player.vel.x = 0;
      player.ani.frame = 0;
      player.ani = "attack";
      player.ani.play();
    }

    // -- JUMP --
    if (grounded && kb.presses("up")) {
      player.vel.y = -4.5;
      jumpSound.play();
    }

    // --- STATE MACHINE ---
    if (attacking) {
      attackFrameCounter++;
      if (attackFrameCounter > 12) {
        attacking = false;
        attackFrameCounter = 0;
      }
    } else if (!grounded) {
      player.ani = "jump";
      player.ani.frame = player.vel.y < 0 ? 0 : 1;
    } else {
      player.ani = kb.pressing("left") || kb.pressing("right") ? "run" : "idle";
    }

    // --- MOVEMENT ---
    let isMoving = false;
    if (!attacking) {
      player.vel.x = 0;
      if (kb.pressing("left")) {
        player.vel.x = -1.5;
        player.mirror.x = true;
        isMoving = true;
      } else if (kb.pressing("right")) {
        player.vel.x = 1.5;
        player.mirror.x = false;
        isMoving = true;
      }
    }

    // --- RUNNING AUDIO LOGIC ---
    if (grounded && isMoving && !attacking) {
      if (!runSound.isPlaying()) {
        runSound.loop();
      }
    } else {
      if (runSound.isPlaying()) {
        runSound.stop();
      }
    }

    // --- PLAYER BOUNDS ---
    player.x = constrain(player.x, FRAME_W / 2, LEVELW - FRAME_W / 2);

    // --- GAME END/WIN STATES ---
    if (player.overlaps(treasure)) {
      gameState = "WIN";
      if (runSound.isPlaying()) runSound.stop();

      // Update HTML UI
      uiDiv.hide();
      endDiv.style("display", "flex");
      document.getElementById("end-title").innerText = "YOU WIN";
      document.getElementById("end-title").style.color = "#00ff00";
    } else if (timeLeft <= 0 || player.y > LEVELH + TILE_H * 3) {
      if (player.y > LEVELH + TILE_H * 3) {
        fallSound.play();
      }
      gameState = "LOSE";
      if (runSound.isPlaying()) runSound.stop();

      // Update HTML UI
      uiDiv.hide();
      endDiv.style("display", "flex");
      document.getElementById("end-title").innerText = "YOU LOSE";
      document.getElementById("end-title").style.color = "#ff0000";
    }
  } else {
    // Listen for restart when the game is over
    if (kb.presses("r")) {
      resetLevel(false);
    }
  }

  // --- BACKGROUNDS ---
  camera.off();
  imageMode(CORNER);
  drawingContext.imageSmoothingEnabled = false;

  for (const layer of bgLayers) {
    const img = layer.img;
    const w = img.width;
    let x = Math.round((-camera.x * layer.speed) % w);

    if (x > 0) x -= w;
    for (let tx = x; tx < VIEWW + w; tx += w) {
      image(img, tx, 0);
    }
  }
  camera.on();

  // --- PIXEL SNAP ---
  const px = player.x,
    py = player.y;
  const sx = sensor.x,
    sy = sensor.y;

  player.x = Math.round(player.x);
  player.y = Math.round(player.y);
  sensor.x = Math.round(sensor.x);
  sensor.y = Math.round(sensor.y);

  allSprites.draw();

  player.x = px;
  player.y = py;
  sensor.x = sx;
  sensor.y = sy;
}

function resetLevel(playFallSound) {
  player.x = FRAME_W;
  player.y = PLAYER_START_Y;
  player.vel.x = 0;
  player.vel.y = 0;

  if (playFallSound) {
    fallSound.play();
  }

  gameState = "PLAYING";
  timeLeft = 30;
  timerStarted = false;

  // Reset HTML UI
  if (uiDiv) {
    uiDiv.show();
    document.getElementById("time-span").innerText = timeLeft + "s";
  }
  if (endDiv) endDiv.style("display", "none");

  let spawn = random(spawnPoints);
  treasure.x = spawn.c * TILE_W + TILE_W / 2;
  treasure.y = spawn.r * TILE_H + TILE_H / 2;
}

function applyIntegerScale() {
  const c = document.querySelector("canvas");
  const scale = Math.max(
    1,
    Math.floor(Math.min(window.innerWidth / VIEWW, window.innerHeight / VIEWH)),
  );
  c.style.width = VIEWW * scale + "px";
  c.style.height = VIEWH * scale + "px";
}
