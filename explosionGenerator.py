#!/usr/bin/python

f = open("graphics/explosion.svg","wt")

f.write("""
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   width="8192"
   height="256"
   id="svg2"
   version="1.1"
>
""")


def drawCircle(cx,cy, radius, (r,g,b)):
    if(radius<0): return
    f.write("<path style=\"")
    col = "#%2.2X%2.2X%2.2X"%(r,g,b)
    f.write("fill:none;fill-opacity:1;stroke:%s;stroke-opacity:1;stroke-width:16;stroke-miterlimit:4;stroke-dasharray:none"%col);
    f.write("\"\n");
    f.write("d=\"M %d,%d A %d,%d 0 1,0 %d,%d A %d,%d 0 1,0 %d,%d\" />\n"%(cx+radius,cy,radius,radius,cx-radius,cy,radius,radius,cx+radius,cy))


f.write("<g>")
cx = 128

for stage in range(32,256,8):
    yellowR = -128+stage
    size = min(stage,128-16)
    drawCircle(cx,128,size,(0,0,0))
    for c in range(0,128):
        if(yellowR + c > 128 or yellowR+c > (size-16)):
            continue
        drawCircle(cx,128,yellowR+c,(255,255-(c*2),0))
    cx += 256
                
f.write("</g>\n</svg>\n")
