var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };


var step = function() {
	update();
	render();
	animate(step);
};

var update = function() {
	player1.update();
	ball.update(player1.paddle, player2.paddle);

};

var render = function() {
	context.fillStyle = "#000";
	context.fillRect(0, 0, width, height);
	player1.render();
	player2.render();
	ball.render();
};


var canvas = document.createElement('canvas');
var width = 800;
var height = 500;

canvas.width = width;
canvas.height = height;

var context = canvas.getContext('2d');


window.onload = function() {
  document.body.appendChild(canvas);
  animate(step);
};



function Paddle(x, y, dy){
	this.x = x;
	this.y = y;
	this.width = 5;
	this.height = 50;
	this.dy = 0;
}

Paddle.prototype.render = function() {
  context.fillStyle = "#fff";
  context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  this.dy = y;
  if(this.y < 0) { // all the way to the left
    this.y = 0;
    this.dy = 0;
  } else if (this.y + 50 > 500) { // all the way to the right
    this.y = 500 - 50;
    this.dy = 0;
  }
};

function ball(x, y, dx, dy){
	this.x = x;
	this.y = y;
	this.radius = 5;
	this.dx = 5;
	this.dy = 2;
}

ball.prototype.render = function() {
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = "#fff";
  context.fill();
};

ball.prototype.update = function(paddle1, paddle2) {
	this.x += this.dx;
	this.y += this.dy;
};


function Player1() {
	this.paddle = new Paddle(15,225,0);
};

function Player2() {
	this.paddle = new Paddle(780,225,0);
};	

Player1.prototype.render = function() {
  this.paddle.render();
};

Player2.prototype.render = function() {
  this.paddle.render();
};

Player1.prototype.update = function() {
  for(var key in keysDown) {
    var value = Number(key);
    if(value == 38) { // left arrow
      this.paddle.move(0, -10);
    } else if (value == 40) { // right arrow
      this.paddle.move(0, 10);
    } else {
      this.paddle.move(0, 0);
    }
  }
};



var player1 = new Player1();
var player2 = new Player2()
var ball = new ball(400, 200, 0, 0);

var keysDown = {};

window.addEventListener("keydown", function(event) {
	keysDown[event.keyCode] = true;
});
window.addEventListener("keyup", function(event) {
  delete keysDown[event.keyCode];
});