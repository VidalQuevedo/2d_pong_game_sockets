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

function init() {
	
	// On connection
	io.on('connection', function(socket) {
		io.clients(function(error, clients) {
			if (error) throw error;
			if (clients.length === 1 && !state) {
				setState();
				setInterval(refresh, 10);	
			}
		});
	});

	// On 
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

function setState() {
	
	var canvas = {
		height: 300,
		width: 400		
	};
	
	var paddle = {
		width: 10,
		height: 70,
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
		}
	};
}
