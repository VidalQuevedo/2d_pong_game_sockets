var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;
var	state = {
	ball: {
		x: 250,
		y: 250,
		radius: 10,
		dx: 2,
		dy: -2
	},
	canvas: {
		height: 500,
		width: 500
	}
};

// Middleware
app.use(express.static('public'));

// Routes
app.get('/', function(res, res) {
	res.sendFile(__dirname + '/index.html');
});

// Socket event handling
io.on('connection', function(socket) {
	io.clients(function(error, clients) {
		if (error) throw error;
		if (clients.length === 1) {
			setInterval(function(){
				moveBall();
				ballCollisionDetection();
				io.emit('refresh', state);
			}, 10);	
		}
	});
});



// Start server
http.listen(port, function(){
	console.log('Listening in ' + port + '...');
});


////////////////////

function ballCollisionDetection() {
	// ceiling and floor
	var ball = state.ball;
	var canvas = state.canvas;
	if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
		ball.dy = -ball.dy;
	}
}

function moveBall() {
	// state.ballX += state.dx;
	var ball = state.ball;
	ball.y += ball.dy;
}
