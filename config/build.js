import {execSync} from 'child_process';
import {writeFileSync} from 'fs-extra';
import {resolve as resolvePath} from 'path';
import {rollup} from 'rollup';
import rimraf from 'rimraf';

import createRollupConfig from './rollup/config';

const root = resolvePath(__dirname, '..');
const build = resolvePath(root, 'build');

const intermediateBuild = resolvePath(root, './build-intermediate');
const entry = resolvePath(intermediateBuild, './index.js');

compileTypescript('--target ES5');

Promise.all([
  runRollup({entry, output: 'react-tiny-virtual-list.es.js', format: 'es'}),
  runRollup({entry, output: 'react-tiny-virtual-list.cjs.js', format: 'cjs'}),
  runRollup({entry, output: 'react-tiny-virtual-list.js', format: 'umd'}),
  runRollup({entry, output: 'react-tiny-virtual-list.min.js', format: 'umd', minify: true}),
])
  .then(cleanIntermediateBuild)
  .catch((error) => {
    // eslint-disable-next-line no-console
    cleanIntermediateBuild().then(() => {
      console.error(error);
      process.exit(1);
    });
  });

function runRollup({entry, output, format, minify = false, outputDir = build}) {
  const config = createRollupConfig({
    input: entry,
    output,
    format,
    minify,
  });

  return rollup(config)
    .then((bundle) => bundle.write({
      format,
      name: 'VirtualList',
      file: resolvePath(outputDir, output),
    }));
}

function compileTypescript(args = '') {
  execSync(`./node_modules/.bin/tsc --outDir ${intermediateBuild} --rootDir ./src --baseurl ./src ${args}`, {
    stdio: 'inherit',
  });
}

function cleanIntermediateBuild(callback = () => {}) {
  return new Promise((resolve) => rimraf(intermediateBuild, resolve));
}
