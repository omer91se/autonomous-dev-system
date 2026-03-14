#!/usr/bin/env tsx

// Script to test the UI with simulated active agents

import { execSync } from 'child_process';

async function main() {
  console.log('Creating test agents...\n');

  // CEO - completed
  const ceoId = execSync('npx tsx scripts/notify-ui.ts start "CEO" "ceo" "Analyzing business viability"', { encoding: 'utf-8' }).trim();
  console.log('CEO started:', ceoId);
  await sleep(1000);
  execSync(`npx tsx scripts/notify-ui.ts complete "${ceoId}" "CEO" "ceo" "Business plan created"`);
  console.log('CEO completed');

  // PM - running
  const pmId = execSync('npx tsx scripts/notify-ui.ts start "PM" "pm" "Creating product specification"', { encoding: 'utf-8' }).trim();
  console.log('PM started:', pmId);

  // Designer - running
  const designerId = execSync('npx tsx scripts/notify-ui.ts start "Designer" "designer" "Creating design system"', { encoding: 'utf-8' }).trim();
  console.log('Designer started:', designerId);

  console.log('\n✅ Test agents created! Check the UI to see them active in the workflow tree.');
  console.log('\nTo clean up, just refresh the page or restart the WebSocket server.');
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
