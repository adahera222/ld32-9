var canvas = document.getElementsByTagName('canvas')[0],
ctx = null,
body = document.getElementsByTagName('body')[0];

var keysDown = new Array();
var x;
var y;

// Track types
DIVE = 0;
SWOOP = 1;
SLIDEON = 2;
LOOP = 3;
SINE = 4;

var trackpoints = [ 
    [ [-200,0], [-128, 128], [-512, 0] ], // DIVE
    [ [-200,0], [-128, -128], [-512,0] ],  // SWOOP
    [ [-32,0]  ]  // SLIDEON
];

var waves = [ 
		      [128, 0, 5,-128, 0],
	      [384, 1, 5,128, 0 ],
	      [1024, LOOP, 5 ,0, 0],
	      [1024+128, LOOP,5,-200, 0],
	      [1024+256, SINE, 10, 0, 0],
	      [1536, SINE, 10, -200, 0],
	      [1536+256, SLIDEON, 1, 0, 1],
];

function Enemy(type) {
    this.type = type;
    this.track = 0;
    this.progress = 0;
    this.dead = false;
    this.health = 1;
    if(this.type == 1) { this.health = 10; }
}

function Explosion(x,y) {
    explosionSounds[explosionNo%2].play();
    explosionNo+=1;
    this.x = x;
    this.y = y;
    this.stage = 0;
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

function addEnemy(track, yOffset, type) {
    enemy = new Enemy(type);
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
    trackpoints[LOOP] = tracks;
}

function makeSineTrack()
{
    tracks = new Array();
    for(i=0;i<64;i++) {
	tracks[i] = [ -120, 400*Math.sin(i/2) ];
    }
    trackpoints[SINE] = tracks;
}

function drawChar(c, cx, cy) 
{
    c = c.charCodeAt(0);
    if(c >= 65 && c <= 90) {
	index = c-65+14;
    }
    else if(c >= 48 && c <= 57) {
	index = c-48+3;
    }
    else if(c==32) {
	return;
    }
    else if(c == 46) { index = 40; }
    else if(c == 44) { index = 41; }
    else
    {
	titlectx.fillStyle = "#ff0000";
	titlectx.fillRect(x,y,8,8);
	return;
    }
    titlectx.drawImage(bitfont, index*6, 0, 6,10,cx,cy,12,20);
}

function drawString(string, cx, cy) {
    string = string.toUpperCase();
    for(i=0;i<string.length;i++) {
	drawChar(string[i], cx,cy);
	cx += 12;
    }
}

function paintTitleBitmap()
{
    drawString('It is the 28th year of continuous alien attack of earth.',32,32);
    drawString('Due to budget underruns we can only supply you with one ',32,64);
    drawString('bullet to defend our planet.',32,96);
    drawString('To protect our assets, your bullet is connected by elastic ',32,128);
    drawString('to your fighter aircraft. Please try to return with the ',32,160);
    drawString('bullet intact.',32,192);
    drawString('Press space to defend earth',64,256);
}

function makeTitleBitmap()
{
    titleBitmap = document.createElement('canvas');
    titleBitmap.width = 800;
    titleBitmap.height = 480;
    titlectx = titleBitmap.getContext('2d');
    bitfont = new Image();
    bitfont.src = "graphics/bitfont.png";
    bitfont.onload = paintTitleBitmap;
    return titleBitmap;
}

function resetGame()
{
    x = 128;
    y = 128;
    sx = 0;
    sy = 0;
    explosions = new Array();
    health = 10;
    waveCount = 0;
    clouds = new Array();
    for(i=0;i<5;i++) {
	clouds[i] = [ Math.random()*800, Math.random()*480 ];
    }
    bulletActive = false;
    enemies = new Array();
    deathAnimation = -1;
    frame = 0;
}

function init()
{
    mode = 0;
    shipImage = getImage("ship");
    enemy1 = getImage("spr385283-29-22.600");
    bullet = getImage("bullet");
    cloud = getImage("cloud");
    skyline = getImage("skyline");
    explosion = getImage("explosion");
    boss = getImage("magnacrab");
    shootSound = new Audio("audio/lowres-shoot.wav");
    explosionSounds = new Array();
    explosionSounds[0]= new Audio("audio/lowres-explode.wav");
    explosionSounds[1]= new Audio("audio/lowres-explode.wav");
    explosionNo = 0;
    springSound = new Audio("audio/spring.wav");
    music = new Audio("vikings-mono.ogg");
    music.loop = true;
    music.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
    music.play();
    makeLoopTrack();
    makeSineTrack();
    titleBitmap = makeTitleBitmap();    
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

function addExplosion(x,y)
{
    explosions[explosions.length] = new Explosion(x,y);
}

function drawExplosions()
{
    var explosionSize = 64;
    for(var e=0;e<explosions.length;e++) {
	ex = explosions[e];
	if(!ex.dead) {
	    ctx.drawImage(explosion, explosionSize*ex.stage,0,explosionSize,explosionSize,ex.x-explosionSize/2,ex.y-explosionSize/2,explosionSize,explosionSize);
	    ex.stage += 1;
	    if(ex.stage > 32) {
		ex.dead = true;
	    }
	}
    }
}

function drawEnemies()
{
    var enemySize = 48;
    for(var e=0;e<enemies.length;e++) {
	en = enemies[e];
	if(!en.dead) {
	    if(en.type==0) {
		ctx.drawImage(enemy1, enemySize*Math.floor((frame/10)%5),0, enemySize,enemySize,
                              en.x-enemySize/2, en.y-enemySize/2, enemySize,enemySize);
	    }
	    else if(en.type==1) {
		ctx.drawImage(boss, en.x-boss.width/2, en.y-boss.height/2);
	    }
	}
    }
}

function draw() {
    for(var i=0;i<8;i++) {
	hex = ((8-i)*16).toString(16);
	if(i==0) hex = "7F";
	ctx.fillStyle = "#"+hex+hex+"ff";
	ctx.fillRect(0,60*i,800,60);
    }

    if(mode==0) {
	ctx.drawImage(titleBitmap, 0, 0);

	return;
    }

    drawSkyline();
    drawClouds();
    ctx.drawImage(shipImage, x, y);
    drawEnemies();
    if(bulletActive) {
	ctx.drawImage(bullet, bx, by);
	ctx.beginPath();
	ctx.moveTo(x+shipImage.width/2,y+shipImage.height/2);
	ctx.lineTo(bx+bullet.width/2,by+bullet.height/2);
	ctx.stroke();
    }

    drawExplosions();
    // Draw health on top
    if(health > 3 || (frame%8)>4) {
	for(var i=0;i<health;i++) {
	    ctx.fillStyle = "#000000";
	    ctx.fillRect(6+i*16,6,12,20);
	    if(i>=5) {
		ctx.fillStyle = "#00FF00";
	    }
	    else if(i>=2) {
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
    shootSound.play();
    bx = x+shipImage.width/2;
    by = y+shipImage.height/2;
    bulletActive = true;
    bulletSprung = false;
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
        if(bdx < 0 && !bulletSprung) {
            springSound.play();
            bulletSprung = true;
        }
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
	pos = Math.floor(en.progress / 512);
	if(pos >= track.length) {
	    if(en.type == 0) { // Boss stays on screen forever
		en.dead = true;	   
	    }
	}
	else {
	    dx = track[pos][0] / 64;
	    dy = track[pos][1] / 64;
	    en.x += dx;
	    en.y += dy;
	}
    }
    if(deathAnimation > 0) {
	if(deathAnimation % 16 == 0) {
	    addExplosion(x+shipImage.width/2+32*(Math.random()-0.5),y+shipImage.height/2+32*(Math.random()-0.5));
	}
	deathAnimation -= 1;
	if(deathAnimation == 0) {
	    mode = 0;
	}
    }
}

function purge()
{
    newEnemies = Array();
    j = 0;
    for(i=0;i<enemies.length;i++) {
	en = enemies[i];
	if(!en.dead) {
	    newEnemies[j] = en;
	    j+=1;
	}
    }
    enemies = newEnemies;
    newExplosions = Array();
    j = 0;
    for(i=0;i<explosions.length;i++) {
	ex = explosions[i];
	if(!ex.dead) {
	    newExplosions[j] = ex;
	}
    }
    explosions = newExplosions;
}

function collisionDetector() {
    for(var e=0;e<enemies.length;e++) {
	enemySize = 48;
	en = enemies[e];
	if(!en.dead) {
	    if(en.x + enemySize/2 >= x && en.x - enemySize/2<= x + shipImage.width) {
		if(en.y +enemySize/2 >= y && en.y - enemySize/2<= y + shipImage.height) {
		    
		    addExplosion(en.x,en.y);
		    en.health -= 1;
		    health -= 1;
		    if(en.health<=0) {
			en.dead = true;
		    }
		    if(health <= 0) {
			deathAnimation = 64;
		    }
		}
	    }
	    if(bulletActive) {
		if(en.x + enemySize/2 >= bx && en.x -enemySize/2<= bx + bullet.width) {
		    if(en.y + enemySize/2 >= by && en.y -enemySize/2<= by + bullet.height) {
			addExplosion(en.x,en.y);
			en.health -= 1;
			if(en.health <= 0) {
			    en.dead = true;
			}
		    }
		}
	    }	    
	}
    }
}

function startWaves() {
    if(waveCount > 0 && frame%32 ==0) {
	waveCount -= 1;
	addEnemy(waveType,waveYoffset,waveEnemy);
    }
    if(waves.length <= 0) return;
    wave = waves[0];
    if(wave[0] <= frame) {
	if(waveCount > 0) {
	    console.log("WARNING: wave was already running, restarting");
	}
	waveType = wave[1];
	waveCount = wave[2];
	waveYoffset = wave[3];
	waveEnemy = wave[4];
	console.log("Beginning wave: "+waveCount+" enemies type "+waveEnemy+" track "+waveType);
	waves = waves.slice(1); // Pop off first wave
	if(waves.length>0) {
	    console.log("Next wave at frame "+waves[0][0]);
	}
	else {
	    console.log("No more waves");
	}
    }
}

function drawRepeat() {
    if(mode==0) {
    }
    else
    {
	processKeys();
	frame += 1;
	startWaves();
	moveEnemies();
	moveBullets();
	collisionDetector();
	if(frame % 128 == 0) purge();
    }
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
	if(c==81) {
	    stopRunloop=true;
	}
        if(c==77) {
            music.pause();
        }
	if(c==32) {
	    if(mode==0) {
		resetGame();
		mode = 1;
	    }
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