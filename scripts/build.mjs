import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),dist=path.join(root,'dist');await fs.rm(dist,{recursive:true,force:true});
async function copyDir(src,dst){await fs.mkdir(dst,{recursive:true});for(const e of await fs.readdir(src,{withFileTypes:true})){const s=path.join(src,e.name),d=path.join(dst,e.name);if(e.isDirectory())await copyDir(s,d);else await fs.copyFile(s,d);}}
for(const app of ['user-extension','admin-extension'])await copyDir(path.join(root,'apps',app),path.join(dist,app));
for(const app of ['user-extension','admin-extension']){const manifest=JSON.parse(await fs.readFile(path.join(dist,app,'manifest.json'),'utf8'));if(manifest.manifest_version!==3)throw Error(`${app}: not MV3`);}
console.log('Built and validated both extensions.');
