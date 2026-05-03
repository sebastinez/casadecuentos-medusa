#!/usr/bin/env node
/**
 * Converts a Shopify product export CSV to a Medusa v2 import CSV.
 *
 * Usage:
 *   node index.js <shopify-export.csv> [medusa-import.csv]
 *
 * Dependencies: csv-parse, csv-stringify
 *   npm install csv-parse csv-stringify
 */

const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const inputFile = process.argv[2];
const outputFile = process.argv[3] || 'medusa_products.csv';

if (!inputFile) {
  console.error('Usage: node index.js <shopify-export.csv> [medusa-import.csv]');
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

const rows = parse(fs.readFileSync(inputFile, 'utf8'), {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  trim: true,
});

// ---------------------------------------------------------------------------
// Group rows by product handle
// ---------------------------------------------------------------------------

const productMap = new Map();

for (const row of rows) {
  const handle = row['Handle'];
  if (!handle) continue;

  if (!productMap.has(handle)) {
    productMap.set(handle, { productRow: null, variants: [], images: [] });
  }

  const product = productMap.get(handle);

  // The first row that has a Title is the canonical product row
  if (row['Title'] && !product.productRow) {
    product.productRow = row;
  }

  // Collect images, deduplicated by src URL
  const imgSrc = row['Image Src'];
  if (imgSrc && !product.images.some(i => i.src === imgSrc)) {
    product.images.push({
      src: imgSrc,
      position: parseInt(row['Image Position'], 10) || 999,
    });
  }

  // Collect variants, deduplicated by option combination.
  // A row is a variant row when it carries a price.
  if (row['Variant Price']) {
    const variantKey = [
      row['Option1 Value'],
      row['Option2 Value'],
      row['Option3 Value'],
    ].join('|');

    if (!product.variants.some(v => v._key === variantKey)) {
      product.variants.push({ ...row, _key: variantKey });
    }
  }
}

// ---------------------------------------------------------------------------
// First pass: find maximum image count across all products
// so we can build dynamic image headers.
// ---------------------------------------------------------------------------

let maxImages = 2; // minimum 2 as required by the output spec

for (const { productRow, images } of productMap.values()) {
  if (!productRow) continue;
  if (images.length > maxImages) maxImages = images.length;
}

// ---------------------------------------------------------------------------
// Build final headers
// ---------------------------------------------------------------------------

const imageHeaders = range(maxImages).map(i => `Product Image ${i + 1} Url`);

const outputHeaders = [
  'Product Id',
  'Product Handle',
  'Product Title',
  'Product Subtitle',
  'Product Description',
  'Product Status',
  'Product Thumbnail',
  'Product Weight',
  'Product Length',
  'Product Width',
  'Product Height',
  'Product HS Code',
  'Product Origin Country',
  'Product MID Code',
  'Product Material',
  'Shipping Profile Id',
  'Product Sales Channel 1',
  'Product Collection Id',
  'Product Type Id',
  'Product Tag 1',
  'Product Discountable',
  'Product External Id',
  'Variant Id',
  'Variant Title',
  'Variant SKU',
  'Variant Barcode',
  'Variant Allow Backorder',
  'Variant Manage Inventory',
  'Variant Weight',
  'Variant Length',
  'Variant Width',
  'Variant Height',
  'Variant HS Code',
  'Variant Origin Country',
  'Variant MID Code',
  'Variant Material',
  'Variant Price EUR',
  'Variant Price USD',
  'Variant Option 1 Name',
  'Variant Option 1 Value',
  ...imageHeaders,
];

// ---------------------------------------------------------------------------
// Barcode uniqueness check
// ---------------------------------------------------------------------------

const barcodeMap = new Map(); // barcode → first { title, vendor }
const duplicates = [];        // { barcode, first, second }

for (const { productRow, variants } of productMap.values()) {
  if (!productRow) continue;
  for (const variant of variants) {
    const barcode = variant['Variant Barcode']?.replace(/'/g, '').trim();
    if (!barcode) continue;
    const entry = { title: productRow['Title'], vendor: productRow['Vendor'] };
    if (barcodeMap.has(barcode)) {
      duplicates.push({ barcode, first: barcodeMap.get(barcode), second: entry });
    } else {
      barcodeMap.set(barcode, entry);
    }
  }
}

if (duplicates.length > 0) {
  console.error(`Found ${duplicates.length} duplicate barcode(s):\n`);
  for (const { barcode, first, second } of duplicates) {
    console.error(`  Barcode: ${barcode}`);
    console.error(`    1. "${first.title}" (${first.vendor})`);
    console.error(`    2. "${second.title}" (${second.vendor})`);
  }
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Build output rows
// ---------------------------------------------------------------------------

const outputRows = [];
let skippedProducts = 0;

for (const [handle, { productRow, variants, images }] of productMap) {
  if (!productRow) {
    console.warn(`Warning: no product row found for handle "${handle}" — skipping`);
    skippedProducts++;
    continue;
  }

  if (variants.length === 0) {
    console.warn(`Warning: no variants found for handle "${handle}" — skipping`);
    skippedProducts++;
    continue;
  }

  const sortedImages = [...images].sort((a, b) => a.position - b.position);
  const thumbnail = sortedImages[0]?.src ?? '';

  const imageValues = Object.fromEntries(
    sortedImages.map((img, i) => [`Product Image ${i + 1} Url`, img.src])
  );

  const description =
    productRow['Description (product.metafields.custom.description)']?.trim() || '';

  const status = productRow['Published'] === 'true' ? 'published' : 'draft';

  // Product-level weight comes from the first variant (used as a default)
  const productWeight = variants[0]['Variant Grams'] || '';

  for (const variant of variants) {
    const hasTracker = !!variant['Variant Inventory Tracker'];
    const policy = variant['Variant Inventory Policy'];

    // Build variant title from option values, skipping Shopify's "Default Title"
    const optionParts = [
      variant['Option1 Value'],
      variant['Option2 Value'],
      variant['Option3 Value'],
    ].filter(v => v && v !== 'Default Title');
    const variantTitle = optionParts.length > 0 ? optionParts.join(' / ') : 'Default Title';

    outputRows.push({
      'Product Id': '',
      'Product Handle': sanitizeHandle(handle),
      'Product Title': productRow['Title'] || '',
      'Product Subtitle': '',
      'Product Description': description,
      'Product Status': status,
      'Product Thumbnail': thumbnail,
      'Product Weight': productWeight,
      'Product Length': '',
      'Product Width': '',
      'Product Height': '',
      'Product HS Code': '',
      'Product Origin Country': '',
      'Product MID Code': '',
      'Product Material': '',
      'Shipping Profile Id': '',
      'Product Sales Channel 1': '',
      'Product Collection Id': '',
      'Product Type Id': '',
      'Product Tag 1': '',
      'Product Discountable': 'true',
      'Product External Id': '',
      'Variant Id': '',
      'Variant Title': variantTitle,
      'Variant SKU': variant['Variant SKU'] || '',
      'Variant Barcode': variant['Variant Barcode']?.replace(/'/g, '').trim() || '',
      // Shopify "continue" = allow selling when out of stock = allow backorder
      'Variant Allow Backorder': policy === 'continue' ? 'true' : 'false',
      // Track inventory only when Shopify was already tracking it
      'Variant Manage Inventory': hasTracker ? 'true' : 'false',
      'Variant Weight': variant['Variant Grams'] || '',
      'Variant Length': '',
      'Variant Width': '',
      'Variant Height': '',
      'Variant HS Code': '',
      'Variant Origin Country': '',
      'Variant MID Code': '',
      'Variant Material': '',
      'Variant Price EUR': variant['Variant Price'] || '',
      'Variant Price USD': '',
      'Variant Option 1 Name': variant['Option1 Name'] || '',
      'Variant Option 1 Value': variant['Option1 Value'] || '',
      ...imageValues,
    });
  }
}

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------

fs.writeFileSync(
  outputFile,
  stringify(outputRows, { header: true, columns: outputHeaders }),
  'utf8'
);

const productCount = productMap.size - skippedProducts;
console.log(`Converted ${productCount} products / ${outputRows.length} variant rows → ${outputFile}`);
if (skippedProducts > 0) {
  console.log(`Skipped ${skippedProducts} products (no product row or no variants found)`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sanitizeHandle(handle) {
  return handle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

function range(n) {
  return Array.from({ length: n }, (_, i) => i);
}
