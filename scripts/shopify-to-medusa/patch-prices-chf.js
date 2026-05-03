#!/usr/bin/env node
/**
 * Reads a Shopify product export CSV and patches the CHF price on each variant
 * in Medusa via the Admin API, matched by SKU.
 *
 * Source column: "Price / Schweiz"
 * Existing prices (e.g. EUR) are preserved — only CHF is added/updated.
 *
 * Usage:
 *   MEDUSA_URL=http://localhost:9000 \
 *   MEDUSA_EMAIL=admin@example.com \
 *   MEDUSA_PASSWORD=supersecret \
 *     node patch-prices-chf.js <shopify-export.csv>
 *
 * MEDUSA_URL      – base URL of the Medusa backend (default: http://localhost:9000)
 * MEDUSA_EMAIL    – admin user email
 * MEDUSA_PASSWORD – admin user password
 */

const fs = require("fs");
const { parse } = require("csv-parse/sync");

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

const inputFile = process.argv[2];

if (!inputFile) {
  console.error("Usage: node patch-prices-chf.js <shopify-export.csv>");
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Parse CSV — collect SKU → CHF price (deduplicated, skip rows with no price)
// ---------------------------------------------------------------------------

const rows = parse(fs.readFileSync(inputFile, "utf8"), {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  trim: true,
});

const skuPriceMap = new Map(); // sku → { chfAmount, title }

for (const row of rows) {
  const sku = row["Variant SKU"]?.replace(/'/g, "").trim();
  const raw = row["Variant Price"]?.trim();
  const title = row["Title"] || row["Handle"];

  if (!sku || !raw || skuPriceMap.has(sku)) continue;

  const parsed = parseFloat(raw);
  if (isNaN(parsed)) continue;

  // Medusa stores amounts in the smallest currency unit (Rappen)
  const chfAmount = Math.round(parsed);
  skuPriceMap.set(sku, { chfAmount, title });
}

if (skuPriceMap.size === 0) {
  console.error('No variants with a "Variant Price" value found in the CSV.');
  process.exit(1);
}

console.log(`Found ${skuPriceMap.size} variants with CHF prices\n`);

// ---------------------------------------------------------------------------
// Patch prices
// ---------------------------------------------------------------------------

async function run() {
  const token = await authenticate();

  let patched = 0;
  let skipped = 0;
  let failed = 0;

  for (const [sku, { chfAmount, title }] of skuPriceMap) {
    // 1. Find variant by SKU, including existing prices
    let variant;
    try {
      const { variants } = await fetchJson(
        token,
        `/admin/product-variants?sku=${encodeURIComponent(sku)}&fields=id,product_id,prices&limit=1`,
      );
      variant = variants?.[0];
    } catch (err) {
      console.error(`  ERROR looking up SKU "${sku}": ${err.message}`);
      failed++;
      continue;
    }

    if (!variant) {
      console.warn(`  SKIP  SKU "${sku}" ("${title}") — not found in Medusa`);
      skipped++;
      continue;
    }

    // 2. Merge CHF into existing prices, replacing any previous CHF entry
    const existingPrices = (variant.prices ?? [])
      .filter((p) => p.currency_code !== "chf")
      .map((p) => ({
        id: p.id,
        amount: p.amount,
        currency_code: p.currency_code,
      }));

    const mergedPrices = [
      ...existingPrices,
      { currency_code: "chf", amount: (chfAmount / 100).toFixed(2) },
    ];

    // 3. Update the variant
    try {
      await fetchJson(
        token,
        `/admin/products/${variant.product_id}/variants/${variant.id}`,
        {
          method: "POST",
          body: JSON.stringify({ prices: mergedPrices }),
        },
      );
      console.log(
        `  OK    SKU "${sku}" ("${title}") → CHF ${(chfAmount / 100).toFixed(2)}`,
      );
      patched++;
    } catch (err) {
      console.error(`  ERROR patching SKU "${sku}": ${err.message}`);
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
