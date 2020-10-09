import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { UserCommand } from './user/user.command';
import { UserService } from './user/user.service';

@Module({
  imports: [CommandModule],
  providers: [UserCommand, UserService],
})
export class AppModule {}
