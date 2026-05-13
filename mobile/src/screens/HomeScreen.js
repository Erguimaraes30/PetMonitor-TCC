import React, { useState, useEffect, useRef, useContext } from 'react';
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

// 1. getStatus agora considera os limites dinâmicos do contexto
function getStatus(bpm, min, max) {
  if (bpm < min) return { label: 'BRADICARDIA', color: '#E57373', global: 'ALERTA' };
  if (bpm > max) return { label: 'TAQUICARDIA', color: '#E57373', global: 'ALERTA' };
  
  // Define uma zona de atenção (15% antes de atingir o limite máximo)
  const thresholdAtencao = max * 0.85;
  if (bpm > thresholdAtencao) return { label: 'ELEVADO', color: '#FFB74D', global: 'ATENÇÃO' };
  
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
      <Polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  // 2. Extraindo petData e alertSettings do Contexto
  const { petData, alertSettings } = useContext(DataContext);
  const { dark, colors } = useTheme();
  
  const [bpm, setBpm] = useState(82);
  const [history, setHistory] = useState(Array(MAX_POINTS).fill(82));
  const [lastUpdate, setLastUpdate] = useState('agora');
  const mediaRef = useRef(82);

  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(prev => {
        const variacao = Math.floor(Math.random() * 7) - 3;
        const novo = prev + variacao;
        // Simulação mantém o BPM em uma faixa plausível
        const final = (novo > 40 && novo < 220) ? novo : prev;

        setHistory(h => {
          const updated = [...h.slice(1), final];
          mediaRef.current = Math.round(updated.reduce((a, b) => a + b, 0) / updated.length);
          return updated;
        });

        setLastUpdate('agora');
        return final;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 3. Aplicando os limites dinâmicos para calcular o status
  const status = getStatus(bpm, alertSettings.bpmMin, alertSettings.bpmMax);
  const diff = bpm - mediaRef.current;
  const diffText = diff > 0 ? `+${diff} ${t('acimaDaMedia')}` : diff < 0 ? `${diff} ${t('abaixoDaMedia')}` : t('naMédia');
  
  const globalColor = status.global === 'NORMAL' ? colors.success : status.global === 'ATENÇÃO' ? '#FFB74D' : colors.error;

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
            <View style={[styles.harnessOnlineDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.harnessText, { color: colors.textSecondary }]}>{t('harnessOnline')}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Feather name="settings" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statusRow}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('statusGlobal')}</Text>
              {/* O rótulo agora responde aos limites do alertSettings */}
              <Text style={[styles.statusValue, { color: globalColor }]}>{t(status.global.toLowerCase())}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('sincronizado')}</Text>
              <Text style={[styles.cardSubValue, { color: colors.textSecondary }]}>{t('ultimaAtualizacao')}</Text>
              <Text style={[styles.cardSubValue, { color: colors.textSecondary }]}>{t(lastUpdate)}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.bpmRow}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('frequenciaCardiaca')}</Text>
              <View style={styles.bpmValueRow}>
                <Text style={[styles.bpmNumber, { color: colors.textPrimary }]}>{bpm}</Text>
                <Text style={[styles.bpmUnit, { color: colors.textSecondary }]}> BPM</Text>
              </View>
            </View>
            {/* Cor de destaque se estiver longe da média */}
            <Text style={[styles.diffText, { color: Math.abs(diff) > 15 ? '#FFB74D' : colors.textSecondary }]}>
              {diffText}
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

        {/* ... Restante do card de IA permanece igual ... */}
        <View style={[styles.iaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iaBadge, { backgroundColor: colors.primary + '11' }]}>
            <Text style={[styles.iaBadgeText, { color: colors.primary }]}>{t('iaEngine')}</Text>
          </View>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ResumoDetalhado')}
          >
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

// ... Estilos originais mantidos

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 55, paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10, borderWidth: 1
  },
  petName: { fontSize: 24, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  harnessbadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1
  },
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
  historyButton: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: SIZES.radius, padding: 16, borderWidth: 1
  },
  historyButtonText: { fontSize: 15, fontWeight: '500' },
  iaCard: { borderRadius: SIZES.radius, padding: 16, borderWidth: 1, minHeight: 160 },
  iaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6 },
  iaBadgeText: { fontSize: 10, fontWeight: 'bold' },
  iaTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  iaSubtitle: { fontSize: 13, marginBottom: 8 },
  iaBody: { fontSize: 13, lineHeight: 20 },
});