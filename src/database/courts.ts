// Court type definition
export interface Court {
  id: string;
  name: string;
  location: string;
  address: string;
  city: string;
  neighborhood: string;
  whatsApp: string;
  photo: string;
  responsible: string;
  isAvailable: boolean;
  surface: string;
  dimensions: {
    width: number;
    length: number;
  };
  creatorId: string | null; // ID of the user who created the court
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
}

// In-memory storage
let courts: Court[] = [];

// Generate a simple unique ID (for demo purposes)
const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Create a new court
export const addCourt = (courtData: Omit<Court, 'id' | 'creatorId'>, creatorId: string | null): Court => {
  const newCourt: Court = {
    ...courtData,
    id: generateId(),
    creatorId,
  };
  courts.push(newCourt);
  return newCourt;
};

// Get all courts
export const getAllCourts = (): Court[] => {
  return [...courts];
};

// Get a single court by ID
export const getCourtById = (id: string): Court | undefined => {
  return courts.find(court => court.id === id);
};

// Update a court
export const updateCourt = (id: string, courtData: Partial<Court>): Court | undefined => {
  const index = courts.findIndex(court => court.id === id);
  if (index === -1) return undefined;

  courts[index] = {
    ...courts[index],
    ...courtData,
  };
  return courts[index];
};

// Delete a court
export const deleteCourt = (id: string): boolean => {
  const initialLength = courts.length;
  courts = courts.filter(court => court.id !== id);
  return courts.length !== initialLength;
};

// Initialize with some sample courts
export const initializeSampleCourts = () => {
  if (courts.length === 0) {
    addCourt({
      name: "Central Court",
      location: "Main Complex",
      address: "Rua das Quadras, 123",
      city: "São Paulo",
      neighborhood: "Vila Olímpia",
      whatsApp: "5511999999999",
      photo: "https://example.com/court1.jpg",
      responsible: "João Silva",
      isAvailable: true,
      surface: "Hard",
      dimensions: {
        width: 10.97,
        length: 23.77
      },
      schedule: {
        dayOfWeek: "Saturday",
        startTime: "09:00",
        endTime: "12:00"
      }
    }, null);

    addCourt({
      name: "Practice Court 1",
      location: "Training Area",
      address: "Avenida do Esporte, 456",
      city: "São Paulo",
      neighborhood: "Moema",
      whatsApp: "5511988888888",
      photo: "https://example.com/court2.jpg",
      responsible: "Maria Santos",
      isAvailable: true,
      surface: "Clay",
      dimensions: {
        width: 10.97,
        length: 23.77
      },
      schedule: {
        dayOfWeek: "Sunday",
        startTime: "15:00",
        endTime: "18:00"
      }
    }, null);
  }
};

// Search courts by city and neighborhood
export const searchCourts = (city?: string, neighborhood?: string): Court[] => {
  return courts.filter(court => {
    const matchCity = !city || court.city.toLowerCase().includes(city.toLowerCase());
    const matchNeighborhood = !neighborhood || court.neighborhood.toLowerCase().includes(neighborhood.toLowerCase());
    return matchCity && matchNeighborhood;
  });
};

// Get courts by creator ID
export const getCourtsByCreatorId = (creatorId: string | null): Court[] => {
  if (!creatorId) return [];
  return courts.filter(court => court.creatorId === creatorId);
}; 