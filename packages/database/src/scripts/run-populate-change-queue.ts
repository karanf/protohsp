import { populateChangeQueue } from './populate-change-queue.js';

async function main() {
  try {
    console.log('🚀 Starting change queue population...');
    await populateChangeQueue();
    console.log('🏁 Population completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Population failed:', error);
    process.exit(1);
  }
}

main(); 