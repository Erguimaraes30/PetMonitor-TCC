import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import Svg, { Polyline } from 'react-native-svg';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 48;
const GRAPH_HEIGHT = 100;

// ── Dados mockados ──────────────────────────────────────────────────────────
const MOCK_DATA = {
  hoje: [
    { id: 1, hora: '14:20', bpm: 85, status: 'normal' },
    { id: 2, hora: '13:45', bpm: 112, status: 'elevado' },
    { id: 3, hora: '12:15', bpm: 82, status: 'normal' },
    { id: 4, hora: '11:30', bpm: 78, status: 'normal' },
    { id: 5, hora: '10:00', bpm: 134, status: 'alerta' },
    { id: 6, hora: '09:15', bpm: 76, status: 'normal' },
    { id: 7, hora: '08:00', bpm: 80, status: 'normal' },
  ],
  '7dias': [
    { id: 1, hora: 'Hoje', bpm: 85, status: 'normal' },
    { id: 2, hora: 'Ontem', bpm: 148, status: 'alerta' },
    { id: 3, hora: 'Seg', bpm: 79, status: 'normal' },
    { id: 4, hora: 'Dom', bpm: 82, status: 'normal' },
    { id: 5, hora: 'Sáb', bpm: 91, status: 'normal' },
    { id: 6, hora: 'Sex', bpm: 118, status: 'elevado' },
    { id: 7, hora: 'Qui', bpm: 77, status: 'normal' },
  ],
  '30dias': [
    { id: 1, hora: 'Semana 4', bpm: 85, status: 'normal' },
    { id: 2, hora: 'Semana 3', bpm: 102, status: 'elevado' },
    { id: 3, hora: 'Semana 2', bpm: 78, status: 'normal' },
    { id: 4, hora: 'Semana 1', bpm: 143, status: 'alerta' },
  ],
};

const FILTERS = [
  { key: 'hoje', label: 'Hoje' },
  { key: '7dias', label: '7 dias' },
  { key: '30dias', label: '30 dias' },
];

function statusConfig(status) {
  switch (status) {
    case 'alerta':   return { color: '#E57373', label: 'Alerta',  icon: 'alert-triangle' };
    case 'elevado':  return { color: '#FFB74D', label: 'Elevado', icon: 'trending-up' };
    default:         return { color: COLORS.success, label: 'Normal', icon: 'heart' };
  }
}

function LineGraph({ data }) {
  if (data.length < 2) return null;
  const values = data.map(d => d.bpm);
  const min = Math.min(...values) - 10;
  const max = Math.max(...values) + 10;
  const range = max - min || 1;

  const points = values.map((val, i) => {
    const x = (i / (values.length - 1)) * GRAPH_WIDTH;
    const y = GRAPH_HEIGHT - ((val - min) / range) * GRAPH_HEIGHT;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
      <Polyline
        points={points}
        fill="none"
        stroke={COLORS.primary}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function HistoricoScreen({ navigation }) {
  const [filter, setFilter] = useState('hoje');
  const data = MOCK_DATA[filter];

  const media = Math.round(data.reduce((a, b) => a + b.bpm, 0) / data.length);
  const max = Math.max(...data.map(d => d.bpm));
  const min = Math.min(...data.map(d => d.bpm));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico de Batimentos</Text>
        <TouchableOpacity>
          <Feather name="settings" size={22} color={COLORS.textSecondary} 
            onPress={() => navigation.navigate('Settings')}/>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Cards de resumo */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>MÉDIA</Text>
            <Text style={styles.summaryValue}>{media}</Text>
            <Text style={styles.summaryUnit}>BPM</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>MÁXIMO</Text>
            <Text style={[styles.summaryValue, { color: max > 140 ? '#E57373' : max > 120 ? '#FFB74D' : COLORS.textPrimary }]}>{max}</Text>
            <Text style={styles.summaryUnit}>BPM</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>MÍNIMO</Text>
            <Text style={[styles.summaryValue, { color: min < 60 ? '#E57373' : COLORS.textPrimary }]}>{min}</Text>
            <Text style={styles.summaryUnit}>BPM</Text>
          </View>
        </View>

        {/* Gráfico */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>GRÁFICO DO PERÍODO</Text>
          <View style={styles.graphContainer}>
            <LineGraph data={data} />
            <View style={styles.graphLabels}>
              <Text style={styles.graphLabel}>{data[0].hora}</Text>
              <Text style={styles.graphLabel}>{data[data.length - 1].hora}</Text>
            </View>
          </View>
        </View>

        {/* Lista de leituras */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>LEITURAS RECENTES</Text>
          <View style={{ marginTop: 12 }}>
            {data.map((item, index) => {
              const s = statusConfig(item.status);
              return (
                <View key={item.id} style={[styles.readingItem, index < data.length - 1 && styles.readingBorder]}>
                  <View style={[styles.statusDot, { backgroundColor: s.color + '22', borderColor: s.color }]}>
                    <Feather name={s.icon} size={14} color={s.color} />
                  </View>
                  <View style={styles.readingInfo}>
                    <Text style={styles.readingBpm}>{item.bpm} <Text style={styles.readingUnit}>BPM</Text></Text>
                    <Text style={styles.readingHora}>{item.hora}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: s.color + '22' }]}>
                    <Text style={[styles.statusBadgeText, { color: s.color }]}>{s.label}</Text>
                  </View>
                </View>
              );
            })}
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
  headerTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold' },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: SIZES.padding,
    marginBottom: 8, gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive: { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  summaryValue: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold' },
  summaryUnit: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  card: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  cardLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  graphContainer: { marginTop: 12 },
  graphLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  graphLabel: { color: COLORS.textSecondary, fontSize: 10 },
  readingItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12,
  },
  readingBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statusDot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  readingInfo: { flex: 1 },
  readingBpm: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold' },
  readingUnit: { color: COLORS.textSecondary, fontSize: 13, fontWeight: 'normal' },
  readingHora: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
});