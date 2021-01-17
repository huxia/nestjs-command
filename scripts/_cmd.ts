/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { default as execa, Options, ExecaChildProcess } from 'execa';

export const createExec = (opts: Options) => (
  file: string,
  args?: string[],
  opts2?: Options,
): ExecaChildProcess => execa(file, args, {
  ...opts,
  ...opts2,
})
