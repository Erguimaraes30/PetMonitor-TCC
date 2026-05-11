import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { COLORS } from '../constants/theme'; // Importando as cores que você já tem

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Barra de status clara no fundo escuro */}
      <StatusBar barStyle="light-content" />
      
      <Text style={styles.headerTitle}>PetMonitor🐾</Text>
      
      <View style={styles.monitorArea}>
        <Text style={styles.label}>Batimentos Cardíacos</Text>
        
        {/* Círculo do Monitor */}
        <View style={styles.bpmCircle}>
          {/* Por enquanto é um número fixo, depois ligamos o ESP32 */}
          <Text style={styles.bpmNumber}>85</Text>
          <Text style={styles.bpmUnit}>BPM</Text>
        </View>

        {/* Card de Status */}
        <View style={styles.statusCard}>
          <Text style={{ color: COLORS.textSecondary }}>Status do Pet: </Text>
          <Text style={styles.statusValue}>Estável</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Usa o fundo escuro
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60, // Dá espaço da barra do iPhone/Android
    marginBottom: 20,
  },
  monitorArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50, // Ajuste visual
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 18,
    marginBottom: 15,
  },
  bpmCircle: {
    width: 220,
    height: 220,
    borderRadius: 110, // Metade para ficar círculo
    borderWidth: 10,
    borderColor: COLORS.primary, // Círculo Azul
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface, // Fundo levemente diferente dentro
    marginBottom: 40,
    // Sombra (Efeito visual)
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10, // Sombra no Android
  },
  bpmNumber: {
    color: COLORS.text,
    fontSize: 72,
    fontWeight: 'bold',
  },
  bpmUnit: {
    color: COLORS.textSecondary,
    fontSize: 18,
  },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    width: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface, // Borda quase invisível
  },
  statusValue: {
    color: COLORS.success, // Verde
    fontWeight: 'bold',
    fontSize: 16,
  }
});