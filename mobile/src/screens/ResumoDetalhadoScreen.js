import React from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext'; // Importe o hook

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 64;
const GRAPH_HEIGHT = 60;

const MOCK_BPM = [72, 75, 70, 68, 74, 73, 71, 72, 76, 72, 69, 72, 74, 72, 71];

// O Gráfico agora recebe as cores dinamicamente
function MiniGraph({ data, strokeColor }) {
  if (data.length < 2) return null;
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * GRAPH_WIDTH;
    const y = GRAPH_HEIGHT - ((val - min) / range) * GRAPH_HEIGHT;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
      <Polyline
        points={points}
        fill="none"
        stroke={strokeColor} // Cor dinâmica aqui
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function ResumoDetalhadoScreen({ navigation }) {
  const { dark, colors } = useTheme(); // Pega o tema global

  const media = Math.round(MOCK_BPM.reduce((a, b) => a + b, 0) / MOCK_BPM.length);
  const minimo = Math.min(...MOCK_BPM);
  const pico = Math.max(...MOCK_BPM);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Resumo Detalhado</Text>
        <TouchableOpacity>
                    <Feather name="settings" size={22} color={colors.textSecondary} 
                    onPress={() => navigation.navigate('Settings')}/>
                  </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* BPM Médio */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>BPM MÉDIO NO PERÍODO</Text>
            <Feather name="refresh-cw" size={16} color={colors.textSecondary} />
          </View>
          <View style={styles.bpmRow}>
            <Text style={[styles.bpmValue, { color: colors.textPrimary }]}>{media}</Text>
            <Text style={[styles.bpmUnit, { color: colors.textSecondary }]}> BPM</Text>
          </View>
          <View style={styles.minMaxRow}>
            <View>
              <Text style={[styles.minMaxLabel, { color: colors.textSecondary }]}>MÍNIMO</Text>
              <Text style={[styles.minMaxValue, { color: colors.textPrimary }]}>{minimo}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.minMaxLabel, { color: colors.textSecondary }]}>PICO</Text>
              <Text style={[styles.minMaxValue, { color: colors.textPrimary }]}>{pico}</Text>
            </View>
          </View>
          <View style={styles.graphContainer}>
            <MiniGraph data={MOCK_BPM} strokeColor={colors.primary} />
          </View>
        </View>

        {/* Resumo Mensal */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>RESUMO MENSAL</Text>
            <Feather name="smartphone" size={16} color={colors.textSecondary} />
          </View>
          <Text style={[styles.estabilidade, { color: colors.textPrimary }]}>Estabilidade: Alta</Text>
          <Text style={[styles.resumoBody, { color: colors.textSecondary }]}>
            Seu pet apresentou estabilidade alta durante o período. A movimentação mínima detectada sugere um estado de repouso estável.
          </Text>
        </View>

        {/* Status do Hardware */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>STATUS DO HARDWARE</Text>
            <Feather name="wifi" size={16} color={colors.textSecondary} />
          </View>
          <View style={styles.hardwareRow}>
            <View style={styles.hardwareItem}>
              <View style={styles.hardwareItemHeader}>
                <Feather name="wifi" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.hardwareLabel, { color: colors.textSecondary }]}>Sinal</Text>
              </View>
              <Text style={[styles.hardwareValue, { color: colors.textPrimary }]}>-45 dBm</Text>
            </View>
            <View style={styles.hardwareItem}>
              <View style={styles.hardwareItemHeader}>
                <Feather name="battery-charging" size={14} color={colors.success} style={{ marginRight: 4 }} />
                <Text style={[styles.hardwareLabel, { color: colors.textSecondary }]}>Bateria</Text>
              </View>
              <Text style={[styles.hardwareValue, { color: colors.textPrimary }]}>84%</Text>
            </View>
          </View>
          <View style={styles.conexaoRow}>
            <View style={[styles.conexaoDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.conexaoText, { color: colors.textSecondary }]}>
              Conexão estável. Última sincronização: Agora.
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 55, paddingBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  card: {
    borderRadius: SIZES.radius,
    padding: 16, borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  bpmRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  bpmValue: { fontSize: 52, fontWeight: 'bold', lineHeight: 56 },
  bpmUnit: { fontSize: 16, marginBottom: 8 },
  minMaxRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  minMaxLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  minMaxValue: { fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  graphContainer: { marginTop: 4 },
  estabilidade: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  resumoBody: { fontSize: 14, lineHeight: 22 },
  hardwareRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  hardwareItem: { flex: 1 },
  hardwareItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  hardwareLabel: { fontSize: 12 },
  hardwareValue: { fontSize: 22, fontWeight: 'bold' },
  conexaoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  conexaoDot: { width: 8, height: 8, borderRadius: 4 },
  conexaoText: { fontSize: 13 },
});