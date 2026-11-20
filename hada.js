// =====================================================================
// HADA MADRINA · vuela por la pantalla Hoy, mueve las alas, parpadea,
// deja brillitos y te habla. Si la tocas, da una vuelta y te dice otra frase.
// Se puede ocultar desde "Yo".
// =====================================================================
(function () {
    const IMG = '/static/images/hada/';
    const quieta = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const FRASES = [
        'Respira hondo. Estás haciendo lo mejor que puedes.',
        'Hoy algo nuevo florece en ti.',
        'Tu carta de hoy te está esperando. ¡Tócala!',
        'Un paso pequeño también cuenta.',
        'Eres más fuerte de lo que crees.',
        'Escribir un poquito hoy te va a hacer bien.',
        'Celebra algo bonito que hiciste esta semana.',
        'No tienes que hacerlo perfecto. Solo seguir.',
        'Tu luz se nota, aunque hoy no la veas.',
        'Date permiso de descansar sin culpa.',
        'Lo que siembras hoy, florece mañana.',
        'Mírate con el cariño que le das a los demás.'
    ];
    const POR_ANIMO = {
        feliz: '¡Qué alegría! Guarda este momento en tu diario.',
        tranquila: 'Qué bonita esa calma. Disfrútala.',
        cansada: 'Hoy toca ir despacito. Descansar también es crecer.',
        triste: 'Estoy aquí contigo. Sé suave contigo hoy.',
        ansiosa: 'Respira conmigo: inhala... exhala... Todo a su tiempo.'
    };

    let zona, hada, burbuja, cuerpo;
    let paseo = null, timerBurbuja = null, ultimaFrase = -1, volando = false;

    function oculta() { try { return localStorage.getItem('hada_oculta') === '1'; } catch (e) { return false; } }

    function nombre() {
        try { return (typeof a2NombreUsuaria === 'function' ? a2NombreUsuaria() : '').split(' ')[0]; } catch (e) { return ''; }
    }

    async function crear() {
        if (zona) return;
        zona = document.createElement('div');
        zona.className = 'hada-zona';
        zona.setAttribute('aria-hidden', 'true');
        zona.innerHTML = `
            <div class="hada" role="button" tabindex="-1">
                <div class="hada-burbuja"></div>
                <div class="hada-voltea"><div class="hada-flota"><div class="hada-cuerpo"></div></div></div>
            </div>`;
        document.body.appendChild(zona);
        hada = zona.querySelector('.hada');
        burbuja = zona.querySelector('.hada-burbuja');
        cuerpo = zona.querySelector('.hada-cuerpo');
        cuerpo.innerHTML = `
            <img class="hd-capa hd-ala-izq" src="${IMG}ala-izq.webp?v=1" alt="" draggable="false">
            <img class="hd-capa hd-ala-der" src="${IMG}ala-der.webp?v=1" alt="" draggable="false">
            <img class="hd-capa hd-base" src="${IMG}base.webp?v=1" alt="Hada madrina" draggable="false">
            <span class="hd-destello"></span>`;
        hada.addEventListener('click', tocar);
    }

    // zona segura: debajo del borde de arriba y encima de las pestañas
    function limites() {
        const w = window.innerWidth, h = window.innerHeight;
        const ancho = hada.offsetWidth || 110, alto = hada.offsetHeight || 120;
        return { x0: 6, x1: w - ancho - 6, y0: 70, y1: Math.max(120, h - alto - 110) };
    }

    function volarA(x, y, rapido) {
        const actual = hada.getBoundingClientRect();
        hada.classList.toggle('mira-izq', x < actual.left - 4);
        hada.style.transitionDuration = rapido ? '0s' : (1.6 + Math.random() * 1.2).toFixed(2) + 's';
        hada.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
        if (!rapido) brillitos();
    }

    function lugarAlAzar() {
        const L = limites();
        return { x: L.x0 + Math.random() * (L.x1 - L.x0), y: L.y0 + Math.random() * (L.y1 - L.y0) * 0.75 };
    }

    // estela de brillitos mientras vuela
    function brillitos() {
        if (quieta) return;
        volando = true;
        hada.classList.add('volando');
        let n = 0;
        const t = setInterval(() => {
            const r = hada.getBoundingClientRect();
            const b = document.createElement('span');
            b.className = 'hada-brillo';
            b.textContent = Math.random() < 0.5 ? '✦' : '·';
            b.style.left = (r.left + r.width * (hada.classList.contains('mira-izq') ? 0.75 : 0.25) + (Math.random() * 16 - 8)) + 'px';
            b.style.top = (r.top + r.height * 0.55 + (Math.random() * 16 - 8)) + 'px';
            b.style.color = ['#D9AE52', '#E98AB4', '#C46A9C', '#F7E6B5'][n % 4];
            zona.appendChild(b);
            setTimeout(() => b.remove(), 1200);
            if (++n > 22) { clearInterval(t); volando = false; hada.classList.remove('volando'); }
        }, 90);
    }

    function decir(texto, ms) {
        clearTimeout(timerBurbuja);
        burbuja.textContent = texto;
        // la burbuja se abre hacia el lado donde hay espacio
        const r = hada.getBoundingClientRect();
        burbuja.classList.toggle('a-la-izq', r.left > window.innerWidth / 2);
        burbuja.classList.add('visible');
        timerBurbuja = setTimeout(() => burbuja.classList.remove('visible'), ms || 5200);
    }

    function fraseNueva() {
        let i;
        do { i = Math.floor(Math.random() * FRASES.length); } while (i === ultimaFrase && FRASES.length > 1);
        ultimaFrase = i;
        return FRASES[i];
    }

    function tocar() {
        hada.classList.remove('gira');
        void hada.offsetWidth;
        hada.classList.add('gira');
        decir(fraseNueva());
        reiniciarPaseo();
    }

    function pasear() {
        if (!zona || zona.classList.contains('escondida') || volando) return;
        const p = lugarAlAzar();
        volarA(p.x, p.y);
        if (Math.random() < 0.45) setTimeout(() => decir(fraseNueva()), 2200);
    }

    function reiniciarPaseo() {
        clearInterval(paseo);
        if (!quieta) paseo = setInterval(pasear, 9000 + Math.random() * 5000);
    }

    async function aparecer() {
        if (oculta()) return esconder();
        await crear();
        if (!zona.classList.contains('escondida') && hada.dataset.lista) return;   // ya está en pantalla
        zona.classList.remove('escondida');
        const L = limites();
        // entra volando desde la derecha y se queda cerca del saludo
        volarA(window.innerWidth + 20, L.y0 + 40, true);
        void hada.offsetWidth;
        hada.dataset.lista = '1';
        setTimeout(() => {
            volarA(Math.min(L.x1, window.innerWidth - (hada.offsetWidth || 90) - 18), L.y0 + 10);
            const n = nombre();
            let animo = null;
            try { animo = localStorage.getItem('animo_' + (typeof a2Hoy === 'function' ? a2Hoy() : '')); } catch (e) { /* nada */ }
            const saludo = animo && POR_ANIMO[animo]
                ? (n ? `¡Hola, ${n}! ` : '¡Hola! ') + POR_ANIMO[animo]
                : (n ? `¡Hola, ${n}! Qué bueno verte hoy.` : '¡Hola! Qué bueno verte hoy.');
            setTimeout(() => decir(saludo, 6000), quieta ? 0 : 1700);
        }, 60);
        reiniciarPaseo();
    }

    function esconder() {
        clearInterval(paseo);
        if (!zona) return;
        zona.classList.add('escondida');
        burbuja.classList.remove('visible');
        delete hada.dataset.lista;
    }

    // cuando eliges tu ánimo en Hoy, el hada te responde
    function alElegirAnimo(clave) {
        if (!zona || zona.classList.contains('escondida') || !POR_ANIMO[clave]) return;
        const caja = document.getElementById('a3Animos')?.getBoundingClientRect();
        if (caja) {
            const L = limites();
            volarA(Math.max(L.x0, Math.min(L.x1, caja.right - (hada.offsetWidth || 90))), Math.max(L.y0, Math.min(L.y1, caja.bottom + 6)));
        }
        setTimeout(() => decir(POR_ANIMO[clave], 6000), quieta ? 0 : 1300);
        reiniciarPaseo();
    }

    // ---- conexión con la app ----
    window.hadaMostrar = aparecer;
    window.hadaOcultar = esconder;
    window.hadaCambiarVisible = function () {
        const ahora = !oculta();
        try { localStorage.setItem('hada_oculta', ahora ? '1' : '0'); } catch (e) { /* nada */ }
        if (ahora) esconder();
        actualizarTextoYo();
    };
    function actualizarTextoYo() {
        const t = document.getElementById('hadaYoTexto');
        if (t) t.textContent = oculta() ? 'Mostrar a mi hada madrina' : 'Ocultar a mi hada madrina';
    }

    function revisarSeccion() {
        const enHoy = document.getElementById('seccion-hoy')?.classList.contains('activa');
        const dentro = document.body.classList.contains('a3-dentro');
        if (enHoy && dentro) aparecer(); else esconder();
        actualizarTextoYo();
    }

    if (typeof a3ElegirAnimo === 'function') {
        const original = a3ElegirAnimo;
        window.a3ElegirAnimo = function (clave) { original(clave); alElegirAnimo(clave); };
    }
    window.addEventListener('seccion-changed', () => setTimeout(revisarSeccion, 30));
    document.addEventListener('DOMContentLoaded', () => setTimeout(revisarSeccion, 400));
    window.addEventListener('resize', () => { if (zona && !zona.classList.contains('escondida')) { const p = lugarAlAzar(); volarA(p.x, p.y, true); } });
})();
