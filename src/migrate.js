const path = require('path');
const Web3 = require('web3');
const truffleMigrate = require('truffle-migrate');
const TruffleConfig = require("truffle-config");
const Resolver = require("truffle-resolver");
const Artifactor = require("truffle-artifactor");
const deps = require('./deps');
const constants = require('./constants');


module.exports.migrate = async function() {

  const baseFolder = deps.findBasePath();
  const folderSmartContracts = path.join(baseFolder, constants.FOLDER.BUILD, constants.FOLDER.SMART_CONTRACTS);

  const network = 'development';
  const config = TruffleConfig.detect({network: network});
  config.contracts_build_directory = folderSmartContracts;
  const provider = new Web3.providers.HttpProvider('http://localhost:9545');
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

  await truffleMigrate.run(config);
}
