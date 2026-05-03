#!/usr/bin/env node
/**
 * Reads a Shopify product export CSV and sets stocked_quantity for each
 * variant's inventory item in Medusa, matched by SKU.
 *
 * Only processes variants that were actively tracked in Shopify
 * (Variant Inventory Tracker is non-empty).
 *
 * Usage:
 *   MEDUSA_URL=http://localhost:9000 \
 *   MEDUSA_EMAIL=admin@example.com \
 *   MEDUSA_PASSWORD=supersecret \
 *   MEDUSA_LOCATION_ID=<location_id> \
 *     node patch-inventory.js <shopify-export.csv>
 *
 * To list available stock locations first, omit MEDUSA_LOCATION_ID:
 *   MEDUSA_URL=... MEDUSA_EMAIL=... MEDUSA_PASSWORD=... node patch-inventory.js --list-locations
 *
 * MEDUSA_URL         – base URL of the Medusa backend (default: http://localhost:9000)
 * MEDUSA_EMAIL       – admin user email
 * MEDUSA_PASSWORD    – admin user password
 * MEDUSA_LOCATION_ID – stock location ID to set inventory against
 */

const fs = require("fs");
const { parse } = require("csv-parse/sync");

const MEDUSA_URL = (process.env.MEDUSA_URL || "http://localhost:9000").replace(
  /\/$/,
  "",
);
const MEDUSA_EMAIL = process.env.MEDUSA_EMAIL;
const MEDUSA_PASSWORD = process.env.MEDUSA_PASSWORD;
const MEDUSA_LOCATION_ID = process.env.MEDUSA_LOCATION_ID;

if (!MEDUSA_EMAIL || !MEDUSA_PASSWORD) {
  console.error("MEDUSA_EMAIL and MEDUSA_PASSWORD env vars are required");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// --list-locations helper
// ---------------------------------------------------------------------------

if (process.argv[2] === "--list-locations") {
  authenticate()
    .then((token) => fetchJson(token, "/admin/stock-locations?limit=100"))
    .then(({ stock_locations }) => {
      if (!stock_locations?.length) {
        console.log("No stock locations found.");
        return;
      }
      console.log("Available stock locations:\n");
      for (const loc of stock_locations)
        console.log(`  ${loc.id}  ${loc.name}`);
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
  return;
}

// ---------------------------------------------------------------------------
// Normal run
// ---------------------------------------------------------------------------

const inputFile = process.argv[2];

if (!inputFile) {
  console.error(
    "Usage: node patch-inventory.js <shopify-export.csv>\n" +
      "       node patch-inventory.js --list-locations",
  );
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

if (!MEDUSA_LOCATION_ID) {
  console.error(
    "MEDUSA_LOCATION_ID env var is required.\n" +
      "Run with --list-locations to see available IDs.",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Parse CSV — collect SKU → quantity for tracked variants only
// ---------------------------------------------------------------------------

const rows = parse(fs.readFileSync(inputFile, "utf8"), {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  trim: true,
});

// Deduplicate: if the same SKU appears in multiple rows (image rows), use first
const skuQtyMap = new Map(); // sku → { qty, title }

for (const row of rows) {
  const sku = row["Variant SKU"]?.replace(/'/g, "").trim();
  const tracked = row["Variant Inventory Tracker"]?.trim();
  const qty = parseInt(row["Variant Inventory Qty"], 10);
  const title = row["Title"] || row["Handle"];

  if (!sku || !tracked || isNaN(qty) || skuQtyMap.has(sku)) continue;

  skuQtyMap.set(sku, { qty, title });
}

if (skuQtyMap.size === 0) {
  console.error("No tracked variants with SKUs found in the CSV.");
  process.exit(1);
}

console.log(`Found ${skuQtyMap.size} tracked variants to patch\n`);

// ---------------------------------------------------------------------------
// Patch inventory levels
// ---------------------------------------------------------------------------

async function run() {
  const token = await authenticate();

  let patched = 0;
  let skipped = 0;
  let failed = 0;

  for (const [sku, { qty, title }] of skuQtyMap) {
    // 1. Find inventory item by SKU
    let inventoryItem;
    try {
      const { inventory_items } = await fetchJson(
        token,
        `/admin/inventory-items?sku=${encodeURIComponent(sku)}&limit=1`,
      );
      inventoryItem = inventory_items?.[0];
    } catch (err) {
      console.error(`  ERROR looking up SKU "${sku}": ${err.message}`);
      failed++;
      continue;
    }

    if (!inventoryItem) {
      console.warn(
        `  SKIP  SKU "${sku}" ("${title}") — no inventory item found`,
      );
      skipped++;
      continue;
    }

    // 2. Check whether a level already exists at this location
    let levelExists = false;
    try {
      const { inventory_levels } = await fetchJson(
        token,
        `/admin/inventory-items/${inventoryItem.id}/location-levels?location_id=${MEDUSA_LOCATION_ID}`,
      );
      levelExists = inventory_levels?.length > 0;
    } catch (err) {
      console.error(`  ERROR checking levels for SKU "${sku}": ${err.message}`);
      failed++;
      continue;
    }

    // 3. Create or update the level
    try {
      if (levelExists) {
        await fetchJson(
          token,
          `/admin/inventory-items/${inventoryItem.id}/location-levels/${MEDUSA_LOCATION_ID}`,
          { method: "POST", body: JSON.stringify({ stocked_quantity: qty }) },
        );
      } else {
        await fetchJson(
          token,
          `/admin/inventory-items/${inventoryItem.id}/location-levels`,
          {
            method: "POST",
            body: JSON.stringify({
              location_id: MEDUSA_LOCATION_ID,
              stocked_quantity: qty,
            }),
          },
        );
      }
      console.log(`  OK    SKU "${sku}" ("${title}") → qty: ${qty}`);
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
