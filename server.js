var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;
var	state = {
		ballX: 250,
		ballY: 250,
		ballRadius: 10,
		canvasHeight: 500,
		canvasWidth: 500,
		dx: 2,
		dy: -2
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
		console.log(clients.length);
		if (clients.length === 1) {
			setInterval(function(){
				moveBall();
				ballCollisionDetection();
				io.emit('refresh', state);
				console.log(state);
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
	if (state.ballY - state.ballRadius < 0 || state.ballY + state.ballRadius > state.canvasHeight) {
		state.dy = -state.dy;
	}
}

function moveBall() {
	// state.ballX += state.dx;
	state.ballY += state.dy;
}
