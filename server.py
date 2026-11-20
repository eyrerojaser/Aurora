#!/usr/bin/env python3
import os
import re
import time
import uuid
import json
import hmac
import hashlib
import secrets
from datetime import datetime, date, timedelta
from werkzeug.middleware.proxy_fix import ProxyFix
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import psycopg2
from psycopg2.extras import RealDictCursor, Json
import stripe
import resend

app = Flask(__name__, static_folder='.')

def _clave_de_sesion():
    """Clave estable para las sesiones. Si no hay SESSION_SECRET, se deriva de la
    conexion a la base de datos para que los 4 workers compartan la misma clave
    (una clave al azar por worker hacia que las sesiones se perdieran)."""
    clave = os.environ.get('SESSION_SECRET') or os.environ.get('SECRET_KEY')
    if clave:
        return clave
    base = os.environ.get('DATABASE_URL') or os.environ.get('PGPASSWORD')
    if base:
        return hashlib.sha256(('aurora-sesion:' + base).encode()).hexdigest()
    return str(uuid.uuid4())

app.secret_key = _clave_de_sesion()

# Los hostings ponen un proxy delante: sin esto todas las usuarias parecen la
# misma IP y los limites por IP (y la lista negra) las afectan a todas juntas.
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)

# Direccion publica de la app, por ejemplo https://mi-dominio.com (variable APP_URL).
APP_URL = (os.environ.get('APP_URL') or '').strip().rstrip('/')

# Remitente de los emails. El dominio debe estar verificado en Resend.
EMAIL_REMITENTE = os.environ.get('EMAIL_FROM') or 'notificaciones@aurora-tu-guia-de-empoderamiento.digital'

# Configuración de sesiones para que funcionen correctamente
app.config['SESSION_COOKIE_HTTPONLY'] = True
# Tope de lo que se puede enviar de una vez (fotos del diario, collage y tablero)
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20 MB
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Permitir cookies en mismo sitio
app.config['SESSION_COOKIE_SECURE'] = True  # Solo HTTPS (se desactiva al correr "python server.py" en tu computadora)
app.config['PERMANENT_SESSION_LIFETIME'] = 90 * 86400  # 90 días (el acceso ahora pide código por email)

# La app se sirve desde su mismo dominio, asi que solo se permite ese origen.
if APP_URL:
    CORS(app, supports_credentials=True, origins=[APP_URL])

# Rate Limiting - Protección contra bots y abuso
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["1000 per day", "200 per hour"],
    storage_uri="memory://",
    strategy="fixed-window"
)

# Función helper para obtener email del usuario desde la sesión o base de datos
def get_user_email_from_session():
    """Obtiene el email del usuario de la sesión o la base de datos"""
    if 'email' in session:
        return session['email']
    if 'usuario_id' in session:
        try:
            conn = get_db()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute('SELECT email FROM usuarios WHERE id = %s', (session['usuario_id'],))
            result = cur.fetchone()
            cur.close()
            conn.close()
            if result:
                session['email'] = result['email']
                return result['email']
        except Exception as e:
            print(f'Error obteniendo email: {e}')
    return None

# Lista negra de IPs (en memoria para velocidad)
ip_blacklist = set()

@app.before_request
def check_blacklist():
    if request.remote_addr in ip_blacklist:
        return "Acceso denegado por actividad sospechosa.", 403

# Rutas "Trampa" (Honeypots) para bots
@app.route('/admin.php')
@app.route('/adminfuns.php')
@app.route('/file.php')
@app.route('/wp-login.php')
def honeypot():
    ip = request.remote_addr
    ip_blacklist.add(ip)
    print(f"🚫 BOT BLOQUEADO: IP {ip} intentó acceder a {request.path}")
    return "Not Found", 404

# Excluir archivos estáticos de la limitación para evitar errores de carga de interfaz
@app.before_request
def check_static():
    if request.path.startswith('/static/') or request.path.endswith(('.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.json')):
        return None


stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
resend.api_key = os.environ.get('RESEND_API_KEY')

ADMIN_EMAIL = 'auroraempowerment26@gmail.com'
# La contraseña del admin SOLO vive en los Secrets de Replit (ADMIN_PASSWORD).
# Si no está configurada, el panel admin queda cerrado.
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '')
ADMIN_SESION_HORAS = 12

def es_admin():
    """True si esta sesión hizo login de admin hace menos de ADMIN_SESION_HORAS."""
    if not session.get('admin_verified'):
        return False
    try:
        inicio = datetime.fromisoformat(session.get('admin_time', ''))
    except (TypeError, ValueError):
        return False
    return datetime.now() - inicio < timedelta(hours=ADMIN_SESION_HORAS)

JOURNAL_LINK = "https://drive.google.com/file/d/1xugsU4D5UvwICkxYjhlQIpc_HIoY0TCO/view?usp=sharing"

def enviar_email_bienvenida_journal(nombre, email):
    """Envía email de bienvenida con el Journal Digital a la usuaria"""
    try:
        if not resend.api_key:
            print("⚠️ RESEND_API_KEY no configurada")
            return False
        
        params = {
            "from": "Aurora <onboarding@resend.dev>",
            "reply_to": [ADMIN_EMAIL],
            "to": [email],
            "subject": f"🎁 {nombre}, aquí está tu Journal de Empoderamiento",
            "html": f"""
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fff5f8 0%, #fffaf5 100%); border-radius: 20px; padding: 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #8b4789; font-size: 32px; margin: 0;">🌸 Aurora</h1>
                    <p style="color: #8b7d7d; margin: 10px 0 0 0;">Tu Guía de Empoderamiento Personal</p>
                </div>
                
                <div style="background: white; border-radius: 15px; padding: 25px; box-shadow: 0 5px 15px rgba(255, 212, 229, 0.3);">
                    <h2 style="color: #8b4789; margin-top: 0; text-align: center;">¡Hola {nombre}! 💖</h2>
                    
                    <p style="color: #6b3f3f; line-height: 1.6; font-size: 16px;">
                        ¡Bienvenida a la familia Aurora! Estamos tan emocionadas de tenerte aquí.
                    </p>
                    
                    <p style="color: #6b3f3f; line-height: 1.6; font-size: 16px;">
                        Como prometimos, aquí está tu regalo especial:
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #fff9e6 0%, #fffdf5 100%); border: 2px solid #f4c542; border-radius: 15px; padding: 20px; margin: 20px 0; text-align: center;">
                        <p style="font-size: 40px; margin: 0;">🎁</p>
                        <h3 style="color: #8b4789; margin: 10px 0;">Journal Digital de Empoderamiento</h3>
                        <p style="color: #6b3f3f; margin: 5px 0;">📖 100 páginas con frases motivadoras</p>
                        <p style="color: #8b7d7d; font-size: 14px; margin: 5px 0;">Para acompañarte en tu camino de crecimiento personal</p>
                        
                        <a href="{JOURNAL_LINK}" style="display: inline-block; background: linear-gradient(135deg, #f4c542 0%, #f4a742 100%); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 15px; font-size: 16px;">
                            📥 DESCARGAR MI JOURNAL
                        </a>
                    </div>
                    
                    <p style="color: #6b3f3f; line-height: 1.6; font-size: 16px;">
                        Aurora estará lista para ti en <strong>Enero 2026</strong>. Serás de las primeras en saberlo.
                    </p>
                    
                    <p style="color: #6b3f3f; line-height: 1.6; font-size: 16px;">
                        Mientras tanto, disfruta tu Journal y empieza a escribir tus sueños. ✨
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <p style="color: #8b7d7d; font-size: 14px;">
                        Con amor,<br>
                        <strong style="color: #8b4789;">El equipo Aurora</strong> 💜
                    </p>
                    <p style="color: #8b7d7d; font-size: 12px; margin-top: 15px;">
                        ¿Tienes alguna pregunta? Responde a este email o escríbenos a:<br>
                        <a href="mailto:auroraempowerment26@gmail.com" style="color: #8b4789; text-decoration: none;">auroraempowerment26@gmail.com</a>
                    </p>
                </div>
            </div>
            """
        }
        
        resend.Emails.send(params)
        print(f"✅ Email de bienvenida con Journal enviado a {email}")
        return True
        
    except Exception as e:
        print(f"❌ Error enviando email de bienvenida: {e}")
        return False

def enviar_notificacion_lista_espera(nombre, email, telefono):
    """Envía email de notificación cuando alguien se registra en la lista de espera"""
    try:
        if not resend.api_key:
            print("⚠️ RESEND_API_KEY no configurada")
            return False
        
        telefono_texto = telefono if telefono else 'No proporcionado'
        fecha_actual = datetime.now().strftime('%d/%m/%Y %H:%M')
        
        params = {
            "from": f"Aurora Lista de Espera <{EMAIL_REMITENTE}>",
            "to": [ADMIN_EMAIL],
            "subject": f"🌸 Nueva inscripción en Aurora: {nombre}",
            "html": f"""
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fff5f8 0%, #fffaf5 100%); border-radius: 20px; padding: 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #8b4789; font-size: 28px; margin: 0;">🌸 Aurora</h1>
                    <p style="color: #8b7d7d; margin: 10px 0 0 0;">Nueva inscripción en la lista de espera</p>
                </div>
                
                <div style="background: white; border-radius: 15px; padding: 25px; box-shadow: 0 5px 15px rgba(255, 212, 229, 0.3);">
                    <h2 style="color: #8b4789; margin-top: 0;">✨ Datos del registro:</h2>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #ffd4e5; color: #8b7d7d; font-weight: 600;">👤 Nombre:</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #ffd4e5; color: #6b3f3f;">{nombre}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #ffd4e5; color: #8b7d7d; font-weight: 600;">📧 Email:</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #ffd4e5; color: #6b3f3f;">{email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #ffd4e5; color: #8b7d7d; font-weight: 600;">📱 Teléfono:</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #ffd4e5; color: #6b3f3f;">{telefono_texto}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #8b7d7d; font-weight: 600;">📅 Fecha:</td>
                            <td style="padding: 12px 0; color: #6b3f3f;">{fecha_actual}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <p style="color: #8b7d7d; font-size: 14px;">
                        💫 ¡Tu comunidad de mujeres empoderadas sigue creciendo!
                    </p>
                </div>
            </div>
            """
        }
        
        resend.Emails.send(params)
        print(f"✅ Email enviado a {ADMIN_EMAIL} para registro de {nombre}")
        return True
        
    except Exception as e:
        print(f"❌ Error enviando email: {e}")
        return False

def get_database_url():
    if all(key in os.environ for key in ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'PGPORT']):
        return f"postgresql://{os.environ['PGUSER']}:{os.environ['PGPASSWORD']}@{os.environ['PGHOST']}:{os.environ['PGPORT']}/{os.environ['PGDATABASE']}"
    return os.environ.get('DATABASE_URL')

def get_db():
    try:
        DATABASE_URL = get_database_url()
        conn = psycopg2.connect(DATABASE_URL, connect_timeout=10)
        return conn
    except Exception as e:
        print(f"Error DB: {e}")
        raise


# ===== BASE DE DATOS: crea las tablas si no existen =====
# Asi la app funciona con una base de datos Postgres nueva y vacia, sin pasos manuales.
ESQUEMA_SQL = '''
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS diario_paginas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    pagina_id VARCHAR(40) NOT NULL,
    datos JSONB,
    borrada BOOLEAN NOT NULL DEFAULT FALSE,
    actualizado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, pagina_id)
);
CREATE TABLE IF NOT EXISTS metas (
    id SERIAL PRIMARY KEY,
    usuario_email VARCHAR(255),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    fecha_limite DATE,
    completada BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS vision_board (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    html_content TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_usuario_vision UNIQUE (usuario_id)
);
CREATE TABLE IF NOT EXISTS collage_elementos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    html_content TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_usuario_collage UNIQUE (usuario_id)
);
CREATE TABLE IF NOT EXISTS afirmaciones_personales (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS cartas_reveladas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    carta_numero INTEGER NOT NULL,
    fecha_revelada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, carta_numero)
);
CREATE TABLE IF NOT EXISTS premium_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'activo',
    plan VARCHAR(20),
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP
);
ALTER TABLE premium_usuarios ADD COLUMN IF NOT EXISTS plan VARCHAR(20);
CREATE TABLE IF NOT EXISTS lista_espera (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS habitos_calendario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    habitos_completados JSONB DEFAULT '[]'::jsonb,
    horarios_habitos JSONB,
    UNIQUE (usuario_id, fecha)
);
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, endpoint)
);
CREATE TABLE IF NOT EXISTS codigos_acceso (
    email VARCHAR(255) PRIMARY KEY,
    codigo_hash VARCHAR(64) NOT NULL,
    expira TIMESTAMP NOT NULL,
    intentos INTEGER NOT NULL DEFAULT 0,
    creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_metas_usuario_email ON metas (usuario_email);
'''

def inicializar_db():
    if not get_database_url():
        print('⚠️ Falta DATABASE_URL: la app no puede guardar datos hasta que la configures')
        return False
    try:
        conn = get_db()
        cur = conn.cursor()
        # Candado para que varios workers no creen las tablas a la vez
        cur.execute('SELECT pg_advisory_xact_lock(72711)')
        cur.execute(ESQUEMA_SQL)
        conn.commit()
        cur.close()
        conn.close()
        print('✅ Base de datos lista')
        return True
    except Exception as e:
        print(f'⚠️ No se pudieron preparar las tablas: {e}')
        return False

inicializar_db()

@app.route('/health')
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/')
@app.route('/app')
@limiter.exempt
def app_index():
    response = send_from_directory('.', 'index.html')
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/lista-espera')
@app.route('/landing')
@limiter.exempt
def landing():
    response = send_from_directory('.', 'landing.html')
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/admin')
@limiter.exempt
def admin_panel():
    response = send_from_directory('.', 'admin-lista-espera.html')
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# Solo se entregan archivos de la interfaz. El código del servidor, respaldos,
# notas, configuración y carpetas ocultas NO se pueden descargar.
EXTENSIONES_PUBLICAS = {
    '.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
    '.mp3', '.m4a', '.ogg', '.wav', '.mp4', '.woff', '.woff2', '.ttf', '.webmanifest',
}
JSON_PUBLICOS = {'manifest.json', '.well-known/assetlinks.json'}
CARPETAS_PRIVADAS = {'__pycache__', 'node_modules'}

def es_archivo_publico(path):
    partes = [p for p in path.replace('\\', '/').split('/') if p]
    if not partes:
        return False
    if path in JSON_PUBLICOS:
        return True
    if any(p.startswith('.') for p in partes):
        return False
    # De attached_assets solo son públicas las imágenes de fondo y adornos que usa la app
    if partes[0] == 'attached_assets' and partes[1:2] != ['stock_images']:
        return False
    if partes[0] in CARPETAS_PRIVADAS:
        return False
    return os.path.splitext(partes[-1])[1].lower() in EXTENSIONES_PUBLICAS

@app.route('/<path:path>')
@limiter.exempt
def serve_static(path):
    if not es_archivo_publico(path):
        return "Not Found", 404
    response = send_from_directory('.', path)
    if path.endswith(('.js', '.css', '.html')):
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    return response

# ===== ACCESO CON CÓDIGO POR EMAIL =====
# Antes bastaba escribir un email para entrar a esa cuenta. Ahora se envía un
# código de 6 dígitos a ese email y solo quien lo recibe puede entrar.
CODIGO_MINUTOS = 15
CODIGO_MAX_INTENTOS = 5
CODIGO_ESPERA_REENVIO = 60  # segundos
EMAIL_PATTERN = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def _hash_codigo(email, codigo):
    clave = app.secret_key if isinstance(app.secret_key, bytes) else str(app.secret_key).encode()
    return hmac.new(clave, f'{email}:{codigo}'.encode(), hashlib.sha256).hexdigest()

def _asegurar_tabla_codigos(cur):
    cur.execute("""
        CREATE TABLE IF NOT EXISTS codigos_acceso (
            email VARCHAR(255) PRIMARY KEY,
            codigo_hash VARCHAR(64) NOT NULL,
            expira TIMESTAMP NOT NULL,
            intentos INTEGER NOT NULL DEFAULT 0,
            creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

def enviar_codigo_acceso(email, codigo):
    """Envía el código de acceso de 6 dígitos al email de la usuaria."""
    try:
        if not resend.api_key:
            print("⚠️ RESEND_API_KEY no configurada: no se puede enviar el código de acceso")
            return False
        resend.Emails.send({
            "from": f"Aurora <{EMAIL_REMITENTE}>",
            "reply_to": [ADMIN_EMAIL],
            "to": [email],
            "subject": f"🌸 Tu código para entrar a Aurora: {codigo}",
            "html": f"""
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #fff5f8 0%, #fffaf5 100%); border-radius: 20px; padding: 30px; text-align: center;">
                <h1 style="color: #8b4789; font-size: 28px; margin: 0;">🌸 Aurora</h1>
                <p style="color: #6b3f3f; font-size: 16px; line-height: 1.6;">Este es tu código para entrar:</p>
                <p style="font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #8b4789; background: white; border: 2px solid #f4c542; border-radius: 15px; padding: 15px; margin: 20px 0;">{codigo}</p>
                <p style="color: #8b7d7d; font-size: 14px;">Vence en {CODIGO_MINUTOS} minutos. Si tú no lo pediste, ignora este mensaje.</p>
            </div>
            """
        })
        return True
    except Exception as e:
        print(f"❌ Error enviando código de acceso: {e}")
        return False

def _iniciar_sesion(usuario):
    session.permanent = True
    session['usuario_id'] = usuario['id']
    session['nombre'] = usuario['nombre']
    session['email'] = usuario['email']

@app.route('/api/registro', methods=['POST'])
@limiter.limit("10 per hour")  # Máximo 10 códigos por IP por hora
def registro():
    """Paso 1: recibe nombre + email y envía un código de acceso a ese email."""
    try:
        data = request.get_json(silent=True) or {}
        nombre = str(data.get('nombre', '')).strip()
        email = str(data.get('email', '')).strip().lower()
        
        if not nombre:
            return jsonify({'error': 'El nombre es requerido'}), 400
        
        if not email:
            return jsonify({'error': 'El email es requerido'}), 400
        
        import re
        if not re.match(EMAIL_PATTERN, email):
            return jsonify({'error': 'Email inválido'}), 400
        
        # Si este navegador ya tiene sesión con ese mismo email, no hace falta código
        if session.get('usuario_id') and session.get('email') == email:
            return jsonify({
                'success': True,
                'usuario': {'id': session['usuario_id'], 'nombre': session.get('nombre'), 'email': email}
            }), 200
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        _asegurar_tabla_codigos(cur)
        conn.commit()
        
        # No reenviar si se acaba de enviar uno (evita llenar el buzón)
        cur.execute(
            'SELECT 1 FROM codigos_acceso WHERE email = %s AND creado > NOW() - make_interval(secs => %s)',
            (email, CODIGO_ESPERA_REENVIO)
        )
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'requiere_codigo': True, 'email': email}), 200
        
        codigo = f'{secrets.randbelow(1000000):06d}'
        
        if not enviar_codigo_acceso(email, codigo):
            cur.close()
            conn.close()
            return jsonify({'error': 'No pudimos enviarte el código por email. Intenta de nuevo en unos minutos.'}), 503
        
        cur.execute("""
            INSERT INTO codigos_acceso (email, codigo_hash, expira, intentos, creado)
            VALUES (%s, %s, NOW() + make_interval(mins => %s), 0, NOW())
            ON CONFLICT (email) DO UPDATE
            SET codigo_hash = EXCLUDED.codigo_hash,
                expira = EXCLUDED.expira,
                intentos = 0,
                creado = EXCLUDED.creado
        """, (email, _hash_codigo(email, codigo), CODIGO_MINUTOS))
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'requiere_codigo': True, 'email': email}), 200
        
    except Exception as e:
        print(f'Error registro: {e}')
        return jsonify({'error': 'Error al registrar'}), 500

@app.route('/api/verificar-codigo', methods=['POST'])
@limiter.limit("30 per hour")
def verificar_codigo():
    """Paso 2: comprueba el código y abre la sesión (crea la cuenta si es nueva)."""
    try:
        data = request.get_json(silent=True) or {}
        nombre = str(data.get('nombre', '')).strip()
        email = str(data.get('email', '')).strip().lower()
        codigo = ''.join(ch for ch in str(data.get('codigo', '')) if ch.isdigit())
        
        if not email or len(codigo) != 6:
            return jsonify({'error': 'Escribe el código de 6 dígitos que te enviamos'}), 400
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        _asegurar_tabla_codigos(cur)
        conn.commit()
        
        cur.execute('SELECT codigo_hash, intentos, (expira < NOW()) AS vencido FROM codigos_acceso WHERE email = %s', (email,))
        fila = cur.fetchone()
        
        if not fila or fila['vencido'] or fila['intentos'] >= CODIGO_MAX_INTENTOS:
            cur.execute('DELETE FROM codigos_acceso WHERE email = %s', (email,))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({'error': 'El código venció. Pide uno nuevo.', 'codigo_vencido': True}), 400
        
        if not hmac.compare_digest(fila['codigo_hash'], _hash_codigo(email, codigo)):
            cur.execute('UPDATE codigos_acceso SET intentos = intentos + 1 WHERE email = %s', (email,))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({'error': 'Código incorrecto. Revísalo e intenta de nuevo.'}), 400
        
        cur.execute('DELETE FROM codigos_acceso WHERE email = %s', (email,))
        
        # Buscar usuario por email (más confiable que por nombre)
        cur.execute(
            'SELECT id, nombre, email FROM usuarios WHERE LOWER(email) = LOWER(%s) ORDER BY id DESC LIMIT 1',
            (email,)
        )
        usuario = cur.fetchone()
        estado = 200
        
        if not usuario:
            if not nombre:
                nombre = email.split('@')[0]
            cur.execute(
                'INSERT INTO usuarios (nombre, email) VALUES (%s, %s) RETURNING id, nombre, email',
                (nombre, email)
            )
            usuario = cur.fetchone()
            estado = 201
        
        conn.commit()
        cur.close()
        conn.close()
        
        _iniciar_sesion(usuario)
        
        return jsonify({
            'success': True,
            'usuario': {
                'id': usuario['id'],
                'nombre': usuario['nombre'],
                'email': usuario['email']
            }
        }), estado
        
    except Exception as e:
        print(f'Error verificar código: {e}')
        return jsonify({'error': 'Error al verificar el código'}), 500

@app.route('/api/sesion', methods=['GET'])
def obtener_sesion():
    if 'usuario_id' in session:
        return jsonify({
            'logueado': True,
            'usuario': {
                'id': session['usuario_id'],
                'nombre': session['nombre'],
                'email': session.get('email')
            }
        }), 200
    return jsonify({'logueado': False}), 200

@app.route('/api/sesion', methods=['DELETE'])
def cerrar_sesion():
    session.clear()
    return jsonify({'success': True}), 200

@app.route('/api/datos', methods=['DELETE'])
def eliminar_todos_datos():
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401
        
        usuario_id = session['usuario_id']
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Obtener el email del usuario para metas (sistema antiguo)
        cur.execute('SELECT email FROM usuarios WHERE id = %s', (usuario_id,))
        usuario = cur.fetchone()
        usuario_email = usuario['email'] if usuario and usuario['email'] else f'user_{usuario_id}'
        
        # Eliminar todos los datos del usuario
        cur.execute('DELETE FROM diario_paginas WHERE usuario_id = %s', (usuario_id,))
        cur.execute('DELETE FROM habitos_calendario WHERE usuario_id = %s', (usuario_id,))
        cur.execute('DELETE FROM push_subscriptions WHERE usuario_id = %s', (usuario_id,))
        cur.execute('DELETE FROM metas WHERE usuario_email = %s', (usuario_email,))
        cur.execute('DELETE FROM vision_board WHERE usuario_id = %s', (usuario_id,))
        cur.execute('DELETE FROM collage_elementos WHERE usuario_id = %s', (usuario_id,))
        cur.execute('DELETE FROM afirmaciones_personales WHERE usuario_id = %s', (usuario_id,))
        cur.execute('DELETE FROM cartas_reveladas WHERE usuario_id = %s', (usuario_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f'Error eliminar datos: {e}')
        return jsonify({'error': str(e)}), 500

# ===== DIARIO EN LA NUBE =====
# Cada página del diario se guarda tal como la arma la app (texto, ánimo, gratitudes...).
# Al borrar una página se vacía su contenido y queda marcada, para que también
# desaparezca de los otros dispositivos de la usuaria.
DIARIO_MAX_PAGINA = 600 * 1024   # tamaño máximo de una página (bytes, con hasta 2 fotos)
DIARIO_MAX_PAGINAS = 5000        # páginas por usuaria

def _id_pagina_valido(pid):
    return isinstance(pid, str) and 1 <= len(pid) <= 40 and re.fullmatch(r'[A-Za-z0-9_-]+', pid) is not None

@app.route('/api/diario/paginas', methods=['GET'])
def diario_listar():
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT pagina_id, datos, borrada
            FROM diario_paginas
            WHERE usuario_id = %s
            ORDER BY actualizado DESC
        """, (session['usuario_id'],))
        filas = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify({
            'usuario_id': session['usuario_id'],
            'paginas': [f['datos'] for f in filas if not f['borrada'] and f['datos']],
            'borradas': [f['pagina_id'] for f in filas if f['borrada']]
        }), 200
    except Exception as e:
        print(f'Error listar diario: {e}')
        return jsonify({'error': 'Error en el servidor'}), 500

@app.route('/api/diario/paginas', methods=['PUT'])
def diario_guardar():
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401
        pagina = request.get_json(silent=True)
        if not isinstance(pagina, dict):
            return jsonify({'error': 'Página inválida'}), 400
        pid = str(pagina.get('id', ''))
        if not _id_pagina_valido(pid) or not isinstance(pagina.get('texto'), str):
            return jsonify({'error': 'Página inválida'}), 400
        pagina['id'] = pid
        if len(json.dumps(pagina)) > DIARIO_MAX_PAGINA:
            return jsonify({'error': 'La página es demasiado grande'}), 413
        
        conn = get_db()
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*) FROM diario_paginas WHERE usuario_id = %s', (session['usuario_id'],))
        if cur.fetchone()[0] >= DIARIO_MAX_PAGINAS:
            cur.close()
            conn.close()
            return jsonify({'error': 'Llegaste al máximo de páginas'}), 400
        # Una página ya borrada no se vuelve a crear (evita que "reviva" desde otro dispositivo)
        cur.execute("""
            INSERT INTO diario_paginas (usuario_id, pagina_id, datos, borrada, actualizado)
            VALUES (%s, %s, %s, FALSE, NOW())
            ON CONFLICT (usuario_id, pagina_id) DO UPDATE
            SET datos = EXCLUDED.datos, actualizado = NOW()
            WHERE diario_paginas.borrada = FALSE
        """, (session['usuario_id'], pid, Json(pagina)))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        print(f'Error guardar diario: {e}')
        return jsonify({'error': 'Error en el servidor'}), 500

@app.route('/api/diario/paginas/<pagina_id>', methods=['DELETE'])
def diario_borrar(pagina_id):
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401
        if not _id_pagina_valido(pagina_id):
            return jsonify({'error': 'Página inválida'}), 400
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO diario_paginas (usuario_id, pagina_id, datos, borrada, actualizado)
            VALUES (%s, %s, NULL, TRUE, NOW())
            ON CONFLICT (usuario_id, pagina_id) DO UPDATE
            SET datos = NULL, borrada = TRUE, actualizado = NOW()
        """, (session['usuario_id'], pagina_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        print(f'Error borrar diario: {e}')
        return jsonify({'error': 'Error en el servidor'}), 500

@app.route('/api/metas', methods=['POST'])
def crear_meta():
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401
        
        # Obtener email usando la función helper
        usuario_email = get_user_email_from_session()
        if not usuario_email:
            return jsonify({'error': 'No autenticado'}), 401
        
        data = request.get_json()
        titulo = (data.get('titulo') or '').strip()
        descripcion = data.get('descripcion') or ''
        categoria = data.get('categoria')
        fecha_limite = data.get('fecha_limite') or None
        
        if not titulo:
            return jsonify({'error': 'Escribe un título para tu meta'}), 400
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            INSERT INTO metas (usuario_email, titulo, descripcion, categoria, fecha_limite)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, titulo, descripcion, categoria, fecha_limite, completada
        ''', (usuario_email, titulo, descripcion, categoria, fecha_limite))
        
        meta = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify(meta), 201
        
    except Exception as e:
        print(f'Error crear meta: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/metas', methods=['GET'])
def obtener_metas():
    try:
        if 'usuario_id' not in session:
            return jsonify([]), 200
        
        # Obtener email usando la función helper
        usuario_email = get_user_email_from_session()
        if not usuario_email:
            return jsonify([]), 200
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT id, titulo, descripcion, categoria, fecha_limite, completada, fecha_creacion
            FROM metas
            WHERE usuario_email = %s
            ORDER BY completada ASC, fecha_limite ASC
        ''', (usuario_email,))
        
        metas = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify(metas), 200
        
    except Exception as e:
        print(f'Error obtener metas: {e}')
        return jsonify([]), 200

@app.route('/api/metas/<int:meta_id>', methods=['PUT'])
def actualizar_meta(meta_id):
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401
        
        # Obtener email usando la función helper
        usuario_email = get_user_email_from_session()
        if not usuario_email:
            return jsonify({'error': 'No autenticado'}), 401
        
        data = request.get_json()
        completada = data.get('completada')
        
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute('''
            UPDATE metas
            SET completada = %s
            WHERE id = %s AND usuario_email = %s
        ''', (completada, meta_id, usuario_email))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f'Error actualizar meta: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/vision-board', methods=['POST'])
def guardar_vision_board():
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401

        no_premium = respuesta_si_no_es_premium()
        if no_premium:
            return no_premium
            
        data = request.get_json()
        html_content = data.get('html_content', '')
        
        conn = get_db()
        cur = conn.cursor()
        
        # Guardar vision board con usuario_id de la sesión
        cur.execute('''
            INSERT INTO vision_board (usuario_id, html_content, updated_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT ON CONSTRAINT unique_usuario_vision DO UPDATE
            SET html_content = EXCLUDED.html_content,
                updated_at = NOW()
        ''', (session['usuario_id'], html_content))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f'Error guardar vision board: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/vision-board', methods=['GET'])
def obtener_vision_board():
    try:
        usuario_id = session.get('usuario_id', 1)  # Usuario por defecto
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT html_content, updated_at
            FROM vision_board
            WHERE usuario_id = %s
        ''', (usuario_id,))
        
        vision_board = cur.fetchone()
        cur.close()
        conn.close()
        
        return jsonify(vision_board), 200
        
    except Exception as e:
        print(f'Error obtener vision board: {e}')
        return jsonify(None), 200

@app.route('/api/collage', methods=['POST'])
def guardar_collage():
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401

        no_premium = respuesta_si_no_es_premium()
        if no_premium:
            return no_premium
            
        data = request.get_json()
        html_content = data.get('html_content', '')
        
        conn = get_db()
        cur = conn.cursor()
        
        # Guardar collage con usuario_id de la sesión
        cur.execute('''
            INSERT INTO collage_elementos (usuario_id, html_content, updated_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT ON CONSTRAINT unique_usuario_collage DO UPDATE
            SET html_content = EXCLUDED.html_content,
                updated_at = NOW()
        ''', (session['usuario_id'], html_content))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f'Error guardar collage: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/collage', methods=['GET'])
def obtener_collage():
    try:
        usuario_id = session.get('usuario_id', 1)  # Usuario por defecto
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT html_content, updated_at
            FROM collage_elementos
            WHERE usuario_id = %s
        ''', (usuario_id,))
        
        collage = cur.fetchone()
        cur.close()
        conn.close()
        
        return jsonify(collage), 200
        
    except Exception as e:
        print(f'Error obtener collage: {e}')
        return jsonify(None), 200

@app.route('/api/afirmaciones', methods=['POST'])
def guardar_afirmacion():
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401
        
        data = request.get_json()
        texto = data.get('texto')
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            INSERT INTO afirmaciones_personales (usuario_id, texto)
            VALUES (%s, %s)
            RETURNING id, texto, created_at
        ''', (session['usuario_id'], texto))
        
        afirmacion = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify(afirmacion), 201
        
    except Exception as e:
        print(f'Error guardar afirmación: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/afirmaciones', methods=['GET'])
def obtener_afirmaciones():
    try:
        if 'usuario_id' not in session:
            return jsonify([]), 200
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT id, texto, created_at
            FROM afirmaciones_personales
            WHERE usuario_id = %s
            ORDER BY created_at DESC
        ''', (session['usuario_id'],))
        
        afirmaciones = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify(afirmaciones), 200
        
    except Exception as e:
        print(f'Error obtener afirmaciones: {e}')
        return jsonify([]), 200

@app.route('/api/cartas/revelar', methods=['POST'])
def revelar_carta():
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401
        
        data = request.get_json()
        carta_numero = data.get('carta_numero')
        
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO cartas_reveladas (usuario_id, carta_numero)
            VALUES (%s, %s)
            ON CONFLICT (usuario_id, carta_numero) DO NOTHING
        ''', (session['usuario_id'], carta_numero))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f'Error revelar carta: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/cartas/reveladas', methods=['GET'])
def obtener_cartas_reveladas():
    try:
        if 'usuario_id' not in session:
            return jsonify([]), 200
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT carta_numero, fecha_revelada
            FROM cartas_reveladas
            WHERE usuario_id = %s
            ORDER BY fecha_revelada DESC
        ''', (session['usuario_id'],))
        
        cartas = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify(cartas), 200
        
    except Exception as e:
        print(f'Error obtener cartas reveladas: {e}')
        return jsonify([]), 200

# ===== PREMIUM: se comprueba en el servidor, no solo en la pantalla =====
def _emails_premium_gratis():
    """Emails con Premium sin pagar (la dueña, pruebas). Variable PREMIUM_EMAILS, separados por coma."""
    return {e.strip().lower() for e in os.environ.get('PREMIUM_EMAILS', '').split(',') if e.strip()}

def usuario_es_premium(usuario_id, email=None):
    if email and email.strip().lower() in _emails_premium_gratis():
        return True
    if not usuario_id:
        return False
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM premium_usuarios WHERE usuario_id = %s AND estado = 'activo'", (usuario_id,))
        fila = cur.fetchone()
        cur.close()
        conn.close()
        return fila is not None
    except Exception as e:
        print(f'Error comprobando premium: {e}')
        return False

def respuesta_si_no_es_premium():
    """Devuelve la respuesta 403 si la usuaria de esta sesión no es Premium; None si lo es."""
    if usuario_es_premium(session.get('usuario_id'), get_user_email_from_session()):
        return None
    return jsonify({'error': 'Esta función es parte de Aurora Premium', 'premium_requerido': True}), 403

@app.route('/api/premium/status', methods=['GET'])
def verificar_premium():
    try:
        usuario_id = None
        email_param = request.args.get('email', '').strip().lower()
        
        if 'usuario_id' in session:
            usuario_id = session['usuario_id']
            print(f'🔍 Premium check por sesión, usuario_id: {usuario_id}')
        elif email_param:
            conn = get_db()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute('SELECT id FROM usuarios WHERE LOWER(email) = %s', (email_param,))
            user = cur.fetchone()
            cur.close()
            conn.close()
            if user:
                usuario_id = user['id']
                print(f'🔍 Premium check por email {email_param}, usuario_id: {usuario_id}')
        
        if not usuario_id:
            print(f'⚠️ Premium check: No hay usuario identificado')
            return jsonify({'premium': bool(email_param and email_param in _emails_premium_gratis())}), 200
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT estado, plan, fecha_inicio, fecha_fin 
            FROM premium_usuarios 
            WHERE usuario_id = %s AND estado = 'activo'
        ''', (usuario_id,))
        
        premium = cur.fetchone()
        cur.close()
        conn.close()
        
        email_actual = get_user_email_from_session() or email_param
        es_premium = premium is not None or bool(email_actual and email_actual in _emails_premium_gratis())
        print(f'✅ Usuario {usuario_id} es Premium: {es_premium}')
        
        return jsonify({
            'premium': es_premium,
            'detalles': premium if premium else None
        }), 200
        
    except Exception as e:
        print(f'Error verificar premium: {e}')
        return jsonify({'premium': False}), 200

# Planes de Aurora Premium. Los precios los fija el servidor (en centavos de dólar).
PLANES_PREMIUM = {
    'mensual': {'monto': 699, 'intervalo': 'month', 'descripcion': 'Suscripción mensual a Aurora Premium - Tu Guía de Empoderamiento'},
    'anual': {'monto': 6999, 'intervalo': 'year', 'descripcion': 'Suscripción anual a Aurora Premium - Tu Guía de Empoderamiento'},
}
DIAS_PRUEBA_GRATIS = 7   # solo la primera vez que alguien se suscribe

@app.route('/api/premium/checkout', methods=['POST'])
def crear_checkout():
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401
        
        if not stripe.api_key:
            return jsonify({'error': 'Stripe no configurado'}), 500
        
        datos = request.get_json(silent=True) or {}
        plan = datos.get('plan') or 'mensual'
        if plan not in PLANES_PREMIUM:
            return jsonify({'error': 'Plan no válido'}), 400
        info = PLANES_PREMIUM[plan]
        
        # A donde vuelve la usuaria despues de pagar
        base_url = APP_URL or request.host_url.rstrip('/')
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('SELECT stripe_customer_id, stripe_subscription_id, estado FROM premium_usuarios WHERE usuario_id = %s', 
                   (session['usuario_id'],))
        existing = cur.fetchone()
        cur.close()
        conn.close()
        
        if existing and existing['estado'] == 'activo':
            return jsonify({'error': 'Ya tienes Aurora Premium activo'}), 400
        
        customer_id = existing['stripe_customer_id'] if existing else None
        # La prueba gratis es solo para quien nunca ha tenido una suscripción
        con_prueba = not (existing and existing['stripe_subscription_id'])
        
        if not customer_id:
            customer = stripe.Customer.create(
                metadata={'usuario_id': session['usuario_id']}
            )
            customer_id = customer.id
        
        extra = {}
        if con_prueba:
            extra['subscription_data'] = {'trial_period_days': DIAS_PRUEBA_GRATIS}
        
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'Aurora Premium',
                        'description': info['descripcion']
                    },
                    'unit_amount': info['monto'],
                    'recurring': {
                        'interval': info['intervalo']
                    }
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f'{base_url}?premium=success',
            cancel_url=f'{base_url}?premium=cancelled',
            metadata={'usuario_id': session['usuario_id'], 'plan': plan},
            **extra
        )
        
        return jsonify({'url': checkout_session.url, 'plan': plan, 'prueba_gratis': con_prueba}), 200
        
    except Exception as e:
        print(f'Error checkout: {e}')
        return jsonify({'error': 'No se pudo iniciar el pago'}), 500

@app.route('/api/premium/webhook', methods=['POST'])
def stripe_webhook():
    try:
        payload = request.get_data()
        sig_header = request.headers.get('Stripe-Signature')
        
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.environ.get('STRIPE_WEBHOOK_SECRET', '')
        )
        
        conn = get_db()
        cur = conn.cursor()
        
        if event['type'] == 'checkout.session.completed':
            session_data = event['data']['object']
            metadata = session_data.get('metadata', {})
            
            # Pago de Premium
            if 'usuario_id' in metadata:
                usuario_id = metadata['usuario_id']
                customer_id = session_data.get('customer')
                subscription_id = session_data.get('subscription')
                print(f'💎 Pago Premium recibido - usuario_id: {usuario_id}')
                
                plan = metadata.get('plan') if metadata.get('plan') in PLANES_PREMIUM else 'mensual'
                cur.execute('''
                    INSERT INTO premium_usuarios (usuario_id, stripe_customer_id, stripe_subscription_id, estado, plan)
                    VALUES (%s, %s, %s, 'activo', %s)
                    ON CONFLICT (usuario_id) 
                    DO UPDATE SET 
                        stripe_customer_id = EXCLUDED.stripe_customer_id,
                        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                        estado = 'activo',
                        plan = EXCLUDED.plan,
                        fecha_inicio = CURRENT_TIMESTAMP,
                        fecha_fin = NULL
                ''', (usuario_id, customer_id, subscription_id, plan))
                print(f'✅ Usuario {usuario_id} activado como Premium')
            
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            cur.execute('''
                UPDATE premium_usuarios 
                SET estado = 'cancelado', fecha_fin = CURRENT_TIMESTAMP
                WHERE stripe_subscription_id = %s
            ''', (subscription['id'],))
        
        elif event['type'] == 'customer.subscription.updated':
            # Stripe avisa cuando la prueba termina, el cobro falla o la suscripción se reactiva
            subscription = event['data']['object']
            estado_stripe = subscription.get('status')
            if estado_stripe in ('active', 'trialing'):
                cur.execute('''
                    UPDATE premium_usuarios SET estado = 'activo', fecha_fin = NULL
                    WHERE stripe_subscription_id = %s
                ''', (subscription['id'],))
            elif estado_stripe in ('unpaid', 'canceled', 'incomplete_expired'):
                cur.execute('''
                    UPDATE premium_usuarios SET estado = 'cancelado', fecha_fin = CURRENT_TIMESTAMP
                    WHERE stripe_subscription_id = %s
                ''', (subscription['id'],))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f'Error webhook: {e}')
        return jsonify({'error': str(e)}), 400

@app.route('/api/premium/cancel', methods=['POST'])
def cancelar_premium():
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT stripe_subscription_id 
            FROM premium_usuarios 
            WHERE usuario_id = %s AND estado = 'activo'
        ''', (session['usuario_id'],))
        
        premium = cur.fetchone()
        
        if premium and premium['stripe_subscription_id']:
            stripe.Subscription.delete(premium['stripe_subscription_id'])
            
            cur.execute('''
                UPDATE premium_usuarios 
                SET estado = 'cancelado', fecha_fin = CURRENT_TIMESTAMP
                WHERE usuario_id = %s
            ''', (session['usuario_id'],))
            
            conn.commit()
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f'Error cancelar: {e}')
        return jsonify({'error': str(e)}), 500

# ===== AI COACH PREMIUM =====
RESPUESTAS_COACH = {
    'autoestima': [
        "La autoestima se construye día a día con pequeñas acciones de amor propio. Empieza por reconocer 3 cosas que te gustan de ti cada mañana. No tienen que ser logros grandes - puede ser tu sonrisa, tu perseverancia, o cómo cuidas a los demás. 💜",
        "Recuerda: tu valor no depende de lo que otros piensen. Eres valiosa por el simple hecho de existir. Practica hablarte como le hablarías a tu mejor amiga - con compasión y cariño.",
        "Un ejercicio poderoso: escribe una carta de amor a ti misma. Menciona todo lo que admiras de ti, tus fortalezas, y las dificultades que has superado. Léela cuando necesites recordar quién eres realmente. ✨"
    ],
    'mindfulness': [
        "Aquí tienes un ejercicio de 5 minutos: Siéntate cómoda, cierra los ojos y respira profundo 3 veces. Inhala contando hasta 4, sostén 4 segundos, exhala contando hasta 6. Imagina que con cada exhalación sueltas preocupaciones. 🧘‍♀️",
        "El mindfulness es estar presente. Ahora mismo, nota 5 cosas que puedes ver, 4 que puedes tocar, 3 que puedes oír, 2 que puedes oler, y 1 que puedes saborear. Esta técnica de anclaje te trae al momento presente.",
        "Prueba la meditación del 'escaneo corporal': Acuéstate y mentalmente recorre tu cuerpo desde los pies hasta la cabeza, notando sensaciones sin juzgar. Esto te ayuda a reconectar contigo misma. 💫"
    ],
    'motivacion': [
        "¡Hoy es un nuevo día lleno de posibilidades! Recuerda: no necesitas sentirte motivada para actuar - a veces la motivación viene DESPUÉS de dar el primer paso. ¿Cuál es UNA pequeña acción que puedes hacer ahora mismo? 🌟",
        "Has superado el 100% de tus días difíciles hasta ahora. Eso habla de tu fuerza interior. La mujer que serás mañana está orgullosa de que hoy sigas intentándolo.",
        "La motivación es como una llama: necesita combustible constante. Rodéate de personas que te inspiren, consume contenido que te eleve, y celebra cada pequeño logro. ¡Tú puedes con esto! ✨"
    ],
    'miedos': [
        "El miedo es normal - significa que estás a punto de hacer algo que importa. La valentía no es ausencia de miedo, es actuar A PESAR del miedo. ¿Qué harías si supieras que no puedes fallar? 💪",
        "Técnica para superar el miedo: Pregúntate '¿Cuál es lo peor que puede pasar?' y luego '¿Podría sobrevivir a eso?'. Casi siempre la respuesta es sí. Los miedos pierden poder cuando los enfrentamos con lógica.",
        "Recuerda: el fracaso no es lo opuesto al éxito, es parte del camino hacia él. Cada 'no', cada tropiezo, te acerca más a donde quieres estar. El único fracaso real es no intentarlo. 🦋"
    ],
    'amor_propio': [
        "El amor propio es tratarte como tratarías a alguien que amas profundamente. Hoy, ¿cómo puedes mostrarte más compasión? Puede ser descansar sin culpa, decir 'no' a lo que no te sirve, o simplemente respirar con calma. 💖",
        "Practica poner límites saludables. Decir 'no' a los demás es decirte 'sí' a ti misma. No necesitas explicaciones largas ni disculpas. Un simple 'eso no funciona para mí' es suficiente.",
        "Ejercicio de amor propio: Mírate al espejo y di en voz alta 3 afirmaciones positivas. Al principio puede sentirse raro, pero con el tiempo, tu cerebro empezará a creerlo. Eres digna de amor, empezando por el tuyo. ✨"
    ],
    'general': [
        "Gracias por compartir eso conmigo. Recuerda que cada día es una oportunidad para crecer y brillar. ¿Hay algo específico en lo que pueda ayudarte hoy? 💜",
        "Te escucho. A veces solo necesitamos un espacio seguro para expresarnos. Estoy aquí para ti. ¿Quieres que exploremos juntas algunas herramientas de bienestar? ✨",
        "Lo que sientes es válido. No tienes que tener todas las respuestas ahora. Ve paso a paso, respira, y recuerda: eres más fuerte de lo que crees. ¿En qué área te gustaría enfocarte? 🌸"
    ]
}

import random

def detectar_tema(mensaje):
    mensaje_lower = mensaje.lower()
    
    if any(word in mensaje_lower for word in ['autoestima', 'valor', 'suficiente', 'insegura', 'comparar']):
        return 'autoestima'
    elif any(word in mensaje_lower for word in ['mindfulness', 'meditar', 'respirar', 'calmar', 'ansiedad', 'estrés', 'presente']):
        return 'mindfulness'
    elif any(word in mensaje_lower for word in ['motivación', 'motivar', 'energía', 'ganas', 'ánimo', 'inspirar']):
        return 'motivacion'
    elif any(word in mensaje_lower for word in ['miedo', 'fracaso', 'fallar', 'temor', 'pánico', 'superar']):
        return 'miedos'
    elif any(word in mensaje_lower for word in ['amor', 'propio', 'querer', 'cuidar', 'límite']):
        return 'amor_propio'
    else:
        return 'general'

@app.route('/api/ai-coach', methods=['POST'])
def ai_coach():
    try:
        if 'usuario_id' not in session:
            return jsonify({'error': 'No autenticado'}), 401
        
        premium = usuario_es_premium(session['usuario_id'], get_user_email_from_session())
        
        if not premium:
            return jsonify({
                'respuesta': 'Los mensajes de apoyo de Aurora son una función Premium. 💜'
            }), 200
        
        data = request.get_json()
        mensaje = data.get('mensaje', '')
        
        if not mensaje:
            return jsonify({'respuesta': '¿En qué puedo ayudarte hoy? 💜'}), 200
        
        tema = detectar_tema(mensaje)
        respuestas = RESPUESTAS_COACH.get(tema, RESPUESTAS_COACH['general'])
        respuesta = random.choice(respuestas)
        
        return jsonify({'respuesta': respuesta}), 200
        
    except Exception as e:
        print(f'Error AI Coach: {e}')
        return jsonify({
            'respuesta': 'Disculpa, tuve un pequeño problema. ¿Puedes intentar de nuevo? 💜'
        }), 200

# ===== LISTA DE ESPERA =====
@app.route('/api/lista-espera', methods=['POST'])
@limiter.limit("3 per hour")  # Máximo 3 registros en lista de espera por IP por hora
def registrar_lista_espera():
    try:
        data = request.get_json()
        nombre = data.get('nombre', '').strip()
        email = data.get('email', '').strip().lower()
        telefono = data.get('telefono', '').strip()
        
        if not nombre or not email or not telefono:
            return jsonify({'error': 'Nombre, email y teléfono son requeridos'}), 400
        
        # Validación básica de email
        if '@' not in email or '.' not in email:
            return jsonify({'error': 'Email inválido'}), 400
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Verificar si el email ya existe
        cur.execute('SELECT id FROM lista_espera WHERE email = %s', (email,))
        if cur.fetchone():
            conn.close()
            return jsonify({'error': 'EMAIL_YA_REGISTRADO'}), 400
        
        # Insertar nuevo registro
        cur.execute('''
            INSERT INTO lista_espera (nombre, email, telefono)
            VALUES (%s, %s, %s)
            RETURNING id, nombre, email, telefono, fecha_registro
        ''', (nombre, email, telefono if telefono else None))
        
        nuevo_registro = cur.fetchone()
        conn.commit()
        conn.close()
        
        # Enviar email de bienvenida con Journal a la usuaria
        enviar_email_bienvenida_journal(nombre, email)
        
        # Enviar email de notificación al admin
        enviar_notificacion_lista_espera(nombre, email, telefono)
        
        return jsonify({
            'success': True,
            'mensaje': 'Registro exitoso',
            'registro': dict(nuevo_registro)
        }), 201
        
    except Exception as e:
        print(f"Error al registrar lista espera: {e}")
        return jsonify({'error': 'Error en el servidor'}), 500

@app.route('/api/lista-espera', methods=['GET'])
def obtener_lista_espera():
    try:
        # Solo con sesión de admin (login con ADMIN_PASSWORD)
        if not es_admin():
            return jsonify({'error': 'No autorizado'}), 401
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT id, nombre, email, telefono, fecha_registro
            FROM lista_espera
            ORDER BY fecha_registro DESC
        ''')
        
        registros = cur.fetchall()
        conn.close()
        
        return jsonify({
            'total': len(registros),
            'registros': [dict(r) for r in registros]
        }), 200
        
    except Exception as e:
        print(f"Error al obtener lista espera: {e}")
        return jsonify({'error': 'Error en el servidor'}), 500

@app.route('/admin/lista-espera')
def admin_lista_espera():
    response = send_from_directory('.', 'admin-lista-espera.html')
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response

@app.route('/admin')
def admin_portal():
    response = send_from_directory('.', 'admin.html')
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response

# ============ CALENDARIO DE HÁBITOS ============
@app.route('/api/habitos-calendario', methods=['GET'])
def obtener_habitos_calendario():
    try:
        usuario_id = session.get('usuario_id')
        if not usuario_id:
            return jsonify({'error': 'No autenticado'}), 401
        
        # Obtener mes y año (opcional, default = mes actual)
        mes = request.args.get('mes', datetime.now().month)
        anio = request.args.get('anio', datetime.now().year)
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Obtener todos los hábitos del mes
        cur.execute('''
            SELECT fecha, habitos_completados, horarios_habitos
            FROM habitos_calendario
            WHERE usuario_id = %s 
            AND EXTRACT(MONTH FROM fecha) = %s
            AND EXTRACT(YEAR FROM fecha) = %s
            ORDER BY fecha
        ''', (usuario_id, mes, anio))
        
        habitos_mes = cur.fetchall()
        conn.close()
        
        return jsonify({
            'habitos': [dict(h) for h in habitos_mes]
        }), 200
        
    except Exception as e:
        print(f"Error obtener hábitos calendario: {e}")
        return jsonify({'error': 'Error en el servidor'}), 500

@app.route('/api/habitos-calendario', methods=['POST'])
def guardar_habitos_calendario():
    try:
        usuario_id = session.get('usuario_id')
        if not usuario_id:
            return jsonify({'error': 'No autenticado'}), 401

        no_premium = respuesta_si_no_es_premium()
        if no_premium:
            return no_premium
        
        data = request.get_json()
        fecha = data.get('fecha')
        habitos_completados = data.get('habitos_completados', [])
        horarios_habitos = data.get('horarios_habitos')
        
        if not fecha:
            return jsonify({'error': 'Fecha requerida'}), 400
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Insertar o actualizar hábitos del día
        if horarios_habitos is not None:
            cur.execute('''
                INSERT INTO habitos_calendario (usuario_id, fecha, habitos_completados, horarios_habitos)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (usuario_id, fecha)
                DO UPDATE SET 
                    habitos_completados = EXCLUDED.habitos_completados,
                    horarios_habitos = EXCLUDED.horarios_habitos
                RETURNING id, fecha, habitos_completados, horarios_habitos
            ''', (usuario_id, fecha, json.dumps(habitos_completados), json.dumps(horarios_habitos)))
        else:
            cur.execute('''
                INSERT INTO habitos_calendario (usuario_id, fecha, habitos_completados)
                VALUES (%s, %s, %s)
                ON CONFLICT (usuario_id, fecha)
                DO UPDATE SET habitos_completados = EXCLUDED.habitos_completados
                RETURNING id, fecha, habitos_completados, horarios_habitos
            ''', (usuario_id, fecha, json.dumps(habitos_completados)))
        
        resultado = cur.fetchone()
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'habito': dict(resultado)
        }), 200
        
    except Exception as e:
        print(f"Error guardar hábitos calendario: {e}")
        return jsonify({'error': 'Error en el servidor'}), 500

# ===== NOTIFICACIONES PUSH =====
@app.route('/api/vapid-public-key')
def get_vapid_public_key():
    """Devuelve la clave pública VAPID para suscribirse a push"""
    return jsonify({
        'publicKey': os.environ.get('VAPID_PUBLIC_KEY', '')
    })

@app.route('/api/push/subscribe', methods=['POST'])
def subscribe_push():
    """Guarda la suscripción push de un usuario"""
    try:
        data = request.get_json()
        subscription = data.get('subscription', {})
        
        usuario_id = session.get('usuario_id')
        if not usuario_id:
            return jsonify({'error': 'No hay sesión activa'}), 401
        
        endpoint = subscription.get('endpoint')
        keys = subscription.get('keys', {})
        p256dh = keys.get('p256dh')
        auth = keys.get('auth')
        
        if not endpoint or not p256dh or not auth:
            return jsonify({'error': 'Datos de suscripción incompletos'}), 400
        
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO push_subscriptions (usuario_id, endpoint, p256dh, auth)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (usuario_id, endpoint) DO UPDATE SET p256dh = %s, auth = %s
        ''', (usuario_id, endpoint, p256dh, auth, p256dh, auth))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'mensaje': 'Suscripción guardada'})
        
    except Exception as e:
        print(f"Error guardar suscripción push: {e}")
        return jsonify({'error': 'Error en el servidor'}), 500

@app.route('/api/push/test', methods=['POST'])
def test_push_notification():
    """Envía una notificación de prueba"""
    try:
        from pywebpush import webpush, WebPushException
        
        usuario_id = session.get('usuario_id')
        if not usuario_id:
            return jsonify({'error': 'No hay sesión activa'}), 401
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('SELECT * FROM push_subscriptions WHERE usuario_id = %s', (usuario_id,))
        subs = cur.fetchall()
        conn.close()
        
        if not subs:
            return jsonify({'error': 'No hay suscripciones push activas'}), 400
        
        vapid_private = os.environ.get('VAPID_PRIVATE_KEY')
        vapid_email = os.environ.get('VAPID_EMAIL', 'mailto:auroraempowerment26@gmail.com')
        
        mensaje = json.dumps({
            'title': '🌸 Aurora',
            'body': '¡Las notificaciones funcionan! Te recordaremos tus hábitos.',
            'icon': '/icon-512.png',
            'url': '/app#habitos-calendario'
        })
        
        enviados = 0
        for sub in subs:
            try:
                webpush(
                    subscription_info={
                        'endpoint': sub['endpoint'],
                        'keys': {
                            'p256dh': sub['p256dh'],
                            'auth': sub['auth']
                        }
                    },
                    data=mensaje,
                    vapid_private_key=vapid_private,
                    vapid_claims={'sub': vapid_email}
                )
                enviados += 1
            except WebPushException as e:
                print(f"Error enviar push: {e}")
        
        return jsonify({'success': True, 'enviados': enviados})
        
    except Exception as e:
        print(f"Error test push: {e}")
        return jsonify({'error': str(e)}), 500

@app.after_request
def add_no_cache_headers(response):
    """Agrega headers anti-caché a todos los archivos HTML para forzar actualizaciones"""
    if response.content_type and 'html' in response.content_type:
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    return response

@app.route('/api/admin/sesion', methods=['GET'])
def admin_sesion():
    return jsonify({'admin': es_admin()})

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin_verified', None)
    session.pop('admin_time', None)
    return jsonify({'success': True})

@app.route('/api/admin/login', methods=['POST'])
@limiter.limit("10 per hour")  # Frena los intentos de adivinar la contraseña
def admin_login():
    """Verificar contraseña de admin de forma segura en el servidor"""
    try:
        data = request.get_json(silent=True) or {}
        password = str(data.get('password', ''))
        
        if not ADMIN_PASSWORD:
            print('⚠️ ADMIN_PASSWORD no está configurada en los Secrets: panel admin cerrado')
            return jsonify({'success': False, 'message': '❌ Falta configurar ADMIN_PASSWORD en los Secrets'}), 503
        
        if hmac.compare_digest(password.encode(), ADMIN_PASSWORD.encode()):
            session['admin_verified'] = True
            session['admin_time'] = datetime.now().isoformat()
            return jsonify({'success': True, 'message': '✅ Acceso Admin concedido'})
        else:
            return jsonify({'success': False, 'message': '❌ Contraseña incorrecta'}), 401
    except Exception as e:
        print(f"Error admin login: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Solo para probar en tu computadora (sin HTTPS)
    app.config['SESSION_COOKIE_SECURE'] = False
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
