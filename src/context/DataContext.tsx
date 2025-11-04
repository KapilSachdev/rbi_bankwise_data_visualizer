import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { BankData, DigitalBankingData } from '../types/global.types';
import { DATA_FOLDER } from '../constants/data';

// Small typed fetch helper
async function fetchJson<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return (await res.json()) as T;
}

interface ManifestData {
  neft?: Array<{ file: string; label: string; key: string }>;
  pos?: Array<{ file: string; label: string; key: string }>;
}

interface DataFileMeta {
  file: string;
  label: string;
  key: string;
  type?: string;
}

interface ProcessedData {
  key: string;
  type: string;
  data: unknown;
}

export interface AppDataContextValue {
  posBanksData: { [key: string]: BankData[] };
  digitalBankingData: { [key: string]: DigitalBankingData };
  months: string[];
  latestMonth: string;
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export const useAppData = (): AppDataContextValue => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<DataFileMeta[]>([]);
  const [posData, setPosData] = useState<{ [key: string]: { banks: BankData[]; summary?: unknown } }>({});
  const [digitalBankingData, setDigitalBankingData] = useState<{ [key: string]: Record<string, unknown> }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [posManifest, neftManifest] = await Promise.all([
        fetchJson<ManifestData>(`${DATA_FOLDER.pos}/index.json`),
        fetchJson<ManifestData>(`${DATA_FOLDER.neft}/index.json`),
      ]);

      const allMeta: DataFileMeta[] = [
        ...(neftManifest.neft || []).map((f: DataFileMeta) => ({ ...f, type: 'neft' })),
        ...(posManifest.pos || []).map((f: DataFileMeta) => ({ ...f, type: 'pos' })),
      ];
      setFiles(allMeta);

      const results: ProcessedData[] = await Promise.all(
        allMeta.map(async (f) => {
          const fileType = f.type ?? 'pos';
          const data = await fetchJson<unknown>(`${DATA_FOLDER[fileType]}/${f.file}`);
          return { key: f.key, type: fileType, data } as ProcessedData;
        })
      );

      const pos: { [key: string]: { banks: BankData[]; summary?: unknown } } = {};
      const digital: { [key: string]: Record<string, unknown> } = {};

      results.forEach((result) => {
        const { key, type, data } = result;
        if (type === 'pos') pos[key] = (data as any) as { banks: BankData[]; summary?: unknown };
        if (type === 'neft') digital[key] = data as Record<string, unknown>;
      });

      setPosData(pos);
      setDigitalBankingData(digital);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const months = files.filter(f => f.type === 'pos').map(f => f.key);
  const posBanksData = Object.fromEntries(
    Object.entries(posData).map(([k, v]) => [k, v?.banks ?? []])
  );

  const value: AppDataContextValue = {
    posBanksData,
    digitalBankingData,
    months,
    latestMonth: months[0] || '',
    isLoading,
    error,
    reload: load,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export default AppDataContext;
