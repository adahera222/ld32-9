valuestorm: graphics

graphics: FORCE
	convert -background none -resize 50% graphics_in/ship.svg graphics/ship.png

FORCE: