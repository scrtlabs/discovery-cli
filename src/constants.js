const RAWGIT = 'https://raw.githubusercontent.com/';
const ORG = 'enigmampc';
const CLI_REPO = 'discovery-cli';
const DOCKER_REPO = 'discovery-docker-network';
const BRANCH_CLI = 'master';
const BRANCH_DOCKER = 'develop'
const RAWGIT_DOCKER = `${RAWGIT}${ORG}/${DOCKER_REPO}/${BRANCH_DOCKER}/`
const RAWGIT_CLI = `${RAWGIT}${ORG}/${CLI_REPO}/${BRANCH_CLI}/`
const REPO_P2P = 'enigma_p2p';
const REPO_CONTRACT = 'enigma_contract';
const REPO_CORE_HW = 'enigma_core_hw';
const REPO_CORE_SW = 'enigma_core_sw';
const REPO_KM_HW = 'enigma_km_hw';
const REPO_KM_SW = 'enigma_km_sw';
const DOCKERHUB_API = 'https://registry.hub.docker.com/v2/repositories/';

module.exports.FILE = {
  DOCKER_COMPOSE_HW: 'docker-compose.cli-hw.yml',
  DOCKER_COMPOSE_SW: 'docker-compose.cli-sw.yml',
  CARGO_TOML: 'Cargo.toml',
  ENV_TEMPLATE: '.env-template',
  ENV: '.env'

}

module.exports.FOLDER = {
  SMART_CONTRACTS: 'smart_contracts',
  SECRET_CONTRACTS: 'secret_contracts',
  TEST: 'test'
}

module.exports.URL = {
  DOCKER_COMPOSE_HW: `${RAWGIT_DOCKER}config/` + module.exports.FILE.DOCKER_COMPOSE_HW,
  DOCKER_COMPOSE_SW: `${RAWGIT_DOCKER}config/` + module.exports.FILE.DOCKER_COMPOSE_SW,
  CARGO_TOML: `${RAWGIT_CLI}config/` + module.exports.FILE.CARGO_TOML,
  ENV_TEMPLATE: RAWGIT_DOCKER + module.exports.FILE.ENV_TEMPLATE,
  DOCKERHUB_P2P: `${DOCKERHUB_API}${ORG}/${REPO_P2P}/tags/latest/`,
  DOCKERHUB_CORE: `${DOCKERHUB_API}${ORG}/${REPO_CORE_HW}/tags/latest/`,
  DOCKERHUB_CONTRACT: `${DOCKERHUB_API}${ORG}/${REPO_CONTRACT}/tags/latest/`,
}

module.exports.DOCKER = {
  P2P: `${ORG}/${REPO_P2P}`,
  KM_HW: `${ORG}/${REPO_KM_HW}`,
  KM_SW: `${ORG}/${REPO_KM_SW}`,
  CORE_HW: `${ORG}/${REPO_CORE_HW}`,
  CORE_SW: `${ORG}/${REPO_CORE_SW}`,
  CONTRACT: `${ORG}/${REPO_CONTRACT}`,
}

module.exports.SERVICE = {
  KM: 'km',
  P2P: 'p2p',
  CORE: 'core',
  CLIENT: 'client',
  CONTRACT: 'contract'
}

var services = [];
Object.keys(module.exports.SERVICE).forEach(function(key){
  services.push(module.exports.SERVICE[key])
})
module.exports.SERVICES = services;

module.exports.ENCODING = 'utf-8';
module.exports.DEPENDENCIES = ['docker', 'docker-compose', 'rustc', 'cargo'];

