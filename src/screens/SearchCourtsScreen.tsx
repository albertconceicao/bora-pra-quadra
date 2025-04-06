import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Court, searchCourts } from '../database/courts';
import { RootStackParamList } from '../types/navigation';

type SearchCourtsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SearchCourts'>;

export default function SearchCourtsScreen() {
  const navigation = useNavigation<SearchCourtsScreenNavigationProp>();
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [searchResults, setSearchResults] = useState<Court[]>([]);

  const handleSearch = () => {
    const results = searchCourts(city, neighborhood);
    setSearchResults(results);
  };

  const handleCourtPress = (court: Court) => {
    navigation.navigate('CourtDetails', { courtId: court.id });
  };

  const handleAddCourt = () => {
    navigation.navigate('Courts');
  };

  const renderCourtItem = ({ item }: { item: Court }) => (
    <TouchableOpacity 
      style={styles.courtItem}
      onPress={() => handleCourtPress(item)}
    >
      <Text style={styles.courtName}>{item.name}</Text>
      <Text style={styles.courtSchedule}>
        {item.schedule.dayOfWeek}, {item.schedule.startTime} - {item.schedule.endTime}
      </Text>
      <Text style={styles.courtAddress}>
        {item.address}
      </Text>
      <Text style={styles.courtLocation}>
        {item.neighborhood}, {item.city}
      </Text>
      
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Digite a cidade"
        value={city}
        onChangeText={setCity}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Digite o bairro"
        value={neighborhood}
        onChangeText={setNeighborhood}
      />

      <TouchableOpacity 
        style={styles.searchButton}
        onPress={handleSearch}
      >
        <Text style={styles.searchButtonText}>Buscar</Text>
      </TouchableOpacity>

      <FlatList
        data={searchResults}
        renderItem={renderCourtItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma quadra encontrada</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddCourt}
            >
              <Text style={styles.addButtonText}>Adicionar Nova Quadra</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  courtName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courtAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  courtLocation: {
    fontSize: 14,
    color: '#666',
  },
  courtSchedule: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 