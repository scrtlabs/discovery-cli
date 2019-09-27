# discovery-cli
Command Line Interface (CLI) for the Discovery Enigma Protocol developer testnet.

## Requirements

- [Docker](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/install/) version 1.23.2 or higher. Please be aware that docker-compose introduced a bug in 1.23.0 (also present in 1.23.1) that appended random strings to container names that causes this network configuration to break.
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node.js](https://nodejs.org/en/) (version 10 or higher): `node` and `npm`
- [Rust](https://www.rust-lang.org/tools/install): `rustup`, `rustc` and `cargo`

## Installation

`discovery-cli` should be installed as a global package:

```
npm install -g @enigmampc/discovery-cli
```

For detailed instructions on how to install all the required dependencies, see the [Installation instructions](docs/Installation.md)

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

## Advanced Usage

By default `discovery-cli` will run a docker network with one worker. As of version `0.1.0`, if you want to have more than 1 worker node in the network, you can specify the environment variable `NODES` to specify any number of nodes between 1 and 9. For example, to have 3 worker nodes, we would run:

```
NODES=3 discovery start
```

NOTE: In order for the network to operate robustly with more than one node, you have to edit your `.env` file and change the following line (until we merge the changes in `develop` to `stable` in the docker images, at which point we will remove this notice)
```
DOCKER_TAG=develop
```

## Uninstall
```
npm remove -g @enigmampc/discovery-cli
```

## How it works

This repo provides an intuitive and user-friendly interface for dApp developers of secret contracts. It uses an analogous workflow and functionality to [Truffle Suite](https://www.trufflesuite.com/). In fact, it builds on truffle packages and adapts the existing workflow to incorporate the functionality needed to compile, migrate and test secret contracts when having a running instance of the Enigma network.

For a detailed walkthrough guide on how to use this repo following a step-by-step example, refer to [Getting Started with Enigma: An Intro to Secret Contracts](https://blog.enigma.co/getting-started-with-enigma-an-intro-to-secret-contracts-cdba4fe501c2).

What follows is more geared to advanced users that want to understand what happens under the hood:

- `discovery init` calls [init()](https://github.com/enigmampc/discovery-cli/blob/549be1df4463e3a1248480b46498cd5e030dc1b8/src/index.js#L190) to initialize the folder structure and download the required files for any given project. Specifically:
    - Checks that the following [list of dependecies](https://github.com/enigmampc/discovery-cli/blob/549be1df4463e3a1248480b46498cd5e030dc1b8/src/constants.js#L96) exist in the system.
    - Creates the following directory structure:
    ```
    {your_project_folder}
     |
     ├-- build
     |    ├-- enigma_contracts
     |    └-- secret_contracts
     ├-- client
     ├-- migrations
     ├-- smart_contracts
     ├-- secret_contracts
     |    └-- sample_contract
     └-- test
     ```
     - Downloads the [required files](https://github.com/enigmampc/discovery-cli/blob/549be1df4463e3a1248480b46498cd5e030dc1b8/src/index.js#L53) populating the above folder structure
     - Asks the user whether to run in SGX Hardware or Software mode, and configures it accordingly
     - Pulls the required docker images from [enigmampc Docker Hub](https://hub.docker.com/u/enigmampc)

- `discovery start` launches a dockerized version of the Discovery release of the Enigma network. This is the analogous command to `truffle develop` or `ganache-cli`. It is a more streamlined version of the [discovery-docker-network](https://github.com/enigmampc/discovery-docker-network) configured through either one of the following `docker-compose.yml` files: [hardware version](https://github.com/enigmampc/discovery-docker-network/blob/master/config/docker-compose.cli-hw.yml), [software version](https://github.com/enigmampc/discovery-docker-network/blob/master/config/docker-compose.cli-sw.yml). It exposes these two ports to the host: `9545` (Ganache/Truffle) and `3346` (Peer-to-Peer proxy: the client entry point to the P2P network). Make sure that these two ports are free and available on the host. Having this command running is a prerequisite to running `discovery compile`, `discovery migrate` and `discovery test`.

- `discovery stop`is the countercommand to `discovery start` to properly shut down the network. It is automatically called before starting the network to ensure that it starts from a blank state every time.

- `discovery pull` pulls the latest docker images for the network. It's a shortcut for `docker-compose pull`

- `discovery compile` calls [deps/compile](https://github.com/enigmampc/discovery-cli/blob/549be1df4463e3a1248480b46498cd5e030dc1b8/src/deps.js#L113) which in turn calls first `truffle compile` and then executes Rust `cargo` to compile all secret contract to their WebAssembly format. Puts both sets of contracts under their respective subfolders under the `build` folder.

- `discovery migrate` runs the migrations in the `migrations` folder. Specifically, the [2_deploy_contracts.js](https://github.com/enigmampc/discovery-cli/blob/master/config/2_deploy_contracts.js) file is a customized migration Javascript file that migrates both the Smart Contracts and Secret Contracts, following the Truffle specs.

- `discovery test` run the tests in the `test` folder. Similarly as above, [test_simple_addition.js](https://github.com/enigmampc/discovery-cli/blob/master/config/test_simple_addition.js) is a customized Javascript test file that tests the sample `simple_addition` contract provided in this repo, following the Truffle specs.
