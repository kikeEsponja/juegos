let comenzar = document.getElementById('comenzar');

const socket = io();

let cartas = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];
function start(){
        comenzar.addEventListener('click', ()=>{
        let cartasBarajadas = cartas.sort(() => Math.random() - 0.5);

        for(let i = 0; i < cartasBarajadas.length; i++){
            let ficha = document.getElementById('mazo');
            let dato = document.createElement('div');

            dato.classList.add('dato');
            dato.textContent = cartasBarajadas[i];
            dato.dataset.value = cartasBarajadas[i];
            dato.id = i;

            ficha.appendChild(dato);
        }
        comenzar.disabled = true;
    });
}

start();