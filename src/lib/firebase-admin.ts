import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

let cachedAuth: any = null;

export function getAdminAuth() {
  if (!cachedAuth) {
    let projectId = 'education-dz-lab';
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.projectId) projectId = config.projectId;
      }
    } catch (e) {
      console.warn('Could not read firebase-applet-config.json, using default projectId', e);
    }

    if (!getApps().length) {
      initializeApp({ projectId });
    }
    cachedAuth = getAuth();
  }
  return cachedAuth;
}

export const adminAuth = {
  verifyIdToken: async (token: string) => {
    const auth = getAdminAuth();
    return auth.verifyIdToken(token);
  }
};

