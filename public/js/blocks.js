(function(window, undefined){

'use strict';

// Constructor
var BLOCKS = function(){

  this.rhythm = {};

  this.instruments = [
    {
      name: 'kick',
      path: 'samples/808kick.WAV',
      buffer: null
    },
    {
      name: 'clap',
      path: 'samples/808clap.WAV',
      buffer: null
    },
    {
      name: 'hihat',
      path: 'samples/808hihat.WAV',
      buffer: null
    },
    {
      name: 'tom1',
      path: 'samples/808tom1.WAV',
      buffer: null
    },
    {
      name: 'tom2',
      path: 'samples/808tom2.WAV',
      buffer: null
    },
    {
      name: 'tom3',
      path: 'samples/808tom3.WAV',
      buffer: null
    }
  ];

  this.effect = null;

  this.buffer = {};

  this.muted = false;
  this.startedLoading = false;
  this.isLoaded = false;
  this.isRecording = false;
  this.isPlaying = false;

  this.filterOn = false;

  this.pitch = null;
  this.filterVal = null;

  this.init();
  this.loadSamples();

};

BLOCKS.prototype.init = function(){

  var ac = window.AudioContext || window.webkitAudioContext || null;
  var hasSupport = ac;
  
  if(!hasSupport){
    throw new Error("Your browser doesn't support web audio");
  }

  this.audioContext = new ac();

};

BLOCKS.prototype.ajax = function(options){

  var buffer;

  if(!options){
    return;
  }

  var req = new XMLHttpRequest();
  
  req.onreadystatechange = function(){

    if(req.readyState < 4){
      return;
    }

    if(req.status !== 200){
      return;
    }

  };

  req.open('GET', options.url, true);
  req.responseType = 'arraybuffer';
  req.send();

};

BLOCKS.prototype.loadSamples = function(){

  if(this.startedLoading)
    return false;

  this.startedLoading = true;

  for(var i = 0; i < this.instruments.length; i++){
    
    var sample = this.instruments[i];
    
    this.ajax({
      name: sample.name,
      url: sample.path,
      success: (function(res){
        // this.audioContext.decodeAudioData(res, function(decodedBuffer){
        //   sample.buffer = decodedBuffer;
        // });
      }).bind(this)
    });

    console.log(sample);

  }

  // this.startedLoading = false;

};


// load the rhythms from a beat object
BLOCKS.prototype.initBlock = function(beat) {

    // Check that assets are loaded.
    handleStop();
    this.theBeat = cloneBeat(beat);
    updateControls();
    return true;
};

window.BLOCKS = BLOCKS;

})(window);