// Create the canvas
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);

var enemyFrequency = 150;
var angle=45;
var enemySpeed = 3;
var tickCount = 0;
var currentWave=1;
var score=0;
var mX=0,mY=0;
var soundsEnabled=true;
var paused=true;
var powerUpSpeed=1;
var shouldCreateEnemies = false;
var enemies = [];
var backgroundSound;
var hero = {
	x:canvas.width/2,
	y:canvas.height/2,
	width:16,
	height:16,
	alive:true
};

var anim = {
	x:canvas.width/2,
	y:canvas.height/2,
	width:64,
	height:64,
	alive:false,
	imgIndex:0
};
var powerUps = [];

var spriteSheet = new Image();
var spriteSheetReady = false;
spriteSheet.onload = function(){
	spriteSheetReady = true;
};
spriteSheet.src="images/spritesheet.png";

var keysDown = {};
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);
canvas.addEventListener("click", onClick, false);

backgroundSound = new Audio('sounds/hard.mp3'); 
backgroundSound.addEventListener('ended', function() {
	if(soundsEnabled){
		this.currentTime = 0;
		this.play();
	}
}, false);
if(soundsEnabled){
	backgroundSound.play();
}

var reset = function () {
	hero.x = mX;
	hero.y = mY;
	hero.alive=true;
	tickCount = 0;
	enemyFrequency = 150;
	enemySpeed = 3;
	score=0;
	powerUpSpeed=1;
	currentWave=1;
	powerUps=[];
	enemies=[];
	tickCount=0;
	mX=0,mY=0;	
	anim.alive = false;
	anim.imgIndex = 0;	
	shouldCreateEnemies = true;
};

function onClick(e) {
	if(paused){
		paused = false;
	}else{
		if(!hero.alive){
			reset();
			adjustTimer();
			adjustPowerUpTimer(randomInt(5000,8000));
		}
	}
}
function handleMouseCoordinates(event){
	if(!paused && hero.alive){
		mX = event.clientX;
		mX-=30;
		mY = event.clientY;
		mY-=52;
		hero.x = mX;
		hero.y=mY;
	}
}

var update = function (modifier) {
	if (83 in keysDown) {
		keysDown=[];
		soundsEnabled = !soundsEnabled;
		if(soundsEnabled){
			backgroundSound.currentTime=0;
			backgroundSound.play();
		}else{
			backgroundSound.pause();
			backgroundSound.currentTime=0;			
		}
	}
	if(!paused){
		
		tickCount++;
		
		if (80 in keysDown) {
			if(!paused){
				paused = true;
			}
		}
		
		for(var i = enemies.length -1; i >= 0 ; i--){
			if(enemies[i].y>=500){
				enemies.splice(i, 1);
			}
		}
		for(var i = enemies.length -1; i >= 0 ; i--){
			if(enemies[i].x<0){
				enemies.splice(i, 1);
			}
		}
		for (var i = 0; i < powerUps.length; i++) {
			var temp = powerUps[i];
			temp.x-=(enemySpeed*2)*Math.cos(angle);
			temp.y+=(enemySpeed*2)*Math.sin(angle);
		}
		
		
		for(var i = powerUps.length -1; i >= 0 ; i--){
			if(powerUps[i].y>=500){
				powerUps.splice(i, 1);
			}
		}
		for(var i = powerUps.length -1; i >= 0 ; i--){
			if(powerUps[i].x<0){
				powerUps.splice(i, 1);
			}
		}
		for(var i = powerUps.length -1; i >= 0 ; i--){
			if(!powerUps[i].alive){
				powerUps.splice(i, 1);
			}
		}
		

		for (var i = 0; i < enemies.length; i++) {
			var temp = enemies[i];
			temp.x-=enemySpeed*Math.cos(angle);
			temp.y+=enemySpeed*Math.sin(angle);
		}
		
		if(hero.alive){
			
		for (var i = 0; i < powerUps.length; i++) {
			var temp = powerUps[i];
			if(isColliding(hero.x+hero.width/2,hero.y+hero.height/2,hero.width/2,temp.x+temp.width/2,temp.y+temp.height/2,temp.width/2)){
				temp.alive=false;
				givePoints(randomInt(currentWave*10,currentWave*20));
			}
		}
		
			if(tickCount > 0 && tickCount % 20 == 0){
				score++;
			}
			if(tickCount > 0 && tickCount % 1000 == 0){
				powerUpSpeed*=1.3;
				adjustPowerUpTimer(randomInt(5000/powerUpSpeed,8000/powerUpSpeed));
				currentWave++;
				enemySpeed*=1.2;
				if(soundsEnabled){
					var audio = new Audio('sounds/up.wav');
					audio.play();
				}
				if(enemyFrequency>50){
					enemyFrequency-=30;
					adjustTimer();				
				}
			}
		
			for (var i = 0; i < enemies.length; i++) {
				var temp = enemies[i];
				if(isColliding(hero.x+hero.width/2,hero.y+hero.height/2,hero.width/2,temp.x+temp.width/2,temp.y+temp.height/2,temp.width/2)){
					explode();
				}
			}
		}else{
			if(tickCount%4==0 && anim.alive){
				anim.imgIndex++;
				if(anim.imgIndex >= 16){
					anim.imgIndex = 0;
					anim.alive=false;
				}
			}
		}
	}
};
function givePoints(p){
	score+=p;
	if(soundsEnabled){
		var audio = new Audio('sounds/point.wav');
		audio.play();
	}
}
function explode(){
	hero.alive = false;
	anim.alive = true;
	anim.imgIndex=0;
	anim.x = hero.x - anim.width/2;
	anim.y = hero.y - anim.height/2;
	if(soundsEnabled){
		var audio = new Audio('sounds/explosion.wav');
		audio.play();
	}
}
var render = function () {
	if(spriteSheetReady){
		
		ctx.drawImage(spriteSheet,0,32,400,400,0,0,canvas.width,canvas.height);
		
		if(hero.alive){
			ctx.drawImage(spriteSheet,160,0,32,32,hero.x,hero.y,hero.width,hero.height);
		}
		
		for (var i = 0; i < enemies.length; i++) {
			var temp = enemies[i];
			if(temp.type == 1){
				ctx.drawImage(spriteSheet,0,0,32,32,temp.x,temp.y,temp.width,temp.height);
			}else if(temp.type == 2){
				ctx.drawImage(spriteSheet,32,0,32,32,temp.x,temp.y,temp.width,temp.height);
			}else if(temp.type == 3){
				ctx.drawImage(spriteSheet,64,0,32,32,temp.x,temp.y,temp.width,temp.height);
			}else if(temp.type == 4){
				ctx.drawImage(spriteSheet,96,0,32,32,temp.x,temp.y,temp.width,temp.height);
			}else{
				ctx.drawImage(spriteSheet,128,0,32,32,temp.x,temp.y,temp.width,temp.height);
			}
		}
		for (var i = 0; i < powerUps.length; i++) {
			var temp = powerUps[i];
			ctx.drawImage(spriteSheet,256,0,32,32,temp.x,temp.y,temp.width,temp.height);
		}
		
		if(anim.alive && anim.imgIndex < 16){
			ctx.drawImage(spriteSheet,400 + ((anim.imgIndex % 4)*64),(Math.floor(anim.imgIndex/4))*64,64,64,anim.x,anim.y,anim.width,anim.height);
		}
		
		if(soundsEnabled){
			ctx.drawImage(spriteSheet,192,0,32,32,8,460,32,32);
		}else{
			ctx.drawImage(spriteSheet,224,0,32,32,8,460,32,32);
		}
		
		if(!paused){
			if(!hero.alive){
				ctx.fillStyle="rgba(255, 255, 255, 0.5)";
				ctx.fillRect(0,0,canvas.width,canvas.height);
				
				ctx.fillStyle = "rgb(120, 180, 100)";
				ctx.font = "50px Helvetica";
				ctx.textAlign = "center";
				ctx.textBaseline = "bottom";
				ctx.fillText("SCORE: " + score, canvas.width/2,canvas.height/2);
				
				ctx.font = "25px Helvetica";
				ctx.fillText("Click to start", canvas.width/2,canvas.height/2+36);
				
			}else{
				ctx.fillStyle = "rgb(250, 250, 250)";
				ctx.font = "12px Helvetica";
				ctx.textAlign = "left";
				ctx.textBaseline = "top";
				ctx.fillText("STAGE: " + currentWave, 428, 16);
				ctx.fillText("POINTS: " + score, 20, 16);
			}
		}else{
			ctx.fillStyle="rgba(255, 255, 255, 0.5)";
			ctx.fillRect(0,0,canvas.width,canvas.height);
			
			ctx.fillStyle = "rgb(120, 180, 100)";
			ctx.font = "50px Helvetica";
			ctx.textAlign = "center";
			ctx.textBaseline = "bottom";
			ctx.fillText("PAUSED", canvas.width/2,canvas.height/2);
			
			ctx.font = "25px Helvetica";
			ctx.fillText("Click to start", canvas.width/2,canvas.height/2+36);
		}	
	}
};

var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;
	
	requestAnimationFrame(main);
};

var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

var then = Date.now();
reset();
main();

function createEnemy() {
	if(shouldCreateEnemies){
		var enemy={
			x:randomInt(500,1000),
			y:randomInt(-1000,0),
			width:8,
			height:8,
			type:randomInt(1,5)
		};
	  enemies.push(enemy);
	  
	}
};
var adjustTimer = function(){
    clearInterval(interval);
    interval = setInterval(createEnemy, enemyFrequency);
}
var interval = setInterval(createEnemy, enemyFrequency);
var powerUpInterval = setInterval(createPowerUp, randomInt(5000,8000));
var adjustPowerUpTimer = function(p){
    clearInterval(powerUpInterval);
    powerUpInterval = setInterval(createPowerUp, p);
}
function createPowerUp(){
	if(shouldCreateEnemies){
		var powerUp={
			x:randomInt(500,1000),
			y:randomInt(-1000,0),
			width:16,
			height:16,
			alive:true
		};
		powerUps.push(powerUp);
	}
};
function randomInt(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}
function isColliding(x0,y0,r0,x1,y1,r1){
	var low = (r0-r1)*(r0-r1);
	var high = (r0+r1)*(r0+r1);
	var dist = (x0-x1)*(x0-x1)+(y0-y1)*(y0-y1);
	if(low <= dist && dist <= high){
		return true;
	}
	return false;
	
}