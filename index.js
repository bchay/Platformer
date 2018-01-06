//Check for ES6 support
try {
  eval("let x = 5");
  eval("((x) => 5)()");
} catch (e) {
  alert("Your browser does not support the new ECMAScript 6 features. Please upgrade to a modern browser.");
}


var platforms = []; //Needs to be "var" to be accessible with window[variable]
let visiblePlatforms = []; //Can be let
var clouds = [];
let customLevels = [];
var enemies = [];
var coins = [];
var players = [];

let game;
let player;
let levelCreator;
let interval;

let renderDistance = 60;
let currentPlatform = 0;

let coinCount = 0;

let time = 0;

class Collision {
  static collisionAnyPlatform(type) {
    let collision = false;
    for(let i = 0; i < visiblePlatforms.length; i++) {
      if(type(player, visiblePlatforms[i])) collision = visiblePlatforms[i];
    }
    return collision;
  }
  
  static topCollision(player, rectangle) {
    let playerLowerBound = player.y + player.height;
    let playerUpperBound = player.y;
    let playerRightBound = player.x + player.width;
    let playerLeftBound = player.x;

    return (playerLowerBound >= rectangle.y &&
    playerUpperBound <= rectangle.y &&
    playerRightBound < rectangle.x - Canvas.canvasX + rectangle.width + player.width &&
    playerLeftBound > rectangle.x - Canvas.canvasX - player.width);
  }
  
  static bottomCollision(player, rectangle) {
    let playerLowerBound = player.y + player.height;
    let playerUpperBound = player.y;
    let playerRightBound = player.x + player.width;
    let playerLeftBound = player.x;

    return (playerLowerBound >= rectangle.y + rectangle.height &&
    playerUpperBound <= rectangle.y  + rectangle.height &&
    playerRightBound < rectangle.x - Canvas.canvasX + rectangle.width + player.width &&
    playerLeftBound > rectangle.x - Canvas.canvasX - player.width);
  }
  
  static leftCollision(player, rectangle) {
    let playerLowerBound = player.y + player.height;
    let playerUpperBound = player.y;
    let playerRightBound = player.x + player.width;
    let playerLeftBound = player.x;

    return (playerUpperBound > rectangle.y - player.height &&
    playerLowerBound <= rectangle.y + rectangle.height + player.height &&
    playerRightBound < rectangle.x - Canvas.canvasX + player.width &&
    playerLeftBound > rectangle.x - Canvas.canvasX - player.width);
  }
  
  static rightCollision(player, rectangle) {
    let playerLowerBound = player.y + player.height;
    let playerUpperBound = player.y;
    let playerRightBound = player.x + player.width;
    let playerLeftBound = player.x;

    return (playerUpperBound > rectangle.y - player.height &&
    playerLowerBound <= rectangle.y + rectangle.height + player.height &&
    playerRightBound < rectangle.x - Canvas.canvasX + rectangle.width + player.width &&
    playerLeftBound > rectangle.x - Canvas.canvasX + rectangle.width - player.width);
  }

  static inside(player, rectangle) {
    let playerLowerBound = player.y + player.height;
    let playerUpperBound = player.y;
    let playerRightBound = player.x + player.width;
    let playerLeftBound = player.x;

    return (playerUpperBound >= rectangle.y &&
      playerLowerBound <= rectangle.y + rectangle.height &&
      playerLeftBound >= (rectangle.x  - Canvas.canvasX) &&
      playerRightBound <= (rectangle.x - Canvas.canvasX) + rectangle.width);
  }
  
  static getCollisionPlatform(collisionType) {
    for(let i = 0; i < visiblePlatforms.length; i++) {
      if(collisionType(player, visiblePlatforms[i])) return visiblePlatforms[i];
    }
    return false;
  }

  static lavaCollision() {
    for(let i = 0; i < visiblePlatforms.length; i++) {
      if(visiblePlatforms[i].type === "lava") {
        if(Collision.topCollision(player, visiblePlatforms[i]) ||
          Collision.bottomCollision(player, visiblePlatforms[i]) ||
          Collision.rightCollision(player, visiblePlatforms[i]) ||
          Collision.leftCollision(player, visiblePlatforms[i])
        ) return true;
      }
    }
    return false;
  }
  
  static enemyCollision() {
    for(let i = 0; i < enemies.length; i++) {
      if(Collision.topCollision(player, enemies[i]) ||
        Collision.bottomCollision(player, enemies[i]) ||
        Collision.rightCollision(player, enemies[i]) ||
        Collision.leftCollision(player, enemies[i])
      ) return true;
    }
    return false;
  }

  static coinCollision() {
    for(let i = 0; i < coins.length; i++) {
      if(Collision.topCollision(player, coins[i]) ||
        Collision.bottomCollision(player, coins[i]) ||
        Collision.rightCollision(player, coins[i]) ||
        Collision.leftCollision(player, coins[i])
      ) {
        coins.splice(i, 1); //Remove coin
        coinCount++;
        return true;
      }
    }
    return false;
  }

  static pointInRectangle(pointX, pointY, rectangleX, rectangleY, rectangleWidth, rectangleHeight) {
    return pointX > rectangleX - Canvas.canvasX &&
        pointX < rectangleX - Canvas.canvasX + rectangleWidth &&
        pointY > rectangleY &&
        pointY < rectangleY + rectangleHeight;
  }

  static pointInPlayer(x, y) {
      if(Collision.pointInRectangle(x, y, player.x, player.y, player.width, player.height)) {
        return {
          data: player,
          type: "players",
          index: 0
        };
      }
      return null;
  }

  static pointInPlatform(x, y) {
    for(let i = 0; i < platforms.length; i++) {
      if(Collision.pointInRectangle(x, y, platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height)) {
        return {
          data: platforms[i],
          type: "platforms",
          index: i
        };
      }
    }
    return null;
  }

  static pointInCloud(x, y) {
    for(let i = 0; i < clouds.length; i++) {
      if(Collision.pointInRectangle(x, y, clouds[i].x, clouds[i].y, clouds[i].width, clouds[i].height)) {
        return {
          data: clouds[i],
          type: "clouds",
          index: i
        };
      }
    }
    return null;
  }

  static pointInEnemy(x, y) {
    for(let i = 0; i < enemies.length; i++) {
      if(Collision.pointInRectangle(x, y, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height)) {
        return {
          data: enemies[i],
          type: "enemies",
          index: i
        };
      }
    }
    return null;
  }

  static pointInCoin(x, y) {
    for(let i = 0; i < coins.length; i++) {
      if(Collision.pointInRectangle(x, y, coins[i].x, coins[i].y, coins[i].width, coins[i].height)) {
        return {
          data: coins[i],
          type: "coins",
          index: i
        };
      }
    }
    return null;
  }

  static pointInHandle(x, y) {
    for(let i = 0; i < levelCreator.handles.length; i++) {
      if(Collision.pointInRectangle(x, y, levelCreator.handles[i].x + Canvas.canvasX, levelCreator.handles[i].y, levelCreator.handles[i].handleSize, levelCreator.handles[i].handleSize, true)) return i;
    }
    return false;
  }

  static pointInElement(x, y) {
    return Collision.pointInPlatform(x, y) || Collision.pointInCloud(x, y) || Collision.pointInEnemy(x, y) || Collision.pointInCoin(x, y) || Collision.pointInHandle(x, y) || Collision.pointInPlayer(x, y) || null;
  }
}

class Utility {
  static randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static keyPressed(key) {
    return this.keyMap.indexOf(key) > -1;
  }

  static addKey(key) {
    this.keyMap.push(key);
  }

  static removeKey(key) {
    this.keyMap.splice(this.keyMap.indexOf(key), 1);
  }
}

Utility.keyMap = [];

class Canvas {
  static drawPlayer() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  static drawPlatform(x, y, width, height, type) {
    if(type === "soil") {
      this.drawGrass(x, y, width, height * 0.3);
      this.drawSoil(x, y + height * 0.3, width, height * 0.7);
    } else if(type === "stone") {
      this.ctx.drawImage(Canvas.stone, x, y, width, height);
    } else if (type === "lava") {
      this.ctx.drawImage(Canvas.lava, x, y, width, height);
    } else if(type === "cloud") { //Cloud images pushed to platform during LevelCreation
      this.ctx.drawImage(Canvas.cloud, x, y, width, height);
    } else if(type === "mouse") {
      this.ctx.drawImage(Canvas.mouse, x, y, width, height);
    }
  }

  static drawGrass(x, y, width, height) {
    this.ctx.drawImage(Canvas.grass, x, y, width, height);
  }

  static drawSoil(x, y, width, height) {
    this.ctx.drawImage(Canvas.soil, x, y, width, height);
  }

  static drawCloud(x, y, width, height) {
    this.ctx.drawImage(Canvas.cloud, x, y, width, height);
  }

  static drawCoin(x, y, width, height) {
    this.ctx.drawImage(Canvas.coin, x, y, width, height);
  }

  static clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "skyblue";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

Canvas.grass = new Image();
Canvas.grass.src = "./img/grass-texture.png"; //Created with http://cpetry.github.io/TextureGenerator-Online/

Canvas.soil = new Image();
Canvas.soil.src = "./img/soil-texture.png"; //Created with http://cpetry.github.io/TextureGenerator-Online/

Canvas.stone = new Image();
Canvas.stone.src = "./img/stone-texture.png"; //Created with http://cpetry.github.io/TextureGenerator-Online/

Canvas.cloud = new Image();
Canvas.cloud.src = "./img/cloud.png"; //Taken from http://www.clipartbest.com/cliparts/9i4/6B7/9i46B7qRT.png

Canvas.coin = new Image();
Canvas.coin.src = "./img/coin.png"; //Taken from https://opengameart.org/content/coin-icon

Canvas.lava = new Image();
Canvas.lava.src = "./img/lava.png"; //Taken from http://www.clipartbest.com/cliparts/9i4/6B7/9i46B7qRT.png

Canvas.soilCircle = new Image();
Canvas.soilCircle.src = "./img/soil-circle.png";

Canvas.stoneCircle = new Image();
Canvas.stoneCircle.src = "./img/stone-circle.png";

Canvas.lavaCircle = new Image();
Canvas.lavaCircle.src = "./img/lava-circle.png";

Canvas.mouse = new Image();
Canvas.mouse.src = "./img/mouse.png";

Canvas.canvasX = 0;
Canvas.panSpeed = 8;

Canvas.canvas = document.getElementById("canvas");
Canvas.canvas.height = window.innerHeight - 5;
Canvas.canvas.width = window.innerWidth;

Canvas.ctx = Canvas.canvas.getContext("2d");

class Game {
  constructor(customLevel) {
    this.customLevel = customLevel;
  }

  init() {
    //Reset
    Canvas.clear();
    player = new Player(110, 370, 20, 20);
    platforms[0] = new Platform(100, 390, 100, 30, "soil");
    currentPlatform = platforms[0];
    visiblePlatforms = [];
    Canvas.canvasX = 0;
    cancelAnimationFrame(interval);
    time = 0;
    
    clouds = [];
    
    Canvas.canvas.style.display = "none";
    document.getElementById("instructions").style.display = "none";
    if(document.getElementById("gameOverScreen")) document.body.removeChild(document.getElementById("gameOverScreen"));

    if(document.getElementById("customLevels")) document.body.removeChild(document.getElementById("customLevels"));

    if(this.customLevel === true) { //User wants to play custom level, show level select screen, must have === true
      customLevels = [];

      for(let i = 0; i < localStorage.length; i++) { //Load all custom levels
        eval(localStorage.getItem(localStorage.key(i))); //Use eval, no sensitive data
      }

      let levelDiv = document.createElement("div");
      levelDiv.id = "customLevels";
      document.body.appendChild(levelDiv);

      for(let i = 0; i < customLevels.length; i++) {
        let level = document.createElement("div");
        level.className = "level";
        level.innerHTML = i + 1;

        let deleteButton = document.createElement("div");
        deleteButton.className = "deleteButton";
        deleteButton.id = "deleteButton" + localStorage.key(i).substring(4);
        deleteButton.innerHTML = "&#10006;"; //X HTML entity

        deleteButton.addEventListener("click", function(event) {
          event.target.parentNode.parentNode.removeChild(event.target.parentNode); //Remove level option div
          localStorage.removeItem("item" + event.target.id.substring(12)); //Clear element from localStorage list
          event.stopPropagation();
        });

        level.addEventListener('click', function(event) {
          game.customLevel = parseInt(event.target.innerHTML.substring(0, event.target.innerHTML.indexOf("<"))) - 1;
          document.body.removeChild(document.getElementById("customLevels"));
          game.init();
          event.stopPropagation();
        });

        level.appendChild(deleteButton);
        document.getElementById("customLevels").appendChild(level);
      }
    } else { //Play randomized level, or a selected custom level
      time = Date.now();
      if(this.customLevel === false) { //Randomized level, must be ===, this.customlevel is integer
        for(let i = 1; i < 2000; i++) {
          let platformType = Math.random();
          if(platformType < .05) platformType = "lava";
          else if(platformType > .8) platformType = "stone";
          else platformType = "soil";

          platforms[i] = new Platform(Utility.randomNumber(-5000, 100000), Utility.randomNumber(130, canvas.height - 25), Utility.randomNumber(100, 300), 30, platformType);
        }

        for(let i = 0; i < 100; i++) {
          clouds[i] = new Cloud(Utility.randomNumber(-5000, 100000), 60, 250, 150);
        }
        
        for(let i = 0; i < 100; i++) {
          enemies[i] = new Enemy(Utility.randomNumber(-5000, 100000), Utility.randomNumber(150, canvas.height - 50), Utility.randomNumber(30, 150), Utility.randomNumber(30, 150), Utility.randomNumber(100, 800), Utility.randomNumber(100, 800), Utility.randomNumber(1, 2) === 1 ? "rectangular" : "elliptical");
        }
        
        for(let i = 0; i < 200; i++) {
          coins[i] = new Coin(Utility.randomNumber(-5000, 100000), Utility.randomNumber(150, canvas.height - 50), 50, 50);
        }
        
      } else { //Play custom level - this.customLevel is a number corresponding to the desired level.
        platforms = customLevels[this.customLevel][0];
        clouds = customLevels[this.customLevel][1];
        enemies = customLevels[this.customLevel][2];
        coins = customLevels[this.customLevel][3];
        player = customLevels[this.customLevel][4][0];

      }
      customLevels = [];
      this.customLevel = false;
      Canvas.canvas.style.display = "initial";
      document.getElementById("instructions").style.display = "none";
      if(document.getElementById("gameOverScreen")) document.body.removeChild(document.getElementById("gameOverScreen"));
    }

    platforms.sort((a, b) => a.x - b.x);
    currentPlatform = platforms.indexOf(currentPlatform); //Now numerical index, rather than object

    interval = window.requestAnimationFrame(() => game.tick());
  }

  tick() {
    Canvas.clear();
    
    if(Collision.lavaCollision() || Collision.enemyCollision()) checkGameOver();

    //Up Arrow or Space Bar
    if(Utility.keyPressed(38) || Utility.keyPressed(32)) {
      if(player.canJump) {
        player.canJump = false;
        player.velocityY = player.jumpVelocity;
      }
    }
    
    //Right Arrow
    if(Utility.keyPressed(39)) {
      let collisionPlatform = Collision.collisionAnyPlatform(Collision.leftCollision);
      if(!collisionPlatform || collisionPlatform.type === "lava") Canvas.canvasX += player.horizontalMovementSpeed;
      
      collisionPlatform = Collision.collisionAnyPlatform(Collision.leftCollision); //Needs to be checked again after Canvas.canvasX is updated
      if(collisionPlatform && collisionPlatform.type !== "lava") Canvas.canvasX -= Math.abs((Collision.getCollisionPlatform(Collision.leftCollision).x - Canvas.canvasX) - (player.x + player.width)); //Type !== "lava" ensures that player can die from side of lava
    }
    
    //Left Arrow
    if(Utility.keyPressed(37)) {
      let collisionPlatform = Collision.collisionAnyPlatform(Collision.rightCollision);
      if(!collisionPlatform || collisionPlatform.type.type === "lava") Canvas.canvasX -= player.horizontalMovementSpeed;
      
      collisionPlatform = Collision.collisionAnyPlatform(Collision.rightCollision); //Needs to be checked again after Canvas.canvasX is updated
      if(collisionPlatform && collisionPlatform.type !== "lava") Canvas.canvasX += Math.abs((Collision.getCollisionPlatform(Collision.rightCollision).x + Collision.getCollisionPlatform(Collision.rightCollision).width - Canvas.canvasX) - player.x); //Needs to be checked again after Canvas.canvasX is updated
    }

    //"A" key - Pan to the left
    if(Utility.keyPressed(65)) {
      player.x += Canvas.panSpeed;
      Canvas.canvasX -= Canvas.panSpeed;
    }

    //"S" key - Pan to the right
    if(Utility.keyPressed(83)) {
      player.x -= Canvas.panSpeed;
      Canvas.canvasX += Canvas.panSpeed;
    }
    
    for(let i = 0; i < clouds.length; i++) {
      clouds[i].render();
    }

    visiblePlatforms = [];
    for(let i = Math.max(currentPlatform - renderDistance, 0); i < Math.min(currentPlatform + renderDistance, platforms.length); i++) {
      platforms[i].render();
    }
    
    for(let i = 0; i < enemies.length; i++) {
      enemies[i].render(true);
    }
    
    for(let i = 0; i < coins.length; i++) {
      coins[i].render();
    }
    
    player.render(true);

    Collision.coinCollision();
    Canvas.ctx.font = '48px serif';
    Canvas.ctx.fillStyle = "white";
    Canvas.ctx.fillText("Coins: " + coinCount, Canvas.canvas.width - 400, 50);

    interval = requestAnimationFrame(this.tick.bind(this));
    Game.checkGameOver();
  }
  
  static checkGameOver() {
      if(player.y - player.height > canvas.height || Collision.lavaCollision() || Collision.enemyCollision()) {
        window.cancelAnimationFrame(interval);
        Canvas.canvas.style.display = "none";
        
        let gameOverScreen = document.createElement("div");
        gameOverScreen.id = "gameOverScreen";
        gameOverScreen.innerHTML = "Congratulations!<br>You have travelled " + Canvas.canvasX + " pixels. <br>You have collected " + coinCount + " coin" + (coinCount === 1 ? "." : "s.") + "<br>You took " + ((Date.now() - time) / 1000).toPrecision(4) + " seconds.";
        document.body.appendChild(gameOverScreen);
      }
  }
}

class Player {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.canJump = true;
    this.velocityY = 0;
    this.gravityAcceleration = 0.35;
    this.jumpVelocity = -10;
    this.horizontalMovementSpeed = 6;
  }
  
  render(update) {
    if(update) this.update();
    Canvas.drawPlayer();
  }
  
  update() {
    //Check for collision with top of platform
    let collision = Collision.collisionAnyPlatform(Collision.topCollision);
    
    if(collision) { //On platform, update the location of the current platform
        for(let i = Math.max(currentPlatform - 60, 0); i < Math.min(currentPlatform + 60, platforms.length); i++) {
          if(Collision.topCollision(this, platforms[i])) {
              currentPlatform = i;
              break;
          }
        }
    
      if(!this.canJump) { //Up arrow has been pressed, still on platform preparing for jump
        this.canJump = true;
      } else {
       this.velocityY = 0; //Touching platform
      }
    } else { //In midair
      this.canJump = false;
      this.velocityY += this.gravityAcceleration;
      if(Collision.collisionAnyPlatform(Collision.bottomCollision)) this.velocityY = this.gravityAcceleration * 5; //Move down if player has hit the bottom of a platform
    }
    
    this.y += this.velocityY; //Update player position
    let platform = Collision.getCollisionPlatform(Collision.topCollision);
    if(platform) this.y = platform.y - this.height; //Move to top of platform if player has fallen through
    this.velocityY *= 1.01;

    for(let i = 0; i < platforms.length; i++) {
      if(Collision.inside(this, platforms[i])) { //Player is entirely inside of platform
        player.y = platforms[i].y;
        player.velocityY = 0;
      }
    }
  }
}

class Platform {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }
  
  render(override) { //override renders regardless of platform location
    Canvas.drawPlatform(this.x - Canvas.canvasX, this.y, this.width, this.height, this.type);
    if(override || (Math.abs((this.x - Canvas.canvasX) - player.x) < Canvas.canvas.width * 1.5 && Math.abs(this.y - player.y) < Canvas.canvas.height)) { //Platform is close to player
      visiblePlatforms.push(this);
    }
  }
}

class Cloud {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  render() {
    Canvas.drawCloud(this.x - Canvas.canvasX, this.y, this.width, this.height);
  }
}

class Enemy {
  constructor(x, y, width, height, shapeWidth, shapeHeight, movementPattern, originalX, originalY) { //Draw set to false for levelCreation
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.shapeWidth = shapeWidth;
    this.shapeHeight = shapeHeight;
    this.movementPattern = movementPattern;
    this.theta = 0; //Used with parametric equations
    
    this.centerX = x + shapeWidth / 2 - width / 2; //Initial is in center of shape, needed for shifting the parametric equations
    this.centerY = y + shapeHeight / 2 - height / 2;
    
    this.originalX = originalX; //Optional - Used with LevelCreation, update() changes x and y
    this.originalY = originalY;
  }
  
  update() {
    if(this.movementPattern === "rectangular" ) this.theta -= .05;
    else this.theta += .05;

    //Shape dimension conditionals allow 0 width / height to be vertical / horizontal movement
    if(this.movementPattern === "rectangular") { //Uses parametric equation of rectangle
      //Equation taken from http://math.stackexchange.com/a/69134
      this.x = this.shapeWidth > 0 ? ((this.shapeWidth / 2 - this.width / 2) * (Math.abs(Math.cos(this.theta)) * Math.cos(this.theta) + Math.abs(Math.sin(this.theta)) * Math.sin(this.theta)) + this.centerX) : this.centerX;
      this.y = this.shapeHeight > 0 ? ((this.shapeHeight / 2  - this.height / 2) * (Math.abs(Math.cos(this.theta)) * Math.cos(this.theta) - Math.abs(Math.sin(this.theta)) * Math.sin(this.theta)) + this.centerY) : this.centerY;
    } else if(this.movementPattern === "elliptical") { //Uses parametric equation of ellipse
      this.x = this.shapeWidth > 0 ? ((this.shapeWidth / 2 - this.width / 2) * Math.cos(this.theta) + this.centerX) : this.centerX;
      this.y = this.shapeHeight > 0 ? ((this.shapeHeight / 2 - this.height / 2) * Math.sin(this.theta) + this.centerY) : this.centerY;
    }
  }
  
  render(update) {
    if(update) this.update();
    Canvas.drawPlatform(this.x - Canvas.canvasX, this.y, this.width, this.height, "lava");
  }
}

class Coin {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  render() {
    Canvas.drawCoin(this.x - Canvas.canvasX, this.y, this.width, this.height);
  }
}


  /*
            0               1                2
            --------------------------------
            |                              |
          3 |                              | 4
            |                              |
            --------------------------------
            5               6               7
  */

class Handle {
  constructor(platformX, platformY, platformWidth, platformHeight, handlePosition) { //See diagram for handlePosition
    this.handleSize = 15;

    switch(handlePosition) {
      case 0:
        this.x = platformX - Canvas.canvasX - this.handleSize;
        this.y = platformY - this.handleSize;
        break;

      case 1:
        this.x = platformX - Canvas.canvasX + platformWidth / 2 - this.handleSize / 2;
        this.y = platformY - this.handleSize;
        break;

      case 2:
        this.x = platformX - Canvas.canvasX + platformWidth;
        this.y = platformY - this.handleSize;
        break;

      case 3:
        this.x = platformX - Canvas.canvasX - this.handleSize;
        this.y = platformY + platformHeight / 2 - this.handleSize / 2;
        break;

      case 4:
        this.x = platformX - Canvas.canvasX + platformWidth;
        this.y = platformY + platformHeight / 2 - this.handleSize / 2;
        break;

      case 5:
        this.x = platformX - Canvas.canvasX - this.handleSize;
        this.y = platformY + platformHeight;
        break;

      case 6:
        this.x = platformX - Canvas.canvasX + platformWidth / 2 - this.handleSize / 2;
        this.y = platformY + platformHeight;
        break;

      case 7:
        this.x = platformX - Canvas.canvasX + platformWidth;
        this.y = platformY + platformHeight;
        break;
    }
  }

  render() {
    Canvas.ctx.fillStyle = "black";
    Canvas.ctx.fillRect(this.x, this.y, this.handleSize, this.handleSize);
  }
}

class TileChoice {
  constructor(type) {
    this.type = type;
    this.y = 50;
    this.radius = 50;
    this.spacing = 30;
  }

  //Modified from http://stackoverflow.com/a/4729778
  render(x, y) {
    let image;
    
    switch(this.type) {
      case "soil":
        image = Canvas.soilCircle;
        break;
      case "stone":
        image = Canvas.stoneCircle;
        break;
      case "lava":
        image = Canvas.lavaCircle;
        break;
      case "cloud":
        image = Canvas.cloud;
        break;
      case "mouse":
        image = Canvas.mouse;
        break;
      case "coin":
        image = Canvas.coin;
        break;
    }
    
    if(image != undefined) {
      Canvas.ctx.drawImage(image, x + (this.type === "mouse" ? 8 : 0), y + (this.type === "mouse" ? 8 : 0), this.type === "mouse" ? this.radius - 15 : this.radius, this.type === "mouse" ? this.radius - 15 : this.radius);
    } else if(this.type === "rectangularEnemy") { //Does not use image
      //Draw surrounding circle
      Canvas.ctx.fillStyle = "white";
      Canvas.ctx.beginPath();
      Canvas.ctx.arc(x + this.radius / 2, y + this.radius / 2, this.radius / 2, 0, 2 * Math.PI);
      Canvas.ctx.fill();
      
      //Draw rectangle
      Canvas.ctx.strokeStyle = "black";
      Canvas.ctx.setLineDash([3, 5]);
      Canvas.ctx.strokeRect(x + this.radius / 2 - this.radius / 6, y + this.radius / 4, this.radius / 3, this.radius / 2);
    } else if(this.type === "ellipticalEnemy") {
      //Draw surrounding circle
      Canvas.ctx.lineWidth = 3;
      Canvas.ctx.fillStyle = "white";
      Canvas.ctx.beginPath();
      Canvas.ctx.arc(x + this.radius / 2, y + this.radius / 2, this.radius / 2, 0, 2 * Math.PI);
      Canvas.ctx.fill();
      
      //Draw ellipse
      Canvas.ctx.strokeStyle = "black";
      Canvas.ctx.lineWidth = 3;
      Canvas.ctx.setLineDash([3, 5]);
      Canvas.ctx.beginPath();
      Canvas.ctx.arc(x + this.radius / 2, y + this.radius / 2, this.radius / 5, 0, 2 * Math.PI);
      Canvas.ctx.stroke();
    }
    
    if(this.type === levelCreator.selected) { //Draw border around selected image
        Canvas.ctx.strokeStyle = "blue";
        Canvas.ctx.lineWidth = 3;
        Canvas.ctx.setLineDash([]);
        Canvas.ctx.beginPath();
        Canvas.ctx.arc(x + this.radius / 2, y + this.radius / 2, this.radius / 2 + (this.type === "cloud" ? 5 : 0), 0, 2 * Math.PI);
        Canvas.ctx.stroke();
    }
  }
  
  static renderChoices(choiceArray) {
    for(let i = 0; i < choiceArray.length; i++) {
        choiceArray[i].render(Canvas.canvas.width - ((choiceArray[i].radius) + choiceArray[i].spacing) * (i + 1), choiceArray[i].y);
    }
  }
}

class LevelCreator {
  constructor() {
    this.selected = "soil";
    this.selectedElement; //Used with mouse TileChoice
    this.handles = [];
    this.selectedHandle;
  }

  init() {
    //Reset
    Canvas.clear();
    platforms = [];
    clouds = [];
    enemies = [];
    coins = [];
    Canvas.canvasX = 0;
    cancelAnimationFrame(interval);
    this.clickX = null;
    this.clickY = null;
    this.mouseX = null;
    this.mouseY = null;
    this.dragStartX = null
    this.dragStartY = null;
    this.keepSelected = false;
    this.xDistance = null;
    this.yDistance = null;

    player = new Player(110, 370, 20, 20);
    players[0] = player;
    platforms[0] = new Platform(80, 390, 300, 30, "soil"); //Sets first platform
    this.recieveClicks = false;
    this.panSpeed = 15; //Pan faster than gameplay
    interval = window.requestAnimationFrame(() => this.tick());
    Canvas.canvas.style.display = "initial";
    document.getElementById("instructions").style.display = "none";
    if(document.getElementById("gameOverScreen")) document.body.removeChild(document.getElementById("gameOverScreen"));
    
    this.platformChoices = [
      new TileChoice("soil"),
      new TileChoice("stone"),
      new TileChoice("lava"),
      new TileChoice("cloud"),
      new TileChoice("rectangularEnemy"),
      new TileChoice("ellipticalEnemy"),
      new TileChoice("coin"),
      new TileChoice("mouse")
    ];
  }

  tick() {
    Canvas.clear();

    //Left Arrow - Pan to the left
    if(Utility.keyPressed(37) && !document.getElementById("elementMenu")) {
      player.x += this.panSpeed;
      Canvas.canvasX -= this.panSpeed;
    }

    //Right Arrow - Pan to the right
    if(Utility.keyPressed(39) && !document.getElementById("elementMenu")) {
      player.x -= this.panSpeed;
      Canvas.canvasX += this.panSpeed;
    }

    //Escape key - Removes current (in-progress) box, or removes element configuration menu
    if(Utility.keyPressed(27)) {
      this.clickX = null;
      this.clickY = null;

      if(document.getElementById("elementMenu")) {
        document.body.removeChild(document.getElementById("elementMenu"));
        this.keepSelected = true;
      }
    }
    
    //Backspace / Delete key - Removes current (in-progress) box
    if((Utility.keyPressed(8) || Utility.keyPressed(46)) && this.selectedElement != null && this.selected === "mouse" && !document.getElementById("elementMenu")) {
      window[this.selectedElement.type].splice(this.selectedElement.index, 1); //Remove selected element
      this.selectedElement = null;
      this.handles = [];
    }
    
    visiblePlatforms = [];
    for(let i = 0; i < platforms.length; i++) {
      platforms[i].render(true);
    }
    
    if(this.selectedElement != null && this.selected === "mouse") { //Element has been selected, draw handles around element
      let platformX = window[this.selectedElement.type][this.selectedElement.index].x;
      let platformY = window[this.selectedElement.type][this.selectedElement.index].y;
      let platformWidth = window[this.selectedElement.type][this.selectedElement.index].width;
      let platformHeight = window[this.selectedElement.type][this.selectedElement.index].height;
      
      this.handles = [];
      
      for(let i = 0; i < 8; i++) {
        this.handles.push(new Handle(platformX, platformY, platformWidth, platformHeight, i));
        this.handles[i].render();
      }
    }
    
    for(let i = 0; i < clouds.length; i++) {
      clouds[i].render();
    }
    
    for(let i = 0; i < enemies.length; i++) {
      enemies[i].render(false);

      Canvas.ctx.strokeStyle = "red";
      Canvas.ctx.setLineDash([5, 15]);
      Canvas.ctx.strokeRect(enemies[i].originalX - Canvas.canvasX, enemies[i].originalY, enemies[i].shapeWidth, enemies[i].shapeHeight);
    }

    for(let i = 0; i < coins.length; i++) {
      coins[i].render();
    }
    
    if(this.clickX) {
      Canvas.ctx.strokeStyle = "black";
      Canvas.ctx.setLineDash([5, 15]);
      Canvas.ctx.strokeRect(this.clickX, this.clickY, this.mouseX - this.clickX, this.mouseY - this.clickY);
    }

    player.render(false);
    TileChoice.renderChoices(this.platformChoices);
    interval = requestAnimationFrame(this.tick.bind(this));
  }

  addPoint(event) { //Adds clicks for platform creation - Modified from http://stackoverflow.com/a/18053642
    let canvasRectangle = Canvas.canvas.getBoundingClientRect();
    let x = event.clientX - canvasRectangle.left;
    let y = event.clientY - canvasRectangle.top;

    for(let i = 0; i < this.platformChoices.length; i++) { //Select platform type
      let tileChoiceX = Canvas.canvas.width - ((this.platformChoices[i].radius) + this.platformChoices[i].spacing) * (i + 1)
      if(Math.sqrt(Math.pow(x - (tileChoiceX + this.platformChoices[i].radius / 2), 2) + Math.pow(y - (this.platformChoices[i].y + this.platformChoices[i].radius / 2), 2)) < this.platformChoices[i].radius / 2) {
        this.selected = this.platformChoices[i].type;
        this.selectedElement = null; //Remove selected element if user has clicked on different tile than mouse
        this.handles = [];
        return; //Should be return and not break - end method if user has clicked on a TileChoice
      }
    }

    if(x < 0 || x > Canvas.canvas.width || y < 0 || y > Canvas.canvas.height) return;
    if(!this.clickX) { //First click
      if(this.selected === "mouse") {
        this.selectedElement = Collision.pointInElement(x, y) ||
          (this.keepSelected ? this.selectedElement : null);
      } else {
        this.clickX = x;
        this.clickY = y;
      }
    } else { //Second click, draw element
      //clickX is first click, mouseX is second click
      let x = Math.min(this.clickX, this.mouseX) + Canvas.canvasX;
      let y = Math.min(this.clickY, this.mouseY);
      let width = Math.abs(this.clickX - this.mouseX);
      let height = Math.abs(this.clickY - this.mouseY);
      
      if(["soil", "stone", "lava"].indexOf(this.selected) > -1) {
        platforms.push(new Platform(x, y, width, height, this.selected));
      } else if(this.selected === "cloud") {
        clouds.push(new Cloud(x, y, width, height));
      } else if(this.selected === "coin") {
        coins.push(new Coin(x, y, width, height));
      } else if(["rectangularEnemy", "ellipticalEnemy"].indexOf(this.selected) > -1) {
        enemies.push(new Enemy(x, y, 50, 50, width, height, this.selected.substring(0, this.selected.length - 5), x, y)); //Substring removes "enemy", trailing x / y parameters are the actual position - update() changes x and y
      }
      this.clickX = null;
      this.clickY = null;
    }
  }

  setMousePosition(event) { //Taken from http://stackoverflow.com/a/18053642
    let canvasRectangle = Canvas.canvas.getBoundingClientRect();
    let x = event.clientX - canvasRectangle.left;
    let y = event.clientY - canvasRectangle.top;
    this.mouseX = x;
    this.mouseY = y;

    if(event.which === 1) { //Mouse is pressed - Check for dragging / resizing of platform
      if(this.selectedElement != null && this.selectedHandle == null) {
        if(Collision.pointInHandle(x, y) || Collision.pointInHandle(x, y) === 0) { //0 (upper left) is coerced to false, explicit check against 0 is necessary
          this.selectedHandle = Collision.pointInHandle(x, y);
        } else { //Dragging platform at current location of mouse, not top right
          if(Collision.pointInElement(x, y) && this.xDistance != null && this.yDistance != null) {
            this.selectedElement.data.x = x - this.xDistance;
            this.selectedElement.data.y = y - this.yDistance;
            if(this.selectedElement.type === "enemies") {
              let data = this.selectedElement.data;
              enemies[this.selectedElement.index] = new Enemy(data.x, data.y, data.width, data.height, data.shapeWidth, data.shapeHeight, data.movementPattern, data.x, data.y);
            }
          } else {
            this.xDistance = x - this.selectedElement.data.x;
            this.yDistance = y - this.selectedElement.data.y;
          }
        }
      } else if(this.selectedElement != null && this.selectedHandle != null) { //Already dragging
        let lowerBound = this.selectedElement.data.y + this.selectedElement.data.height;
        let rightBound = this.selectedElement.data.x + this.selectedElement.data.width - Canvas.canvasX;

        switch(this.selectedHandle) {
          case 0:
            if(x + Canvas.canvasX > rightBound) x = rightBound;
            this.selectedElement.data.width = Math.abs((this.selectedElement.data.width + (this.selectedElement.data.x - Canvas.canvasX)) - x);
            this.selectedElement.data.x = x + Canvas.canvasX;

            if(y > lowerBound) y = lowerBound;
            this.selectedElement.data.y = y;
            this.selectedElement.data.height = Math.abs(this.selectedElement.data.y - lowerBound);

          case 1:
            if(y > lowerBound) y = lowerBound;
            this.selectedElement.data.y = y;
            this.selectedElement.data.height = Math.abs(this.selectedElement.data.y - lowerBound);
            break;

          case 2:
            this.selectedElement.data.width = x - this.selectedElement.data.x + Canvas.canvasX;

            if(y > lowerBound) y = lowerBound;
            this.selectedElement.data.y = y;
            this.selectedElement.data.height = Math.abs(this.selectedElement.data.y - lowerBound);
            break;

          case 3:
            if(x + Canvas.canvasX > rightBound) x = rightBound;
            this.selectedElement.data.width = Math.abs((this.selectedElement.data.width + (this.selectedElement.data.x - Canvas.canvasX)) - x);
            this.selectedElement.data.x = x + Canvas.canvasX;
            break;

          case 4:
            this.selectedElement.data.width = x - this.selectedElement.data.x + Canvas.canvasX;
            break;

          case 5:
            if(x + Canvas.canvasX > rightBound) x = rightBound;
            this.selectedElement.data.width = Math.abs((this.selectedElement.data.width + (this.selectedElement.data.x - Canvas.canvasX)) - x);
            this.selectedElement.data.x = x + Canvas.canvasX;

            this.selectedElement.data.height = y - this.selectedElement.data.y;
            break;

          case 6:
            this.selectedElement.data.height = y - this.selectedElement.data.y;
            break;

          case 7:
            this.selectedElement.data.width = x - this.selectedElement.data.x + Canvas.canvasX;

            this.selectedElement.data.height = y - this.selectedElement.data.y;
            break;
        }

        this.keepSelected = true; //Used to keep handles rendered after a resize - Collision.pointInHandle() returns false
        this.selectedElement.data.width = Math.max(this.selectedElement.data.width, 0); //Stops negative width
        this.selectedElement.data.height = Math.max(this.selectedElement.data.height, 0); //Stops negative height

        if(this.selectedElement.type === "enemies") {
          let data = this.selectedElement.data;
          enemies[this.selectedElement.index] = new Enemy(data.x, data.y, data.width, data.height, data.shapeWidth, data.shapeHeight, data.movementPattern, data.x, data.y);
        }
      }
    } else { //Mouse is not pressed
      this.selectedHandle = null;
      this.keepSelected = false;
      this.xDistance = null;
      this.yDistance = null;
    }
  }

  getPlatformString() {
    let str = "customLevels.push([[";
    let cloudString = "";

    for(let i = 0; i < platforms.length; i++) {
      str += "new Platform(";
      
      for(let key in platforms[i]) {
        if(typeof platforms[i][key] === "number") str += platforms[i][key]  + ",";
        else str += "'" + platforms[i][key]  + "',";
      }
      str = str.substring(0, str.length - 1);
      str += "),";
    }
    str = str.substring(0, str.length - 1); //Remove trailing ","
    str += "], [";
    
    for(let i = 0; i < clouds.length; i++) {
      str += "new Cloud(";
      for(let key in clouds[i]) {
        if(typeof clouds[i][key] === "number") str += clouds[i][key]  + ",";
        else str += "'" + clouds[i][key]  + "',"; //Add quotes around strings
      }
      str = str.substring(0, str.length - 1);
      str += "),";
    }

    if(clouds.length > 0) {
      str = str.substring(0, str.length - 1); //Remove trailing ","
    }
    
    str += "], [";
    for(let i = 0; i < enemies.length; i++) {
      str += "new Enemy(";
      for(let key in enemies[i]) {
        enemies[i].x = enemies[i].originalX; //Reset x value that has been effected by update()
        enemies[i].y = enemies[i].originalY;
        if(["theta", "centerX", "centerY", "originalX", "originalY"].indexOf(key) === -1) { //Ignore properties not needed for the constructor
          if(typeof enemies[i][key] === "number") str += enemies[i][key]  + ",";
          else str += "'" + enemies[i][key]  + "',"; //Add quotes around strings
          
        }
      }
      str = str.substring(0, str.length - 1);
      str += "),";
    }

    if(enemies.length > 0) {
      str = str.substring(0, str.length - 1); //Remove trailing ","
    }

    str += "], [";
    for(let i = 0; i < coins.length; i++) {
      str += "new Coin(";
      for(let key in coins[i]) {
        str += coins[i][key]  + ",";
      }
      str = str.substring(0, str.length - 1);
      str += "),";
    }

    if(coins.length > 0) {
      str = str.substring(0, str.length - 1); //Remove trailing ","
    }
    
    str += "],[new Player(" + player.x + "," + player.y + "," + player.width + "," + player.height + ")";

    str += "]]);";

    return str;
  }
}

document.getElementById("start").addEventListener("click", function(event) {
  levelCreator = null;
  game = new Game(false);
  game.init();
});

document.getElementById("playLevel").addEventListener("click", function(event) {
    levelCreator = null;
    game = new Game(true);
    game.init();
});

document.getElementById("createLevel").addEventListener("click", function(event) {
  levelCreator = new LevelCreator();
  levelCreator.init();
});


window.addEventListener("keydown", (event) => {
  if(!Utility.keyPressed(event.which)) {
    Utility.addKey(event.which);
  }

  //"S" key pressed
  if(Utility.keyPressed(83) && levelCreator) {
    localStorage.setItem("item" + (localStorage.length > 0 ? (+localStorage.key(localStorage.length - 1).substring(4) + 1) : 0), levelCreator.getPlatformString()); //Item key is unimportant, must be unique
    alert("Your level has been saved.");
    Utility.removeKey(83); //S is not automatically removed because of alert
  }
});

window.addEventListener("keyup", (event) => Utility.removeKey(event.which));

//Used with LevelCreator
window.addEventListener("click", (event) => {
  if(levelCreator != null) { //Don't use !==, Stops click of "Create Level" button from triggering platform creation
    if(levelCreator.recieveClicks && !document.getElementById("elementMenu")) {
      levelCreator.addPoint(event);
    } else {
      levelCreator.recieveClicks = true;
    }
  }
});

window.addEventListener("mousemove", (event) => {
  if(levelCreator != null && !document.getElementById("elementMenu")) { //Must be !=, not !==
    levelCreator.setMousePosition(event);
  }
});

window.addEventListener('contextmenu', function(event) {
  let canvasRectangle = Canvas.canvas.getBoundingClientRect();
  let x = event.clientX - canvasRectangle.left;
  let y = event.clientY - canvasRectangle.top;
  if(levelCreator && levelCreator.selectedElement && !document.getElementById("elementMenu")) {
    
    let elementMenu = document.createElement("div");
    elementMenu.id = "elementMenu";
    document.body.appendChild(elementMenu);

    for(let key in levelCreator.selectedElement.data) {
      if(["type", "originalX", "originalY", "theta", "centerX", "centerY", "canJump", "velocityY", "gravityAcceleration", "jumpVelocity", "horizontalMovementSpeed"].indexOf(key) === -1) { //Users cannot edit these properties
        let elementProperty = document.createElement("label");
        elementProperty.className = "elementProperty";
        elementProperty.innerHTML = key + ":";

        document.getElementById("elementMenu").appendChild(elementProperty);

        let elementValue = document.createElement("input");
        elementValue.className = "elementValue";
        elementValue.id = key;
        elementValue.value = levelCreator.selectedElement.data[key];
        elementValue.type = "text";

        document.getElementById("elementMenu").appendChild(elementValue);
        document.getElementById("elementMenu").appendChild(document.createElement("br"));

        elementValue.addEventListener("input", function(event) {
          if(levelCreator.selectedElement.type !== "enemies") levelCreator.selectedElement.data[key] = parseInt(event.target.value) || event.target.value;
          else {
            enemies[levelCreator.selectedElement.index] = new Enemy(
              parseInt(document.getElementById("x").value),
              parseInt(document.getElementById("y").value), 
              parseInt(document.getElementById("width").value),
              parseInt(document.getElementById("height").value),
              parseInt(document.getElementById("shapeWidth").value),
              parseInt(document.getElementById("shapeHeight").value),
              document.getElementById("movementPattern").value,
              parseInt(document.getElementById("x").value),
              parseInt(document.getElementById("y").value)
            );
          }
        });
      }
    }

    let button = document.createElement("button");
    button.id = "exitButton";
    button.innerHTML = "OK";
    document.getElementById("elementMenu").appendChild(button);

    button.addEventListener("click", function(event) {
      document.body.removeChild(document.getElementById("elementMenu"));
      levelCreator.keepSelected = true;
    });
    event.preventDefault();
  }
});