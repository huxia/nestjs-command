import { Command, Positional, Option } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class UserCommand {
  constructor(private readonly userService: UserService) {}

  @Command({
    command: 'create:user <username>',
    describe: 'create a user',
    autoExit: true, // defaults to `true`, but you can use `false` if you need more control
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
