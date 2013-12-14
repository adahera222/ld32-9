valuestorm: graphics

graphics: FORCE
	convert -background none -resize 25% graphics_in/ship.svg graphics/ship.png
	convert -background none -resize 5% graphics_in/bullet.svg graphics/bullet.png
	convert -background none -resize 25% graphics_in/cloud.svg graphics/cloud.png
	convert -background none -resize 50% graphics_in/skyline.svg graphics/skyline.png
	convert -background none -resize 25% graphics/explosion.svg graphics/explosion.png
	convert -background none -resize 66% graphics_in/magnacrab.svg graphics/magnacrab.png
	convert -scale 400% graphics_in/spr385283-29-22.600.png graphics/spr385283-29-22.600.png
FORCE: