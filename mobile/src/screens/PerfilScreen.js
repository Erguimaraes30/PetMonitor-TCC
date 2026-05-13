import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Modal, TextInput
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { DataContext } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function PerfilScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, dark } = useTheme();
  
  // 1. Pegando alertSettings e a função de update do Contexto
  const { 
    tutorData, updateTutorData, 
    petData, updatePetData, 
    vetData, updateVetData,
    alertSettings, updateAlertSettings 
  } = useContext(DataContext);
  
  // Estados dos modais
  const [tutorModalVisible, setTutorModalVisible] = useState(false);
  const [vetModalVisible, setVetModalVisible] = useState(false);
  const [petModalVisible, setPetModalVisible] = useState(false);

  // Estados temporários para edição
  const [editTutor, setEditTutor] = useState(tutorData);
  const [editVet, setEditVet] = useState(vetData);
  const [editPet, setEditPet] = useState(petData);

  const openTutorModal = () => { setEditTutor(tutorData); setTutorModalVisible(true); };
  const openVetModal = () => { setEditVet(vetData); setVetModalVisible(true); };
  const openPetModal = () => { setEditPet(petData); setPetModalVisible(true); };

  const saveTutorData = () => { updateTutorData(editTutor); setTutorModalVisible(false); };
  const saveVetData = () => { updateVetData(editVet); setVetModalVisible(false); };
  const savePetData = () => { updatePetData(editPet); setPetModalVisible(false); };

  // 2. Função auxiliar para ajustar os limites de BPM globalmente
  const handleBpmUpdate = (key, value) => {
    updateAlertSettings({ [key]: value });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="github" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.petName, { color: colors.textPrimary }]}>{petData.nome || t('pet')}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Feather name="settings" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Dados do Tutor - Sem alterações na lógica */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('dadosTutor').toUpperCase()}</Text>
            <TouchableOpacity onPress={openTutorModal}>
              <Feather name="edit-2" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('nomeCompleto').toUpperCase()}</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{tutorData.nome || t('naoPreenchido')}</Text>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('contato').toUpperCase()}</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{tutorData.whatsapp || t('naoPreenchido')}</Text>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('email').toUpperCase()}</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{tutorData.email || t('naoPreenchido')}</Text>
          </View>
        </View>

        {/* Dados do Veterinário - Sem alterações na lógica */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('dadosVeterinario').toUpperCase()}</Text>
            <TouchableOpacity onPress={openVetModal}>
              <Feather name="edit-2" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('nomeCompleto').toUpperCase()}</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{vetData.nome || t('naoPreenchido')}</Text>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('email').toUpperCase()}</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{vetData.email || t('naoPreenchido')}</Text>
          </View>
        </View>

        {/* Dados do Pet */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('dadosPet').toUpperCase()}</Text>
            <TouchableOpacity onPress={openPetModal}>
              <Feather name="edit-3" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.petRow}>
            <View style={[styles.petAvatar, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="github" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.petName2, { color: colors.textPrimary }]}>{petData.nome || t('naoPreenchido')}</Text>
              <Text style={[styles.petBreed, { color: colors.textSecondary }]}>
                {petData.raca ? `${petData.raca} • ${petData.idade} ${t('anos')}` : t('naoPreenchido')}
              </Text>
            </View>
          </View>
        </View>

        {/* Limites de Alerta - INTEGRADO COM CONTEXTO */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.limiteTitleRow}>
              <Feather name="bar-chart-2" size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('limitesAlertaBpm').toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.limiteRow}>
            <View style={styles.limiteInfo}>
              <Text style={[styles.limiteTitle, { color: colors.textPrimary }]}>{t('bpmMinimo')}</Text>
              <Text style={[styles.limiteSubtitle, { color: colors.textSecondary }]}>{t('alertaAbaixo')}</Text>
            </View>
            <View style={[styles.counter, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TouchableOpacity 
                style={styles.counterBtn} 
                onPress={() => handleBpmUpdate('bpmMin', Math.max(40, alertSettings.bpmMin - 1))}
              >
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.counterValue, { color: colors.textPrimary }]}>{alertSettings.bpmMin}</Text>
              <TouchableOpacity 
                style={styles.counterBtn} 
                onPress={() => handleBpmUpdate('bpmMin', Math.min(alertSettings.bpmMax - 1, alertSettings.bpmMin + 1))}
              >
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.limiteRow}>
            <View style={styles.limiteInfo}>
              <Text style={[styles.limiteTitle, { color: colors.textPrimary }]}>{t('bpmMaximo')}</Text>
              <Text style={[styles.limiteSubtitle, { color: colors.textSecondary }]}>{t('alertaAcima')}</Text>
            </View>
            <View style={[styles.counter, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TouchableOpacity 
                style={styles.counterBtn} 
                onPress={() => handleBpmUpdate('bpmMax', Math.max(alertSettings.bpmMin + 1, alertSettings.bpmMax - 1))}
              >
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.counterValue, { color: colors.textPrimary }]}>{alertSettings.bpmMax}</Text>
              <TouchableOpacity 
                style={styles.counterBtn} 
                onPress={() => handleBpmUpdate('bpmMax', Math.min(220, alertSettings.bpmMax + 1))}
              >
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modais permanecem os mesmos, mas editTutor/editPet/editVet já usam os dados do contexto */}
      {/* ... (Seu código de Modais continua aqui sem alterações necessárias) ... */}
    </View>
  );
}


// ... Estilos permanecem os mesmos
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
    marginRight: 10, borderWidth: 1,
  },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  card: { borderRadius: SIZES.radius, padding: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  field: { marginBottom: 10 },
  fieldLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  fieldValue: { fontSize: 15, fontWeight: '500' },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  petAvatar: {
    width: 48, height: 48, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  petName: { fontSize: 24, fontWeight: 'bold' },
  petName2: { fontSize: 16, fontWeight: 'bold' },
  petBreed: { fontSize: 13, marginTop: 2 },
  limiteTitleRow: { flexDirection: 'row', alignItems: 'center' },
  limiteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  limiteInfo: { flex: 1 },
  limiteTitle: { fontSize: 15, fontWeight: '500' },
  limiteSubtitle: { fontSize: 12, marginTop: 2 },
  counter: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  counterBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  counterBtnText: { fontSize: 18, fontWeight: 'bold' },
  counterValue: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 12 },
  divider: { height: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  modalContent: { borderRadius: SIZES.radius, borderWidth: 1, width: '100%', maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  modalForm: { padding: 16, maxHeight: '60%' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14 },
  row: { flexDirection: 'row', gap: 0 },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1 },
  buttonSecondary: { flex: 1, paddingVertical: 12, borderWidth: 1, borderRadius: SIZES.radius, alignItems: 'center' },
  buttonSecondaryText: { fontSize: 14, fontWeight: 'bold' },
  buttonPrimary: { flex: 1, paddingVertical: 12, borderRadius: SIZES.radius, alignItems: 'center' },
  buttonPrimaryText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
});