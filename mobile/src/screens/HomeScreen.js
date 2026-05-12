import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import Svg, { Polyline, Line, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 48;
const GRAPH_HEIGHT = 80;
const MAX_POINTS = 30;

function getStatus(bpm) {
  if (bpm < 60) return { label: 'BRADICARDIA', color: '#E57373', global: 'ALERTA' };
  if (bpm > 140) return { label: 'TAQUICARDIA', color: '#E57373', global: 'ALERTA' };
  if (bpm > 120) return { label: 'ELEVADO', color: '#FFB74D', global: 'ATENÇÃO' };
  return { label: 'NORMAL', color: COLORS.success, global: 'NORMAL' };
}

function MiniGraph({ data }) {
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
        stroke={COLORS.primary}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function HomeScreen({ navigation }) {
  const [bpm, setBpm] = useState(82);
  const [history, setHistory] = useState(Array(MAX_POINTS).fill(82));
  const [lastUpdate, setLastUpdate] = useState('agora');
  const mediaRef = useRef(82);

  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(prev => {
        const variacao = Math.floor(Math.random() * 7) - 3;
        const novo = prev + variacao;
        const final = (novo > 55 && novo < 150) ? novo : prev;

        setHistory(h => {
          const updated = [...h.slice(1), final];
          const avg = Math.round(updated.reduce((a, b) => a + b, 0) / updated.length);
          mediaRef.current = avg;
          return updated;
        });

        setLastUpdate('agora');
        return final;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const status = getStatus(bpm);
  const diff = bpm - mediaRef.current;
  const diffText = diff > 0 ? `+${diff} BPM ACIMA DA MÉDIA` : diff < 0 ? `${diff} BPM ABAIXO DA MÉDIA` : 'NA MÉDIA';
  const globalColor = status.global === 'NORMAL' ? COLORS.success : status.global === 'ATENÇÃO' ? '#FFB74D' : '#E57373';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Feather name="user" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.petName}>Max</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.harnessbadge}>
            <View style={styles.harnessOnlineDot} />
            <Text style={styles.harnessText}>Harness: Online</Text>
          </View>
          <TouchableOpacity>
            <Feather name="settings" size={22} color={COLORS.textSecondary} 
            onPress={() => navigation.navigate('Settings')}/>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Card Status Global */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.cardLabel}>STATUS GLOBAL</Text>
              <Text style={[styles.statusValue, { color: globalColor }]}>{status.global}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardLabel}>SINCRONIZADO</Text>
              <Text style={styles.cardSubValue}>Última atualização:</Text>
              <Text style={styles.cardSubValue}>{lastUpdate}</Text>
            </View>
          </View>
        </View>

        {/* Card BPM + Gráfico */}
        <View style={styles.card}>
          <View style={styles.bpmRow}>
            <View>
              <Text style={styles.cardLabel}>FREQUÊNCIA{'\n'}CARDÍACA</Text>
              <View style={styles.bpmValueRow}>
                <Text style={styles.bpmNumber}>{bpm}</Text>
                <Text style={styles.bpmUnit}> BPM</Text>
              </View>
            </View>
            <Text style={[styles.diffText, { color: diff > 10 ? '#FFB74D' : COLORS.textSecondary }]}>
              {diffText}
            </Text>
          </View>

          <View style={styles.graphContainer}>
            <MiniGraph data={history} />
            <View style={styles.graphLabels}>
              <Text style={styles.graphLabel}>-60 MIN</Text>
              <Text style={styles.graphLabel}>AGORA</Text>
            </View>
          </View>
        </View>

        {/* Botão Histórico */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('Historico')}
        >
          <Feather name="clock" size={18} color={COLORS.primary} style={{ marginRight: 10 }} />
          <Text style={styles.historyButtonText}>Ver Histórico Detalhado</Text>
          <Feather name="chevron-right" size={18} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Card IA Engine */}
        <View style={styles.iaCard}>
          <View style={styles.iaBadge}>
            <Text style={styles.iaBadgeText}>IA ENGINE</Text>
          </View>
          <TouchableOpacity style={styles.iaCard}
          onPress={() => navigation.navigate('ResumoDetalhado')}
            >
              <Text style={styles.iaTitle}>ATIVIDADE (Inferida)</Text>
              <Text style={styles.iaSubtitle}>Resumo Detalhado</Text>
              <Text style={styles.iaBody}>
               Baseado nos batimentos cardíacos do seu pet, aqui está um resumo detalhado de como foi o mês do seu animalzinho.
              </Text>
           </TouchableOpacity>
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
    backgroundColor: COLORS.background,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
    marginRight: 10, borderWidth: 1, borderColor: COLORS.border
  },
  petName: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  harnessbadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border
  },
  harnessOnlineDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: COLORS.success, marginRight: 6
  },
  harnessText: { color: COLORS.textSecondary, fontSize: 12 },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  card: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: 16, borderWidth: 1, borderColor: COLORS.border
  },
  cardLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusValue: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  cardSubValue: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'right' },
  bpmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  bpmValueRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  bpmNumber: { color: COLORS.textPrimary, fontSize: 52, fontWeight: 'bold', lineHeight: 56 },
  bpmUnit: { color: COLORS.textSecondary, fontSize: 16, marginBottom: 6 },
  diffText: { fontSize: 11, fontWeight: 'bold', textAlign: 'right', maxWidth: 130, lineHeight: 16, marginTop: 30 },
  graphContainer: { marginTop: 4 },
  graphLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  graphLabel: { color: COLORS.textSecondary, fontSize: 10 },
  historyButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: 16, borderWidth: 1, borderColor: COLORS.primary + '44'
  },
  historyButtonText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  iaCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, minHeight: 160
  },
  iaBadge: {
    backgroundColor: 'rgba(176,196,255,0.1)', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6
  },
  iaBadgeText: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold' },
  iaTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  iaSubtitle: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 8 },
  iaBody: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
});