#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const argv = require('yargs');
const axios = require('axios');
const chalk = require('chalk');
const dotenv = require('dotenv');
const git = require('simple-git/promise');
const inquirer = require('inquirer');
const {spawn} = require('child_process');
const compose = require('docker-compose');

const deps = require('./deps');
const docker = require('./docker');
const constants = require('./constants');
const questions = require('./questions');


function spawnProcess(cmd, args, options){

  const p = spawn(cmd, args, options);

  p.stdout.on('data', (data) => {
    process.stdout.write(data.toString('utf-8'));
  });

  p.stderr.on('data', (data) => {
    process.stderr.write(data.toString('utf-8'));
  });

  const promise = new Promise((resolve, reject) => {
    p.on('error', reject);

    p.on('exit', code => {
      if (code === 0) {
        resolve()
      } else {
        const err = new Error(`child exited with code ${code}`)
        err.code = code
        reject(err)
      }
    })
  })

  promise.child = p;

  return promise;

}

async function downloadFiles() {
  console.log('Downloading files...')
  await axios.all([
    axios.get(constants.URL.DOCKER_COMPOSE_HW),
    axios.get(constants.URL.DOCKER_COMPOSE_SW),
    axios.get(constants.URL.CARGO_TOML),
    axios.get(constants.URL.SAMPLE_SECRET_CONTRACT),
    axios.get(constants.URL.SAMPLE_SMART_CONTRACT),
    axios.get(constants.URL.MIGRATIONS_CONTRACT),
    axios.get(constants.URL.INITIAL_MIGRATION),
    axios.get(constants.URL.DEPLOY_CONTRACTS),
    axios.get(constants.URL.TRUFFLE_JS),
    axios.get(constants.URL.TEST_CONTRACT),
    axios.get(constants.URL.PACKAGE_JSON),
    axios.get(constants.URL.NGINX_CONF),
    axios.get(constants.URL.GIT_IGNORE)
  ]).then(axios.spread(async (r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13) => {
      fs.writeFileSync(constants.FILE.DOCKER_COMPOSE_HW, r1.data);
      fs.writeFileSync(constants.FILE.DOCKER_COMPOSE_SW, r2.data);
      fs.writeFileSync(`${constants.FOLDER.SECRET_CONTRACTS}/${constants.FILE.CARGO_TOML}.template`, r3.data);
      let sampleContractFolder = path.join(constants.FOLDER.SECRET_CONTRACTS, constants.FOLDER.SAMPLE_CONTRACT);
      if (!fs.existsSync(path.join(sampleContractFolder,'src'))) {
        fs.mkdirSync(path.join(sampleContractFolder,'src'));
      }
      fs.writeFileSync(path.join(sampleContractFolder,'src/lib.rs'), r4.data);
      fs.writeFileSync(path.join(sampleContractFolder, constants.FILE.CARGO_TOML), r3.data);
      fs.writeFileSync(path.join(constants.FOLDER.SMART_CONTRACTS, constants.FILE.SAMPLE_SMART_CONTRACT), r5.data);
      fs.writeFileSync(path.join(constants.FOLDER.SMART_CONTRACTS, constants.FILE.MIGRATIONS_CONTRACT), r6.data);
      fs.writeFileSync(path.join(constants.FOLDER.MIGRATIONS, constants.FILE.INITIAL_MIGRATION), r7.data);
      fs.writeFileSync(path.join(constants.FOLDER.MIGRATIONS, constants.FILE.DEPLOY_CONTRACTS), r8.data);
      fs.writeFileSync(constants.FILE.TRUFFLE_JS, r9.data);
      fs.writeFileSync(path.join(constants.FOLDER.TEST, constants.FILE.TEST_CONTRACT), r10.data);
      fs.writeFileSync(constants.FILE.PACKAGE_JSON, JSON.stringify(r11.data));
      fs.writeFileSync(path.join(constants.FOLDER.CONFIG, constants.FILE.NGINX_CONF), r12.data);
      fs.writeFileSync(constants.FILE.GIT_IGNORE, r13.data);
      console.log('Installing package dependendecies...')
      await git().clone(constants.URL.GIT_CLIENT, constants.FOLDER.CLIENT)
        .catch((err) => {console.log(err); process.exit(1);});
      await spawnProcess('npm', ['install'], {cwd: constants.FOLDER.CLIENT});
      await spawnProcess('npm', ['install']);
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
  if (!fs.existsSync(path.join(constants.FOLDER.SECRET_CONTRACTS, constants.FOLDER.SAMPLE_CONTRACT))){
    fs.mkdirSync(path.join(constants.FOLDER.SECRET_CONTRACTS, constants.FOLDER.SAMPLE_CONTRACT));
  }
  if (!fs.existsSync(constants.FOLDER.BUILD)){
    fs.mkdirSync(path.join(constants.FOLDER.BUILD));
  }
  if (!fs.existsSync(path.join(constants.FOLDER.BUILD, constants.FOLDER.SMART_CONTRACTS))){
    fs.mkdirSync(path.join(constants.FOLDER.BUILD, constants.FOLDER.SMART_CONTRACTS));
  }
  if (!fs.existsSync(path.join(constants.FOLDER.BUILD, constants.FOLDER.ENIGMA_CONTRACTS))){
    fs.mkdirSync(path.join(constants.FOLDER.BUILD, constants.FOLDER.ENIGMA_CONTRACTS));
  }
  if (!fs.existsSync(constants.FOLDER.MIGRATIONS)){
    fs.mkdirSync(constants.FOLDER.MIGRATIONS);
  }
  if (!fs.existsSync(constants.FOLDER.TEST)){
    fs.mkdirSync(constants.FOLDER.TEST);
  }
  if (!fs.existsSync(constants.FOLDER.CLIENT)){
    fs.mkdirSync(constants.FOLDER.CLIENT);
  }
  if (!fs.existsSync(constants.FOLDER.CONFIG)){
    fs.mkdirSync(constants.FOLDER.CONFIG);
  }
}

function contentsEnvFile(mode) {
  const folder = path.join(process.cwd(), constants.FOLDER.BUILD, constants.FOLDER.ENIGMA_CONTRACTS);
  return `COMPOSE_PROJECT_NAME=enigma\nSGX_MODE=${mode}\nBUILD_CONTRACTS_PATH=${folder}\nDOCKER_TAG=latest`;
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

function getHWMode(){
  dotenv.config({path: path.resolve(deps.findBasePath(), '.env')});
  if(typeof process.env.SGX_MODE === 'undefined' || (process.env.SGX_MODE != 'SW' && process.env.SGX_MODE != 'HW' )) {
    console.log(`Error reading ".env" file. Run this command from the top-most project folder. Aborting....`);
    process.exit();
  } else if (process.env.SGX_MODE == 'HW') {
    return true;
  } else {
    return false;
  }
}

async function _pullImages(hwMode) {
  dotenv.config({path: path.resolve(deps.findBasePath(), '.env')});
  let dockerTag;
  if (typeof process.env.DOCKER_TAG !== 'undefined' && process.env.DOCKER_TAG == 'develop') {
    dockerTag = 'develop';
  } else {
    dockerTag = 'latest';
  }

  console.log('Pulling Enigma Docker images...')
  await docker.pullImage(constants.DOCKER.P2P, dockerTag);
  await docker.pullImage(constants.DOCKER.CONTRACT, dockerTag);
  if(hwMode){
    await docker.pullImage(constants.DOCKER.KM_HW, dockerTag);
    await docker.pullImage(constants.DOCKER.CORE_HW, dockerTag);
  } else {
    await docker.pullImage(constants.DOCKER.KM_SW, dockerTag);
    await docker.pullImage(constants.DOCKER.CORE_SW, dockerTag);
  }
}

function pullImages(hwMode, yes=false) {
  if(yes){
    _pullImages(hwMode);
  } else {
    // Should Get/Compute the actual sizes of those images
    inquirer.prompt(questions.size).then(function(answer) {
      if(answer.size === 'n' | answer.size === 'N'){
        process.exit()
      }
      _pullImages(hwMode);
    });
  }
}

function init() {
  const e = '    ______      _                               \n   / ____/___  (_)___ _____ ___  ____ _         \n  / __/ / __ \\/ / __ `/ __ `__ \\/ __ `/         \n / /___/ / / / / /_/ / / / / / / /_/ /          \n/_____/_/ /_/_/\\__, /_/ /_/ /_/\\__,_/           \n              /____/                            \n    ____             __                   __    \n   / __ \\_________  / /_____  _________  / /    \n  / /_/ / ___/ __ \\/ __/ __ \\/ ___/ __ \\/ /     \n / ____/ /  / /_/ / /_/ /_/ / /__/ /_/ / /      \n/_/   /_/   \\____/\\__/\\____/\\___/\\____/_/       \n                                                \n    ____  _                                     \n   / __ \\(_)_____________ _   _____  _______  __\n  / / / / / ___/ ___/ __ \\ | / / _ \\/ ___/ / / /\n / /_/ / (__  ) /__/ /_/ / |/ /  __/ /  / /_/ / \n/_____/_/____/\\___/\\____/|___/\\___/_/   \\__, /  \n                                       /____/   ';
  const ae = e.split('\n');
  const l = `                        .:.             
                    .::::-:/:.          
                .:::-       .:/:.       
            .:::-      .-      .//:     
        .:::-          :          .//:  
      /o:           -::/-           -/s 
     -/ ://.    -:::.   -//.    -:::.-/ 
     +     :/+/:.          :o/::.    +  
    /-      /-:/:.      -:::/.      /-  
   .+      .+   .:/:-:::.  ./      .+   
   +.      +.      +.      /.      +.  
  -:      -/      -/      -:      -/   
  +     - :/:     +    .:::-.     +    
 /-. .-     .//- /-.:::-     -.. /-   
 o.-           -/o:-           ::/     
  ://.          +.         -:::-       
     ://.      -/      -:::.           
       .:/:.   +   -:::.               
          .:/://:::.                  
             .:.                   `;
  const al = l.split(`\n`);
  const offset=1;
  output = '';
  for(let i=0; i<al.length; i++){
    if(i>= offset && i < ae.length+offset){
      output += ae[i-offset];
    } else {
      output += '                                                 ';
    }
    output += '   ';
    output += al[i]+'\n';
  }

  console.log(
    chalk.cyan(
      output
    )
  );

  inquirer.prompt(questions.start).then(async function(answer) {
    if(answer.start === 'n' | answer.start === 'N'){
      process.exit()
    }
    await deps.checkDependencies();
    createFolders();
    await downloadFiles();
    swhwMode();
  });
}

function start() {
  const baseFolder = deps.findBasePath();
  compose.ps({cwd: baseFolder})
  .then( async (output) => {
    let myReg = new RegExp(Object.keys(constants.SERVICE).map((key) => {return `${constants.SERVICE[key]}_1`}).join('|'))
    if(output.out.match(myReg)){
      console.log('Enigma Network is already running, stopping it first.')
      await stop();
    }
    console.log('Starting Enigma Network...');
    if (typeof process.env.NODES === 'undefined') {
      spawnProcess('docker-compose', ['up'], {cwd: baseFolder});
    } else {
      let nodes = Math.max(1, Math.min(9, parseInt(process.env.NODES)));
      spawnProcess('docker-compose', ['up', '--scale', 'core='+nodes, '--scale', 'p2p='+nodes], {cwd: baseFolder});

    }
  });
}

async function stop() {
  const baseFolder = deps.findBasePath();
  return compose.down({ cwd: baseFolder, log: true })
  .then(
    err => { if(err.message){ console.log('something went wrong:', err.message)}}
  );
}

argv
  .command('init', 'Initialize Enigma Discovery development environment', () => {}, () => {
    init();
  })
  .command('compile', 'Compile Secret Contracts and Smart Contracts', () => {}, () => {
    deps.compile();
  })
  .command('migrate', 'Migrate Secret Contracts and Smart Contracts', () => {}, () => {
    deps.compile();
    const baseFolder = deps.findBasePath();
    spawnProcess('./node_modules/truffle/build/cli.bundled.js', ['migrate', '--reset', '--network', 'development'], {cwd: baseFolder});
  })
  .command('pull', 'Pull the latest images for the containers in the network', () => {}, () => {
    pullImages(getHWMode(), argv.argv.y);
  })
  .command('start', 'Launch the Discovery Docker network', () => {}, () => {
    start();
  })
  .command('stop', 'Stop the network by stopping and removing all containers', () => {}, () => {
    stop();
  })
  .command('test', 'Test Secret Contracts and Smart Contracts', () => {}, () => {
    deps.compile();
    const baseFolder = deps.findBasePath();
    spawnProcess('./node_modules/truffle/build/cli.bundled.js', ['test', '--network', 'development'], {cwd: baseFolder});
  })
  .demandCommand(1)
  .argv
