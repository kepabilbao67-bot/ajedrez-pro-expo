# DECLARACIONES Y CUESTIONARIOS DE GOOGLE PLAY CONSOLE — AJEDREZPRO

> **ESTADO REAL:** La app **AjedrezPro** (`com.kepabilbao.ajedrezpro`) **YA ESTÁ CREADA** en Google Play Console.
> Utiliza las respuestas de este documento para completar cualquier formulario pendiente en la sección **"Contenido de la aplicación"** dentro de la app existente.

---

## 1. SEGURIDAD DE LOS DATOS (DATA SAFETY)

| Pregunta de Google Play Console | Respuesta Obligatoria | Justificación Técnica |
| :--- | :---: | :--- |
| **¿Tu aplicación recopila o comparte algún tipo de datos de usuario obligatorios o secundarios?** | **NO** | AjedrezPro funciona de modo 100% autónomo y offline. Las partidas, puntos de experiencia (XP) y configuraciones se almacenan únicamente en el almacenamiento local del dispositivo (SQLite y AsyncStorage privado). |
| **¿Se cifran en tránsito todos los datos del usuario que recopila tu aplicación?** | **No aplica** | No se recopilan ni transfieren datos. |
| **¿Tu aplicación ofrece una forma para que los usuarios soliciten que se eliminen sus datos?** | **SÍ** | El usuario puede borrar sus datos locales en cualquier momento borrando los datos de la app desde los Ajustes del sistema de Android o desinstalando la aplicación. |

---

## 2. POLÍTICA DE PRIVACIDAD

* **URL de la política de privacidad:**
  `https://kepabilbao67-bot.github.io/ajedrez-pro-expo/privacy.html`
  *(El archivo web completo y formateado se encuentra en `docs/privacy.html`)*.

---

## 3. ACCESO A LA APLICACIÓN (APP ACCESS)

* **Seleccionar:** **"Todas las funciones están disponibles sin restricciones de acceso"**
* *Motivo:* AjedrezPro no tiene inicio de sesión, no requiere cuenta de usuario, no tiene pantallas de pago ni funciones bloqueadas tras contraseñas. Los revisores de Google Play pueden acceder al 100% de la app directamente tras la instalación.

---

## 4. PUBLICIDAD Y ANUNCIOS

* **¿Tu aplicación contiene anuncios?**
* **Seleccionar:** **"NO, mi aplicación no contiene anuncios"**
* *Motivo:* AjedrezPro no integra AdMob ni ninguna otra red publicitaria, ni solicita el permiso `AD_ID`.

---

## 5. CLASIFICACIÓN DE CONTENIDO (IARC / PEGI)

* **Dirección de correo electrónico:** `pedrobilbao93@gmail.com`
* **Categoría:** Juegos (Juegos de mesa / Estrategia)

### Respuestas al cuestionario IARC:
* ¿El juego contiene representaciones de violencia? → **NO**
* ¿El juego contiene escenas de miedo o terror? → **NO**
* ¿Contiene contenido sexual o desnudez? → **NO**
* ¿Contiene lenguaje soez o insultos? → **NO**
* ¿Hace referencia o fomenta el consumo de drogas, tabaco o alcohol? → **NO**
* ¿Permite apuestas con dinero real o simuladas tipo casino? → **NO**
* ¿Permite que los usuarios se comuniquen mediante texto, voz o compartan contenido? → **NO**
* ¿Comparte la ubicación física del usuario con otros usuarios? → **NO**
* ¿Permite comprar bienes digitales con dinero real? → **NO**

* **Resultado final asignado:** **PEGI 3 / Para todos (Everyone)**.

---

## 6. PÚBLICO OBJETIVO Y CONTENIDO

* **Grupos de edad objetivo:**
  - Marcar: **13 a 15 años**
  - Marcar: **16 a 17 años**
  - Marcar: **18 años o más**
  *(No marcar grupos menores de 13 años para no requerir cumplimiento del programa Familias estricto)*.

* **¿Tu aplicación puede resultar involuntariamente atractiva para niños?**
  - Seleccionar: **NO** (Es una herramienta de ajedrez formal y entrenamiento mental táctico).

---

## 7. APLICACIONES DE NOTICIAS
* **¿Tu aplicación es una aplicación de noticias?** → **NO**

---

## 8. APLICACIONES DE RASTREO DE CONTACTOS O COVID-19
* **¿Tu aplicación es una aplicación de rastreo de contactos o estado de COVID-19?** → **NO**

---

## 9. FUNCIONES FINANCIERAS (FINANCIAL FEATURES)

* **Ubicación en Consola:** *Contenido de la aplicación* > *Funciones financieras* (o desde el enlace del Panel de control).
* **Pregunta:** ¿Tu aplicación incluye funciones financieras?
* **QUÉ MARCAR:**
  - Marcar la opción: **"Mi aplicación no ofrece ninguna función financiera"** (o desmarcar todas las categorías bancarias/de inversión y marcar la casilla inferior **"Ninguna de las anteriores"**).
* **QUÉ NO MARCAR:**
  - NO marcar banca, billeteras virtuales, préstamos, criptomonedas ni ninguna categoría financiera.
* **ACCIÓN:** Hacer clic en **"Guardar"** (abajo a la derecha).

---

## 10. DECLARACIÓN DE SALUD (HEALTH APPS)

* **Ubicación en Consola:** *Contenido de la aplicación* > *Salud* (o desde el enlace del Panel de control).
* **Pregunta:** ¿Tu aplicación incluye funciones de salud o recopila datos médicos/de fitness?
* **QUÉ MARCAR:**
  - Marcar la opción: **"Mi aplicación no es una aplicación de salud y no ofrece funciones de salud"** (o marcar la casilla **"Ninguna de las anteriores"**).
* **QUÉ NO MARCAR:**
  - NO marcar registro médico, diagnóstico, seguimiento de condición física, nutrición ni salud mental.
* **ACCIÓN:** Hacer clic en **"Guardar"** (abajo a la derecha).

---

## 11. APLICACIONES GUBERNAMENTALES
* **¿Tu aplicación representa o actúa en nombre de una entidad gubernamental?** → Seleccionar **NO** y hacer clic en **Guardar**.

---

## 12. RESUMEN DE ESTADO DE LAS TAREAS DEL PANEL DE CONTROL

1. **Ficha de Play Store principal:** Pegar Descripción Completa (de `docs/google-play/01_FICHA_TIENDA_Y_ASSETS.md`) y pulsar "Guardar".
2. **Funciones financieras:** Marcar "No ofrece funciones financieras" y pulsar "Guardar".
3. **Salud:** Marcar "No incluye funciones de salud" y pulsar "Guardar".
4. **Al completar las 3 anteriores:** El mensaje *"Tu aplicación todavía no se puede publicar. Completa los pasos que aparecen en el panel"* desaparecerá automáticamente.
