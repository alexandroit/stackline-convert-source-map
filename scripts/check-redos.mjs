import { spawnSync } from 'node:child_process';

const child = spawnSync(process.execPath, ['test/redos-child.js'], {
  cwd: new URL('..', import.meta.url).pathname,
  encoding: 'utf8',
  timeout: 5000
});

if (child.error) throw child.error;
if (child.status !== 0) throw new Error(child.stderr || child.stdout || 'malformed-input child failed');
console.log('500,001 malformed lines processed within the 5 second safety budget');
