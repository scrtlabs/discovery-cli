# discovery-cli
Command Line Interface (CLI) for the Discovery Enigma Protocol development environment

## Installation
```
npm install -g @enigmampc/discovery-cli
```

## Usage
```
$ discovery <command>

Commands:
  discovery init     Initialize Enigma Discovery development environment
  discovery compile  Compile Secret Contracts and Smart Contracts
  discovery migrate  Migrate Secret Contracts and Smart Contracts
  discovery pull     Pull the latest images for the containers in the network
  discovery start    Launch the Discovery Docker network
  discovery stop     Stop the network by stopping and removing all containers
  discovery test     Test Secret Contracts and Smart Contracts

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

## Uninstall
```
npm remove -g @enigmampc/discovery-cli
```