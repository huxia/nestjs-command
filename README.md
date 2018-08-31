# Nestjs Command

## Description

[Nest.js](https://github.com/nestjs/nest) Command tools, base on [yargs](https://github.com/yargs/yargs)

## Installation

```bash
$ npm install
```

## Quick Start

Register the command module in base module: `/src/app.module.ts`

```ts
import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';

@Module({
  imports: [
    CommandModule,
  ],
})
export class AppModule {}

```

Create a Init File: `/src/cli.ts`

```ts
import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { CoreModule } from './core/core.module'; // Base module
import { QuietLogger } from './core/services/quiet-logger.service'; // Custom Logger

(async () => {
  const app = await NestFactory.createApplicationContext(CoreModule);
  app.select(CommandModule).get(CommandService).exec();
})();

```

Create cli file: `/bin/cli`

```js
#!/usr/bin/env node

(function () {
  const path = require('path');
  const PATH_PROD_CODE_DIR = '../dist';
  const PATH_DEV_CODE_DIR = '../src';
  const PATH_BOOTSTRAP_CLI_FILE = './cli';

  switch (process.env.NODE_ENV) {
    case 'production':
    case 'prod':
      require(path.resolve(__dirname, PATH_PROD_CODE_DIR, PATH_BOOTSTRAP_CLI_FILE + '.js'));
      break;

    case 'develope':
    case 'dev':
    default:
      require('ts-node').register();
      require(path.resolve(__dirname, PATH_DEV_CODE_DIR, PATH_BOOTSTRAP_CLI_FILE + '.ts'));
      break;
  }
})();
```

# Usage

Create a simple Command File: `/src/user/user.command.ts`

```typescript
import { Command, Positional } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class UserCommand {
  constructor(
    private readonly userService: UserService,
  ) { }

  @Command({ command: 'create:user <account>', describe: 'create a user' })
  async create(
    @Positional({
      name: 'account',
      describe: 'the user account string',
      type: 'string',
    }) account: string,
  ) {
    const user = await this.userService.create(account);
    console.log(user);
  }
}

```

Run cli in terminal

```bash
bin/cli
```

