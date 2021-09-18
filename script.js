let Na = 6.023e23;

let particleToPixel = 1000;
let scaleBig = Na / particleToPixel;
let scaleSmall = particleToPixel / Na;


let brushSize = 6;
let paused = false;

const gridSize = 300;
const frameRates = [];

let mass = 0;

let displayImage;
const particles = [];
const grid = new Array(gridSize * gridSize).fill(null);

const particleTypes = [
	{ particle: Water },
	{ particle: Carbon },
	{ particle: Sodium },
	{ particle: Silicon },
	{ particle: Sulfur },
	{ particle: Copper },
	{ particle: Gold },
	{ particle: Uranium },
	
	// { name: 'Sand', particle: Sand },
	// { name: 'Stone', particle: Stone },
];
let selectedType = 0;

let particleDiv, massDiv, moleDiv, moleCheckBox;
let showMoles = false;
document.addEventListener('contextmenu', e => e.preventDefault());

function setup() {
	let size = min(windowWidth * 0.9, windowHeight);

	let cnv = createCanvas(size - 100, size - 100);
	cnv.style('marginLeft', `${max(windowWidth * 0.1, windowWidth * 0.5 - size * 0.5)}px`);
	cnv.style('marginTop', `${windowHeight * 0.5 - size * 0.5}px`);

	displayImage = createImage(gridSize, gridSize);
	displayImage.loadPixels();

	let particleSelect = select('#particleSelect');
	// particleSelect.style('right', `${min(windowWidth * 0.9 + 5, windowWidth * 0.5 + size * 0.5 + 5)}px`);

	// generate particle types
	particleTypes.map((type, i) => {

		let t = new type.particle({ offset: 0, position: { x: 0, y: 0 } });
		let d = createElement('div');
		let p = createElement('p', t.name);

		let mm = createElement('p', `${t.molarMass}`);

		if (i == selectedType) d.class('selected');
		d.style('background', `rgb(${t.color[0]}, ${t.color[1]}, ${t.color[2]} )`);
		mm.parent(d);
		mm.style(`height`, `fit-content`)
		p.parent(d);
		
		d.parent(particleSelect);
		d.mouseClicked(() => {

			selectedType = i;

			for (let i = 0; i < d.elt.parentElement.children.length; i++) {
				let elt = d.elt.parentElement.children[i];
				elt.className = '';
				if (i == selectedType) elt.className = 'selected';
			}

		})

	});


	particleDiv = createDiv('').size(width, 50);
	particleDiv.style('marginLeft', `${max(windowWidth * 0.1, windowWidth * 0.5 - size * 0.5)}px`);
	particleDiv.style('transform', `translate(10px, 20px)`);

	massDiv = createDiv('').size(width, 50);
	massDiv.style('marginLeft', `${max(windowWidth * 0.1, windowWidth * 0.5 - size * 0.5)}px`);
	massDiv.style('transform', `translate(10px, 0px)`);

	moleCheckBox = createCheckbox('Show Moles?', false);
	moleCheckBox.changed(() => showMoles = !showMoles);
	moleCheckBox.style('marginLeft', `${max(windowWidth * 0.1, windowWidth * 0.5 - size * 0.5)}px`);
	moleCheckBox.style('transform', `translate(${width / 2 + 100}px, ${4 * (-20)}px)`);

	moleDiv = createDiv('').size(width, 50);
	moleDiv.style('marginLeft', `${max(windowWidth * 0.1, windowWidth * 0.5 - size * 0.5)}px`);
	moleDiv.style('transform', `translate(${width / 2 + 50}px, ${3 * (-20)}px)`);



}

function meanFps() {
	frameRates.unshift(floor(frameRate()));
	if (frameRates.length > 10) {
		frameRates.pop();
	}
	const sum = frameRates.reduce((s, v) => {
		return s + v;
	})
	return Math.floor(sum / frameRates.length);
}


function draw() {

	background(0);

	//add new particles
	if (mouseIsPressed) {
		addParticles();
	}

	//simulate (thrice, to speed things up a bit)
	if (!paused) {
		simulate();
		simulate();
		simulate();
	}

	//display simulation
	displayImage.updatePixels();
	image(displayImage, 0, 0, width, height);

	//display mouse
	stroke(255);
	noFill();
	circle(mouseX, mouseY, brushSize * brushSize + 1);

	//display info
	noStroke();
	fill(255);
	text((paused) ? 'PAUSED' : 'Playing', width * 0.48, 15);
	text('Fps: ' + meanFps(), 5, 15);
	text('Brush size: ' + (brushSize + 1), 5, 30);


	// text('Particles: ' + (particles.length * scaleBig).toPrecision(4),
	// 	5, height + 45);
	// text('Mass: ' + mass.toPrecision(4) + ' grams',
	// 	5, height + 60);
	particleDiv.html(`Particles: ${(particles.length * scaleBig).toPrecision(4)}`)
	massDiv.html(`Mass: ${mass.toPrecision(4)}g`)

	if (showMoles) {
		moleDiv.html(`Moles: ${(particles.length / 1000).toPrecision(4)}`)
	} else {
		moleDiv.html(``);
	}

}

function simulate() {

	for (let i = 0; i < particles.length; i++) {
		particles[i].update();
	}

}



function addParticles() {

	if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;

	let x = floor((mouseX / width) * (gridSize));
	let y = floor((mouseY / height) * (gridSize));
	let bR = map(brushSize, 0, 18, 0.5, 0.1);

	if (mouseButton == LEFT) {

		for (let y1 = -brushSize; y1 <= brushSize; y1++) {

			for (let x1 = -brushSize; x1 <= brushSize; x1++) {

				if ((selectedType != 2 && Math.random() > bR) ||
					x1 * x1 + y1 * y1 > brushSize * brushSize ||
					x + x1 >= gridSize || x + x1 < 0 ||
					y + y1 >= gridSize || y + y1 < 0) {
					continue;
				}

				let offset = (((y + y1) * gridSize) + (x + x1));

				if (!grid[offset]) {

					const newParticle = new particleTypes[selectedType].particle({
						offset: offset,
						position: { x: x + x1, y: y + y1 }
					});

					mass += newParticle.mass;

					newParticle.display();
					grid[offset] = newParticle;
					particles.push(newParticle);


				}

			}
		}

	}
	else if (mouseButton == RIGHT) {

		for (let i = particles.length - 1; i >= 0; i--) {

			let p = particles[i];
			let dx = p.position.x - x, dy = p.position.y - y;
			if (dx * dx + dy * dy < brushSize * brushSize) {

				mass -= p.mass;

				displayImage.pixels[p.offset * 4 + 0] = 0;
				displayImage.pixels[p.offset * 4 + 1] = 0;
				displayImage.pixels[p.offset * 4 + 2] = 0;
				grid[p.offset] = undefined;
				particles.splice(i, 1);

			}

		}

	}

}




//user input / drawing new particles
function mousePressed() {
	addParticles();
}


function keyPressed() {
	if (keyCode == 32) { //space
		paused = !paused;
	}
}

function mouseWheel(e) {

	let d = Math.sign(e.delta);
	brushSize -= d;
	if (brushSize < 0) brushSize = 0;
	if (brushSize > 19) brushSize = 19;

}

