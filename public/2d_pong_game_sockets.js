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

	function clearCanvas() {
		var canvas = state.canvas;
		ctx.clearRect(0, 0, canvas.width, canvas.height);	
	}	

	function draw() {
		clearCanvas();
		drawBall();
		drawNetLine();
		drawPaddles();
		drawScores();
	}

	function drawBall() {
		var ball = state.ball;
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
		ctx.fillStyle = '#000000';
		ctx.fill();
		ctx.closePath();
	}

	function drawNetLine() {
		var canvas = state.canvas;
		ctx.beginPath();
		ctx.setLineDash([10, 10]);
		ctx.moveTo(canvas.width / 2, 0);
		ctx.lineTo(canvas.width / 2, canvas.height);
		ctx.strokeStyle = '#000000';
		ctx.stroke();
		ctx.closePath();
	}

	function drawPaddles() {
		
		var paddleLeft = state.paddleLeft;
		var paddleRight = state.paddleRight;

		// Paddle Right
		ctx.beginPath();
		ctx.rect(paddleLeft.x, paddleLeft.y, paddleLeft.width, paddleLeft.height);
		ctx.fillStyle = '#000000';
		ctx.fill();
		ctx.closePath();

		// Paddle Left
		ctx.beginPath();
		ctx.rect(paddleRight.x, paddleRight.y, paddleRight.width, paddleRight.height);
		ctx.fillStyle = '#000000';
		ctx.fill();
		ctx.closePath();

	}

	function drawScores() {
		var playerLeft = state.playerLeft;
		var playerRight = state.playerRight;

		// Player Left
		ctx.beginPath();
		ctx.font = '64px \'Courier New\'';
		ctx.fillStyle = '#000000';
		ctx.fillText(playerLeft.score, canvas.width / 2 -74, 64);
		ctx.closePath();

		// Player Right
		ctx.beginPath();
		ctx.font = '64px \'Courier New\'';
		ctx.fillStyle = '#000000';
		ctx.fillText(playerRight.score, canvas.width / 2 + 34, 64);
		ctx.closePath();		

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
		socket.on('gameOver', function(data) {
			state = data;
			if (state.winner) {
				alert(state.winner.side.charAt(0).toUpperCase() + ' player wins!');
				document.location.reload();
			}
		});
	}
	
})();