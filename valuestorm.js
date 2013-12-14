var canvas = document.getElementsByTagName('canvas')[0],
ctx = null,
body = document.getElementsByTagName('body')[0];

var keysDown = new Array();
var x;
var y;
var frame = 0;

var trackpoints = [ 
    [ [-256,0], [-128, 128], [-512, 0] ],
    [ [-256,0], [-128, -128], [-512,0] ] ];

function Enemy(type) {
    this.type = type;
    this.track = 0;
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
	enemy.x = 800;
	enemy.y = 240+32*i;
	enemies[enemies.length] = enemy;

	enemy = new Enemy(2);
	enemy.x = 800;
	enemy.y = 32*i;
	enemy.track = 1;
	enemies[enemies.length] = enemy;

    }
}

function init()
{
    shipImage = getImage("ship");
    enemy1 = getImage("spr385283-29-22.600");
    bullet = getImage("bullet");
    cloud = getImage("cloud");
    skyline = getImage("skyline");
    x = 128;
    y = 128;
    health = 10;
    clouds = new Array();
    for(i=0;i<5;i++) {
	clouds[i] = [ Math.random()*800, Math.random()*480 ];
    }
    bulletActive = false;
    enemies = new Array();
    makeWave();
    return true;
}

function drawClouds()
{
    for(i=0;i<5;i++) {
	cx = clouds[i][0];
	cy = clouds[i][1];
	ctx.drawImage(cloud, cx, cy);
	clouds[i][0] = cx - 16;
	if(cx < -cloud.width) {
	    clouds[i] = [ 800, Math.random()*480 ];
	}
    }
}

function drawSkyline()
{
  rot = (frame / 4) % 800;
  ctx.drawImage(skyline, -rot, 480-skyline.height);
  ctx.drawImage(skyline, 800-rot, 480-skyline.height);
}

function draw() {
    for(var i=0;i<8;i++) {
	hex = ((8-i)*16).toString(16);
	if(i==0) hex = "7F";
	ctx.fillStyle = "#"+hex+hex+"ff";
	ctx.fillRect(0,60*i,800,60);
    }

    drawSkyline();
  drawClouds();
  ctx.drawImage(shipImage, x, y);

  for(var e=0;e<enemies.length;e++) {
      en = enemies[e];
      if(!en.dead) {
	  ctx.drawImage(enemy1, 24*Math.floor((frame/10)%5),0, 24,24, en.x-12, en.y-12, 24,24);
      }
    }
    if(bulletActive) {
	ctx.drawImage(bullet, bx, by);
	ctx.beginPath();
	ctx.moveTo(x+shipImage.width/2,y+shipImage.height/2);
	ctx.lineTo(bx+bullet.width/2,by+bullet.height/2);
	ctx.stroke();
    }
    // Draw health on top
    if(health > 3 || (frame%8)>4) {
	for(var i=0;i<health;i++) {
	    ctx.fillStyle = "#000000";
	    ctx.fillRect(6+i*16,6,12,20);
	    if(i>5) {
		ctx.fillStyle = "#00FF00";
	    }
	    else if(i>2) {
		ctx.fillStyle = "#FFFF00";
	    }
	    else {
		ctx.fillStyle = "#FF0000";
	    }
	    ctx.fillRect(8+i*16,8,8,16);
	}
    }
}

function fireBullet() {
    if(bulletActive) return;
    bx = x+shipImage.width/2;
    by = y+shipImage.height/2;
    bulletActive = true;
    bdx = 32;
    bdy = 0;
    captureTimeout = 10;
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
    if(keysDown[32]) {
	fireBullet();
    }
}
function moveBullets() {
    if(bulletActive) {
	captureTimeout -= 1;
	bx += bdx;
	by += bdy;
	dx = bx - x - shipImage.width/2;
	dy = by - y - shipImage.height/2;
	if(captureTimeout < 0 && Math.abs(dx)< 32 && Math.abs(dy)<32) {
	    bulletActive = false;
	} else {
	    bdx -= (dx/300);
	    bdy -= (dy/300);
	    bdx *= 0.95;
	    bdy *= 0.95;
	}	
    }
}

function moveEnemies() {
    for(var e=0;e<enemies.length;e++) {
	en = enemies[e];
	en.progress += 1;
	pos = Math.floor(en.progress / 128);
	var track = trackpoints[en.track];
	if(pos >= track.length) {
	    en.dead = true;	   
	}
	else {
	    dx = track[pos][0] / 128;
	    dy = track[pos][1] / 128;
	    en.x += dx;
	    en.y += dy;
	}
    }
}

function purge()
{
    newEnemies = Array();
    j = 0;
    for(i=0;i<enemies.length;i++) {
	en = enemies[i]
	if(!en.dead) {
	    newEnemies[j] = en;
	    j+=1;
	}
    }
    enemies = newEnemies;
}

function collisionDetector() {
    for(var e=0;e<enemies.length;e++) {
	en = enemies[e];
	if(!en.dead) {
	    if(en.x >= x && en.x <= x + shipImage.width) {
		if(en.y >= y && en.y <= y + shipImage.height) {
		    en.dead = true;
		    health -= 1;
		}
	    }
	    if(bulletActive) {
		if(en.x >= bx && en.x <= bx + bullet.width) {
		    if(en.y >= by && en.y <= by + bullet.height) {
			en.dead = true;
		    }
		}
	    }	    
	}
    }
}

function drawRepeat() {
  frame += 1;
  processKeys();
  moveEnemies();
  moveBullets();
  collisionDetector();
  if(frame % 128 == 0) purge();
  draw();
    if(!stopRunloop) setTimeout('drawRepeat()',20);
}

if (canvas.getContext('2d')) {
    stopRunloop = false;
    ctx = canvas.getContext('2d');
    ctx.font="bold 32px Arial";
    body.onkeydown = function (event) {
	var c = event.keyCode;
        keysDown[c] = 1;
        console.log("Pressed key: "+c);
	if(c==81) {
	    stopRunloop=true;
	}
    };

    body.onkeyup = function (event) {
	var c = event.keyCode;
        keysDown[c] = 0;
    };

    if(init()) {      
      drawRepeat();
    }
}