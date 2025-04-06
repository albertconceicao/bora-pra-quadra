import { useEffect, useState } from 'react';
import { addCourt, Court, deleteCourt, getAllCourts, getCourtsByCreatorId, initializeSampleCourts, updateCourt } from '../database/courts';
import { getCurrentUser } from '../database/users';

interface UseCourtOptions {
  userOnly?: boolean;
}

export const useCourts = (options: UseCourtOptions = {}) => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize sample courts and load them
    initializeSampleCourts();
    const currentUser = getCurrentUser();
    
    if (options.userOnly && currentUser) {
      setCourts(getCourtsByCreatorId(currentUser.id));
    } else {
      setCourts(getAllCourts());
    }
    setLoading(false);
  }, [options.userOnly]);

  const createCourt = (courtData: Omit<Court, 'id' | 'creatorId'>) => {
    const currentUser = getCurrentUser();
    const newCourt = addCourt(courtData, currentUser?.id || null);
    
    if (options.userOnly && currentUser) {
      setCourts(getCourtsByCreatorId(currentUser.id));
    } else {
      setCourts(getAllCourts());
    }
    
    return newCourt;
  };

  const modifyCourt = (id: string, courtData: Partial<Court>) => {
    const updatedCourt = updateCourt(id, courtData);
    if (updatedCourt) {
      const currentUser = getCurrentUser();
      if (options.userOnly && currentUser) {
        setCourts(getCourtsByCreatorId(currentUser.id));
      } else {
        setCourts(getAllCourts());
      }
    }
    return updatedCourt;
  };

  const removeCourt = (id: string) => {
    const success = deleteCourt(id);
    if (success) {
      const currentUser = getCurrentUser();
      if (options.userOnly && currentUser) {
        setCourts(getCourtsByCreatorId(currentUser.id));
      } else {
        setCourts(getAllCourts());
      }
    }
    return success;
  };

  return {
    courts,
    loading,
    createCourt,
    modifyCourt,
    removeCourt,
  };
}; 