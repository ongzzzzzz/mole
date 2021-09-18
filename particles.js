class Particle {

	constructor(options) {
		this.offset = options.offset;
		this.position = options.position;
		this.colorOffset = Math.floor(noise(frameCount * 0.1) * 100);
	}

	update() {
		const newPos = this.findNewPosition(
			this.position.x,
			this.position.y
		);
		if (newPos) {
			this.replaceCurrentPosition(newPos);
			this.moveToNewPosition(newPos);
		}
		this.display();
	}

	replaceCurrentPosition(newPos) {
		grid[this.offset] = 0;
		displayImage.pixels[this.offset * 4 + 0] = 0;
		displayImage.pixels[this.offset * 4 + 1] = 0;
		displayImage.pixels[this.offset * 4 + 2] = 0;
	}

	moveToNewPosition(newPos) {
		this.position.x = newPos.x;
		this.position.y = newPos.y;
		this.offset = newPos.offset;
		grid[this.offset] = this;
	}

	display() {
		displayImage.pixels[this.offset * 4 + 0] = this.color[0];
		displayImage.pixels[this.offset * 4 + 1] = this.color[1];
		displayImage.pixels[this.offset * 4 + 2] = this.color[2];
		displayImage.pixels[this.offset * 4 + 3] = 255;
	}
}

class Water extends Particle {

	constructor(options) {

		super(options);
		this.name = 'Water';
		this.molarMass = 18;

		this.value = 254;
		this.color = [10, 10, 250];
		this.mass = this.molarMass / particleToPixel;

	}

	findNewPosition(x, y) {

		let p1, p2, p3, p4, p5;
		if (y + 1 < gridSize) p1 = (((y + 1) * gridSize) + x);
		if (y + 1 < gridSize && x + 1 < gridSize) p2 = (((y + 1) * gridSize) + x + 1);
		if (y + 1 < gridSize && x - 1 >= 0) p3 = (((y + 1) * gridSize) + x - 1);
		if (x + 1 < gridSize) p4 = ((y * gridSize) + x + 1);
		if (x - 1 >= 0) p5 = ((y * gridSize) + x - 1);


		if (p1 && !grid[p1]) {

			return { x: x, y: y + 1, offset: p1 };

		} else if (p2 && !grid[p2]) {

			return { x: x + 1, y: y + 1, offset: p2 };

		} else if (p3 && !grid[p3]) {

			return { x: x - 1, y: y + 1, offset: p3 };

		} else if (p4 && !grid[p4]) {

			return { x: x + 1, y: y, offset: p4 };

		} else if (p5 && !grid[p5]) {

			return { x: x - 1, y: y, offset: p5 };

		}


	}

	display() {

		super.display();
		displayImage.pixels[this.offset * 4 + 2] -= this.colorOffset;

	}

}

class Dust extends Particle {

	constructor(options) {

		super(options);
		this.name = 'Sand';
		this.molarMass = 4;

		this.value = 255;
		this.color = [149, 113, 95];
		this.mass = this.molarMass / particleToPixel;
		this.wet = false;

	}

	update() {

		super.update();

		if (!this.wet && random() > 0.99) {

			let position = this.findWaterAbove();

			if (position) {

				if (grid[position].name != 'Sand') {

					grid[position] = 0;
					displayImage.pixels[position] = 0;
					displayImage.pixels[position] = 0;
					displayImage.pixels[position] = 0;

				}

				this.wet = true;

			} else if (!position && this.wet) {

				this.wet = false;

			}

		}

	}

	findNewPosition(x, y) {

		let p1, p2, p3;
		if (y + 1 < gridSize) p1 = (((y + 1) * gridSize) + x);
		if (y + 1 < gridSize && x + 1 < gridSize) p2 = (((y + 1) * gridSize) + x + 1);
		if (y + 1 < gridSize && x - 1 >= 0) p3 = (((y + 1) * gridSize) + x - 1);

		if (p1 && (!grid[p1] || grid[p1].name == "Water")) {

			return { x: x, y: y + 1, offset: p1 };

		} else if (p2 && (!grid[p2] || grid[p2].name == "Water")) {

			return { x: x + 1, y: y + 1, offset: p2 };

		} else if (p3 && (!grid[p3] || grid[p3].name == "Water")) {

			return { x: x - 1, y: y + 1, offset: p3 };

		}

	}

	findWaterAbove() {

		for (let i = 0; i < 2; i++) {
			let offset = this.offset - (gridSize * i);
			if (grid[offset] && (grid[offset].name == "Water" ||
				(grid[offset].name == "Sand" && grid[offset].wet == true))) {
				return offset;
			}
		}

		return false;

	}

	replaceCurrentPosition(newPos) {

		if (grid[newPos.offset] && grid[newPos.offset].name == 'Water') {

			grid[newPos.offset].position.x = this.position.x;
			grid[newPos.offset].position.y = this.position.y;
			grid[newPos.offset].offset = this.offset;

			grid[this.offset] = grid[newPos.offset]
			grid[this.offset].display();

			return;

		}

		super.replaceCurrentPosition();

	}

	display() {

		super.display();

		displayImage.pixels[this.offset * 4 + 0] -= this.colorOffset * 0.5;
		displayImage.pixels[this.offset * 4 + 1] -= this.colorOffset * 0.5;
		displayImage.pixels[this.offset * 4 + 2] -= this.colorOffset * 0.5;

		let darkerWet = (this.wet) ? 0.65 : 1.0;
		displayImage.pixels[this.offset * 4 + 0] *= darkerWet;
		displayImage.pixels[this.offset * 4 + 1] *= darkerWet;
		displayImage.pixels[this.offset * 4 + 2] *= darkerWet;

	}
}

class Carbon extends Dust {
	constructor(options) {
		super(options);
		this.name = 'Carbon';
		this.molarMass = 12;
		this.color = [60, 60, 60];
	}
}

class Sodium extends Dust {
	constructor(options) {
		super(options);
		this.name = 'Sodium';
		this.molarMass = 23;
		this.color = [255, 255, 255];
	}
}

class Silicon extends Dust {
	constructor(options) {
		super(options);
		this.name = 'Silicon';
		this.molarMass = 14;
		this.color = [186, 186, 186];
	}
}

class Sulfur extends Dust {
	constructor(options) {
		super(options);
		this.name = 'Sulfur';
		this.molarMass = 32;
		this.color = [211, 173, 24];
	}
}

class Copper extends Dust {
	constructor(options) {
		super(options);
		this.name = 'Copper';
		this.molarMass = 63.5;
		this.color = [178, 111, 49];
	}
}

class Gold extends Dust {
	constructor(options) {
		super(options);
		this.name = 'Gold';
		this.molarMass = 197;
		this.color = [255, 255, 0];
	}
}

class Uranium extends Dust {
	constructor(options) {
		super(options);
		this.name = 'Uranium';
		this.molarMass = 238;
		this.color = [0, 255, 0];
	}
}





class Sand extends Particle {

	constructor(options) {

		super(options);
		this.name = 'Sand';
		this.molarMass = 4;

		this.value = 255;
		this.color = [149, 113, 95];
		this.mass = this.molarMass / particleToPixel;
		this.wet = false;

	}

	update() {

		super.update();

		if (!this.wet && random() > 0.99) {

			let position = this.findWaterAbove();

			if (position) {

				if (grid[position].name != 'Sand') {

					grid[position] = 0;
					displayImage.pixels[position] = 0;
					displayImage.pixels[position] = 0;
					displayImage.pixels[position] = 0;

				}

				this.wet = true;

			} else if (!position && this.wet) {

				this.wet = false;

			}

		}

	}

	findNewPosition(x, y) {

		let p1, p2, p3;
		if (y + 1 < gridSize) p1 = (((y + 1) * gridSize) + x);
		if (y + 1 < gridSize && x + 1 < gridSize) p2 = (((y + 1) * gridSize) + x + 1);
		if (y + 1 < gridSize && x - 1 >= 0) p3 = (((y + 1) * gridSize) + x - 1);

		if (p1 && (!grid[p1] || grid[p1].name == "Water")) {

			return { x: x, y: y + 1, offset: p1 };

		} else if (p2 && (!grid[p2] || grid[p2].name == "Water")) {

			return { x: x + 1, y: y + 1, offset: p2 };

		} else if (p3 && (!grid[p3] || grid[p3].name == "Water")) {

			return { x: x - 1, y: y + 1, offset: p3 };

		}

	}

	findWaterAbove() {

		for (let i = 0; i < 2; i++) {
			let offset = this.offset - (gridSize * i);
			if (grid[offset] && (grid[offset].name == "Water" ||
				(grid[offset].name == "Sand" && grid[offset].wet == true))) {
				return offset;
			}
		}

		return false;

	}

	replaceCurrentPosition(newPos) {

		if (grid[newPos.offset] && grid[newPos.offset].name == 'Water') {

			grid[newPos.offset].position.x = this.position.x;
			grid[newPos.offset].position.y = this.position.y;
			grid[newPos.offset].offset = this.offset;

			grid[this.offset] = grid[newPos.offset]
			grid[this.offset].display();

			return;

		}

		super.replaceCurrentPosition();

	}

	display() {

		super.display();

		displayImage.pixels[this.offset * 4 + 0] -= this.colorOffset * 0.5;
		displayImage.pixels[this.offset * 4 + 1] -= this.colorOffset * 0.5;
		displayImage.pixels[this.offset * 4 + 2] -= this.colorOffset * 0.5;

		let darkerWet = (this.wet) ? 0.65 : 1.0;
		displayImage.pixels[this.offset * 4 + 0] *= darkerWet;
		displayImage.pixels[this.offset * 4 + 1] *= darkerWet;
		displayImage.pixels[this.offset * 4 + 2] *= darkerWet;

	}
}

class Stone extends Particle {

	constructor(options) {
		super(options);
		this.name = 'Fixed';
		this.molarMass = 140;

		this.value = 253;
		this.color = [125, 125, 125];
		this.mass = this.molarMass / particleToPixel;
		// noise( frameCount * 0.4)
		this.colorOffset = Math.floor((Math.random() * 2 - 1) * 50);
	}

	findNewPosition(x, y) {
		return undefined;
	}

	display() {
		super.display();
		displayImage.pixels[this.offset * 4 + 0] += this.colorOffset;
		displayImage.pixels[this.offset * 4 + 1] += this.colorOffset;
		displayImage.pixels[this.offset * 4 + 2] += this.colorOffset;
	}

}


