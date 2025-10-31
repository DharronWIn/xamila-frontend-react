import { useState, useEffect, useCallback } from 'react';
import { api } from '../apiClient';
import { authEndpoints } from '../endpoints';

export interface Country {
  name: string;
  alpha2Code: string;
  alpha3Code: string;
  callingCode: string;
  flag: string;
  translations: {
    fr?: string;
    [key: string]: string | undefined;
  };
}

export interface CountriesResponse {
  countries: Country[];
  total: number;
}

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCountries = useCallback(async () => {
    // Vérifier si les pays sont déjà en cache
    const cached = localStorage.getItem('countries_cache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Cache valide pendant 24 heures
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setCountries(data.countries || data || []);
          return;
        }
      } catch (e) {
        // Cache invalide, on continue pour récupérer depuis l'API
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      // L'apiClient extrait déjà les données, donc response contient directement CountriesResponse
      const response = await api.get<CountriesResponse>(authEndpoints.countries, { isPublicRoute: true });

      // Extraire les pays de la réponse
      const countriesData = response.countries || [];
      
      // Sauvegarder en cache
      localStorage.setItem(
        'countries_cache',
        JSON.stringify({
          data: { countries: countriesData, total: countriesData.length },
          timestamp: Date.now(),
        })
      );

      setCountries(countriesData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la récupération des pays');
      setError(error);
      console.error('Error fetching countries:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // Fonction pour obtenir un pays par son code
  const getCountryByCode = useCallback(
    (code: string): Country | undefined => {
      return countries.find(
        (c) => c.alpha2Code === code || c.alpha3Code === code
      );
    },
    [countries]
  );

  // Fonction pour obtenir un pays par son code d'appel
  const getCountryByCallingCode = useCallback(
    (callingCode: string): Country | undefined => {
      return countries.find((c) => c.callingCode === callingCode);
    },
    [countries]
  );

  return {
    countries,
    isLoading,
    error,
    refetch: fetchCountries,
    getCountryByCode,
    getCountryByCallingCode,
  };
};

