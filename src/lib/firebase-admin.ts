import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let cachedAuth: any = null;
let cachedFirestore: any = null;

function ensureAdminInitialized() {
  if (!getApps().length) {
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
    initializeApp({ projectId });
  }
}

export function getAdminAuth() {
  if (!cachedAuth) {
    ensureAdminInitialized();
    cachedAuth = getAuth();
  }
  return cachedAuth;
}

export function getAdminFirestore() {
  if (!cachedFirestore) {
    ensureAdminInitialized();
    let dbId: string | undefined;
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        dbId = config.firestoreDatabaseId;
      }
    } catch (e) {
      console.warn('Notice reading databaseId for admin firestore:', e);
    }
    cachedFirestore = dbId ? getFirestore(getApps()[0], dbId) : getFirestore();
  }
  return cachedFirestore;
}

export const adminAuth = {
  verifyIdToken: async (token: string) => {
    const auth = getAdminAuth();
    return auth.verifyIdToken(token);
  }
};
