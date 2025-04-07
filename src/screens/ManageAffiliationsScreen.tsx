import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Court, getCourtById } from '../database/courts';
import { User, approveAffiliation, denyAffiliation, getAffiliatedUsers, getCurrentUser, getPendingAffiliations } from '../database/users';
import { RootStackParamList } from '../types/navigation';

interface AffiliationRequest {
  user: User;
  isPending: boolean;
}

type ManageAffiliationsRouteProp = RouteProp<RootStackParamList, 'ManageAffiliations'>;

export const ManageAffiliationsScreen = () => {
  const route = useRoute<ManageAffiliationsRouteProp>();
  const courtId = route.params.courtId;
  const [court, setCourt] = useState<Court | null>(null);
  const [affiliations, setAffiliations] = useState<AffiliationRequest[]>([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadCourt();
    loadAffiliations();
  }, []);

  const loadCourt = () => {
    const courtData = getCourtById(courtId);
    setCourt(courtData || null);
  };

  const loadAffiliations = () => {
    if (!courtId) return;

    // Get both pending and approved affiliations
    const pendingUsers = getPendingAffiliations(courtId).map(user => ({
      user,
      isPending: true
    }));
    const affiliatedUsers = getAffiliatedUsers(courtId).map(user => ({
      user,
      isPending: false
    }));

    setAffiliations([...pendingUsers, ...affiliatedUsers]);
  };

  const handleApprove = async (userId: string) => {
    const result = await approveAffiliation(courtId, userId);
    if (result.success) {
      Alert.alert('Success', 'Affiliation approved');
      loadAffiliations();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleDeny = async (userId: string) => {
    const result = await denyAffiliation(courtId, userId);
    if (result.success) {
      Alert.alert('Success', 'Affiliation denied');
      loadAffiliations();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const renderItem = ({ item }: { item: AffiliationRequest }) => (
    <View style={styles.affiliationItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.user.name}</Text>
        <Text style={styles.userEmail}>{item.user.email}</Text>
        <Text style={[styles.status, item.isPending ? styles.pending : styles.approved]}>
          {item.isPending ? 'Pending' : 'Approved'}
        </Text>
      </View>
      {item.isPending && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.approveButton]}
            onPress={() => handleApprove(item.user.id)}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.denyButton]}
            onPress={() => handleDeny(item.user.id)}
          >
            <Text style={styles.buttonText}>Deny</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (!currentUser || !court) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Unable to load affiliations.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{court.name}</Text>
        <Text style={styles.subtitle}>Affiliations</Text>
      </View>

      {affiliations.length === 0 ? (
        <Text style={styles.message}>No affiliations found.</Text>
      ) : (
        <FlatList
          data={affiliations}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.user.id}-${item.isPending}`}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  affiliationItem: {
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pending: {
    color: '#FFA000',
  },
  approved: {
    color: '#4CAF50',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  denyButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
}); 