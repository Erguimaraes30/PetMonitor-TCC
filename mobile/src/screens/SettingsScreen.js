import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Switch, Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

const THEME_OPTIONS = [
  { key: 'dark', label: 'Dark', color: '#1A1A1A' },
  { key: 'light', label: 'Light', color: '#FFFFFF' },
  { key: 'blue', label: 'Blue', color: '#0066CC' },
];

const LANGUAGE_OPTIONS = [
  { key: 'pt', label: 'Português' },
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Español' },
];

export default function SettingsScreen({ navigation }) {
  const [emailAlertas, setEmailAlertas] = useState(true);
  const [pushAlertas, setPushAlertas] = useState(true);
  const [tema, setTema] = useState('dark');
  const [idioma, setIdioma] = useState('pt');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Seção de Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTA</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Feather name="user" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.settingInfo}>
                <TouchableOpacity style={styles.iaCard}
              onPress={() => navigation.navigate('MainApp', { screen: 'Perfil' })}
                >
                <Text style={styles.settingTitle}>Perfil do Tutor</Text>
                <Text style={styles.settingSubtitle}>Editar informações pessoais</Text>
                </TouchableOpacity>
              </View>
                <Feather name="chevron-right" size={18} color={COLORS.textSecondary} />          
            </View>
          </View>
        </View>

        {/* Notificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICAÇÕES</Text>
          <View style={styles.card}>
            <View style={styles.notifRow}>
              <View style={styles.notifIcon}>
                <Feather name="mail" size={18} color={COLORS.error} />
              </View>
              <View style={styles.notifInfo}>
                <Text style={styles.notifTitle}>Alertas via E-mail</Text>
                <Text style={styles.notifSubtitle}>Receba notificações críticas instantâneas</Text>
              </View>
              <Switch
                value={emailAlertas}
                onValueChange={setEmailAlertas}
                trackColor={{ false: COLORS.border, true: COLORS.error }}
                thumbColor="#FFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.notifRow}>
              <View style={styles.notifIcon}>
                <Feather name="bell" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.notifInfo}>
                <Text style={styles.notifTitle}>Notificações Push</Text>
                <Text style={styles.notifSubtitle}>Alertas em tempo real no celular</Text>
              </View>
              <Switch
                value={pushAlertas}
                onValueChange={setPushAlertas}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Aparência */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APARÊNCIA</Text>
          <View style={styles.card}>
            <Text style={styles.settingLabel}>TEMA</Text>
            <View style={styles.themeGrid}>
              {THEME_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.themeOption,
                    tema === option.key && styles.themeOptionActive,
                    { borderColor: option.key === 'light' ? '#DDD' : COLORS.border }
                  ]}
                  onPress={() => setTema(option.key)}
                >
                  <View
                    style={[
                      styles.themePreview,
                      { backgroundColor: option.key === 'light' ? '#FFFFFF' : option.key === 'blue' ? '#0066CC' : '#1A1A1A' }
                    ]}
                  />
                  <Text style={styles.themeLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Idioma */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IDIOMA</Text>
          <View style={styles.card}>
            {LANGUAGE_OPTIONS.map((option, index) => (
              <View key={option.key}>
                <TouchableOpacity
                  style={styles.languageOption}
                  onPress={() => setIdioma(option.key)}
                >
                  <View style={styles.languageContent}>
                    <View
                      style={[
                        styles.radioButton,
                        idioma === option.key && styles.radioButtonActive
                      ]}
                    >
                      {idioma === option.key && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.languageLabel}>{option.label}</Text>
                  </View>
                  {idioma === option.key && (
                    <Feather name="check" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
                {index < LANGUAGE_OPTIONS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOBRE</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Versão do App</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Termos de Serviço</Text>
              <Feather name="chevron-right" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Política de Privacidade</Text>
              <Feather name="chevron-right" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={() => navigation.replace('Login')}
                >
                  <Text style={styles.logoutText}>LOGOUT DA CONTA</Text>
                </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 55, paddingBottom: 16,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold' },
  scroll: { padding: SIZES.padding, gap: 20, paddingBottom: 30 },

  section: { gap: 8 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, paddingHorizontal: 4 },

  card: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },

  // Configurações genéricas
  settingRow: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
  },
  settingIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  settingTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  settingSubtitle: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  settingLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, paddingHorizontal: 16, paddingTop: 16, marginBottom: 8 },

  // Notificações
  notifRow: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
  },
  notifIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center',
  },
  notifInfo: { flex: 1 },
  notifTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  notifSubtitle: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },

  // Tema
  themeGrid: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 16,
  },
  themeOption: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderWidth: 2, borderRadius: 12, borderColor: COLORS.border,
  },
  themeOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '11' },
  themePreview: {
    width: 50, height: 50, borderRadius: 8, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  themeLabel: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '600' },

  // Idioma
  languageOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  languageContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radioButton: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  radioButtonActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '22' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  languageLabel: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },

  // Sobre
  aboutRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  aboutLabel: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  aboutValue: { color: COLORS.textSecondary, fontSize: 14 },

  divider: { height: 1, backgroundColor: COLORS.border },

  // Logout
   logoutBtn: {
    borderWidth: 1, borderColor: '#E57373', borderStyle: 'dashed',
    borderRadius: SIZES.radius, padding: 18, alignItems: 'center',
  },
  logoutText: { color: '#E57373', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
});
