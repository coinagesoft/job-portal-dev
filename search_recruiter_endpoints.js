const fs = require('fs');
const path = require('path');
const dir = 'src/services/recruiter';
if (fs.existsSync(dir)) {
  fs.readdirSync(dir).forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (content.includes('Match') || content.includes('score') || content.includes('Score') || content.includes('percentage')) {
      console.log("=== " + file + " ===");
      console.log(content);
    }
  });
}
