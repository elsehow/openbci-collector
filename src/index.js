var EventEmitter = require('events').EventEmitter
var OpenBCIBoard = require('openbci').OpenBCIBoard
// opts is
//   {
//     debug (boolean)
//     chanelVolts (boolean)
//     simulate (boolean)
// }
// returns an emitter
// emitter will emit
//   - 'sample' (with an array of volts)
//   - 'error'
function openBCI (opts) {
  var emitter = new EventEmitter()
  var ourBoard = new OpenBCIBoard({
    simulate: opts.simulate,
  })
  ourBoard
    .autoFindOpenBCIBoard()
    .then(function(portName) {
      if (!portName && !opts.simulate) {
        emitter.emit('error', 'No port found!')
        return
      }
      if (opts.debug) console.log('found', portName)
      ourBoard.connect(portName)
      ourBoard.on('ready',function() {
        if (opts.debug) console.log('connected, ready')
        ourBoard.streamStart()
        ourBoard.on('sample',function(sample) {
          // makes 'sample' event emit
          // an array of volts indexed by channel
          if (opts.channelVolts)
            sample = sample.channelData.map(x => x.toFixed(8))
          if (opts.debug)
            console.log('volts (index is channel)', sample)
          emitter.emit('sample', sample)
        })
      })
    }).catch(err => emitter.emit("error", err))

      return emitter
}

module.exports = openBCI
