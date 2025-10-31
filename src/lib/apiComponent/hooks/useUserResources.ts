import { useCallback, useState } from 'react';
import { userResourceEndpoints } from '../endpoints';
import { getApiBaseUrl } from '@/config/environment-configuration';
import { api, tokenManager } from '../apiClient';

export type UserResourceType = 'ENGAGEMENT_DOCUMENT' | 'CERTIFICATE';

export interface UserResourceDto {
  id: string;
  type: UserResourceType;
  title: string;
  description?: string;
  userId?: string;
  challengeId?: string;
  participantId?: string;
  available?: boolean;
  availableAt?: string | null;
  certificateWillBeAvailableAt?: string | null;
  challengeEnded?: boolean;
  challengeEndDate?: string | null;
  fileUrl?: string | null;
  filePath?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  storageProvider?: string | null;
  storageBucket?: string | null;
  storageRegion?: string | null;
  objectKey?: string | null;
  eTag?: string | null;
  checksum?: string | null;
  signedUrl?: string | null;
  signedUrlExpiresAt?: string | null;
  isExternal?: boolean;
  externalUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  downloadCount?: number;
  lastDownloadedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListUserResourcesParams {
  type?: UserResourceType;
  challengeId?: string;
}

export function useUserResources() {
  const [resources, setResources] = useState<UserResourceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractData = <T,>(resp: unknown): T | undefined => {
    if (resp && typeof resp === 'object') {
      const obj = resp as Record<string, unknown>;
      if ('data' in obj) return obj.data as T;
    }
    return resp as T;
  };

  const list = useCallback(async (params?: ListUserResourcesParams): Promise<UserResourceDto[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<unknown>(userResourceEndpoints.list(params));
      const payload = extractData<unknown>(response) ?? [];
      const raw = payload as unknown;
      const data: UserResourceDto[] = Array.isArray(raw) ? raw : [];
      setResources(data);
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch user resources';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(async (resourceId: string): Promise<UserResourceDto> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<unknown>(userResourceEndpoints.details(resourceId));
      const data = (extractData<UserResourceDto>(response) ?? response) as UserResourceDto;
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch user resource';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const download = useCallback(async (resourceId: string, suggestedFilename?: string): Promise<void> => {
    const url = `${getApiBaseUrl()}/${userResourceEndpoints.download(resourceId).replace(/^\//, '')}`;
    const token = tokenManager.getToken();
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`Download failed (${res.status})`);
    }
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^";]+)"?/i);
    const filename = suggestedFilename || (match ? match[1] : 'document.pdf');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }, []);

  const remove = useCallback(async (resourceId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(userResourceEndpoints.delete(resourceId));
      setResources(prev => prev.filter(r => r.id !== resourceId));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete user resource';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { resources, loading, error, list, get, download, remove };
}


