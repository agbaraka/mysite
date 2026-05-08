import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import yaml from '@rollup/plugin-yaml';
import { readFileSync } from 'fs';
import jsYaml from 'js-yaml';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        tailwindcss(),
        yaml(),
        handlebars({
            context() {
                return jsYaml.load(readFileSync('./data.yml', 'utf8'));
            },
        }),
    ],
});