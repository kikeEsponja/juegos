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
    //window.location.href = 'http://localhost3000';
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

//********************************************************************************** */
let juego = document.getElementById('carcasa'); //captura de "div" contenedor del tablero de juego

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
function start(){
    comenzar.addEventListener('click', ()=>{
        const socket = io();
        const botones = document.querySelectorAll('button[data-jugada]');
        //const carcasa = document.getElementById('carcasa'); // Parte del hechizo simple
        let yaJugo = false;

        botones.forEach(boton =>{
            boton.addEventListener('click', () =>{
                if(yaJugo) return;
            
                yaJugo = true;
            
                const eleccion = boton.dataset.jugada;
                //carcasa.style.display = 'none'; // HECHIZO SIMPLE
            
                //console.log('Elegí: ', eleccion);
                socket.emit('jugada', eleccion);
            
                botones.forEach(b => b.disabled = true);
            });
        });

        socket.on('resultado', (data) =>{
            console.log('resultado', data);
        
            console.log(`Tú: ${data.tuJugada}\n` + `Rival: ${data.rival}\n\n` + `${data.resultado}`);
        
            alert(data.resultado);
        
            yaJugo = false;
            botones.forEach(b => b.disabled = false);
        });
        /*let cartasBarajadas = cartas.sort(() => Math.random() - 0.5);

        // BUCLE PARA DIBUJAR LAS CARTAS
        for(let i = 0; i < cartasBarajadas.length; i++){
            let contenedorFicha = document.createElement('div');
            let ficha = document.createElement('div');
            let dato = document.createElement('div');
            //ficha.textContent = nuevoTexto[i];

            contenedorFicha.classList.add('contenedor-ficha');
            ficha.classList.add('ficha');
            //ficha.dataset.value = nuevoTexto[i];
            //ficha.id = i;
            dato.classList.add('dato');
            dato.classList.add('invisible');
            dato.textContent = cartasBarajadas[i];
            dato.dataset.value = cartasBarajadas[i];
            dato.id = i;
            
            dato.addEventListener('click', handleCardClick);
            dato.addEventListener('click', muevelo);

            juego.appendChild(contenedorFicha);
            contenedorFicha.appendChild(ficha);
            ficha.appendChild(dato);
        }
        comenzar.disabled = true;*/
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

//FUNCIÓN PARA CONTROLAR EL MOVIMIENTO DE LAS CARTAS
function handleCardClick(e){
    let card = e.currentTarget;

    if(bloqueoMesa) return;
    if(card === primeraCarta) return;

    card.classList.add('descubierta');
    card.classList.remove('invisible');

    if(!primeraCarta){
        primeraCarta = card;
        return;
    }

    segundaCarta = card;

    validarCoincidencia();
}

// FUNCIÓN PARA LA DISMINUCIÓN DE LOS MOVIMIENTOS DISPONIBLES
/*function muevelo(){
    if(habilitado){
        movimientos--;
        let textoMovimientos = document.getElementById('movimientos');
        textoMovimientos.textContent = movimientos;
        if(movimientos === 0){
            perdiste();
        }
    }
}*/

/*function dejaloAsi(){
    habilitado = false;
}*/

// FUNCIÓN QUE VALIDA LA COINCIDENCIA DE LOS VALORES DE LAS CARTAS
/*function validarCoincidencia(){
    let coincide = primeraCarta.dataset.value === segundaCarta.dataset.value;

    if(coincide){
        inhabilitarCartas();
    }else{
        cubrirCartas();
    }
}*/

//CONTADOR DE ACIERTOS
let aciertos = 0;
function inhabilitarCartas(){
    primeraCarta.removeEventListener('click', handleCardClick);
    segundaCarta.removeEventListener('click', handleCardClick);
    
    let textoAciertos = document.getElementById('aciertos');
    aciertos++;
    textoAciertos.textContent = aciertos;

    let puntaje = document.getElementById('puntos');
    puntos += PUNTOS_POR_ACIERTO;
    puntaje.textContent = puntos;
    
    sonidoAcierto.currentTime = 0;
    sonidoAcierto.play();

    mostrarBonus(PUNTOS_POR_ACIERTO);

    if(aciertos == 1){
        ganador();
        dejaloAsi();
    }

    reiniciar();
}

//FUNCIÓN PARA CUBRIR EL PA DE CARTAS QUE NO COINCIDEN
/*function cubrirCartas(){
    bloqueoMesa = true;

    setTimeout(() =>{
        primeraCarta.classList.remove('descubierta');
        segundaCarta.classList.remove('descubierta');
        primeraCarta.classList.add('invisible');
        segundaCarta.classList.add('invisible');

        reiniciar();
    }, 1000);
}*/

// FUNCIÓN PARA REINICIAR LOS VALORES INICIALES
/*function reiniciar(){
    [primeraCarta, segundaCarta, bloqueoMesa] = [null, null, false];
}*/

/*function clickSostenido(e){
    tocarCarta(e.currentTarget);
}*/

// FUNCIÓN PARA MOSTRAR OBJETIVO LOGRADO
function ganador(){
    let contenedor = document.createElement('div');
    //let aceptar = document.createElement('button');
    let ganador = document.createElement('h1');
    let information = document.getElementById('information');
    let emoji = document.getElementById('ganador');
    //let textoNivelSiguiente = CONFIG.textoNivelSiguiente
    //NIVEL SIGUIENTE
    information.appendChild(contenedor);
    contenedor.appendChild(ganador);
    //contenedor.appendChild(aceptar);

    /*if(textoNivelSiguiente === 'Nivel 11'){
        setTimeout(() => {
            window.location.href = '../vistas/memoria11.html';
        }, 3000);
    }else{
        let nivelSiguiente = document.createElement('button');
        nivelSiguiente.textContent = CONFIG.textoNivelSiguiente;
        nivelSiguiente.classList.add('botones');
        nivelSiguiente.addEventListener('click', () =>{
            window.location.href = CONFIG.urlNivelSiguiente;
        });
        contenedor.appendChild(nivelSiguiente);
    }*/

    //Bucle para dejar las fichas descubiertas
    /*for(let i = 0; i < CONFIG.cantidadDeCartas.length; i++){
        let fichaFija = document.querySelector('.ficha');
        fichaFija.classList.remove('ficha');
    }*/

    /*aceptar.addEventListener('click', ()=>{
        location.reload();
    });*/

    ganador.textContent = 'Has Ganado!';
    ganador.style.color = '#ff0';
    //aceptar.textContent = 'Vamos de nuevo!';
    //aceptar.classList.add('botones');

    // Sumar puntos por tiempo (no existe en niveles 1 y 2)
    //let bonus = segundos * 10;
    //puntos += bonus;

    let puntaje = document.getElementById('puntos');
    puntaje.textContent = puntos;

    if(intervalo !== null){
        clearInterval(intervalo);
        intervalo = null;
    }

    emoji.style.display = 'block';
    emoji.style.opacity = '0';
    emoji.style.transition = 'opacity 2s ease';

    sonidoGanador.currentTime = 0;
    setTimeout(() => {
        sonidoGanador.play();
    }, 1000);

    setTimeout(() =>{
        emoji.style.opacity = '1';
    }, 50);

}

// FUNCIÓN PARA MOSTRAR OBJETIVO NO LOGRADO
function perdiste(){
    let contenedor = document.createElement('div');
    //let aceptar = document.createElement('button');
    let perdedor = document.createElement('h1');
    let information = document.getElementById('information');
    let emojiLost = document.getElementById('perdedor');

    /*for(let i = 0; i < CONFIG.cantidadDeCartas.length; i++){
        let fichaFija = document.querySelector('.ficha');
        fichaFija.classList.remove('ficha');
    }*/

    /*aceptar.addEventListener('click', ()=>{
        location.reload();
    });*/

    perdedor.textContent = 'Has Perdido!';
    perdedor.style.color = '#f60';
    //aceptar.classList.add('botones');
    //aceptar.textContent = 'Vamos de nuevo!';

    information.appendChild(contenedor);
    contenedor.appendChild(perdedor);
    //contenedor.appendChild(aceptar);
    emojiLost.style.display = 'block';
    emojiLost.style.opacity = '0';
    emojiLost.style.transition = 'opacity 2s ease';
    sonidoPerder.currentTime = 0;
    sonidoPerder.play();

    setTimeout(() =>{
        emojiLost.style.opacity = '1';
    }, 50);
}