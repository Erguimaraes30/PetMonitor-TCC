import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const MOCK_ALERTAS = [
  { id: 1, tipo: 'TAQUICARDIA', bpm: 155, hora: 'Hoje, 14:32', sentToVet: true, lido: true },
  { id: 2, tipo: 'ANOMALIA', bpm: 118, hora: 'Hoje, 09:15', sentToVet: false, lido: true },
  { id: 3, tipo: 'TAQUICARDIA', bpm: 148, hora: 'Ontem, 22:10', sentToVet: true, lido: false },
  { id: 4, tipo: 'BRADICARDIA', bpm: 52, hora: 'Ontem, 18:45', sentToVet: true, lido: false },
  { id: 5, tipo: '3 dias atrás, 11:20', bpm: 141, hora: '3 dias atrás, 11:20', sentToVet: false, lido: true },
  { id: 6, tipo: 'ANOMALIA', bpm: 105, hora: '5 dias atrás, 08:00', sentToVet: true, lido: true },
];

// FUNÇÃO PARA TRADUZIR O TEMPO DO MOCK
const formatarHoraMock = (horaStr, t) => {
  if (horaStr.includes('Hoje')) return horaStr.replace('Hoje', t('hoje'));
  if (horaStr.includes('Ontem')) return horaStr.replace('Ontem', t('ontem'));
  if (horaStr.includes('dias atrás')) return horaStr.replace('dias atrás', t('diasAtras'));
  return horaStr;
};

function tipoConfig(tipo, t) {
  switch (tipo) {
    case 'TAQUICARDIA':
      return { color: '#E57373', bg: 'rgba(229,115,115,0.1)', icon: 'trending-up', label: t('taquicardia') };
    case 'BRADICARDIA':
      return { color: '#E57373', bg: 'rgba(229,115,115,0.1)', icon: 'trending-down', label: t('bradicardia') };
    default:
      return { color: '#FFB74D', bg: 'rgba(255,183,77,0.1)', icon: 'activity', label: t('anomalia') };
  }
}

export default function AlertasScreen({ navigation }) {
  const { t } = useTranslation();
  const { dark, colors } = useTheme();
  const [alertas, setAlertas] = useState(MOCK_ALERTAS);

  const naoLidos = alertas.filter(a => !a.lido).length;

  function marcarTodosLidos() {
    setAlertas(prev => prev.map(a => ({ ...a, lido: true })));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('logAlertas')}</Text>
          {naoLidos > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{naoLidos}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={marcarTodosLidos} activeOpacity={0.7}>
          <Feather name="check-square" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Resumo Rápido */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('alertas24h').toUpperCase()}</Text>
          <Text style={[styles.summaryValue, { color: '#E57373' }]}>
            {alertas.filter(a => a.hora.includes('Hoje')).length.toString().padStart(2, '0')}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('statusSistema').toUpperCase()}</Text>
          <View style={styles.statusBadgeRow}>
             <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
             <Text style={[styles.summaryValue, { color: colors.success, fontSize: 16 }]}>{t('ativo')}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {alertas.map((alerta) => {
          const config = tipoConfig(alerta.tipo, t);
          return (
            <TouchableOpacity
              key={alerta.id}
              activeOpacity={0.9}
              style={[
                styles.alertCard, 
                { backgroundColor: colors.card, borderColor: colors.border },
                !alerta.lido && { borderColor: '#E57373', borderLeftWidth: 4 }
              ]}
            >
              <View style={styles.alertTop}>
                <View style={[styles.tipoBadge, { backgroundColor: config.bg }]}>
                  <Feather name={config.icon} size={12} color={config.color} style={{ marginRight: 4 }} />
                  <Text style={[styles.tipoText, { color: config.color }]}>{config.label}</Text>
                </View>
                
                {alerta.sentToVet ? (
                  <View style={styles.sentToVet}>
                    <Feather name="send" size={11} color={colors.success} style={{ marginRight: 4 }} />
                    <Text style={[styles.sentToVetText, { color: colors.success }]}>{t('enviadoVet')}</Text>
                  </View>
                ) : (
                  <View style={styles.arquivado}>
                    <Feather name="archive" size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.arquivadoText, { color: colors.textSecondary }]}>{t('arquivado')}</Text>
                  </View>
                )}
              </View>

              {/* HORA TRADUZIDA AQUI */}
              <Text style={[styles.alertHora, { color: colors.textSecondary }]}>
                {formatarHoraMock(alerta.hora, t)}
              </Text>

              <View style={styles.alertBottom}>
                <Text style={[styles.alertLabel, { color: colors.textSecondary }]}>{t('frequenciaCardiaca').toUpperCase()}</Text>
                <View style={styles.bpmRow}>
                  <Text style={[styles.alertBpm, { color: config.color }]}>{alerta.bpm}</Text>
                  <Text style={[styles.alertBpmUnit, { color: colors.textSecondary }]}> BPM</Text>
                  
                  <View style={[styles.bpmBar, { backgroundColor: colors.border }]}>
                    <View style={[
                      styles.bpmBarFill,
                      { width: `${Math.min((alerta.bpm / 200) * 100, 100)}%`, backgroundColor: config.color }
                    ]} />
                  </View>
                </View>
              </View>

              {!alerta.lido && <View style={styles.unreadIndicator} />}
            </TouchableOpacity>
          );
        })}

        <View style={styles.footerContainer}>
            <Text style={[styles.footer, { color: colors.textSecondary }]}>{t('fimRegistro')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Historico')}>
              <Text style={[styles.verMais, { color: colors.primary }]}>{t('verHistoricoCompleto').toUpperCase()}</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ... (seus estilos permanecem os mesmos)
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 55, paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  badge: { backgroundColor: '#E57373', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: SIZES.padding, gap: 12, marginBottom: 8 },
  summaryCard: { flex: 1, borderRadius: SIZES.radius, padding: 14, borderWidth: 1, justifyContent: 'center' },
  statusBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  summaryLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 6 },
  summaryValue: { fontSize: 28, fontWeight: 'bold' },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  alertCard: { borderRadius: SIZES.radius, padding: 16, borderWidth: 1, position: 'relative', overflow: 'hidden' },
  alertTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tipoBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tipoText: { fontSize: 11, fontWeight: 'bold' },
  sentToVet: { flexDirection: 'row', alignItems: 'center' },
  sentToVetText: { fontSize: 11, fontWeight: 'bold' },
  arquivado: { flexDirection: 'row', alignItems: 'center' },
  arquivadoText: { fontSize: 11 },
  alertHora: { fontSize: 12, marginBottom: 12 },
  alertLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  bpmRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  alertBpm: { fontSize: 36, fontWeight: 'bold', lineHeight: 40 },
  alertBpmUnit: { fontSize: 14, marginBottom: 4 },
  bpmBar: { flex: 1, height: 6, borderRadius: 3, marginBottom: 8, marginLeft: 8 },
  bpmBarFill: { height: 6, borderRadius: 3 },
  unreadIndicator: {
    position: 'absolute', top: 0, right: 0,
    width: 0, height: 0,
    borderStyle: 'solid',
    borderRightWidth: 20,
    borderTopWidth: 20,
    borderRightColor: 'transparent',
    borderTopColor: '#E57373',
    transform: [{ rotate: '90deg' }]
  },
  footerContainer: { marginTop: 10, alignItems: 'center', gap: 10 },
  footer: { fontSize: 12 },
  verMais: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
});