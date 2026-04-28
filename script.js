let record = Number(localStorage.getItem("record")) || 999;
let nivel = document.querySelector("#nivel");
let historialLista = document.querySelector("#historial");
let botonBorrar = document.querySelector("#borrarHistorial");
let modoGuardado = localStorage.getItem("modoOscuro");

if (modoGuardado === "true") {
  document.body.classList.add("dark");
  
}
 
let modoBtn = document.querySelector("#modoBtn");

  function actualizarBotonModo() {
    if (document.body.classList.contains("dark")) {
      modoBtn.textContent = "☀️ Modo claro";
    } else {
      modoBtn.textContent = "🌙 Modo oscuro";
    }
  
}
actualizarBotonModo();  

let historialGuardado = JSON.parse(localStorage.getItem("historial")) || [];

historialGuardado.forEach(texto => {
  let li = document.createElement("li");
  li.textContent = texto;
  historialLista.appendChild(li)

});
let stats = JSON.parse(localStorage.getItem("stats")) || {
  jugadas: 0,
  ganadas: 0,
  perdidas: 0,
  mejorRacha: 0,
  rachaActual: 0,
};  

function guardarStats() {
  localStorage.setItem("stats", JSON.stringify(stats));
}

if (botonBorrar) {
botonBorrar.addEventListener("click", function() {
 historialLista.innerHTML ="";
 historialGuardado = [];
 localStorage.removeItem("historial");
});
}

function actualizarInstruccion() {
  document.querySelector("#instruccion").textContent =
  `Escribe un número del 1 al ${nivel.value}`;
}

function guardarHistorial(texto) {
  let li = document.createElement("li");
  li.textContent = texto;
  historialLista.appendChild(li);

  historialGuardado.push(texto);

  if (historialLista.children.length > 5) {
    historialGuardado.shift();
    historialLista.removeChild(historialLista.firstChild);
  }

  localStorage.setItem("historial", JSON.stringify(historialGuardado));
}

function guardarEstado() {
  let estado = {
    numeroSecreto,
    intentos,
    tiempo,
    nivel: nivel.value
  };

  localStorage.setItem("estadoJuego", JSON.stringify(estado));
}

function mostrarStats() {
  let lista = document.querySelector("#stats");
  if (!lista) return;

  lista.innerHTML = "";

  lista.innerHTML += `<li> 🎮 Jugadas: ${stats.jugadas}</li>`;
  lista.innerHTML += `<li> 🏆 Ganadas: ${stats.ganadas}</li>`;
  lista.innerHTML += `<li> 💀 Perdidas: ${stats.perdidas}</li>`;
  lista.innerHTML += `<li> 🔥 Mejor racha: ${stats.mejorRacha}</li>`;
}
function reproducirSonido(sonido) {
  if(!sonido) return;
  sonido.currentTime = 0;
  sonido.play().catch(() => {});
}


function generarNumeroSecreto() {
  return Math.floor(Math.random() * Number(nivel.value)) + 1;
}
let numeroSecreto; 
let intentos = 0;
let maxIntentos = 5;
let boton = document.querySelector("#boton");
let reiniciar = document.querySelector("#reiniciar");
let input = document.querySelector("#numero");
let mensaje = document.querySelector("#mensaje");
let tiempo = 10;
let tiempoTexto = document.querySelector("#tiempo");
let intervalo;
let sonidoGanar = document.querySelector("#sonidoGanar");
let sonidoPerder = document.querySelector("#sonidoPerder");
let sonidoError = document.querySelector("#sonidoError");



let listaLogros = document.querySelector("#logros");
let logros = JSON.parse(localStorage.getItem("logros")) || [];

function desbloquearLogro(texto) {
  if (logros.includes(texto)) return;

  logros.push(texto);
  localStorage.setItem("logros", JSON.stringify(logros));

  let li = document.createElement("li");
  li.textContent = texto;
  listaLogros.appendChild(li);
}

logros.forEach(logro => {
  let li =document.createElement("li");
  li.textContent = logro;
  listaLogros.appendChild(li);
});

let estadoGuardado = JSON.parse(localStorage.getItem("estadoJuego"));

if (estadoGuardado) {
  numeroSecreto = estadoGuardado.numeroSecreto;
  intentos = estadoGuardado.intentos;
  tiempo = estadoGuardado.tiempo;
  nivel.value = estadoGuardado.nivel;
} else {
  numeroSecreto = generarNumeroSecreto();
}

function iniciarTemporizador() {
  intervalo = setInterval(function() {
    tiempo--;
    tiempoTexto.textContent = `Tiempo: ${tiempo}`;

    if (tiempo <= 0) {
      clearInterval(intervalo);

      stats.jugadas ++;
      stats.perdidas ++;
      stats.rachaActual = 0;

      guardarStats();
      mostrarStats();

      desbloquearLogro("⏱️ Se quedó sin tiempo");


      guardarHistorial(`Perdiste por tiempo`);

      mostrarMensaje("⏱️ Se acabó el tiempo");
      cambiarColor("#e4e70f");
      terminarJuego();
    }
  
  }, 1000);
}    

function terminarJuego() {
   boton.disabled = true;
   input.disabled = true;
}

function mostrarMensaje(texto)  {
  mensaje.textContent = texto;
  mensaje.classList.add("animar");

  setTimeout(() => {
    mensaje.classList.remove("animar");
  },200);
}    

function cambiarColor(color) {
  document.body.style.backgroundColor = color;
}


function jugar() {
    if (boton.disabled) return;
    if (input.value.trim() === "") {
      mostrarMensaje("⚠️ Escribe un número");
      return;
    }  
    let intento = Number(input.value); 
    let max = Number(nivel.value);
    
     if (intento < 1 || intento > max) {
      mostrarMensaje(`🚨​ Escribe un número entre 1 y ${max}`);
      return;
    }    

    intentos++;
    
    if (intento === numeroSecreto) {
      if (intentos === 1) {
        desbloquearLogro("⚡ Adivino a la primera");
      }

      if (intentos <= 3) {
        desbloquearLogro("🔥 Experto");
      }

      if (intentos < record) {
        record = intentos;
        localStorage.setItem("record", record);
    }      
      
      guardarHistorial(`Ganaste en ${intentos} intentos`);
      
      stats.jugadas++;
      stats.ganadas++;
      stats.rachaActual++;

      if(stats.rachaActual > stats.mejorRacha) {
        stats.mejorRacha = stats.rachaActual;
      }
      


      guardarStats();
      mostrarStats();

      mostrarMensaje(`🎉 Correcto en ${intentos} intentos | Récord: ${record}`);
      document.body.classList.add("ganar");
      if (intentos <= 2) {
        nivel.value = Math.min(Number(nivel.value) + 10, 100);
        actualizarInstruccion();
      }
      if (stats.mejorRacha >= 3) {
      desbloquearLogro("🔥 Racha de 3 victorias");
    }
    if (stats.ganadas >=10) {
      desbloquearLogro("🏆 10 victorias");
    }

      setTimeout(() => {
        document.body.classList.remove("ganar");
      }, 600);
      cambiarColor("#c8f7c5"); 
      reproducirSonido(sonidoGanar);
      terminarJuego();
     

    } else if (intentos >= maxIntentos){
 
      guardarHistorial(`Perdiste (era ${numeroSecreto})`);

      stats.jugadas++;
      stats.perdidas++;
      stats.rachaActual = 0;

      document.body.classList.add("error");

      setTimeout(() => {
        document.body.classList.remove("error");
      }, 400);

       mostrarMensaje(`💀 Perdiste. Era ${numeroSecreto}`);
       reproducirSonido(sonidoPerder);
       cambiarColor("#f8c6c6"); 
       terminarJuego();
       
      guardarStats();
      mostrarStats();
    

    } else if (intento > numeroSecreto) {
        mostrarMensaje(`🏄​​ Muy alto | Te quedan ${maxIntentos - intentos}`);
        reproducirSonido(sonidoError);
        cambiarColor("#ffe0b3");
    } else {
        mostrarMensaje(`⛷️ Muy bajo | Te quedan ${maxIntentos - intentos}`);
        reproducirSonido(sonidoError);
        cambiarColor("#cce5ff");
    }
    
    input.value = "";
    guardarEstado();
}

boton.addEventListener("click", jugar);
  modoBtn.addEventListener("click", function() {
    document.body.classList.toggle("dark");
    
    let modoOscuro = document.body.classList.contains("dark");
    localStorage.setItem("modoOscuro", modoOscuro);

    actualizarBotonModo(); //
  });  
reiniciar.addEventListener("click", function() {
    numeroSecreto = generarNumeroSecreto();
    console.log("Nuevo número:", numeroSecreto);
    intentos = 0;
   
    cambiarColor("#f0f0f0");
   
    boton.disabled = false;
    input.disabled = false;

    mostrarMensaje("");
    input.focus();

    clearInterval(intervalo);
    tiempo = 10;
    tiempoTexto.textContent = `Tiempo: ${tiempo}`;
    iniciarTemporizador();

    guardarEstado();

});

nivel.addEventListener("change", actualizarInstruccion);
actualizarInstruccion();
console.log("script cargado");
iniciarTemporizador();
mostrarStats();

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();  
  deferredPrompt = e;

  document.querySelector("#instalarBtn").style.display = "block";
});

document.querySelector("#instalarBtn").addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;
  console.log("Resultado instalación:", outcome);

  deferredPrompt = null;

});
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then(reg => {

    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed") {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.addEventListener("controllerchange", () => {
              window.location.reload();
            });
          }
        }
      });
    });
  });
}
