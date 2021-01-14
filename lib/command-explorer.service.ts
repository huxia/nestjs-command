import compact from 'lodash.compact';
import flattenDeep from 'lodash.flattendeep';
import { CommandModule, Argv, Arguments } from 'yargs';
import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { Injectable as IInjectable } from '@nestjs/common/interfaces';
import {
  COMMAND_HANDLER_METADATA,
  CommandMetadata,
  CommandParamTypes,
  CommandParamMetadata,
  CommandOptionsOption,
  CommnadPositionalOption,
  CommandParamMetadataItem
} from './command.decorator';
import { CommandService } from './command.service';

@Injectable()
export class CommandExplorerService {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
    private readonly commandService: CommandService
  ) {}

  explore(): CommandModule[] {
    const components = [...this.modulesContainer.values()].map(
      module => module.components
    );

    return compact(
      flattenDeep<CommandModule>(
        components.map(component =>
          [...component.values()].map(({ instance, metatype }) =>
            this.filterCommands(instance, metatype)
          )
        )
      )
    );
  }

  protected filterCommands(instance: IInjectable, metatype: any) {
    if (!instance) return;

    const prototype = Object.getPrototypeOf(instance);
    const components = this.metadataScanner.scanFromPrototype(
      instance,
      prototype,
      name => this.extractMetadata(instance, prototype, name)
    );

    return components
      .filter(command => !!command.metadata)
      .map<CommandModule>(command => {
        const exec = instance[command.methodName].bind(instance);

        const builder: NonNullable<CommandModule['builder']> = (yargs) =>
          this.generateCommandBuilder(command.metadata.params, yargs);

        const handler: NonNullable<CommandModule['handler']> = async (args) => {
          const params = this.generateCommandHandlerParams(
            command.metadata.params,
            args
          );

          this.commandService.run();
          const code = await exec(...params);
          command.metadata.option.autoExit &&
            this.commandService.exit(code || 0);
        };

        return {
          ...command.metadata.option,
          builder,
          handler
        };
      });
  }

  protected extractMetadata(instance, prototype, methodName: string) {
    const callback = prototype[methodName];
    const metadata: CommandMetadata = Reflect.getMetadata(
      COMMAND_HANDLER_METADATA,
      callback
    );

    return {
      methodName,
      metadata
    };
  }

  protected iteratorParamMetadata<O>(
    params: CommandParamMetadata<O>,
    callback: (item: CommandParamMetadataItem<O>, key: string) => void
  ) {
    if (!params) {
      return;
    }

    Object.keys(params).forEach(key => {
      const param: CommandParamMetadataItem<O>[] = params[key];
      if (!param || !Array.isArray(param)) {
        return;
      }

      param.forEach(metadata => callback(metadata, key));
    });
  }

  private generateCommandHandlerParams(
    params: CommandParamMetadata<
      CommandOptionsOption | CommnadPositionalOption
    >,
    argv: Arguments
  ) {
    const list = [];

    this.iteratorParamMetadata(params, (item, key) => {
      switch (key) {
        case CommandParamTypes.OPTION:
          list[item.index] = argv[(item.option as CommandOptionsOption).name];
          break;

        case CommandParamTypes.POSITIONAL:
          list[item.index] =
            argv[(item.option as CommnadPositionalOption).name];
          break;

        case CommandParamTypes.ARGV:
          list[item.index] = argv;

        default:
          break;
      }
    });

    return list;
  }

  private generateCommandBuilder(
    params: CommandParamMetadata<
      CommandOptionsOption | CommnadPositionalOption
    >,
    yargs: Argv
  ) {
    this.iteratorParamMetadata(params, (item, key) => {
      switch (key) {
        case CommandParamTypes.OPTION:
          yargs.option(
            (item.option as CommandOptionsOption).name,
            item.option as CommandOptionsOption
          );
          break;

        case CommandParamTypes.POSITIONAL:
          yargs.positional(
            (item.option as CommnadPositionalOption).name,
            item.option as CommnadPositionalOption
          );
          break;

        default:
          break;
      }
    });

    return yargs;
  }
}
