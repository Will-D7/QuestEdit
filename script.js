var character = document.querySelector(".character");
var map = document.querySelector(".map");

//comenzar en el centro del mapa
var x = 90;
var y = 34;
var held_directions = []; //Estado de qué teclas de flecha estamos manteniendo presionadas
var speed = 1; //Qué tan rápido se mueve el personaje en píxeles por cuadro

// Agregar lógica del juego Torres de Hanoi
var carried_square = null;
var poles = [
   { x: 32, y: 96, squares: [] },
   { x: 96, y: 96, squares: [] },
   { x: 160, y: 96, squares: [] }
];
var squares = [];

// Inicializar elementos del juego
function initializeGame() {
   // Crear elementos base de los postes (círculos/cuadrados vistos desde arriba)
   for (let i = 0; i < poles.length; i++) {
      const pole = poles[i];
      const poleEl = document.createElement("div");
      poleEl.className = "pole-base pixel-art";
      
      const pixelSize = parseInt(
         getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
      );
      
      poleEl.style.left = `${pole.x * pixelSize}px`;
      poleEl.style.top = `${pole.y * pixelSize}px`;
      
      map.appendChild(poleEl);
   }
   
   // Crear cuadrados (del más grande al más pequeño)
   for (let i = 4; i >= 1; i--) {
      const squareEl = document.createElement("div");
      squareEl.className = `square square-${i} pixel-art`;
      
      const square = {
         size: i,
         element: squareEl
      };
      
      map.appendChild(squareEl);
      squares.push(square);
      
      // Agregar todos los cuadrados al primer poste inicialmente
      poles[0].squares.push(square);
   }
   
   updateSquarePositions();
}

// Actualizar las posiciones de todos los cuadrados
function updateSquarePositions() {
   const pixelSize = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
   );
   
   // Posicionar cuadrados en los postes
   for (let p = 0; p < poles.length; p++) {
      const pole = poles[p];
      for (let s = 0; s < pole.squares.length; s++) {
         const square = pole.squares[s];
         if (square !== carried_square) {
            // Calcular tamaño del cuadrado (reducido a la mitad)
            const squareSize = square.size * 4 * pixelSize;
            
            // Posicionar cuadrado centrado en el poste (vista superior)
            square.element.style.left = `${(pole.x * pixelSize) - (squareSize / 2)}px`;
            square.element.style.top = `${(pole.y * pixelSize) - (squareSize / 2)}px`;
            
            // Establecer z-index basado en la posición de la pila (mayor = encima)
            square.element.style.zIndex = s + 2;
         }
      }
   }
   
   // Posicionar cuadrado cargado encima del personaje
   if (carried_square) {
      const squareSize = carried_square.size * 4 * pixelSize;
      carried_square.element.style.left = `${(x * pixelSize) - (squareSize / 2)}px`;
      carried_square.element.style.top = `${(y * pixelSize) - (squareSize / 2)}px`;
      carried_square.element.style.zIndex = 10; // Siempre en la parte superior cuando se carga
   }
}

// Verificar si el personaje puede recoger un cuadrado
function canPickUpSquare() {
   if (carried_square) return false; // Ya está cargando
   
   const facing = character.getAttribute("facing");
   let check_x = x;
   let check_y = y;
   
   // Ajustar posición de verificación basada en dirección
   if (facing === directions.right) check_x += 16;
   if (facing === directions.left) check_x -= 16;
   if (facing === directions.down) check_y += 16;
   if (facing === directions.up) check_y -= 16;
   
   // Verificar si está frente a algún poste
   for (let i = 0; i < poles.length; i++) {
      const pole = poles[i];
      if (Math.abs(check_x - pole.x) < 20 && Math.abs(check_y - pole.y) < 20) {
         // Lo suficientemente cerca de un poste con cuadrados
         if (pole.squares.length > 0) {
            return {
               pole: i,
               square: pole.squares[pole.squares.length - 1] // Obtener el cuadrado superior
            };
         }
      }
   }
   
   return false;
}

// Verificar si el personaje puede soltar el cuadrado cargado
function canDropSquare() {
   if (!carried_square) return false; // No está cargando
   
   const facing = character.getAttribute("facing");
   let check_x = x;
   let check_y = y;
   
   // Ajustar posición de verificación basada en dirección
   if (facing === directions.right) check_x += 16;
   if (facing === directions.left) check_x -= 16;
   if (facing === directions.down) check_y += 16;
   if (facing === directions.up) check_y -= 16;
   
   // Verificar si está frente a algún poste
   for (let i = 0; i < poles.length; i++) {
      const pole = poles[i];
      if (Math.abs(check_x - pole.x) < 20 && Math.abs(check_y - pole.y) < 20) {
         // Solo puede colocar cuadrados más pequeños encima de los más grandes (reglas de Hanoi)
         if (pole.squares.length === 0 || 
             pole.squares[pole.squares.length - 1].size > carried_square.size) {
            return i; // Puede colocar en este poste
         }
      }
   }
   
   return false;
}

// Verificar colisiones con cuadrados o postes
function checkCollisions(next_x, next_y) {
   // Caja de colisión del personaje
   const charWidth = 16;
   const charHeight = 16;
   
   // Verificar cada cuadrado para colisión
   for (let p = 0; p < poles.length; p++) {
      const pole = poles[p];
      
      // Verificar colisión con base del poste
      const poleSize = 8; // Reducido a la mitad
      const poleX = pole.x - (poleSize / 2);
      const poleY = pole.y - (poleSize / 2);
      
      if (next_x + charWidth > poleX && 
          next_x < poleX + poleSize && 
          next_y + charHeight > poleY && 
          next_y < poleY + poleSize) {
         return true; // Colisión con base del poste
      }
      
      // Verificar cuadrados en este poste
      for (let s = 0; s < pole.squares.length; s++) {
         const square = pole.squares[s];
         if (square !== carried_square) { // Omitir cuadrado cargado
            // Dimensiones del cuadrado (reducidas a la mitad)
            const squareSize = square.size * 4;
            
            // Posición del cuadrado (centrado en el poste)
            const squareX = pole.x - (squareSize / 2);
            const squareY = pole.y - (squareSize / 2);
            
            // Verificar colisión
            if (next_x + charWidth > squareX && 
                next_x < squareX + squareSize && 
                next_y + charHeight > squareY && 
                next_y < squareY + squareSize) {
               return true; // Colisión detectada
            }
         }
      }
   }
   
   return false; // Sin colisión
}

// Modificar la función placeCharacter para incluir detección de colisiones
const placeCharacter = () => {
   var pixelSize = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
   );
   
   const held_direction = held_directions[0];
   if (held_direction) {
      let next_x = x;
      let next_y = y;
      
      if (held_direction === directions.right) {next_x += speed;}
      if (held_direction === directions.left) {next_x -= speed;}
      if (held_direction === directions.down) {next_y += speed;}
      if (held_direction === directions.up) {next_y -= speed;}
      
      // Solo moverse si no hay colisión
      if (!checkCollisions(next_x, next_y)) {
         x = next_x;
         y = next_y;
      }
      
      character.setAttribute("facing", held_direction);
   }
   character.setAttribute("walking", held_direction ? "true" : "false");
   
   //Límites (da la ilusión de paredes)
   var leftLimit = -8;
   var rightLimit = (16 * 11)+8;
   var topLimit = -8 + 32;
   var bottomLimit = (16 * 7);
   if (x < leftLimit) { x = leftLimit; }
   if (x > rightLimit) { x = rightLimit; }
   if (y < topLimit) { y = topLimit; }
   if (y > bottomLimit) { y = bottomLimit; }
   
   
   var camera_left = pixelSize * 66;
   var camera_top = pixelSize * 42;
   
   map.style.transform = `translate3d( ${-x*pixelSize+camera_left}px, ${-y*pixelSize+camera_top}px, 0 )`;
   character.style.transform = `translate3d( ${x*pixelSize}px, ${y*pixelSize}px, 0 )`;  
   
   // Actualizar posición de todos los cuadrados
   updateSquarePositions();
}

//Configurar el bucle del juego
const step = () => {
   placeCharacter();
   window.requestAnimationFrame(() => {
      step();
   })
}
step(); //¡iniciar el primer paso!

/* Estado de las teclas de dirección */
const directions = {
   up: "up",
   down: "down",
   left: "left",
   right: "right",
}
const keys = {
   38: directions.up,
   37: directions.left,
   39: directions.right,
   40: directions.down,
}
document.addEventListener("keydown", (e) => {
   var dir = keys[e.which];
   if (dir && held_directions.indexOf(dir) === -1) {
      held_directions.unshift(dir)
   }
   
   // Barra espaciadora para recoger o soltar cuadrados
   if (e.keyCode === 32) { // Barra espaciadora
      if (carried_square) {
         // Intentar soltar el cuadrado
         const pole_index = canDropSquare();
         if (pole_index !== false) {
            // Colocar en el poste
            poles[pole_index].squares.push(carried_square);
            carried_square = null;
         }
      } else {
         // Intentar recoger un cuadrado
         const pickup = canPickUpSquare();
         if (pickup) {
            carried_square = pickup.square;
            poles[pickup.pole].squares.pop(); // Quitar del poste
         }
      }
   }
})

document.addEventListener("keyup", (e) => {
   var dir = keys[e.which];
   var index = held_directions.indexOf(dir);
   if (index > -1) {
      held_directions.splice(index, 1)
   }
});

// Inicializar el juego cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', initializeGame);