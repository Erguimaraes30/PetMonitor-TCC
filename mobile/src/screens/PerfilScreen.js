import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Switch, Modal, TextInput
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { DataContext } from '../context/DataContext';

export default function PerfilScreen({ navigation }) {
  const { tutorData, updateTutorData, petData, updatePetData, vetData, updateVetData } = useContext(DataContext);
  const [bpmMin, setBpmMin] = useState(60);
  const [bpmMax, setBpmMax] = useState(140);
  const [emailAlertas, setEmailAlertas] = useState(true);

  // Estados dos modais
  const [tutorModalVisible, setTutorModalVisible] = useState(false);
  const [vetModalVisible, setVetModalVisible] = useState(false);
  const [petModalVisible, setPetModalVisible] = useState(false);

  // Estados temporários para edição
  const [editTutor, setEditTutor] = useState(tutorData);
  const [editVet, setEditVet] = useState(vetData);
  const [editPet, setEditPet] = useState(petData);

  // Funções para abrir modais
  const openTutorModal = () => {
    setEditTutor(tutorData);
    setTutorModalVisible(true);
  };
  const openVetModal = () => {
    setEditVet(vetData);
    setVetModalVisible(true);
  };
  const openPetModal = () => {
    setEditPet(petData);
    setPetModalVisible(true);
  };

  // Funções para salvar edições
  const saveTutorData = () => {
    updateTutorData(editTutor);
    setTutorModalVisible(false);
  };
  const saveVetData = () => {
    updateVetData(editVet);
    setVetModalVisible(false);
  };
  const savePetData = () => {
    updatePetData(editPet);
    setPetModalVisible(false);
  };

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
            <TouchableOpacity onPress={openTutorModal}>
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
            <TouchableOpacity onPress={openVetModal}>
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
            <TouchableOpacity onPress={openPetModal}>
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

      {/* Modal Editar Tutor */}
      <Modal visible={tutorModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>EDITAR DADOS DO TUTOR</Text>
              <TouchableOpacity onPress={() => setTutorModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NOME COMPLETO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  placeholderTextColor={COLORS.textSecondary}
                  value={editTutor.nome}
                  onChangeText={(text) => setEditTutor({...editTutor, nome: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>WHATSAPP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="phone-pad"
                  value={editTutor.whatsapp}
                  onChangeText={(text) => setEditTutor({...editTutor, whatsapp: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-MAIL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@exemplo.com"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="email-address"
                  value={editTutor.email}
                  onChangeText={(text) => setEditTutor({...editTutor, email: text})}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.buttonSecondary} onPress={() => setTutorModalVisible(false)}>
                <Text style={styles.buttonSecondaryText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonPrimary} onPress={saveTutorData}>
                <Text style={styles.buttonPrimaryText}>SALVAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Veterinário */}
      <Modal visible={vetModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>EDITAR DADOS DO VETERINÁRIO</Text>
              <TouchableOpacity onPress={() => setVetModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NOME COMPLETO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do veterinário"
                  placeholderTextColor={COLORS.textSecondary}
                  value={editVet.nome}
                  onChangeText={(text) => setEditVet({...editVet, nome: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-MAIL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@veterinario.com"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="email-address"
                  value={editVet.email}
                  onChangeText={(text) => setEditVet({...editVet, email: text})}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.buttonSecondary} onPress={() => setVetModalVisible(false)}>
                <Text style={styles.buttonSecondaryText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonPrimary} onPress={saveVetData}>
                <Text style={styles.buttonPrimaryText}>SALVAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Pet */}
      <Modal visible={petModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>EDITAR DADOS DO PET</Text>
              <TouchableOpacity onPress={() => setPetModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NOME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do pet"
                  placeholderTextColor={COLORS.textSecondary}
                  value={editPet.nome}
                  onChangeText={(text) => setEditPet({...editPet, nome: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>RAÇA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Raça do pet"
                  placeholderTextColor={COLORS.textSecondary}
                  value={editPet.raca}
                  onChangeText={(text) => setEditPet({...editPet, raca: text})}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
                  <Text style={styles.label}>PESO (KG)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.0"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    value={editPet.peso}
                    onChangeText={(text) => setEditPet({...editPet, peso: text})}
                  />
                </View>
                <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
                  <Text style={styles.label}>IDADE (ANOS)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    value={editPet.idade}
                    onChangeText={(text) => setEditPet({...editPet, idade: text})}
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.buttonSecondary} onPress={() => setPetModalVisible(false)}>
                <Text style={styles.buttonSecondaryText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonPrimary} onPress={savePetData}>
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalForm: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: '70%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 0,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  buttonSecondary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonPrimary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
 
});