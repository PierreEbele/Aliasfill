// Submits the Chrome package to Microsoft Edge Add-ons (Update REST API v1.1): upload it as the draft, then publish
// the draft. Microsoft then reviews it; this script does not wait for the review.
// https://learn.microsoft.com/microsoft-edge/extensions/update/api/using-addons-api
// The product must exist (first version submitted by hand in Partner Center).
// Usage: EDGE_CLIENT_ID=… EDGE_API_KEY=… EDGE_PRODUCT_ID=… node scripts/publish-edge.mjs dist/aliasfill-X.Y.Z-chrome.zip
import fs from "node:fs";

const API = "https://api.addons.microsoftedge.microsoft.com/v1";
const { EDGE_CLIENT_ID, EDGE_API_KEY, EDGE_PRODUCT_ID } = process.env;
const file = process.argv[2];
if (!EDGE_CLIENT_ID || !EDGE_API_KEY || !EDGE_PRODUCT_ID || !file) {
  console.error("usage: EDGE_CLIENT_ID=… EDGE_API_KEY=… EDGE_PRODUCT_ID=… node scripts/publish-edge.mjs <package.zip>");
  process.exit(2);
}
const headers = { Authorization: `ApiKey ${EDGE_API_KEY}`, "X-ClientID": EDGE_CLIENT_ID };
const product = `${API}/products/${encodeURIComponent(EDGE_PRODUCT_ID)}`;

// Starts an operation (202 + Location) and returns its id.
async function start(url, init) {
  const res = await fetch(url, { method: "POST", ...init, headers: { ...headers, ...init.headers } });
  if (res.status !== 202) throw new Error(`${url}: HTTP ${res.status} ${await res.text()}`);
  const location = res.headers.get("location") || "";
  return location.split("/").filter(Boolean).pop();
}

// Polls an operation until it leaves InProgress (up to 5 minutes).
async function wait(url) {
  for (let i = 0; i < 60; i++) {
    const res = await fetch(url, { headers });
    const body = res.status === 204 ? {} : await res.json().catch(() => ({}));
    if (body.status && body.status !== "InProgress") return body;
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error(`${url}: still in progress after 5 minutes`);
}

const fail = (step, result) => {
  console.error(`${step} failed: ${result.message || result.errorCode || "unknown error"}`);
  for (const e of result.errors || []) console.error(`- ${e.message || JSON.stringify(e)}`);
  process.exit(1);
};

const upload = await start(`${product}/submissions/draft/package`, {
  body: fs.readFileSync(file),
  headers: { "Content-Type": "application/zip" },
});
const uploaded = await wait(`${product}/submissions/draft/package/operations/${upload}`);
if (uploaded.status !== "Succeeded") fail("Upload", uploaded);
console.log(`Uploaded ${file} as the draft.`);

const publish = await start(`${product}/submissions`, {
  body: JSON.stringify({ notes: `Aliasfill ${process.env.GITHUB_REF_NAME || ""}: see the GitHub release notes.`.trim() }),
  headers: { "Content-Type": "application/json" },
});
const published = await wait(`${product}/submissions/operations/${publish}`);
if (published.status !== "Succeeded") fail("Publish", published);
console.log("Draft submitted for review on Microsoft Edge Add-ons.");
