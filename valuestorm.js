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

var waves = [ [128, 0, 5,0],
	      [512, 1, 5,0 ],
	      [1024, 2, 5 ,0],
	      [1024+128, 2,5,-200] ];

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

function makeWave(track, number) {
    for(var i=0;i<number;i++) {
	enemy = new Enemy(1);
	enemy.x = 800;
	enemy.y = 240+32*i;
	enemy.track = track;
	enemies[enemies.length] = enemy;
    }
}

function addEnemy(track, yOffset) {
    enemy = new Enemy(1);
    enemy.x = 800;
    enemy.y = 240+yOffset;
    enemy.track = track;
    enemies[enemies.length] = enemy;
}


function makeLoopTrack()
{
    tracks = new Array();
    for(i=0;i<64;i++) {
	tracks[i] = [ -120 + 400*Math.cos(i/2), 400*Math.sin(i/2) ];
    }
    trackpoints[2] = tracks;
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
    sx = 0;
    sy = 0;
    health = 10;
    waveCount = 0;
    clouds = new Array();
    for(i=0;i<5;i++) {
	clouds[i] = [ Math.random()*800, Math.random()*480 ];
    }
    bulletActive = false;
    enemies = new Array();
    makeLoopTrack();
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
	sy += 2;
    }
    if(keysDown[38]) {
	sy -= 2;
    }
    if(keysDown[37]) {
	sx -= 2;
    }
    if(keysDown[39]) {
	sx += 2;
    }
    sx = sx * 0.8;
    sy = sy * 0.8;
    if(x<0) { x = 0; }
    if(x>800-shipImage.width) { x = 800-shipImage.width; }
    if(y<0) { y = 0; }
    if(y>480-shipImage.height) { y = 480-shipImage.height; }
    x += sx;
    y += sy;
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
	var track = trackpoints[en.track];
	en.progress += (track.length);
	pos = Math.floor(en.progress / 1024);
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
	enemySize = 24;
	en = enemies[e];
	if(!en.dead) {
	    if(en.x + enemySize/2 >= x && en.x - enemySize/2<= x + shipImage.width) {
		if(en.y +enemySize/2 >= y && en.y - enemySize/2<= y + shipImage.height) {
		    en.dead = true;
		    health -= 1;
		}
	    }
	    if(bulletActive) {
		if(en.x + enemySize/2 >= bx && en.x -enemySize/2<= bx + bullet.width) {
		    if(en.y + enemySize/2 >= by && en.y -enemySize/2<= by + bullet.height) {
			en.dead = true;
		    }
		}
	    }	    
	}
    }
}

function startWaves() {
    if(waveCount > 0 && frame%32 ==0) {
	waveCount -= 1;
	addEnemy(waveType,waveYoffset);
    }
    for(w=0;w<waves.length;w++) {
	wave = waves[w];
	if(wave[0] == frame) {
	    waveCount = wave[2];
	    waveType = wave[1];
	    waveYoffset = wave[3];
	}
    }
}

function drawRepeat() {
  frame += 1;
  processKeys();
    startWaves();
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