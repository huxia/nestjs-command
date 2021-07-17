import { Argv, CommandModule } from 'yargs';
import { Injectable, Global } from '@nestjs/common';

@Global()
@Injectable()
export class CommandService {
  private _yargs?: Argv;
  private running: boolean = false;

  initialize(metadatas: CommandModule[]) {
    const { yargs } = this

    yargs
      .scriptName('cli')
      .demandCommand(1)
      .help('h')
      .alias('h', 'help')
      .alias('v', 'version')
      .strict();

    metadatas.forEach(command => {
      yargs.command(command).fail(false);
    });
  }

  exec() {
    const { yargs } = this
    yargs.argv;
  }

  run() {
    this.running = true;
  }

  exit(code?: number) {
    this.running = false;
    process.exit(code);
  }

  get yargs() {
    if (this._yargs === undefined) {
      this._yargs = require('yargs');
    }
    return this._yargs;
  }

  get isRunning() {
    return this.running;
  }
}
