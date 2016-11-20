var DEBUG = true;

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res){
	res.sendFile(__dirname+'/client/index.html');
});

app.use('/client', express.static(__dirname+'/client'));

serv.listen(4200);
console.log('Server Initialized');

var numPlayers = 0;
var players = {};
var ball = {};
var height = 500, width = 800;
var paddleH =  50;
var state = "waiting"

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket){
	numPlayers += 1;
	if (numPlayers<3){
		socket.id = numPlayers-1;
		console.log("player connection");

		players[socket.id] = {
			id: socket.id,
			y: 50
		};

		socket.emit("connection", players[socket.id]);

		socket.on('input', function(data){
			if (players[socket.id] + data.y >= paddleH && players[socket.id] + data.y <= height-paddleH)
				players[socket.id].y += data.y;
		});

		socket.on('disconnect', function(){
			numPlayers -= 1;
			delete SOCKET_LIST[socket.id];
			console.log(socket.id.toString().substring(0,5)+" disconncted");
		});

		socket.on('sendCmdToServer', function(data){
			if (!DEBUG) 
				return;
			var res = eval(data);
			socket.emit('addToConsole', res);
		});
	}

	if (numPlayers==2){
		state = "playing"
		ball = {
			x: 50,
			y: 50,
			vx: 50*(Math.random()>0.5 ? 1:-1),
			vy: 0,
		}

		socket.emit("ballInit", ball);
	}
});

setInterval(function(){
	//left player (0) 
	if (ball.x <= 20){
		if (ball.y >= players[0].y-paddleH/2 && ball.y <= players[0].y+paddleH/2){
			var relativeIntersectY = players[0].y - ball.y;
			var normalizedRelativeIntersectionY = (relativeIntersectY/(paddleH/2));
			var bounceAngle = normalizedRelativeIntersectionY * 75;
			ball.vx = 50*Math.cos(bounceAngle);
			ball.vy = 50*-Math.sin(bounceAngle);
		}
		else
			state = "done";
	}

	else if (ball.x >= width-20){
		if (ball.y >= players[1].y-paddleH/2 && ball.y <= players[1].y+paddleH/2){
			var relativeIntersectY = players[1].y - ball.y;
			var normalizedRelativeIntersectionY = (relativeIntersectY/(paddleH/2));
			var bounceAngle = normalizedRelativeIntersectionY * 75;
			ball.vx = 50*Math.cos(bounceAngle);
			ball.vy = 50*-Math.sin(bounceAngle);
		}
		else
			state = "done";
	}

	else if (ball.y <=5 || ball.y>=height-5){
		ball.vy *= -1;
	}

	ball.x += ball.vx;
	ball.y += ball.vy;

	socket.emit("update", {
		state : state,
		p1 : players[0],
		p2 : players[1],
		ball : ball
	});
}, 10);