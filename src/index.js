#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const argv = require('yargs');
const axios = require('axios');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const {spawn} = require('child_process');
const compose = require('docker-compose');

const deps = require('./deps');
const docker = require('./docker');
const migrate = require('./migrate');
const constants = require('./constants');
const questions = require('./questions');


function spawnProcess(cmd, args){
  const p = spawn(cmd, args);

  p.stdout.on('data', (data) => {
    process.stdout.write(data.toString('utf-8'));
  });

  p.stderr.on('data', (data) => {
    process.stderr.write(data.toString('utf-8'));
  });

  p.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

function downloadFiles() {
  axios.all([
    axios.get(constants.URL.DOCKER_COMPOSE_HW),
    axios.get(constants.URL.DOCKER_COMPOSE_SW),
    axios.get(constants.URL.CARGO_TOML),
    axios.get(constants.URL.SAMPLE_SECRET_CONTRACT),
    axios.get(constants.URL.SAMPLE_SMART_CONTRACT),
    axios.get(constants.URL.MIGRATIONS_CONTRACT),
    axios.get(constants.URL.INITIAL_MIGRATION),
    axios.get(constants.URL.DEPLOY_CONTRACTS)
  ]).then(axios.spread((response1, response2, response3, response4, response5, response6, r7, r8) => {
      fs.writeFileSync(constants.FILE.DOCKER_COMPOSE_HW, response1.data);
      fs.writeFileSync(constants.FILE.DOCKER_COMPOSE_SW, response2.data);
      fs.writeFileSync(`${constants.FOLDER.SECRET_CONTRACTS}/${constants.FILE.CARGO_TOML}.template`, response3.data);
      let sampleContractFolder = path.join(constants.FOLDER.SECRET_CONTRACTS, constants.FOLDER.SAMPLE_CONTRACT);
      if (!fs.existsSync(sampleContractFolder)) {
        fs.mkdirSync(path.join(sampleContractFolder,'src'), {recursive: true});
      }
      fs.writeFileSync(path.join(sampleContractFolder,'src/lib.rs'), response4.data);
      fs.writeFileSync(path.join(sampleContractFolder, constants.FILE.CARGO_TOML), response3.data);
      fs.writeFileSync(path.join(constants.FOLDER.SMART_CONTRACTS, constants.FILE.SAMPLE_SMART_CONTRACT), response5.data);
      fs.writeFileSync(path.join(constants.FOLDER.SMART_CONTRACTS, constants.FILE.MIGRATIONS_CONTRACT), response6.data);
      fs.writeFileSync(path.join(constants.FOLDER.MIGRATIONS, constants.FILE.INITIAL_MIGRATION), r7.data);
      fs.writeFileSync(path.join(constants.FOLDER.MIGRATIONS, constants.FILE.DEPLOY_CONTRACTS), r8.data);
    }))
    .catch(error => {
      console.log(error);
    });
}

function createFolders() {
  if (!fs.existsSync(constants.FOLDER.SMART_CONTRACTS)){
    fs.mkdirSync(constants.FOLDER.SMART_CONTRACTS);
  }
  if (!fs.existsSync(constants.FOLDER.SECRET_CONTRACTS)){
    fs.mkdirSync(constants.FOLDER.SECRET_CONTRACTS);
  }
  if (!fs.existsSync(path.join(constants.FOLDER.BUILD, constants.FOLDER.SMART_CONTRACTS))){
    fs.mkdirSync(path.join(constants.FOLDER.BUILD, constants.FOLDER.SMART_CONTRACTS), {recursive: true});
  }
  if (!fs.existsSync(path.join(constants.FOLDER.BUILD, constants.FOLDER.ENIGMA_CONTRACTS))){
    fs.mkdirSync(path.join(constants.FOLDER.BUILD, constants.FOLDER.ENIGMA_CONTRACTS), {recursive: true});
  }
  if (!fs.existsSync(constants.FOLDER.MIGRATIONS)){
    fs.mkdirSync(constants.FOLDER.MIGRATIONS);
  }
}

function contentsEnvFile(mode) {
  const folder = path.join(process.cwd(), constants.FOLDER.BUILD, constants.FOLDER.ENIGMA_CONTRACTS);
  return `COMPOSE_PROJECT_NAME=enigma\nSGX_MODE=${mode}\nBUILD_CONTRACTS_PATH=${folder}`;
}

function swhwMode() {
  inquirer.prompt(questions.mode).then(answer => {
    if(answer.mode === 'sw' | answer.mode === 'SW') {
      fs.writeFileSync(constants.FILE.ENV, contentsEnvFile('SW'), constants.ENCODING);
      if(fs.existsSync('docker-compose.yml')) {
        fs.unlinkSync('docker-compose.yml');
      }
      fs.symlinkSync(constants.FILE.DOCKER_COMPOSE_SW, 'docker-compose.yml')
      pullImages(false);
    } else {
      fs.writeFileSync(constants.FILE.ENV, contentsEnvFile('HW'), constants.ENCODING);
      if(fs.existsSync('docker-compose.yml')) {
        fs.unlinkSync('docker-compose.yml');
      }
      fs.symlinkSync(constants.FILE.DOCKER_COMPOSE_HW, 'docker-compose.yml')
      pullImages(true);
    }
  });
}

function pullImages(hwMode) {
  // Should Get/Compute the actual sizes of those images
  inquirer.prompt(questions.size).then(async function(answer) {
    if(answer.size === 'n' | answer.size === 'N'){
      process.exit()
    }
    console.log('Pulling Enigma Docker images...')
    await docker.pullImage(constants.DOCKER.P2P, 'latest');
    await docker.pullImage(constants.DOCKER.CONTRACT, 'latest');
    if(hwMode){
      await docker.pullImage(constants.DOCKER.KM_HW, 'latest');
      await docker.pullImage(constants.DOCKER.CORE_HW, 'latest');
    } else {
      await docker.pullImage(constants.DOCKER.KM_SW, 'latest');
      await docker.pullImage(constants.DOCKER.CORE_SW, 'latest');
    }
  });
}

function init() {
  console.log(
    chalk.blue(
      figlet.textSync('Discovery', { horizontalLayout: 'full' })
    )
  );

  inquirer.prompt(questions.start).then(async function(answer) {
    if(answer.start === 'n' | answer.start === 'N'){
      process.exit()
    }
    await deps.checkDependencies();
    createFolders();
    downloadFiles();
    swhwMode();
  });
}

function start() {
  compose.ps({})
  .then( async (output) => {
    let myReg = new RegExp(Object.keys(constants.SERVICE).map((key) => {return `${constants.SERVICE[key]}_1`}).join('|'))
    if(output.out.match(myReg)){
      console.log('Enigma Network is already running, stopping it first.')
      await stop();
    }
    console.log('Starting Enigma Network...');
    spawnProcess('docker-compose', ['up']);
  });
}

async function stop() {
  return compose.down({ cwd: process.cwd(), log: true })
  .then(
    err => { if(err.message){ console.log('something went wrong:', err.message)}}
  );
}

argv
  .command('init', 'Initialize Enigma Protocol Discovery development environment', () => {}, () => {
    init();
  })
  .command('start', 'Launch the Discovery Docker network', () => {}, () => {
    start();
  })
  .command('stop', 'Stop the network by stopping and removing all containers', () => {}, () => {
    stop();
  })
  .command('compile', 'Compile Secret Contracts and Smart Contracts', () => {}, () => {
    deps.compile();
  })
  .command('migrate', 'Migrate Secret Contracts and Smart Contracts', () => {}, () => {
    migrate.migrate();
  })
  .demandCommand(1)
  .argv
