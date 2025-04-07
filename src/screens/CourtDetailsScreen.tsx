import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getCourtById } from '../database/courts';
import { Match, createMatch, deleteMatch, getMatchesByCourt, toggleAttendance, updateMatch } from '../database/matches';
import { User, addToFavorites, approveAffiliation, canEditCourt, getCurrentUser, getFavoriteCourts, getPendingAffiliations, hasPendingAffiliation, isAffiliatedWithCourt, removeFromFavorites, requestAffiliation } from '../database/users';
import { RootStackParamList } from '../types/navigation';

type CourtDetailsScreenRouteProp = RouteProp<RootStackParamList, 'CourtDetails'>;
type CourtDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CourtDetails'>;

export default function CourtDetailsScreen() {
  const route = useRoute<CourtDetailsScreenRouteProp>();
  const navigation = useNavigation<CourtDetailsScreenNavigationProp>();
  const court = getCourtById(route.params.courtId);
  const [isFavorite, setIsFavorite] = useState(false);
  const canEdit = court ? canEditCourt(court.id) : false;
  const [matches, setMatches] = useState<Match[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [matchFormData, setMatchFormData] = useState({
    date: '',
    time: '',
    maxPlayers: '12',
    description: '',
  });
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [pendingAffiliations, setPendingAffiliations] = useState<User[]>([]);
  const isAffiliated = court ? isAffiliatedWithCourt(court.id) : false;
  const hasPending = court ? hasPendingAffiliation(court.id) : false;

  useEffect(() => {
    if (court) {
      const favoriteCourts = getFavoriteCourts();
      setIsFavorite(favoriteCourts.includes(court.id));
      setMatches(getMatchesByCourt(court.id));
      if (canEdit) {
        setPendingAffiliations(getPendingAffiliations(court.id));
      }
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

  const handleCreateMatch = () => {
    const matchData = {
      courtId: court.id,
      date: matchFormData.date,
      time: matchFormData.time,
      maxPlayers: parseInt(matchFormData.maxPlayers),
      description: matchFormData.description,
    };

    if (editingMatch) {
      const updated = updateMatch(editingMatch.id, matchData);
      if (updated) {
        setMatches(getMatchesByCourt(court.id));
        setModalVisible(false);
        setEditingMatch(null);
      }
    } else {
      const newMatch = createMatch(matchData);
      if (newMatch) {
        setMatches(getMatchesByCourt(court.id));
        setModalVisible(false);
      }
    }

    setMatchFormData({
      date: '',
      time: '',
      maxPlayers: '12',
      description: '',
    });
  };

  const handleDeleteMatch = (matchId: string) => {
    Alert.alert(
      'Delete Match',
      'Are you sure you want to delete this match?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (deleteMatch(matchId)) {
              setMatches(getMatchesByCourt(court.id));
            }
          },
        },
      ]
    );
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setMatchFormData({
      date: match.date,
      time: match.time,
      maxPlayers: match.maxPlayers.toString(),
      description: match.description,
    });
    setModalVisible(true);
  };

  const handleToggleAttendance = (matchId: string) => {
    if (!isAffiliated) {
      Alert.alert('Error', 'You need to be affiliated with this court to join matches');
      return;
    }

    const result = toggleAttendance(matchId);
    if (result.success) {
      setMatches(getMatchesByCourt(court.id));
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleRequestAffiliation = async () => {
    if (canEdit) {
      // Court creators are automatically affiliated
      return;
    }
    const result = await requestAffiliation(court.id);
    if (result.success) {
      Alert.alert('Success', result.message);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleApproveAffiliation = async (userId: string) => {
    const result = await approveAffiliation(court.id, userId);
    if (result.success) {
      setPendingAffiliations(getPendingAffiliations(court.id));
      Alert.alert('Success', result.message);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const renderMatch = (match: Match) => {
    const currentUser = getCurrentUser();
    const isCreator = currentUser?.id === match.creatorId;
    const userAttendance = match.attendees.find(a => a.userId === currentUser?.id);
    const confirmedCount = match.attendees.filter(a => a.confirmed).length;

    return (
      <View style={styles.matchItem} key={match.id}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchDate}>{match.date} at {match.time}</Text>
          {isCreator && (
            <View style={styles.matchActions}>
              <TouchableOpacity
                style={[styles.matchButton, styles.editButton]}
                onPress={() => handleEditMatch(match)}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.matchButton, styles.deleteButton]}
                onPress={() => handleDeleteMatch(match.id)}
              >
                <Text style={styles.buttonText}>Excluir partida</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <Text style={styles.matchDescription}>{match.description}</Text>
        <Text style={styles.matchAttendees}>
          Players: {confirmedCount}/{match.maxPlayers}
        </Text>

        <View style={styles.attendeesList}>
          <Text style={styles.attendeesTitle}>Attendees:</Text>
          {match.attendees.map(attendee => (
            <View key={attendee.userId} style={styles.attendeeItem}>
              <Text style={styles.attendeeName}>
                {attendee.name} {attendee.userId === match.creatorId ? '(Creator)' : ''}
              </Text>
              <Text style={[
                styles.attendeeStatus,
                attendee.confirmed ? styles.confirmedStatus : styles.pendingStatus
              ]}>
                {attendee.confirmed ? '✓ Confirmed' : '• Not confirmed'}
              </Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity
          style={[
            styles.attendanceButton,
            userAttendance?.confirmed ? styles.attendingButton : styles.notAttendingButton,
          ]}
          onPress={() => handleToggleAttendance(match.id)}
        >
          <Text style={styles.buttonText}>
            {userAttendance?.confirmed ? 'Cancelar presença' : 'Confirmar presença'}
          </Text>
        </TouchableOpacity>
      </View>
    );
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

        <View style={styles.affiliationStatus}>
          {canEdit ? (
            <Text style={styles.affiliationText}>You are the creator of this court</Text>
          ) : isAffiliated ? (
            <Text style={styles.affiliationText}>You are affiliated with this court</Text>
          ) : hasPending ? (
            <View style={styles.pendingBanner}>
              <Text style={styles.pendingText}>Affiliation request pending</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.affiliationButton}
              onPress={handleRequestAffiliation}
            >
              <Text style={styles.buttonText}>Request Affiliation</Text>
            </TouchableOpacity>
          )}
        </View>

        {canEdit && pendingAffiliations.length > 0 && (
          <View style={styles.affiliationsSection}>
            <Text style={styles.sectionTitle}>Pending Affiliations</Text>
            {pendingAffiliations.map(user => (
              <View key={user.id} style={styles.affiliationItem}>
                <Text style={styles.affiliationName}>{user.name}</Text>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApproveAffiliation(user.id)}
                >
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.matchesSection}>
          <View style={styles.matchesHeader}>
            <Text style={styles.sectionTitle}>Partidas</Text>
            {canEdit && (
              <TouchableOpacity
                style={styles.addMatchButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.buttonText}>Criar partida</Text>
              </TouchableOpacity>
            )}
          </View>

          {matches.length === 0 ? (
            <Text style={styles.noMatches}>No matches scheduled</Text>
          ) : (
            matches.map(renderMatch)
          )}
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

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingMatch(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingMatch ? 'Edit Match' : 'Create Match'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Date (DD/MM/YYYY)"
              value={matchFormData.date}
              onChangeText={(text) => setMatchFormData({ ...matchFormData, date: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Time (HH:MM)"
              value={matchFormData.time}
              onChangeText={(text) => setMatchFormData({ ...matchFormData, time: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Max Players"
              value={matchFormData.maxPlayers}
              onChangeText={(text) => setMatchFormData({ ...matchFormData, maxPlayers: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={matchFormData.description}
              onChangeText={(text) => setMatchFormData({ ...matchFormData, description: text })}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingMatch(null);
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleCreateMatch}
              >
                <Text style={styles.buttonText}>
                  {editingMatch ? 'Salvar alterações' : 'Criar partida'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  matchesSection: {
    marginTop: 24,
  },
  matchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addMatchButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 6,
  },
  matchItem: {
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
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  matchActions: {
    flexDirection: 'row',
  },
  matchButton: {
    padding: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  matchDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  matchAttendees: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  attendanceButton: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  attendingButton: {
    backgroundColor: '#f44336',
  },
  notAttendingButton: {
    backgroundColor: '#2196F3',
  },
  noMatches: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 16,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  attendeesList: {
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
  },
  attendeesTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  attendeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  attendeeName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  attendeeStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmedStatus: {
    color: '#4CAF50',
  },
  pendingStatus: {
    color: '#FFA000',
  },
  affiliationsSection: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  affiliationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  affiliationName: {
    fontSize: 16,
    color: '#333',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 6,
  },
  affiliationButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  pendingBanner: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  pendingText: {
    color: '#F57C00',
    fontSize: 16,
    fontWeight: '500',
  },
  affiliationStatus: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  affiliationText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '500',
  },
}); 