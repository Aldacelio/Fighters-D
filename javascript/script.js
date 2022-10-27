const canvas = document.querySelector('canvas');
const contexto = canvas.getContext('2d');
const champion = document.querySelector('#champion');
const nome = document.querySelector('#nome');


canvas.width = 1024;
canvas.height = 576;

contexto.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: '../Images/background.png'
});

const shop = new Sprite({
    position: {
        x: 600,
        y: 128
    },
    imageSrc: '../Images/shop.png',
    scale: 2.75,
    frameMax: 6
});

const player = new Figther({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: '../Images/Player1/Idle.png',
    frameMax: 8,
    scale: 2.5,
    offset: {
        x: 215,
        y: 157
    },
    sprites: {
        idle: {
            imageSrc: '../Images/Player1/Idle.png',
            frameMax: 8
        },
        run: {
            imageSrc: '../Images/Player1/Run.png',
            frameMax: 8
        },
        jump: {
            imageSrc: '../Images/Player1/Jump.png',
            frameMax: 2
        },
        fall: {
            imageSrc: '../Images/Player1/Fall.png',
            frameMax: 2
        },
        attack1: {
            imageSrc: '../Images/Player1/Attack1.png',
            frameMax: 6
        },
        takeHit: {
            imageSrc: '../Images/Player1/Take Hit - white silhouette.png',
            frameMax: 4
        },
        death: {
            imageSrc: '../Images/Player1/Death.png',
            frameMax: 6
        }

    },
    attackBox: {
        offset: {
            x: 50,
            y: 50
        },
        width: 180,
        height: 50
    }
});

const enemy = new Figther({
    position: {
        x: 400,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0
    },
    imageSrc: '../Images/Player2/Idle.png',
    frameMax: 4,
    scale: 2.5,
    offset: {
        x: 215,
        y: 167
    },
    sprites: {
        idle: {
            imageSrc: '../Images/Player2/Idle.png',
            frameMax: 4
        },
        run: {
            imageSrc: '../Images/Player2/Run.png',
            frameMax: 8
        },
        jump: {
            imageSrc: '../Images/Player2/Jump.png',
            frameMax: 2
        },
        fall: {
            imageSrc: '../Images/Player2/Fall.png',
            frameMax: 2
        },
        attack1: {
            imageSrc: '../Images/Player2/Attack1.png',
            frameMax: 4
        },
        takeHit: {
            imageSrc: '../Images/Player2/Take hit.png',
            frameMax: 3
        },
        death: {
            imageSrc: '../Images/Player2/Death.png',
            frameMax: 7
        }
    },
    attackBox: {
        offset: {
            x: -190,
            y: 50
        },
        width: 190,
        height: 50
    }
});

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowUp: {
        pressed: false
    }
}

decreaseTimer();

function animate() {
    window.requestAnimationFrame(animate);
    contexto.fillStyle = 'black';
    contexto.fillRect(0, 0, canvas.width, canvas.height);
    background.update();
    shop.update();
    player.update();
    enemy.update();

    player.velocity.x = 0;
    enemy.velocity.x = 0;

    //player 1 moviment
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5;
        player.switchSprite('run');
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5;
        player.switchSprite('run');
    } else {
        player.switchSprite('idle');
    }

    //jumping player 1
    if (player.velocity.y < 0) {
        player.switchSprite('jump');
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall');
    }

    //player 2 moviment
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5;
        enemy.switchSprite('run');
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5;
        enemy.switchSprite('run');
    } else {
        enemy.switchSprite('idle');
    }

    //jumping player 2
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump');
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall');
    }

    //detect for collision
    if (
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        player.isAttacking && player.frameCurrent === 4
    ) {
        enemy.takeHit(10)
        player.isAttacking = false;

        gsap.to('#enemyHealth',{
            width: enemy.health + '%'
        });
    }

    //Player 1 miss
    if (player.isAttacking && player.frameCurrent === 4) {
        player.isAttacking = false;
    }

    if (
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) &&
        enemy.isAttacking && enemy.frameCurrent === 2
    ) {
        player.takeHit(5)
        enemy.isAttacking = false;
        gsap.to('#playerHealth',{
            width: player.health + '%'
        });
    }

    //Player 2 miss
    if (enemy.isAttacking && enemy.frameCurrent === 2) {
        enemy.isAttacking = false;
    }

    //end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId });
    }

}

animate();

window.addEventListener('keydown', (event) => {
    if (!player.dead) {
        switch (event.key) {

            //player1
            case 'd':
                keys.d.pressed = true;
                player.lastKey = 'd';
                break;
            case 'a':
                keys.a.pressed = true;
                player.lastKey = 'a'
                break;
            case 'w':
                player.velocity.y = -20
                break;
            case ' ':
                player.attack();
                break;
        }
    }

    if (!enemy.dead) {
        switch (event.key) {
            //player 2
            case 'ArrowRight':
                keys.ArrowRight.pressed = true;
                enemy.lastKey = 'ArrowRight';
                break;
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = 'ArrowLeft';
                break;
            case 'ArrowUp':
                enemy.velocity.y = -20;
                break;
            case 'ArrowDown':
                enemy.attack();
                break;
        }
    }
});

window.addEventListener('keyup', (event) => {

    //player 1
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
    }

    //player 2
    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
    }
});