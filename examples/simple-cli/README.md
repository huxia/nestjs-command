# A simple Cli example with Nestjs Command

Please see the `./src` folder.

## Usage

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

__Test__:

```
npm test
```
