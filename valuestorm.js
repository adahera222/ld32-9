var canvas = document.getElementsByTagName('canvas')[0],
ctx = null,
body = document.getElementsByTagName('body')[0];

var keysDown = new Array();
var x;
var y;
var frame = 0;

var track1points = [ [0,0], [ -128, 128], [-128, 0]];

function Enemy(type) {
    this.type = type;
    this.track = 1;
    this.progress = 0;
    this.dead = false;
}

function getImage(name)
{
    image = new Image();
    image.src = 'graphics/'+name+'.png';
    return image;
}

function makeWave() {
    for(var i=0;i<5;i++) {
	enemy = new Enemy(1);
	enemy.x = 400+32*i;
	enemy.y = 240;
	enemies[enemies.length] = enemy;
    }
}

function init()
{
    shipImage = getImage("ship");
    enemy1 = getImage("spr385283-29-22.600");
    x = 128;
    y = 128;
    enemies = new Array();
    makeWave();
    return true;
}

function draw() {
  ctx.fillStyle = "#7F7fff";
  ctx.fillRect(0,0,800,480);
  ctx.drawImage(shipImage, x, y);

  for(var e=0;e<enemies.length;e++) {
      en = enemies[e];
      ctx.drawImage(enemy1, 24*Math.floor((frame/10)%5),0, 24,24, en.x-12, en.y-12, 24,24);
  }
}

function processKeys() {
    if(keysDown[40]) {
	y += 4;
    }
    if(keysDown[38]) {
	y -= 4;
    }
    if(keysDown[37]) {
	x -= 4;
    }
    if(keysDown[39]) {
	x += 4;
    }
}

function moveEnemies() {
    for(var e=0;e<enemies.length;e++) {
	en = enemies[e];
	en.progress += 1;
	pos = Math.floor(en.progress / 128);
	if(pos >= track1points.length) {
	    en.dead = true;	   
	}
	else {
	    dx = track1points[pos][0] / 128;
	    dy = track1points[pos][1] / 128;
	    en.x += dx;
	    en.y += dy;
	}
    }
}

function collisionDetector() {
    for(var e=0;e<enemies.length;e++) {
	en = enemies[e];
	if(en.x >= x && en.x <= x + shipImage.width) {
	    if(en.y >= y && en.y <= y + shipImage.height) {
		console.log("Collision!");
	    }
	}
    }
}

function drawRepeat() {
    frame += 1;
  processKeys();
    moveEnemies();
    collisionDetector();
  draw();
  setTimeout('drawRepeat()',20);
}

if (canvas.getContext('2d')) {
    ctx = canvas.getContext('2d');
    ctx.font="bold 32px Arial";
    body.onkeydown = function (event) {
	var c = event.keyCode;
        keysDown[c] = 1;
        console.log("Pressed key: "+c);
    };

    body.onkeyup = function (event) {
	var c = event.keyCode;
        keysDown[c] = 0;
    };

    if(init()) {      
      drawRepeat();
    }
}