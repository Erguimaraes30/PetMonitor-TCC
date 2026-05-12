import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Feather } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
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
      // Aqui você faria a chamada à API de login
      // Por enquanto, simulamos um login bem-sucedido
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Se chegou aqui, login foi bem-sucedido
      navigation.replace('MainApp');
    } catch (error) {
      setErro('E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Aqui você pode navegar para uma tela de recuperação de senha
    alert('Funcionalidade de recuperação de senha em breve!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.wrapper}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Feather name="heart" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>PetMonitor</Text>
          <Text style={styles.subtitle}>Monitoramento Clínico do Seu Pet</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-MAIL</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
              <Feather name="mail" size={20} color={COLORS.textSecondary} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SENHA</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry={!showPassword}
                value={senha}
                onChangeText={setSenha}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={COLORS.textSecondary}
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
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => navigation.replace('RegisterTutor')}
            disabled={loading}
          >
            <Text style={styles.buttonSecondaryText}>CRIAR NOVA CONTA</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Ao continuar, você concorda com nossos{' '}
            <Text style={styles.link}>Termos de Serviço</Text> e{' '}
            <Text style={styles.link}>Política de Privacidade</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 50,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E57373' + '15',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 4,
  },
  errorText: {
    color: '#E57373',
    fontSize: 12,
    fontWeight: '600',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    gap: 16,
    marginBottom: 30,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondaryText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  disclaimer: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
