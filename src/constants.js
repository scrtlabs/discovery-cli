const RAWGIT = 'https://raw.githubusercontent.com/';
const ORG = 'enigmampc';
const REPO_CLI = 'discovery-cli';
const REPO_P2P = 'enigma_p2p';
const REPO_CONTRACT = 'enigma-contract';
const REPO_CONTRACT_DOCKER = 'enigma_contract';
const REPO_CORE_HW = 'enigma_core_hw';
const REPO_CORE_SW = 'enigma_core_sw';
const REPO_KM_HW = 'enigma_km_hw';
const REPO_KM_SW = 'enigma_km_sw';
const REPO_DOCKER = 'discovery-docker-network';
const BRANCH_CLI = 'master';
const BRANCH_DOCKER = 'develop';
const BRANCH_CONTRACT = 'master';
const RAWGIT_DOCKER = `${RAWGIT}${ORG}/${REPO_DOCKER}/${BRANCH_DOCKER}/`
const RAWGIT_CLI = `${RAWGIT}${ORG}/${REPO_CLI}/${BRANCH_CLI}/`
const RAWGIT_CONTRACT = `${RAWGIT}${ORG}/${REPO_CONTRACT}/${BRANCH_CONTRACT}/`
const DOCKERHUB_API = 'https://registry.hub.docker.com/v2/repositories/';

module.exports.FILE = {
  DOCKER_COMPOSE_HW: 'docker-compose.cli-hw.yml',
  DOCKER_COMPOSE_SW: 'docker-compose.cli-sw.yml',
  CARGO_TOML: 'Cargo.toml',
  ENV_TEMPLATE: '.env-template',
  ENV: '.env',
  SAMPLE_SMART_CONTRACT: 'Sample.sol',
  MIGRATIONS_CONTRACT: 'Migrations.sol',
  INITIAL_MIGRATION: '1_initial_migration.js',
  DEPLOY_CONTRACTS: '2_deploy_contracts.js',
  TRUFFLE_JS: 'truffle.js',
  TEST_CONTRACT: 'test_simple_addition.js',
  PACKAGE_JSON: 'package.json',
}

module.exports.FOLDER = {
  SMART_CONTRACTS: 'smart_contracts',
  SECRET_CONTRACTS: 'secret_contracts',
  ENIGMA_CONTRACTS: 'enigma_contracts',
  TEST: 'test',
  BUILD: 'build',
  CONTRACT_PATH: 'target/wasm32-unknown-unknown/release/',
  SAMPLE_CONTRACT: 'simple_addition',
  MIGRATIONS: 'migrations',
}

module.exports.URL = {
  DOCKER_COMPOSE_HW: `${RAWGIT_DOCKER}config/` + module.exports.FILE.DOCKER_COMPOSE_HW,
  DOCKER_COMPOSE_SW: `${RAWGIT_DOCKER}config/` + module.exports.FILE.DOCKER_COMPOSE_SW,
  CARGO_TOML: `${RAWGIT_CLI}config/` + module.exports.FILE.CARGO_TOML,
  ENV_TEMPLATE: RAWGIT_DOCKER + module.exports.FILE.ENV_TEMPLATE,
  DOCKERHUB_P2P: `${DOCKERHUB_API}${ORG}/${REPO_P2P}/tags/latest/`,
  DOCKERHUB_CORE: `${DOCKERHUB_API}${ORG}/${REPO_CORE_HW}/tags/latest/`,
  DOCKERHUB_CONTRACT: `${DOCKERHUB_API}${ORG}/${REPO_CONTRACT_DOCKER}/tags/latest/`,
  SAMPLE_SMART_CONTRACT: `${RAWGIT_CONTRACT}contracts/Sample.sol`,
  SAMPLE_SECRET_CONTRACT: `${RAWGIT_CLI}config/lib.rs`,
  MIGRATIONS_CONTRACT: `${RAWGIT_CONTRACT}contracts/` + module.exports.FILE.MIGRATIONS_CONTRACT,
  INITIAL_MIGRATION: `${RAWGIT_CONTRACT}migrations/` + module.exports.FILE.INITIAL_MIGRATION,
  DEPLOY_CONTRACTS: `${RAWGIT_CLI}config/` + module.exports.FILE.DEPLOY_CONTRACTS,
  TRUFFLE_JS: `${RAWGIT_CLI}config/` + module.exports.FILE.TRUFFLE_JS,
  TEST_CONTRACT: `${RAWGIT_CLI}config/` + module.exports.FILE.TEST_CONTRACT,
  PACKAGE_JSON: `${RAWGIT_CLI}config/` + module.exports.FILE.PACKAGE_JSON,
}

module.exports.DOCKER = {
  P2P: `${ORG}/${REPO_P2P}`,
  KM_HW: `${ORG}/${REPO_KM_HW}`,
  KM_SW: `${ORG}/${REPO_KM_SW}`,
  CORE_HW: `${ORG}/${REPO_CORE_HW}`,
  CORE_SW: `${ORG}/${REPO_CORE_SW}`,
  CONTRACT: `${ORG}/${REPO_CONTRACT_DOCKER}`,
}

module.exports.SERVICE = {
  KM: 'km',
  P2P: 'p2p',
  CORE: 'core',
  CLIENT: 'client',
  CONTRACT: 'contract'
}

module.exports.CONTRACT = {
  ENIGMA: 'Enigma.json',
  ENIGMA_SIMULATION: 'EnigmaSimulation.json',
  ENIGMA_TOKEN: 'EnigmaToken.json'
}

var services = [];
Object.keys(module.exports.SERVICE).forEach(function(key){
  services.push(module.exports.SERVICE[key])
})
module.exports.SERVICES = services;

module.exports.ENCODING = 'utf-8';
module.exports.DEPENDENCIES = ['docker', 'docker-compose', 'rustc', 'cargo', 'rustup', 'npm'];
module.exports.RUST_NIGHTLY = 'nightly-2019-05-20';
