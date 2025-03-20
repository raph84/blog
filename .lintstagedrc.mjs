export default {
  '!(*.{ts,astro})': 'prettier --write --ignore-unknown',
  '*.{ts,astro}': ['eslint --fix', 'prettier --write --ignore-unknown'],
};
