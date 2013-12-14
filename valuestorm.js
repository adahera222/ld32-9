var canvas = document.getElementsByTagName('canvas')[0],
ctx = null,
body = document.getElementsByTagName('body')[0];

function getImage(name)
{
    image = new Image();
    image.src = 'graphics/'+name+'.png';
    return image;
}
function init()
{
    shipImage = getImage("ship");
    return true;
}

function draw() {
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(0,0,640,480);
  ctx.drawImage(shipImage, 64, 64);
}

function drawRepeat() {
  draw();
  setTimeout('drawRepeat()',20);
}

if (canvas.getContext('2d')) {
    ctx = canvas.getContext('2d');
    ctx.font="bold 32px Arial";
    if(init()) {      
      drawRepeat();
    }
}