import * as _ from 'lodash';
import { flattenDeep } from 'lodash';
import { CommandModule, Argv } from 'yargs';
import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { Injectable as InjectableInterface } from '@nestjs/common/interfaces';
import {
  COMMAND_HANDLER_METADATA,
  CommandMetadata,
  CommandParamTypes,
  CommandParamMetadata,
  CommandOptionsOption,
  CommnadPositionalOption,
  CommandParamMetadataItem,
} from './command.decorator';
import { CommandService } from './command.service';

@Injectable()
export class CommandExplorerService {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
    private readonly commandService: CommandService,
  ) { }

  explore(): CommandModule[] {
    const components = [
      ...this.modulesContainer.values(),
    ].map(module => module.components);

    return flattenDeep<CommandModule>(
      components.map(component =>
        [...component.values()]
          .map(({ instance, metatype }) => this.filterCommands(instance, metatype)),
      ),
    );
  }

  protected filterCommands(instance: InjectableInterface, metatype: any) {
    const prototype = Object.getPrototypeOf(instance);
    const components = this.metadataScanner.scanFromPrototype(
      instance,
      prototype,
      name => this.extractMetadata(instance, prototype, name),
    );

    return components
      .filter(command => !!command.metadata)
      .map<CommandModule>(command => {
        const exec = instance[command.methodName].bind(instance);
        const builder = (yargs: Argv) => {
          this.applyParamMetadata(
            command.metadata.params,
            (item, key) => {
              switch (key) {
                case CommandParamTypes.OPTION:
                  yargs.option(
                    (item.option as CommandOptionsOption).name,
                    (item.option as CommandOptionsOption),
                  );
                  break;

                case CommandParamTypes.POSITIONAL:
                  yargs.positional(
                    (item.option as CommnadPositionalOption).name,
                    (item.option as CommnadPositionalOption),
                  );
                  console.log((item.option as CommnadPositionalOption));

                  break;

                default:
                  break;
              }
            },
          ); // EOF applyParamMetadata

          return yargs;
        }; // EOF builder

        const handler = async (argv: any) => {
          this.commandService.run();

          const params = [];
          this.applyParamMetadata(
            command.metadata.params,
            (item, key) => {
              switch (key) {
                case CommandParamTypes.OPTION:
                  params[item.index] = argv[(item.option as CommandOptionsOption).name];
                  break;

                case CommandParamTypes.POSITIONAL:
                  params[item.index] = argv[(item.option as CommnadPositionalOption).name];
                  break;

                case CommandParamTypes.ARGV:
                  params[item.index] = argv;

                default:
                  break;
              }
            },
          );

          const code = await exec(...params);

          this.commandService.exit(code || 0);
        };

        return {
          ...command.metadata.option,
          builder,
          handler,
        };
      });
  }

  protected extractMetadata(instance, prototype, methodName: string) {
    const callback = prototype[methodName];
    const metadata: CommandMetadata = Reflect.getMetadata(COMMAND_HANDLER_METADATA, callback);

    return {
      methodName, metadata,
    };
  }

  private applyParamMetadata<O>(
    params: CommandParamMetadata<O>,
    callback: (item: CommandParamMetadataItem<O>, key: string) => void,
  ) {
    _.each(params, (param, key) => {
      _.each(param, (metadata) => callback(metadata, key));
    });
  }
}