import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { DataContext } from '../context/DataContext';

const RegisterPet = ({ navigation }) => {
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressActive, { width: '66%' }]} />
          </View>
          <Text style={styles.title}>Sobre o seu Pet</Text>
          <Text style={styles.subtitle}>
            Precisamos de alguns detalhes técnicos para calibrar os sensores de saúde.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOME</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="Ex: Max" placeholderTextColor={COLORS.textSecondary} value={nome} onChangeText={setNome} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>RAÇA</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="Busque a raça" placeholderTextColor={COLORS.textSecondary} value={raca} onChangeText={setRaca} />
              <Feather name="search" size={20} color={COLORS.textSecondary} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>PESO (KG)</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} placeholder="0.0" keyboardType="numeric" placeholderTextColor={COLORS.textSecondary} value={peso} onChangeText={setPeso} />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>IDADE (ANOS)</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} placeholder="0" keyboardType="numeric" placeholderTextColor={COLORS.textSecondary} value={idade} onChangeText={setIdade} />
              </View>
            </View>
          </View>

          <Text style={styles.label}>SEXO</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.genderButton, gender === 'M' && styles.genderActive]} onPress={() => setGender('M')}>
              <FontAwesome5 name="mars" size={18} color={gender === 'M' ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.genderText, gender === 'M' && styles.genderTextActive]}>MACHO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.genderButton, gender === 'F' && styles.genderActive]} onPress={() => setGender('F')}>
              <FontAwesome5 name="venus" size={18} color={gender === 'F' ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.genderText, gender === 'F' && styles.genderTextActive]}>FÊMEA</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Feather name="info" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Estes dados ajudam a calcular a frequência cardíaca ideal para o porte do seu pet.
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.buttonPrimary}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Próximo</Text>
          <Feather name="arrow-right" size={20} color="#000" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  backText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  header: { marginBottom: 30 },
  progressBar: { height: 4, backgroundColor: COLORS.secondary, borderRadius: 2, marginBottom: 25 },
  progressActive: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  title: { fontSize: SIZES.fonts.h1, color: COLORS.textPrimary, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: SIZES.fonts.body, color: COLORS.textSecondary, lineHeight: 22 },
  form: { flex: 1, marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: SIZES.radius, paddingHorizontal: 15, borderWidth: 1,
    borderColor: COLORS.border, height: 55
  },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: SIZES.fonts.body },
  row: { flexDirection: 'row', marginBottom: 20 },
  genderButton: {
    flex: 1, height: 55, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    marginHorizontal: 5, borderWidth: 1, borderColor: COLORS.border
  },
  genderActive: { borderColor: COLORS.primary, backgroundColor: '#1E2433' },
  genderText: { color: COLORS.textSecondary, fontWeight: 'bold', marginLeft: 10 },
  genderTextActive: { color: COLORS.primary },
  infoCard: {
    flexDirection: 'row', backgroundColor: 'rgba(176, 196, 255, 0.05)',
    padding: 15, borderRadius: SIZES.radius, borderWidth: 1,
    borderColor: 'rgba(176, 196, 255, 0.1)', marginTop: 10
  },
  infoText: { flex: 1, color: COLORS.textSecondary, fontSize: 13, marginLeft: 10, lineHeight: 18 },
  buttonPrimary: {
    backgroundColor: COLORS.primary, height: 60, borderRadius: SIZES.radius,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
  },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold', marginRight: 10 }
});

export default RegisterPet;