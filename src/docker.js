const CLI = require('clui');
const {Docker} = require('node-docker-api');
const getCursorPosition = require('get-cursor-position');

const docker = new Docker({ socketPath: '/var/run/docker.sock' })

const promisifyStream = (stream) => new Promise((resolve, reject) => {
  stream.on('data', (d) => {
    // data comes in as a raw buffer, possibly containing multiple lines
    d.toString().split('\n').forEach(function (line) { 
      if(line.trim()){
        // disregard empty lines, otherwise JSON.parse throws an error
        const obj = JSON.parse(line);
        if(!(obj.id in strms)) {
          strms[obj.id]=obj;
          strms[obj.id].progress = new CLI.Progress(40);
        } else {
          var tmp = strms[obj.id].progress;
          strms[obj.id]=obj;
          strms[obj.id].progress = tmp;
        }
      }
      var outputBuffer = new CLI.LineBuffer({
        x: 0,
        y: pos,
        width: 'console',
        height: 'console'
      });
      for(var i in strms){
        if(strms[i].progressDetail && 'current' in strms[i].progressDetail){
          new CLI.Line(outputBuffer)
            .column(strms[i].id + ': ')
            .column(strms[i].status+' ')
            .column(strms[i].progress.update(strms[i].progressDetail.current,strms[i].progressDetail.total))
            .fill()
            .store()
        } else if (strms[i].id) {
          new CLI.Line(outputBuffer)
            .column(strms[i].id + ': ')
            .column(strms[i].status)
            .fill()
            .store();
        } else {
          new CLI.Line(outputBuffer)
            .column(strms[i].status)
            .fill()
            .store(); 
        }
      }
      outputBuffer.output();
      // Update starting position of buffer to account for scrolling
      pos = getCursorPosition.sync().row - Object.keys(strms).length - 1;
    })
  })
  stream.on('end', resolve)
  stream.on('error', reject)
})
 
var strms = {};
var pos = null;

module.exports.pullImage = async function(image, tag){
  strms = {};
  pos = getCursorPosition.sync().row;
  const ignoredResult = await docker.image.create({}, { fromImage: image, tag: tag })
    .then(stream => promisifyStream(stream))
    .then(() => {})
    .catch(error => console.log(error))
  console.log('');
}
