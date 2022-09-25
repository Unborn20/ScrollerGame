'use strict';
window.addEventListener('load', function () {
    const canvas = document.getElementById('game');
    const context = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 720;

    let enemies = [];
    let score = 0;
    let gameOver = false;

    class InputHandler {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', ({ key }) => {
                if ((
                    key === 'ArrowDown' ||
                    key === 'ArrowUp' ||
                    key === 'ArrowLeft' ||
                    key === 'ArrowRight')
                    && !this.keys.includes(key)
                ) {
                    this.keys.push(key);
                }
            });
            window.addEventListener('keyup', ({ key }) => {
                if ((
                    key === 'ArrowDown' ||
                    key === 'ArrowUp' ||
                    key === 'ArrowLeft' ||
                    key === 'ArrowRight'
                )) {
                    this.keys.splice(this.keys.indexOf(key), 1);
                }
            })
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 10;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 8;
            this.speedX = 0;
            this.speedY = 0;
            this.weight = 1;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
        }

        draw(context) {
            context.drawImage(
                this.image,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }

        update(inputHandler, deltaTime, enemies) {
            /**
             * COLISSION DETECTION
             */
            enemies.forEach(enemy => {
                const distanceX = (enemy.x + enemy.width / 2) - (this.x + this.width / 2);
                const distanceY = (enemy.y + enemy.height / 2) - (this.y + this.height / 2);
                // const distanceX = enemy.x - this.x;
                // const distanceY = enemy.y - this.y;
                const distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

                if (distance < enemy.width / 2 + this.width / 2) {
                    gameOver = true;
                }
            });
            /**
             * SPRITE ANIMATION
             */
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            /**
             * CONTROLS
             */
            if (inputHandler.keys.indexOf('ArrowRight') > -1) {
                this.speedX = 5;
            }
            else if (inputHandler.keys.indexOf('ArrowLeft') > -1) {
                this.speedX = -5;
            }
            else if (inputHandler.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
                this.speedY -= 30;
            } else {
                this.speedX = 0;
            }

            /**
             * HORIZONTAL MOVEMENT
             */
            this.x += this.speedX;
            if (this.x < 0)
                this.x = 0;
            else if (this.x > (this.gameWidth - this.width))
                this.x = this.gameWidth - this.width

            /**
             * VERTICAL MOVEMENT
             */
            this.y += this.speedY;
            if (!this.onGround()) {
                this.speedY += this.weight;
                this.maxFrame = 5;
                this.frameY = 1;
            } else {
                this.speedY = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }

            if (this.y > this.gameHeight - this.height)
                this.y = this.gameHeight - this.height
        }

        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 3;
        }

        draw(context) {
            context.drawImage(
                this.image,
                this.x,
                this.y,
                this.width,
                this.height
            );
            context.drawImage(
                this.image,
                this.x + this.width - this.speed,
                this.y,
                this.width,
                this.height
            );
        }

        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('enemyOneImage');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 8;
            this.markForDeletion = false;
        }

        draw(context) {
            context.drawImage(
                this.image,
                this.frameX * this.width,
                0,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }

        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            this.x -= this.speed;

            if (this.x < 0 - this.width) {
                this.markForDeletion = true;
                score++;
            }
        }
    }

    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInteval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            randomEnemyInterval = Math.random() * 1000 + 500;
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }

        enemies.forEach(enemy => {
            enemy.draw(context);
            enemy.update(deltaTime);
        });

        enemies = enemies.filter(enemy => !enemy.markForDeletion);
    }

    function displayStatusText(context) {
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText(`Score: ${score}`, 20, 50);
        context.fillStyle = 'white';
        context.fillText(`Score: ${score}`, 22, 52);

        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('GAME OVER, YOU SICK!! xD', canvas.width / 2, 200);
            context.fillStyle = 'white';
            context.fillText('GAME OVER, YOU SICK!! xD', canvas.width / 2 + 2, 202);
        }
    }

    const inputHandler = new InputHandler();
    const background = new Background(canvas.width, canvas.height);
    const player = new Player(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInteval = 2000;
    let randomEnemyInterval = Math.random() * 1000 + 500;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        context.clearRect(0, 0, canvas.width, canvas.height);

        background.draw(context);
        //background.update();

        player.draw(context);
        player.update(
            inputHandler,
            deltaTime,
            enemies
        );

        handleEnemies(deltaTime);

        displayStatusText(context);

        if (!gameOver) requestAnimationFrame(animate);
    }
    animate(0);
});