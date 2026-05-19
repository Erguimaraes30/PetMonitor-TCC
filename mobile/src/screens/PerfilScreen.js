import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Modal, TextInput
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { DataContext } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

// ── Componente de Modal reutilizável ──────────────────────────────────────────
const EditModal = ({ visible, title, fields, onSave, onClose, colors }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (visible) {
      const initial = {};
      fields.forEach(f => { initial[f.key] = f.value || ''; });
      setForm(initial);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalForm} keyboardShouldPersistTaps="handled">
            {fields.map(f => (
              <View key={f.key} style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{f.label}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                  value={form[f.key] || ''}
                  onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                  keyboardType={f.keyboardType || 'default'}
                  placeholder={f.placeholder || ''}
                  placeholderTextColor={colors.textSecondary}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>
            ))}
          </ScrollView>
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity style={[styles.buttonSecondary, { borderColor: colors.border }]} onPress={onClose}>
              <Text style={[styles.buttonSecondaryText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: colors.primary }]} onPress={() => onSave(form)}>
              <Text style={styles.buttonPrimaryText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── Tela Principal ────────────────────────────────────────────────────────────
export default function PerfilScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors, dark } = useTheme();
  const {
    tutorData, updateTutorData,
    petData, updatePetData,
    vetData, updateVetData,
    alertSettings, updateAlertSettings
  } = useContext(DataContext);

  const [tutorModalVisible, setTutorModalVisible] = useState(false);
  const [vetModalVisible, setVetModalVisible] = useState(false);
  const [petModalVisible, setPetModalVisible] = useState(false);

  const handleBpmUpdate = (key, value) => { updateAlertSettings({ [key]: value }); };

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
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('dadosTutor').toUpperCase()}</Text>
            <TouchableOpacity onPress={() => setTutorModalVisible(true)}>
              <Feather name="edit-2" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('nomeCompleto').toUpperCase()}</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{tutorData.nome || '—'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('contato').toUpperCase()}</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{tutorData.whatsapp || '—'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('email').toUpperCase()}</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{tutorData.email || '—'}</Text>
          </View>
        </View>

        {/* Dados do Veterinário */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('dadosVeterinario').toUpperCase()}</Text>
            <TouchableOpacity onPress={() => setVetModalVisible(true)}>
              <Feather name="edit-2" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('nomeCompleto').toUpperCase()}</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{vetData.nome || '—'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('email').toUpperCase()}</Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{vetData.email || '—'}</Text>
          </View>
        </View>

        {/* Dados do Pet */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('dadosPet').toUpperCase()}</Text>
            <TouchableOpacity onPress={() => setPetModalVisible(true)}>
              <Feather name="edit-2" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.petRow}>
            <View style={[styles.petAvatar, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="github" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.petName2, { color: colors.textPrimary }]}>{petData.nome || '—'}</Text>
              <Text style={[styles.petBreed, { color: colors.textSecondary }]}>
                {petData.raca ? `${petData.raca} • ${petData.idade} anos` : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Limites de Alerta */}
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
              <TouchableOpacity style={styles.counterBtn} onPress={() => handleBpmUpdate('bpmMin', Math.max(40, alertSettings.bpmMin - 1))}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.counterValue, { color: colors.textPrimary }]}>{alertSettings.bpmMin}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => handleBpmUpdate('bpmMin', Math.min(alertSettings.bpmMax - 1, alertSettings.bpmMin + 1))}>
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
              <TouchableOpacity style={styles.counterBtn} onPress={() => handleBpmUpdate('bpmMax', Math.max(alertSettings.bpmMin + 1, alertSettings.bpmMax - 1))}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.counterValue, { color: colors.textPrimary }]}>{alertSettings.bpmMax}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => handleBpmUpdate('bpmMax', Math.min(220, alertSettings.bpmMax + 1))}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* ── Modais ── */}
      <EditModal
        visible={tutorModalVisible}
        title={t('dadosTutor')}
        colors={colors}
        onClose={() => setTutorModalVisible(false)}
        onSave={(form) => { updateTutorData(form); setTutorModalVisible(false); }}
        fields={[
          { key: 'nome', label: t('nomeCompleto'), value: tutorData.nome, placeholder: 'Seu nome completo' },
          { key: 'whatsapp', label: 'WHATSAPP', value: tutorData.whatsapp, placeholder: '+55 11 99999-9999', keyboardType: 'phone-pad' },
          { key: 'email', label: t('email'), value: tutorData.email, placeholder: 'seu@email.com', keyboardType: 'email-address' },
        ]}
      />

      <EditModal
        visible={vetModalVisible}
        title={t('dadosVeterinario')}
        colors={colors}
        onClose={() => setVetModalVisible(false)}
        onSave={(form) => { updateVetData(form); setVetModalVisible(false); }}
        fields={[
          { key: 'nome', label: t('nomeCompleto'), value: vetData.nome, placeholder: 'Dr. Nome Sobrenome' },
          { key: 'email', label: t('email'), value: vetData.email, placeholder: 'vet@clinica.com', keyboardType: 'email-address' },
        ]}
      />

      <EditModal
        visible={petModalVisible}
        title={t('dadosPet')}
        colors={colors}
        onClose={() => setPetModalVisible(false)}
        onSave={(form) => { updatePetData(form); setPetModalVisible(false); }}
        fields={[
          { key: 'nome', label: 'NOME DO PET', value: petData.nome, placeholder: 'Ex: Max' },
          { key: 'raca', label: 'RAÇA', value: petData.raca, placeholder: 'Ex: Labrador' },
          { key: 'idade', label: 'IDADE (ANOS)', value: petData.idade, placeholder: 'Ex: 3', keyboardType: 'numeric' },
          { key: 'peso', label: 'PESO (KG)', value: petData.peso, placeholder: 'Ex: 30', keyboardType: 'numeric' },
        ]}
      />

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
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  card: { borderRadius: SIZES.radius, padding: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  field: { marginBottom: 10 },
  fieldLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  fieldValue: { fontSize: 15, fontWeight: '500' },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  petAvatar: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  modalContent: { borderRadius: SIZES.radius, borderWidth: 1, width: '100%', maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  modalForm: { padding: 16, maxHeight: '60%' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14 },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1 },
  buttonSecondary: { flex: 1, paddingVertical: 12, borderWidth: 1, borderRadius: SIZES.radius, alignItems: 'center' },
  buttonSecondaryText: { fontSize: 14, fontWeight: 'bold' },
  buttonPrimary: { flex: 1, paddingVertical: 12, borderRadius: SIZES.radius, alignItems: 'center' },
  buttonPrimaryText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
});