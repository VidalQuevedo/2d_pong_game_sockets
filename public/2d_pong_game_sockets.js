(function(){
	
	'use strict';

	var socket = io();
	var canvas = document.getElementById('2d-pong-game-sockets-canvas');
	canvas.width = 400;
	canvas.height = 300;

	var state = {};
	var ctx = canvas.getContext('2d');

	init();

	////////////////////

	function addEventListeners() {
		document.addEventListener('keydown', handleKeyPress, false);
		document.addEventListener('keyup', handleKeyPress, false);
	}

	function draw() {
		clearCanvas();
		drawBall();
		drawPaddles();
	}

	function drawBall() {
		var ball = state.ball;
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
		ctx.fillStyle = '#000000';
		ctx.fill();
		ctx.closePath();
	}

	function drawPaddles() {
		
		var paddleRight = state.paddleRight;
		ctx.beginPath();
		ctx.rect(paddleRight.x, paddleRight.y, paddleRight.width, paddleRight.height);
		ctx.fillStyle = '#000000';
		ctx.fill();
		ctx.closePath();

		var paddleLeft = state.paddleLeft;
		ctx.beginPath();
		ctx.rect(paddleLeft.x, paddleLeft.y, paddleLeft.width, paddleLeft.height);
		ctx.fillStyle = '#000000';
		ctx.fill();
		ctx.closePath();

	}

	function clearCanvas() {
		var canvas = state.canvas;
		ctx.clearRect(0, 0, canvas.width, canvas.height);	
	}

	function handleKeyPress(event) {
		var keyCode = event.keyCode;
		var eventType = event.type;
		
		if ([38, 40].indexOf(keyCode) === -1) return;
		socket.emit('keypress', eventType, keyCode);
	}

	function init() {
		addEventListeners();
		setSocketEventHandlers();
	}

	function setSocketEventHandlers() {
		socket.on('refresh', function(data) {
			state = data;
			draw();
		});
	}
	
})();