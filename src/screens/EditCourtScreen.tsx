import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { Court } from '../types/court';
import { RootStackParamList } from '../types/navigation';

type EditCourtScreenRouteProp = RouteProp<RootStackParamList, 'EditCourt'>;
type EditCourtScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditCourt'>;

// Temporary mock data (same as in other screens)
const mockCourt: Court = {
  id: '1',
  name: 'Quadra do Parque',
  address: 'Rua do Parque, 123',
  neighborhood: 'Centro',
  city: 'São Paulo',
  photoUrl: 'https://via.placeholder.com/300',
  whatsappLink: 'https://wa.me/group/xyz',
  responsiblePerson: 'João Silva',
  latitude: -23.550520,
  longitude: -46.633308,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function EditCourtScreen() {
  const route = useRoute<EditCourtScreenRouteProp>();
  const navigation = useNavigation<EditCourtScreenNavigationProp>();
  const { courtId } = route.params;

  // In a real app, we would fetch the court details using the courtId
  const [formData, setFormData] = useState<Omit<Court, 'id' | 'createdAt' | 'updatedAt' | 'latitude' | 'longitude'>>({
    name: mockCourt.name,
    address: mockCourt.address,
    neighborhood: mockCourt.neighborhood,
    city: mockCourt.city,
    photoUrl: mockCourt.photoUrl,
    whatsappLink: mockCourt.whatsappLink,
    responsiblePerson: mockCourt.responsiblePerson,
  });

  const handleImagePick = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    }, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Erro', 'Erro ao selecionar imagem');
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        setFormData({ ...formData, photoUrl: response.assets[0].uri });
      }
    });
  };

  const handleSubmit = () => {
    // Here we'll add the API call to update the court
    // For now, we'll just show a success message and navigate back
    Alert.alert(
      'Sucesso',
      'Informações atualizadas com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Nome da Quadra</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Digite o nome da quadra"
        />

        <Text style={styles.label}>Endereço</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          placeholder="Digite o endereço completo"
        />

        <Text style={styles.label}>Bairro</Text>
        <TextInput
          style={styles.input}
          value={formData.neighborhood}
          onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
          placeholder="Digite o bairro"
        />

        <Text style={styles.label}>Cidade</Text>
        <TextInput
          style={styles.input}
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
          placeholder="Digite a cidade"
        />

        <Text style={styles.label}>Link do WhatsApp</Text>
        <TextInput
          style={styles.input}
          value={formData.whatsappLink}
          onChangeText={(text) => setFormData({ ...formData, whatsappLink: text })}
          placeholder="Cole o link do grupo do WhatsApp"
        />

        <Text style={styles.label}>Responsável</Text>
        <TextInput
          style={styles.input}
          value={formData.responsiblePerson}
          onChangeText={(text) => setFormData({ ...formData, responsiblePerson: text })}
          placeholder="Nome do responsável"
        />

        <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
          <Text style={styles.imageButtonText}>
            {formData.photoUrl ? 'Trocar Foto' : 'Adicionar Foto'}
          </Text>
        </TouchableOpacity>

        {formData.photoUrl ? (
          <Image
            source={{ uri: formData.photoUrl }}
            style={styles.previewImage}
          />
        ) : null}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Salvar Alterações</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 