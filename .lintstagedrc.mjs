export default {
  '!(*.ts)': 'prettier --write --ignore-unknown',
  '*.ts': ['eslint --fix', 'prettier --write --ignore-unknown'],
};
