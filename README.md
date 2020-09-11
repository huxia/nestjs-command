# Nestjs Command

![npm](https://img.shields.io/npm/v/nestjs-command)
![npm](https://img.shields.io/npm/dw/nestjs-command)

## Description

[Nest.js](https://github.com/nestjs/nest) Command tools, based on [yargs](https://github.com/yargs/yargs).

## Dependency

- Use version `1.*` for nestjs `6.*`
- Use version `0.*` for nestjs `5.*`

## Installation

```bash
$ npm install --save nestjs-command

# if you use typescript
$ npm install --save-dev @types/yargs
```

## Quick Start

Register the command module in your base module: `./src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';

@Module({
  imports: [
    CommandModule,
  ],
})
export class AppModule {}
```

Create a Cli entrypoint: `./src/cli.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { CoreModule } from './core/core.module';

(async () => {
  const app = await NestFactory.createApplicationContext(CoreModule, {
    logger: false // no logger
  });
  app.select(CommandModule).get(CommandService).exec();
})();
```

And create your command providers (see the example below).

Run your program in either ways:

- `npx nestjs-command`: run by default `./src/cli.ts`
- `CLI_PATH=./dist/cli.js npx nestjs-command`: run `/dist/cli.js` with the `CLI_PATH` env
- `node ./src/api.js` if you use plain javascript
- `ts-node ./src/api.ts` if you use typescript

## Usage example

> Note: you will find documentation about yargs `command positional` [here](https://yargs.js.org/docs/#api-reference-positionalkey-opt), and yargs `command options` [here](https://yargs.js.org/docs/#api-reference-optionskey-opt).

Create a simple Command File: `./src/user/user.command.ts`

```typescript
import { Command, Positional, Option } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class UserCommand {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Command({ 
    command: 'create:user <username>',
    describe: 'create a user',
    autoExit: true // defaults to `true`, but you can use `false` if you need more control
  })
  async create(
    @Positional({
      name: 'username',
      describe: 'the username',
      type: 'string',
    })
    username: string,

    @Option({
      name: 'group',
      describe: 'user group (ex: "jedi")',
      type: 'string',
      alias: 'g',
      required: false,
    })
    group: string,

    @Option({
      name: 'saber',
      describe: 'if user has a lightsaber',
      type: 'boolean',
      default: false,
      required: false,
    })
    saber: boolean,
  ) {
    this.userService.add({
      username,
      group,
      saber,
    });
  }
}
```

Create a simple Service File: `./src/user/user.service.ts`

```typescript
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
  async add(user: any): Promise<any> {
    return Promise.resolve().then(() => {
      console.log("user added:", user);
    })
  }
}
```

Register this *UserCommand* and *UserService" as providers in your base module: `./src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { UserCommand } from "./user/user.command";
import { UserService } from './user/user.service';

@Module({
  imports: [
    CommandModule,
  ],
  providers: [
    UserCommand,
    UserService,
  ]
})
export class AppModule {}
```

And create a cli entrypoint: `./src/cli.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'] // only errors
  });
  app
    .select(CommandModule)
    .get(CommandService)
    .exec();
  }
  bootstrap();
```

### Run your program in a terminal

__Get some help__:

```bash
$ ts-node ./src/cli.ts create:user --help
cli create:user <username>

create a user

Positionals:
  username  the username                                     [string] [required]

Options:
  -h, --help     Show help                                             [boolean]
  --saber        if user has a lightsaber             [boolean] [default: false]
  --group, -g    user group (ex: "jedi")                                [string]
  -v, --version  Show version number                                   [boolean]
```

__Add a new user__:

```bash
$ ts-node ./src/cli.ts create:user anakin --group jedi --no-saber
user added: { username: 'anakin', group: 'jedi', saber: false }

$ ts-node ./src/cli.ts create:user yoda --group jedi --saber
user added: { username: 'yoda', group: 'jedi', saber: true }
```

### How to test it?

```typescript
import { Test } from '@nestjs/testing';
import { CommandModule, CommandModuleTest } from 'nestjs-command';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let commandModule: CommandModuleTest;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();
    commandModule = new CommandModuleTest(app.select(CommandModule));
  });

  it('test command module', async () => {
    const command = 'create:user <username>';
    const args = { username: 'Foo', group: 'Bar', lightsaber: false };
    const exitCode = 0;

    await commandModule.execute(command, args, exitCode);
  });
});
```
