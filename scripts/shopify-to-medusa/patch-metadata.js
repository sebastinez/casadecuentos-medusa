#!/usr/bin/env node
/**
 * Reads a Shopify product export CSV and patches product.metadata.publisher
 * on each product in Medusa via the Admin API, matched by handle.
 *
 * Usage:
 *   MEDUSA_URL=http://localhost:9000 \
 *   MEDUSA_EMAIL=admin@example.com \
 *   MEDUSA_PASSWORD=supersecret \
 *     node patch-metadata.js <shopify-export.csv>
 *
 * MEDUSA_URL      – base URL of the Medusa backend (default: http://localhost:9000)
 * MEDUSA_EMAIL    – admin user email
 * MEDUSA_PASSWORD – admin user password
 */

const fs = require("fs");
const { parse } = require("csv-parse/sync");

const inputFile = process.argv[2];

if (!inputFile) {
  console.error("Usage: node patch-metadata.js <shopify-export.csv>");
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

const MEDUSA_URL = (process.env.MEDUSA_URL || "http://localhost:9000").replace(
  /\/$/,
  "",
);
const MEDUSA_EMAIL = process.env.MEDUSA_EMAIL;
const MEDUSA_PASSWORD = process.env.MEDUSA_PASSWORD;

if (!MEDUSA_EMAIL || !MEDUSA_PASSWORD) {
  console.error("MEDUSA_EMAIL and MEDUSA_PASSWORD env vars are required");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Parse CSV and collect unique handle → vendor pairs
// ---------------------------------------------------------------------------

const rows = parse(fs.readFileSync(inputFile, "utf8"), {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  trim: true,
});

const handleVendorMap = new Map(); // handle → vendor

for (const row of rows) {
  const handle = row["Handle"];
  const vendor = row["Vendor"];
  if (handle && vendor && !handleVendorMap.has(handle)) {
    handleVendorMap.set(handle, vendor);
  }
}

console.log(`Found ${handleVendorMap.size} products with vendor data\n`);

// ---------------------------------------------------------------------------
// Patch each product via the Medusa Admin API
// ---------------------------------------------------------------------------

async function run() {
  const token = await authenticate();

  let patched = 0;
  let skipped = 0;
  let failed = 0;

  for (const [handle, vendor] of handleVendorMap) {
    const sanitizedHandle = sanitizeHandle(handle);

    let product;
    try {
      const { products } = await fetchJson(
        token,
        `/admin/products?handle=${encodeURIComponent(sanitizedHandle)}&limit=1`,
      );
      product = products?.[0];
    } catch (err) {
      console.error(`  ERROR looking up "${sanitizedHandle}": ${err.message}`);
      failed++;
      continue;
    }

    if (!product) {
      console.warn(`  SKIP "${sanitizedHandle}" — not found in Medusa`);
      skipped++;
      continue;
    }

    // Merge publisher into existing metadata so we don't clobber other keys
    const updatedMetadata = { ...(product.metadata || {}), publisher: vendor };

    try {
      await fetchJson(token, `/admin/products/${product.id}`, {
        method: "POST",
        body: JSON.stringify({ metadata: updatedMetadata }),
      });
      console.log(`  OK  "${sanitizedHandle}" → publisher: "${vendor}"`);
      patched++;
    } catch (err) {
      console.error(`  ERROR patching "${sanitizedHandle}": ${err.message}`);
      failed++;
    }
  }

  console.log(
    `\nDone — patched: ${patched}, skipped: ${skipped}, failed: ${failed}`,
  );
  if (failed > 0) process.exit(1);
}

run();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function authenticate() {
  const url = `${MEDUSA_URL}/auth/user/emailpass`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: MEDUSA_EMAIL, password: MEDUSA_PASSWORD }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Authentication failed (${res.status}): ${body}`);
  }

  const { token } = await res.json();
  if (!token) throw new Error("No token returned from auth endpoint");
  console.log("Authenticated\n");
  return token;
}

async function fetchJson(token, path, options = {}) {
  const url = `${MEDUSA_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `${options.method || "GET"} ${url} → ${res.status}: ${body}`,
    );
  }

  return res.json();
}

function sanitizeHandle(handle) {
  return handle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}
