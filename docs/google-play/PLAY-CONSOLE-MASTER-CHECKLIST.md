# PLAY CONSOLE MASTER CHECKLIST — AJEDREZPRO

Este documento es la referencia definitiva del estado de todos los bloqueos y requisitos de Google Play Console para **AjedrezPro** (`com.kepabilbao.ajedrezpro`).

---

## 1. ESTADO DEL BINARIO Y BUNDLE (AAB)

* **Archivo local:** `C:\Users\foca-\Downloads\AjedrezPro-production-v1.0.0-vc6.aab` (77.56 MB)
* **Package:** `com.kepabilbao.ajedrezpro`
* **VersionName:** `1.0.0`
* **VersionCode:** `6`
* **Target SDK:** 36 | **Min SDK:** 24
* **Estado en Google Play:** **YA SUBIDO A LA BIBLIOTECA DE GOOGLE PLAY**.
* **Diagnóstico del error en "Revisar y confirmar":**
  Los errores:
  1. *"Debes subir un APK o Android App Bundle para esta aplicación."*
  2. *"No puedes lanzar esta versión porque no permite que los usuarios actualicen a los app bundles añadidos recientemente."*
  3. *"En esta versión no se añaden ni se quitan app bundles."*
  
  **Causa real descubierta:** La pantalla *"Prueba interna → Versión sin nombre → Borrador"* pertenece a la **PISTA DE PRUEBA INTERNA**, no a la Prueba Cerrada Alpha.
  Ese borrador de Prueba Interna está vacío y además **NO SIRVE** para cumplir el requisito de los 14 días y 12 evaluadores exigido por Google Play para cuentas personales.
  
  **Solución:** Abandonar la pista de Prueba Interna e ir directamente en el menú lateral a **"Prueba cerrada"** (o "Pistas cerradas" > "Alpha") para crear o asociar la versión allí con el bundle `versionCode 6` mediante **"Añadir de la biblioteca"**. **NO** se requiere nuevo build ni subir de nuevo el archivo.

---

## 2. ESTADO DE LOS BLOQUEOS DE GOOGLE PLAY (CONTENIDO DE LA APLICACIÓN)

| Sección de Google Play | Estado | Valor / Acción Requerida |
| :--- | :---: | :--- |
| **Política de privacidad** | ✅ **RESUELTO** | URL activa HTTP 200: `https://kepabilbao67-bot.github.io/ajedrez-pro-expo/privacy.html` |
| **Acceso a aplicaciones** | ⏳ **POR GUARDAR** | Seleccionar *"Todas las funciones están disponibles sin restricciones de acceso"* |
| **Anuncios** | ⏳ **POR GUARDAR** | Seleccionar *"No, mi aplicación no contiene anuncios"* |
| **Clasificación de contenido (IARC)** | ⏳ **POR GUARDAR** | Completar cuestionario IARC (todo NO). Resultado: **PEGI 3** |
| **Público objetivo y contenido** | ⏳ **POR GUARDAR** | Marcar grupos: **13-15**, **16-17**, **18+**. ¿Atractivo involuntario para niños? → **NO** |
| **Seguridad de los datos (Data Safety)** | ⏳ **POR GUARDAR** | ¿Recopila datos? → **NO** (100% offline, almacenamiento local) |
| **Aplicaciones gubernamentales** | ⏳ **POR GUARDAR** | Seleccionar: **NO** |
| **Funciones financieras** | 🔴 **PENDIENTE DE GUARDAR** | Seleccionar: *"Mi aplicación no ofrece ninguna función financiera"* y pulsar Guardar |
| **Declaración de salud** | 🔴 **PENDIENTE DE GUARDAR** | Seleccionar: *"Mi aplicación no incluye funciones de salud"* y pulsar Guardar |
| **Ficha de Play Store (Descripción completa)** | 🔴 **PENDIENTE DE PEGAR** | Pegar descripción completa (2597 caracteres) y pulsar Guardar |
| **COVID-19 / Noticias** | ⏳ **POR GUARDAR** | Seleccionar: **NO** a todas |

---

## 3. ESTADO DE LA FICHA DE PLAY STORE (CRECIMIENTO)

* **Título (29/30 car.):** `AjedrezPro: Ajedrez y Táctica`
* **Descripción corta (75/80 car.):** `Juega al ajedrez offline, desafía a la IA y mejora con el Profesor táctico.`
* **Descripción completa:** Texto preparado en `docs/google-play/01_FICHA_TIENDA_Y_ASSETS.md`
* **Icono (512×512):** `docs/assets/icon_playstore_512.png`
* **Feature Graphic (1024×500):** `docs/assets/feature-graphic.png`
* **Screenshots (1080×1920):** 5 capturas en `docs/assets/screenshots/`

---

## 4. ESTADO DE LA PISTA DE PRUEBA CERRADA

* **Pista cerrada:** Creada
* **Países / Regiones:** Configurados
* **Testers:** Mínimo 12 evaluadores aceptados
* **Duración requerida:** 14 días consecutivos
* **Mensaje para testers:** Listo en `docs/google-play/03_PRUEBA_CERRADA_12_TESTERS_14_DIAS.md`
