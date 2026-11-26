// =====================================================================
// MI JARDÍN · el alma de Ella Florece
// Cada mujer tiene una flor en "Hoy" que crece con lo que hace por ella:
// escribir, cumplir un hábito, leer su carta, hacer su reto, respirar...
// Cada flor necesita 30 gotas para abrirse; luego pasa al jardín y nace otra semilla.
// Si pasa una semana sin entrar, la flor se duerme (nunca se muere) y despierta al volver.
// =====================================================================
(function () {
    const GOTAS_POR_FLOR = 30;
    const COLORES = [
        { petalo: '#F28DB2', oscuro: '#D9628F' },   // rosa
        { petalo: '#C9A0DC', oscuro: '#A274BE' },   // lila
        { petalo: '#F6B48F', oscuro: '#E08D63' },   // durazno
        { petalo: '#F4C95D', oscuro: '#D9A838' },   // dorado
        { petalo: '#E86A92', oscuro: '#C44874' },   // frambuesa
        { petalo: '#A9C7EC', oscuro: '#7FA6D6' }    // celeste
    ];
    const ETAPAS = ['Semillita', 'Brotando', 'Tallito', 'Hojitas', 'Botón', 'Abriéndose', '¡Florecida!'];
    const COMO_REGAR = [
        ['Escribir en tu diario', 3], ['Hacer tu reto del día', 2], ['Cada hábito cumplido', 1],
        ['Leer tu carta del día', 1], ['Decir cómo te sientes', 1], ['Respirar en Calma', 1], ['Entrar cada día', 1]
    ];

    let estado = { puntos: 0, ultima: null, cargado: false };

    function hoy() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    function diasDesde(fecha) {
        if (!fecha) return 0;
        const [a, m, d] = fecha.split('-').map(Number);
        return Math.round((new Date(new Date().toDateString()) - new Date(a, m - 1, d)) / 86400000);
    }
    const suave = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
    const tramo = (p, a, b) => suave((p - a) / (b - a));

    // ---------- el dibujo de la flor según cuánto ha crecido (p de 0 a 1) ----------
    function svgFlor(p, color, dormida, extra) {
        const base = 196;
        const alto = 14 + 116 * tramo(p, 0.04, 0.55);
        const topY = base - alto;
        const curva = dormida ? 26 : 6;
        const tallo = `M100 ${base} C ${100 - curva * 0.3} ${base - alto * 0.4}, ${100 + curva} ${base - alto * 0.75}, ${100 + (dormida ? 18 : 0)} ${topY + (dormida ? 10 : 0)}`;
        const cabX = 100 + (dormida ? 18 : 0), cabY = topY + (dormida ? 10 : 0);
        let s = '';
        // tierra
        if (extra !== 'mini') s += `<ellipse cx="100" cy="${base + 4}" rx="62" ry="12" fill="#C79B82"/><ellipse cx="100" cy="${base + 1}" rx="54" ry="8" fill="#B58468"/>`;
        // semilla
        if (p < 0.12) {
            const v = 1 - tramo(p, 0.06, 0.12);
            s += `<ellipse cx="100" cy="${base - 2}" rx="${7 * v + 1}" ry="${4.5 * v + 1}" fill="#8A5A3C" transform="rotate(-18 100 ${base - 2})"/>`;
        }
        if (p >= 0.03) {
            s += `<path d="${tallo}" stroke="#6FAE6A" stroke-width="${3 + 2 * tramo(p, 0.1, 0.5)}" fill="none" stroke-linecap="round"/>`;
            // hojas
            const hoja = (y, lado, esc) => {
                if (esc <= 0.01) return '';
                const x = 100 + (y - base) * -0.02;
                const rot = lado * (dormida ? 70 : 40);
                return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${esc})"><path d="M0 0 C 8 -10, 28 -10, 34 0 C 28 8, 8 8, 0 0 Z" fill="#7FC07A"/><path d="M2 0 L30 0" stroke="#5E9E5A" stroke-width="1.2"/></g>`;
            };
            s += hoja(base - alto * 0.3, -1, tramo(p, 0.08, 0.2) * 1.0) + hoja(base - alto * 0.3, 1, 0);
            s += `<g transform="scale(-1 1) translate(-200 0)">${hoja(base - alto * 0.48, -1, tramo(p, 0.18, 0.32) * 0.95)}</g>`;
            s += hoja(base - alto * 0.66, -1, tramo(p, 0.3, 0.45) * 0.75);
        }
        // botón y flor
        const boton = tramo(p, 0.45, 0.6);
        const abre = dormida ? 0.15 : tramo(p, 0.6, 1);
        if (boton > 0) {
            const n = 8;
            const radio = 4 + 9 * abre;
            const largo = (12 + 9 * abre) * boton;
            const ancho = (6 + 4.5 * abre) * boton;
            let petalos = '';
            for (let i = 0; i < n; i++) {
                const ang = (360 / n) * i + (abre < 0.3 ? 0 : 0);
                const cierre = (1 - abre) * 70 * (i % 2 ? 1 : -1) * 0.25;
                petalos += `<ellipse cx="0" cy="${-radio - largo * 0.55}" rx="${ancho}" ry="${largo * 0.62}" fill="${i % 2 ? color.oscuro : color.petalo}" transform="rotate(${ang + cierre})" opacity=".97"/>`;
            }
            const giro = dormida ? 70 : 0;
            const sepalos = `<path d="M-9 4 Q0 -10 9 4 Q0 0 -9 4 Z" fill="#6FAE6A" transform="scale(${boton})"/>`;
            s += `<g transform="translate(${cabX} ${cabY}) rotate(${giro})">`;
            if (abre < 0.08) {
                s += `<ellipse cx="0" cy="-8" rx="${7 * boton}" ry="${11 * boton}" fill="${color.oscuro}"/>${sepalos}`;
            } else {
                s += `<g transform="scale(${0.55 + 0.45 * abre})">${petalos}</g>`;
                s += `<circle r="${(5 + 7 * abre)}" fill="#F7D774"/><circle r="${(3 + 4 * abre)}" fill="#E9B949"/>`;
            }
            s += '</g>';
        }
        if (p >= 1 && !dormida && extra !== 'mini') {
            s += `<circle cx="${cabX}" cy="${cabY}" r="46" fill="url(#jdLuz)" class="jd-aura"/>`;
        }
        return s;
    }

    function svgEscena(puntos, dormida) {
        const flores = Math.floor(puntos / GOTAS_POR_FLOR);
        const p = (puntos % GOTAS_POR_FLOR) / GOTAS_POR_FLOR;
        const color = COLORES[flores % COLORES.length];
        // flores ya abiertas, chiquitas, alrededor
        const lugares = [[-58, 0.5], [58, 0.5], [-90, 0.4], [90, 0.4], [-30, 0.36], [30, 0.36], [-118, 0.34], [118, 0.34]];
        let jardin = '';
        for (let i = 0; i < Math.min(flores, lugares.length); i++) {
            const [dx, esc] = lugares[i];
            const c = COLORES[(flores - 1 - i) % COLORES.length];
            jardin += `<g transform="translate(${100 + dx - 100 * esc} ${196 - 196 * esc + 6}) scale(${esc})" opacity=".9">${svgFlor(1, c, false, 'mini')}</g>`;
        }
        return `<svg viewBox="0 0 200 215" class="jd-svg" role="img" aria-label="Tu flor: ${ETAPAS[Math.min(6, Math.floor(p * 7))]}">
            <defs><radialGradient id="jdLuz"><stop offset="0" stop-color="#FFF3C4" stop-opacity=".9"/><stop offset="1" stop-color="#FFF3C4" stop-opacity="0"/></radialGradient></defs>
            ${jardin}
            <g class="jd-planta${dormida ? ' dormida' : ''}">${svgFlor(p, color, dormida)}</g>
        </svg>`;
    }

    // ---------- pantalla ----------
    function etapa(puntos) {
        const p = (puntos % GOTAS_POR_FLOR) / GOTAS_POR_FLOR;
        return Math.min(6, Math.floor(p * 7));
    }

    function pintar(animar) {
        const caja = document.getElementById('jdEscena');
        if (!caja) return;
        const dormida = estado.dormida;
        caja.innerHTML = svgEscena(estado.puntos, dormida);
        const flores = Math.floor(estado.puntos / GOTAS_POR_FLOR);
        const enFlor = estado.puntos % GOTAS_POR_FLOR;
        document.getElementById('jdEtapa').textContent = dormida ? 'Dormidita, te espera' : ETAPAS[etapa(estado.puntos)];
        document.getElementById('jdGotas').textContent = `${enFlor} de ${GOTAS_POR_FLOR} gotas`;
        document.getElementById('jdBarra').style.width = Math.round(enFlor / GOTAS_POR_FLOR * 100) + '%';
        const fl = document.getElementById('jdFlores');
        fl.textContent = flores ? `${flores} ${flores === 1 ? 'flor' : 'flores'} en tu jardín` : '';
        if (animar) {
            const planta = caja.querySelector('.jd-planta');
            planta?.classList.add('crece');
        }
    }

    async function cargar() {
        try {
            const r = await fetch('/api/jardin?fecha=' + hoy(), { credentials: 'include' });
            if (r.ok) {
                const d = await r.json();
                estado.puntos = d.puntos || 0;
                estado.ultima = d.ultima_fecha;
            }
        } catch (e) {
            try { estado.puntos = Number(localStorage.getItem('jardin_puntos') || 0); } catch (e2) { /* nada */ }
        }
        estado.dormida = estado.ultima && diasDesde(estado.ultima) >= 7;
        estado.cargado = true;
        pintar();
    }

    // ---------- regar ----------
    function gotas(n) {
        const caja = document.getElementById('jdEscena');
        if (!caja) return;
        for (let i = 0; i < Math.min(6, 2 + n); i++) {
            const g = document.createElement('span');
            g.className = 'jd-gota';
            g.textContent = '💧';
            g.style.left = (44 + Math.random() * 12) + '%';
            g.style.animationDelay = (i * 0.13) + 's';
            caja.appendChild(g);
            setTimeout(() => g.remove(), 1600);
        }
    }

    function avisoFuera(ganadas) {
        const a = document.createElement('div');
        a.className = 'jd-aviso';
        a.innerHTML = `<span>💧</span> +${ganadas} para tu flor`;
        document.body.appendChild(a);
        setTimeout(() => a.classList.add('fuera'), 1900);
        setTimeout(() => a.remove(), 2500);
    }

    async function regar(accion) {
        let res = null;
        try {
            const r = await fetch('/api/jardin/regar', {
                method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion, fecha: hoy() })
            });
            if (r.ok) res = await r.json();
        } catch (e) { /* sin conexión: no pasa nada */ }
        if (!res || !res.ganadas) return;
        const antes = estado.puntos;
        const etapaAntes = etapa(antes), floresAntes = Math.floor(antes / GOTAS_POR_FLOR);
        const despertó = estado.dormida;
        estado.puntos = res.puntos;
        estado.ultima = hoy();
        estado.dormida = false;
        try { localStorage.setItem('jardin_puntos', String(res.puntos)); } catch (e) { /* nada */ }

        const enHoy = document.getElementById('seccion-hoy')?.classList.contains('activa');
        if (!enHoy) { avisoFuera(res.ganadas); return; }
        gotas(res.ganadas);
        setTimeout(() => {
            pintar(true);
            const floresAhora = Math.floor(estado.puntos / GOTAS_POR_FLOR);
            let frase = null;
            if (despertó) frase = '¡Volviste! Tu flor te estaba esperando 🌷';
            else if (floresAhora > floresAntes) frase = '¡Tu flor se abrió por completo! Ya vive en tu jardín. Aquí nace una semillita nueva 🌸';
            else if (etapa(estado.puntos) > etapaAntes) frase = `¡Mira! Tu flor ya está: ${ETAPAS[etapa(estado.puntos)].toLowerCase().replace('¡', '').replace('!', '')} ✨`;
            if (frase && window.hadaDecir) window.hadaDecir(frase);
        }, 700);
    }

    function mostrarComoRegar() {
        const caja = document.getElementById('jdComo');
        if (!caja) return;
        caja.classList.toggle('abierto');
    }

    // ---------- conexión con el resto de la app ----------
    window.jardinRegar = regar;
    window.jardinDibujo = svgEscena;   // para vistas previas
    window.jardinComoRegar = mostrarComoRegar;

    function envolver(nombre, despues) {
        const original = window[nombre];
        if (typeof original !== 'function') return;
        window[nombre] = function () {
            const r = original.apply(this, arguments);
            try { despues.apply(this, arguments); } catch (e) { /* nada */ }
            return r;
        };
    }

    document.addEventListener('DOMContentLoaded', () => {
        // la explicación de cómo regar, en vez de instrucciones por todos lados
        const lista = document.getElementById('jdComoLista');
        if (lista) lista.innerHTML = COMO_REGAR.map(([t, n]) => `<li><span>${t}</span><b>${'💧'.repeat(n)}</b></li>`).join('');

        envolver('a3ElegirAnimo', () => regar('animo'));
        const voltear = window.a3VoltearCarta;
        if (typeof voltear === 'function') {
            window.a3VoltearCarta = function () {
                const r = voltear.apply(this, arguments);
                if (document.getElementById('a3Carta')?.classList.contains('volteada')) regar('carta');
                return r;
            };
        }
        const reto = window.a3RetoHecho;
        if (typeof reto === 'function') {
            window.a3RetoHecho = function () {
                const ya = document.getElementById('a3Reto')?.classList.contains('hecho');
                const r = reto.apply(this, arguments);
                if (!ya) regar('reto');
                return r;
            };
        }
        const guardar = window.guardarPaginaScrapbook;
        if (typeof guardar === 'function') {
            window.guardarPaginaScrapbook = async function () {
                const antes = (typeof dcPaginas === 'function') ? dcPaginas().length : 0;
                const r = await guardar.apply(this, arguments);
                if (typeof dcPaginas === 'function' && dcPaginas().length > antes) regar('diario');
                return r;
            };
        }
        const marcar = window.toggleHabito;
        if (typeof marcar === 'function') {
            window.toggleHabito = function (fecha, id) {
                const yaHecho = (typeof habitosDelMes !== 'undefined' && (habitosDelMes[fecha] || []).includes(id));
                const r = marcar.apply(this, arguments);
                if (!yaHecho && fecha === hoy()) regar('habito');
                return r;
            };
        }
        ['iniciarRespiracionCalma', 'guardarGrounding', 'liberarPensamientos'].forEach(n => envolver(n, () => regar('calma')));
    });

    window.addEventListener('seccion-changed', () => setTimeout(async () => {
        if (!document.getElementById('seccion-hoy')?.classList.contains('activa')) return;
        if (!estado.cargado) await cargar(); else pintar();
        regar('visita');
    }, 60));
})();
