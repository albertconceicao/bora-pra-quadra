import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, Linking, Modal, ScrollView, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Court } from '../database/courts';
import { getCurrentUser } from '../database/users';
import { useCourts } from '../hooks/useCourts';
import { RootStackParamList } from '../types/navigation';

interface Section {
  title: string;
  data: Court[];
}

type CourtsScreenRouteProp = RouteProp<RootStackParamList, 'Courts'>;

export const CourtsScreen = () => {
  const route = useRoute<CourtsScreenRouteProp>();
  const userOnly = route.params?.userOnly ?? false;
  const { courts, loading, createCourt, modifyCourt, removeCourt } = useCourts({ userOnly });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    city: '',
    neighborhood: '',
    whatsApp: '',
    photo: '',
    responsible: '',
    surface: '',
    width: '10.97',
    length: '23.77',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
  });

  const currentUser = getCurrentUser();

  // Organize courts into sections
  const organizeCourts = () => {
    if (!currentUser) return [];

    const ownedCourts = courts.filter(court => 
      currentUser.createdCourts.includes(court.id)
    );
    
    const affiliatedCourts = courts.filter(court => 
      !currentUser.createdCourts.includes(court.id) && 
      currentUser.affiliatedCourts.includes(court.id)
    );
    
    const otherCourts = courts.filter(court => 
      !currentUser.createdCourts.includes(court.id) && 
      !currentUser.affiliatedCourts.includes(court.id)
    );

    const sections = [];
    
    if (userOnly) {
      if (ownedCourts.length > 0) {
        sections.push({ title: 'Minhas Quadras', data: ownedCourts });
      }
    } else {
      if (ownedCourts.length > 0) {
        sections.push({ title: 'Minhas Quadras', data: ownedCourts });
      }
      if (affiliatedCourts.length > 0) {
        sections.push({ title: 'Quadras Afiliadas', data: affiliatedCourts });
      }
      if (otherCourts.length > 0) {
        sections.push({ title: 'Outras Quadras', data: otherCourts });
      }
    }

    return sections;
  };

  const sections = organizeCourts();

  const handleSubmit = () => {
    const courtData = {
      name: formData.name,
      location: formData.location,
      address: formData.address,
      city: formData.city,
      neighborhood: formData.neighborhood,
      whatsApp: formData.whatsApp,
      photo: formData.photo,
      responsible: formData.responsible,
      surface: formData.surface,
      isAvailable: true,
      dimensions: {
        width: parseFloat(formData.width),
        length: parseFloat(formData.length),
      },
      schedule: {
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
      },
    };

    if (editingCourt) {
      modifyCourt(editingCourt.id, courtData);
    } else {
      createCourt(courtData);
    }

    setModalVisible(false);
    setEditingCourt(null);
    setFormData({
      name: '',
      location: '',
      address: '',
      city: '',
      neighborhood: '',
      whatsApp: '',
      photo: '',
      responsible: '',
      surface: '',
      width: '10.97',
      length: '23.77',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
    });
  };

  const handleEdit = (court: Court) => {
    setEditingCourt(court);
    setFormData({
      name: court.name,
      location: court.location,
      address: court.address,
      city: court.city,
      neighborhood: court.neighborhood,
      whatsApp: court.whatsApp,
      photo: court.photo,
      responsible: court.responsible,
      surface: court.surface,
      width: court.dimensions.width.toString(),
      length: court.dimensions.length.toString(),
      dayOfWeek: court.schedule.dayOfWeek,
      startTime: court.schedule.startTime,
      endTime: court.schedule.endTime,
    });
    setModalVisible(true);
  };

  const handleWhatsAppPress = (whatsApp: string) => {
    Linking.openURL(`https://wa.me/${whatsApp}`);
  };

  const renderItem = ({ item }: { item: Court }) => (
    <View style={styles.courtItem}>
      {item.photo && (
        <Image
          source={{ uri: item.photo }}
          style={styles.courtImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.courtInfo}>
        <Text style={styles.courtName}>{item.name}</Text>
        <Text style={styles.courtDetails}>
          Responsible: {item.responsible}
        </Text>
        <Text style={styles.courtDetails}>
          Address: {item.address}
        </Text>
        <Text style={styles.courtDetails}>
          {item.neighborhood}, {item.city}
        </Text>
        <Text style={styles.courtDetails}>
          Surface: {item.surface}
        </Text>
        <Text style={styles.courtDetails}>
          Dimensions: {item.dimensions.width}m x {item.dimensions.length}m
        </Text>
        <Text style={styles.courtDetails}>
          Schedule: {item.schedule.dayOfWeek} {item.schedule.startTime} - {item.schedule.endTime}
        </Text>
        <TouchableOpacity
          onPress={() => handleWhatsAppPress(item.whatsApp)}
          style={styles.whatsappButton}
        >
          <Text style={styles.whatsappButtonText}>Contact via WhatsApp</Text>
        </TouchableOpacity>
        <Text style={styles.availability}>
          {item.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => removeCourt(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading courts...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please sign in to view courts.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userOnly && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Adicionar nova quadra</Text>
        </TouchableOpacity>
      )}

      {sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {userOnly ? "Você ainda não adicionou nenhuma quadra." : "Nenhuma quadra disponível."}
          </Text>
          {userOnly && (
            <Text style={styles.emptySubText}>
              Clique no botão acima para adicionar sua primeira quadra!
            </Text>
          )}
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={({ item }) => renderItem({ item })}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          style={styles.list}
          stickySectionHeadersEnabled={true}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingCourt ? 'Editar quadra' : 'Adicionar nova quadra'}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Nome da quadra"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Localização"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Endereço"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Cidade"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Bairro"
                value={formData.neighborhood}
                onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Número de WhatsApp"
                value={formData.whatsApp}
                onChangeText={(text) => setFormData({ ...formData, whatsApp: text })}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="URL da foto"
                value={formData.photo}
                onChangeText={(text) => setFormData({ ...formData, photo: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Responsável"
                value={formData.responsible}
                onChangeText={(text) => setFormData({ ...formData, responsible: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Tipo de superfície"
                value={formData.surface}
                onChangeText={(text) => setFormData({ ...formData, surface: text })}
              />
              
              <View style={styles.dimensionsContainer}>
                <TextInput
                  style={[styles.input, styles.dimensionInput]}
                  placeholder="Largura (m)"
                  value={formData.width}
                  onChangeText={(text) => setFormData({ ...formData, width: text })}
                  keyboardType="numeric"
                />
                
                <TextInput
                  style={[styles.input, styles.dimensionInput]}
                  placeholder="Comprimento (m)"
                  value={formData.length}
                  onChangeText={(text) => setFormData({ ...formData, length: text })}
                  keyboardType="numeric"
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Dia da semana"
                value={formData.dayOfWeek}
                onChangeText={(text) => setFormData({ ...formData, dayOfWeek: text })}
              />

              <View style={styles.dimensionsContainer}>
                <TextInput
                  style={[styles.input, styles.dimensionInput]}
                  placeholder="Hora de início"
                  value={formData.startTime}
                  onChangeText={(text) => setFormData({ ...formData, startTime: text })}
                />
                
                <TextInput
                  style={[styles.input, styles.dimensionInput]}
                  placeholder="Hora de término"
                  value={formData.endTime}
                  onChangeText={(text) => setFormData({ ...formData, endTime: text })}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setEditingCourt(null);
                  }}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>
                    {editingCourt ? 'Salvar alterações' : 'Adicionar quadra'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  list: {
    flex: 1,
  },
  courtItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  courtImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  courtInfo: {
    flex: 1,
  },
  courtName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courtDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  availability: {
    fontSize: 14,
    marginTop: 4,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    marginVertical: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  dimensionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dimensionInput: {
    flex: 0.48,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  sectionHeader: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
}); 