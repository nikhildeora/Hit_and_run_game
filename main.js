import { Player } from "./player.js";
import { InputHandler } from "./input.js";
import { Background } from "./background.js";
import { FlyingEnemy, GroundEnemy, ClimbingEnemy } from "./enemy.js";
import { UI } from "./ui.js";

window.addEventListener("load", function () {
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 900;
    canvas.height = 500;

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.groundMargin = 40;
            this.speed = 0;
            this.maxSpeed = 4;
            this.debug = false;
            this.score = 0;
            this.fontColor = "black";
            this.time = 0;
            this.maxTime = 30000;
            this.winningScore = 40;
            this.gameOver = false;
            this.lives = 5;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.particles = [];
            this.enemies = [];
            this.collisions = [];
            this.floatingMessages = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.maxParticles = 50;
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
            this.diveSound = new Audio();
            this.diveSound.src = "./assets/Wind_effects_5.wav";
            this.hitSound = new Audio();
            this.hitSound.src = "./assets/Healing_Full.wav";
            this.scoreSound = new Audio();
            this.scoreSound.src = "./assets/Ice_attack_2.wav";
        }
        update(deltaTime) {
            this.time += deltaTime;
            if(this.time > this.maxTime) this.gameOver = true;

            this.background.update();
            this.player.update(this.input.keys, deltaTime);

            // handle enemies 
            if (this.enemyTimer > this.enemyInterval) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
            this.enemies.forEach((enemy) => {
                enemy.update(deltaTime);
            })
            // handle particles 
            this.particles.forEach((particle)=>{
                particle.update();
            });
            if(this.particles.length > this.maxParticles){
                this.particles.length = this.maxParticles;
            }
            // handle collision sprites 
            this.collisions.forEach((collision) => {
                collision.update(deltaTime);
            })
            // handle floating messages 
            this.floatingMessages.forEach((floatingMessage) => {
                floatingMessage.update();
            })
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);
            this.collisions = this.collisions.filter(collision => !collision.markedForDeletion);
            this.floatingMessages = this.floatingMessages.filter(message => !message.markedForDeletion);
        }
        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            })
            this.UI.draw(context);
            // handle particles 
            this.particles.forEach((particle)=>{
                particle.draw(context);
            });
            // handle collision 
            this.collisions.forEach((collision)=>{
                collision.draw(context);
            });
            // handle floating messages 
            this.floatingMessages.forEach((floatingMessage) => {
                floatingMessage.draw(context);
            })
        }
        addEnemy() {
            this.enemies.push(new FlyingEnemy(this));
            if (this.speed > 0 && Math.random() < 0.5) {
                this.enemies.push(new GroundEnemy(this));
            } else if (this.speed > 0) {
                this.enemies.push(new ClimbingEnemy(this));
            }
        }
        restart(){
            this.speed = 0;
            this.debug = false;
            this.score = 0;
            this.time = 0;
            this.gameOver = false;
            this.lives = 5;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.particles = [];
            this.enemies = [];
            this.collisions = [];
            this.floatingMessages = [];
            this.enemyTimer = 0;
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
        }
    }

    const game = new Game(canvas.width, canvas.height); 
    let lastTime = 0;
    let lastTimeFunRun = true;

    function lastTimeInc(timeStamp){
        lastTime = timeStamp;
        if(lastTimeFunRun) requestAnimationFrame(lastTimeInc);
    }
    lastTimeInc(0);

    function animate(timeStamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        game.draw(ctx);
        game.update(deltaTime);
        if(!game.gameOver){
             requestAnimationFrame(animate)
            }
        else {
            game.draw(ctx)
            lastTimeFunRun = true;
            requestAnimationFrame(lastTimeInc);
        };
    }

    

    function defaultAnimate(){
        game.draw(ctx);
        game.update(0);
    }
    defaultAnimate();



    startButton.onclick = () => {
        if(!game.gameOver){
            lastTimeFunRun = false;
            requestAnimationFrame(animate);
        }else{
            game.restart();
            lastTimeFunRun = false;
            requestAnimationFrame(animate);
        }
    }

    toggleButton.onclick = () => {
        if(!document.fullscreenElement){
            canvas.requestFullscreen().then().catch(err=>{
                alert(`Error can't enable full screen mode, ${err.message}`)
            });
        }else{
            document.exitFullscreen();
        }
    }

    this.setTimeout(()=>{
       window.location.reload(); 
    },900000);
    
})