import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { SIZES } from '../constants/theme';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { DataContext } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next'; // 1. Importação

const RegisterPet = ({ navigation }) => {
  const { t } = useTranslation(); // 2. Hook de tradução
  const { colors, dark } = useTheme();
  const { updatePetData } = useContext(DataContext);
  
  const [gender, setGender] = useState(null);
  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [peso, setPeso] = useState('');
  const [idade, setIdade] = useState('');

  const handleNext = () => {
    updatePetData({ nome, raca, peso, idade, sexo: gender });
    navigation.navigate('RegisterVet');
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
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressActive, { width: '66%', backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('sobreSeuPet')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('subtituloRegistroPet')}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('nome').toUpperCase()}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                placeholder="Ex: Max" 
                placeholderTextColor={colors.textSecondary} 
                value={nome} 
                onChangeText={setNome} 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('raca').toUpperCase()}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                placeholder={t('placeholderRaca')} 
                placeholderTextColor={colors.textSecondary} 
                value={raca} 
                onChangeText={setRaca} 
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('pesoKg').toUpperCase()}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput 
                  style={[styles.input, { color: colors.textPrimary }]} 
                  placeholder="0.0" 
                  keyboardType="numeric" 
                  placeholderTextColor={colors.textSecondary} 
                  value={peso} 
                  onChangeText={setPeso} 
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('idadeAnos').toUpperCase()}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput 
                  style={[styles.input, { color: colors.textPrimary }]} 
                  placeholder="0" 
                  keyboardType="numeric" 
                  placeholderTextColor={colors.textSecondary} 
                  value={idade} 
                  onChangeText={setIdade} 
                />
              </View>
            </View>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('sexo').toUpperCase()}</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[
                styles.genderButton, 
                { backgroundColor: colors.card, borderColor: colors.border },
                gender === 'M' && { 
                  borderColor: colors.primary, 
                  backgroundColor: dark ? '#1E2433' : '#E3F2FD' 
                }
              ]} 
              onPress={() => setGender('M')}
            >
              <FontAwesome5 name="mars" size={18} color={gender === 'M' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.genderText, { color: colors.textSecondary }, gender === 'M' && { color: colors.primary }]}>{t('macho').toUpperCase()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.genderButton, 
                { backgroundColor: colors.card, borderColor: colors.border },
                gender === 'F' && { 
                  borderColor: colors.primary, 
                  backgroundColor: dark ? '#1E2433' : '#E3F2FD' 
                }
              ]} 
              onPress={() => setGender('F')}
            >
              <FontAwesome5 name="venus" size={18} color={gender === 'F' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.genderText, { color: colors.textSecondary }, gender === 'F' && { color: colors.primary }]}>{t('femea').toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.infoCard, { backgroundColor: dark ? 'rgba(176, 196, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', borderColor: colors.border }]}>
            <Feather name="info" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {t('infoDiferencialCalibragem')}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.buttonPrimary, { backgroundColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>{t('proximo')}</Text>
          <Feather name="arrow-right" size={20} color="#000" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SIZES.padding },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  backText: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  header: { marginBottom: 30 },
  progressBar: { height: 4, borderRadius: 2, marginBottom: 25 },
  progressActive: { height: 4, borderRadius: 2 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  form: { flex: 1, marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: SIZES.radius, paddingHorizontal: 15, borderWidth: 1,
    height: 55
  },
  input: { flex: 1, fontSize: 16 },
  row: { flexDirection: 'row', marginBottom: 20 },
  genderButton: {
    flex: 1, height: 55, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', borderRadius: SIZES.radius,
    marginHorizontal: 5, borderWidth: 1
  },
  genderText: { fontWeight: 'bold', marginLeft: 10 },
  infoCard: {
    flexDirection: 'row', padding: 15, borderRadius: SIZES.radius, 
    borderWidth: 1, marginTop: 10, alignItems: 'center'
  },
  infoText: { flex: 1, fontSize: 13, marginLeft: 10, lineHeight: 18 },
  buttonPrimary: {
    height: 60, borderRadius: SIZES.radius,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
  },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold', marginRight: 10 }
});

export default RegisterPet;