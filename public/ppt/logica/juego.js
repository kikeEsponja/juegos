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
const sonidoAcierto = new Audio('assets/sonidos/Rizz_sounds.mp3');
const sonidoPerder = new Audio('assets/sonidos/Spongebob.mp3');
const sonidoGanador = new Audio('assets/sonidos/ganador.mp3');
//let primeraCarta = null;
//let segundaCarta = null;
let bloqueoMesa = false;
//let movimientos = CONFIG.movimientos; //variable de configuración
let puntos = 0;
const PUNTOS_POR_ACIERTO = 100; //variable de configuración
let segundos = 20; //variable de configuración
let intervalo = null;
//let moves = document.getElementById('movimientos');
//moves.textContent = movimientos;
let habilitado = true;
//let cartas = CONFIG.cantidadDeCartas;

/* ****************************** FUNCIÓN PARA ANIMACIÓN DE PUNTOS ************************************/
function mostrarBonus(cantidad){
    const bonus = document.createElement('div');
    bonus.className = 'bonus-pop';
    bonus.textContent = `+${cantidad}`;

    document.body.appendChild(bonus);

    void bonus.offsetWidth;

    bonus.style.opacity = 1;
    bonus.style.transform = 'translate(-50%, -50%) scale(1.2)';

    setTimeout(() => {
       bonus.remove() 
    }, 2500);
}

/* ****************************** FUNCIÓN QUE INICIA EL JUEGO ************************************/
const botones = document.querySelectorAll('button[data-jugada]');
const socket = io(); // DEJA EL PARÉNTESIS VACÍO SI DEJA DE FUNCIONAR
let yaJugo = false;

socket.on('resultado', (data) =>{
    console.log('resultado', data);

    //alert(`Tú: ${data.tuJugada}\n` + `Rival: ${data.rival}\n\n` + `${data.resultado}`);
    let resultado = document.getElementById('resultado');
    let tu = document.getElementById('tu');
    let rival = document.getElementById('rival');
    resultado.textContent = data.resultado;
    if(data.resultado === 'GANASTE'){
        resultado.style.color = '#0f0';
        let puntaje = document.getElementById('puntos');
        puntaje.textContent = PUNTOS_POR_ACIERTO;
        ganador();
    }else{
        resultado.style.color = '#f00';
        perdiste();
    }
    rival.textContent = 'Rival: '+data.rival;
    tu.textContent = 'Tú: '+data.tuJugada;

    let eleccion = document.getElementById('movimiento');
    eleccion.textContent = data.tuJugada;

    //alert(data.resultado);

    yaJugo = false;
    botones.forEach(b => b.disabled = false);
});

socket.on('inicio', ({ rival }) =>{
    console.log('tu rival es: ', rival.id);
    comenzar.disabled = true;
    comenzar.innerText = 'En una partida...';
    botones.forEach(b => b.disabled = false);
});

botones.forEach(boton =>{
    boton.addEventListener('click', () =>{
        if(yaJugo) return;
        yaJugo = true;
        const eleccion = boton.dataset.jugada;
        socket.emit('jugada', eleccion);
        botones.forEach(b => b.disabled = true);
        console.log('esperando rival...');
    });
});

function start(){
    comenzar.addEventListener('click', ()=>{
        socket.emit('join-ppt');
        comenzar.innerText = 'Buscando Rival...';
        comenzar.disabled = true;
    });
}

start(); // INICIA EL JUEGO

// FUNCIÓN DE INVOCACIÓN INMEDIATA PARA CONTROL DE TIEMPO (no está presente en los niveles 1 y 2)
(function(){
    let tiempo = document.getElementById('tiempo');
    let iniciarTiempo = document.getElementById('iniciar_tiempo');

    function actualizarPantalla(){
        if(tiempo){
            tiempo.textContent = segundos;
                if(segundos === 0){
                    clearInterval(intervalo);
                    intervalo = null;
                    tiempo.textContent = 'FIN!';
                    segundos = 60; // REVISAR SI SE PUEDE AGREGAR A CONFIG
                    perdiste();
                }
            }
        }
        if(iniciarTiempo){
            iniciarTiempo.addEventListener('click', function(){
                if(intervalo === null){
                    intervalo = setInterval(() =>{
                        segundos--;
                        actualizarPantalla();
                    }, 1000);
                }
            });
        }

    actualizarPantalla();
    })();

// FUNCIÓN PARA MOSTRAR OBJETIVO LOGRADO
function ganador(){
    sonidoGanador.currentTime = 0;
    setTimeout(() => {
        sonidoGanador.play();
    }, 1000);
}

// FUNCIÓN PARA MOSTRAR OBJETIVO NO LOGRADO
function perdiste(){

    sonidoPerder.currentTime = 0;
    sonidoPerder.play();
}