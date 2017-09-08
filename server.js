var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;
var refreshInterval;
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
	var paddleLeft = state.paddleLeft;
	var paddleRight = state.paddleRight;
	var playerLeft = state.playerLeft;
	var playerRight = state.playerRight;

	// ceiling and floor
	if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
		ball.dy = -ball.dy;
	}

	// paddleLeft
	if (ball.x - ball.radius < paddleLeft.x + paddleLeft.width) {
		if (ball.y > paddleLeft.y && ball.y < paddleLeft.y + paddleLeft.height) {
			ball.dx = -ball.dx;
		} else {
			playerRight.score++;
			checkGameStatus();
		}
	}

	// paddleRight
	if (ball.x + ball.radius > paddleRight.x) {
		if (ball.y > paddleRight.y && ball.y < paddleRight.y + paddleRight.height) {
			ball.dx = -ball.dx;
		} else {
			playerLeft.score++;
			checkGameStatus();
		}
	}

}

function checkGameStatus() {
	var playerLeft = state.playerLeft;
	var playerRight = state.playerRight;

	if (playerLeft.score === 3) {
		state.winner = playerLeft;
	}
	if (playerRight.score === 3) {
		state.winner = playerRight;
	}
	
	startNewRound();		
}

function handleKeyDown(clientId, keyCode) {
	var player = getPlayer(clientId);
	var side = player.side;
	var paddle = (side === 'right') ? state.paddleRight : state.paddleLeft;

	if (keyCode === 38) {
		paddle.upPressed = true;
	} else if (keyCode === 40) {
		paddle.downPressed = true;
	}
}

function handleKeyUp(clientId, keyCode) {
	var player = getPlayer(clientId);
	var side = player.side;
	var paddle = (side === 'right') ? state.paddleRight : state.paddleLeft;

	if (keyCode === 38) {
		paddle.upPressed = false;
	} else if (keyCode === 40) {
		paddle.downPressed = false;
	}
}

function init() {
	
	// On connection
	io.on('connection', function(socket) {
		
		io.clients(function(error, clients) {
			
			if (error) throw error;
			
			// init state object if first one to connect
			if (clients.length === 1 && !state) {
				setState();
				refreshInterval = setInterval(refresh, 10);	
			}

			// set player
			setPlayer(socket);

		});

		// on keypress
		socket.on('keypress', function(eventType, keyCode) {
			var clientId = socket.client.id;	

			// check if valid player
			if (!getPlayer(clientId)) return;

			// choose handler
			if (eventType === 'keydown') {
				handleKeyDown(clientId, keyCode);
			} else if (eventType === 'keyup') {
				handleKeyUp(clientId, keyCode);
			}

		});

		// on socket disconnect
		socket.on('disconnect', function() { 
			var clientId = socket.client.id;
			
			// check if valid player
			if (!getPlayer(clientId)) return;
			
			// remove player
			removePlayer(clientId);

		});
	});

}

function getPlayer(clientId) {
	var players = [state.playerLeft, state.playerRight];
	var player = players.find(function(player) {
		return player.id === clientId;
	});
	return player;
}

function moveBall() {
	var ball = state.ball;
	ball.x += ball.dx;
	ball.y += ball.dy;
}

function movePaddles() {
	var paddleLeft = state.paddleLeft;
	var paddleRight = state.paddleRight;
	var canvas = state.canvas;

	// left paddle
	if (paddleLeft.upPressed && paddleLeft.y > 0) {
		paddleLeft.y -= 7;
	} else if(paddleLeft.downPressed && paddleLeft.y + paddleLeft.height < canvas.height) {
		paddleLeft.y += 7;
	}
	
	// right paddle
	if (paddleRight.upPressed && paddleRight.y > 0) {
		paddleRight.y -= 7;
	} else if(paddleRight.downPressed && paddleRight.y + paddleRight.height < canvas.height) {
		paddleRight.y += 7;
	}

}

function refresh() {
	if (state.winner) {
		io.emit('gameOver', state.winner);
		clearInterval(refreshInterval);
		// setState();
	} else {
		moveBall();
		ballCollisionDetection();
		movePaddles();
		io.emit('refresh', state);			
	}
}

function removePlayer(clientId) {
	var player = getPlayer(clientId);
	player.id = null;
	player.score = 0;
}

function setPlayer(socket) {
	var playerLeft = state.playerLeft;
	var playerRight = state.playerRight;

	if (playerLeft.id === null && playerRight.id === null) {
		playerLeft.id = socket.client.id;
	} else if (playerLeft.id === null && playerRight.id !== null) {
		playerLeft.id = socket.client.id;
	} else if (playerLeft.id !== null && playerRight.id === null) {
		playerRight.id = socket.client.id;
	}
}

function setState() {
	
	var canvas = {
		height: 600,
		width: 800		
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
		paddleRight: {
			x: canvas.width - paddle.width,
			y: (canvas.height - paddle.height) / 2,
			height: paddle.height,
			width: paddle.width,
			upPressed: false,
			downPressed: false
		},
		paddleLeft: {
			x: 0,
			y: (canvas.height - paddle.height) / 2,
			height: paddle.height,
			width: paddle.width,
			upPressed: false,
			downPressed: false			
		},
		playerLeft: {
			id: null, 
			score: 0, 
			side: 'left'
		},
		playerRight: {
			id: null, 
			score: 0, 
			side: 'right'
		},
		round: 0,
		winner: null
	};
}


function startNewRound() {
	var ball = state.ball;
	var canvas = state.canvas;
	var round = state.round;
	
	round++;
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.dx = -ball.dx;
	ball.dy = -ball.dy;

	console.log(state);

		// increase speed
		// if (roundCount % 3 === 0) {
		// 	dx = (dx < 0) ? dx - 0.5 : dx + 0.5;
		// 	dy = (dy < 0) ? dy - 0.5 : dy + 0.5;
		// }
	}
