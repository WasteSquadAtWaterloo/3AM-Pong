socket = io();

var state;
var paddleH = 50;
var players = {};
var selfId;
var circle;


socket.on("joined", function(data){
  console.log("CONNECT"); console.log(data);
  selfId = data.id;

  var x;
  if (selfId ==0 ) x = 15;
  else x = 780;
  players[data.id] = new Paddle(x, data.y-paddleH/2);
  players[data.id==0 ? 1 : 0] = new Paddle((x==15 ? 780 : 15), data.y-paddleH/2);
  console.log(players);
  
});

socket.on("update", function(data){
  //console.log("update"); console.log(data.players);
  //console.log(data.ball);
  if (data.players[0] && data.players[0].y) players[0].y = data.players[0].y; 
  if (data.players[1] && data.players[1].y) players[1].y = data.players[1].y; 
  if (data.ball.x && data.ball.y && circle) {
    circle.x = data.ball.x; 
    circle.y = data.ball.y;
  }
});

var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

socket.on("ballInit", function(data){
  console.log("BALL"); console.log(data);
  circle = new ball(data.x, data.y);
});

var step = function() {
  sendInput();
	render();
	animate(step);
};

var render = function() {
  //console.log(circle);
	context.fillStyle = "#000";
	context.fillRect(0, 0, width, height);
  if (players[0] && players[1]){
  	players[0].render();
  	players[1].render();
  }
	if (circle)
    circle.render();
};


var canvas = document.createElement('canvas');
var width = 800;
var height = 500;

canvas.width = width;
canvas.height = height;

var context = canvas.getContext('2d');


window.onload = function() {
  socket.emit("ready", null);
  document.body.appendChild(canvas);
  animate(step);
};



function Paddle(x, y){
	this.x = x;
	this.y = y;
	this.width = 5;
	this.height = 50;
}

Paddle.prototype.render = function() {
  context.fillStyle = "#fff";
  context.fillRect(this.x, this.y, this.width, this.height);
};

function ball(x, y){
	this.x = x;
	this.y = y;
	this.radius = 5;
}

ball.prototype.render = function() {
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = "#fff";
  context.fill();
};

var sendInput = function(){
  for(var key in keysDown) {
    var value = Number(key);
    if(value == 38) { // left arrow
      socket.emit("input", {y:-5});
    } 
    else if (value == 40) { // right arrow
      socket.emit("input", {y:5});
    }
  }
}

var keysDown = {};

window.addEventListener("keydown", function(event) {
	keysDown[event.keyCode] = true;
});
window.addEventListener("keyup", function(event) {
  delete keysDown[event.keyCode];
});



socket.on('addToConsole', function(data){
  console.log(data);
});
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');
chatForm.onsubmit = function(e){
  e.preventDefault(); 
  socket.emit('sendCmdToServer', chatInput.value);  
}