import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Court, getCourtById } from '../database/courts';
import { User, approveAffiliation, denyAffiliation, getCurrentUser, getPendingAffiliations } from '../database/users';

interface AffiliationRequest {
  court: Court;
  user: User;
}

export const AffiliationsScreen = () => {
  const [pendingRequests, setPendingRequests] = useState<AffiliationRequest[]>([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = () => {
    if (!currentUser) return;

    // Get all courts created by the current user
    const createdCourts = currentUser.createdCourts
      .map(courtId => getCourtById(courtId))
      .filter((court): court is Court => court !== undefined);

    // Get pending affiliations for each court
    const allRequests: AffiliationRequest[] = [];
    createdCourts.forEach(court => {
      const pendingUsers = getPendingAffiliations(court.id);
      pendingUsers.forEach(user => {
        allRequests.push({ court, user });
      });
    });

    setPendingRequests(allRequests);
  };

  const handleApprove = async (courtId: string, userId: string) => {
    const result = await approveAffiliation(courtId, userId);
    if (result.success) {
      loadPendingRequests();
    }
  };

  const handleDeny = async (courtId: string, userId: string) => {
    const result = await denyAffiliation(courtId, userId);
    if (result.success) {
      loadPendingRequests();
    }
  };

  const renderItem = ({ item }: { item: AffiliationRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Text style={styles.courtName}>{item.court.name}</Text>
        <Text style={styles.userName}>{item.user.name}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.approveButton]}
          onPress={() => handleApprove(item.court.id, item.user.id)}
        >
          <Text style={styles.buttonText}>Aprovar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.denyButton]}
          onPress={() => handleDeny(item.court.id, item.user.id)}
        >
          <Text style={styles.buttonText}>Recusar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Por favor, faça login para gerenciar afiliações.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitações de Afiliação Pendentes</Text>
      {pendingRequests.length === 0 ? (
        <Text style={styles.message}>Nenhuma solicitação de afiliação pendente.</Text>
      ) : (
        <FlatList
          data={pendingRequests}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.court.id}-${item.user.id}`}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  list: {
    flex: 1,
  },
  requestItem: {
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
  requestInfo: {
    marginBottom: 12,
  },
  courtName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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