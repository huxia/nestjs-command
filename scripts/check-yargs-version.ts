import * as path from 'path';
import { createExec } from './_cmd';

const VERSIONS = ['11', '12', '13', '15']

const exec = createExec({
  cwd: path.resolve(__dirname, '../'),
  stdio: 'inherit',
  preferLocal: true,
})

const run = async () => {
  for (const version of VERSIONS) {
    const name = `@types/yargs@${version}`
    console.log(`安裝 ${name}`)
    await exec('yarn', ['add-no-save', '--dev', '--tilde', '--silent', name])
    console.log('Typescript check');
    await exec('tsc', ['--noEmit'])
  }
  await exec('yarn', ['install', '--silent'])
}

if (require.main === module)
  run()