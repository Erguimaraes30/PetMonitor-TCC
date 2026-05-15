import React, { useState, useContext, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { DataContext } from '../context/DataContext';

const formatarHoraReal = (timestamp, t) => {
  if (!timestamp) return '--:--';
  try {
    const dataAlerta = new Date(timestamp);
    const agora = new Date();
    const diffDias = Math.floor((agora - dataAlerta) / (1000 * 60 * 60 * 24));
    const horaFormatada = dataAlerta.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (diffDias === 0) return `${t('hoje')}, ${horaFormatada}`;
    if (diffDias === 1) return `${t('ontem')}, ${horaFormatada}`;
    return `${diffDias} ${t('diasAtras')}, ${horaFormatada}`;
  } catch (e) {
    return '--:--';
  }
};

function tipoConfig(tipo, t) {
  const tipoUpper = tipo?.toUpperCase();
  switch (tipoUpper) {
    case 'TAQUICARDIA':
      return { color: '#E57373', bg: 'rgba(229,115,115,0.1)', icon: 'trending-up', label: t('taquicardia') };
    case 'BRADICARDIA':
      return { color: '#64B5F6', bg: 'rgba(100,181,246,0.1)', icon: 'trending-down', label: t('bradicardia') };
    default:
      return { color: '#FFB74D', bg: 'rgba(255,183,77,0.1)', icon: 'activity', label: t('anomalia') };
  }
}

export default function AlertasScreen({ navigation }) {
  const { t } = useTranslation();
  const { dark, colors } = useTheme();
  
  // fetchAlerts deve estar exposto no seu DataContext para podermos chamar aqui
  const { alerts = [], markAllAsRead, loadingAlerts, fetchAlerts } = useContext(DataContext);

  // EFEITO DE ATUALIZAÇÃO AUTOMÁTICA (Polling)
  useEffect(() => {
    // Busca imediata ao abrir a tela
    if (fetchAlerts) fetchAlerts();

    // Atualiza a cada 5 segundos para "pegar" o que o script de simulação enviar
    const interval = setInterval(() => {
      if (fetchAlerts) fetchAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const alertasHoje = useMemo(() => {
    return (alerts || []).filter(a => {
      if (!a.timestamp) return false;
      const data = new Date(a.timestamp);
      return data.toDateString() === new Date().toDateString();
    }).length;
  }, [alerts]);

  const naoLidos = (alerts || []).filter(a => !a.lido).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('logAlertas')}</Text>
          {naoLidos > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{naoLidos}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          onPress={() => {
            if (markAllAsRead) markAllAsRead();
          }} 
          activeOpacity={0.7}
        >
          <Feather name="check-square" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('alertas24h').toUpperCase()}</Text>
          <Text style={[styles.summaryValue, { color: '#E57373' }]}>
            {alertasHoje.toString().padStart(2, '0')}
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
        {loadingAlerts && alerts.length === 0 ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (alerts && alerts.length > 0) ? (
          alerts.map((alerta, index) => {
            const config = tipoConfig(alerta.tipo, t);
            return (
              <TouchableOpacity
                key={alerta.id || alerta._id || index}
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

                <Text style={[styles.alertHora, { color: colors.textSecondary }]}>
                  {formatarHoraReal(alerta.timestamp, t)}
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
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={40} color={colors.border} />
            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Nenhum alerta registrado</Text>
          </View>
        )}

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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 55, paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  badge: { backgroundColor: '#E57373', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 8 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1, justifyContent: 'center' },
  statusBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  summaryLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 6 },
  summaryValue: { fontSize: 28, fontWeight: 'bold' },
  scroll: { padding: 20, gap: 12, paddingBottom: 30 },
  alertCard: { borderRadius: 16, padding: 16, borderWidth: 1, position: 'relative', overflow: 'hidden', marginBottom: 10 },
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
    borderRightWidth: 20, borderTopWidth: 20,
    borderRightColor: 'transparent', borderTopColor: '#E57373',
    transform: [{ rotate: '90deg' }]
  },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  footerContainer: { marginTop: 10, alignItems: 'center', gap: 10 },
  footer: { fontSize: 12 },
  verMais: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
});