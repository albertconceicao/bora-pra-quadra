import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCourtById } from '../database/courts';
import { addToFavorites, canEditCourt, getFavoriteCourts, removeFromFavorites } from '../database/users';
import { RootStackParamList } from '../types/navigation';

type CourtDetailsScreenRouteProp = RouteProp<RootStackParamList, 'CourtDetails'>;
type CourtDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CourtDetails'>;

export default function CourtDetailsScreen() {
  const route = useRoute<CourtDetailsScreenRouteProp>();
  const navigation = useNavigation<CourtDetailsScreenNavigationProp>();
  const court = getCourtById(route.params.courtId);
  const [isFavorite, setIsFavorite] = useState(false);
  const canEdit = court ? canEditCourt(court.id) : false;

  useEffect(() => {
    if (court) {
      const favoriteCourts = getFavoriteCourts();
      setIsFavorite(favoriteCourts.includes(court.id));
    }
  }, [court]);

  if (!court) {
    return (
      <View style={styles.container}>
        <Text>Quadra não encontrada</Text>
      </View>
    );
  }

  const handleWhatsAppPress = () => {
    Linking.openURL(`https://wa.me/${court.whatsApp}`);
  };

  const handleEditPress = () => {
    if (canEdit) {
      navigation.navigate('Courts');
    } else {
      Alert.alert('Error', 'You can only edit courts that you created');
    }
  };

  const handleFavoritePress = async () => {
    const result = isFavorite 
      ? await removeFromFavorites(court.id)
      : await addToFavorites(court.id);

    if (result.success) {
      setIsFavorite(!isFavorite);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        {court.photo && (
          <Image
            source={{ uri: court.photo }}
            style={styles.courtImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.detailsContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.courtName}>{court.name}</Text>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
            >
              <Text style={styles.favoriteButtonText}>
                {isFavorite ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Dia: </Text>
            <Text style={styles.value}>{court.schedule.dayOfWeek}, {court.schedule.startTime} - {court.schedule.endTime}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Responsável: </Text>
            <Text style={styles.value}>{court.responsible}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Address: </Text>
            <Text style={styles.value}>{court.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.value}>{court.neighborhood}, {court.city}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Tipo de quadra: </Text>
            <Text style={styles.value}>{court.surface}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Dimensões: </Text>
            <Text style={styles.value}>{court.dimensions.width}m x {court.dimensions.length}m</Text>
          </View>

          <View style={styles.availabilityContainer}>
            <View style={[styles.availabilityDot, { backgroundColor: court.isAvailable ? '#4CAF50' : '#f44336' }]} />
            <Text style={styles.availabilityText}>
              {court.isAvailable ? 'Disponível' : 'Indisponível'}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.whatsappButton]}
          onPress={handleWhatsAppPress}
        >
          <Text style={styles.buttonText}>Contato via WhatsApp</Text>
        </TouchableOpacity>
        
        {canEdit && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleEditPress}
          >
            <Text style={styles.buttonText}>Editar quadra</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32, // Extra padding for navigation bar
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  courtImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#ddd',
  },
  detailsContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  courtName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteButtonText: {
    fontSize: 24,
    color: '#4CAF50',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  availabilityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  availabilityText: {
    fontSize: 16,
    color: '#666',
  },
}); 