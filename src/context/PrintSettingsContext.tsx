import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { PrintSettings, DEFAULT_PRINT_SETTINGS, PrintPreviewData } from '../types/printSettings';
import { useSchool } from './SchoolContext';
import { PrintService } from '../services/printService';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'algeria_lab_print_settings';

interface PrintSettingsContextType {
  settings: PrintSettings;
  updateSettings: (partial: Partial<PrintSettings> | ((prev: PrintSettings) => PrintSettings)) => void;
  resetSettings: () => void;
  saveSettingsToCloud: () => Promise<boolean>;
  isSaving: boolean;
  printTestPage: () => Promise<void>;
  printReport: (data: PrintPreviewData, overrideSettings?: Partial<PrintSettings>) => Promise<void>;
  printHtml: (html: string, options?: { title?: string }) => Promise<void>;
  openPrintPreview: (data: PrintPreviewData) => void;
  closePrintPreview: () => void;
  isPreviewOpen: boolean;
  previewData: PrintPreviewData | null;
}

const PrintSettingsContext = createContext<PrintSettingsContextType | undefined>(undefined);

export function PrintSettingsProvider({ children }: { children: React.ReactNode }) {
  const { schoolName, directorate, jobTitle } = useSchool();
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PrintPreviewData | null>(null);

  // Initialize settings from localStorage or defaults
  const [settings, setSettings] = useState<PrintSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...DEFAULT_PRINT_SETTINGS,
            ...parsed,
            institution: {
              ...DEFAULT_PRINT_SETTINGS.institution,
              ...(parsed.institution || {})
            },
            layout: {
              ...DEFAULT_PRINT_SETTINGS.layout,
              ...(parsed.layout || {})
            },
            appearance: {
              ...DEFAULT_PRINT_SETTINGS.appearance,
              ...(parsed.appearance || {})
            },
            signatures: {
              ...DEFAULT_PRINT_SETTINGS.signatures,
              ...(parsed.signatures || {})
            },
            qrSticker: {
              ...DEFAULT_PRINT_SETTINGS.qrSticker,
              ...(parsed.qrSticker || {})
            }
          };
        }
      } catch (e) {
        console.warn('Error reading print settings from localStorage:', e);
      }
    }
    return DEFAULT_PRINT_SETTINGS;
  });

  // Sync institution defaults from SchoolContext if current settings are blank or default placeholders
  useEffect(() => {
    if (schoolName && schoolName !== 'ثانوية عامة') {
      setSettings(prev => {
        // If current school is the default placeholder, auto-populate from school context
        if (prev.institution.school === DEFAULT_PRINT_SETTINGS.institution.school || !prev.institution.school) {
          return {
            ...prev,
            institution: {
              ...prev.institution,
              school: schoolName,
              directorate: directorate && directorate !== 'مديرية التربية' ? directorate : prev.institution.directorate
            },
            signatures: {
              ...prev.signatures,
              labManagerTitle: jobTitle || prev.signatures.labManagerTitle
            }
          };
        }
        return prev;
      });
    }
  }, [schoolName, directorate, jobTitle]);

  // Load from Firestore if logged in
  useEffect(() => {
    const loadCloudSettings = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, 'settings', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.printSettings) {
            setSettings(prev => ({
              ...prev,
              ...data.printSettings,
              institution: {
                ...prev.institution,
                ...(data.printSettings.institution || {})
              },
              layout: {
                ...prev.layout,
                ...(data.printSettings.layout || {})
              },
              appearance: {
                ...prev.appearance,
                ...(data.printSettings.appearance || {})
              },
              signatures: {
                ...prev.signatures,
                ...(data.printSettings.signatures || {})
              },
              qrSticker: {
                ...prev.qrSticker,
                ...(data.printSettings.qrSticker || {})
              }
            }));
          }
        }
      } catch (err) {
        console.warn('Failed to load cloud print settings:', err);
      }
    };

    loadCloudSettings();
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save print settings to localStorage:', e);
    }
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<PrintSettings> | ((prev: PrintSettings) => PrintSettings)) => {
    setSettings(prev => {
      if (typeof partial === 'function') {
        return partial(prev);
      }
      return {
        ...prev,
        ...partial,
        institution: {
          ...prev.institution,
          ...(partial.institution || {})
        },
        layout: {
          ...prev.layout,
          ...(partial.layout || {})
        },
        appearance: {
          ...prev.appearance,
          ...(partial.appearance || {})
        },
        signatures: {
          ...prev.signatures,
          ...(partial.signatures || {})
        },
        qrSticker: {
          ...prev.qrSticker,
          ...(partial.qrSticker || {})
        },
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  const resetSettings = useCallback(() => {
    const reset = {
      ...DEFAULT_PRINT_SETTINGS,
      institution: {
        ...DEFAULT_PRINT_SETTINGS.institution,
        school: schoolName !== 'ثانوية عامة' ? schoolName : DEFAULT_PRINT_SETTINGS.institution.school,
        directorate: directorate !== 'مديرية التربية' ? directorate : DEFAULT_PRINT_SETTINGS.institution.directorate
      },
      signatures: {
        ...DEFAULT_PRINT_SETTINGS.signatures,
        labManagerTitle: jobTitle || DEFAULT_PRINT_SETTINGS.signatures.labManagerTitle
      }
    };
    setSettings(reset);
  }, [schoolName, directorate, jobTitle]);

  const saveSettingsToCloud = useCallback(async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) return false;

    setIsSaving(true);
    try {
      const docRef = doc(db, 'settings', user.uid);
      await setDoc(docRef, { printSettings: settings }, { merge: true });
      return true;
    } catch (err) {
      console.error('Failed to save print settings to Firestore:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const printTestPage = useCallback(async () => {
    await PrintService.printTestPage(settings);
  }, [settings]);

  const printHtml = useCallback(async (html: string, options?: { title?: string }) => {
    await PrintService.printHtml(html, options);
  }, []);

  const printReport = useCallback(async (data: PrintPreviewData, overrideSettings?: Partial<PrintSettings>) => {
    const effectiveSettings: PrintSettings = overrideSettings
      ? {
          ...settings,
          ...overrideSettings,
          institution: { ...settings.institution, ...(overrideSettings.institution || {}) },
          layout: { ...settings.layout, ...(overrideSettings.layout || {}) },
          appearance: { ...settings.appearance, ...(overrideSettings.appearance || {}) },
          signatures: { ...settings.signatures, ...(overrideSettings.signatures || {}) }
        }
      : settings;

    const html = PrintService.generateReportHtml(data, effectiveSettings);
    await PrintService.printHtml(html, { title: data.title });
  }, [settings]);

  const openPrintPreview = useCallback((data: PrintPreviewData) => {
    setPreviewData(data);
    setIsPreviewOpen(true);
  }, []);

  const closePrintPreview = useCallback(() => {
    setIsPreviewOpen(false);
    setPreviewData(null);
  }, []);

  const contextValue = useMemo(() => ({
    settings,
    updateSettings,
    resetSettings,
    saveSettingsToCloud,
    isSaving,
    printTestPage,
    printReport,
    printHtml,
    openPrintPreview,
    closePrintPreview,
    isPreviewOpen,
    previewData
  }), [
    settings,
    updateSettings,
    resetSettings,
    saveSettingsToCloud,
    isSaving,
    printTestPage,
    printReport,
    printHtml,
    openPrintPreview,
    closePrintPreview,
    isPreviewOpen,
    previewData
  ]);

  return (
    <PrintSettingsContext.Provider value={contextValue}>
      {children}
    </PrintSettingsContext.Provider>
  );
}

export function usePrintSettings() {
  const context = useContext(PrintSettingsContext);
  if (!context) {
    throw new Error('usePrintSettings must be used within a PrintSettingsProvider');
  }
  return context;
}
