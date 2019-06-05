const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const dotenv = require('dotenv');
const {Enigma, utils, eeConstants} = require('enigma-js/node');
const deps = require('./deps');
const constants = require('./constants');


var accounts;
var web3;
var enigma;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(require.resolve(path)));
}

async function deployOneSecretContract(contract, folder){

  console.log(`Deploying Secret Contract "${contract}"...`);
  var scTask;

  // Deploy Contract
  const scTaskFn = 'construct()';
  const scTaskArgs = '';
  const scTaskGasLimit = 100000;
  const scTaskGasPx = utils.toGrains(1);
  var preCode;
  try {
    preCode = fs.readFileSync(path.join(folder, contract));
    preCode = preCode.toString('hex');
  } catch(e) {
    console.log('Error:', e.stack);
  }

  scTask = await new Promise((resolve, reject) => {
    enigma.deploySecretContract(scTaskFn, scTaskArgs, scTaskGasLimit, scTaskGasPx, accounts[0], preCode)
      .on(eeConstants.DEPLOY_SECRET_CONTRACT_RESULT, (receipt) => resolve(receipt))
      .on(eeConstants.ERROR, (error) => reject(error));
  });

  // Wait for the confirmed deploy contract task
  do {
    await sleep(1000);
    scTask = await enigma.getTaskRecordStatus(scTask);
    process.stdout.write('Waiting. Current Task Status is '+scTask.ethStatus+'\r');
  } while (scTask.ethStatus != 2);
  process.stdout.write('Completed. Final Task Status is '+scTask.ethStatus+'\n');

  // Verify deployed contract
  var result = await enigma.admin.isDeployed(scTask.scAddr);
  if(result) {
    return scTask.scAddr;
  } else {
    console.log('Something went wrong deploying Secret Contract "${contract}", aborting');
    process.exit();
  }
}

module.exports.migrate = function() {
  const baseFolder = deps.findBasePath();
  const folderSecretContracts = path.join(baseFolder, constants.FOLDER.BUILD, constants.FOLDER.SECRET_CONTRACTS);
  const folderSmartContracts = path.join(baseFolder, constants.FOLDER.BUILD, constants.FOLDER.SMART_CONTRACTS);
  dotenv.config({ path: path.join(baseFolder, constants.FILE.ENV)});
  const provider = new Web3.providers.HttpProvider('http://localhost:9545');
  web3 = new Web3(provider);
  var EnigmaContract;
  if(typeof process.env.SGX_MODE === 'undefined' || (process.env.SGX_MODE != 'SW' && process.env.SGX_MODE != 'HW' )) {
    console.log(`Error reading "constants.FILE.ENV" file, aborting....`);
    process.exit();
  } else if (process.env.SGX_MODE == 'SW') {
    EnigmaContract = readJson(path.join(folderSmartContracts, constants.CONTRACT.ENIGMA_SIMULATION));
  } else {
    EnigmaContract = readJson(path.join(folderSmartContracts, constants.CONTRACT.ENIGMA));
  }
  const EnigmaTokenContract = readJson(path.join(folderSmartContracts, constants.CONTRACT.ENIGMA_TOKEN));
  web3.eth.getAccounts().then(async(result) => {
    accounts = result;
    enigma = new Enigma(
      web3,
      EnigmaContract.networks['4447'].address,
      EnigmaTokenContract.networks['4447'].address,
      'http://localhost:3346',
      {
        gas: 4712388,
        gasPrice: 100000000000,
        from: accounts[0],
      },
    );
    enigma.admin();
    const secretContracts = fs.readdirSync(folderSecretContracts).filter(f => /\.wasm$/.test(f));
    for(let i in secretContracts){
      let address = await deployOneSecretContract(secretContracts[i], folderSecretContracts);
      console.log(`Secret Contract "${secretContracts[i]}" deployed at address: ${address}`)
    }    
  });
}
