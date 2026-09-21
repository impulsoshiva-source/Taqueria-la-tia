const fs = require('fs');
const path = require('path');

// 1. Lee el archivo con el texto que contiene todos los bloques ## ruta/archivo
const rawText = fs.readFileSync(path.join(__dirname, 'codigo.txt'), 'utf8');

// Expresión regular para detectar: ## ruta/archivo ... ```lenguaje ... código ... ```
const regex = /##\s+([^\r\n]+)[\r\n]+```[\w-]*[\r\n]+([\s\S]*?)```/g;
let match;
let count = 0;

while ((match = regex.exec(rawText)) !== null) {
  const filePath = match[1].trim().replace(/^taqueria-la-tia\//, ''); // limpia prefijos si los hay
  const content = match[2];

  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);

  // Crea carpetas automáticamente (app/, components/, data/, etc.)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Escribe el archivo completo
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✓ Creado: ${filePath}`);
  count++;
}

console.log(`\n¡Listo! Se crearon ${count} archivos estructurados correctamente.`);