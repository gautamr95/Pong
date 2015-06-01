var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60)};

var canvas = document.createElement("canvas");
var width = window.innerWidth;
var height= window.innerHeight;
console.log(window.innerWidth);
var paddle_width = 100;
var paddle_height = 10;
var center_x = width/2;
var center_y = height/2;
var init_x_speed = 0;
var init_y_speed = 3;
var radius = 5;

canvas.width = width;
canvas.height = height;

var context = canvas.getContext("2d");

var player = new Player();
var computer = new Computer();
var ball = new Ball(center_x, center_y);

var keysDown = {};

var step = function() {
	update();
	render();
	animate(step);
};

var update = function() {
    player.update();
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);
};

var render = function () {
    context.fillStyle = "#3F51B5";
    context.fillRect(0, 0, width, height);
    player.render();
    computer.render();
    ball.render();
};

function Paddle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
}

Paddle.prototype.render = function() {
    context.fillStyle = "#FFEB3B";
    context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function(x,y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if(this.x < 0){
        this.x = 0;
        this.x_speed = 0;
    }
    else if(this.x + this.width > width){
        this.x = width - this.width;
        this.x_speed = 0;
    }
};

function Player() {
    this.paddle = new Paddle((width - paddle_width)/2, height-20, paddle_width, paddle_height);
    this.score = 0;
}

Player.prototype.render = function() {
    this.paddle.render();
    context.fillStyle = "#F44336";
    context.font = '70px Roboto';
    var text="Player: "+this.score;
    context.fillText(text,0,height-10);
};

Player.prototype.update = function() {
    for (var key in keysDown) {
        var value = Number(key);
        if(value == 37){ // left arrow key
            this.paddle.move(-4,0);
        }
        else if(value == 39){// right arrow key
            this.paddle.move(4,0);
        }
        else{
            this.paddle.move(0,0);
        }
    }
};

function Computer() {
    this.paddle = new Paddle((width - paddle_width)/2, 10, paddle_width, paddle_height);
    this.score = 0;
}

Computer.prototype.render = function() {
    this.paddle.render();
    context.fillStyle = "#F44336";
    context.font = '70px Roboto';
    var text="Computer: "+this.score;
    context.fillText(text,width-context.measureText(text).width,height-10);
};

Computer.prototype.update = function (ball) {
    var x_pos = ball.x;
    var diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos);
    if(diff < 0 && diff < -4) { // max speed left
        diff = -5;
    } else if(diff > 0 && diff > 4) { // max speed right
        diff = 5;
    }

    this.paddle.move(diff, 0);
    if(this.paddle.x < 0) {
        this.paddle.x = 0;
    } else if (this.paddle.x + this.paddle.width > width) {
        this.paddle.x = width - this.paddle.width;
    }  
};

function Ball (x, y) {
    this.x = x;
    this.y = y;
    this.x_speed = init_x_speed;
    this.y_speed = init_y_speed;
    this.radius = 5;
}

Ball.prototype.render = function() {
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = "#000000";
  context.fill();
};

Ball.prototype.update = function(paddle1, paddle2) {
    this.x += this.x_speed;
    this.y += this.y_speed;

    var top_x = this.x - 5;
    var top_y = this.y - 5;
    var bottom_x = this.x + 5;
    var bottom_y = this.y + 5;

    if(this.x < this.radius){ // hit left wall
        this.x_speed = -this.x_speed;
        this.x = this.radius;
    }
    else if(this.x > width - this.radius){// hit right wall
        this.x_speed = -this.x_speed;
        this.x = width - this.radius;
    }

    if(this.y < 0){ // Player gets a point
        player.score += 1;
        this.x = center_x;
        this.y = center_y;
        this.x_speed = init_x_speed;
        this.y_speed = init_y_speed;
    }
    else if(this.y > height){ // Computer gets a point
        computer.score +=1;
        this.x = center_x;
        this.y = center_y;
        this.x_speed = init_x_speed;
        this.y_speed = init_y_speed;
    }

    if(top_y > height/2) {
        if(top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
          // hit the player's paddle
          this.y_speed = -init_y_speed;
          this.x_speed += (paddle1.x_speed / 2);
          this.y += this.y_speed;
        }
    } 
      else {
        if(top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) {
          // hit the computer's paddle
          this.y_speed = init_y_speed;
          this.x_speed += (paddle2.x_speed / 2);
          this.y += this.y_speed;
        }
    }
};


window.onload = function() {
    document.body.appendChild(canvas);
    animate(step);
};

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
});