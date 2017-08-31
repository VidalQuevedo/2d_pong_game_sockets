(function(){
	
	'use strict';

	var socket = io();
	var canvas = document.getElementById('2d-pong-game-sockets');
	canvas.width = 500;
	canvas.height = 500;

	var state = {};
	var ctx = canvas.getContext('2d');

	init();

	////////////////////



	function draw() {
		clearCanvas();
		drawBall();
	}

	function drawBall() {
		ctx.beginPath();
		ctx.arc(state.ballX, state.ballY, 10, 0, Math.PI * 2);
		ctx.fillStyle = '#000000';
		ctx.fill();
		ctx.closePath();
	}

	function clearCanvas() {
		ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);	
	}

	function init() {
		setSocketEventHandlers();
	}

	function setSocketEventHandlers() {
		socket.on('refresh', function(data) {
			state = data;
			draw();
		});
	}
	
})();