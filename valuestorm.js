var canvas = document.getElementsByTagName('canvas')[0],
ctx = null,
body = document.getElementsByTagName('body')[0];

function draw() {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0,0,640,480);
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