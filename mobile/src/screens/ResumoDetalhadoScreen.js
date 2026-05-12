import React from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import Svg, { Polyline } from 'react-native-svg';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 64;
const GRAPH_HEIGHT = 60;

const MOCK_BPM = [72, 75, 70, 68, 74, 73, 71, 72, 76, 72, 69, 72, 74, 72, 71];

function MiniGraph({ data }) {
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
        stroke={COLORS.primary}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function ResumoDetalhadoScreen({ navigation }) {
  const media = Math.round(MOCK_BPM.reduce((a, b) => a + b, 0) / MOCK_BPM.length);
  const minimo = Math.min(...MOCK_BPM);
  const pico = Math.max(...MOCK_BPM);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resumo Detalhado</Text>
        <TouchableOpacity>
          <Feather name="settings" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* BPM Médio */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>BPM MÉDIO NO PERÍODO</Text>
            <Feather name="refresh-cw" size={16} color={COLORS.textSecondary} />
          </View>
          <View style={styles.bpmRow}>
            <Text style={styles.bpmValue}>{media}</Text>
            <Text style={styles.bpmUnit}> BPM</Text>
          </View>
          <View style={styles.minMaxRow}>
            <View>
              <Text style={styles.minMaxLabel}>MÍNIMO</Text>
              <Text style={styles.minMaxValue}>{minimo}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.minMaxLabel}>PICO</Text>
              <Text style={styles.minMaxValue}>{pico}</Text>
            </View>
          </View>
          <View style={styles.graphContainer}>
            <MiniGraph data={MOCK_BPM} />
          </View>
        </View>

        {/* Resumo Mensal */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>RESUMO MENSAL</Text>
            <Feather name="smartphone" size={16} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.estabilidade}>Estabilidade: Alta</Text>
          <Text style={styles.resumoBody}>
            Seu pet apresentou estabilidade alta durante o período. A movimentação mínima detectada e a orientação predominante horizontal sugerem um estado de repouso estável.
          </Text>
        </View>

        {/* Status do Hardware */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>STATUS DO HARDWARE</Text>
            <Feather name="wifi" size={16} color={COLORS.textSecondary} />
          </View>
          <View style={styles.hardwareRow}>
            <View style={styles.hardwareItem}>
              <View style={styles.hardwareItemHeader}>
                <Feather name="wifi" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.hardwareLabel}>Força do Sinal</Text>
              </View>
              <Text style={styles.hardwareValue}>-45 dBm</Text>
            </View>
            <View style={styles.hardwareItem}>
              <View style={styles.hardwareItemHeader}>
                <Feather name="battery-charging" size={14} color={COLORS.success} style={{ marginRight: 4 }} />
                <Text style={styles.hardwareLabel}>Bateria</Text>
              </View>
              <Text style={styles.hardwareValue}>84%</Text>
            </View>
          </View>
          <View style={styles.conexaoRow}>
            <View style={styles.conexaoDot} />
            <Text style={styles.conexaoText}>Conexão estável. Última sincronização: Agora.</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 55, paddingBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  card: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  bpmRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  bpmValue: { color: COLORS.textPrimary, fontSize: 52, fontWeight: 'bold', lineHeight: 56 },
  bpmUnit: { color: COLORS.textSecondary, fontSize: 16, marginBottom: 8 },
  minMaxRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  minMaxLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  minMaxValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  graphContainer: { marginTop: 4 },
  estabilidade: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  resumoBody: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  hardwareRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  hardwareItem: { flex: 1 },
  hardwareItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  hardwareLabel: { color: COLORS.textSecondary, fontSize: 12 },
  hardwareValue: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 'bold' },
  conexaoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  conexaoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  conexaoText: { color: COLORS.textSecondary, fontSize: 13 },
});