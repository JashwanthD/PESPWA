import fs from 'fs';
import path from 'path';

const assetsDir = 'dist/client/assets';
const files = fs.readdirSync(assetsDir);
const cssFile = files.find(f => /^styles-.*\.css$/.test(f));
const jsCandidates = files.filter(f => /^index-.*\.js$/.test(f));

let mainJs = jsCandidates.reduce((a, b) =>
  fs.statSync(assetsDir + '/' + a).size >= fs.statSync(assetsDir + '/' + b).size ? a : b
);

const html = [
  '<!DOCTYPE html>',
  '<html lang="en">',
  '<head>',
  '  <meta charset="utf-8" />',
  '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
  '  <title>PESCE Placement Intelligence</title>',
  '  <meta name="description" content="Enterprise placement intelligence platform for PES College of Engineering, Mandya." />',
  '  <meta name="theme-color" content="#09090b" />',
  (cssFile ? `  <link rel="stylesheet" href="/assets/${cssFile}" />` : ''),
  '</head>',
  '<body>',
  '  <div id="root"></div>',
  (mainJs ? `  <script type="module" src="/assets/${mainJs}"></script>` : ''),
  '</body>',
  '</html>'
].join('\n');

fs.writeFileSync('dist/client/index.html', html);
console.log('Generated index.html successfully!');
