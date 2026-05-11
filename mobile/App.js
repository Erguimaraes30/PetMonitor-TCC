import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Text style={styles.headerTitle}>PetMonitor🐾</Text>
      
      <View style={styles.monitorArea}>
        <Text style={styles.label}>Batimentos Cardíacos</Text>
        
        {/* Círculo do Monitor */}
        <View style={styles.bpmCircle}>
          <Text style={styles.bpmNumber}>85</Text>
          <Text style={styles.bpmUnit}>BPM</Text>
        </View>

        {/* Card de Status */}
        <View style={styles.statusCard}>
          <Text style={{ color: '#B0BEC5' }}>Status do Pet: </Text>
          <Text style={styles.statusValue}>Estável</Text>
        </View>

        {/* Botão de Conexão (O que você já tinha) */}
        <View style={styles.connectionCard}>
          <Text style={styles.connectionText}>● Conectado ao ESP32</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
  },
  monitorArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#B0BEC5',
    fontSize: 18,
    marginBottom: 15,
  },
  bpmCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 10,
    borderColor: '#1F3864',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A2332',
    marginBottom: 40,
  },
  bpmNumber: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: 'bold',
  },
  bpmUnit: {
    color: '#B0BEC5',
    fontSize: 18,
  },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: '#1A2332',
    padding: 15,
    borderRadius: 12,
    width: '85%',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusValue: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  connectionCard: {
    backgroundColor: '#1A2332',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  connectionText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  }
});