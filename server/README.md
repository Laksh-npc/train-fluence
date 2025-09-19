Train Fluence Backend (Node.js + Express + Firebase Admin)

What you need to provide
- A Firebase service account JSON (Firebase Console → Project settings → Service accounts → Generate new private key).

You do NOT need to create any code files. This backend accepts credentials via environment variables.

Environment variables (choose ONE method)

Option A: Point to a file path (recommended)
- GOOGLE_APPLICATION_CREDENTIALS: absolute path to your service-account.json

Option B: Paste JSON directly
- FIREBASE_SERVICE_ACCOUNT_JSON: the entire JSON as a single line
- FIREBASE_PROJECT_ID: your project id (e.g. train-25c2c)

Run locally (PowerShell on Windows)
1) cd C:\Users\llaks\OneDrive\Desktop\train-fluence\server
2) npm i
3) Set env:
   - $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
   - OR
   - $env:FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"train-25c2c","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"..."}'
     $env:FIREBASE_PROJECT_ID="train-25c2c"
4) npm run seed
5) npm run dev (http://localhost:3001)

API endpoints
- GET /api/health
- GET /api/trains
- GET /api/corridor-stats
- POST /api/upload (JSON body or text/csv)

Notes
- Admin SDK bypasses Firestore rules; use this backend for privileged operations.
- Do not commit your service account JSON.
- If using Option B, ensure the private_key retains \n line breaks as shown.

