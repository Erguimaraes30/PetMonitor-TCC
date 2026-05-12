import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Modal, TextInput
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { DataContext } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext'; // Importe o hook de tema

export default function PerfilScreen({ navigation }) {
  const { colors, dark } = useTheme();
  const { tutorData, updateTutorData, petData, updatePetData, vetData, updateVetData } = useContext(DataContext);
  
  const [bpmMin, setBpmMin] = useState(60);
  const [bpmMax, setBpmMax] = useState(140);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="github" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.petName, { color: colors.textPrimary }]}>{petData.nome || 'Pet'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Feather name="settings" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Dados do Tutor */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>DADOS DO TUTOR</Text>
            <TouchableOpacity onPress={openTutorModal}>
              <Feather name="edit-2" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>NOME COMPLETO</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{tutorData.nome || 'Não preenchido'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>CONTATO</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{tutorData.whatsapp || 'Não preenchido'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>E-MAIL</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{tutorData.email || 'Não preenchido'}</Text>
          </View>
        </View>

        {/* Dados do Veterinário */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>DADOS DO VETERINÁRIO</Text>
            <TouchableOpacity onPress={openVetModal}>
              <Feather name="edit-2" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>NOME COMPLETO</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{vetData.nome || 'Não preenchido'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>E-MAIL</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{vetData.email || 'Não preenchido'}</Text>
          </View>
        </View>

        {/* Dados do Pet */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>DADOS DO PET</Text>
            <TouchableOpacity onPress={openPetModal}>
              <Feather name="edit-3" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.petRow}>
            <View style={[styles.petAvatar, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="github" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.petName2, { color: colors.textPrimary }]}>{petData.nome || 'Não preenchido'}</Text>
              <Text style={[styles.petBreed, { color: colors.textSecondary }]}>
                {petData.raca ? `${petData.raca} • ${petData.idade} anos` : 'Não preenchido'}
              </Text>
            </View>
          </View>
        </View>

        {/* Limites de Alerta */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.limiteTitleRow}>
              <Feather name="bar-chart-2" size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>LIMITES DE ALERTA (BPM)</Text>
            </View>
          </View>

          <View style={styles.limiteRow}>
            <View style={styles.limiteInfo}>
              <Text style={[styles.limiteTitle, { color: colors.textPrimary }]}>BPM Mínimo</Text>
              <Text style={[styles.limiteSubtitle, { color: colors.textSecondary }]}>Alerta abaixo deste valor</Text>
            </View>
            <View style={[styles.counter, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setBpmMin(v => Math.max(40, v - 1))}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.counterValue, { color: colors.textPrimary }]}>{bpmMin}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setBpmMin(v => Math.min(bpmMax - 1, v + 1))}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.limiteRow}>
            <View style={styles.limiteInfo}>
              <Text style={[styles.limiteTitle, { color: colors.textPrimary }]}>BPM Máximo</Text>
              <Text style={[styles.limiteSubtitle, { color: colors.textSecondary }]}>Alerta acima deste valor</Text>
            </View>
            <View style={[styles.counter, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setBpmMax(v => Math.max(bpmMin + 1, v - 1))}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.counterValue, { color: colors.textPrimary }]}>{bpmMax}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setBpmMax(v => Math.min(220, v + 1))}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Reutilize a estrutura de Modal para Tutor, Vet e Pet conforme seu código, 
          apenas trocando as cores estáticas por colors.card, colors.textPrimary, etc. */}
      <Modal visible={tutorModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>EDITAR DADOS DO TUTOR</Text>
              <TouchableOpacity onPress={() => setTutorModalVisible(false)}>
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>NOME COMPLETO</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                  value={editTutor.nome}
                  onChangeText={(text) => setEditTutor({...editTutor, nome: text})}
                />
              </View>
              {/* Repita o padrão para Whatsapp e Email... */}
            </View>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity style={[styles.buttonSecondary, { borderColor: colors.border }]} onPress={() => setTutorModalVisible(false)}>
                <Text style={[styles.buttonSecondaryText, { color: colors.textPrimary }]}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: colors.primary }]} onPress={saveTutorData}>
                <Text style={styles.buttonPrimaryText}>SALVAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalForm: { padding: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14 },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1 },
  buttonSecondary: { flex: 1, paddingVertical: 12, borderWidth: 1, borderRadius: SIZES.radius, alignItems: 'center' },
  buttonSecondaryText: { fontSize: 14, fontWeight: 'bold' },
  buttonPrimary: { flex: 1, paddingVertical: 12, borderRadius: SIZES.radius, alignItems: 'center' },
  buttonPrimaryText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
});