#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const argv = require('yargs');
const axios = require('axios');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const compose = require('docker-compose');

const deps = require('./deps');
const docker = require('./docker');
const constants = require('./constants');
const questions = require('./questions');


function downloadFiles() {
  axios.all([
    axios.get(constants.URL.DOCKER_COMPOSE_HW),
    axios.get(constants.URL.DOCKER_COMPOSE_SW),
  ]).then(axios.spread((response1, response2) => {
      fs.writeFileSync(constants.FILE.DOCKER_COMPOSE_HW, response1.data);
      fs.writeFileSync(constants.FILE.DOCKER_COMPOSE_SW, response2.data);
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
}

function swhwMode() {
  inquirer.prompt(questions.mode).then(answer => {
    if(answer.mode === 'sw' | answer.mode === 'SW') {
      const contents = 'COMPOSE_PROJECT_NAME=enigma\nSGX_MODE=SW';
      fs.writeFileSync(constants.FILE.ENV, contents, constants.ENCODING);
      if(fs.existsSync('docker-compose.yml')) {
        fs.unlinkSync('docker-compose.yml');
      }
      fs.symlinkSync(constants.FILE.DOCKER_COMPOSE_SW, 'docker-compose.yml')
      pullImages(false);
    } else {
      const contents = 'COMPOSE_PROJECT_NAME=enigma\nSGX_MODE=HW'
      fs.writeFileSync(constants.FILE.ENV, contents, constants.ENCODING);
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
    if(answer.start === 'n' | answer.start === 'N'){
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

  inquirer.prompt(questions.start).then(answer => {
    if(answer.start === 'n' | answer.start === 'N'){
      process.exit()
    }
    deps.checkDependencies();
    downloadFiles();
    createFolders();
    swhwMode();
  });
}

function start() {
  compose.upAll({ cwd: path.join(__dirname), log: true })
  .then(
    async () => { 
      compose.logs(constants.SERVICES, {cwd: path.join(__dirname), log: true, follow: true});
    },
    err => { console.log('something went wrong:', err.message)}
  );
}

function stop() {
  compose.down({ cwd: path.join(__dirname), log: true })
  .then(
    err => { if(err.message){ console.log('something went wrong:', err.message)}}
  );
}

argv
  .command('init', 'Initialize Enigma Protocol Discovery development environment', () => {}, () => {
    init();
  })
  .command('start', 'Launch the the Discovery Docker network', () => {}, () => {
    start();
  })
  .command('stop', 'Stop the network by stopping and removing all containers', () => {}, () => {
    stop();
  })
  .demandCommand(1)
  .argv
