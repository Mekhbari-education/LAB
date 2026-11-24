import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { UserRole } from './UserRoleContext';
import { isRouteAllowedForRole } from '../config/permissions';
import { ROUTES } from '../config/routes';

export type FeatureFlagKey =
  | 'aiAssistant'
  | 'scientificSimulators'
  | 'allowSignups'
  | 'supportPortal'
  | 'backupExports';

export interface RoleRouteOverride {
  added?: string[];
  blocked?: string[];
}

export interface GlobalSystemConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceEta: string;
  readOnlyMode: boolean;
  enforceStatutorySetup: boolean;
  features: Record<FeatureFlagKey, boolean>;
  roleRouteOverrides: Partial<Record<UserRole, RoleRouteOverride>>;
  updatedBy?: string;
  updatedAt?: any;
}

export const DEFAULT_SYSTEM_CONFIG: GlobalSystemConfig = {
  maintenanceMode: false,
  maintenanceMessage:
    'تجري حالياً أعمال صيانة وتحديثات تقنية لتحسين أداء المنصة، يرجى المحاولة لاحقاً.',
  maintenanceEta: 'قريباً',
  readOnlyMode: false,
  enforceStatutorySetup: true,
  features: {
    aiAssistant: true,
    scientificSimulators: true,
    allowSignups: true,
    supportPortal: true,
    backupExports: true,
  },
  roleRouteOverrides: {},
};

const SIMULATOR_ROUTES = new Set<string>([
  ROUTES.PERIODIC_TABLE,
  ROUTES.CHEMISTRY_TOOLS,
  ROUTES.ATOM_3D,
  ROUTES.VIRTUAL_LAB,
  ROUTES.EXAO,
  ROUTES.PHYSICS_SIMULATIONS,
  ROUTES.VIRTUAL_MICROSCOPE,
  ROUTES.SCIENTIFIC_CALCULATOR,
  ROUTES.MOLECULAR_VIEWER,
  ROUTES.ASTRONOMY,
  ROUTES.EARTH_SCIENCES,
  ROUTES.ANATOMY,
]);

interface SystemConfigContextValue {
  config: GlobalSystemConfig;
  loading: boolean;
  isFeatureEnabled: (key: FeatureFlagKey) => boolean;
  isRouteEffectivelyAllowed: (
    role: UserRole | string | null | undefined,
    path: string,
    isOwner?: boolean
  ) => boolean;
}

const SystemConfigContext = createContext<SystemConfigContextValue>({
  config: DEFAULT_SYSTEM_CONFIG,
  loading: false,
  isFeatureEnabled: () => true,
  isRouteEffectivelyAllowed: (role, path, isOwner) => {
    const clean = path.split('?')[0].split('#')[0];
    if (clean === ROUTES.ADMIN || clean.startsWith(`${ROUTES.ADMIN}/`)) {
      return Boolean(isOwner);
    }
    return isRouteAllowedForRole(role, path);
  },
});

export function SystemConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GlobalSystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const ref = doc(db, 'system_config', 'global');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<GlobalSystemConfig>;
          setConfig({
            maintenanceMode: Boolean(data.maintenanceMode),
            maintenanceMessage: data.maintenanceMessage || DEFAULT_SYSTEM_CONFIG.maintenanceMessage,
            maintenanceEta: data.maintenanceEta || DEFAULT_SYSTEM_CONFIG.maintenanceEta,
            readOnlyMode: Boolean(data.readOnlyMode),
            enforceStatutorySetup:
              data.enforceStatutorySetup !== undefined
                ? Boolean(data.enforceStatutorySetup)
                : true,
            features: {
              ...DEFAULT_SYSTEM_CONFIG.features,
              ...(data.features || {}),
            },
            roleRouteOverrides: data.roleRouteOverrides || {},
            updatedBy: data.updatedBy,
            updatedAt: data.updatedAt,
          });
        } else {
          setConfig(DEFAULT_SYSTEM_CONFIG);
        }
        setLoading(false);
      },
      () => {
        // Fallback to safe defaults if offline or uninitialized
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const isFeatureEnabled = useCallback(
    (key: FeatureFlagKey) => config.features[key] !== false,
    [config.features]
  );

  const isRouteEffectivelyAllowed = useCallback(
    (role: UserRole | string | null | undefined, path: string, isOwner = false): boolean => {
      const cleanPath = path.split('?')[0].split('#')[0];

      if (cleanPath === ROUTES.ADMIN || cleanPath.startsWith(`${ROUTES.ADMIN}/`)) {
        return Boolean(isOwner);
      }

      if (!isOwner) {
        if (cleanPath === ROUTES.LAB_ASSISTANT && !config.features.aiAssistant) return false;
        if (SIMULATOR_ROUTES.has(cleanPath) && !config.features.scientificSimulators) return false;
        if (cleanPath === ROUTES.SUPPORT && !config.features.supportPortal) return false;
        if (cleanPath === ROUTES.BACKUP_CENTER && !config.features.backupExports) return false;
      }

      if (!role) return false;
      const roleKey = role as UserRole;
      const override = config.roleRouteOverrides?.[roleKey];

      if (override?.blocked?.some((r) => r === cleanPath || cleanPath.startsWith(`${r}/`))) {
        return false;
      }
      if (override?.added?.some((r) => r === cleanPath || cleanPath.startsWith(`${r}/`))) {
        return true;
      }

      return isRouteAllowedForRole(roleKey, cleanPath);
    },
    [config]
  );

  const value = useMemo(
    () => ({ config, loading, isFeatureEnabled, isRouteEffectivelyAllowed }),
    [config, loading, isFeatureEnabled, isRouteEffectivelyAllowed]
  );

  return <SystemConfigContext.Provider value={value}>{children}</SystemConfigContext.Provider>;
}

export function useSystemConfig() {
  return useContext(SystemConfigContext);
}
