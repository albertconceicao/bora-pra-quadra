import { getCurrentUser } from './users';

export interface Match {
  id: string;
  courtId: string;
  creatorId: string;
  date: string;
  time: string;
  maxPlayers: number;
  description: string;
  attendees: {
    userId: string;
    name: string;
    confirmed: boolean;
  }[];
}

// In-memory storage
let matches: Match[] = [];

// Generate a simple unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Create a new match
export const createMatch = (matchData: Omit<Match, 'id' | 'creatorId' | 'attendees'>): Match | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const newMatch: Match = {
    ...matchData,
    id: generateId(),
    creatorId: currentUser.id,
    attendees: [{
      userId: currentUser.id,
      name: currentUser.name,
      confirmed: false
    }]
  };

  matches.push(newMatch);
  return newMatch;
};

// Get matches for a court
export const getMatchesByCourt = (courtId: string): Match[] => {
  return matches.filter(match => match.courtId === courtId);
};

// Get a single match
export const getMatchById = (id: string): Match | undefined => {
  return matches.find(match => match.id === id);
};

// Update match
export const updateMatch = (id: string, matchData: Partial<Omit<Match, 'id' | 'creatorId' | 'attendees'>>): Match | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const matchIndex = matches.findIndex(match => match.id === id);
  if (matchIndex === -1) return null;

  // Only creator can update match details
  if (matches[matchIndex].creatorId !== currentUser.id) return null;

  matches[matchIndex] = {
    ...matches[matchIndex],
    ...matchData,
  };

  return matches[matchIndex];
};

// Delete match
export const deleteMatch = (id: string): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  const match = matches.find(m => m.id === id);
  if (!match || match.creatorId !== currentUser.id) return false;

  matches = matches.filter(match => match.id !== id);
  return true;
};

// Toggle attendance
export const toggleAttendance = (matchId: string): { success: boolean; message: string } => {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, message: 'User not authenticated' };

  const matchIndex = matches.findIndex(match => match.id === matchId);
  if (matchIndex === -1) return { success: false, message: 'Match not found' };

  const attendeeIndex = matches[matchIndex].attendees.findIndex(a => a.userId === currentUser.id);

  if (attendeeIndex === -1) {
    // Add new attendee
    matches[matchIndex].attendees.push({
      userId: currentUser.id,
      name: currentUser.name,
      confirmed: true
    });
  } else {
    // Toggle existing attendee's confirmation
    matches[matchIndex].attendees[attendeeIndex].confirmed = 
      !matches[matchIndex].attendees[attendeeIndex].confirmed;
  }

  return { success: true, message: 'Attendance updated successfully' };
}; 