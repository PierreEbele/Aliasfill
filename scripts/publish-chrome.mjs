// Submits the Chrome package to the Chrome Web Store (API v2): upload it to the existing item, then publish it.
// Google then reviews it; this script does not wait for the review.
// https://developer.chrome.com/docs/webstore/using-api
// Auth: a service account linked to the publisher (Developer Dashboard → Account), signed in with its JSON key.
// Usage: CWS_SERVICE_ACCOUNT_KEY='{…json key…}' CWS_PUBLISHER_ID=… CWS_ITEM_ID=… node scripts/publish-chrome.mjs dist/aliasfill-X.Y.Z-chrome.zip
import crypto from "node:crypto";
import fs from "node:fs";

const { CWS_SERVICE_ACCOUNT_KEY, CWS_PUBLISHER_ID, CWS_ITEM_ID } = process.env;
const file = process.argv[2];
if (!CWS_SERVICE_ACCOUNT_KEY || !CWS_PUBLISHER_ID || !CWS_ITEM_ID || !file) {
  console.error("usage: CWS_SERVICE_ACCOUNT_KEY=… CWS_PUBLISHER_ID=… CWS_ITEM_ID=… node scripts/publish-chrome.mjs <package.zip>");
  process.exit(2);
}
const SCOPE = "https://www.googleapis.com/auth/chromewebstore";
const item = `publishers/${encodeURIComponent(CWS_PUBLISHER_ID)}/items/${encodeURIComponent(CWS_ITEM_ID)}`;

// OAuth 2.0 JWT bearer flow for a service account: a signed assertion exchanged for a one-hour access token.
async function accessToken() {
  const key = JSON.parse(CWS_SERVICE_ACCOUNT_KEY);
  const b64 = (v) => Buffer.from(typeof v === "string" ? v : JSON.stringify(v)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: key.client_email,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`token: HTTP ${res.status} ${JSON.stringify(body)}`);
  return body.access_token;
}

const token = await accessToken();
async function call(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers } });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status} ${text}`);
  return body;
}

let upload = await call(`https://chromewebstore.googleapis.com/upload/v2/${item}:upload`, {
  method: "POST",
  headers: { "Content-Type": "application/zip" },
  body: fs.readFileSync(file),
});
// Large packages are processed asynchronously: poll until the upload leaves IN_PROGRESS (up to 5 minutes).
for (let i = 0; upload.uploadState === "IN_PROGRESS" && i < 60; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  const status = await call(`https://chromewebstore.googleapis.com/v2/${item}:fetchStatus`);
  upload = { ...upload, uploadState: status.lastAsyncUploadState ?? status.uploadState ?? upload.uploadState };
}
if (upload.uploadState !== "SUCCEEDED") {
  console.error(`Upload failed: ${JSON.stringify(upload)}`);
  process.exit(1);
}
console.log(`Uploaded ${file}.`);

const published = await call(`https://chromewebstore.googleapis.com/v2/${item}:publish`, { method: "POST" });
console.log(`Submitted for review on the Chrome Web Store: ${JSON.stringify(published)}`);
