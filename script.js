// VARIABLES PRINCIPALES
let modalidad = 0;

let puntosJugador = 0;
let puntosPC = 0;
let empates = 0;

let turno = 1;
let jugadorAleatorio = 1;

let eleccionJugador1 = "";

let musicaActiva = false;
let audioContext = null;
let volumenMusica = null;
let osciladorMusica = null;
let temporizadorMusica = null;


// FUNCION PARA HABLAR
function hablar(mensaje) {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        let voz = new SpeechSynthesisUtterance(mensaje);
        voz.lang = "es-CO";
        voz.rate = 0.95;
        voz.pitch = 1;
        window.speechSynthesis.speak(voz);
    }
}


// MUSICA DE FONDO Y SONIDOS
function activarMusica() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    if (musicaActiva) {
        clearInterval(temporizadorMusica);
        if (osciladorMusica) {
            osciladorMusica.stop();
            osciladorMusica = null;
        }
        musicaActiva = false;
        hablar("Música pausada");
        return;
    }

    volumenMusica = audioContext.createGain();
    volumenMusica.gain.value = 0.035;
    volumenMusica.connect(audioContext.destination);

    osciladorMusica = audioContext.createOscillator();
    osciladorMusica.type = "sine";
    osciladorMusica.frequency.value = 220;
    osciladorMusica.connect(volumenMusica);
    osciladorMusica.start();

    musicaActiva = true;

    temporizadorMusica = setInterval(() => {
        if (osciladorMusica) {
            osciladorMusica.frequency.setValueAtTime(
                180 + Math.random() * 180,
                audioContext.currentTime
            );
        }
    }, 600);

    hablar("Música activada. ¡Que comience el juego!");
}


// EFECTOS DE SONIDO
function sonido(frecuencia = 500, duracion = 0.2) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    let oscilador = audioContext.createOscillator();
    let volumen = audioContext.createGain();

    oscilador.frequency.value = frecuencia;
    volumen.gain.setValueAtTime(0.15, audioContext.currentTime);
    volumen.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duracion);

    oscilador.connect(volumen);
    volumen.connect(audioContext.destination);

    oscilador.start();
    oscilador.stop(audioContext.currentTime + duracion);
}


// INICIAR LAS TRES MODALIDADES
function iniciarJuego(opcion) {
    modalidad = opcion;
    reiniciarMarcador();

    document.getElementById("menu").classList.add("oculto");
    document.getElementById("juego").classList.remove("oculto");

    const tituloJuego = document.getElementById("tituloJuego");
    const nombreJugador = document.getElementById("nombreJugador");
    const nombrePC = document.getElementById("nombrePC");

    if (modalidad === 1) {
        tituloJuego.innerText = "MODALIDAD: PC VS USUARIO";
        nombreJugador.innerText = "Usuario";
        nombrePC.innerText = "Computadora";
        document.getElementById("instruccion").innerText = "Selecciona tu jugada";
        hablar("Modo seleccionado: Computadora contra usuario. Elige tu jugada.");
    } 
    else if (modalidad === 2) {
        jugadorAleatorio = Math.random() < 0.5 ? 1 : 2;
        tituloJuego.innerText = "MODALIDAD: PC VS ALEATORIO";
        nombreJugador.innerText = `Usuario ${jugadorAleatorio}`;
        nombrePC.innerText = "Computadora";
        document.getElementById("instruccion").innerText = `El destino eligió al Usuario ${jugadorAleatorio}. ¡Haz tu jugada!`;
        hablar(`Modo seleccionado: Computadora contra usuario aleatorio. Juega el usuario número ${jugadorAleatorio}.`);
    } 
    else if (modalidad === 3) {
        turno = 1;
        tituloJuego.innerText = "MODALIDAD: USUARIO 1 VS USUARIO 2";
        nombreJugador.innerText = "Usuario 1";
        nombrePC.innerText = "Usuario 2";
        document.getElementById("instruccion").innerText = "Turno de Usuario 1 (Jugada Oculta)";
        hablar("Modo seleccionado: Usuario uno contra usuario dos. Turno del usuario uno.");
    }
}


// MANEJAR LAS JUGADAS
function jugar(eleccion) {
    sonido(400, 0.15);

    const emojis = { piedra: "✊", papel: "✋", tijera: "✌️" };

    document.getElementById("jugadaJugador").innerText = "❔";
    document.getElementById("jugadaPC").innerText = "❔";

    if (modalidad === 1 || modalidad === 2) {
        const opciones = ["piedra", "papel", "tijera"];
        const eleccionPC = opciones[Math.floor(Math.random() * opciones.length)];

        document.getElementById("jugadaJugador").innerText = emojis[eleccion];
        document.getElementById("jugadaPC").innerText = emojis[eleccionPC];

        procesarGanador(eleccion, eleccionPC, "¡Ganaste tú!", "¡Ganó la PC!");
    } 
    else if (modalidad === 3) {
        if (turno === 1) {
            eleccionJugador1 = eleccion;
            turno = 2;
            document.getElementById("instruccion").innerText = "Turno de Usuario 2 (Jugada Oculta)";
            hablar("Usuario uno ya eligió. Turno del usuario dos.");
        } else {
            document.getElementById("jugadaJugador").innerText = emojis[eleccionJugador1];
            document.getElementById("jugadaPC").innerText = emojis[eleccion];

            procesarGanador(eleccionJugador1, eleccion, "¡Ganó el Usuario 1!", "¡Ganó el Usuario 2!");
            
            turno = 1;
            document.getElementById("instruccion").innerText = "Turno de Usuario 1 (Jugada Oculta)";
        }
    }
}


// LÓGICA DE GANADOR, CONTADOR Y AUDIO DE RESPUESTA
function procesarGanador(jugada1, jugada2, msgVictoria, msgDerrota) {
    const resultadoTexto = document.getElementById("resultado");

    if (jugada1 === jugada2) {
        resultadoTexto.innerText = "¡Es un Empate! 🤝";
        empates++;
        sonido(300, 0.4); 
        hablar("Empate en esta ronda.");
    } 
    else if (
        (jugada1 === "piedra" && jugada2 === "tijera") ||
        (jugada1 === "papel" && jugada2 === "piedra") ||
        (jugada1 === "tijera" && jugada2 === "papel")
    ) {
        resultadoTexto.innerText = msgVictoria + " 🎉";
        puntosJugador++;
        sonido(800, 0.3); 
        hablar(msgVictoria);
    } 
    else {
        resultadoTexto.innerText = msgDerrota + " ❌";
        puntosPC++;
        sonido(180, 0.5); 
        hablar(msgDerrota);
    }

    actualizarMarcador();
}


// ACTUALIZAR TEXTO DE MARCADOR
function actualizarMarcador() {
    const txtMarcador = document.getElementById("marcador");
    if (modalidad === 3) {
        txtMarcador.innerText = `Usuario 1: ${puntosJugador} | Usuario 2: ${puntosPC} | Empates: ${empates}`;
    } else if (modalidad === 2) {
        txtMarcador.innerText = `Usuario ${jugadorAleatorio}: ${puntosJugador} | Computadora: ${puntosPC} | Empates: ${empates}`;
    } else {
        txtMarcador.innerText = `Usuario: ${puntosJugador} | Computadora: ${puntosPC} | Empates: ${empates}`;
    }
}


// REINICIAR MARCADOR DE LA MODALIDAD
function reiniciarMarcador() {
    puntosJugador = 0;
    puntosPC = 0;
    empates = 0;
    turno = 1;
    
    document.getElementById("jugadaJugador").innerText = "❔";
    document.getElementById("jugadaPC").innerText = "❔";
    document.getElementById("resultado").innerText = "¡Que comience el juego!";
    
    if (modalidad === 3) {
        document.getElementById("instruccion").innerText = "Turno de Usuario 1 (Jugada Oculta)";
    } else if (modalidad === 2) {
        document.getElementById("instruccion").innerText = `El destino eligió al Usuario ${jugadorAleatorio}. ¡Haz tu jugada!`;
    } else {
        document.getElementById("instruccion").innerText = "Selecciona tu jugada";
    }
    
    actualizarMarcador();
    sonido(600, 0.2);
}


// VOLVER AL MENÚ PRINCIPAL
function volverMenu() {
    modalidad = 0;
    document.getElementById("juego").classList.add("oculto");
    document.getElementById("menu").classList.remove("oculto");
    
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
    sonido(250, 0.3);
}


// DESCONGELADOR DE VIDEO (SOLUCIÓN COMPATIBILIDAD AUTOPLAY)
window.addEventListener("DOMContentLoaded", () => {
    const videoBienvenida = document.querySelector(".video");
    if (videoBienvenida) {
        videoBienvenida.play().catch(() => {
            console.log("El navegador restringió el video. Esperando interacción...");
            document.body.addEventListener("click", () => {
                videoBienvenida.play();
            }, { once: true });
        });
    }
});
