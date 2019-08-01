const fs = require('fs');
const path = require('path');
const hasbin = require('hasbin');
const constants = require('./constants');
const childProcess = require('child_process');
const truffleCompile = require("truffle-workflow-compile");

async function execBinary(command, args, options) {
  return new Promise((resolve, reject) => {
    const cwd = options.cwd || null;
    const env = options.env || null;

    const childProc = childProcess.spawn(command, args, { cwd, env });

    childProc.on('error', err => {
      reject(err);
    });

    const result = {
      exitCode: null,
      err: '',
      out: ''
    };

    childProc.stdout.on('data', chunk => {
      result.out += chunk.toString();
    });

    childProc.stderr.on('data', chunk => {
      result.err += chunk.toString();
    });

    childProc.on('exit', exitCode => {
      result.exitCode = exitCode;
      resolve(result);
    });

    if (options.log) {
      childProc.stdout.pipe(process.stdout);
      childProc.stderr.pipe(process.stderr);
    }
  });
}

function execBinarySync(command, args, options) {
  const childProc = childProcess.spawnSync(command, args, options);
  return childProc.stdout.toString();
}

async function installRustTarget() {
  var output = execBinarySync('rustup', ['show']);
  if (!output.match(constants.RUST_NIGHTLY)) {
    console.log(`Installing Rust ${constants.RUST_NIGHTLY}...`);
    var result = await execBinary('rustup', ['toolchain', 'install', constants.RUST_NIGHTLY], {log: true});
    if(result.exitCode){
      console.log(`Something went wrong installing Rust ${constants.RUST_NIGHTLY}, aborting.`)
      console.log(result.err)
      process.exit();
    }
  } else {
    console.log(`Checking if Rust "${constants.RUST_NIGHTLY}" is installed in the system... FOUND`);
  }

  console.log('Checking for Rust wasm32-unknown-unknown...');
  result = await execBinary('rustup', ['target', 'add', 'wasm32-unknown-unknown', '--toolchain', constants.RUST_NIGHTLY], {log: true});
  if(result.exitCode){
    console.log('Something went wrong installing wasm32-unknown-unknown, aborting.')
    console.log(result.err)
    process.exit();
  }
}

module.exports.findBasePath = function(){
  var folderFound = null;
  var folder = process.cwd();
  // Make a reasonable guess of where in the folder structure we are in
  const folderDepth = folder.split(path.sep).length;
  for (var i=0; i < folderDepth; i++) {
    if(i){
      folder = path.join(folder, '..');
    }
    var match = fs.readdirSync(folder).filter(f => /^docker-compose\.yml$/.test(f));
    if (match.length) {
      folderFound = path.normalize(folder);
      break;
    }
  }
  if (folderFound &&
      fs.readdirSync(folderFound).filter(f => /^build$/.test(f)).length &&
      fs.readdirSync(folderFound).filter(f => /^secret_contracts$/.test(f)).length) {
    return folderFound;
  } else {
    console.log('Cannot find the expected directory structure.');
    process.exit();
  }
}

module.exports.checkDependencies = async function() {
  const deps = constants.DEPENDENCIES;
  for(var i in deps){
    process.stdout.write(`Checking if "${deps[i]}" is installed in the system... `);
    if(hasbin.sync(deps[i])){
      process.stdout.write(`FOUND\n`);
    } else {
      process.stdout.write(`MISSING\n`);
      console.log(`Dependency "${deps[i]}" cannot be found: aborting...`);
      process.exit();
    }
  }
  await installRustTarget();
}

module.exports.compile = async function() {
  const baseFolder = module.exports.findBasePath();
  const truffleConfig = {
    contracts_directory: path.join(baseFolder, constants.FOLDER.SMART_CONTRACTS),
    contracts_build_directory: path.join(baseFolder, constants.FOLDER.BUILD, constants.FOLDER.SMART_CONTRACTS)
  };
  process.stdout.write('Smart Contracts:');
  await truffleCompile.compile(truffleConfig)

  const folderSC = path.join(baseFolder, constants.FOLDER.SECRET_CONTRACTS);
  const secretContracts = fs.readdirSync(folderSC, {withFileTypes: true}).filter(f => f.isDirectory()).map(f => f.name);
  const buildFolderSC = path.join(baseFolder, constants.FOLDER.BUILD, constants.FOLDER.SECRET_CONTRACTS);

  if (!fs.existsSync(path.join(baseFolder, constants.FOLDER.BUILD))) {
    fs.mkdirSync(path.join(baseFolder, constants.FOLDER.BUILD));
  }
  if (!fs.existsSync(buildFolderSC)){
    fs.mkdirSync(buildFolderSC);
  }
  for(let i in secretContracts) {
    console.log(`Compiling Secret Contract "${secretContracts[i]}"...`)
    let result = await execBinary('cargo', [`+${constants.RUST_NIGHTLY}`, 'build', '--release', '--target', 'wasm32-unknown-unknown'],
      {cwd: path.join(folderSC, secretContracts[i]), log: true});
    if(result.exitCode){
      console.log(`Something went wrong compiling secret contract ${secretContracts[i]}, aborting.`)
    }
    fs.copyFileSync(path.join(folderSC, secretContracts[i], constants.FOLDER.CONTRACT_PATH, 'contract.wasm'),
      path.join(buildFolderSC, `${secretContracts[i]}.wasm`))
  }
}
