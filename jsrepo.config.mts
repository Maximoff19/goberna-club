import { defineConfig } from 'jsrepo';

export default defineConfig({
    // configure where stuff comes from here
    registries: [],
    // configure where stuff goes here
    paths: {
        component: './src/components',
        hook: './src/hooks',
        lib: './src/lib',
        style: './src/styles',
    },
});
