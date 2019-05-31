const hasbin = require('hasbin');
const constants = require('./constants');

module.exports.checkDependencies = function() {
  const deps = constants.DEPENDENCIES;
  for(i in deps){
    process.stdout.write(`Checking if "${deps[i]}" is installed in the system... `);
    if(hasbin.sync(deps[i])){
      process.stdout.write(`FOUND\n`);
    } else {
      process.stdout.write(`MISSING\n`);
      console.log(`Dependency "${deps[i]}" cannot be found: aborting...`);
      process.exit();
    }
  }
}
