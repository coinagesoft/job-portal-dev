const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js')) results.push(file);
    }
  });
  return results;
}
walk('src/services').forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('/api/candidate/')) {
    console.log("=== " + file + " ===");
    content.split('\n').forEach(line => {
      if (line.includes('/api/candidate/')) console.log("  " + line.trim());
    });
  }
});
