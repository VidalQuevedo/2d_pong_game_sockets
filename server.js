var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;
var	state;

// Middleware
app.use(express.static('public'));

// Routes
app.get('/', function(res, res) {
	res.sendFile(__dirname + '/index.html');
});

// Start server
http.listen(port, function(){
	console.log('Listening in ' + port + '...');
});

// init game
init();



////////////////////

function ballCollisionDetection() {
	var ball = state.ball;
	var canvas = state.canvas;

	// ceiling and floor
	if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
		ball.dy = -ball.dy;
	}

	// left / right walls
	if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
		ball.dx = -ball.dx;
	}
}

function getPlayer(clientId) {
	return state.players.find(function(player) {
		return player.id === clientId;
	});
}

function handleKeyDown(clientId, keyCode) {
	var player = getPlayer(clientId);
	var side = player.side;
	var paddle = (side === 'right') ? state.paddleRight : state.paddleLeft;

	if (keyCode === 38) {
		paddle.y -= 7;
	} else if (keyCode === 40) {
		paddle.y += 7;
	}

}

function handleKeyUp(clientId, keyCode) {
	console.log('keyup', clientId, keyCode);
}

function init() {
	
	// On connection
	io.on('connection', function(socket) {
		
		io.clients(function(error, clients) {
			
			if (error) throw error;
			
			// init state object if first one to connect
			if (clients.length === 1 && !state) {
				setState();
				setInterval(refresh, 10);	
			}

			// set player
			setPlayer(socket);

		});

		// on keypress
		socket.on('keypress', function(eventType, keyCode) {
			var clientId = socket.client.id;	

			// check if valid player
			if (!getPlayer(clientId)) return;

			if (eventType === 'keydown') {
				handleKeyDown(clientId, keyCode);
			} else if (eventType === 'keyup') {
				handleKeyUp(clientId, keyCode);
			}
		});

		socket.on('disconnect', function() { 
			removePlayer(socket);
		});
	});



	
}

function moveBall() {
	var ball = state.ball;
	ball.x += ball.dx;
	ball.y += ball.dy;
}

function refresh() {
	moveBall();
	ballCollisionDetection();
	io.emit('refresh', state);	
}

function removePlayer(socket) {
	var clientId = socket.client.id;
	var index = state.players.findIndex(function(player) {
		return player.id === clientId;
	});
	state.players.splice(index, 1);
}

function setPlayer(socket) {
	var player = {id: socket.client.id, score: 0, side: null};
	var players = state.players;
	if (players.length === 0) {
		player.side = 'left';
	} else if (players.length === 1) {
		player.side = (players[0].side === 'left') ? 'right' : 'left';
	} else if (players.length === 2) {
		return;
	}

	if (players.length < 2) {
		players.push(player);
	}
}

function setState() {
	
	var canvas = {
		height: 300,
		width: 400		
	};
	
	var paddle = {
		width: 10,
		height: 70,
		dy: 7
	}

	state = {
		ball: {
			x: 150,
			y: 200,
			radius: 10,
			dx: 2,
			dy: -2
		},
		canvas: canvas,
		paddleRight: { // consider creating constructor function and instantiate it
			x: canvas.width - paddle.width,
			y: (canvas.height - paddle.height) / 2,
			height: paddle.height,
			width: paddle.width
		},
		paddleLeft: {
			x: 0,
			y: (canvas.height - paddle.height) / 2,
			height: paddle.height,
			width: paddle.width			
		},
		players: []
	};
}
