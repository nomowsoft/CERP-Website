const fs = require('fs');

const files = [
  { path: './messages/ar.json', updates: { close: 'إغلاق' } },
  { path: './messages/en.json', updates: { close: 'Close' } }
];

for (const { path, updates } of files) {
  const content = fs.readFileSync(path, 'utf8');
  const json = JSON.parse(content);
  
  if (!json.dashboard) json.dashboard = {};
  if (!json.dashboard.common) json.dashboard.common = {};
  
  for (const [key, value] of Object.entries(updates)) {
    if (!json.dashboard.common[key]) {
      json.dashboard.common[key] = value;
      console.log(`Added ${key} to ${path}`);
    }
  }
  
  fs.writeFileSync(path, JSON.stringify(json, null, 2), 'utf8');
}
console.log('Translations updated successfully.');
