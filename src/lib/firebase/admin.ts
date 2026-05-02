import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

const globalForFirebaseAdmin = globalThis as unknown as {
  firebaseAdmin: App | undefined;
};

function getFirebaseAdminApp(): App {
  if (globalForFirebaseAdmin.firebaseAdmin) {
    return globalForFirebaseAdmin.firebaseAdmin;
  }

  if (getApps().length > 0) {
    const app = getApps()[0];
    globalForFirebaseAdmin.firebaseAdmin = app;
    return app;
  }

  const rawServiceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT || "{}";
  const cleanServiceAccount = rawServiceAccount.startsWith("'") && rawServiceAccount.endsWith("'")
    ? rawServiceAccount.slice(1, -1)
    : rawServiceAccount;

  const serviceAccount = JSON.parse(cleanServiceAccount);

  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  globalForFirebaseAdmin.firebaseAdmin = app;
  return app;
}

export const adminApp = getFirebaseAdminApp();
export const adminAuth: Auth = getAuth(adminApp);
