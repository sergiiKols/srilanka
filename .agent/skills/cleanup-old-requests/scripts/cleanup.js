#!/usr/bin/env node
/**
 * SKILL #8: Cleanup Old Requests (Mock version)
 */

const MOCK_OLD_REQUESTS = [
  { id: 101, check_out: '2025-12-01', status: 'completed' },
  { id: 102, check_out: '2025-11-15', status: 'abandoned' }
];

async function cleanupOldRequests(retentionDays = 30, dryRun = false) {
  console.log('🧹 SKILL #8: Cleanup Old Requests');
  console.log(`Retention: ${retentionDays} days`);
  console.log(`Dry run: ${dryRun ? 'YES' : 'NO'}`);
  console.log('');
  
  const oldRequests = MOCK_OLD_REQUESTS;
  console.log(`Найдено ${oldRequests.length} старых заявок`);
  
  if (!dryRun) {
    console.log('Архивация...');
    await new Promise(r => setTimeout(r, 500));
    console.log(`✅ Архивировано ${oldRequests.length} заявок`);
  } else {
    console.log('⏭️  Dry run - изменения не применены');
  }
  
  return {
    archived_requests: dryRun ? 0 : oldRequests.length,
    deleted_offers: dryRun ? 0 : oldRequests.length * 3,
    freed_space_mb: dryRun ? 0 : 125
  };
}

if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  cleanupOldRequests(30, dryRun);
}

module.exports = { cleanupOldRequests };
