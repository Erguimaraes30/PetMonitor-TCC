import React, { useContext, useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, Switch, Dimensions, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { DataContext } from '../context/DataContext';

const { width } = Dimensions.get('window');

const THEME_OPTIONS = [
  { key: 'dark', label: 'Dark', color: '#0F1117' },
  { key: 'light', label: 'Light', color: '#FFFFFF' },
];

const LANGUAGE_OPTIONS = [
  { key: 'pt', label: 'Português' },
  { key: 'en', label: 'English' },
];

export default function SettingsScreen({ navigation }) {
  const [syncingEmail, setSyncingEmail] = useState(false);

  const { dark, toggleTheme, colors } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const {
    tutorData,
    vetData,
    petData,
    notificationSettings,
    updateNotificationSettings,
    syncEmailAlertSettings,
  } = useContext(DataContext);

  const handleEmailAlertToggle = async (enabled) => {
    const previous = notificationSettings.emailAlerts;
    await updateNotificationSettings({ emailAlerts: enabled });

    if (enabled && !tutorData.email && !vetData.email) {
      Alert.alert('E-mail não configurado', 'Cadastre o e-mail do tutor ou do veterinário no perfil antes de ativar os alertas por e-mail.');
      await updateNotificationSettings({ emailAlerts: previous });
      return;
    }

    setSyncingEmail(true);
    try {
      await syncEmailAlertSettings(enabled, { tutorData, vetData, petData });
    } catch (err) {
      await updateNotificationSettings({ emailAlerts: previous });
      Alert.alert('Erro ao salvar', 'Não foi possível atualizar os alertas por e-mail agora.');
    } finally {
      setSyncingEmail(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('configuracoes')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Conta */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('conta')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate('MainApp', { screen: 'Perfil' })}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '22' }]}>
                <Feather name="user" size={18} color={colors.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{t('perfilTutor')}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t('editarInfo')}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notificações */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('notificacoes').toUpperCase()}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.notifRow}>
              <View style={[styles.notifIcon, { backgroundColor: colors.error + '22' }]}>
                <Feather name="mail" size={18} color={colors.error} />
              </View>
              <View style={styles.notifInfo}>
                <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>{t('alertasEmail')}</Text>
                <Text style={[styles.notifSubtitle, { color: colors.textSecondary }]}>{t('notifCriticas')}</Text>
              </View>
              <Switch
                value={notificationSettings.emailAlerts}
                onValueChange={handleEmailAlertToggle}
                disabled={syncingEmail}
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
                <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>{t('notifPush')}</Text>
                <Text style={[styles.notifSubtitle, { color: colors.textSecondary }]}>{t('alertasTempoReal')}</Text>
              </View>
              <Switch
                value={notificationSettings.pushAlerts}
                onValueChange={(value) => updateNotificationSettings({ pushAlerts: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Aparência */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('aparencia')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>{t('tema')}</Text>
            <View style={styles.themeGrid}>
              {THEME_OPTIONS.map((option) => {
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
                    onPress={() => { if (!isActive) toggleTheme(); }}
                  >
                    <View style={[styles.themePreview, { backgroundColor: option.color, borderColor: colors.border }]} />
                    <Text style={[styles.themeLabel, { color: colors.textPrimary }, isActive && { color: colors.primary }]}>
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
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('idioma')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {LANGUAGE_OPTIONS.map((option, index) => (
              <View key={option.key}>
                <TouchableOpacity
                  style={styles.languageOption}
                  onPress={() => changeLanguage(option.key)}
                >
                  <View style={styles.languageContent}>
                    <View style={[
                      styles.radioButton,
                      { borderColor: colors.border },
                      language === option.key && { borderColor: colors.primary }
                    ]}>
                      {language === option.key && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[styles.languageLabel, { color: colors.textPrimary }]}>{option.label}</Text>
                  </View>
                  {language === option.key && <Feather name="check" size={18} color={colors.primary} />}
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
          <Text style={[styles.logoutText, { color: colors.error }]}>{t('logout')}</Text>
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
