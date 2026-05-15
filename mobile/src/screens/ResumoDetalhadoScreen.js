import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 64;
const GRAPH_HEIGHT = 60;
const API_URL = 'https://petmonitor-tcc.onrender.com';
const PET_ID = 'pet_001';

function MiniGraph({ data, strokeColor }) {
  if (!data || data.length < 2) return null;
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
      <Polyline points={points} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

function getEstabilidade(bpms) {
  if (!bpms || bpms.length === 0) return { label: 'Sem dados', key: 'semDados' };
  const avg = bpms.reduce((a, b) => a + b, 0) / bpms.length;
  const variance = bpms.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / bpms.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev < 8)  return { label: 'Alta',  key: 'alta' };
  if (stdDev < 18) return { label: 'Média', key: 'media' };
  return { label: 'Baixa', key: 'baixa' };
}

export default function ResumoDetalhadoScreen({ navigation }) {
  const { t } = useTranslation();
  const { dark, colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bpms, setBpms] = useState([]);
  const [analiseIA, setAnaliseIA] = useState('');
  const [relatorio, setRelatorio] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/monitor/analysis/${PET_ID}?limit=50`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();

      setAnaliseIA(json.analise_ia || '');
      setRelatorio(json.relatorio || null);

      // Busca também o histórico pro gráfico
      const histResp = await fetch(`${API_URL}/monitor/history/${PET_ID}?limit=20`);
      if (histResp.ok) {
        const histJson = await histResp.json();
        const valores = (histJson.dados || []).map(d => d.bpm).reverse();
        setBpms(valores);
      }

      setError(null);
    } catch (err) {
      console.error('Erro ao buscar resumo:', err);
      setError('Sem conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const media = relatorio?.bpm_medio ?? (bpms.length > 0 ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : 0);
  const minimo = relatorio?.bpm_min ?? (bpms.length > 0 ? Math.min(...bpms) : 0);
  const pico = relatorio?.bpm_max ?? (bpms.length > 0 ? Math.max(...bpms) : 0);
  const estabilidade = getEstabilidade(bpms);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('resumoDetalhado')}</Text>
        <TouchableOpacity onPress={fetchData}>
          <Feather name="refresh-cw" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Analisando dados...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={32} color={colors.error} />
          <Text style={[styles.loadingText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { borderColor: colors.primary }]} onPress={fetchData}>
            <Text style={[styles.retryText, { color: colors.primary }]}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* BPM Médio */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('bpmMedioPeriodo').toUpperCase()}</Text>
              <Feather name="activity" size={16} color={colors.primary} />
            </View>
            <View style={styles.bpmRow}>
              <Text style={[styles.bpmValue, { color: colors.textPrimary }]}>{media}</Text>
              <Text style={[styles.bpmUnit, { color: colors.textSecondary }]}> BPM</Text>
            </View>
            <View style={styles.minMaxRow}>
              <View>
                <Text style={[styles.minMaxLabel, { color: colors.textSecondary }]}>{t('minimo').toUpperCase()}</Text>
                <Text style={[styles.minMaxValue, { color: colors.textPrimary }]}>{minimo}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.minMaxLabel, { color: colors.textSecondary }]}>{t('pico').toUpperCase()}</Text>
                <Text style={[styles.minMaxValue, { color: colors.textPrimary }]}>{pico}</Text>
              </View>
            </View>
            <View style={styles.graphContainer}>
              <MiniGraph data={bpms} strokeColor={colors.primary} />
            </View>
          </View>

          {/* Resumo IA */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('resumoAtual').toUpperCase()}</Text>
              <Feather name="cpu" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.estabilidade, { color: colors.textPrimary }]}>
              Estabilidade: {estabilidade.label}
            </Text>
            <Text style={[styles.resumoBody, { color: colors.textSecondary }]}>
              {analiseIA || t('resumoBody')}
            </Text>
            {relatorio?.total_leituras && (
              <Text style={[styles.leituras, { color: colors.textSecondary }]}>
                Baseado em {relatorio.total_leituras} leituras
              </Text>
            )}
          </View>

          {/* Status do Hardware */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('statusHardware').toUpperCase()}</Text>
              <Feather name="wifi" size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.hardwareRow}>
              <View style={styles.hardwareItem}>
                <View style={styles.hardwareItemHeader}>
                  <Feather name="wifi" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.hardwareLabel, { color: colors.textSecondary }]}>{t('forcaSinal')}</Text>
                </View>
                <Text style={[styles.hardwareValue, { color: colors.textPrimary }]}>-45 dBm</Text>
              </View>
              <View style={styles.hardwareItem}>
                <View style={styles.hardwareItemHeader}>
                  <Feather name="battery-charging" size={14} color={colors.success} style={{ marginRight: 4 }} />
                  <Text style={[styles.hardwareLabel, { color: colors.textSecondary }]}>{t('bateria')}</Text>
                </View>
                <Text style={[styles.hardwareValue, { color: colors.textPrimary }]}>84%</Text>
              </View>
            </View>
            <View style={styles.conexaoRow}>
              <View style={[styles.conexaoDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.conexaoText, { color: colors.textSecondary }]}>{t('conexaoEstavel')}</Text>
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
  backBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  retryBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  retryText: { fontSize: 14, fontWeight: '600' },
  card: { borderRadius: SIZES.radius, padding: 16, borderWidth: 1 },
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
  leituras: { fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  hardwareRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  hardwareItem: { flex: 1 },
  hardwareItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  hardwareLabel: { fontSize: 12 },
  hardwareValue: { fontSize: 22, fontWeight: 'bold' },
  conexaoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  conexaoDot: { width: 8, height: 8, borderRadius: 4 },
  conexaoText: { fontSize: 13 },
});