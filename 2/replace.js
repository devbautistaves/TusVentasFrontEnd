// replaceToFixed.js
const fs = require('fs');
const path = require('path');

const dir = path.resolve(process.argv[2] || './src'); // Carpeta raíz, por ejemplo ./src

function walkDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      replaceToFixedInFile(filePath);
    }
  });
}

function replaceToFixedInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex que busca .toFixed(...) y reemplaza por Number(... || 0).toFixed(...)
  // La idea es envolver el objeto antes del .toFixed con Number( ... || 0)
  // Nota: Esto funciona en casos simples, para casos muy complejos puede fallar.

  const regex = /(\w+(\.\w+)*?)\.toFixed\s*\(\s*(\d+)\s*\)/g;

  const newContent = content.replace(regex, (match, p1, p2, digits) => {
    return `Number(${p1} || 0).toFixed(${digits})`;
  });

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Replaced .toFixed in: ${filePath}`);
  }
}

walkDir(dir);