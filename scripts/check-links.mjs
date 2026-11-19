// Builds the site and checks that the social links in dist/index.html
// match the URLs in data.yml (catches empty or mistyped template bindings).
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import jsYaml from 'js-yaml';

execSync('pnpm build', { stdio: 'inherit' });

const html = readFileSync('dist/index.html', 'utf8');
const { resource } = jsYaml.load(readFileSync('data.yml', 'utf8'));

let failed = false;

const emptyHrefs = html.match(/href=""/g) ?? [];
if (emptyHrefs.length) {
    console.error(`FAIL: ${emptyHrefs.length} empty href="" attribute(s) in dist/index.html`);
    failed = true;
}

for (const key of ['github', 'twitter', 'linkedin']) {
    if (!html.includes(`href="${resource[key]}"`)) {
        console.error(`FAIL: no link to resource.${key} (${resource[key]}) in dist/index.html`);
        failed = true;
    }
}

if (failed) process.exit(1);
console.log('OK: all social links resolved');
