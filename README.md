# discovery-cli
Command Line Interface (CLI) for the Discovery Enigma Protocol development environment

## Requirements

- [Docker](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/install/) version 1.23.2 or higher. Please be aware that docker-compose introduced a bug in 1.23.0 (also present in 1.23.1) that appended random strings to container names that causes this network configuration to break.
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node.js](https://nodejs.org/en/): 'npm'
- [Rust](https://www.rust-lang.org/tools/install): `rustup`, `rustc` and `cargo`

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