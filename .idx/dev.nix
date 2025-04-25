{pkgs}: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_22
    pkgs.pnpm
  ];
  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
    "astro-build.astro-vscode"
    "bradlc.vscode-tailwindcss"
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "mhutchie.git-graph"
    "unifiedjs.vscode-mdx"
    "vitest.explorer"
  ];
  idx.previews = {
    previews = {
      web = {
        command = [
          "pnpm"
          "run"
          "dev"
        ];
        manager = "web";
      };
    };
  };
}