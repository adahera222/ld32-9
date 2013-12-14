valuestorm: graphics

graphics: FORCE
	convert -background none -resize 25% graphics_in/ship.svg graphics/ship.png
	convert -background none -resize 5% graphics_in/bullet.svg graphics/bullet.png
	convert -scale 200% graphics_in/spr385283-29-22.600.png graphics/spr385283-29-22.600.png
FORCE: