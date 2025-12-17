// Collision Detection Utilities

export function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >=
      rectangle2.position.x &&
    rectangle1.attackBox.position.x <=
      rectangle2.position.x + rectangle2.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >=
      rectangle2.position.y &&
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  )
}

export function boxOverlap(box1, box2) {
  return (
    box1.x + box1.width >= box2.x &&
    box1.x <= box2.x + box2.width &&
    box1.y + box1.height >= box2.y &&
    box1.y <= box2.y + box2.height
  )
}

