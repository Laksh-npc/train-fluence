import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Prefer inline JSON, then GOOGLE_APPLICATION_CREDENTIALS path, then local file fallback
const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const projectIdEnv = process.env.FIREBASE_PROJECT_ID;
const gacPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let creds;

if (inlineJson) {
  try {
    creds = JSON.parse(inlineJson);
  } catch (e) {
    console.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON. Falling back...', e);
  }
}

if (!creds && gacPath && fs.existsSync(gacPath)) {
  try {
    const fileContent = fs.readFileSync(gacPath, 'utf8');
    creds = JSON.parse(fileContent);
  } catch (e) {
    console.error('Failed to read GOOGLE_APPLICATION_CREDENTIALS file. Falling back...', e);
  }
}

if (!creds) {
  const localPath = path.resolve(process.cwd(), 'firebase-service-account.json');
  if (fs.existsSync(localPath)) {
    try {
      const fileContent = fs.readFileSync(localPath, 'utf8');
      creds = JSON.parse(fileContent);
    } catch (e) {
      console.error('Failed to read local firebase-service-account.json. Falling back...', e);
    }
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: creds
      ? admin.credential.cert(creds)
      : admin.credential.applicationDefault(),
    projectId: projectIdEnv || creds?.project_id,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();


