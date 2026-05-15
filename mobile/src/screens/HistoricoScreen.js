import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { DataContext } from '../context/DataContext';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 48;
const GRAPH_HEIGHT = 100;
const API_URL = 'https://petmonitor-tcc.onrender.com';
const PET_ID = 'pet_001';

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
  if (bpm > max) return { color: '#E57373', label: t('alerta'), icon: 'alert-triangle' };
  if (bpm > (max * 0.85)) return { color: '#FFB74D', label: t('elevado'), icon: 'trending-up' };
  return { color: successColor, label: t('normal'), icon: 'heart' };
}

export default function HistoricoScreen({ navigation }) {
  const { t } = useTranslation();
  const { dark, colors } = useTheme();
  const { alertSettings } = useContext(DataContext);
  
  const [filter, setFilter] = useState('hoje');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Para feedback visual no refresh manual
  const [historyData, setHistoryData] = useState([]);

  // BUSCA REAL DOS DADOS
  const fetchHistory = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch(`${API_URL}/monitor/history/${PET_ID}?limit=20&_=${Date.now()}`);
      const data = await response.json();
      
      if (data.dados) {
        // Garantimos que os dados estão ordenados por tempo (mais antigo para mais novo para o gráfico)
        const sortedData = data.dados.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setHistoryData(sortedData);
      }
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Lógica de Polling (Atualização automática)
  useEffect(() => {
    // Busca inicial imediata
    if (filter === 'hoje') {
      fetchHistory(true);

      // Define um intervalo para atualizar a cada 10 segundos enquanto estiver nesta tela
      const interval = setInterval(() => {
        fetchHistory(false); // false para não mostrar o spinner de loading toda hora
      }, 10000);

      return () => clearInterval(interval); // Limpa o intervalo ao sair da tela
    } else {
      setHistoryData([]);
      setLoading(false);
    }
  }, [filter, fetchHistory]);

  const hasData = historyData.length > 0 && filter === 'hoje';

  const renderHora = (timestamp) => {
    if (!timestamp) return '--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const media = hasData ? Math.round(historyData.reduce((a, b) => a + b.bpm, 0) / historyData.length) : 0;
  const max = hasData ? Math.max(...historyData.map(d => d.bpm)) : 0;

  // Para a lista "Leituras Recentes", queremos do mais novo para o mais antigo
  const recentLeituras = [...historyData].reverse();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('historico').toUpperCase()}</Text>
        <TouchableOpacity onPress={() => { setRefreshing(true); fetchHistory(true); }}>
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
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{loading ? '...' : media}</Text>
            <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}>BPM</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('maximo').toUpperCase()}</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{loading ? '...' : max}</Text>
            <Text style={[styles.summaryUnit, { color: colors.textSecondary }]}>BPM</Text>
          </View>
        </View>

        {/* GRÁFICO */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('graficoPeriodo').toUpperCase()}</Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : hasData ? (
            <View style={styles.graphContainer}>
              {/* O histórico agora já vem ordenado do antigo -> novo para o LineGraph */}
              <LineGraph data={historyData} strokeColor={colors.primary} />
              <View style={styles.graphLabels}>
                <Text style={[styles.graphLabel, { color: colors.textSecondary }]}>{renderHora(historyData[0]?.timestamp)}</Text>
                <Text style={[styles.graphLabel, { color: colors.textSecondary }]}>AGORA</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Feather name="bar-chart" size={32} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sem registros para este período</Text>
            </View>
          )}
        </View>

        {/* LEITURAS RECENTES */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('leiturasRecentes').toUpperCase()}</Text>
          <View style={{ marginTop: 12 }}>
            {loading ? (
               <ActivityIndicator size="small" color={colors.primary} />
            ) : hasData ? recentLeituras.map((item, index) => {
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
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhuma leitura encontrada.</Text>
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
  summaryCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1 },
  summaryLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  summaryValue: { fontSize: 28, fontWeight: 'bold' },
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