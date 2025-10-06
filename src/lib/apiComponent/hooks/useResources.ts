import { useState, useCallback } from 'react';
import { api } from '../apiClient';
import { resourceEndpoints } from '../endpoints';
import {
  Resource,
  ResourceResponseDto,
  ResourceQueryParams
} from '../types';

// ==================== RESOURCES HOOKS ====================

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getResources = useCallback(async (params?: ResourceQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.isPremium !== undefined) queryParams.append('isPremium', params.isPremium.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `${resourceEndpoints.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<ResourceResponseDto[]>(url, { isPublicRoute: true });
      
      setResources(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resources');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCategories = useCallback(async (): Promise<string[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<string[]>(resourceEndpoints.categories, { isPublicRoute: true });
      
      setCategories(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchResources = useCallback(async (query: string): Promise<ResourceResponseDto[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ResourceResponseDto[]>(
        `${resourceEndpoints.search}?q=${encodeURIComponent(query)}`,
        { isPublicRoute: true }
      );
      
      setResources(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to search resources');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getResourceById = useCallback(async (id: string): Promise<ResourceResponseDto> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ResourceResponseDto>(
        resourceEndpoints.details(id),
        { isPublicRoute: true }
      );
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resource');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadResource = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post(resourceEndpoints.download(id));
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to download resource');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    resources,
    categories,
    isLoading,
    error,
    getResources,
    getCategories,
    searchResources,
    getResourceById,
    downloadResource,
  };
};
