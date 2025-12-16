// Available Characters
export const CHARACTERS = {
  KAEN: 'kaen',
  KENJI: 'kenji',
  WAKASA: 'wakasa',
  SERENA: 'serena',
  ISABELLA: 'isabella'
}

// Character definitions
export const characterData = {
  [CHARACTERS.KAEN]: {
    name: 'Kaen',
    needsInvertedFlip: false, // Normal flip logic
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
        framesMax: 6,
        hitFrame: 4 // Frame when attack hits (0-indexed)
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
    offset: { x: 215, y: 157 },
    scale: 2.5
  },
  [CHARACTERS.KENJI]: {
    name: 'Kenji',
    needsInvertedFlip: true, // Inverted flip logic (like Fighter2)
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
        framesMax: 4,
        hitFrame: 2 // Frame when attack hits (0-indexed, middle of 4-frame animation)
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
      offset: { x: 80, y: 50 }, // Slightly closer than Kaen (100 -> 80)
      width: 160,
      height: 50
    },
    offset: { x: 215, y: 167 },
    scale: 2.5,
    chakraProjectile: {
      imagePaths: [
        './img/Ultimate5/ULT1.png',
        './img/Ultimate5/ULT2.png',
        './img/Ultimate5/ULT3.png',
        './img/Ultimate5/ULT4.png'
      ],
      framesMax: 4,
      scale: 0.45, // Scale down the Ultimate5 projectile (default is 0.5)
      yOffset: 70 // Lower the projectile (default is 50, so 80 makes it 30 pixels lower)
    }
  },
  [CHARACTERS.WAKASA]: {
    name: 'Wakasa',
    needsInvertedFlip: false, // Normal flip logic (can be adjusted if needed)
    sprites: {
      idle: {
        imageSrc: './img/wakasa/Idle.png',
        framesMax: 8 // Adjust based on actual sprite sheet
      },
      run: {
        imageSrc: './img/wakasa/Run.png',
        framesMax: 8
      },
      jump: {
        imageSrc: './img/wakasa/Jump.png',
        framesMax: 2
      },
      fall: {
        imageSrc: './img/wakasa/Fall.png',
        framesMax: 2
      },
      attack1: {
        imageSrc: './img/wakasa/Attack1.png',
        framesMax: 6,
        hitFrame: 4 // Frame when attack hits (0-indexed)
      },
      attack2: {
        imageSrc: './img/wakasa/Attack2.png',
        framesMax: 6
      },
      takeHit: {
        imageSrc: './img/wakasa/Take Hit.png',
        framesMax: 4
      },
      death: {
        imageSrc: './img/wakasa/Death.png',
        framesMax: 6
      }
    },
    attackBox: {
      offset: { x: 100, y: 50 },
      width: 160,
      height: 50
    },
    offset: { x: 150, y: 90 }, // Adjust based on sprite dimensions
    scale: 1.85, // Scaled down from 2.5
    chakraProjectile: {
      imagePaths: [
        './img/Ultimate4/ULT1.png',
        './img/Ultimate4/ULT2.png',
        './img/Ultimate4/ULT3.png',
        './img/Ultimate4/ULT4.png'
      ],
      framesMax: 4
    }
  },
  [CHARACTERS.SERENA]: {
    name: 'Serena',
    needsInvertedFlip: false, // Normal flip logic
    sprites: {
      idle: {
        imageSrc: './img/serena/Idle.png',
        framesMax: 8
      },
      run: {
        imageSrc: './img/serena/Run.png',
        framesMax: 8
      },
      jump: {
        imageSrc: './img/serena/Jump.png',
        framesMax: 2
      },
      fall: {
        imageSrc: './img/serena/Fall.png',
        framesMax: 2
      },
      attack1: {
        imageSrc: './img/serena/Attack.png', // Same sprite for both attacks
        framesMax: 6,
        hitFrame: 4 // Frame when attack hits (0-indexed)
      },
      attack2: {
        imageSrc: './img/serena/Attack.png', // Same sprite for both attacks
        framesMax: 6
      },
      takeHit: {
        imageSrc: './img/serena/Take Hit.png',
        framesMax: 4
      },
      death: {
        imageSrc: './img/serena/Death.png',
        framesMax: 6
      }
    },
    attackBox: {
      offset: { x: 100, y: 50 },
      width: 160,
      height: 50
    },
    offset: { x: 150, y: 100 },
    scale: 1.85,
    projectile: {
      imageSrc: './img/serenaprojectile.png',
      framesMax: 4
    },
    chakraProjectile: {
      imagePaths: [
        './img/Ultimate2/ULT1.png',
        './img/Ultimate2/ULT2.png',
        './img/Ultimate2/ULT3.png',
        './img/Ultimate2/ULT4.png'
      ],
      framesMax: 4,
      scale: 0.35 // Scale up the Ultimate2 projectile (default is 0.5)
    }
  },
  [CHARACTERS.ISABELLA]: {
    name: 'Isabella',
    needsInvertedFlip: false, // Normal flip logic
    hasMeleeAttack: false, // Isabella does not have melee attacks
    sprites: {
      idle: {
        imageSrc: './img/isabella/Idle.png',
        framesMax: 8
      },
      run: {
        imageSrc: './img/isabella/Run.png',
        framesMax: 8
      },
      jump: {
        imageSrc: './img/isabella/Jump.png',
        framesMax: 2
      },
      fall: {
        imageSrc: './img/isabella/Fall.png',
        framesMax: 2
      },
      attack1: {
        imageSrc: './img/isabella/Attack.png', // Same sprite for both attacks
        framesMax: 6,
        hitFrame: 4 // Frame when attack hits (0-indexed)
      },
      attack2: {
        imageSrc: './img/isabella/Attack.png', // Same sprite for both attacks
        framesMax: 6
      },
      takeHit: {
        imageSrc: './img/isabella/Take Hit.png',
        framesMax: 4
      },
      death: {
        imageSrc: './img/isabella/Death.png',
        framesMax: 6
      }
    },
    attackBox: {
      offset: { x: 100, y: 50 },
      width: 160,
      height: 50
    },
    offset: { x: 150, y: 100 },
    scale: 1.85,
    projectile: {
      imageSrc: './img/arrow.png',
      framesMax: 1, // Single frame projectile
      yOffset: -25 // Lower the arrow (default is -120, so -80 makes it 40 pixels lower)
    },
    chakraProjectile: {
      imagePaths: [
        './img/Ultimate3/ULT1.png',
        './img/Ultimate3/ULT2.png',
        './img/Ultimate3/ULT3.png',
        './img/Ultimate3/ULT4.png'
      ],
      framesMax: 4,
      scale: 0.35 // Scale down the Ultimate3 projectile (default is 0.5)
    }
  }
}

