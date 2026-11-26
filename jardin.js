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
        { centro: '#FFF3F6', medio: '#F2A7C0', borde: '#D96A93', oscuro: '#A8456D' },   // rosa
        { centro: '#FFF5EE', medio: '#F7B79A', borde: '#E58A6A', oscuro: '#B5603F' },   // coral durazno
        { centro: '#FFFDF6', medio: '#F8E6C8', borde: '#E9C98E', oscuro: '#B89150' },   // crema
        { centro: '#FBF4FF', medio: '#D9B8EA', borde: '#B07FCF', oscuro: '#7E519D' },   // lila
        { centro: '#FFF0F2', medio: '#E5707F', borde: '#B83A52', oscuro: '#7E1F33' },   // roja
        { centro: '#FFF7FA', medio: '#F7C9D8', borde: '#EBA0BA', oscuro: '#C26E8D' }    // rosa pálido
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
    // ---------- la rosa: crece de semilla a rosa abierta (p de 0 a 1) ----------
    function rosaSVG(p, c, dormida, mini, uid) {
        uid = uid || 'r';
        const s3 = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
        const tr = (a, b) => s3((p - a) / (b - a));
        const base = 196;
        const alto = 14 + 112 * tr(0.04, 0.55);
        const topY = base - alto;
        const doblar = dormida ? 1 : 0;
        const hx = 100 + 16 * doblar, hy = topY + 12 * doblar;
        let s = `<defs>
          <linearGradient id="${uid}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.centro}"/><stop offset=".45" stop-color="${c.medio}"/><stop offset="1" stop-color="${c.borde}"/></linearGradient>
          <linearGradient id="${uid}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.medio}"/><stop offset="1" stop-color="${c.borde}"/></linearGradient>
          <linearGradient id="${uid}q" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.centro}"/><stop offset=".3" stop-color="${c.medio}"/><stop offset="1" stop-color="${c.borde}"/></linearGradient>
          <linearGradient id="${uid}h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A8CFA2"/><stop offset="1" stop-color="#4F8A5C"/></linearGradient>
          <radialGradient id="${uid}l"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".85"/><stop offset="1" stop-color="#FFF4D6" stop-opacity="0"/></radialGradient>
        </defs>`;
        if (!mini) s += `<ellipse cx="100" cy="${base + 4}" rx="60" ry="11" fill="#CFA78E"/><ellipse cx="100" cy="${base + 1}" rx="52" ry="7.5" fill="#B88B70"/>`;
        if (p < 0.12 && !mini) {
            const v = 1 - tr(0.06, 0.12);
            s += `<ellipse cx="100" cy="${base - 2}" rx="${6 * v + 1}" ry="${4 * v + 1}" fill="#8A5A3C" transform="rotate(-18 100 ${base - 2})"/>`;
        }
        if (p >= 0.03) {
            const tallo = `M100 ${base} C 98 ${base - alto * 0.35}, ${103 + 8 * doblar} ${base - alto * 0.7}, ${hx} ${hy + 8}`;
            s += `<path d="${tallo}" stroke="#5E9468" stroke-width="${2.6 + 1.4 * tr(0.1, 0.5)}" fill="none" stroke-linecap="round"/>`;
            // espinitas
            if (p > 0.2) s += `<path d="M99 ${base - alto * 0.22} l-5 -3 l5 -1 Z M101.5 ${base - alto * 0.5} l5 -3 l-4.6 -1.4 Z" fill="#5E9468"/>`;
            // hojas de rosa (ovaladas, con borde aserrado y nervio)
            const hoja = (y, lado, esc) => {
                if (esc <= 0.02) return '';
                return `<g transform="translate(${100 + lado * 1} ${y}) rotate(${lado * (dormida ? 62 : 34)}) scale(${lado * esc} ${esc})">
                  <path d="M0 0 C 6 -11, 20 -14, 32 -6 L29 -4 L33 -1 L28 1 L31 4 C 20 11, 6 9, 0 0 Z" fill="url(#${uid}h)"/>
                  <path d="M2 0 C 12 -2, 22 -2, 31 -1" stroke="#3F7A4D" stroke-width="1" fill="none" opacity=".7"/></g>`;
            };
            s += hoja(base - alto * 0.3, -1, tr(0.08, 0.22));
            s += hoja(base - alto * 0.46, 1, tr(0.18, 0.34) * 0.9);
            s += hoja(base - alto * 0.62, -1, tr(0.3, 0.46) * 0.72);
        }
        if (p >= 1 && !dormida && !mini) s += `<circle cx="${hx}" cy="${hy - 14}" r="52" fill="url(#${uid}l)" class="jd-aura"/>`;
        const boton = tr(0.45, 0.6);
        const o = dormida ? 0.1 : tr(0.6, 1);
        if (boton > 0) {
            const esc = (0.42 + 0.58 * boton) * (0.78 + 0.22 * o);
            s += `<g transform="translate(${hx} ${hy + 6}) rotate(${dormida ? 58 : 0}) scale(${esc.toFixed(3)})">`;
            // sépalos
            s += `<path d="M0 -4 C -8 2, -20 2, -27 -6 C -18 -3, -10 -5, -4 -8 Z M0 -4 C 8 2, 20 2, 27 -6 C 18 -3, 10 -5, 4 -8 Z M0 -4 C -3 4, 3 4, 0 -4 Z" fill="#5E9468"/>`;
            const ab = o;               // apertura
            // pétalos traseros (se abren hacia los lados)
            const atras = (lado) => `<g transform="rotate(${lado * (4 + 22 * ab)} ${lado * 4} -6)">
                <path d="M${lado * 2} -6 C ${lado * 20} -6, ${lado * 30} -24, ${lado * 26} -44 C ${lado * 22} -48, ${lado * 14} -47, ${lado * 10} -44 C ${lado * 6} -46, ${lado * 2} -45, 0 -42 Z" fill="url(#${uid}f)"/>
                <path d="M${lado * 26} -44 C ${lado * 22} -48, ${lado * 14} -47, ${lado * 10} -44" stroke="${c.centro}" stroke-width="1.4" fill="none" opacity=".7"/></g>`;
            if (ab > 0.05) s += atras(-1) + atras(1);
            // copa interior: boca abierta vista desde un poco arriba
            s += `<ellipse cx="0" cy="-37" rx="${11 + 5 * ab}" ry="${5 + 3 * ab}" fill="${c.oscuro}"/>`;
            // capullo central en espiral
            s += `<path d="M-11 -37 C -12 -48, 12 -48, 11 -37 C 9 -30, -9 -30, -11 -37 Z" fill="${c.borde}"/>`;
            s += `<path d="M-1 -38 C -1 -41.5, 5 -41.5, 5 -38 C 5 -34.5, -6 -34.5, -6 -39 C -6 -44.5, 9 -45.5, 9.5 -38.5" stroke="${c.oscuro}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".85"/>`;
            s += `<path d="M-10 -40 C -8 -46, 8 -47, 10 -41" stroke="${c.medio}" stroke-width="1.3" fill="none" opacity=".9"/>`;
            // fondo del centro para que no quede hueco entre pétalos
            s += `<path d="M-9 -37 C -10 -22, -6 -8, 0 -6 C 6 -8, 10 -22, 9 -37 C 5 -33, -5 -33, -9 -37 Z" fill="url(#${uid}f)"/>`;
            s += `<path d="M-4 -32 C -4 -22, -2 -12, 0 -9 C 2 -12, 4 -22, 4 -32" stroke="${c.oscuro}" stroke-width="1" fill="none" opacity=".35"/>`;
            // pétalos que envuelven (izquierda y derecha)
            const envuelve = (lado) => `<g transform="rotate(${lado * 10 * ab} ${lado * 2} -8)">
                <path d="M${lado * 17} -38 C ${lado * 22} -24, ${lado * 14} -9, ${lado * -2} -7 C ${lado * 4} -18, ${lado * 4} -32, ${lado * -1} -41 C ${lado * 6} -44, ${lado * 13} -43, ${lado * 17} -38 Z" fill="url(#${uid}q)"/>
                <path d="M${lado * -1} -41 C ${lado * 6} -44, ${lado * 13} -43, ${lado * 17} -38" stroke="${c.centro}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".75"/></g>`;
            s += envuelve(-1) + envuelve(1);
            // pétalos laterales con la punta doblada hacia afuera
            const lateral = (lado) => `<g transform="rotate(${lado * (2 + 14 * ab)} ${lado * 3} -6)">
                <path d="M${lado * 23} -30 C ${lado * 31} -24, ${lado * 30} -10, ${lado * 20} -5 C ${lado * 12} -1, ${lado * 4} -2, 0 -6 C ${lado * 10} -9, ${lado * 18} -16, ${lado * 23} -30 Z" fill="url(#${uid}q)"/>
                <path d="M${lado * 23} -30 C ${lado * 28} -33, ${lado * 33} -31, ${lado * 33} -26 C ${lado * 30} -28, ${lado * 26} -28, ${lado * 23} -30 Z" fill="${c.centro}"/></g>`;
            if (ab > 0.02) s += lateral(-1) + lateral(1);
            // pétalo frontal grande (la copa)
            const fy = -27 + 3 * (1 - ab);
            s += `<path d="M-21 ${fy} C -21 -8, -9 -3, 0 -3 C 9 -3, 21 -8, 21 ${fy} C 15 ${fy + 4}, 7 ${fy + 1}, 0 ${fy + 4} C -7 ${fy + 1}, -15 ${fy + 4}, -21 ${fy} Z" fill="url(#${uid}q)" transform="scale(${0.7 + 0.3 * ab} 1)"/>`;
            s += `<path d="M-21 ${fy} C -15 ${fy + 4}, -7 ${fy + 1}, 0 ${fy + 4} C 7 ${fy + 1}, 15 ${fy + 4}, 21 ${fy}" stroke="${c.centro}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".85" transform="scale(${0.7 + 0.3 * ab} 1)"/>`;
            s += `<path d="M-8 ${fy + 9} C -6 -10, 4 -8, 9 ${fy + 11}" stroke="${c.borde}" stroke-width="1" fill="none" opacity=".35"/>`;
            s += `</g>`;
        }
        return s;
    }
    let _uid = 0;
    function svgFlor(p, color, dormida, extra) {
        return rosaSVG(p, color, dormida, extra === 'mini', 'jr' + (++_uid));
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
