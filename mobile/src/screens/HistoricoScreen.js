import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 48;
const GRAPH_HEIGHT = 100;
const API_URL = 'http://192.168.15.126:8000';
const PET_ID = 'pet_001';

const FILTERS = [
  { key: 'hoje',       label: 'hoje',       limit: 50  },
  { key: 'seteDias',   label: 'seteDias',   limit: 200 },
  { key: 'trintaDias', label: 'trintaDias', limit: 500 },
];

function getStatusFromBpm(bpm) {
  if (bpm > 140) return 'alerta';
  if (bpm > 120) return 'elevado';
  return 'normal';
}

function formatTimestamp(ts) {
  const date = new Date(ts);
  const agora = new Date();
  const diffMs = agora - date;
  const diffHoras = diffMs / (1000 * 60 * 60);
  const diffDias = diffMs / (1000 * 60 * 60 * 24);

  if (diffHoras < 24) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDias < 7) {
    return date.toLocaleDateString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
}

function filterByPeriod(dados, filterKey) {
  const agora = new Date();
  return dados.filter(d => {
    const date = new Date(d.timestamp);
    const diffMs = agora - date;
    const diffDias = diffMs / (1000 * 60 * 60 * 24);
    if (filterKey === 'hoje') return diffDias < 1;
    if (filterKey === 'seteDias') return diffDias < 7;
    return diffDias < 30;
  });
}

function statusConfig(status, successColor, t) {
  switch (status) {
    case 'alerta':  return { color: '#E57373', label: t('alerta'),  icon: 'alert-triangle' };
    case 'elevado': return { color: '#FFB74D', label: t('elevado'), icon: 'trending-up' };
    default:        return { color: successColor, label: t('normal'), icon: 'heart' };
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
      <Polyline points={points} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

export default function HistoricoScreen({ navigation }) {
  const { t } = useTranslation();
  const { dark, colors } = useTheme();

  const [filter, setFilter] = useState('hoje');
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch(`${API_URL}/monitor/history/${PET_ID}?limit=500`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();

      const formatted = (json.dados || []).map((d, i) => ({
        id: i,
        bpm: d.bpm,
        timestamp: d.timestamp,
        hora: formatTimestamp(d.timestamp),
        status: getStatusFromBpm(d.bpm),
      }));

      setAllData(formatted);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      setError('Sem conexão com o servidor');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const data = filterByPeriod(allData, filter);

  const media = data.length > 0 ? Math.round(data.reduce((a, b) => a + b.bpm, 0) / data.length) : 0;
  const max = data.length > 0 ? Math.max(...data.map(d => d.bpm)) : 0;
  const min = data.length > 0 ? Math.min(...data.map(d => d.bpm)) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('historicoBatimentos')}</Text>
        <TouchableOpacity onPress={() => fetchHistory(true)}>
          <Feather name="refresh-cw" size={22} color={colors.textSecondary} />
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
              {t(f.label)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando histórico...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Feather name="wifi-off" size={32} color={colors.error} />
          <Text style={[styles.loadingText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { borderColor: colors.primary }]}
            onPress={() => fetchHistory()}
          >
            <Text style={[styles.retryText, { color: colors.primary }]}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchHistory(true)}
              tintColor={colors.primary}
            />
          }
        >
          {/* Cards de resumo */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('media').toUpperCase()}</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{media}</Text>
              <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}>BPM</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('maximo').toUpperCase()}</Text>
              <Text style={[styles.summaryValue, { color: max > 140 ? '#E57373' : max > 120 ? '#FFB74D' : colors.textPrimary }]}>{max}</Text>
              <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}>BPM</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('minimo').toUpperCase()}</Text>
              <Text style={[styles.summaryValue, { color: min < 60 ? '#E57373' : colors.textPrimary }]}>{min}</Text>
              <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}>BPM</Text>
            </View>
          </View>

          {/* Gráfico */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('graficoPeriodo').toUpperCase()}</Text>
            <View style={styles.graphContainer}>
              {data.length >= 2 ? (
                <>
                  <LineGraph data={[...data].reverse()} strokeColor={colors.primary} />
                  <View style={styles.graphLabels}>
                    <Text style={[styles.graphLabel, { color: colors.textSecondary }]}>{data[data.length - 1]?.hora}</Text>
                    <Text style={[styles.graphLabel, { color: colors.textSecondary }]}>{data[0]?.hora}</Text>
                  </View>
                </>
              ) : (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sem dados no período</Text>
              )}
            </View>
          </View>

          {/* Lista de leituras */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('leiturasRecentes').toUpperCase()}</Text>
            <View style={{ marginTop: 12 }}>
              {data.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhuma leitura no período</Text>
              ) : (
                data.slice(0, 20).map((item, index) => {
                  const s = statusConfig(item.status, colors.success, t);
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.readingItem,
                        index < Math.min(data.length, 20) - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                      ]}
                    >
                      <View style={[styles.statusDot, { backgroundColor: s.color + '22', borderColor: s.color }]}>
                        <Feather name={s.icon} size={14} color={s.color} />
                      </View>
                      <View style={styles.readingInfo}>
                        <Text style={[styles.readingBpm, { color: colors.textPrimary }]}>
                          {item.bpm} <Text style={[styles.readingUnit, { color: colors.textSecondary }]}>BPM</Text>
                        </Text>
                        <Text style={[styles.readingHora, { color: colors.textSecondary }]}>{item.hora}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: s.color + '22' }]}>
                        <Text style={[styles.statusBadgeText, { color: s.color }]}>{s.label}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>

        </ScrollView>
      )}
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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  retryBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  retryText: { fontSize: 14, fontWeight: '600' },
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: 20 },
});