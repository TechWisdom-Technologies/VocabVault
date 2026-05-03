import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

const globalForFirebaseAdmin = globalThis as unknown as {
  firebaseAdmin: App | undefined;
  firebaseAdminAuth: Auth | undefined;
};

type ServiceAccountInput = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function getServiceAccountFromEnv(): ServiceAccountInput {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  console.log("Firebase Env Check:", {
    hasProjectId: !!projectId,
    hasClientEmail: !!clientEmail,
    hasPrivateKey: !!privateKey,
    keyLength: privateKey?.length || 0
  });

  // Prefer split env vars to keep per-function environment payload small on Netlify/AWS Lambda.
  if (projectId && clientEmail && privateKey) {
    let cleanKey = privateKey.replace(/\\n/g, "\n").trim();
    if (!cleanKey.includes("-----BEGIN PRIVATE KEY-----")) {
      cleanKey = `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----`;
    }
    return { projectId, clientEmail, privateKey: cleanKey };
  }

  const rawServiceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT || "{}";
  const cleanServiceAccount =
    rawServiceAccount.startsWith("'") && rawServiceAccount.endsWith("'")
      ? rawServiceAccount.slice(1, -1)
      : rawServiceAccount;

  const parsed = JSON.parse(cleanServiceAccount);

  // Standard Firebase exports use snake_case
  const pId = parsed.projectId || parsed.project_id;
  const cEmail = parsed.clientEmail || parsed.client_email;
  const pKey = parsed.privateKey || parsed.private_key;

  if (!pId || !cEmail || !pKey) {
    console.error("Critical: All Firebase Admin Credential methods failed.");
    throw new Error(
      "Firebase Admin credentials missing. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY or FIREBASE_ADMIN_SERVICE_ACCOUNT."
    );
  }

  return {
    projectId: pId,
    clientEmail: cEmail,
    privateKey: pKey.replace(/\\n/g, "\n"),
  };
}

function getFirebaseAdminApp(): App {
  if (globalForFirebaseAdmin.firebaseAdmin) {
    return globalForFirebaseAdmin.firebaseAdmin;
  }

  if (getApps().length > 0) {
    const app = getApps()[0];
    globalForFirebaseAdmin.firebaseAdmin = app;
    return app;
  }

  const serviceAccount = getServiceAccountFromEnv();

  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  globalForFirebaseAdmin.firebaseAdmin = app;
  return app;
}

export function getAdminAuth(): Auth {
  if (globalForFirebaseAdmin.firebaseAdminAuth) {
    return globalForFirebaseAdmin.firebaseAdminAuth;
  }

  const auth = getAuth(getFirebaseAdminApp());
  globalForFirebaseAdmin.firebaseAdminAuth = auth;
  return auth;
}
