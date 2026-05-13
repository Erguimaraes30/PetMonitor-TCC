import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 48;
const GRAPH_HEIGHT = 100;

// 1. MOCK_DATA com chaves minúsculas para facilitar a tradução no i18next
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
  seteDias: [ 
    { id: 1, hora: 'hoje', bpm: 85, status: 'normal' },
    { id: 2, hora: 'ontem', bpm: 148, status: 'alerta' },
    { id: 3, hora: 'seg', bpm: 79, status: 'normal' },
    { id: 4, hora: 'dom', bpm: 82, status: 'normal' },
    { id: 5, hora: 'sab', bpm: 91, status: 'normal' },
    { id: 6, hora: 'sex', bpm: 118, status: 'elevado' },
    { id: 7, hora: 'qui', bpm: 77, status: 'normal' },
  ],
  trintaDias: [
    { id: 1, hora: 'semana4', bpm: 85, status: 'normal' },
    { id: 2, hora: 'semana3', bpm: 102, status: 'elevado' },
    { id: 3, hora: 'semana2', bpm: 78, status: 'normal' },
    { id: 4, hora: 'semana1', bpm: 143, status: 'alerta' },
  ],
};

const FILTERS = [
  { key: 'hoje' },
  { key: 'seteDias' }, 
  { key: 'trintaDias' },
];

function statusConfig(status, successColor, t) {
  switch (status) {
    case 'alerta':   return { color: '#E57373', label: t('alerta'),  icon: 'alert-triangle' };
    case 'elevado':  return { color: '#FFB74D', label: t('elevado'), icon: 'trending-up' };
    default:         return { color: successColor, label: t('normal'), icon: 'heart' };
  }
}

function LineGraph({ data, strokeColor }) {
  if (!data || data.length < 2) return null;
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
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function HistoricoScreen({ navigation }) {
  const { t } = useTranslation();
  const { dark, colors } = useTheme();
  const [filter, setFilter] = useState('hoje');
  const data = MOCK_DATA[filter];

  // 2. Lógica para identificar se é um horário fixo ou uma chave de tradução
  const renderHora = (val) => {
    const isTimeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/.test(val);
    return isTimeFormat ? val : t(val);
  };

  const media = Math.round(data.reduce((a, b) => a + b.bpm, 0) / data.length);
  const max = Math.max(...data.map(d => d.bpm));
  const min = Math.min(...data.map(d => d.bpm));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('historico').toUpperCase()}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Feather name="settings" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
                styles.filterBtn, 
                { backgroundColor: colors.card, borderColor: colors.border },
                filter === f.key && { backgroundColor: colors.primary + '22', borderColor: colors.primary }
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[
                styles.filterText, 
                { color: colors.textSecondary },
                filter === f.key && { color: colors.primary, fontWeight: 'bold' }
            ]}>
              {t(f.key)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('media').toUpperCase()}</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{media}</Text>
            <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}>BPM</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('maximo').toUpperCase()}</Text>
            <Text style={[
                styles.summaryValue, 
                { color: max > 140 ? '#E57373' : max > 120 ? '#FFB74D' : colors.textPrimary }
            ]}>{max}</Text>
            <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}>BPM</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('minimo').toUpperCase()}</Text>
            <Text style={[
                styles.summaryValue, 
                { color: min < 60 ? '#E57373' : colors.textPrimary }
            ]}>{min}</Text>
            <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}>BPM</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('graficoPeriodo').toUpperCase()}</Text>
          <View style={styles.graphContainer}>
            <LineGraph data={data} strokeColor={colors.primary} />
            <View style={styles.graphLabels}>
              {/* TRADUÇÃO DAS LABELS DO GRÁFICO */}
              <Text style={[styles.graphLabel, { color: colors.textSecondary }]}>{renderHora(data[0].hora)}</Text>
              <Text style={[styles.graphLabel, { color: colors.textSecondary }]}>{renderHora(data[data.length - 1].hora)}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('leiturasRecentes').toUpperCase()}</Text>
          <View style={{ marginTop: 12 }}>
            {data.map((item, index) => {
              const s = statusConfig(item.status, colors.success, t);
              return (
                <View key={item.id} style={[
                    styles.readingItem, 
                    index < data.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                ]}>
                  <View style={[styles.statusDot, { backgroundColor: s.color + '22', borderColor: s.color }]}>
                    <Feather name={s.icon} size={14} color={s.color} />
                  </View>
                  <View style={styles.readingInfo}>
                    <Text style={[styles.readingBpm, { color: colors.textPrimary }]}>
                        {item.bpm} <Text style={[styles.readingUnit, { color: colors.textSecondary }]}>BPM</Text>
                    </Text>
                    {/* TRADUÇÃO DA DATA/HORA NA LISTA */}
                    <Text style={[styles.readingHora, { color: colors.textSecondary }]}>{renderHora(item.hora)}</Text>
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 55, paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', paddingHorizontal: SIZES.padding, marginBottom: 8, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '500' },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, borderRadius: SIZES.radius, padding: 14, alignItems: 'center', borderWidth: 1 },
  summaryLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  summaryValue: { fontSize: 28, fontWeight: 'bold' },
  summaryUnit: { fontSize: 11, marginTop: 2 },
  card: { borderRadius: SIZES.radius, padding: 16, borderWidth: 1 },
  cardLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  graphContainer: { marginTop: 12 },
  graphLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  graphLabel: { fontSize: 10 },
  readingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  statusDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  readingInfo: { flex: 1 },
  readingBpm: { fontSize: 16, fontWeight: 'bold' },
  readingUnit: { fontSize: 13, fontWeight: 'normal' },
  readingHora: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
});