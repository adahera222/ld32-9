valuestorm: graphics

graphics: FORCE
	convert -background none -resize 25% graphics_in/ship.svg graphics/ship.png
	cp graphics_in/spr*.png graphics/
FORCE: