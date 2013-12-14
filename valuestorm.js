var canvas = document.getElementsByTagName('canvas')[0],
ctx = null,
body = document.getElementsByTagName('body')[0];

var keysDown = new Array();
var x;
var y;

function getImage(name)
{
    image = new Image();
    image.src = 'graphics/'+name+'.png';
    return image;
}
function init()
{
    shipImage = getImage("ship");
    x = 128;
    y = 128;
    return true;
}

function draw() {
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(0,0,640,480);
  ctx.drawImage(shipImage, x, y);
}

function processKeys() {
    if(keysDown[40]) {
	y += 2;
    }
    if(keysDown[38]) {
	y -= 2;
    }
}

function drawRepeat() {
  processKeys();
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