import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import Svg, { Polyline } from 'react-native-svg';
import { DataContext } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 48;
const GRAPH_HEIGHT = 80;
const MAX_POINTS = 30;
const API_URL = 'http://192.168.15.126:8000';
const PET_ID = 'pet_001';
const POLL_INTERVAL = 5000;

function getStatus(bpm, min, max) {
  if (bpm < min) return { label: 'BRADICARDIA', color: '#E57373', global: 'ALERTA' };
  if (bpm > max) return { label: 'TAQUICARDIA', color: '#E57373', global: 'ALERTA' };
  const thresholdAtencao = max * 0.85;
  // Corrigido para chave simples sem caracteres especiais
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

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { petData, alertSettings } = useContext(DataContext);
  const { dark, colors } = useTheme();

  const [bpm, setBpm] = useState(0);
  const [history, setHistory] = useState(Array(MAX_POINTS).fill(0));
  const [lastUpdate, setLastUpdate] = useState('--');
  const [harnessStatus, setHarnessStatus] = useState('offline');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mediaRef = useRef(0);
  const lastTimestampRef = useRef(null);

  const fetchLatestBpm = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/monitor/history/${PET_ID}?limit=30`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (!data.dados || data.dados.length === 0) return;

      const latest = data.dados[0];
      const latestBpm = latest.bpm;
      const latestTimestamp = latest.timestamp;

      if (latestTimestamp !== lastTimestampRef.current) {
        lastTimestampRef.current = latestTimestamp;

        const bpmValues = data.dados
          .slice(0, MAX_POINTS)
          .map(d => d.bpm)
          .reverse();

        while (bpmValues.length < MAX_POINTS) bpmValues.unshift(bpmValues[0] || 0);

        setBpm(latestBpm);
        setHistory(bpmValues);
        setHarnessStatus(latest.status_coleira || 'online');

        const date = new Date(latestTimestamp);
        const agora = new Date();
        const diffSec = Math.floor((agora - date) / 1000);

        if (diffSec < 60) setLastUpdate('agora');
        else if (diffSec < 3600) setLastUpdate(`${Math.floor(diffSec / 60)} min atrás`);
        else setLastUpdate(date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

        mediaRef.current = Math.round(bpmValues.reduce((a, b) => a + b, 0) / bpmValues.length);
        setError(null);
      }
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar BPM:', err);
      setError('Sem conexão com o servidor');
      setHarnessStatus('offline');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestBpm();
    const interval = setInterval(fetchLatestBpm, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLatestBpm]);

  const status = getStatus(bpm, alertSettings.bpmMin, alertSettings.bpmMax);
  const diff = bpm - mediaRef.current;
  const diffText = diff > 0
    ? `+${diff} ${t('acimaDaMedia')}`
    : diff < 0
    ? `${diff} ${t('abaixoDaMedia')}`
    : t('naMédia');

  const globalColor = status.global === t('normal')
    ? colors.success
    : status.global === t('atencao')
    ? '#FFB74D'
    : colors.error;

  const isOnline = harnessStatus === 'online';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="github" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.petName, { color: colors.textPrimary }]}>{petData.nome || 'Pet'}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.harnessbadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.harnessOnlineDot, { backgroundColor: isOnline ? colors.success : colors.error }]} />
            <Text style={[styles.harnessText, { color: colors.textSecondary }]}>
              Harness: {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Feather name="settings" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.error + '22', borderColor: colors.error }]}>
            <Feather name="wifi-off" size={14} color={colors.error} style={{ marginRight: 8 }} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statusRow}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('statusGlobal')}</Text>
              <Text style={[styles.statusValue, { color: loading ? colors.textSecondary : globalColor }]}>
                {/* Removido o .toLowerCase() para bater com a tradução exata */}
                {loading ? '...' : t(status.global)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('sincronizado')}</Text>
              <Text style={[styles.cardSubValue, { color: colors.textSecondary }]}>{t('ultimaAtualizacao')}</Text>
              <Text style={[styles.cardSubValue, { color: colors.textSecondary }]}>{lastUpdate}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.bpmRow}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('frequenciaCardiaca')}</Text>
              <View style={styles.bpmValueRow}>
                <Text style={[styles.bpmNumber, { color: colors.textPrimary }]}>
                  {loading ? '--' : bpm}
                </Text>
                <Text style={[styles.bpmUnit, { color: colors.textSecondary }]}> BPM</Text>
              </View>
            </View>
            <Text style={[styles.diffText, { color: Math.abs(diff) > 15 ? '#FFB74D' : colors.textSecondary }]}>
              {loading ? '' : diffText}
            </Text>
          </View>

          <View style={styles.graphContainer}>
            <MiniGraph data={history} strokeColor={colors.primary} />
            <View style={styles.graphLabels}>
              <Text style={[styles.graphLabel, { color: colors.textSecondary }]}>-60 MIN</Text>
              <Text style={[styles.graphLabel, { color: colors.textSecondary }]}>{t('agora').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.historyButton, { backgroundColor: colors.card, borderColor: colors.primary + '44' }]}
          onPress={() => navigation.navigate('Historico')}
        >
          <Feather name="clock" size={18} color={colors.primary} style={{ marginRight: 10 }} />
          <Text style={[styles.historyButtonText, { color: colors.textPrimary }]}>{t('verHistorico')}</Text>
          <Feather name="chevron-right" size={18} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <View style={[styles.iaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iaBadge, { backgroundColor: colors.primary + '11' }]}>
            <Text style={[styles.iaBadgeText, { color: colors.primary }]}>{t('iaEngine')}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('ResumoDetalhado')}>
            <Text style={[styles.iaTitle, { color: colors.textPrimary }]}>{t('atividadeInferida')}</Text>
            <Text style={[styles.iaSubtitle, { color: colors.textSecondary }]}>{t('resumoDetalhado')}</Text>
            <Text style={[styles.iaBody, { color: colors.textSecondary }]}>{t('resumoBody')}</Text>
          </TouchableOpacity>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1 },
  petName: { fontSize: 24, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  harnessbadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  harnessOnlineDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  harnessText: { fontSize: 12 },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  card: { borderRadius: SIZES.radius, padding: 16, borderWidth: 1 },
  cardLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusValue: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  cardSubValue: { fontSize: 12, textAlign: 'right' },
  bpmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  bpmValueRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  bpmNumber: { fontSize: 52, fontWeight: 'bold', lineHeight: 56 },
  bpmUnit: { fontSize: 16, marginBottom: 6 },
  diffText: { fontSize: 11, fontWeight: 'bold', textAlign: 'right', maxWidth: 130, lineHeight: 16, marginTop: 30 },
  graphContainer: { marginTop: 4 },
  graphLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  graphLabel: { fontSize: 10 },
  historyButton: { flexDirection: 'row', alignItems: 'center', borderRadius: SIZES.radius, padding: 16, borderWidth: 1 },
  historyButtonText: { fontSize: 15, fontWeight: '500' },
  iaCard: { borderRadius: SIZES.radius, padding: 16, borderWidth: 1, minHeight: 160 },
  iaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6 },
  iaBadgeText: { fontSize: 10, fontWeight: 'bold' },
  iaTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  iaSubtitle: { fontSize: 13, marginBottom: 8 },
  iaBody: { fontSize: 13, lineHeight: 20 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: SIZES.radius, borderWidth: 1, marginBottom: 4 },
  errorText: { fontSize: 13, fontWeight: '500' },
});