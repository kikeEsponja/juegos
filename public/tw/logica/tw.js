let comenzar = document.getElementById('comenzar');

/* ****************************** BOTÓN DE REINICIO ************************************/
let repetir = document.getElementById('repetir');
repetir.addEventListener('click', ()=>{
    location.reload();
});

/* ****************************** BOTÓN PARA IR A INDEX ************************************/
let inicio = document.getElementById('inicio');
inicio.addEventListener('click', ()=>{
    window.location.href = 'https://juegos-l9bi.onrender.com/';
    //window.location.href = 'http://localhost:3000';
});

//*****************************VARIABLES GLOBALES********************************* */
const socket = io();
const btnPedir = document.getElementById('pedir');
const btnPlantarse = document.getElementById('plantarse');
const mazoVisual = document.getElementById('mazo');
const zonaJugador = document.getElementById('jugador');
const puntosDisplay = document.getElementById('puntos');
const estadoDisplay = document.getElementById('estado');

/* ****************************** FUNCIÓN QUE INICIA EL JUEGO ************************************/
btnPedir.addEventListener('click', () =>{
    socket.emit('pedir-carta');
    //desactivarBotones();
});

btnPlantarse.addEventListener('click', () =>{
    socket.emit('plantarse');
    btnPedir.disabled = true;
    btnPlantarse.disabled = true;
});

comenzar.addEventListener('click', ()=>{
    socket.emit('join-21');
    comenzar.disabled = true;
    comenzar.innerText = 'Buscando partida...';
});

socket.on('inicio-partida', () =>{
    estadoDisplay.innerText = 'Partida iniciada';
    zonaJugador.innerHTML = '';
    puntosDisplay.innerText = '0';
});

socket.on('recibir-carta', (data) =>{
    const nuevaCarta = document.createElement('div');
    nuevaCarta.classList.add('carta');
    nuevaCarta.textContent = data.carta;
    zonaJugador.appendChild(nuevaCarta);

    puntosDisplay.innerText = data.puntos;
});

socket.on('resultado', (data) =>{
    alert(`${data.mensaje}\nTu puntuación: ${data.misPuntos}\nRival: ${data.puntosRival}`);
    comenzar.disabled = false;
    comenzar.innerText = 'jugar de nuevo';
});