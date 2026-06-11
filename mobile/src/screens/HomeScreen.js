import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { SIZES } from '../constants/theme';
import Svg, { Polyline } from 'react-native-svg';
import { DataContext } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 48;
const GRAPH_HEIGHT = 80;
const MAX_POINTS = 30;
const API_URL = 'https://petmonitor-tcc.onrender.com';
const POLL_INTERVAL = 5000; // 5 segundos

function getStatus(bpm, min, max) {
  if (bpm <= 0) return { label: 'NORMAL', color: '#4ADE80', global: 'NORMAL' };
  if (bpm < min) return { label: 'BRADICARDIA', color: '#E57373', global: 'ALERTA' };
  if (bpm > max) return { label: 'TAQUICARDIA', color: '#E57373', global: 'ALERTA' };
  const thresholdAtencao = max * 0.85;
  if (bpm > thresholdAtencao) return { label: 'ELEVADO', color: '#FFB74D', global: 'ATENCAO' };
  return { label: 'NORMAL', color: '#4ADE80', global: 'NORMAL' };
}

function MiniGraph({ data, strokeColor }) {
  if (data.length < 2) return null;
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (MAX_POINTS - 1)) * GRAPH_WIDTH;
    const y = GRAPH_HEIGHT - ((val - min) / range) * GRAPH_HEIGHT;
    return `${x},${y}`;
  }).join(' ');
  return (
    <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
      <Polyline points={points} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

function translateFeedStatus(t, value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return t('semDados');
  if (normalized === 'sem dados') return t('semDados');
  if (normalized === 'erro de conexão' || normalized === 'erro de conexao') return t('erroConexao');
  if (normalized === 'normal') return t('normal');
  if (normalized === 'alerta') return t('alerta');
  if (normalized === 'atencao' || normalized === 'atenção') return t('atencao');
  return value;
}

export default function HomeScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { petData, alertSettings } = useContext(DataContext);
  const { dark, colors } = useTheme();
  const isFocused = useIsFocused();

  const [bpm, setBpm] = useState(0);
  const [history, setHistory] = useState(Array(MAX_POINTS).fill(0));
  const [lastUpdate, setLastUpdate] = useState('--');
  const [ir, setIr] = useState(0);
  const [feedStatus, setFeedStatus] = useState('');
  const [harnessStatus, setHarnessStatus] = useState('offline');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const mediaRef = useRef(0);

  const fetchLatestBpm = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/petmonitor/latest?_=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.message || t('erroBuscarDados'));

      const latestBpm = Number(data.bpm) || 0;

      setBpm(latestBpm);
      setIr(Number(data.ir) || 0);
      setFeedStatus(data.status || '');
      setHarnessStatus(data.status ? 'online' : 'offline');
      setHistory((currentHistory) => {
        const nextHistory = [...currentHistory.slice(1), latestBpm];
        mediaRef.current = Math.round(nextHistory.reduce((a, b) => a + b, 0) / nextHistory.length);
        return nextHistory;
      });
      setLastUpdate(data.updated_at ? new Date(data.updated_at).toLocaleString(i18n.language === 'en' ? 'en-US' : 'pt-BR') : '--');
      setError(null);
      setLoading(false);
    } catch (err) {
      setError('erro de conexão');
      setFeedStatus('erro de conexão');
      setHarnessStatus('offline');
      setLoading(false);
    }
  }, [i18n.language, t]);

  useEffect(() => {
    if (!isFocused) return undefined;

    fetchLatestBpm();
    const interval = setInterval(fetchLatestBpm, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLatestBpm, isFocused]);

  const status = getStatus(bpm, alertSettings.bpmMin, alertSettings.bpmMax);
  const diff = bpm - mediaRef.current;
  const diffText = diff > 0 ? `+${diff} ${t('acimaDaMedia')}` : `${diff} ${t('abaixoDaMedia')}`;
  const displayedFeedStatus = translateFeedStatus(t, feedStatus);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="github" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.petName, { color: colors.textPrimary }]}>{petData.nome || 'Pet'}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.harnessbadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.harnessOnlineDot, { backgroundColor: harnessStatus === 'online' ? colors.success : colors.error }]} />
            <Text style={[styles.harnessText, { color: colors.textSecondary }]}>
              {t('harness')}: {harnessStatus === 'online' ? t('online') : t('offline')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Feather name="settings" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* STATUS GLOBAL */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statusRow}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('statusGlobal')}</Text>
              <Text style={[styles.statusValue, { color: error ? colors.error : status.color }]}>{loading ? '...' : displayedFeedStatus}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('sincronizado')}</Text>
              <Text style={[styles.cardSubValue, { color: colors.textSecondary }]}>{t('ultimaAtualizacao')}</Text>
              <Text style={[styles.cardSubValue, { color: colors.textSecondary }]}>{lastUpdate}</Text>
            </View>
          </View>
        </View>

        {/* SINAL INFRAVERMELHO */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('sinalInfravermelho')}</Text>
          <Text style={[styles.irValue, { color: colors.textPrimary }]}>{loading ? '--' : ir}</Text>
          <Text style={[styles.cardSubValueLeft, { color: colors.textSecondary }]}>{t('feedIrAdafruit')}</Text>
        </View>

        {/* FREQUENCIA CARDIACA */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.bpmRow}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('frequenciaCardiaca')}</Text>
              <View style={styles.bpmValueRow}>
                <Text style={[styles.bpmNumber, { color: colors.textPrimary }]}>{loading ? '--' : bpm}</Text>
                <Text style={[styles.bpmUnit, { color: colors.textSecondary }]}> BPM</Text>
              </View>
            </View>
            <Text style={[styles.diffText, { color: colors.textSecondary }]}>{loading ? '' : diffText}</Text>
          </View>

          <View style={styles.graphContainer}>
            <MiniGraph data={history} strokeColor={colors.primary} />
            <View style={styles.graphLabels}>
              <Text style={[styles.graphLabel, { color: colors.textSecondary }]}>{t('trintaMin')}</Text>
              <Text style={[styles.graphLabel, { color: colors.textSecondary }]}>{t('agora').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* BOTAO HISTORICO */}
        <TouchableOpacity 
          style={[styles.historyButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Historico')}
        >
          <Feather name="clock" size={18} color={colors.primary} style={{ marginRight: 10 }} />
          <Text style={[styles.historyButtonText, { color: colors.textPrimary }]}>{t('verHistorico')}</Text>
          <Feather name="chevron-right" size={18} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* IA ENGINE - REINTEGRADO AQUI */}
        <View style={[styles.iaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iaBadge, { backgroundColor: colors.primary + '22' }]}>
            <Text style={[styles.iaBadgeText, { color: colors.primary }]}>{t('iaEngine')}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('ResumoDetalhado')}>
            <Text style={[styles.iaTitle, { color: colors.textPrimary }]}>{t('atividadeInferida')}</Text>
            <Text style={[styles.iaSubtitle, { color: colors.textSecondary }]}>{t('resumoDetalhado')}</Text>
            <Text style={[styles.iaBody, { color: colors.textSecondary }]}>
              {t('resumoBody')}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 55, paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1 },
  petName: { fontSize: 24, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  harnessbadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  harnessOnlineDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  harnessText: { fontSize: 12 },
  scroll: { padding: 20, gap: 12, paddingBottom: 30 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  cardLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statusValue: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  cardSubValue: { fontSize: 12, textAlign: 'right' },
  cardSubValueLeft: { fontSize: 12, marginTop: 4 },
  irValue: { fontSize: 34, fontWeight: 'bold', marginTop: 6 },
  bpmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  bpmValueRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  bpmNumber: { fontSize: 52, fontWeight: 'bold' },
  bpmUnit: { fontSize: 16, marginBottom: 6 },
  diffText: { fontSize: 11, fontWeight: 'bold', textAlign: 'right', maxWidth: 130 },
  graphContainer: { marginTop: 4 },
  graphLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  graphLabel: { fontSize: 10 },
  historyButton: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, borderWidth: 1 },
  historyButtonText: { fontSize: 15, fontWeight: '500' },
  iaCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginTop: 4 },
  iaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6 },
  iaBadgeText: { fontSize: 10, fontWeight: 'bold' },
  iaTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  iaSubtitle: { fontSize: 14, marginBottom: 10 },
  iaBody: { fontSize: 14, lineHeight: 22 }
});
