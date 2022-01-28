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

let distance = (v1, v2) => {

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

let lerp = (x, y, t) => {

	return x + (y - x) * t

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
	xMouseView: 0,
	yMouseView: 0,
	checkMouse: false,
	mouseUp: undefined,
	mouseDown: undefined,
	mobileDevice: false,

	adapt(pixelated) {

		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
		{
			this.mobileDevice = true
		} else {
			this.mobileDevice = false
		}

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
		if (this.mobileDevice)
		{
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

					if (this.mouseDown) {
						this.mouseDown()
					}
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
		else
		{
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

						if (this.mouseDown) {
							this.mouseDown()
						}
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
		}

	},

	set() {

		gameContext.save()
		gameContext.translate(
			-this.x,
			-this.y
		)

	},

	reset() {

		gameContext.restore()

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

// Joystick
let joystick = {

	active: false,
	sprite: undefined,
	alpha: 0,
	screenPosition: Vec(0, 0),
	position: Vec(0, 0),
	direction: Vec(0, 0),
	distance: 128,
	currentDistance: 0,
	state: 0,
	scale: 1,

	setPos(uv) {

		this.screenPosition.x = uv.x * gameSurface.width
		this.screenPosition.y = uv.y * gameSurface.height

		this.position.x = this.screenPosition.x
		this.position.y = this.screenPosition.y

		this.state = 0

	},

	update() {

		if (gameView.checkMouse)
		{
			this.state = 1
			this.direction = vecNorm(
				Vec(
					gameView.xMouse - this.screenPosition.x,
					gameView.yMouse - this.screenPosition.y
				)
			)

			let dist = distance(
				this.screenPosition,
				Vec(
					gameView.xMouse,
					gameView.yMouse
				)
			)

			dist = Math.min(this.distance, dist)

			this.position.x = lerp(
				this.position.x,
				this.screenPosition.x + this.direction.x * dist,
				0.4
			)
			this.position.y = lerp(
				this.position.y,
				this.screenPosition.y + this.direction.y * dist,
				0.4
			)

			this.alpha = lerp(this.alpha, 1, 0.1)

			this.currentDistance = dist / this.distance

		} else {

			this.state = 0

			this.position.x = lerp(
				this.position.x,
				this.screenPosition.x,
				0.4
			)
			this.position.y = lerp(
				this.position.y,
				this.screenPosition.y,
				0.4
			)

			this.alpha = lerp(this.alpha, 0.2, 0.1)

			this.currentDistance = 0

		}

	},

	draw() {

		if (this.sprite) {

			gameContext.globalAlpha = this.alpha
			this.sprite.draw(
				0,
				this.screenPosition.x,
				this.screenPosition.y,
				0,
				this.scale,
				this.scale

			)
			this.sprite.draw(
				1,
				this.position.x,
				this.position.y,
				0,
				this.scale,
				this.scale

			)
			gameContext.globalAlpha = 1

		}

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

	_clear() {

		gameContext.fillStyle = Game.backColor
		gameContext.fillRect(0, 0, gameSurface.width, gameSurface.height)
		gameContext.fillStyle = '#FFFFFF'

	},

	_draw() {

		objectManager.update()
		objectManager.draw()

	},

	draw() {

		Game._clear()
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
let sprJoystick = Sprite('./img/joystick', 2)
let sprD1Floor = Sprite('./img/d1floor', 3)
let sprD1WallTop = Sprite('./img/d1wallTop', 4)
let sprD1Wall = Sprite('./img/d1wall', 1)

joystick.active = true
joystick.sprite = sprJoystick
joystick.setPos(Vec(0.5, 0.75))
joystick.distance = 100
joystick.scale = 2

let tiles = {

	data: [],
	w: gameSurface.width / (32 * 2),
	h: Math.ceil(gameSurface.height / (32 * 2)),
	xScale: 2,
	yScale: 2,
	x: 0,
	y: 0,

	init() {

		for (let i = 0; i < this.w; i ++) {
			let line = []
			for (let j = 0; j < this.h; j ++) {

				line.push(
					{
						sprite: sprD1Floor,
						index: 2,
					}
				)

			}
			this.data.push(line)
		}

	},

	gen() {

		for (let i = 0; i < this.w; i ++) {
			for (let j = 0; j < this.h; j ++) {

				this.data[i][j].index = choose([0, 1, 2])

				if (i == 0 && (j != 0 && j != this.h - 1)) {
					this.data[i][j].sprite = sprD1WallTop
					this.data[i][j].index = 3
				}
				if (i == this.w - 1 && (j != 0 && j != this.h - 1)) {
					this.data[i][j].sprite = sprD1WallTop
					this.data[i][j].index = 2
				}
				if (j == 0 && (i != 0 && i != this.w - 1)) {
					this.data[i][j].sprite = sprD1WallTop
					this.data[i][j].index = 1
				}
				if (j == this.h - 1 && (i != 0 && i != this.w - 1)) {
					this.data[i][j].sprite = sprD1WallTop
					this.data[i][j].index = 0
				}

				if (i == 0 && (j == 0 || j == this.h - 1)) {
					this.data[i][j].index = 2
				}
				if (i == this.w - 1 && (j == 0 || j == this.h - 1)) {
					this.data[i][j].index = 2
				}
				if (j == 1 && (i != 0 && i != this.w - 1)) {
					this.data[i][j].sprite = sprD1Wall
					this.data[i][j].index = 0
				}

			}
		}

	},

	draw() {

		gameContext.save()
		gameContext.translate(this.x, this.y)
		gameContext.scale(this.xScale, this.yScale)
		for (let i = 0; i < this.w; i ++) {
			for (let j = 0; j < this.h; j ++) {

				this.data[i][j].sprite.draw(
					this.data[i][j].index,
					i * 32 + 16, j * 32 + 16
				)

			}
		}
		gameContext.restore()

	}

}
tiles.init()
tiles.gen()

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

let CreatePlayer = (x, y) => {

	let obj = CreateCat(x, y)

	obj.speed = Vec(1, 0)
	obj.friction = 0.1

	obj.update = () => {

		let isMove = false
		if (joystick.active) {

			if (joystick.currentDistance > 0.2) {

				isMove = true
				obj.speed = vecAdd(
					obj.speed,
					vecMul(
						joystick.direction,
						1
					)
				)

			}

		}
		obj.clampSpeed(2)
		obj.side = sign(obj.speed.x - 0)
		if (obj.side == 0) {
			obj.side = 1
		}

		obj.step()
		obj.angle += 0.1

		obj.position.x = mod(obj.position.x, gameSurface.width)
		obj.position.y = mod(obj.position.y, gameSurface.height)

		if (isMove) {
			obj.yScale = 2 + sin(obj.angle * 2) * 0.1
			obj.xScale = 2 + sin(obj.angle * 2 + pi) * 0.1
		} else {
			obj.yScale = lerp(obj.xScale, 2, 0.1)
			obj.xScale = lerp(obj.yScale, 2, 0.1)
		}

		gameView.x = lerp(gameView.x, obj.position.x - gameSurface.width / 2, 0.15)
		gameView.y = lerp(gameView.y, obj.position.y - gameSurface.height / 2, 0.15)

		return 0

	}

	return obj

}

Game.load = () => {

	Game.mouseAngle = 0

	textureLoader.load()

	/*
	for (let i = 0; i < 8; i ++) {

		objectManager.add(
			CreateCat(random(gameSurface.width), random(gameSurface.height)),
			'cats'
		)

	}
	*/

	objectManager.add(
		CreatePlayer(
			gameSurface.width * 0.5,
			gameSurface.height * 0.5
		),
		'cats'
	)

}

Game.draw = () => {

	Game._clear()
	gameView.set()
	tiles.draw()
	Game._draw()
	gameView.reset()
	joystick.update()
	joystick.draw()

}

gameView.mouseDown = () => {

	joystick.setPos(
		Vec(
			gameView.xMouse / gameSurface.width,
			(gameView.yMouse + 2) / gameSurface.height
		)
	)

}

Game.start()