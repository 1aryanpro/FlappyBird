// Menu, New Game, Playing Game, Game Over, Consmetics
let gameState = 0;
let game;
let score = 0;
let highScore = 0;
let points = 0;

let pipes = [],
  birds = [];
let bg,
  bgPos = 0;
let pipeRatio = 180 / 1700,
  bgRatio;
let selectedSkin,
  unlockedSkins = [true, false, false, false];

function updateImages(cosmetic = 'base') {
  pipes[0] = loadImage(`./${cosmetic}/PipeUp.png`);
  pipes[1] = loadImage(`./${cosmetic}/PipeDown.png`);
  birds[0] = loadImage(`./${cosmetic}/Bird1.png`);
  birds[1] = loadImage(`./${cosmetic}/Bird2.png`);
  birds[2] = loadImage(`./${cosmetic}/Bird3.png`);
  bg = loadImage(`./${cosmetic}/Background.png`);

  switch (cosmetic) {
    case 'base':
      pipeRatio = 180 / 1770;
      bgRatio = 480 / 396;
      break;
    case 'swamp':
      pipeRatio = 180 / 1760;
      bgRatio = 480 / 344;
      break;
  }

  selectedSkin = cosmetic;
}

function setup() {
  createCanvas(700, 700, P2D);
  noStroke();

  textAlign(CENTER, CENTER);
  updateImages('swamp');
}

function draw() {
  background(200);

  switch (gameState) {
    case 0:
      menu();
      break;
    case 1:
      game = new Game();
      break;
    case 2:
      game.run();
      break;
    case 3:
      gameOver();
      break;
    case 4:
      cosmetics();
      break;
  }
}

function menu() {
  background('lightgreen');

  rectMode(CORNER);
  fill('darkgreen');
  let btnw = 200;
  let btnh = 80;
  rect(width / 2 - btnw / 2, height / 2, btnw, btnh);
  rect(width / 2 - btnw / 2, height * 0.7, btnw, btnh);

  fill(255);
  textStyle(NORMAL);
  textSize(btnh * 0.4);
  textAlign(CENTER, CENTER);
  text('Play Game', width / 2, height / 2 + btnh / 2);
  text('Buy Skins', width / 2, height * 0.7 + btnh / 2);
  fill(0);
  textSize(60);
  text('Flappy Bird!', width / 2, height / 4);
  textSize(40);
  text('High Score: ' + highScore, width / 2, (height * 3) / 8);
  textAlign(LEFT, CENTER);
  textSize(20);
  text(points + ' points', 20, 30);
}

function gameOver() {
  background('lightgreen');

  rectMode(CORNER);
  fill('darkgreen');
  let btnw = 200;
  let btnh = 80;
  rect(width / 2 - btnw / 2, height / 2, btnw, btnh);
  rect(width / 2 - btnw / 2, height * 0.7, btnw, btnh);

  fill(255);
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  textSize(btnh * 0.4);
  text('Play Again', width / 2, height / 2 + btnh / 2);
  text('Main Menu', width / 2, height * 0.7 + btnh / 2);
  fill(0);
  textSize(60);
  text(score, width / 2, height / 4);
  textSize(40);
  text('High Score: ' + highScore, width / 2, (height * 3) / 8);
  textAlign(LEFT, CENTER);
  textSize(20);
  text(points + ' points', 20, 30);

  highScore = max(highScore, score);
}

function cosmetics() {
  background('lightgreen');

  fill('darkgreen');
  rect(0, 0, width, 60);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text('Back to Main Menu', width / 2, 30);

  fill(0)
  textSize(40)
  text('Select Cosmetics', width / 2, height / 6);

  cosSize = 150;
  fill('darkgreen')
  square(width/2 - cosSize - 10, height * 0.6 - cosSize - 10, cosSize)
  square(width/2 + 10, height * 0.6 - cosSize - 10, cosSize)
  square(width/2 - cosSize - 10, height * 0.6 + 10, cosSize)
  square(width/2 + 10, height * 0.6 + 10, cosSize)
}

function mousePressed() {
  if (gameState == 0) {
    if (mouseY < height * 0.65) gameState = 1;
    else gameState = 4;
  }

  if (gameState == 3) {
    if (mouseY < height * 0.65) gameState = 1;
    else gameState = 0;
  }

  if (gameState == 4) {
    if (mouseY < 60) gameState = 0;
  }
}

class Game {
  constructor() {
    score = 0;

    this.bird = new Bird();

    this.pipes = [new Pipe()];
    this.pipes[0].x = width + 200;

    gameState = 2;
  }

  run() {
    bgPos -= (Pipe.speed * deltaTime) / 5000;
    if (bgPos < -height * bgRatio) bgPos += height * bgRatio;

    image(bg, bgPos, 0, height * bgRatio, height);
    image(bg, bgPos + height * bgRatio, 0, height * bgRatio, height);

    this.bird.move();
    if (this.bird.y < this.bird.size || this.bird.y > height - this.bird.size)
      gameState++;

    if (this.pipes[0].x < width - 300) {
      let prevy = this.pipes[0].y;
      let variance = 300;
      let margin = 100;
      let newY = random(
        max(prevy - variance, margin),
        min(prevy + variance, height - margin)
      );
      this.pipes.unshift(new Pipe(newY));
    }

    this.pipes.forEach((pipe, i) => {
      if (pipe.x + pipe.w / 2 < this.bird.x && !pipe.crossed) {
        pipe.crossed = true;
        score++;
        points += floor(score / 10) + 1;
      }

      if (pipe.move()) this.pipes.length = i;
      pipe.display();

      if (pipe.checkCollison(this.bird)) gameState++;
    });

    this.bird.display();

    textAlign(CENTER, CENTER);
    fill(255);
    textStyle(BOLD);
    textSize(60);
    strokeWeight(3);
    stroke(0);
    text(score, width / 2, 50);

    noStroke();
    textAlign(LEFT, CENTER);
    textSize(20);
    text(points + ' points', 20, 30);
  }

  keyPressed() {
    if (keyCode == 32) this.bird.vel = -6;
  }
}

class Bird {
  constructor() {
    this.x = 250;
    this.y = (height * 3) / 7;
    this.vel = 0;
    this.acc = 0;
    this.size = 14;
  }

  move() {
    this.acc += (12 * deltaTime) / 1000;

    this.vel += this.acc;
    this.y += this.vel;
    this.acc = 0;
  }

  addForce(force) {
    this.acc += force;
  }

  display() {
    push();
    translate(this.x, this.y);

    let r = atan((this.vel * Pipe.speed) / 300);
    rotate(0.8 + r);

    image(
      r > -0.2 ? (r > 0.1 ? birds[0] : birds[1]) : birds[2],
      -this.size * 1.3,
      -this.size * 1.3,
      this.size * 2.6,
      this.size * 2.6
    );

    // display hitbox
    // fill(255, 0, 255, 50);
    // circle(0, 0, this.size * 2);

    pop();
  }
}

class Pipe {
  static speed = 150;

  constructor(y = height / 2, h = 140) {
    this.w = 80;
    this.h = h / 2;
    this.x = width + this.w / 2;
    this.y = y;

    this.crossed = false;
  }

  move() {
    this.x -= (Pipe.speed * deltaTime) / 1000;
    if (this.x < -this.w / 2) return true;
    return false;
  }

  display() {
    if (this.x < -this.w / 2) return;

    rectMode(CORNERS);
    fill('lightgreen');
    let startx = this.x - this.w / 2;
    let stopx = this.x + this.w / 2;
    let starty = this.y - this.h;
    let stopy = this.y + this.h;

    image(pipes[0], startx, stopy, this.w, this.w / pipeRatio);
    image(
      pipes[1],
      startx,
      this.y - this.h - this.w / pipeRatio,
      this.w,
      this.w / pipeRatio
    );
    // rect(startx, 0, stopx, starty);
    // rect(startx, height, stopx, stopy);
  }

  checkCollison(bird) {
    let startx = this.x - this.w / 2;
    let stopx = this.x + this.w / 2;
    let starty = this.y - this.h;
    let stopy = this.y + this.h;

    let testX = min(max(bird.x, startx), stopx);

    let testY =
      bird.y < this.y
        ? min(max(bird.y, 0), starty)
        : min(max(bird.y, stopy), height);

    return dist(testX, testY, bird.x, bird.y) <= bird.size;
  }
}

function keyPressed() {
  if (gameState == 2) game.keyPressed();
}
