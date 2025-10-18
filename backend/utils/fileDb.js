const fs = require('fs-extra');
const path = require('path');

function filePath(filename){ return path.join(__dirname, '..', 'data', filename); }

async function readJSON(filename){
  const p = filePath(filename);
  await fs.ensureFile(p);
  const raw = await fs.readFile(p, 'utf8');
  if(!raw) return [];
  try { return JSON.parse(raw || '[]'); } catch (e) { return []; }
}

async function writeJSON(filename, data){
  const p = filePath(filename);
  await fs.ensureFile(p);
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readJSON, writeJSON };
