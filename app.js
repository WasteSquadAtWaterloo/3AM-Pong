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

var SOCKET_LIST = {};
var numPlayers = 0;
var players = {};
var ball = {};
var height = 500, width = 800;
var paddleH =  50;
var state = "waiting";
var ballSpeed = 3;

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket){
	numPlayers += 1;
	if (numPlayers<3){
		socket.id = numPlayers-1;
		console.log("player connection");
		SOCKET_LIST[socket.id] = socket;

		players[socket.id] = {
			id: socket.id,
			y: height/2,
			ready: 1
		};

		socket.emit("joined", players[socket.id]);
		

		socket.on('input', function(data){
			console.log(players[socket.id], data.y);
			if (players[socket.id].y + data.y >= paddleH/2 && players[socket.id].y + data.y <= height-paddleH/2)
				players[socket.id].y += data.y;
		});

		socket.on('disconnect', function(){
			console.log("disconnect");
			numPlayers -= 1;
			delete SOCKET_LIST[socket.id];
		});

		socket.on('sendCmdToServer', function(data){
			if (!DEBUG) 
				return;
			var res = eval(data);
			socket.emit('addToConsole', res);
		});
	}

	if (numPlayers==2){
		state = "playing";
		ball = {
			x: width/2,
			y: height/2,
			vx: ballSpeed*(Math.random()>0.5 ? 1:-1),
			vy: 0,
		};

		console.log("BALLINIT");
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
			ball.vx = ballSpeed*Math.cos(bounceAngle);
			ball.vy = ballSpeed*-Math.sin(bounceAngle);
		}
		else
			state = "done";
	}

	else if (ball.x >= width-20){
		if (ball.y >= players[1].y-paddleH/2 && ball.y <= players[1].y+paddleH/2){
			var relativeIntersectY = players[1].y - ball.y;
			var normalizedRelativeIntersectionY = (relativeIntersectY/(paddleH/2));
			var bounceAngle = normalizedRelativeIntersectionY * 75;
			ball.vx = ballSpeed*Math.cos(bounceAngle);
			ball.vy = ballSpeed*-Math.sin(bounceAngle);
		}
		else
			state = "done";
	}

	else if (ball.y <=5 || ball.y>=height-5){
		ball.vy *= -1;
	}

	ball.x += ball.vx;
	ball.y += ball.vy;

	for (var i in SOCKET_LIST){
		socket = SOCKET_LIST[i];
		if (players[i] && players[i].ready){
			socket.emit("update", {
				state : state,
				players : players,
				ball : ball
			});
		}
	}


}, 10);