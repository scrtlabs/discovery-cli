const hasbin = require('hasbin');
const constants = require('./constants');
const childProcess = require('child_process');

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
  const output = execBinarySync('rustup', ['target', 'list']);
  if (!output.match('wasm32-unknown-unknown')) {
    console.log('Updating Rust...');
    var result = await execBinary('rustup', ['update'], {log: true});
    if(result.exitCode){
      console.log('Something went wrong updating Rust, aborting.')
      console.log(result.err)
      process.exit();
    }
    console.log('Installing Rust wasm32-unknown-unknown...');
    result = await execBinary('rustup', ['target', 'add', 'wasm32-unknown-unknown', '--toolchain', 'nightly'], {log: true});
    if(result.exitCode){
      console.log('Something went wrong installing wasm32-unknown-unknown, aborting.')
      console.log(result.err)
      process.exit();
    }
    console.log('Done.');
  } else {
    console.log('Checking if "wasm32-unknown-unknown" is installed in the system... FOUND');
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
