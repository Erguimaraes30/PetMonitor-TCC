import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Switch
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { DataContext } from '../context/DataContext';

export default function PerfilScreen({ navigation }) {
  const { tutorData, petData, vetData } = useContext(DataContext);
  const [bpmMin, setBpmMin] = useState(60);
  const [bpmMax, setBpmMax] = useState(140);
  const [emailAlertas, setEmailAlertas] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Feather name="github" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.petName}>{petData.nome || 'Pet'}</Text>
        </View>
        <TouchableOpacity>
          <Feather name="settings" size={22} color={COLORS.textSecondary} 
          onPress={() => navigation.navigate('Settings')}/>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Dados do Tutor */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>DADOS DO TUTOR</Text>
            <TouchableOpacity>
              <Feather name="edit-2" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>NOME COMPLETO</Text>
            <Text style={styles.fieldValue}>{tutorData.nome || 'Não preenchido'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>CONTATO</Text>
            <Text style={styles.fieldValue}>{tutorData.whatsapp || 'Não preenchido'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>E-MAIL</Text>
            <Text style={styles.fieldValue}>{tutorData.email || 'Não preenchido'}</Text>
          </View>
        </View>

        {/* Dados do Veterinário */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>DADOS DO VETERINÁRIO</Text>
            <TouchableOpacity>
              <Feather name="edit-2" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>NOME COMPLETO</Text>
            <Text style={styles.fieldValue}>{vetData.nome || 'Não preenchido'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>E-MAIL</Text>
            <Text style={styles.fieldValue}>{vetData.email || 'Não preenchido'}</Text>
          </View>
        </View>

        {/* Dados do Pet */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>DADOS DO PET</Text>
            <TouchableOpacity>
              <Feather name="edit-3" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.petRow}>
            <View style={styles.petAvatar}>
              <Feather name="github" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.petName2}>{petData.nome || 'Não preenchido'}</Text>
              <Text style={styles.petBreed}>{petData.raca ? `${petData.raca} • ${petData.idade} anos` : 'Não preenchido'}</Text>
            </View>
          </View>
        </View>
        

        {/* Limites de Alerta */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.limiteTitleRow}>
              <Feather name="bar-chart-2" size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.cardLabel}>LIMITES DE ALERTA (BPM)</Text>
            </View>
          </View>

          {/* BPM Mínimo */}
          <View style={styles.limiteRow}>
            <View style={styles.limiteInfo}>
              <Text style={styles.limiteTitle}>BPM Mínimo</Text>
              <Text style={styles.limiteSubtitle}>Alerta abaixo deste valor</Text>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setBpmMin(v => Math.max(40, v - 1))}
              >
                <Text style={styles.counterBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{bpmMin}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setBpmMin(v => Math.min(bpmMax - 1, v + 1))}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* BPM Máximo */}
          <View style={styles.limiteRow}>
            <View style={styles.limiteInfo}>
              <Text style={styles.limiteTitle}>BPM Máximo</Text>
              <Text style={styles.limiteSubtitle}>Alerta acima deste valor</Text>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setBpmMax(v => Math.max(bpmMin + 1, v - 1))}
              >
                <Text style={styles.counterBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{bpmMax}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setBpmMax(v => Math.min(220, v + 1))}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
    marginRight: 10, borderWidth: 1, borderColor: COLORS.border
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold' },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  card: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  field: { marginBottom: 10 },
  fieldLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  fieldValue: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  petAvatar: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  petName: { color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' },
  petName2: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold' },
  petBreed: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  limiteTitleRow: { flexDirection: 'row', alignItems: 'center' },
  limiteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  limiteInfo: { flex: 1 },
  limiteTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  limiteSubtitle: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  counter: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  counterBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  counterBtnText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  counterValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', paddingHorizontal: 12 },
  divider: { height: 1, backgroundColor: COLORS.border },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  notifIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: 'rgba(76,175,80,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  notifInfo: { flex: 1 },
  notifTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  notifSubtitle: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
 
});