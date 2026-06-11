const fs = require('fs');
const path = require('path');

const issues = [];

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      const content = fs.readFileSync(p, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.includes('components/components') || line.includes("'./components/components")) {
          issues.push({ file: p, line: i + 1, content: line.trim() });
        }
      });
    }
  }
}

walk('src');
if (issues.length === 0) {
  console.log('No broken imports found!');
} else {
  console.log('Broken imports found:');
  issues.forEach(i => console.log(`${i.file}:${i.line} => ${i.content}`));
}
