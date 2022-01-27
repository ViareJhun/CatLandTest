// Game Math
let pi = Math.PI
let sin = Math.sin
let cos = Math.cos

let Vec = (x, y) => {

	return {

		x: x,
		y: y

	}

}

let vecLen = (v) => {

	return Math.sqrt(
		(v.x * v.x) +
		(v.y * v.y)
	)

}

let vecNorm = (v) => {

	let l = vecLen(v)
	return Vec(
		v.x / l,
		v.y / l
	)

}

let vecAdd = (v1, v2) => {

	return Vec(
		v1.x + v2.x,
		v1.y + v2.y
	)

}

let vecDot = (v1, v2) => {

	return v1.x * v2.x + v1.y * v2.y

}

let vecMul = (v, s) => {

	return Vec(
		v.x * s,
		v.y * s
	)

}

let vecInverse = (v) => {

	return Vec(
		-v.x,
		-v.y
	)

}

let distance = (x1, y1, x2, y2) => {

	return Math.sqrt(
		Math.pow(v1.x - v2.x, 2) +
		Math.pow(v1.y - v2.y, 2)
	)

}

let angle = (x1, y1, x2, y2) => {

	return Math.atan2(
		(y2 - y1),
		(x2 - x1)
	)

}

let random = (value) => {

	return Math.floor(
		Math.random() * value
	)

}

let mod = (n, m) => {

	return ((n % m) + m) % m

}

let pntRect = (px, py, rx, ry, w, h) => {

	return (
		px >= rx &&
		py >= ry &&
		px <= rx + w &&
		py <= ry + h
	)

}

let choose = (t) => {

	return t[random(t.length)]

}

let sign = (x) => {

	if (x > 0) {
		return 1
	} else if (x == 0) {
		return 0
	} else {
		return -1
	}

}

let intersectRect = (x1, y1, w1, h1, x2, y2, w2, h2) => {

	return not (
		x2 >= x1 + w1 ||
		x2 + w2 <= x1 ||
		y2 >= y1 + h1 ||
		y2 + h2 <= y1
	)

}

// Set up Graphics
let gameSurface = document.getElementById('surface')
let gameContext = gameSurface.getContext('2d')

let gameView = {

	x: 0,
	y: 0,
	asp: 1,
	xOffset: 0,
	yOffset: 0,
	xMouse: 0,
	yMouse: 0,
	checkMouse: false,
	mouseUp: undefined,

	adapt(pixelated) {

		this.asp = innerHeight / gameSurface.height

		let vw = gameSurface.width * this.asp
		let vh = gameSurface.height * this.asp

		this.xOffset = (innerWidth - vw) * 0.5

		if (vw > innerWidth)
		{

			this.asp = innerWidth / gameSurface.width

			vw = gameSurface.width * this.asp
			vh = innerHeight

			gameSurface.height = vh / this.asp
			
			this.xOffset = 0

		}

		gameSurface.style.width = vw + 'px'
		gameSurface.style.height = vh + 'py'
		
		gameSurface.style.top = this.yOffset
		gameSurface.style.left = this.xOffset
		gameSurface.style.position = 'fixed'

		gameContext.imageSmoothingEnabled = false
		if (pixelated) {
			gameSurface.style.imageRendering = 'pixelated'
		}

		// Set up input
		addEventListener(
			'mousemove',
			(e) => {
				this.xMouse = (e.clientX - this.xOffset) / this.asp
				this.yMouse = (e.clientY - this.yOffset) / this.asp
			}
		)
		addEventListener(
			'mousedown',
			(e) => {
				if (e.which == 1)
				{
					this.checkMouse = true
				}
			}
		)
		addEventListener(
			'mouseup',
			(e) => {
				if (e.which == 1)
				{
					this.checkMouse = false

					if (this.mouseUp) {
						this.mouseUp()
					}
				}
			}
		)
		addEventListener(
			'touchmove',
			(e) => {
				this.xMouse = (e.changedTouches[0].clientX - this.xOffset) / this.asp
				this.yMouse = (e.changedTouches[0].clientY - this.yOffset) / this.asp
			}
		)
		addEventListener(
			'touchstart',
			(e) => {
				this.checkMouse = true
				
				this.xMouse = (e.changedTouches[0].clientX - this.xOffset) / this.asp
				this.yMouse = (e.changedTouches[0].clientY - this.yOffset) / this.asp
			}
		)
		addEventListener(
			'touchend',
			(e) => {
				this.checkMouse = false

				if (this.mouseUp) {
					this.mouseUp()
				}
			}
		)

	}

}

let textureLoader = {

	data: [],
	names: [],
	loaded: false,
	_load: 0,

	add(name) {

		return this.names.push(name) - 1

	},

	load() {

		for (
			let i = 0;
			i < this.names.length;
			i ++
		)
		{
			let img = new Image()
			img.src = this.names[i]
			img.onload = () => {

				textureLoader._load ++
				if (textureLoader._load >= textureLoader.names.length) {

					textureLoader.loaded = true

				}

			}

			this.data.push(img)
		}

	}

}

let audioLoader = {

	data: [],
	channels: 6,

	add(name) {

		let soundData = {
			index: 0,
			data: []
		}

		for (let i = 0; i < this.channels; i ++)
		{
			let sound = new Audio()
			sound.src = name
			soundData.data.push(sound)
		}

		return this.data.push(soundData) - 1

	},

	soundPlay(sound) {

		this.data[sound].index ++
		if (this.data[sound].index >= this.channels)
		{
			this.data[sound].index = 0
		}

		this.data[sound].play()

	}

}

let Sprite = (name, number) => {

	let _data = []
	for (
		let i = 0;
		i < number;
		i ++
	)
	{
		_data.push(
			textureLoader.add(
				name + i.toString() + '.png'
			)
		)
	}

	return {

		data: _data,
		frames: number,

		draw(index, x, y, rotate, xscale, yscale) {

			gameContext.save()
			gameContext.translate(
				x || 0,
				y || 0
			)
			gameContext.rotate(
				rotate || 0
			)
			gameContext.scale(
				xscale || 1,
				yscale || 1
			)
			let toDraw = textureLoader.data[this.data[index || 0]]
			gameContext.drawImage(
				toDraw,
				-toDraw.width / 2,
				-toDraw.height / 2
			)
			gameContext.restore()

		},

		getWidth() {

			return textureLoader.data[this.data[0]].width

		},

		getHeight() {

			return textureLoader.data[this.data[0]].height

		}

	}

}

// Object
let GameObject = (sprite) => {

	return {

		x: 0,
		y: 0,
		position: Vec(0, 0),
		speed: Vec(0, 0),
		friction: 0,
		angle: 0,
		xScale: 1,
		yScale: 1,
		hitBox: {
			x: -2,
			y: -2,
			w: 4,
			h: 4
		},

		sprite: sprite,
		animation: 0,
		animationSpeed: 0,
		index: 0,

		step() {

			// Animation
			if (this.animationSpeed > 0)
			{

				this.animation += this.animationSpeed
				if (this.animation >= this.sprite.frames)
				{
					this.animation = 0
				}
				this.index = Math.floor(this.animation)

			}

			// Motion
			this.position = vecAdd(this.position, this.speed)
			this.speed = vecAdd(this.speed, vecMul(vecInverse(this.speed), this.friction))

		},

		clampSpeed(value) {

			this.speed = vecMul(
				vecNorm(this.speed),
				Math.min(
					vecLen(this.speed),
					value
				)
			)

		},

		setHitBox(w, h) {

			this.hitBox.x = -w / 2
			this.hitBox.y = -h / 2
			this.hitBox.w = w
			this.hitBox.h = h

		},

		checkCollision(other) {

			return intersectRect(
				this.position.x + this.hitBox.x,
				this.position.y + this.hitBox.y,
				this.hitBox.w,
				this.hitBox.h,
				other.position.x + other.hitBox.x,
				other.position.y + other.hitBox.y,
				other.hitBox.w,
				other.hitBox.h
			)

		},

		drawSelf() {

			this.sprite.draw(
				this.index,
				this.animation,
				this.position.x,
				this.position.y,
				this.angle,
				this.xScale,
				this.yScale
			)

		}

	}

}

// Object Manager
let objectManager = {

	data: [],
	typeData: {},

	add(obj, tag) {

		this.data.push(obj)
		if (tag)
		{
			let num = -1

			if (tag in this.typeData)
			{
				num = this.typeData[tag].push(obj) - 1
			}
			else
			{
				this.typeData[tag] = []
				num = this.typeData[tag].push(obj) - 1
			}

			obj.__tag__ = tag
		}

		return obj

	},

	update() {

		this.data.forEach(
			(value, index) => {

				let result = value.update()
				if (result == 1) {

					if ('__tag__' in value) {
						this.typeData[value.__tag__].splice(
							this.typeData[value.__tag__].indexOf(value),
							1
						)
					}
					delete this.data[index]
					this.data.splice(index, 1)

				}

			}
		)

	},

	draw() {

		this.data.forEach(
			(value, index) => {

				value.draw()

			}
		)

	}

}

let Game = {

	start() {

		this.backColor = '#8080FF'

		if (this.load) {
			this.load()
		}

		this.loop()

	},

	_draw() {

		gameContext.fillStyle = Game.backColor
		gameContext.fillRect(0, 0, gameSurface.width, gameSurface.height)
		gameContext.fillStyle = '#FFFFFF'

		objectManager.update()
		objectManager.draw()

	},

	draw() {

		Game._draw()

	},

	loop() {

		if (textureLoader.loaded)
		{

			Game.draw()

		}

		window.requestAnimationFrame(Game.loop, 1 / 30)

	}

}

let vk = {

	init() {

		vkBridge.send('VKWebAppInit')

	},

	showAd() {

		vkBridge.send("VKWebAppShowNativeAds", {ad_format:"preloader"})
		.then(data => console.log(data.result))
		.catch(error => console.log(error));

	}

}

// Game Content
gameView.adapt(true)

let sprFist = Sprite('./img/fist', 1)
let sprAttack = Sprite('./img/attack', 1)
let sprLegs = Sprite('./img/dLegs', 11)
let sprCat = Sprite('./img/cats', 8)
let sprHat = Sprite('./img/hat', 2)
let sprWeapon = Sprite('./img/weapon', 2)

let CreateLegs = () => {

	let obj = GameObject(sprLegs)

	obj.angle = Math.random() * pi * 2
	obj.animationSpeed = 0.2
	obj.xScale = 10
	obj.yScale = 10

	obj.update = () => {

		obj.step()

		obj.position.x = gameView.xMouse
		obj.position.y = gameView.yMouse

		obj.angle += 0.1

		return 0

	}

	obj.draw = () => {

		obj.sprite.draw(
			obj.index,
			obj.position.x, obj.position.y,
			obj.angle,
			obj.xScale,
			obj.yScale
		)

	}

	return obj

}
let CreateCat = (x, y) => {

	let obj = GameObject(sprCat)

	obj.angle = Math.random() * pi * 2
	obj.position.x = x || 0
	obj.position.y = y || 0
	obj.xScale = 2
	obj.yScale = 2
	obj.life = 120 + random(540)
	obj.animationSpeed = 0
	obj.index = random(obj.sprite.frames - 1)
	obj.hat = random(2)
	obj.weapon = random(2)

	let dir = Math.random() * pi * 2
	obj.speed = Vec(
		cos(dir) * 1,
		-sin(dir) * 1
	)
	obj.side = sign(obj.speed.x - 0)

	obj.update = () => {

		obj.step()

		obj.position.x = mod(obj.position.x, gameSurface.width)
		obj.position.y = mod(obj.position.y, gameSurface.height)

		obj.angle += 0.1

		obj.yScale = 2 + sin(obj.angle * 2) * 0.1
		obj.xScale = 2 + sin(obj.angle * 2 + pi) * 0.1

		/*
		if (obj.life > 0) {
			obj.life --
		}
		else
		{
			return 1
		}
		*/

		return 0

	}

	obj.draw = () => {

		obj.sprite.draw(
			obj.index,
			obj.position.x, obj.position.y,
			0, //obj.angle,
			obj.xScale,
			obj.yScale
		)

		sprHat.draw(
			obj.hat,
			obj.position.x,
			obj.position.y - 22,
			0,
			obj.xScale * obj.side,
			obj.yScale
		)

		sprWeapon.draw(
			obj.weapon,
			obj.position.x - obj.side * 16,
			obj.position.y + 4,
			0,
			obj.xScale * obj.side,
			obj.yScale
		)

	}

	return obj

}

Game.load = () => {

	Game.mouseAngle = 0

	textureLoader.load()
	for (let i = 0; i < 5; i ++) {

		objectManager.add(
			CreateCat(random(gameSurface.width), random(gameSurface.height)),
			'cats'
		)

	}

}

Game.draw = () => {

	Game._draw()


	/*
	Game.mouseAngle += 0.05
	sprAttack.draw(
		0,
		gameView.xMouse,
		gameView.yMouse,
		Game.mouseAngle,
		8
	)
	gameContext.font = '10px monospace'
	let j = 0
	for (key in objectManager.typeData) {
		j ++
		gameContext.fillText(key + objectManager.typeData[key], 0, 32 + j * 32, 400)
	}
	*/

}

gameView.mouseUp = () => {

	objectManager.add(
		CreateCat(gameView.xMouse, gameView.yMouse),
		'cats'
	)

}

Game.start()