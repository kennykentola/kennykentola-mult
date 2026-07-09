const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/Users/user/Downloads/kennykentola-multi-company/apps/web/src');
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1
  // with `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}
  content = content.replace(/\`\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\}\/api\/v1/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}` + `");

  // Wait, if it's `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/portfolio`
  // it becomes `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}` + `/portfolio`
  // Actually, replacing `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1`
  // with `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}` is better. But what if it's inside a template literal string like:
  // fetch(`${process.env...}/api/v1/upload`)
  // To avoid breaking the template string, just do:
  // /api/v1 string should be inside the curly brace? No, because process.env.NEXT_PUBLIC_API_URL ALREADY contains /api/v1.
  // We can just use a helper or remove the /api/v1.
  // Let's replace:
  // `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1
  // with
  // `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}
  
  content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\}\/api\/v1/g, "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}");

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    changed++;
    console.log('Fixed: ' + file);
  }
});
console.log('Total files changed:', changed);
