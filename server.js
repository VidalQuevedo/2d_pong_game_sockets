var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;

// Middleware
app.use(express.static('public'));

// Routes
app.get('/', function(res, res) {
	res.sendFile(__dirname + '/index.html');
});

// Socket event handling
io.on('connection', function(socket) {
	console.log('a user connected');
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
});

// Start server
http.listen(port, function(){
	console.log('Listening in ' + port + '...');
});