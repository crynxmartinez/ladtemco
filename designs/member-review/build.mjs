import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const source=path.dirname(fileURLToPath(import.meta.url));
const admin=path.resolve(source,'../admin-review-v2');
const publicDir=path.resolve(source,'../../public');
const read=(base,file)=>fs.readFile(path.join(base,file),'utf8');
const css=await Promise.all([read(admin,'preview.css'),read(admin,'admin-interactions.css'),read(source,'member.css')]);
const scripts=await Promise.all([read(admin,'preview-icons.js'),...['member-data.js','member-screens.js','member-downloads.js','member-actions.js','member-shell.js'].map(file=>read(source,file))]);
const logo=await fs.readFile(path.join(publicDir,'logo.jpg'));
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>Ladtemco Member Portal</title><style>${css.join('\n')}</style></head>
<body><div id="app"></div><dialog id="detail" class="dialog" aria-labelledby="dialog-title"><header><div><p class="kicker"></p><h2 id="dialog-title" tabindex="-1"></h2></div><button class="close-x" type="button" data-action="close" aria-label="Close dialog">×</button></header><div class="dialog-body"></div><footer></footer></dialog>
<div id="announcement" role="status" aria-live="polite" hidden></div><script>${scripts.join('\n').replace('__MEMBER_LOGO__','data:image/jpeg;base64,'+logo.toString('base64'))}</script></body></html>`;
const folder=path.join(publicDir,'member-demo');
await fs.mkdir(folder,{recursive:true});
await fs.writeFile(path.join(folder,'index.html'),html);
