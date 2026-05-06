const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const textReplacements = [
  /text-slate-900/g, 'text-black',
  /text-slate-800/g, 'text-black/90',
  /text-slate-700/g, 'text-black/80',
  /text-slate-600/g, 'text-black/70',
  /text-slate-500/g, 'text-black/60',
  /text-slate-400/g, 'text-black/50',
  /text-slate-300/g, 'text-black/40',
  /text-slate-200/g, 'text-black/30',
  /text-slate-100/g, 'text-black/20',
  
  /dark:text-slate-100/g, 'dark:text-white',
  /dark:text-slate-200/g, 'dark:text-white/90',
  /dark:text-slate-300/g, 'dark:text-white/80',
  /dark:text-slate-400/g, 'dark:text-white/70',
  /dark:text-slate-500/g, 'dark:text-white/60',
  /dark:text-slate-600/g, 'dark:text-white/50',
  /dark:text-slate-700/g, 'dark:text-white/40',
  /dark:text-slate-800/g, 'dark:text-white/30',
  /dark:text-slate-900/g, 'dark:text-white/20',

  // Colors
  /text-(blue|emerald|amber|red|rose)-(400|500|600)/g, 'text-black dark:text-white',
  /dark:text-(blue|emerald|amber|red|rose)-(400|500|600)/g, 'dark:text-white',
  /group-hover:text-(blue|emerald|amber|red|rose)-(400|500|600)/g, 'group-hover:text-black dark:group-hover:text-white',
  /dark:group-hover:text-(blue|emerald|amber|red|rose)-(400|500|600)/g, 'dark:group-hover:text-white',
  /hover:text-(blue|emerald|amber|red|rose)-(400|500|600)/g, 'hover:text-black dark:hover:text-white',
  /dark:hover:text-(blue|emerald|amber|red|rose)-(400|500|600)/g, 'dark:hover:text-white',
  
  // Backgrounds
  /bg-slate-900/g, 'bg-black',
  /bg-slate-800/g, 'bg-black/90',
  /bg-slate-700/g, 'bg-black/80',
  /bg-slate-600/g, 'bg-black/70',
  /bg-slate-500\/([0-9]+)/g, 'bg-black/$1 dark:bg-white/$1',
  /bg-slate-500/g, 'bg-black/50 dark:bg-white/50',
  /bg-slate-400/g, 'bg-black/40',
  /bg-slate-300/g, 'bg-black/20',
  /bg-slate-200/g, 'bg-black/10',
  /bg-slate-100/g, 'bg-black/5',
  /bg-slate-50/g, 'bg-white',

  /dark:bg-slate-900/g, 'dark:bg-white/10 text-white', // Wait, dark:bg-slate-900 usually means dark bg. We should use standard black there.
  /dark:bg-slate-800/g, 'dark:bg-white/10',
  /dark:bg-slate-700/g, 'dark:bg-white/20',
  /dark:bg-slate-600/g, 'dark:bg-white/30',

  /bg-(blue|emerald|amber|red|rose)-(400|500|600)/g, 'bg-black dark:bg-white text-white dark:text-black',
  /dark:bg-(blue|emerald|amber|red|rose)-(400|500|600)\/([0-9]+)/g, 'dark:bg-white/$2',
  /bg-(blue|emerald|amber|red|rose)-(400|500|600)\/([0-9]+)/g, 'bg-black/$3 dark:bg-white/$3',
  /hover:bg-(blue|emerald|amber|red|rose)-(400|500|600)/g, 'hover:bg-black dark:hover:bg-white',
  
  // Borders
  /border-slate-900/g, 'border-black',
  /border-slate-400/g, 'border-black/40',
  /border-slate-300/g, 'border-black/30',
  /border-slate-200/g, 'border-black/20',
  /border-slate-100/g, 'border-black/10',

  /border-(blue|emerald|amber|red|rose)-(400|500|600)\/([0-9]+)/g, 'border-black/$3 dark:border-white/$3',
  /border-(blue|emerald|amber|red|rose)-(400|500|600)/g, 'border-black dark:border-white',
  /hover:border-(blue|emerald|amber|red|rose)-(400|500|600)\/([0-9]+)/g, 'hover:border-black/$3 dark:hover:border-white/$3',
  /dark:hover:border-(blue|emerald|amber|red|rose)-(400|500|600)\/([0-9]+)/g, 'dark:hover:border-white/$3',
  
  // Gradients
  /bg-gradient-to-b dark:from-white dark:to-slate-400 from-slate-900 to-slate-500/g, 'bg-black dark:bg-white',
  /bg-clip-text text-transparent/g, '',
];

// Specific fixes for dark mode bg slate
const preReplacements = [
  [/dark:bg-slate-900\/([^ ]+)/g, 'dark:bg-[#111111]/$1'],
  [/dark:bg-slate-900/g, 'dark:bg-[#111111]'],
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  preReplacements.forEach(([regex, repl]) => {
    content = content.replace(regex, repl);
  });

  for (let i = 0; i < textReplacements.length; i += 2) {
    const rx = typeof textReplacements[i] === 'string' ? new RegExp(textReplacements[i], 'g') : textReplacements[i];
    const repl = textReplacements[i + 1];
    content = content.replace(rx, repl);
  }
  
  // Extra specific cleanups
  content = content.replace(/text-black dark:text-white dark:text-white/g, 'text-black dark:text-white');
  content = content.replace(/bg-black dark:bg-white text-white dark:text-black dark:bg-white/g, 'bg-black dark:bg-white text-white dark:text-black');
  
  fs.writeFileSync(filePath, content);
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

processDir(srcDir);
console.log('Update complete.');
