import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.root}
      contentContainerStyle={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.eyebrow}>AJEDREZPRO · INFORMACIÓN LEGAL</Text>
        <Text style={styles.title}>Política de privacidad de AjedrezPro</Text>
        <Text style={styles.meta}>Última actualización: 27 de agosto de 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Responsable y Contacto</Text>
          <Text style={styles.paragraph}>
            El responsable de esta aplicación es el desarrollador independiente de AjedrezPro. Para cualquier consulta, ejercicio de derechos o aclaración sobre privacidad, puedes contactar a través del correo electrónico:{' '}
            <Text style={styles.bold}>pedrobilbao93@gmail.com</Text>.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Almacenamiento Local de Datos</Text>
          <Text style={styles.paragraph}>
            AjedrezPro está diseñada bajo el principio de privacidad por diseño y funcionamiento 100% autónomo y offline. Todos los datos generados por tu actividad —incluyendo partidas, historial de movimientos, puntuación de Puzzle Rush, nivel de jugador, puntos de experiencia (XP), retos diarios, logros y preferencias visuales (temas de tablero, piezas y sonido)— se almacenan exclusivamente de forma local en el almacenamiento local privado de la aplicación en tu dispositivo (mediante SQLite y almacenamiento interno).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Sin Cuentas ni Registro</Text>
          <Text style={styles.paragraph}>
            No solicitamos ni requerimos la creación de cuentas de usuario, correos electrónicos, nombres reales, contraseñas ni ningún tipo de identificación personal para acceder o utilizar la totalidad de las funciones de la aplicación.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Procesamiento Local de IA y Reglas</Text>
          <Text style={styles.paragraph}>
            El motor de evaluación de ajedrez, el cálculo de jugadas de los oponentes de IA, las sugerencias tácticas del Profesor (Coach) y la validación de ejercicios de la Academia se ejecutan íntegramente en la memoria de tu dispositivo en Android. No se envían posiciones de tablero, jugadas ni análisis a servidores externos, servicios en la nube ni APIs de terceros.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Sin Anuncios, Compras ni Herramientas de Rastreo</Text>
          <Text style={styles.paragraph}>
            En su versión actual (V1), AjedrezPro:
          </Text>
          <Text style={styles.bullet}>• No contiene redes de publicidad ni SDKs de anuncios (no solicita AD_ID).</Text>
          <Text style={styles.bullet}>• No integra pasarelas de pago ni compras integradas (In-App Purchases).</Text>
          <Text style={styles.bullet}>• No utiliza herramientas de analítica, telemetría, métricas de uso ni seguimiento de usuarios (como Firebase Analytics, Mixpanel o similares).</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Permisos del Dispositivo y Uso Técnico</Text>
          <Text style={styles.paragraph}>
            AjedrezPro no solicita acceso a tu cámara, micrófono, libreta de contactos, ubicación geográfica ni archivos multimedia personales. Los permisos técnicos declarados corresponden estrictamente a:
          </Text>
          <Text style={styles.bullet}>• <Text style={styles.bold}>VIBRATE:</Text> Necesario para generar respuesta háptica al mover piezas y realizar capturas.</Text>
          <Text style={styles.bullet}>• <Text style={styles.bold}>MODIFY_AUDIO_SETTINGS y WAKE_LOCK:</Text> Utilizados por el reproductor multimedia nativo para reproducir efectos de sonido locales de manera fluida.</Text>
          <Text style={styles.bullet}>• <Text style={styles.bold}>INTERNET y ACCESS_NETWORK_STATE:</Text> Permisos técnicos estándar incluidos por bibliotecas de plataforma base. El código de la V1 no realiza conexiones de red ni transmisión de datos.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Copias de Seguridad del Sistema Operativo</Text>
          <Text style={styles.paragraph}>
            Si tienes activada la funcionalidad de copia de seguridad automática de Google / Android en tu dispositivo, el sistema operativo puede incluir los datos locales de las aplicaciones en tu almacenamiento en la nube de Google de acuerdo con tu propia configuración y los términos de servicio de Google.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Eliminación Total de Datos</Text>
          <Text style={styles.paragraph}>
            Dado que no almacenamos tus datos en servidores externos, puedes eliminar instantáneamente y de forma definitiva todos tus datos de progreso y estadísticas en cualquier momento realizando cualquiera de estas acciones:
          </Text>
          <Text style={styles.bullet}>1. Accediendo a <Text style={styles.bold}>Ajustes &gt; Aplicaciones &gt; AjedrezPro &gt; Almacenamiento &gt; Borrar datos</Text> en tu dispositivo Android.</Text>
          <Text style={styles.bullet}>2. Desinstalando la aplicación de tu dispositivo.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Actualizaciones de esta Política</Text>
          <Text style={styles.paragraph}>
            Si en versiones futuras de AjedrezPro se incorporaran servicios en línea, funciones multijugador en red, opciones de monetización o compras integradas, esta política de privacidad será actualizada previamente y se notificará de forma clara y transparente dentro de la aplicación antes de recopilar o procesar cualquier dato.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver a la aplicación"
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backButtonText}>Volver al juego</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#09130f' },
  container: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 48, alignItems: 'center' },
  card: { width: '100%', maxWidth: 600, gap: 14, padding: 20, borderRadius: 20, borderCurve: 'continuous', backgroundColor: '#14241D', borderWidth: 1, borderColor: '#294235' },
  eyebrow: { color: '#9EAFA5', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#F6E6BD', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  meta: { color: '#D6A943', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  section: { gap: 6, marginTop: 10 },
  sectionTitle: { color: '#F5C451', fontSize: 15, fontWeight: '800' },
  paragraph: { color: '#C5D0C9', fontSize: 13, lineHeight: 20 },
  bullet: { color: '#C5D0C9', fontSize: 13, lineHeight: 20, paddingLeft: 8 },
  bold: { color: '#F8F4EA', fontWeight: '700' },
  backButton: { minHeight: 48, marginTop: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D6A943', borderRadius: 14, borderCurve: 'continuous' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  backButtonText: { color: '#162019', fontSize: 15, fontWeight: '900' },
});
