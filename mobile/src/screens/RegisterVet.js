import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { DataContext } from '../context/DataContext';

const RegisterVet = ({ navigation }) => {
  const { updateVetData } = useContext(DataContext);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const handleFinalize = () => {
    updateVetData({ nome, email });
    navigation.navigate('MainApp');
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
          <Text style={styles.backText}>Vet Portal</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.stepsInfo}>
            <Text style={styles.stepLabel}>ETAPA 3 DE 3</Text>
            <Text style={styles.stepStatus}>FINALIZANDO</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressActive, { width: '100%' }]} />
          </View>
          <Text style={styles.title}>Dados do veterinário</Text>
          <Text style={styles.subtitle}>Insira as informações profissionais para concluir a configuração.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOME COMPLETO</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="Dr. Nome Sobrenome" placeholderTextColor={COLORS.textSecondary} value={nome} onChangeText={setNome} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-MAIL DO VETERINÁRIO</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="email@vetservico.com" placeholderTextColor={COLORS.textSecondary} keyboardType="email-address" value={email} onChangeText={setEmail} />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.buttonFinalize}
          onPress={handleFinalize}
        >
          <Text style={styles.buttonTextFinalize}>Finalizar Cadastro</Text>
          <Feather name="check-circle" size={20} color="#FFF" />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SIZES.padding },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 10 },
  backText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  header: { marginBottom: 30 },
  stepsInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  stepLabel: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },
  stepStatus: { color: COLORS.textSecondary, fontSize: 12 },
  progressBar: { height: 4, backgroundColor: COLORS.secondary, borderRadius: 2, marginBottom: 25 },
  progressActive: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  title: { fontSize: SIZES.fonts.h1, color: COLORS.textPrimary, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: SIZES.fonts.body, color: COLORS.textSecondary, lineHeight: 22 },
  form: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  inputContainer: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, paddingHorizontal: 15,
    borderWidth: 1, borderColor: COLORS.border, height: 55, justifyContent: 'center'
  },
  input: { color: COLORS.textPrimary, fontSize: SIZES.fonts.body },
  buttonFinalize: {
    backgroundColor: '#2D447B', height: 60, borderRadius: SIZES.radius,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20
  },
  buttonTextFinalize: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginRight: 10 }
});

export default RegisterVet;