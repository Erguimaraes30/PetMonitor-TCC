import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { SIZES } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { DataContext } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next'; // 1. Importação

const RegisterTutor = ({ navigation }) => {
  const { t } = useTranslation(); // 2. Hook de tradução
  const { colors, dark } = useTheme();
  const { updateTutorData } = useContext(DataContext);
  
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleNext = () => {
    updateTutorData({ nome, whatsapp, email, senha });
    navigation.navigate('RegisterPet');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressActive, { width: '33%', backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('bemVindo')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('subtituloRegistroTutor')}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('nomeCompleto').toUpperCase()}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                placeholder={t('placeholderNomeTutor')} 
                placeholderTextColor={colors.textSecondary} 
                value={nome} 
                onChangeText={setNome} 
              />
              <Feather name="user" size={20} color={colors.textSecondary} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>WHATSAPP</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                placeholder="(00) 00000-0000" 
                placeholderTextColor={colors.textSecondary} 
                keyboardType="phone-pad" 
                value={whatsapp} 
                onChangeText={setWhatsapp} 
              />
              <Feather name="message-square" size={20} color={colors.textSecondary} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('email').toUpperCase()}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                placeholder="exemplo@email.com" 
                placeholderTextColor={colors.textSecondary} 
                keyboardType="email-address" 
                autoCapitalize="none"
                value={email} 
                onChangeText={setEmail} 
              />
              <Feather name="mail" size={20} color={colors.textSecondary} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('senha').toUpperCase()}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                placeholder={t('placeholderSenha')} 
                placeholderTextColor={colors.textSecondary} 
                secureTextEntry 
                value={senha} 
                onChangeText={setSenha} 
              />
              <Feather name="lock" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.buttonPrimary, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>{t('proximo')}</Text>
            <Feather name="arrow-right" size={20} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              {t('jaPossuiConta')} <Text style={[styles.loginTextBold, { color: colors.primary }]}>{t('entrar')}</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ... Estilos permanecem os mesmos

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SIZES.padding },
  header: { marginTop: 20, marginBottom: 30 },
  progressBar: { height: 4, borderRadius: 2, marginBottom: 25 },
  progressActive: { height: 4, borderRadius: 2 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  form: { marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: SIZES.radius, paddingHorizontal: 15, borderWidth: 1,
    height: 55
  },
  input: { flex: 1, fontSize: 15 },
  footer: { paddingBottom: 20 },
  buttonPrimary: {
    height: 60, borderRadius: SIZES.radius,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20
  },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  loginText: { textAlign: 'center', fontSize: 14 },
  loginTextBold: { fontWeight: 'bold' }
});

export default RegisterTutor;