import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Resident, APIResponse } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ResidentContextType {
  residents: Resident[];
  isLoading: boolean;
  fetchResidents: (force?: boolean) => Promise<void>;
}

const ResidentContext = createContext<ResidentContextType | undefined>(undefined);

export function ResidentProvider({ children }: { children: React.ReactNode }) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchResidents = useCallback(async (force = false) => {
    if (!force && hasFetched) return; // Prevent unnecessary refetches

    setIsLoading(true);
    try {
      const response = await api.get<APIResponse<Resident[]>>('/residents');
      if (response.data.success) {
        setResidents(response.data.data);
        setHasFetched(true);
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Gagal mengambil data penghuni');
    } finally {
      setIsLoading(false);
    }
  }, [hasFetched]);

  // Optionally prefetch on mount, removing for lazy-fetching when needed
  // Or fetch immediately, let's just make it available when called to avoid
  // hitting API if we just navigate to dashboard where it's not needed.

  return (
    <ResidentContext.Provider value={{ residents, isLoading, fetchResidents }}>
      {children}
    </ResidentContext.Provider>
  );
}

export function useResident() {
  const context = useContext(ResidentContext);
  if (context === undefined) {
    throw new Error('useResident must be used within a ResidentProvider');
  }
  return context;
}
