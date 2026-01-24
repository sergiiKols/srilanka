/**
 * Fix and shorten hours format
 * Convert: "Monday: 6:30 AM – 9:00 PM | Tuesday: 6:30 AM – 9:00 PM..."
 * To: "Mon-Sun: 6:30 AM - 9:00 PM" or "Mon-Fri: 9 AM - 5 PM, Sat-Sun: 10 AM - 6 PM"
 */

const fs = require('fs');

function formatHours(hoursString) {
  if (!hoursString || hoursString === '') {
    return '';
  }
  
  // Parse the hours string
  const days = {
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat',
    'Sunday': 'Sun'
  };
  
  // Split by pipe
  const dayHours = hoursString.split('|').map(s => s.trim());
  
  if (dayHours.length === 0) {
    return hoursString;
  }
  
  // Parse each day
  const schedule = [];
  for (const dh of dayHours) {
    const match = dh.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const day = match[1];
      const hours = match[2].trim();
      schedule.push({
        day: days[day] || day,
        hours: hours.replace(/–/g, '-') // Replace en-dash with hyphen
      });
    }
  }
  
  if (schedule.length === 0) {
    return hoursString;
  }
  
  // Check if all days have same hours
  const firstHours = schedule[0].hours;
  const allSame = schedule.every(s => s.hours === firstHours);
  
  if (allSame && schedule.length === 7) {
    // All days same: "Mon-Sun: 6:30 AM - 9:00 PM"
    return `Daily: ${firstHours}`;
  }
  
  // Check if weekdays (Mon-Fri) are same and weekends (Sat-Sun) are same
  const weekdayHours = schedule.slice(0, 5);
  const weekendHours = schedule.slice(5, 7);
  
  const weekdaysSame = weekdayHours.length === 5 && 
                       weekdayHours.every(s => s.hours === weekdayHours[0].hours);
  const weekendsSame = weekendHours.length === 2 && 
                       weekendHours.every(s => s.hours === weekendHours[0].hours);
  
  if (weekdaysSame && weekendsSame) {
    if (weekdayHours[0].hours === weekendHours[0].hours) {
      // All same
      return `Daily: ${weekdayHours[0].hours}`;
    } else {
      // Different for weekdays/weekends
      return `Mon-Fri: ${weekdayHours[0].hours} | Sat-Sun: ${weekendHours[0].hours}`;
    }
  }
  
  // Check for closed days
  const hasClosedDays = schedule.some(s => 
    s.hours.toLowerCase().includes('closed') || 
    s.hours.toLowerCase().includes('unavailable')
  );
  
  if (hasClosedDays) {
    // List only open days
    const openDays = schedule.filter(s => 
      !s.hours.toLowerCase().includes('closed') && 
      !s.hours.toLowerCase().includes('unavailable')
    );
    
    if (openDays.length > 0) {
      // Group consecutive days with same hours
      const groups = [];
      let currentGroup = { days: [openDays[0].day], hours: openDays[0].hours };
      
      for (let i = 1; i < openDays.length; i++) {
        if (openDays[i].hours === currentGroup.hours) {
          currentGroup.days.push(openDays[i].day);
        } else {
          groups.push(currentGroup);
          currentGroup = { days: [openDays[i].day], hours: openDays[i].hours };
        }
      }
      groups.push(currentGroup);
      
      // Format groups
      return groups.map(g => {
        if (g.days.length === 1) {
          return `${g.days[0]}: ${g.hours}`;
        } else {
          return `${g.days[0]}-${g.days[g.days.length - 1]}: ${g.hours}`;
        }
      }).join(' | ');
    }
  }
  
  // If nothing matches, return shortened version (first 100 chars)
  const shortened = hoursString.substring(0, 100);
  return shortened.length < hoursString.length ? shortened + '...' : shortened;
}

// Load data
console.log('Loading data...');
const data = JSON.parse(fs.readFileSync('SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json', 'utf-8'));

console.log('Total POIs:', data.length);

// Fix hours for food POIs
let fixedCount = 0;
let unchangedCount = 0;

data.forEach(poi => {
  if (poi.category === 'food' && poi.hours && poi.hours !== '') {
    const originalHours = poi.hours;
    const newHours = formatHours(originalHours);
    
    if (newHours !== originalHours) {
      poi.hours = newHours;
      fixedCount++;
      
      if (fixedCount <= 5) {
        console.log(`\nFixed: ${poi.name}`);
        console.log(`  Before: ${originalHours.substring(0, 80)}...`);
        console.log(`  After:  ${newHours}`);
      }
    } else {
      unchangedCount++;
    }
  }
});

console.log(`\n=== RESULTS ===`);
console.log(`Fixed: ${fixedCount}`);
console.log(`Unchanged: ${unchangedCount}`);

// Create backup
const timestamp = Date.now();
fs.copyFileSync(
  'SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json',
  `SRI/parsed_data/negombo_tangalle/pass_1_0-1km_backup_before_hours_fix_${timestamp}.json`
);
console.log(`\nBackup created`);

// Save
fs.writeFileSync('SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json', JSON.stringify(data, null, 2));
console.log('Main file updated');

// Copy to public
fs.copyFileSync(
  'SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json',
  'public/SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json'
);
console.log('Public file updated');

console.log('\n✅ Done!');
