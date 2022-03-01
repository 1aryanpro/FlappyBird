// Menu, New Game, Playing Game, Game Over
let gameState = 0;
let game;
let points = 0;

function setup() {
  createCanvas(700, 700, P2D);
  noStroke();

  textAlign(CENTER, CENTER);
}

function draw() {
  background(200);

  switch (gameState) {
    case 0:
      menu();
      break;
    case 1:
      game = new Game();
      gameState++;
      break;
    case 2:
      game.run();
      break;
    case 3:
      gameOver();
      break;
  }
}

function menu() {
  fill(0);
  text('Flappy Bird\nClick to Play', width / 2, height / 2);
}

function gameOver() {
  fill(0);
  text('Oof Game Over\nClick to Restart\n\nPoints: ' + points, width / 2, height / 2);
}

function mousePressed() {
  if (gameState == 0) {
    gameState = 1;
  }

  if (gameState == 3) {
    gameState = 1;
  }
}

class Game {
  constructor() {
    points = 0;

    this.bird = new Bird();

    this.pipes = [new Pipe()];
    this.pipes[0].x = width + 300;
  }

  run() {
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
      if (pipe.x + pipe.w/2 < this.bird.x && !pipe.crossed) {
        pipe.crossed = true;
        points++;
      }

      if (pipe.move()) this.pipes.length = i;
      pipe.display();

      if (pipe.checkCollison(this.bird)) gameState++;
    });

    this.bird.display();

    textAlign(CENTER, CENTER);
    fill(0);
    textStyle(BOLD);
    textSize(40);
    text(points, width / 2, 50);
  }

  keyPressed() {
    if (keyCode == 32) this.bird.vel = -5;
  }
}

class Bird {
  constructor() {
    this.x = 250;
    this.y = (height * 3) / 7;
    this.vel = 0;
    this.acc = 0;
    this.size = 16;
  }

  move() {
    this.acc += 0.15;

    this.vel += this.acc;
    this.y += this.vel;
    this.acc = 0;
  }

  addForce(force) {
    this.acc += force;
  }

  display() {
    fill('yellow');
    circle(this.x, this.y, this.size * 2);
  }
}

class Pipe {
  static speed = 3;

  constructor(y = height / 2, h = 140) {
    this.w = 80;
    this.h = h / 2;
    this.x = width + this.w / 2;
    this.y = y;

    this.crossed = false;
  }

  move() {
    this.x -= Pipe.speed;
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
    rect(startx, 0, stopx, starty);
    rect(startx, height, stopx, stopy);
  }

  checkCollison(bird) {
    let startx = this.x - this.w / 2;
    let stopx = this.x + this.w / 2;
    let starty = this.y - this.h;
    let stopy = this.y + this.h;
    
    let testX = min(max(bird.x, startx), stopx);

    let testY = bird.y < this.y ? min(max(bird.y, 0), starty) : min(max(bird.y, stopy), height);

    return dist(testX, testY, bird.x, bird.y) <= bird.size;
  }
}

function keyPressed() {
  if (gameState == 2) game.keyPressed();
}
