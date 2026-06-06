#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const apiDir = 'apps/api/src';

// Files to update
const filesToUpdate = [
  `${apiDir}/infrastructure/database/schema/products.ts`,
  `${apiDir}/infrastructure/database/schema/orders.ts`,
  `${apiDir}/infrastructure/database/schema/reviews.ts`,
  `${apiDir}/infrastructure/database/schema/delivery.ts`,
  `${apiDir}/infrastructure/database/schema/notifications.ts`,
  `${apiDir}/infrastructure/database/seeds/seed-users.ts`,
  `${apiDir}/infrastructure/database/seeds/seed-categories.ts`,
  `${apiDir}/infrastructure/database/seeds/seed-delivery.ts`,
  `${apiDir}/infrastructure/database/seeds/seed-products.ts`,
  `${apiDir}/modules/wallet/wallet.service.ts`,
  `${apiDir}/modules/orders/orders.service.ts`,
];

console.log('Updating CUID2 to UUID...');

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace imports
    content = content.replace(/import \{ createId \} from ["']@paralleldrive\/cuid2["'];?/g, 'import { randomUUID } from "crypto";');

    // Replace function calls
    content = content.replace(/createId\(\)/g, 'randomUUID()');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
  } else {
    console.log(`✗ Not found: ${filePath}`);
  }
});

console.log('Update completed!');