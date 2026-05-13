import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { SIZES } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { DataContext } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next'; // 1. Importação

const RegisterVet = ({ navigation }) => {
  const { t } = useTranslation(); // 2. Hook de tradução
  const { colors, dark } = useTheme();
  const { updateVetData } = useContext(DataContext);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const handleFinalize = () => {
    updateVetData({ nome, email });
    navigation.navigate('MainApp');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          <Text style={[styles.backText, { color: colors.textPrimary }]}>{t('voltar')}</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.stepsInfo}>
            <Text style={[styles.stepLabel, { color: colors.primary }]}>
              {t('etapaNdeN', { atual: 3, total: 3 }).toUpperCase()}
            </Text>
            <Text style={[styles.stepStatus, { color: colors.textSecondary }]}>
              {t('finalizando').toUpperCase()}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressActive, { width: '100%', backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('dadosVeterinario')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('subtituloRegistroVet')}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('nomeCompleto').toUpperCase()}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                placeholder="Dr. Nome Sobrenome" 
                placeholderTextColor={colors.textSecondary} 
                value={nome} 
                onChangeText={setNome} 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('emailVeterinario').toUpperCase()}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                placeholder="email@vetservico.com" 
                placeholderTextColor={colors.textSecondary} 
                keyboardType="email-address" 
                autoCapitalize="none"
                value={email} 
                onChangeText={setEmail} 
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.buttonFinalize, { backgroundColor: dark ? '#2D447B' : colors.primary }]}
          onPress={handleFinalize}
        >
          <Text style={[styles.buttonTextFinalize, { color: dark ? '#FFF' : '#000' }]}>{t('finalizarCadastro')}</Text>
          <Feather name="check-circle" size={20} color={dark ? '#FFF' : '#000'} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

// ... Estilos permanecem os mesmos

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SIZES.padding },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 10 },
  backText: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  header: { marginBottom: 30 },
  stepsInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  stepLabel: { fontSize: 12, fontWeight: 'bold' },
  stepStatus: { fontSize: 12 },
  progressBar: { height: 4, borderRadius: 2, marginBottom: 25 },
  progressActive: { height: 4, borderRadius: 2 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  form: { flex: 1, marginBottom: 40 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  inputContainer: {
    borderRadius: SIZES.radius, paddingHorizontal: 15,
    borderWidth: 1, height: 55, justifyContent: 'center'
  },
  input: { fontSize: 16 },
  buttonFinalize: {
    height: 60, borderRadius: SIZES.radius,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20
  },
  buttonTextFinalize: { fontSize: 18, fontWeight: 'bold', marginRight: 10 }
});

export default RegisterVet;