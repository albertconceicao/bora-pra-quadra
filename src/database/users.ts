export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  name: string;
  favoriteCourts: string[]; // Array of court IDs
  createdCourts: string[]; // Array of court IDs created by this user
  affiliatedCourts: string[]; // Courts the user is affiliated with
  pendingAffiliations: string[]; // Courts where affiliation is pending
}

// In-memory storage
let users: User[] = [];
let currentUser: User | null = null;

// Generate a simple unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Sign Up
export const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
  // Check if user already exists
  if (users.some(user => user.email === email)) {
    return { success: false, message: 'Email already registered' };
  }

  const newUser: User = {
    id: generateId(),
    email,
    password, // In a real app, this would be hashed
    name,
    favoriteCourts: [],
    createdCourts: [],
    affiliatedCourts: [],
    pendingAffiliations: [],
  };

  users.push(newUser);
  currentUser = newUser;
  return { success: true, message: 'User registered successfully' };
};

// Sign In
export const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }

  currentUser = user;
  return { success: true, message: 'Signed in successfully' };
};

// Sign Out
export const signOut = async (): Promise<void> => {
  currentUser = null;
};

// Get Current User
export const getCurrentUser = (): User | null => {
  return currentUser;
};

// Add Court to Favorites
export const addToFavorites = async (courtId: string): Promise<{ success: boolean; message: string }> => {
  if (!currentUser) {
    return { success: false, message: 'User not authenticated' };
  }

  if (currentUser.favoriteCourts.includes(courtId)) {
    return { success: false, message: 'Court already in favorites' };
  }

  const userIndex = users.findIndex(u => u.id === currentUser!.id);
  users[userIndex].favoriteCourts.push(courtId);
  currentUser = users[userIndex];
  
  return { success: true, message: 'Court added to favorites' };
};

// Remove Court from Favorites
export const removeFromFavorites = async (courtId: string): Promise<{ success: boolean; message: string }> => {
  if (!currentUser) {
    return { success: false, message: 'User not authenticated' };
  }

  const userIndex = users.findIndex(u => u.id === currentUser!.id);
  users[userIndex].favoriteCourts = users[userIndex].favoriteCourts.filter(id => id !== courtId);
  currentUser = users[userIndex];
  
  return { success: true, message: 'Court removed from favorites' };
};

// Get User's Favorite Courts
export const getFavoriteCourts = (): string[] => {
  return currentUser?.favoriteCourts || [];
};

// Add Created Court
export const addCreatedCourt = (courtId: string): void => {
  if (!currentUser) return;

  const userIndex = users.findIndex(u => u.id === currentUser!.id);
  users[userIndex].createdCourts.push(courtId);
  currentUser = users[userIndex];
};

// Check if user can edit court
export const canEditCourt = (courtId: string): boolean => {
  if (!currentUser) return false;
  return currentUser.createdCourts.includes(courtId);
};

// Request court affiliation
export const requestAffiliation = async (courtId: string): Promise<{ success: boolean; message: string }> => {
  if (!currentUser) {
    return { success: false, message: 'User not authenticated' };
  }

  if (currentUser.affiliatedCourts.includes(courtId)) {
    return { success: false, message: 'Already affiliated with this court' };
  }

  if (currentUser.pendingAffiliations.includes(courtId)) {
    return { success: false, message: 'Affiliation request already pending' };
  }

  const userIndex = users.findIndex(u => u.id === currentUser!.id);
  users[userIndex].pendingAffiliations.push(courtId);
  currentUser = users[userIndex];
  
  return { success: true, message: 'Affiliation request sent' };
};

// Approve affiliation (court creator only)
export const approveAffiliation = async (courtId: string, userId: string): Promise<{ success: boolean; message: string }> => {
  if (!currentUser) {
    return { success: false, message: 'User not authenticated' };
  }

  if (!canEditCourt(courtId)) {
    return { success: false, message: 'Only court creator can approve affiliations' };
  }

  const targetUser = users.find(u => u.id === userId);
  if (!targetUser) {
    return { success: false, message: 'User not found' };
  }

  if (!targetUser.pendingAffiliations.includes(courtId)) {
    return { success: false, message: 'No pending affiliation request' };
  }

  const userIndex = users.findIndex(u => u.id === userId);
  users[userIndex].pendingAffiliations = users[userIndex].pendingAffiliations.filter(id => id !== courtId);
  users[userIndex].affiliatedCourts.push(courtId);

  return { success: true, message: 'Affiliation approved' };
};

// Get pending affiliations for a court
export const getPendingAffiliations = (courtId: string): User[] => {
  if (!canEditCourt(courtId)) return [];
  return users.filter(user => user.pendingAffiliations.includes(courtId));
};

// Check if user is affiliated with a court
export const isAffiliatedWithCourt = (courtId: string): boolean => {
  if (!currentUser) return false;
  return currentUser.affiliatedCourts.includes(courtId);
};

// Check if user has pending affiliation
export const hasPendingAffiliation = (courtId: string): boolean => {
  if (!currentUser) return false;
  return currentUser.pendingAffiliations.includes(courtId);
};

// Add court to user's affiliated courts
export const addToAffiliatedCourts = (courtId: string, userId: string): void => {
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1 && !users[userIndex].affiliatedCourts.includes(courtId)) {
    users[userIndex].affiliatedCourts.push(courtId);
  }
};

// Deny affiliation (court creator only)
export const denyAffiliation = async (courtId: string, userId: string): Promise<{ success: boolean; message: string }> => {
  if (!currentUser) {
    return { success: false, message: 'User not authenticated' };
  }

  if (!canEditCourt(courtId)) {
    return { success: false, message: 'Only court creator can deny affiliations' };
  }

  const targetUser = users.find(u => u.id === userId);
  if (!targetUser) {
    return { success: false, message: 'User not found' };
  }

  if (!targetUser.pendingAffiliations.includes(courtId)) {
    return { success: false, message: 'No pending affiliation request' };
  }

  const userIndex = users.findIndex(u => u.id === userId);
  users[userIndex].pendingAffiliations = users[userIndex].pendingAffiliations.filter(id => id !== courtId);

  return { success: true, message: 'Affiliation denied' };
};

// Get user's affiliated courts
export const getAffiliatedCourts = (): string[] => {
  return currentUser?.affiliatedCourts || [];
};

// Get all affiliated users for a court
export const getAffiliatedUsers = (courtId: string): User[] => {
  return users.filter(user => user.affiliatedCourts.includes(courtId));
};

// Get all affiliated users for a court (both pending and approved)
export const getAllCourtUsers = (courtId: string): { pending: User[]; affiliated: User[] } => {
  const pending = users.filter(user => user.pendingAffiliations.includes(courtId));
  const affiliated = users.filter(user => user.affiliatedCourts.includes(courtId));
  return { pending, affiliated };
}; 