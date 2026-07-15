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
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git') && !file.includes('template_ref')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}
walk('.').forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('/employeer/candidate-profile')) {
    console.log("=== " + file + " ===");
    content.split('\n').forEach((line, idx) => {
      if (line.includes('/employeer/candidate-profile')) {
        console.log("  " + (idx+1) + ": " + line.trim());
      }
    });
  }
});
