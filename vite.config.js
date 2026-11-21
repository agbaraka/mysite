import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { readFileSync } from 'fs';
import jsYaml from 'js-yaml';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        tailwindcss(),
        handlebars({
            context() {
                return jsYaml.load(readFileSync('./data.yml', 'utf8'));
            },
        }),
        {
            name: 'reload-on-data-change',
            configureServer(server) {
                server.watcher.add('data.yml');
                server.watcher.on('change', (file) => {
                    if (file.endsWith('data.yml')) server.ws.send({ type: 'full-reload' });
                });
            },
        },
    ],
});