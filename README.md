# AjedrezPro

App de ajedrez para Android, iOS y web hecha con Expo (SDK 57), React Native y Expo Router. Incluye una IA con varios niveles, un entrenador que explica los errores, puzzles, progresión con XP y retos diarios, y funciones premium.

- **Paquete Android:** `com.kepabilbao.ajedrezpro`
- **Esquema de enlaces:** `ajedrezpro://`

> **Ramas:** el desarrollo activo y los builds para Google Play están en `release/v1`, que va bastante por delante de `main`.

## Qué incluye

| Área | Carpeta | Contenido |
|---|---|---|
| Motor de ajedrez | `src/chess/` | Tablero, movimientos, reglas, FEN y estado de la partida. |
| IA rival | `src/ai/` | Stockfish en web y motor propio (`fallback-engine`) en Android/iOS, niveles de dificultad, bots, libro de aperturas y control de legalidad. |
| Entrenador | `src/ai/coach/` | Pistas, análisis de la partida, detección de errores con explicación y resumen posterior. |
| Entrenamiento | `src/training/` | Motor y biblioteca de puzzles, entrenamiento adaptativo y Puzzle Rush. |
| Progresión | `src/gamification/` | XP, logros y retos diarios. |
| Perfil | `src/profile/` | Perfil del jugador guardado en el dispositivo. |
| Premium | `src/premium/` | Política premium y *feature flags*. |
| Aspecto | `src/board-themes/`, `src/themes/` | Temas de tablero, juegos de piezas y temas de la app. |
| Pantallas | `src/app/` | Rutas de Expo Router. |

## Requisitos

- Node.js 20, la versión que usa el workflow de build.
- Para probar en el móvil: un *development build* (el proyecto usa `expo-dev-client`) o un emulador o simulador.

## Puesta en marcha

```bash
npm install
npm start          # servidor de desarrollo de Expo
npm run android    # abre en Android
npm run ios        # abre en iOS
npm run web        # abre en el navegador
```

## Calidad

```bash
npm test           # tests con vitest
npx tsc --noEmit   # comprobación de tipos
npm run lint       # expo lint
```

## Build para Google Play (AAB)

El workflow **Build Android App Bundle (AAB)** (`.github/workflows/build-aab.yml`) se lanza a mano desde GitHub → Actions → *Run workflow*:

1. Hace checkout de `release/v1`.
2. Instala dependencias y ejecuta tests, comprobación de tipos y lint.
3. Genera el AAB firmado en local con `eas build --local`, usando las credenciales ya guardadas en EAS.
4. Sube el `.aab` y su hash SHA-256 como artefacto (`ajedrezpro-play-aab`).

Necesita el secreto `EXPO_TOKEN` en el repositorio. La carpeta `android/` no se versiona (está en `.gitignore`): la genera el propio build.

## Estructura

```
src/
  app/            pantallas (Expo Router)
  ai/             IA rival y entrenador
  chess/          motor de ajedrez
  components/     componentes de interfaz
  training/       puzzles y entrenamiento
  gamification/   XP, logros, retos
  premium/        funciones premium
  profile/        perfil del jugador
  board-themes/   temas y piezas
scripts/          utilidades (generación de efectos de sonido, reset del proyecto)
```

## Licencia

MIT © 2026 Kepa Bilbao. Ver [`LICENSE`](LICENSE).
