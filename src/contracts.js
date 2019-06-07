const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const truffleMigrate = require('truffle-migrate');
const truffleTest = require('truffle-core').test;
const TruffleConfig = require("truffle-config");
const Resolver = require("truffle-resolver");
const Artifactor = require("truffle-artifactor");
const deps = require('./deps');
const constants = require('./constants');

async function prepTruffle(){
  const baseFolder = deps.findBasePath();
  const network = 'development';
  const config = TruffleConfig.detect({network: network});
  config.contracts_build_directory = path.join(baseFolder, constants.FOLDER.BUILD, constants.FOLDER.SMART_CONTRACTS);
  config.contracts_directory = path.join(baseFolder, constants.FOLDER.SMART_CONTRACTS);
  config.test_files = fs.readdirSync(path.join(baseFolder, constants.FOLDER.TEST))
    .filter(f => /\.js$/.test(f))
    .map(f => path.join(baseFolder, constants.FOLDER.TEST, f));
  const provider = new Web3.providers.HttpProvider(`http://${config.networks[network].host}:${config.networks[network].port}`);
  const web3 = new Web3(provider);
  await web3.eth.getAccounts().then(accs => {
    return web3.eth.net.getId().then(network_id => {
      config.networks[network] = {
        provider: provider,
        network_id: network_id + "",
        from: accs[0]
      };
    });
  });
  config.resolver = new Resolver(config);
  config.artifactor = new Artifactor(config.contracts_build_directory);

  config.reset = true;
  return config;
}

module.exports.migrate = async function() {
  const config = await prepTruffle();
  truffleMigrate.run(config);
}

module.exports.test = async function() {
  const config = await prepTruffle();
  truffleTest.run(config, ()=>{});
}
