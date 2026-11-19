# 📱 Guía Completa: Publicar Aurora en Google Play Store

## ✅ **PREPARACIÓN COMPLETADA**

### 1. Política de Privacidad ✅
- **URL**: `u-guia-de-empoderamiento.digital/privacidad`
- **Estado**: Completa y lista
- **Email de contacto**: Eyre.rojas.er@gmail.com

### 2. Manifest.json Optimizado ✅
- Idioma configurado: Español
- Categorías: Health, Lifestyle, Productivity
- Iconos: 144px, 192px, 256px, 384px, 512px

### 3. Descripciones Profesionales ✅
- Archivo: `google-play-descripcion.txt`
- Descripción corta y larga lista
- Palabras clave para ASO
- Categorías sugeridas

---

## 🚀 **PASOS PARA PUBLICAR**

### **PASO 1: Crear Cuenta de Google Play Developer**

1. Ve a: https://play.google.com/console/signup
2. Inicia sesión con tu cuenta de Google
3. Paga la tarifa única de **$25 USD**
4. Completa tu perfil de desarrollador
5. Acepta los términos y condiciones

---

### **PASO 2: Generar el APK con PWABuilder** (¡MUY FÁCIL!)

#### 2.1. Ir a PWABuilder
- Visita: https://www.pwabuilder.com/

#### 2.2. Ingresar tu URL
- En el campo, escribe: `u-guia-de-empoderamiento.digital`
- Haz clic en **"Start"**

#### 2.3. Esperar el Análisis
- PWABuilder analizará tu PWA automáticamente
- Mostrará un puntaje de calidad
- Verás 3 opciones: **Windows**, **Android**, **iOS**

#### 2.4. Generar el Package de Android
1. Haz clic en **"Android"** (el botón verde de Android)
2. Selecciona **"Store Package"** (no "APK")
3. Configura los siguientes datos:

**Opciones Importantes:**
- **Package ID**: `com.aurora.empoderamiento` (o el que prefieras)
- **App Name**: `Aurora`
- **App Version**: `1.0.0`
- **Signing Key**: Genera una nueva (PWABuilder te ayuda)

4. Haz clic en **"Generate"**
5. Espera unos minutos mientras se genera el AAB
6. Descarga el archivo `.aab` (Android App Bundle)

#### 2.5. Archivos que Recibirás
- `app-release-signed.aab` - El archivo principal para Google Play
- `signing-key.keystore` - ⚠️ **¡MUY IMPORTANTE! Guárdalo seguro**
- `assetlinks.json` - Para verificación del dominio

---

### **PASO 3: Preparar Screenshots**

Google Play requiere **mínimo 2 capturas** de pantalla. Toma screenshots de:

1. **Pantalla de Inicio** - Portada con logo Aurora
2. **Dashboard** - Vista con metas, emociones, hábitos
3. **Diario Emocional** - Sección del diario
4. **Cartas de Poder** - Las tarjetas interactivas
5. **Metas y Logros** - Sistema de gamificación

**Requisitos de Screenshots:**
- Formato: JPEG o PNG (sin transparencia)
- Tamaño mínimo: 320px
- Tamaño máximo: 3840px
- Proporción: Entre 16:9 y 9:16

**Cómo tomarlas:**
- Abre Aurora en tu celular o emulador
- Toma capturas nativas (botón de captura del teléfono)
- Usa herramientas como [Figma](https://figma.com) o [Canva](https://canva.com) para añadir texto promocional

---

### **PASO 4: Subir a Google Play Console**

#### 4.1. Crear Nueva App
1. Ve a: https://play.google.com/console/
2. Haz clic en **"Crear app"**
3. Completa:
   - **Nombre**: Aurora – Tu Guía de Empoderamiento
   - **Idioma predeterminado**: Español (España)
   - **Tipo de app**: Aplicación
   - **Gratis o de pago**: Gratis
   - **Declaraciones**: Marca todas las casillas requeridas

#### 4.2. Configurar Ficha de Play Store
1. Ve a **"Ficha de Play Store"** → **"Detalles principales"**
2. Completa:
   - **Nombre de la app**: Aurora – Empoderamiento Femenino
   - **Descripción corta**: (Copia de `google-play-descripcion.txt`)
   - **Descripción completa**: (Copia de `google-play-descripcion.txt`)
   - **Icono de app**: Sube `icon-512.png`
   - **Imagen destacada**: Crea una imagen 1024×500px con logo de Aurora

3. Ve a **"Recursos gráficos"**:
   - Sube **screenshots** del celular (mínimo 2, máximo 8)
   - Opcional: Video promocional de YouTube

4. Ve a **"Categorización"**:
   - **Categoría**: Salud y bienestar
   - **Etiquetas**: Agrega "empoderamiento", "bienestar", "mujeres"

#### 4.3. Política de Privacidad
1. Ve a **"Política de privacidad"**
2. Ingresa la URL: `https://u-guia-de-empoderamiento.digital/privacidad`
3. Guarda

#### 4.4. Clasificación de Contenido
1. Ve a **"Clasificación de contenido"**
2. Completa el cuestionario:
   - ¿Contiene violencia? **No**
   - ¿Contiene contenido sexual? **No**
   - ¿Contiene lenguaje ofensivo? **No**
   - Categoría: **Bienestar y Salud Mental**
3. Envía para obtener la clasificación (aparecerá como "Para todos" / Everyone)

#### 4.5. Público Objetivo
1. Ve a **"Público objetivo y contenido"**
2. Configura:
   - **Grupo de edad**: 18+ (o 13+ si es apropiado)
   - **¿App dirigida a niños?**: No

#### 4.6. Subir el APK/AAB
1. Ve a **"Producción"** → **"Crear versión"**
2. Sube el archivo `app-release-signed.aab` que generaste con PWABuilder
3. Google Play lo analizará (toma unos minutos)
4. Completa **"Notas de la versión"**:
   ```
   🌸 Primera versión de Aurora
   
   ✨ Características:
   • Diario emocional interactivo
   • Sistema de metas y logros
   • Seguimiento de hábitos personalizados
   • Rituales de empoderamiento diarios
   • Cartas de poder inspiradoras
   • Planificador y gratitudes
   ```

#### 4.7. Países y Regiones
1. Ve a **"Países y regiones"**
2. Selecciona:
   - **Todos los países** (o específicamente países de habla hispana)
   - España, México, Argentina, Colombia, Chile, Perú, etc.

#### 4.8. Revisión Final
1. Google Play te mostrará una lista de verificación
2. Asegúrate de que todo tenga ✅ verde
3. Haz clic en **"Enviar para revisión"**

---

### **PASO 5: Esperar Aprobación**

- **Tiempo de revisión**: 1-7 días (normalmente 2-3 días)
- **Notificación**: Recibirás un email cuando sea aprobada
- **Estado**: Revisa en Google Play Console

#### Durante la Revisión:
- Google verificará:
  - Política de privacidad
  - Funcionalidad de la app
  - Contenido apropiado
  - Cumplimiento de políticas

#### Si es Rechazada:
- Lee el email de Google con los motivos
- Corrige los problemas señalados
- Vuelve a enviar

---

## 📋 **CHECKLIST COMPLETO**

### Antes de Empezar:
- ✅ Política de Privacidad creada y publicada
- ✅ Manifest.json optimizado
- ✅ Descripciones profesionales listas
- ✅ Iconos en todos los tamaños (144, 192, 256, 384, 512px)

### Cuenta de Google Play:
- ⬜ Cuenta de desarrollador creada
- ⬜ Tarifa de $25 USD pagada
- ⬜ Perfil de desarrollador completado

### Generación del APK:
- ⬜ AAB generado con PWABuilder
- ⬜ Signing key guardado de forma segura
- ⬜ assetlinks.json configurado

### Contenido para la Tienda:
- ⬜ Mínimo 2 screenshots tomados
- ⬜ Icono de 512×512px listo
- ⬜ Imagen destacada 1024×500px creada
- ⬜ Descripción corta y larga copiadas

### Configuración en Play Console:
- ⬜ App creada en Play Console
- ⬜ Ficha de Play Store completada
- ⬜ URL de privacidad agregada
- ⬜ Clasificación de contenido obtenida
- ⬜ Público objetivo configurado
- ⬜ AAB subido
- ⬜ Países y regiones seleccionados
- ⬜ Enviado para revisión

---

## 🎯 **CONSEJOS IMPORTANTES**

### 💾 Guarda el Signing Key
- ⚠️ **CRÍTICO**: El archivo `signing-key.keystore` es único
- Si lo pierdes, **NO PODRÁS actualizar la app nunca más**
- Guárdalo en Google Drive, Dropbox, o un lugar seguro
- Haz 2-3 copias de respaldo

### 📸 Screenshots Atractivos
- Usa screenshots reales de la app funcionando
- Añade texto promocional con Canva
- Muestra las mejores características
- Usa los colores de Aurora (rosado, beige, dorado)

### 📝 ASO (App Store Optimization)
- Usa palabras clave en la descripción:
  - "empoderamiento femenino"
  - "diario emocional"
  - "metas personales"
  - "hábitos saludables"
  - "amor propio"

### 🔄 Actualizaciones Futuras
- Cuando hagas cambios en Aurora, genera un nuevo AAB con PWABuilder
- Incrementa el número de versión (1.0.0 → 1.0.1 → 1.1.0)
- Usa el **mismo signing key** siempre

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### Problema: PWABuilder no detecta mi PWA
**Solución**: 
- Verifica que Aurora esté accesible públicamente en tu dominio
- Revisa que manifest.json esté en la raíz del sitio
- Asegúrate de tener Service Worker activo

### Problema: Google rechaza la app
**Razones comunes**:
- Política de privacidad incompleta (✅ Ya tienes una completa)
- Falta de funcionalidad (prueba que todo funcione)
- Contenido inapropiado (no debería pasar)

### Problema: Error al subir el AAB
**Solución**:
- Verifica que sea un archivo `.aab` no `.apk`
- Asegúrate de que esté firmado
- Intenta con otro navegador

---

## 📞 **SOPORTE**

### Ayuda de Google Play:
- Centro de ayuda: https://support.google.com/googleplay/android-developer
- Foro: https://support.google.com/googleplay/android-developer/community

### Ayuda de PWABuilder:
- Documentación: https://docs.pwabuilder.com/
- GitHub: https://github.com/pwa-builder/PWABuilder

---

## 🎉 **¡FELICIDADES!**

Una vez aprobada, Aurora estará disponible en Google Play Store para **miles de millones de usuarios Android** en todo el mundo.

Tu app aparecerá cuando la gente busque:
- "empoderamiento femenino"
- "diario emocional"
- "app de metas"
- "hábitos saludables"
- Y muchos más términos relacionados

**¡Éxito con tu lanzamiento! 🌸✨**

---

_Creado para Aurora – Tu Guía de Empoderamiento_
_Email: Eyre.rojas.er@gmail.com_
