/**
 * =====================================================================
 * Software: WebKit - 808
 * Developer: Cameron J Roe
 * Version: 1.0
 * =====================================================================
 */

/* Variables */
window.onload = init;

var context;

var loopLength = 16;
var rhythmIndex = 0;
var minTempo = 50;
var maxTempo = 180;
var noteTime;
var lastDrawTime = -1;
var timeoutId;
var pitch = 1;
var sliderVal;
var kMaxSwing = .08;
var currentKit;
var rec;
var instruments = ['kick', 'snare', 'hihat', 'tom1', 'tom2', 'tom3'];

// Recorder Callback
function bounce(blob, name){
    name = name || "output";
    if (confirm("Are you sure you want to download " + name + ".wav ?")){
        Recorder.forceDownload(blob, name);
    }
}
// Recorder Config
var cfg = {
    workerPath : "Recorderjs/recorderWorker.js",
    callback : bounce
};

var beatReset = {
	"kitIndex":0,
	"effectIndex":0,
	"tempo":70,
	"swingFactor":0,
	"effectMix":0.25,
	"kickPitchVal":0.5,
	"snarePitchVal":0.5,
	"hihatPitchVal":0.5,
	"tom1PitchVal":0.5,
	"tom2PitchVal":0.5,
	"tom3PitchVal":0.5,
	"rhythm1":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	"rhythm2":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	"rhythm3":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	"rhythm4":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	"rhythm5":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	"rhythm6":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
};

function cloneBeat(source) {
    var beat = new Object();
    
    beat.kitIndex = source.kitIndex;
    beat.effectIndex = source.effectIndex;
    beat.tempo = source.tempo;
    beat.swingFactor = source.swingFactor;
    beat.effectMix = source.effectMix;
    beat.kickPitchVal = source.kickPitchVal;
    beat.snarePitchVal = source.snarePitchVal;
    beat.hihatPitchVal = source.hihatPitchVal;
    beat.tom1PitchVal = source.tom1PitchVal;
    beat.tom2PitchVal = source.tom2PitchVal;
    beat.tom3PitchVal = source.tom3PitchVal;
    beat.rhythm1 = source.rhythm1.slice(0);        // slice(0) is an easy way to copy the full array
    beat.rhythm2 = source.rhythm2.slice(0);
    beat.rhythm3 = source.rhythm3.slice(0);
    beat.rhythm4 = source.rhythm4.slice(0);
    beat.rhythm5 = source.rhythm5.slice(0);
    beat.rhythm6 = source.rhythm6.slice(0);
    
    return beat;
}

// theBeat is t3he object representing the current beat/groove
// ... it is saved/loaded via JSON
var theBeat = cloneBeat(beatReset);


function Kit(){

	this.kickBuffer = null;
	this.snareBuffer = null;
	this.hihatBuffer = null;
    this.tom1Buffer = null;
    this.tom2Buffer = null;
    this.tom3Buffer = null;

	this.startedLoading = false;
	this.isLoaded = false;
	this.isPlaying = false;

}

Kit.prototype.load = function(){
	if(this.startedLoading)
		return;
	this.startedLoading = true;

	var kick = "samples/909bd4.wav";
	var snare = "samples/909clap2.wav";
	var hihat = "samples/909ophat1.wav";
    var tom1 = "samples/TOM04L.wav";
    var tom2 = "samples/TOM04M.wav";
    var tom3 = "samples/TOM05H.wav";

    function delayLoad(){

    	this.loadSample(0, kick, false);
    	this.loadSample(1, snare, false);
    	this.loadSample(2, hihat, false);
        this.loadSample(3, tom1, false);
        this.loadSample(4, tom2, false);
        this.loadSample(5, tom3, false);
    }
    setTimeout(delayLoad, 2000);

}

Kit.prototype.loadSample = function(sampleID, url, mixToMono){
	// Load Asynchronously
	
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	var kit = this;
	request.onload = function(){
		context.decodeAudioData(request.response, function(decodedBuffer){
			switch(sampleID){
				case 0: kit.kickBuffer = decodedBuffer; break;
				case 1: kit.snareBuffer = decodedBuffer; break;
				case 2: kit.hihatBuffer = decodedBuffer; break;
                case 3: kit.tom1Buffer = decodedBuffer; break;
                case 4: kit.tom2Buffer = decodedBuffer; break;
                case 5: kit.tom3Buffer = decodedBuffer; break;
			}
		});
	};
	request.send();
}

function loadAssets(){

	var kit = new Kit();
	kit.load();

	kit.isLoaded = true;
	currentKit = kit;

}

function playSound(buffer, noteTime){

		// voice node
		var voice = context.createBufferSource();
		voice.buffer = buffer;
		voice.playbackRate.value = pitch;
		voice.gain.value = 1;
		
		// gain node
		var gain = context.createGainNode();
		gain.gain.value = 1;
		
		// connect
		voice.connect(gain);
        gain.connect(context.destination);

        
        // rec = new Recorder(buffer.inputBuffer, cfg);
        // rec.record();

		
        voice.start(noteTime);
        
}

function schedule() {
    var currentTime = context.currentTime;

    // The sequence starts at startTime, so normalize currentTime so that it's 0 at the start of the sequence.
    currentTime -= startTime;

    while (noteTime < currentTime + 0.200) {
        // Convert noteTime to context time.
        var contextPlayTime = noteTime + startTime;
        
        // Kick
        if (theBeat.rhythm1[rhythmIndex]) {
            playSound(currentKit.kickBuffer, contextPlayTime);
        }

        // Snare
        if (theBeat.rhythm2[rhythmIndex]) {
            playSound(currentKit.snareBuffer, contextPlayTime);
        }

        // Hihat
        if (theBeat.rhythm3[rhythmIndex]) {
            playSound(currentKit.hihatBuffer, contextPlayTime);
        }

        // Tom1    
        if (theBeat.rhythm4[rhythmIndex]) {
            playSound(currentKit.tom1Buffer, contextPlayTime);
        }
        // Tom2
        if (theBeat.rhythm5[rhythmIndex]) {
            playSound(currentKit.tom2Buffer, contextPlayTime);
        }
        // Tom3
        if (theBeat.rhythm6[rhythmIndex]) {
            playSound(currentKit.tom3Buffer, contextPlayTime);
        }

        
        // Attempt to synchronize drawing time with sound
        if (noteTime != lastDrawTime) {
            lastDrawTime = noteTime;
            drawPlayhead((rhythmIndex + 15) % 16);
        }

        advanceNote();
    }

    timeoutId = setTimeout(schedule, 0);
}

function handlePlay(){
    noteTime = 0;
	startTime = context.currentTime + 0.005;

    schedule();
    
    // remove play button and create stop button
    var stopButton = document.getElementById('play');
    stopButton.removeEventListener('click', handlePlay, false);
    stopButton.textContent = 'Stop';
    stopButton.id = 'stop';
    stopButton.classList.remove('success');
    stopButton.classList.add('alert');
    stopButton.classList.add('playing');

    stopButton.addEventListener('click', handleStop, false);
    stopButton.addEventListener('dblclick', resetBeat, true);
}

function handleStop(){
	clearTimeout(timeoutId);
    // stopRecording(rec);
       // rec.stop();
    // var name = prompt("Please give your sequence a name.", name);
    // rec.exportWAV(bounce);
    // rec.clear();
    rhythmIndex = 0;

    if(document.getElementById('stop')){

        var playButton = document.getElementById('stop');
        playButton.removeEventListener('click', handleStop, false);
        playButton.id = 'play';
        playButton.classList.remove('alert');
        playButton.textContent = 'Play';
        playButton.classList.add('success');
        playButton.classList.remove('playing');

        playButton.addEventListener('click', handlePlay, false);
    }
    drawPlayhead(rhythmIndex);
}

function init(){

	context = new webkitAudioContext();

	loadAssets();
	
	initControls();
	initButtons();

}

function initControls(){

    document.getElementById('play').addEventListener('click', handlePlay, false);
    document.getElementById('clear').addEventListener('click', resetBeat, false);

}

function initButtons() {        
    var elButton;
    var kNumInstruments = instruments.length;

    for (i = 0; i < loopLength; ++i) {
        for (j = 0; j < kNumInstruments; j++) {
                elButton = document.getElementById(instruments[j] + '_' + i);
            	elButton.addEventListener("mousedown", handleButtonMouseDown, true);
        }
    }
}

function handleButtonMouseDown(event) {
    var notes = theBeat.rhythm1;
    
    var instrumentIndex;
    var rhythmIndex;

    var elId = event.target.id;
    rhythmIndex = elId.substr(elId.indexOf('_') + 1, 2);
    instrumentIndex = instruments.indexOf(elId.substr(0, elId.indexOf('_')));
        
    switch (instrumentIndex) {
        case 0: notes = theBeat.rhythm1; break;
        case 1: notes = theBeat.rhythm2; break;
        case 2: notes = theBeat.rhythm3; break;
        case 3: notes = theBeat.rhythm4; break;
        case 4: notes = theBeat.rhythm5; break;
        case 5: notes = theBeat.rhythm6; break;
    }

    notes[rhythmIndex] = (notes[rhythmIndex] + 1) % 2;
    console.log(notes[rhythmIndex]);

    drawNote(notes[rhythmIndex], rhythmIndex, instrumentIndex);

    var note = notes[rhythmIndex];
    
    if (note) {
        switch(instrumentIndex) {
        case 0:  // Kick
            playSound(currentKit.kickBuffer);
            break;

        case 1:  // Snare
            playSound(currentKit.snareBuffer);
            break;

        case 2:  // Hihat
            // Pan the hihat according to sequence position.
            playSound(currentKit.hihatBuffer);
            break;

        case 3:  // Tom 1 
            playSound(currentKit.tom1Buffer);
            break;

        case 4:  // Tom 2   
            playSound(currentKit.tom2Buffer);
            break;

        case 5:  // Tom 3   
            playSound(currentKit.tom3Buffer);
            break;
        }
    }
}

function drawNote(drawValue, xindex, yindex) {    
    var elButton = document.getElementById(instruments[yindex] + '_' + xindex);

    switch (drawValue) {
        case 0: elButton.classList.remove('alert'); break;
        case 1: elButton.classList.add('alert'); break;
        // case 2: elButton.src = 'images/button_on.png'; break;
    }
}

function advanceNote() {
    // Advance time by a 16th note...
    var secondsPerBeat = 60.0 / theBeat.tempo;

    rhythmIndex++;
    if (rhythmIndex == loopLength) {
        rhythmIndex = 0;
    }

        // apply swing    
    if (rhythmIndex % 2) {
        noteTime += (0.25 + kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    } else {
        noteTime += (0.25 - kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    }
}

function resetBeat(){
	// var panel = document.getElementById("panel");
	// var p = panel.firstElementChild;
	// var spans = p.children;

	// for(var i = 0; i < spans.length; i++){

	// 	var span = spans[i].getElementById("label" + i);
	// 	span.classList.remove("alert");

	// }
    handleStop();
    loadBeat(beatReset);

	// drawPlayhead(0);
}
function drawPlayhead(xindex) {
    // create a percentage of the current xindex
    var percentage = (xindex * 100) / 15;

    // set the meter width to that percentage
    var meter = document.getElementById('transport-meter');
    meter.firstChild.style.width = percentage + '%';

}
function loadBeat(beat) {
    // Check that assets are loaded.
    if (beat != beatReset && !beat.isLoaded())
        return false;

    handleStop();

    theBeat = cloneBeat(beat);
    // currentKit = kits[theBeat.kitIndex];

    updateControls();
    return true;
}
function updateControls() {
    for (i = 0; i < loopLength; ++i) {
        for (j = 0; j < instruments.length; j++) {
            switch (j) {
                case 0: notes = theBeat.rhythm1; break;
                case 1: notes = theBeat.rhythm2; break;
                case 2: notes = theBeat.rhythm3; break;
                case 3: notes = theBeat.rhythm4; break;
                case 4: notes = theBeat.rhythm5; break;
                case 5: notes = theBeat.rhythm6; break;
            }

            drawNote(notes[i], i, j);
        }
    }
}

/**
 * =====================================================================
 * SoundCloud Support
 * Coming version 2.0
 * =====================================================================
 */
// jQuery(document).ready(function($){

// 	$('#controls').after("<p id='soundcloud'><a href='#' id='connectsc'><img src='images/sc-connect.png'></a></p>");

// });
// initialize client with app credentials
// SC.initialize({
//   client_id: 'cdc8d87ca27261f0d86740318773f5a3',
//   redirect_uri: 'http://localhost:8888/drum_machine/index_foundation.html'
// });
// initButtons(){
// 	document.getElementById("connectsc").addEventListener('click', connectSC, true);
// }
// function User(){
	
// 	this.name = null,
// 	this.tracks = null
// 	this.isLoggedIn = false;

// }

// function checkSC(){
	  	
// 	  	// var username = document.createElement('h4');
// 	  	// username.innerHTML = user.name;

// 	  	// var link = document.getElementById("connectsc");
	  	
// 	  	// link.removeEventListener('click', connectSC, true);
// 	  	// link.addEventListener('click', disconnectSC, true);
// 	  	// link.firstChild.setAttribute("src", "images/sc-disconnect.png");
// 	  	// document.getElementById('soundcloud').insertBefore(username, link);

// }
// function connectSC(){

// 	// initiate auth popup
// 	SC.connect(function() {
// 	  SC.get('/me', function(me) {
// 	  	user = new User();
// 	  	user.name = me.username;
// 	  	user.tracks = me.permalink_url;
// 	  	user.isLoggedIn = true;
// 	  });
// 	});

// }
// function disconnectSC(event){
// 	var link = event.target;

// 	link.parentElement.removeChild(link.firstChild);
// 	link[1].setAttribute("src", "images/sc-connect.png");

// }