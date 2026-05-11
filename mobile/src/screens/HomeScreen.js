import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { COLORS } from '../constants/theme';

export default function HomeScreen() {
  const [bpm, setBpm] = useState(85);

  useEffect(() => {
    const interval = setInterval(() => {
      const variacao = Math.floor(Math.random() * 5) - 2;
      setBpm(prev => {
        const novoValor = prev + variacao;
        return (novoValor > 60 && novoValor < 140) ? novoValor : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Text style={styles.headerTitle}>PetMonitor🐾</Text>
      
      <View style={styles.monitorArea}>
        <Text style={styles.label}>Batimentos Cardíacos</Text>
        
        <View style={styles.bpmCircle}>
          <Text style={styles.bpmNumber}>{bpm}</Text>
          <Text style={styles.bpmUnit}>BPM</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={{ color: COLORS.textSecondary }}>Status do Pet: </Text>
          <Text style={[styles.statusValue, { color: bpm > 120 ? '#FF5252' : COLORS.success }]}>
            {bpm > 120 ? 'Agitado' : 'Estável'}
          </Text>
        </View>

        {/* O botão de conexão que você tinha no App.js, agora aqui dentro */}
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
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    color: COLORS.text,
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
    color: COLORS.textSecondary,
    fontSize: 18,
    marginBottom: 15,
  },
  bpmCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 10,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    marginBottom: 40,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
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
    padding: 15,
    borderRadius: 12,
    width: '85%',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  connectionCard: {
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  connectionText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: 'bold',
  }
});