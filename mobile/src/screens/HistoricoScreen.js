import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { SIZES } from '../constants/theme';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { DataContext } from '../context/DataContext';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 48;
const GRAPH_HEIGHT = 100;
// Componente de Gráfico (Ajustado para renderizar da esquerda para a direita)
function LineGraph({ data, strokeColor }) {
  if (!data || data.length < 2) return null;
  const values = data.map(d => d.bpm);
  const minVal = Math.min(...values) - 5;
  const maxVal = Math.max(...values) + 5;
  const range = maxVal - minVal || 1;

  const points = values.map((val, i) => {
    const x = (i / (values.length - 1)) * GRAPH_WIDTH;
    const y = GRAPH_HEIGHT - ((val - minVal) / range) * GRAPH_HEIGHT;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
      <Polyline points={points} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

function statusConfig(bpm, min, max, successColor, t) {
  if (bpm <= 0) return { color: successColor, label: t('normal'), icon: 'heart' };
  if (bpm < min) return { color: '#64B5F6', label: t('bradicardia'), icon: 'trending-down' };
  if (bpm > max) return { color: '#E57373', label: t('alerta'), icon: 'alert-triangle' };
  if (bpm > (max * 0.85)) return { color: '#FFB74D', label: t('elevado'), icon: 'trending-up' };
  return { color: successColor, label: t('normal'), icon: 'heart' };
}

function periodConfig(filter) {
  if (filter === 'trintaDias') return { days: 30 };
  if (filter === 'seteDias') return { days: 7 };
  return { days: 1 };
}

function filterHistoryByPeriod(data, filter) {
  const { days } = periodConfig(filter);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (days > 1) start.setDate(start.getDate() - (days - 1));

  return data.filter((item) => {
    if (!item.timestamp) return false;
    return new Date(item.timestamp) >= start;
  });
}

export default function HistoricoScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { dark, colors } = useTheme();
  const isFocused = useIsFocused();
  const { alertSettings, bpmReadings = [] } = useContext(DataContext);
  
  const [filter, setFilter] = useState('hoje');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isFocused) return undefined;

    setRefreshing(false);
    return undefined;
  }, [bpmReadings, filter, isFocused]);

  const historyData = useMemo(() => (
    filterHistoryByPeriod(bpmReadings, filter)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  ), [bpmReadings, filter]);

  const hasData = historyData.length > 0;

  const renderHora = (timestamp) => {
    if (!timestamp) return '--:--';
    const date = new Date(timestamp);
    const locale = i18n.language?.startsWith('en') ? 'en-US' : 'pt-BR';
    if (filter === 'hoje') return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
  };

  const media = hasData ? Math.round(historyData.reduce((a, b) => a + b.bpm, 0) / historyData.length) : 0;
  const max = hasData ? Math.max(...historyData.map(d => d.bpm)) : 0;
  const min = hasData ? Math.min(...historyData.map(d => d.bpm)) : 0;

  // Para a lista "Leituras Recentes", queremos do mais novo para o mais antigo
  const recentLeituras = [...historyData].reverse();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('historico').toUpperCase()}</Text>
        <TouchableOpacity onPress={() => setRefreshing(false)}>
          <Feather name="refresh-cw" size={20} color={colors.primary} style={refreshing && {opacity: 0.5}} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['hoje', 'seteDias', 'trintaDias'].map(f => (
          <TouchableOpacity
            key={f}
            style={[
                styles.filterBtn, 
                { backgroundColor: colors.card, borderColor: colors.border },
                filter === f && { backgroundColor: colors.primary + '22', borderColor: colors.primary }
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { color: colors.textSecondary }, filter === f && { color: colors.primary, fontWeight: 'bold' }]}>
              {t(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* SUMÁRIO */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('media').toUpperCase()}</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{media}</Text>
            <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}>BPM</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('maximo').toUpperCase()}</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{max}</Text>
            <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}>BPM</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('minimo').toUpperCase()}</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{min}</Text>
            <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}>BPM</Text>
          </View>
        </View>

        {/* GRÁFICO */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('graficoPeriodo').toUpperCase()}</Text>
          {hasData ? (
            <View style={styles.graphContainer}>
              {/* O histórico agora já vem ordenado do antigo -> novo para o LineGraph */}
              <LineGraph data={historyData} strokeColor={colors.primary} />
              <View style={styles.graphLabels}>
                <Text style={[styles.graphLabel, { color: colors.textSecondary }]}>{renderHora(historyData[0]?.timestamp)}</Text>
                <Text style={[styles.graphLabel, { color: colors.textSecondary }]}>{t('agora').toUpperCase()}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Feather name="bar-chart" size={32} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('semRegistrosPeriodo')}</Text>
            </View>
          )}
        </View>

        {/* LEITURAS RECENTES */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('leiturasRecentes').toUpperCase()}</Text>
          <View style={{ marginTop: 12 }}>
            {hasData ? recentLeituras.map((item, index) => {
              const s = statusConfig(item.bpm, alertSettings.bpmMin, alertSettings.bpmMax, colors.success, t);
              return (
                <View key={index} style={[styles.readingItem, index < recentLeituras.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <View style={[styles.statusDot, { backgroundColor: s.color + '22', borderColor: s.color }]}>
                    <Feather name={s.icon} size={14} color={s.color} />
                  </View>
                  <View style={styles.readingInfo}>
                    <Text style={[styles.readingBpm, { color: colors.textPrimary }]}>
                        {item.bpm} <Text style={[styles.readingUnit, { color: colors.textSecondary }]}>BPM</Text>
                    </Text>
                    <Text style={[styles.readingHora, { color: colors.textSecondary }]}>{renderHora(item.timestamp)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: s.color + '22' }]}>
                    <Text style={[styles.statusBadgeText, { color: s.color }]}>{s.label}</Text>
                  </View>
                </View>
              );
            }) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('nenhumaLeitura')}</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 55, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '500' },
  scroll: { padding: 20, gap: 12, paddingBottom: 30 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1 },
  summaryLabel: { fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 4 },
  summaryValue: { fontSize: 24, fontWeight: 'bold' },
  summaryUnit: { fontSize: 11, marginTop: 2 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  cardLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  graphContainer: { marginTop: 12 },
  graphLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  graphLabel: { fontSize: 10 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { fontSize: 12 },
  readingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  statusDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  readingInfo: { flex: 1 },
  readingBpm: { fontSize: 16, fontWeight: 'bold' },
  readingUnit: { fontSize: 13, fontWeight: 'normal' },
  readingHora: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
});
