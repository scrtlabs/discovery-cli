function validateYN(value) {
  var pass = value.match(/^(y|Y|n|N|)$/);
  if (pass) {
    return true;
  }
  return 'Please enter "y" or "n"';
}

module.exports.start = [
  {
    type: 'input',
    name: 'start',
    message: 'Set up the Discovery Enigma Protocol development environment in the current folder? (Y/n)',
    validate: validateYN
  }
];

module.exports.mode = [
 {
    type: 'input',
    name: 'mode',
    message: 'Running in SGX Hardware (HW) or Software (SW) mode? (HW/sw)',
    validate: function(value) {
      var pass = value.match(/^(sw|SW|HW|hw)$/);
      if (pass) {
        return true;
      }
      return 'Please enter "hw" or "sw"';
    }
  }
];

module.exports.size = [
  {
    type: 'input',
    name: 'size',
    message: 'About to pull Docker images. This requires 15 GB of space. Continue? (Y/n)',
    validate: validateYN
  }  
]
