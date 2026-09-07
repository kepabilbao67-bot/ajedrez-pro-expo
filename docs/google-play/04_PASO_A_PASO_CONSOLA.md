# GUÍA PASO A PASO EN GOOGLE PLAY CONSOLE — AJEDREZPRO

> **ESTADO REAL:** La app **AjedrezPro** (`com.kepabilbao.ajedrezpro`) **YA ESTÁ CREADA** en Google Play Console con el panel *"Prepárate para publicar tu juego"*.
> **NO crear ninguna app nueva.** Esta guía se enfoca directamente en la **Prueba Cerrada** obligatoria (12 testers / 14 días).

---

## PASO 1: ABRIR LA APP EXISTENTE EN LA CONSOLA

1. Entra en [Google Play Console](https://play.google.com/console).
2. En la lista de "Todas las aplicaciones", haz clic directamente sobre **AjedrezPro**.
3. Verás el panel de control con los requisitos para acceder a producción:
   - Publicar una prueba cerrada.
   - Conseguir al menos 12 evaluadores que acepten participar.
   - Mantener al menos 12 evaluadores activos durante 14 días continuos.

---

## PASO 2: ASOCIAR EL BUNDLE A LA PISTA CORRECTA: "PRUEBA CERRADA"

> **CRÍTICO — VERIFICA LA PISTA DONDE ESTÁS:**
> Comprueba la barra de ruta superior de Google Play Console:
> - Si dice: `Prueba interna → Versión sin nombre`: **ESTÁS EN LA PISTA EQUIVOCADA**. En "Prueba interna" no se cumplen los requisitos de los 14 días y saldrán siempre esos errores.
> - **Debes ir en el menú lateral izquierdo a:** **"Probar y publicar"** > **"Pruebas"** > **"Prueba cerrada"** (o "Pistas cerradas" > "Alpha").
>
> **RESOLUCIÓN DE LOS 3 ERRORES ("Debes subir un APK...", "No permite actualizar a bundles añadidos recientemente..."):**
> Significan que el bundle `versionCode 6` ya fue subido a la consola pero el borrador actual no lo tiene marcado.
> **NO tienes que volver a subir 77 MB ni crear otro archivo.**

1. En la pantalla de la versión (o pulsando **"Editar versión"**):
2. Localiza la sección **"Paquetes de aplicaciones"**.
3. Haz clic en el botón **"Añadir de la biblioteca"** (justo al lado o debajo del botón "Subir").
4. En la lista emergente que aparece, verás el bundle ya subido:
   - **Nombre:** `com.kepabilbao.ajedrezpro`
   - **Código de versión:** `6`
   - **Nombre de versión:** `1.0.0`
5. **Marca la casilla de verificación** a la izquierda de `versionCode 6`.
6. Haz clic en **"Añadir a la versión"** (abajo a la derecha del cuadro de diálogo).
7. Verás que `AjedrezPro 1.0.0 (6)` ahora aparece añadido en la tabla de la versión.
8. En **"Notas de la versión"**, asegúrate de que esté pegado el texto de lanzamiento (de `docs/google-play/01_FICHA_TIENDA_Y_ASSETS.md`).
9. Haz clic en **"Siguiente"** (abajo a la derecha).
10. ¡Los 3 errores desaparecen inmediatamente!

---

## PASO 3: CONFIGURAR EVALUADORES (MÍNIMO 12 TESTERS)

1. En la misma pantalla de la pista de **"Prueba cerrada"**, ve a la pestaña **"Evaluadores"** (Testers).
2. En la sección "Lista de distribución de correo":
   - Haz clic en **"Crear lista de correo"** (nombre: `Evaluadores AjedrezPro`).
   - Añade las direcciones `@gmail.com` de tus evaluadores (mínimo 12, se recomiendan 14-16 para tener margen).
   - Guarda la lista y asegúrate de que la casilla de esa lista esté **marcada**.
3. Baja a la sección **"Cómo se unen los evaluadores"**:
   - Copia el **enlace web de adhesión** (o el enlace de Google Play en Android).
   - Este enlace es el que enviarás a tus evaluadores con el mensaje preparado en `docs/google-play/03_PRUEBA_CERRADA_12_TESTERS_14_DIAS.md`.
4. Haz clic en **"Guardar cambios"** al final de la página.

---

## PASO 4: REVISAR TAREAS PENDIENTES DEL PANEL (SI FALTA ALGUNA)

Si el panel *"Prepárate para publicar tu juego"* aún tiene tareas pendientes de configuración antes del envío a revisión, consulta:

1. **Ficha de Play Store principal (Textos y Gráficos):**
   - Guía de textos e imágenes: `docs/google-play/01_FICHA_TIENDA_Y_ASSETS.md`
   - Icono 512: `docs/assets/icon_playstore_512.png`
   - Feature Graphic 1024x500: `docs/assets/feature-graphic.png`
   - Capturas de móvil: `docs/assets/screenshots/`
2. **Contenido de la aplicación (Cuestionarios y Políticas):**
   - Respuestas exactas: `docs/google-play/02_DECLARACIONES_Y_CUESTIONARIOS.md`
   - Política de privacidad: `https://kepabilbao67-bot.github.io/ajedrez-pro-expo/privacy.html`
   - Data Safety: Cero recopilación (100% offline).
   - Anuncios: NO.
   - Clasificación: PEGI 3 / Para todos.

---

## PASO 5: ENVIAR A REVISIÓN LA PRUEBA CERRADA E INICIAR LOS 14 DÍAS

1. Ve a **"Publicación con revisión"** (o en la versión de Prueba cerrada, haz clic en **"Revisar versión"**).
2. Haz clic en **"Enviar cambios a revisión"**.
3. Una vez que Google apruebe la versión de prueba cerrada (suele tardar de 1 a 3 días hábiles):
   - Envía el enlace de adhesión a tus evaluadores.
   - Comprueba en el panel que el contador indique **12 evaluadores aceptados**.
   - Se iniciará automáticamente el contador oficial de los **14 días continuos**.
