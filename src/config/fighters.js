// Fighter Configurations

export function getPlayer1FighterConfig() {
  return {
    position: { x: 100, y: 0 },
    velocity: { x: 0, y: 0 },
    offset: { x: 215, y: 157 },
    imageSrc: './img/kaen/Idle.png',
    framesMax: 8,
    scale: 2.5,
    sprites: {
      idle: {
        imageSrc: './img/kaen/Idle.png',
        framesMax: 8
      },
      run: {
        imageSrc: './img/kaen/Run.png',
        framesMax: 8
      },
      jump: {
        imageSrc: './img/kaen/Jump.png',
        framesMax: 2
      },
      fall: {
        imageSrc: './img/kaen/Fall.png',
        framesMax: 2
      },
      attack1: {
        imageSrc: './img/kaen/Attack1.png',
        framesMax: 6
      },
      attack2: {
        imageSrc: './img/kaen/Attack2.png',
        framesMax: 6
      },
      takeHit: {
        imageSrc: './img/kaen/Take Hit - white silhouette.png',
        framesMax: 4
      },
      death: {
        imageSrc: './img/kaen/Death.png',
        framesMax: 6
      }
    },
    attackBox: {
      offset: { x: 100, y: 50 },
      width: 160,
      height: 50
    },
    isPlayer: true
  }
}

export function getPlayer2FighterConfig() {
  return {
    position: { x: 804, y: 0 }, // canvas.width - 220
    velocity: { x: 0, y: 0 },
    offset: { x: 215, y: 167 },
    imageSrc: './img/kenji/Idle.png',
    framesMax: 4,
    scale: 2.5,
    sprites: {
      idle: {
        imageSrc: './img/kenji/Idle.png',
        framesMax: 4
      },
      run: {
        imageSrc: './img/kenji/Run.png',
        framesMax: 8
      },
      jump: {
        imageSrc: './img/kenji/Jump.png',
        framesMax: 2
      },
      fall: {
        imageSrc: './img/kenji/Fall.png',
        framesMax: 2
      },
      attack1: {
        imageSrc: './img/kenji/Attack1.png',
        framesMax: 4
      },
      attack2: {
        imageSrc: './img/kenji/Attack2.png',
        framesMax: 6
      },
      takeHit: {
        imageSrc: './img/kenji/Take hit.png',
        framesMax: 3
      },
      death: {
        imageSrc: './img/kenji/Death.png',
        framesMax: 7
      }
    },
    attackBox: {
      offset: { x: -170, y: 50 },
      width: 170,
      height: 50
    },
    isPlayer: false
  }
}
