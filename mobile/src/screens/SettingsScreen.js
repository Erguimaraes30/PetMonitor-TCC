import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Switch, Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext'; // Importe o hook

const { width } = Dimensions.get('window');

const THEME_OPTIONS = [
  { key: 'dark', label: 'Dark', color: '#0F1117' },
  { key: 'light', label: 'Light', color: '#FFFFFF' },
];

const LANGUAGE_OPTIONS = [
  { key: 'pt', label: 'Português' },
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Español' },
];

export default function SettingsScreen({ navigation }) {
  // Estados de controle local
  const [emailAlertas, setEmailAlertas] = useState(true);
  const [pushAlertas, setPushAlertas] = useState(true);
  const [idioma, setIdioma] = useState('pt');

  // Hook do Tema Global
  const { dark, toggleTheme, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* StatusBar reage ao tema */}
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Configurações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Seção de Conta */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CONTA</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => navigation.navigate('MainApp', { screen: 'Perfil' })}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '22' }]}>
                <Feather name="user" size={18} color={colors.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Perfil do Tutor</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Editar informações pessoais</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notificações */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NOTIFICAÇÕES</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.notifRow}>
              <View style={[styles.notifIcon, { backgroundColor: colors.error + '22' }]}>
                <Feather name="mail" size={18} color={colors.error} />
              </View>
              <View style={styles.notifInfo}>
                <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>Alertas via E-mail</Text>
                <Text style={[styles.notifSubtitle, { color: colors.textSecondary }]}>Notificações críticas</Text>
              </View>
              <Switch
                value={emailAlertas}
                onValueChange={setEmailAlertas}
                trackColor={{ false: colors.border, true: colors.error }}
                thumbColor="#FFF"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.notifRow}>
              <View style={[styles.notifIcon, { backgroundColor: colors.primary + '22' }]}>
                <Feather name="bell" size={18} color={colors.primary} />
              </View>
              <View style={styles.notifInfo}>
                <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>Notificações Push</Text>
                <Text style={[styles.notifSubtitle, { color: colors.textSecondary }]}>Alertas em tempo real</Text>
              </View>
              <Switch
                value={pushAlertas}
                onValueChange={setPushAlertas}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Aparência - FUNCIONAL AGORA */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APARÊNCIA</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>TEMA</Text>
            <View style={styles.themeGrid}>
              {THEME_OPTIONS.map((option) => {
                // Checa se a opção renderizada é a que está ativa no Contexto
                const isActive = (option.key === 'dark' && dark) || (option.key === 'light' && !dark);
                
                return (
                  <TouchableOpacity
                    key={option.key}
                    activeOpacity={0.7}
                    style={[
                      styles.themeOption,
                      { borderColor: colors.border },
                      isActive && { borderColor: colors.primary, backgroundColor: colors.primary + '11' }
                    ]}
                    onPress={() => {
                      // Só troca se clicar no que não está ativo
                      if (!isActive) toggleTheme();
                    }}
                  >
                    <View
                      style={[
                        styles.themePreview,
                        { backgroundColor: option.color, borderColor: colors.border }
                      ]}
                    />
                    <Text style={[
                      styles.themeLabel,
                      { color: colors.textPrimary },
                      isActive && { color: colors.primary }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Idioma */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>IDIOMA</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {LANGUAGE_OPTIONS.map((option, index) => (
              <View key={option.key}>
                <TouchableOpacity
                  style={styles.languageOption}
                  onPress={() => setIdioma(option.key)}
                >
                  <View style={styles.languageContent}>
                    <View style={[
                        styles.radioButton,
                        { borderColor: colors.border },
                        idioma === option.key && { borderColor: colors.primary }
                    ]}>
                      {idioma === option.key && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[styles.languageLabel, { color: colors.textPrimary }]}>{option.label}</Text>
                  </View>
                  {idioma === option.key && <Feather name="check" size={18} color={colors.primary} />}
                </TouchableOpacity>
                {index < LANGUAGE_OPTIONS.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.error }]}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={[styles.logoutText, { color: colors.error }]}>LOGOUT DA CONTA</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 55, paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scroll: { padding: SIZES.padding, gap: 20, paddingBottom: 30 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1, paddingHorizontal: 4 },
  card: { borderRadius: SIZES.radius, borderWidth: 1, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  settingIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600' },
  settingSubtitle: { fontSize: 12, marginTop: 2 },
  settingLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1, paddingHorizontal: 16, paddingTop: 16, marginBottom: 8 },
  notifRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  notifIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '600' },
  notifSubtitle: { fontSize: 12, marginTop: 2 },
  themeGrid: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  themeOption: { flex: 1, alignItems: 'center', paddingVertical: 12, borderWidth: 2, borderRadius: 12 },
  themePreview: { width: 50, height: 40, borderRadius: 8, marginBottom: 8, borderWidth: 1 },
  themeLabel: { fontSize: 12, fontWeight: '600' },
  languageOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  languageContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  languageLabel: { fontSize: 15, fontWeight: '500' },
  divider: { height: 1, marginHorizontal: 16 },
  logoutBtn: { marginTop: 10, borderWidth: 1, borderStyle: 'dashed', borderRadius: SIZES.radius, padding: 18, alignItems: 'center' },
  logoutText: { fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
});