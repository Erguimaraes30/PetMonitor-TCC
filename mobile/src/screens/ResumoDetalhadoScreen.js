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
const GRAPH_WIDTH = width - (SIZES.padding * 2) - 32;
const GRAPH_HEIGHT = 78;
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

function getLocalReport(bpms, t) {
  if (!bpms.length) {
    return {
      bpm_medio: 0,
      bpm_min: 0,
      bpm_max: 0,
      bpm_atual: 0,
      variabilidade: 0,
      total_leituras: 0,
      stability: 'unknown',
      trend: 'unknown',
      risk_level: 'unknown',
      activity_state: 'unknown',
      summary: t('semDados'),
      analysis: t('resumoBody'),
      recommendation: t('naoDiagnostico'),
    };
  }

  const avg = Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length);
  const min = Math.min(...bpms);
  const max = Math.max(...bpms);
  const amplitude = max - min;

  return {
    bpm_medio: avg,
    bpm_min: min,
    bpm_max: max,
    bpm_atual: bpms[bpms.length - 1],
    variabilidade: amplitude,
    total_leituras: bpms.length,
    stability: amplitude <= 18 ? 'high' : amplitude <= 45 ? 'medium' : 'low',
    trend: 'stable',
    risk_level: max >= 140 || min <= 60 || amplitude > 50 ? 'attention' : 'normal',
    activity_state: amplitude > 45 ? 'alternating' : 'routine',
    summary: t('resumoMensalBody'),
    analysis: t('resumoMensalBody'),
    recommendation: t('naoDiagnostico'),
  };
}

function translateEnum(t, type, value) {
  const maps = {
    stability: {
      high: 'alta',
      medium: 'estabilidadeMedia',
      low: 'baixa',
      unknown: 'desconhecido',
    },
    trend: {
      rising: 'subindo',
      falling: 'descendo',
      stable: 'estavel',
      unknown: 'desconhecido',
    },
    risk: {
      normal: 'riscoNormal',
      attention: 'riscoAtencao',
      high: 'riscoAlto',
      unknown: 'desconhecido',
    },
    activity: {
      resting: 'repouso',
      alternating: 'alternando',
      stress_or_exercise: 'estresseOuExercicio',
      routine: 'rotina',
      unknown: 'desconhecido',
    },
  };

  return t(maps[type]?.[value] || 'desconhecido');
}

function riskColor(colors, risk) {
  if (risk === 'high') return colors.error;
  if (risk === 'attention') return colors.warning;
  if (risk === 'normal') return colors.success;
  return colors.textSecondary;
}

function Metric({ label, value, unit, colors }) {
  return (
    <View style={[styles.metricBox, { borderColor: colors.border }]}>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{value}</Text>
        {unit ? <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>{unit}</Text> : null}
      </View>
    </View>
  );
}

function Insight({ icon, label, value, color, colors }) {
  return (
    <View style={[styles.insightRow, { borderColor: colors.border }]}>
      <View style={[styles.insightIcon, { backgroundColor: color + '22' }]}>
        <Feather name={icon} size={15} color={color} />
      </View>
      <View style={styles.insightText}>
        <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.insightValue, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function ResumoDetalhadoScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { dark, colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bpms, setBpms] = useState([]);
  const [analiseIA, setAnaliseIA] = useState('');
  const [relatorio, setRelatorio] = useState(null);

  const appLang = i18n.language?.startsWith('en') ? 'en' : 'pt';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/monitor/analysis/${PET_ID}?limit=50&lang=${appLang}&_=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();

      setAnaliseIA(json.analise_ia || json.relatorio?.analysis || '');
      setRelatorio(json.relatorio || null);

      const histResp = await fetch(`${API_URL}/monitor/history/${PET_ID}?limit=20&_=${Date.now()}`);
      if (histResp.ok) {
        const histJson = await histResp.json();
        const valores = (histJson.dados || []).map(d => Number(d.bpm) || 0).reverse();
        setBpms(valores);
      }

      setError(null);
    } catch (err) {
      setError(t('semConexaoServidor'));
    } finally {
      setLoading(false);
    }
  }, [appLang, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const report = relatorio || getLocalReport(bpms, t);
  const media = report.bpm_medio ?? 0;
  const minimo = report.bpm_min ?? 0;
  const pico = report.bpm_max ?? 0;
  const atual = report.bpm_atual ?? (bpms.length ? bpms[bpms.length - 1] : 0);
  const variabilidade = report.variabilidade ?? (pico - minimo);
  const totalLeituras = report.total_leituras ?? bpms.length;
  const risk = report.risk_level || 'unknown';
  const attentionColor = riskColor(colors, risk);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('resumoDetalhado')}</Text>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={fetchData}
        >
          <Feather name="refresh-cw" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('analisandoDados')}</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={32} color={colors.error} />
          <Text style={[styles.loadingText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { borderColor: colors.primary }]} onPress={fetchData}>
            <Text style={[styles.retryText, { color: colors.primary }]}>{t('tentarNovamente')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.aiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('interpretacaoIA').toUpperCase()}</Text>
                <Text style={[styles.aiTitle, { color: colors.textPrimary }]}>{report.summary || t('resumoAtual')}</Text>
              </View>
              <View style={[styles.riskBadge, { borderColor: attentionColor, backgroundColor: attentionColor + '18' }]}>
                <Text style={[styles.riskBadgeText, { color: attentionColor }]}>
                  {translateEnum(t, 'risk', risk)}
                </Text>
              </View>
            </View>

            <Text style={[styles.aiBody, { color: colors.textSecondary }]}>
              {analiseIA || report.analysis || t('resumoBody')}
            </Text>

            <View style={[styles.recommendationBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Feather name="clipboard" size={16} color={colors.primary} />
              <View style={styles.recommendationText}>
                <Text style={[styles.recommendationLabel, { color: colors.textSecondary }]}>{t('recomendacao')}</Text>
                <Text style={[styles.recommendationBody, { color: colors.textPrimary }]}>
                  {report.recommendation || t('naoDiagnostico')}
                </Text>
              </View>
            </View>

            <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>{t('naoDiagnostico')}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('dadosPeriodo').toUpperCase()}</Text>
              <Feather name="activity" size={16} color={colors.primary} />
            </View>
            <View style={styles.metricsGrid}>
              <Metric label={t('bpmMedioPeriodo')} value={media} unit="BPM" colors={colors} />
              <Metric label={t('bpmAtual')} value={atual} unit="BPM" colors={colors} />
              <Metric label={t('faixaPeriodo')} value={`${minimo}-${pico}`} unit="BPM" colors={colors} />
              <Metric label={t('variabilidade')} value={variabilidade} unit="BPM" colors={colors} />
            </View>
            <Text style={[styles.readingCount, { color: colors.textSecondary }]}>
              {t('leiturasAnalisadas', { count: totalLeituras })}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('padraoAtividade').toUpperCase()}</Text>
              <Feather name="layers" size={16} color={colors.primary} />
            </View>
            <Insight
              icon="heart"
              label={t('padraoAtividade')}
              value={translateEnum(t, 'activity', report.activity_state || 'unknown')}
              color={colors.primary}
              colors={colors}
            />
            <Insight
              icon="trending-up"
              label={t('tendencia')}
              value={translateEnum(t, 'trend', report.trend || 'unknown')}
              color={colors.warning}
              colors={colors}
            />
            <Insight
              icon="shield"
              label={t('riscoClinico')}
              value={translateEnum(t, 'risk', risk)}
              color={attentionColor}
              colors={colors}
            />
            <Insight
              icon="bar-chart-2"
              label={t('estabilidade')}
              value={translateEnum(t, 'stability', report.stability || 'unknown')}
              color={colors.success}
              colors={colors}
            />
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('graficoPeriodo')}</Text>
              <Feather name="bar-chart" size={16} color={colors.primary} />
            </View>
            <View style={styles.graphContainer}>
              <MiniGraph data={bpms} strokeColor={colors.primary} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: 55,
    paddingBottom: 16,
  },
  iconBtn: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24 },
  loadingText: { fontSize: 14, textAlign: 'center' },
  retryBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  retryText: { fontSize: 14, fontWeight: '600' },
  card: { borderRadius: SIZES.radius, padding: 16, borderWidth: 1 },
  aiCard: { borderRadius: SIZES.radius, padding: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  cardLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  aiTitle: { fontSize: 19, fontWeight: 'bold', lineHeight: 25, marginTop: 4, maxWidth: 230 },
  riskBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  riskBadgeText: { fontSize: 11, fontWeight: 'bold' },
  aiBody: { fontSize: 14, lineHeight: 22 },
  recommendationBox: { marginTop: 14, padding: 12, borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 10 },
  recommendationText: { flex: 1 },
  recommendationLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' },
  recommendationBody: { fontSize: 14, lineHeight: 20 },
  disclaimer: { fontSize: 11, lineHeight: 16, marginTop: 10 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricBox: { width: '48%', borderWidth: 1, borderRadius: 10, padding: 12 },
  metricLabel: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', minHeight: 28 },
  metricValueRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 },
  metricValue: { fontSize: 24, fontWeight: 'bold' },
  metricUnit: { fontSize: 11, marginLeft: 4, marginBottom: 4 },
  readingCount: { fontSize: 12, marginTop: 12 },
  insightRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 8 },
  insightIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  insightText: { flex: 1 },
  insightLabel: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  insightValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  graphContainer: { minHeight: GRAPH_HEIGHT, justifyContent: 'center' },
});
