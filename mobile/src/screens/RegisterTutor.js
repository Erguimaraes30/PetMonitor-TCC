import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Feather } from '@expo/vector-icons';

const RegisterTutor = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressActive, { width: '33%' }]} />
          </View>
          <Text style={styles.title}>Bem-vindo ao PetMonitor</Text>
          <Text style={styles.subtitle}>
            Inicie o monitoramento clínico do seu pet preenchendo os dados do tutor.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOME COMPLETO</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="Como devemos te chamar?" placeholderTextColor={COLORS.textSecondary} />
              <Feather name="user" size={20} color={COLORS.textSecondary} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WHATSAPP</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="(00) 00000-0000" placeholderTextColor={COLORS.textSecondary} keyboardType="phone-pad" />
              <Feather name="message-square" size={20} color={COLORS.textSecondary} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-MAIL</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="exemplo@email.com" placeholderTextColor={COLORS.textSecondary} keyboardType="email-address" />
              <Feather name="mail" size={20} color={COLORS.textSecondary} />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.buttonPrimary}
            onPress={() => navigation.navigate('RegisterPet')}
          >
            <Text style={styles.buttonText}>Próximo</Text>
            <Feather name="arrow-right" size={20} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.loginLink}>
            <Text style={styles.loginText}>
              Já possui uma conta? <Text style={styles.loginTextBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SIZES.padding },
  header: { marginTop: 40, marginBottom: 30 },
  progressBar: { height: 4, backgroundColor: COLORS.secondary, borderRadius: 2, marginBottom: 25 },
  progressActive: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  title: { fontSize: SIZES.fonts.h1, color: COLORS.textPrimary, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: SIZES.fonts.body, color: COLORS.textSecondary, lineHeight: 22 },
  form: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: SIZES.radius, paddingHorizontal: 15, borderWidth: 1,
    borderColor: COLORS.border, height: 55
  },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: SIZES.fonts.body },
  footer: { paddingBottom: 20 },
  buttonPrimary: {
    backgroundColor: COLORS.primary, height: 60, borderRadius: SIZES.radius,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20
  },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  loginText: { color: COLORS.textSecondary, textAlign: 'center' },
  loginTextBold: { color: COLORS.primary, fontWeight: 'bold' }
});

export default RegisterTutor;