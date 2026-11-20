// ==========================================
// SECCIÓN EMPODERAMIENTO
// ==========================================

// Desafíos diarios
const desafios = [
    "Hoy, di no a algo que no quieres hacer sin sentir culpa",
    "Expresa una opinión diferente en una conversación, aunque sea incómodo",
    "Pide algo que necesitas sin disculparte por pedirlo",
    "Establece un límite claro con alguien que lo necesite",
    "Haz algo que siempre has querido pero te daba miedo intentar",
    "Habla en público sobre algo que te apasiona",
    "Toma una decisión sin pedir la aprobación de otros",
    "Defiende a alguien o algo en lo que crees",
    "Rechaza una crítica injusta con calma y seguridad",
    "Celebra un logro tuyo en voz alta y sin minimizarlo",
    "Comparte una idea tuya sin preocuparte por el juicio de otros",
    "Dedica 30 minutos hoy solo para ti, sin sentirte egoísta",
    "Si alguien te interrumpe, pide con calma terminar lo que estabas diciendo",
    "Negocia algo que normalmente aceptarías sin cuestionar",
    "Abandona una conversación o situación que no te hace bien",
    "Habla sobre tus logros sin minimizarlos ni justificarlos",
    "Rechaza una invitación sin dar excusas elaboradas",
    "Pide ayuda para algo sin sentir que eres una carga",
    "Expresa cómo te sientes realmente cuando alguien te pregunta",
    "Da el primer paso en algo en lo que normalmente esperarías a otros",
    "Cuando alguien te elogie, solo di «gracias», sin restarle importancia",
    "Dedica tiempo a un hobby o pasión que has pospuesto",
    "Comunica una necesidad tuya de manera clara y directa",
    "Cambia de opinión sobre algo públicamente si es lo correcto",
    "Delega una tarea que siempre haces tú misma"
];

function generarNuevoDesafio() {
    const desafioTexto = document.querySelector('.desafio-texto');
    const indice = Math.floor(Math.random() * desafios.length);
    desafioTexto.textContent = desafios[indice];
}

function completarDesafio() {
    const desafioTexto = document.querySelector('.desafio-texto');
    const desafioCompletado = desafioTexto.textContent;
    
    // Guardar en localStorage
    const desafiosCompletados = JSON.parse(localStorage.getItem('desafiosCompletados') || '[]');
    desafiosCompletados.push({
        desafio: desafioCompletado,
        fecha: new Date().toLocaleDateString()
    });
    localStorage.setItem('desafiosCompletados', JSON.stringify(desafiosCompletados));
    
    alert('¡Felicitaciones! 🎉 Has completado este desafío. Eres cada vez más poderosa.');
    generarNuevoDesafio();
    cargarLogrosEmpoderamiento();
}

function guardarEjercicio(tipo) {
    const textarea = document.getElementById(`ejercicio-${tipo}`);
    if (!textarea.value.trim()) {
        alert('Por favor escribe algo antes de guardar');
        return;
    }
    
    const ejercicios = JSON.parse(localStorage.getItem('ejerciciosEmpoderamiento') || '{}');
    ejercicios[tipo] = {
        contenido: textarea.value,
        fecha: new Date().toLocaleDateString()
    };
    localStorage.setItem('ejerciciosEmpoderamiento', JSON.stringify(ejercicios));
    alert('✨ Ejercicio guardado exitosamente');
}

function cargarLogrosEmpoderamiento() {
    const container = document.getElementById('logros-empoderamiento-lista');
    if (!container) return;
    
    const desafiosCompletados = JSON.parse(localStorage.getItem('desafiosCompletados') || '[]');
    
    if (desafiosCompletados.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: #999;">Aún no has completado ningún desafío</p>';
        return;
    }
    
    container.innerHTML = desafiosCompletados.slice(-10).reverse().map(d => `
        <div class="logro-item" style="padding: 1rem; background: white; border-radius: 10px; margin-bottom: 1rem; border-left: 4px solid #f4c542;">
            <p style="margin: 0; font-weight: 500;">${d.desafio}</p>
            <small style="color: #999;">Completado el ${d.fecha}</small>
        </div>
    `).join('');
}

// ==========================================
// SECCIÓN AMOR PROPIO
// ==========================================

const afirmacionesPorCategoria = {
    belleza: [
        "Soy hermosa tal como soy, mi belleza es única e irreemplazable",
        "Mi belleza va más allá de lo físico, refleja mi alma y mi esencia",
        "Me veo con ojos de amor y aprecio cada detalle de mi ser",
        "Mi belleza se intensifica cuando me amo y me cuido",
        "Irradio belleza desde mi interior hacia el mundo",
        "Cada arruga, cada marca cuenta la historia de mi vida y las celebro",
        "Mi sonrisa ilumina los espacios que habito",
        "No necesito la aprobación de nadie para sentirme hermosa",
        "Mi belleza es auténtica y no necesita filtros ni máscaras",
        "Brillo con mi propia luz, sin compararme con nadie más"
    ],
    cuerpo: [
        "Mi cuerpo es mi templo y lo honro con amor y respeto",
        "Agradezco a mi cuerpo por todo lo que me permite hacer",
        "Cuido mi cuerpo con ejercicio, descanso y nutrición amorosa",
        "Mi cuerpo es perfecto tal como es, es el vehículo de mi alma",
        "Celebro mi cuerpo en todas sus formas y etapas",
        "Escucho las señales de mi cuerpo y respondo con compasión",
        "Mi cuerpo merece movimiento que lo nutra, no que lo castigue",
        "Cada parte de mi cuerpo cumple una función maravillosa",
        "Me trato con la misma ternura con la que trataría a una niña",
        "Mi cuerpo es mi hogar y lo habito con gratitud"
    ],
    mente: [
        "Mi mente es poderosa y capaz de lograr todo lo que me propongo",
        "Elijo pensamientos que me nutren y me empoderan",
        "Soy inteligente, creativa y llena de sabiduría",
        "Mi mente es clara, enfocada y alineada con mis sueños",
        "Confío en mi intuición y en mi capacidad de tomar decisiones",
        "Tengo el poder de cambiar mis pensamientos en cualquier momento",
        "Mi creatividad fluye libremente sin juicios ni limitaciones",
        "Aprendo de cada experiencia y me vuelvo más sabia cada día",
        "Mi mente está llena de ideas brillantes y posibilidades infinitas",
        "Soy dueña de mis pensamientos, no ellos de mí"
    ],
    valor: [
        "Soy valiosa por el simple hecho de existir",
        "Mi valor no depende de la opinión de los demás",
        "Merezco amor, respeto y todo lo bueno que la vida ofrece",
        "Soy suficiente, siempre lo he sido y siempre lo seré",
        "Mi presencia en este mundo tiene un propósito y un valor único",
        "No necesito demostrarle a nadie mi valía, yo la conozco",
        "Mis errores no disminuyen mi valor, soy humana y eso es perfecto",
        "Merezco ocupar espacio, ser vista y ser escuchada",
        "Mi voz importa y mis opiniones tienen peso",
        "Soy digna de todas las bendiciones que llegan a mi vida"
    ]
};

let categoriaActual = 'belleza';
let indiceAfirmacion = 0;

function mostrarAfirmacionesCategoria(categoria) {
    console.log('Cambiando a categoría:', categoria);
    categoriaActual = categoria;
    indiceAfirmacion = 0;
    
    // Actualizar tabs - remover active de todos
    const todosLosTabs = document.querySelectorAll('.tab-afirmacion');
    todosLosTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Añadir active al tab correcto según categoría
    const tabActivo = Array.from(todosLosTabs).find(tab => 
        tab.textContent.includes(categoria === 'belleza' ? 'Belleza' : 
                                   categoria === 'cuerpo' ? 'Cuerpo' : 
                                   categoria === 'mente' ? 'Mente' : 'Valor')
    );
    if (tabActivo) {
        tabActivo.classList.add('active');
    }
    
    // Mostrar afirmación de la categoría
    const afirmacionEl = document.getElementById('afirmacion-actual');
    if (afirmacionEl && afirmacionesPorCategoria[categoria]) {
        afirmacionEl.textContent = afirmacionesPorCategoria[categoria][0];
        console.log('Afirmación cambiada a:', afirmacionesPorCategoria[categoria][0].substring(0, 50) + '...');
    }
}

function siguienteAfirmacion() {
    const afirmaciones = afirmacionesPorCategoria[categoriaActual];
    indiceAfirmacion = (indiceAfirmacion + 1) % afirmaciones.length;
    document.getElementById('afirmacion-actual').textContent = afirmaciones[indiceAfirmacion];
}

function guardarAfirmacionPersonal() {
    const textarea = document.getElementById('afirmacion-personal');
    if (!textarea.value.trim()) {
        alert('Por favor escribe tu afirmación');
        return;
    }
    
    const afirmaciones = JSON.parse(localStorage.getItem('afirmacionesPersonales') || '[]');
    afirmaciones.push({
        texto: textarea.value,
        fecha: new Date().toLocaleDateString()
    });
    localStorage.setItem('afirmacionesPersonales', JSON.stringify(afirmaciones));
    alert('✨ Afirmación guardada. Repítela todos los días.');
    textarea.value = '';
}

function guardarReflexion(tipo) {
    const campo = tipo === 'amor' ? 'reflexion-amor' : 'carta-amor';
    const textarea = document.getElementById(campo);
    
    if (!textarea.value.trim()) {
        alert('Por favor escribe algo antes de guardar');
        return;
    }
    
    const reflexiones = JSON.parse(localStorage.getItem('reflexionesAmorPropio') || '{}');
    reflexiones[tipo] = {
        contenido: textarea.value,
        fecha: new Date().toLocaleDateString()
    };
    localStorage.setItem('reflexionesAmorPropio', JSON.stringify(reflexiones));
    alert('💗 Reflexión guardada con amor');
}

function agregarVictoria() {
    const input = document.getElementById('nueva-victoria');
    if (!input.value.trim()) {
        alert('Escribe tu victoria');
        return;
    }
    
    const victorias = JSON.parse(localStorage.getItem('misVictorias') || '[]');
    victorias.push({
        texto: input.value,
        fecha: new Date().toLocaleDateString()
    });
    localStorage.setItem('misVictorias', JSON.stringify(victorias));
    input.value = '';
    cargarVictorias();
}

function cargarVictorias() {
    const container = document.getElementById('mis-victorias');
    if (!container) return;
    
    const victorias = JSON.parse(localStorage.getItem('misVictorias') || '[]');
    
    if (victorias.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: #999;">Empieza a celebrar tus victorias</p>';
        return;
    }
    
    container.innerHTML = victorias.slice(-15).reverse().map(v => `
        <div class="victoria-item" style="padding: 1rem; background: linear-gradient(135deg, #fff 0%, #ffe9f3 100%); border-radius: 10px; margin-bottom: 0.5rem; border: 2px solid #ffd4e5;">
            <p style="margin: 0;">🎉 ${v.texto}</p>
            <small style="color: #999;">${v.fecha}</small>
        </div>
    `).join('');
}

// ==========================================
// SECCIÓN AUTOESTIMA
// ==========================================

const mensajesAutoestima = {
    1: "Recuerda que eres valiosa",
    2: "Cada día es una oportunidad",
    3: "Estás creciendo",
    4: "Confía en tu proceso",
    5: "Estás en camino de brillar",
    6: "Tu valor es innegable",
    7: "Eres más fuerte cada día",
    8: "Confía en tu poder",
    9: "Eres increíble",
    10: "¡Brillas con luz propia!"
};

function actualizarMedidor(valor) {
    document.getElementById('valor-autoestima').textContent = valor;
    document.getElementById('mensaje-autoestima').textContent = mensajesAutoestima[valor];
}

function guardarMedidorAutoestima() {
    const valor = document.getElementById('medidor-autoestima').value;
    
    const registros = JSON.parse(localStorage.getItem('registrosAutoestima') || '[]');
    registros.push({
        valor: parseInt(valor),
        fecha: new Date().toLocaleDateString()
    });
    localStorage.setItem('registrosAutoestima', JSON.stringify(registros));
    alert(`✨ Registro guardado: ${valor}/10`);
}

function guardarCualidades() {
    const cualidades = [];
    for (let i = 1; i <= 5; i++) {
        const valor = document.getElementById(`cualidad${i}`).value.trim();
        if (valor) cualidades.push(valor);
    }
    
    if (cualidades.length === 0) {
        alert('Escribe al menos una cualidad');
        return;
    }
    
    localStorage.setItem('misCualidades', JSON.stringify(cualidades));
    alert('💎 Cualidades guardadas. ¡Recuérdalas siempre!');
}

function guardarLogrosOrgullosa() {
    const textarea = document.getElementById('logros-orgullosa');
    if (!textarea.value.trim()) {
        alert('Escribe tus logros');
        return;
    }
    
    localStorage.setItem('logrosOrgullosa', textarea.value);
    alert('🏆 Logros guardados con orgullo');
}

function agregarFortaleza() {
    const input = document.getElementById('nueva-fortaleza');
    if (!input.value.trim()) {
        alert('Escribe una fortaleza');
        return;
    }
    
    const fortalezas = JSON.parse(localStorage.getItem('misFortalezas') || '[]');
    fortalezas.push({
        texto: input.value,
        fecha: new Date().toLocaleDateString()
    });
    localStorage.setItem('misFortalezas', JSON.stringify(fortalezas));
    input.value = '';
    cargarFortalezas();
}

function cargarFortalezas() {
    const container = document.getElementById('mis-fortalezas');
    if (!container) return;
    
    const fortalezas = JSON.parse(localStorage.getItem('misFortalezas') || '[]');
    
    if (fortalezas.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: #999;">Empieza a reconocer tus fortalezas</p>';
        return;
    }
    
    container.innerHTML = fortalezas.map(f => `
        <div class="fortaleza-item" style="display: inline-block; padding: 0.5rem 1rem; background: #f4c542; color: white; border-radius: 20px; margin: 0.25rem; font-weight: 500;">
            💪 ${f.texto}
        </div>
    `).join('');
}

// Inicializar cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    cargarLogrosEmpoderamiento();
    cargarVictorias();
    cargarFortalezas();
});
