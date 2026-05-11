import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const MOCK_ALERTAS = [
  {
    id: 1,
    tipo: 'TAQUICARDIA',
    bpm: 155,
    hora: 'Hoje, 14:32',
    sentToVet: true,
    lido: true,
  },
  {
    id: 2,
    tipo: 'ANOMALIA DE RITMO',
    bpm: 118,
    hora: 'Hoje, 09:15',
    sentToVet: false,
    lido: true,
  },
  {
    id: 3,
    tipo: 'TAQUICARDIA',
    bpm: 148,
    hora: 'Ontem, 22:10',
    sentToVet: true,
    lido: false,
  },
  {
    id: 4,
    tipo: 'BRADICARDIA',
    bpm: 52,
    hora: 'Ontem, 18:45',
    sentToVet: true,
    lido: false,
  },
  {
    id: 5,
    tipo: 'TAQUICARDIA',
    bpm: 141,
    hora: '3 dias atrás, 11:20',
    sentToVet: false,
    lido: true,
  },
  {
    id: 6,
    tipo: 'ANOMALIA DE RITMO',
    bpm: 105,
    hora: '5 dias atrás, 08:00',
    sentToVet: true,
    lido: true,
  },
];

function tipoConfig(tipo) {
  switch (tipo) {
    case 'TAQUICARDIA':
      return { color: '#E57373', bg: 'rgba(229,115,115,0.1)', icon: 'trending-up' };
    case 'BRADICARDIA':
      return { color: '#E57373', bg: 'rgba(229,115,115,0.1)', icon: 'trending-down' };
    default:
      return { color: '#FFB74D', bg: 'rgba(255,183,77,0.1)', icon: 'activity' };
  }
}

export default function AlertasScreen({ navigation }) {
  const [alertas, setAlertas] = useState(MOCK_ALERTAS);

  const naoLidos = alertas.filter(a => !a.lido).length;

  function marcarTodosLidos() {
    setAlertas(prev => prev.map(a => ({ ...a, lido: true })));
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Log de Alertas</Text>
          {naoLidos > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{naoLidos}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={marcarTodosLidos}>
          <Feather name="check-square" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Cards de resumo */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>ALERTAS 24H</Text>
          <Text style={[styles.summaryValue, { color: '#E57373' }]}>
            {alertas.filter(a => a.hora.startsWith('Hoje')).length.toString().padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>STATUS SISTEMA</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success, fontSize: 16 }]}>Ativo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {alertas.map((alerta) => {
          const config = tipoConfig(alerta.tipo);
          return (
            <View
              key={alerta.id}
              style={[styles.alertCard, !alerta.lido && styles.alertCardUnread]}
            >
              <View style={styles.alertTop}>
                <View style={[styles.tipoBadge, { backgroundColor: config.bg }]}>
                  <Feather name={config.icon} size={12} color={config.color} style={{ marginRight: 4 }} />
                  <Text style={[styles.tipoText, { color: config.color }]}>{alerta.tipo}</Text>
                </View>
                {alerta.sentToVet ? (
                  <View style={styles.sentToVet}>
                    <Feather name="send" size={11} color={COLORS.success} style={{ marginRight: 4 }} />
                    <Text style={styles.sentToVetText}>Sent to Vet</Text>
                  </View>
                ) : (
                  <View style={styles.arquivado}>
                    <Feather name="archive" size={11} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.arquivadoText}>Arquivado</Text>
                  </View>
                )}
              </View>

              <Text style={styles.alertHora}>{alerta.hora}</Text>

              <View style={styles.alertBottom}>
                <Text style={styles.alertLabel}>FREQUÊNCIA CARDÍACA</Text>
                <View style={styles.bpmRow}>
                  <Text style={[styles.alertBpm, { color: config.color }]}>{alerta.bpm}</Text>
                  <Text style={styles.alertBpmUnit}> BPM</Text>
                  <View style={styles.bpmBar}>
                    <View style={[
                      styles.bpmBarFill,
                      { width: `${Math.min((alerta.bpm / 160) * 100, 100)}%`, backgroundColor: config.color }
                    ]} />
                  </View>
                </View>
              </View>

              {!alerta.lido && <View style={styles.unreadDot} />}
            </View>
          );
        })}

        <Text style={styles.footer}>Fim do registro dos últimos 7 dias.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Historico')}>
          <Text style={styles.verMais}>VER HISTÓRICO COMPLETO</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 55, paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold' },
  badge: { backgroundColor: '#E57373', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: SIZES.padding, gap: 12, marginBottom: 8 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 6 },
  summaryValue: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold' },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  alertCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, position: 'relative',
  },
  alertCardUnread: { borderColor: 'rgba(229,115,115,0.3)', backgroundColor: 'rgba(229,115,115,0.04)' },
  alertTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tipoBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tipoText: { fontSize: 11, fontWeight: 'bold' },
  sentToVet: { flexDirection: 'row', alignItems: 'center' },
  sentToVetText: { color: COLORS.success, fontSize: 11, fontWeight: 'bold' },
  arquivado: { flexDirection: 'row', alignItems: 'center' },
  arquivadoText: { color: COLORS.textSecondary, fontSize: 11 },
  alertHora: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 12 },
  alertLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  alertBottom: {},
  bpmRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  alertBpm: { fontSize: 36, fontWeight: 'bold', lineHeight: 40 },
  alertBpmUnit: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 4 },
  bpmBar: { flex: 1, height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 6, marginLeft: 8 },
  bpmBarFill: { height: 4, borderRadius: 2 },
  unreadDot: {
    position: 'absolute', top: 14, right: 14,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#E57373',
  },
  footer: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 8 },
  verMais: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginTop: 8, letterSpacing: 1 },
});