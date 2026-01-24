/**
 * Monitoring Script for POI Parsing Progress
 * 
 * Usage: node SRI/scripts/monitorParsing.js
 * 
 * This script checks:
 * - Current parsing progress from checkpoint file
 * - Number of files created in output directory
 * - Latest log entries
 * - Estimated completion time
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const PROGRESS_FILE = path.join(__dirname, '..', 'parsing_progress.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'parsed_data', 'pass_1_0-1km');
const LOG_FILE = path.join(__dirname, '..', 'logs', 'parsing.log');

// Helper: Format time
function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Helper: Read last N lines from log file
function getLastLogLines(filePath, numLines = 10) {
  try {
    if (!fs.existsSync(filePath)) {
      return ['Log file not found'];
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    return lines.slice(-numLines);
  } catch (error) {
    return [`Error reading log: ${error.message}`];
  }
}

// Main monitoring function
function monitorProgress() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 POI PARSING PROGRESS MONITOR');
  console.log('='.repeat(70));
  console.log(`Checked at: ${new Date().toLocaleString()}`);
  console.log('');

  // Check progress file
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      console.log('📝 Progress File Status:');
      console.log(`   Last Updated: ${new Date(progress.lastUpdate).toLocaleString()}`);
      console.log(`   Current Zone: ${progress.currentZone || 'N/A'}`);
      console.log(`   POIs Processed: ${progress.poisProcessed || 0}`);
      console.log(`   Last Checkpoint: ${progress.lastCheckpoint || 'N/A'}`);
      console.log('');
      
      // Calculate elapsed time
      if (progress.startTime) {
        const elapsed = Date.now() - progress.startTime;
        console.log(`   Elapsed Time: ${formatTime(elapsed)}`);
        
        // Estimate completion (rough estimate: 1500ms per POI)
        const totalExpected = 720; // Zone 0 estimate
        const processed = progress.poisProcessed || 0;
        const remaining = totalExpected - processed;
        const estimatedRemainingMs = remaining * 1500;
        
        if (remaining > 0) {
          console.log(`   Remaining POIs: ${remaining}`);
          console.log(`   Estimated Time Left: ${formatTime(estimatedRemainingMs)}`);
        }
      }
      console.log('');
    } catch (error) {
      console.log(`   ⚠️  Error reading progress file: ${error.message}`);
      console.log('');
    }
  } else {
    console.log('📝 Progress File: Not found (parsing may not have started checkpointing yet)');
    console.log('');
  }

  // Check output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    try {
      const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json'));
      console.log('📁 Output Directory:');
      console.log(`   Location: ${OUTPUT_DIR}`);
      console.log(`   Files Created: ${files.length}`);
      
      if (files.length > 0) {
        console.log('   Recent Files:');
        files.slice(-5).forEach(file => {
          const filePath = path.join(OUTPUT_DIR, file);
          const stats = fs.statSync(filePath);
          const size = (stats.size / 1024).toFixed(2);
          console.log(`     - ${file} (${size} KB)`);
        });
      }
      console.log('');
    } catch (error) {
      console.log(`   ⚠️  Error reading output directory: ${error.message}`);
      console.log('');
    }
  } else {
    console.log('📁 Output Directory: Not created yet');
    console.log('');
  }

  // Check logs
  console.log('📋 Latest Log Entries:');
  const logLines = getLastLogLines(LOG_FILE, 15);
  logLines.forEach(line => {
    console.log(`   ${line}`);
  });
  console.log('');

  console.log('='.repeat(70));
  console.log('💡 Tips:');
  console.log('   - Run this script again anytime to check progress');
  console.log('   - Parsing continues in the background (PID may vary)');
  console.log('   - Data is saved automatically at checkpoints');
  console.log('='.repeat(70));
  console.log('');
}

// Run monitoring
monitorProgress();
