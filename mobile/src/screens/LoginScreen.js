import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar
} from 'react-native';
import { SIZES } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext'; // Importação do tema

const LoginScreen = ({ navigation }) => {
  const { colors, dark } = useTheme(); // Acesso às cores dinâmicas
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    if (!email || !senha) {
      setErro('Preencha todos os campos');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      // Simulação de login
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigation.replace('MainApp');
    } catch (error) {
      setErro('E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.wrapper}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: colors.primary + '15' }]}>
            <Feather name="heart" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>PetMonitor</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Monitoramento Clínico do Seu Pet</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>E-MAIL</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
              <Feather name="mail" size={20} color={colors.textSecondary} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>SENHA</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                value={senha}
                onChangeText={setSenha}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {erro ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={16} color="#E57373" />
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => alert('Em breve!')}
            disabled={loading}
          >
            <Text style={[styles.forgotText, { color: colors.primary }]}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.buttonPrimary, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.buttonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OU</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.buttonSecondary, { borderColor: colors.primary }]}
            onPress={() => navigation.replace('RegisterTutor')}
            disabled={loading}
          >
            <Text style={[styles.buttonSecondaryText, { color: colors.primary }]}>CRIAR NOVA CONTA</Text>
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
            Ao continuar, você concorda com nossos{' '}
            <Text style={[styles.link, { color: colors.primary }]}>Termos de Serviço</Text> e{' '}
            <Text style={[styles.link, { color: colors.primary }]}>Política de Privacidade</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  wrapper: { flex: 1, paddingHorizontal: SIZES.padding, justifyContent: 'space-between' },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 50 },
  logo: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  appName: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14 },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: SIZES.radius, borderWidth: 1, paddingHorizontal: 16, gap: 12 },
  input: { flex: 1, height: 50, fontSize: 15 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E57373' + '15', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginTop: 4 },
  errorText: { color: '#E57373', fontSize: 12, fontWeight: '600' },
  forgotButton: { alignSelf: 'flex-end', marginTop: 8 },
  forgotText: { fontSize: 13, fontWeight: '600' },
  footer: { gap: 16, marginBottom: 30 },
  buttonPrimary: { borderRadius: SIZES.radius, height: 50, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#000', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontWeight: '600', marginHorizontal: 12 },
  buttonSecondary: { borderWidth: 1, borderRadius: SIZES.radius, height: 50, alignItems: 'center', justifyContent: 'center' },
  buttonSecondaryText: { fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
  disclaimer: { fontSize: 11, textAlign: 'center', lineHeight: 18 },
  link: { fontWeight: '600' },
});

export default LoginScreen;