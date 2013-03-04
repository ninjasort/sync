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
var kMaxSwing = 0.08;
var currentKit;
var rec;
var instruments = ['kick', 'snare', 'hihat', 'tom1', 'tom2', 'tom3'];

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

var funkyHouse = {
    "kitIndex":0,
    "effectIndex":0,
    "tempo":126,
    "swingFactor":0.5,
    "effectMix":0.25,
    "kickPitchVal":0.5,
    "snarePitchVal":0.5,
    "hihatPitchVal":0.5,
    "tom1PitchVal":0.5,
    "tom2PitchVal":0.5,
    "tom3PitchVal":0.5,
    "rhythm1":[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    "rhythm2":[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    "rhythm3":[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
    "rhythm4":[0,0,0,1,0,0,1,0,0,0,0,0,0,0,1,0],
    "rhythm5":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    "rhythm6":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
};

var hiphop = {
    "kitIndex":0,
    "effectIndex":0,
    "tempo":83,
    "swingFactor":0,
    "effectMix":0.25,
    "kickPitchVal":0.5,
    "snarePitchVal":0.5,
    "hihatPitchVal":0.5,
    "tom1PitchVal":0.5,
    "tom2PitchVal":0.5,
    "tom3PitchVal":0.5,
    "rhythm1":[1,0,0,1,0,0,1,0,1,0,0,0,0,0,0,0],
    "rhythm2":[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    "rhythm3":[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "rhythm4":[0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0],
    "rhythm5":[0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
    "rhythm6":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
};

var dubstep = {
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
    "rhythm1":[1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    "rhythm2":[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    "rhythm3":[1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    "rhythm4":[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    "rhythm5":[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "rhythm6":[0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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

function clearBeat(ins){


    if(ins === 0){
        theBeat.rhythm1 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    }else if(ins === 1){
        theBeat.rhythm2 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    }else if(ins === 2){
        theBeat.rhythm3 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    }else if(ins === 3){
        theBeat.rhythm4 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    }else if(ins === 4){
        theBeat.rhythm5 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    }else if(ins === 5){
        theBeat.rhythm6 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    }
    for(i=0; i < loopLength; i++){
        drawNote(0, i, ins);   
    }
}

// theBeat is t3he object representing the current beat/groove
// ... it is saved/loaded via JSON
var theBeat = cloneBeat(beatReset);

function funkyDemo(){
    loadBeat(funkyHouse);
    var kit = new Kit();
    kit.load();
    currentKit = kit;
    $('.pitch').val(1).trigger('change');
    $('.tempo').val(126).trigger('change');
    $('.swing').val(5).trigger('change');
    console.log("funky");
}

function hiphopDemo(){
    loadBeat(hiphop);
    var kit = new Kit();
    kit.load('hiphop');
    currentKit = kit;
    $('.pitch').val(1).trigger('change');
    $('.tempo').val(83).trigger('change');
    $('.swing').val(5).trigger('change');
    console.log("hiphop");
}

function dubstepDemo(){
    loadBeat(dubstep);
    var kit = new Kit();
    kit.load('dubstep');
    currentKit = kit;
    console.log("dubbb");
}

function Kit(){

	this.kickBuffer = null;
	this.snareBuffer = null;
	this.hihatBuffer = null;
    this.tom1Buffer = null;
    this.tom2Buffer = null;
    this.tom3Buffer = null;

    this.kickMuted = false;
    this.snareMuted = false;
    this.hihatMuted = false;
    this.tom1Muted = false;
    this.tom2Muted = false;
    this.tom3Muted = false;

	this.startedLoading = false;
	this.isLoaded = false;
	this.isPlaying = false;

}

Kit.prototype.load = function(kitPreset){
	if(this.startedLoading)
		return;
	this.startedLoading = true;

    if(kitPreset === 'dubstep'){
        var kick = "samples/dubstepKick.wav";
        var snare = "samples/dubstepClap.wav";
        var hihat = "samples/dubstepHH.wav";
        var tom1 = "samples/dubstepReverse.wav";
        var tom2 = "samples/dubstepTom1.wav";
        var tom3 = "samples/dubstepTom2.wav";   
    }else if(kitPreset === 'hiphop'){
        var kick = "samples/hiphopKick.wav";
        var snare = "samples/hiphopSnare.wav";
        var hihat = "samples/hiphopHH.wav";
        var tom1 = "samples/hiphopTom.wav";
        var tom2 = "samples/hiphopTom1.wav";
        var tom3 = "samples/hiphopTom2.wav";
    }else{
        var kick = "samples/909bd4.wav";
        var snare = "samples/909clap2.wav";
        var hihat = "samples/909ophat1.WAV";
        var tom1 = "samples/TOM04L.WAV";
        var tom2 = "samples/TOM04M.WAV";
        var tom3 = "samples/TOM05H.WAV";
    }

	this.loadSample(0, kick, false);
	this.loadSample(1, snare, false);
	this.loadSample(2, hihat, false);
    this.loadSample(3, tom1, false);
    this.loadSample(4, tom2, false);
    this.loadSample(5, tom3, false);

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
        if (theBeat.rhythm1[rhythmIndex] && currentKit.kickMuted === false) {
            playSound(currentKit.kickBuffer, contextPlayTime);
        }

        // Snare
        if (theBeat.rhythm2[rhythmIndex] && currentKit.snareMuted === false) {
            playSound(currentKit.snareBuffer, contextPlayTime);
        }

        // Hihat
        if (theBeat.rhythm3[rhythmIndex] && currentKit.hihatMuted === false) {
            playSound(currentKit.hihatBuffer, contextPlayTime);
        }

        // Tom1    
        if (theBeat.rhythm4[rhythmIndex] && currentKit.tom1Muted === false) {
            playSound(currentKit.tom1Buffer, contextPlayTime);
        }
        // Tom2
        if (theBeat.rhythm5[rhythmIndex] && currentKit.tom2Muted === false) {
            playSound(currentKit.tom2Buffer, contextPlayTime);
        }
        // Tom3
        if (theBeat.rhythm6[rhythmIndex] && currentKit.tom3Muted === false) {
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
    currentKit.isPlaying = true;
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
    currentKit.isPlaying = false;
	clearTimeout(timeoutId);

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

/* Mutes buttons */

function toggleMute(e){
    e.preventDefault();
    
    var thisMute = e.target.parentNode;
    thisMute.classList.toggle('active');
    var instIndex;
    var beatIndex;

    function paintBtns(instIndex, mute){
        for(i = 0; i < loopLength; i++){
            if(beatIndex[i] === 1 && mute){
                drawNote(2, i, instIndex);
            }else{
                drawNote(beatIndex[i], i, instIndex);
            }
        }
    }
    if(thisMute.classList.contains('active')){
        console.log("Muted");
        switch(thisMute.id){
            case 'kick_mute': currentKit.kickMuted = true; beatIndex = theBeat.rhythm1; instIndex = 0; break;
            case 'snare_mute': currentKit.snareMuted = true; beatIndex = theBeat.rhythm2; instIndex = 1; break;
            case 'hihat_mute': currentKit.hihatMuted = true; beatIndex = theBeat.rhythm3; instIndex = 2; break;
            case 'tom1_mute': currentKit.tom1Muted = true; beatIndex = theBeat.rhythm4; instIndex = 3; break;
            case 'tom2_mute': currentKit.tom2Muted = true; beatIndex = theBeat.rhythm5; instIndex = 4; break;
            case 'tom3_mute': currentKit.tom3Muted = true; beatIndex = theBeat.rhythm6; instIndex = 5; break;
        }
        paintBtns(instIndex, true);
    }else{
        console.log("Unmuted");
        switch(thisMute.id){
            case 'kick_mute': currentKit.kickMuted = false; beatIndex = theBeat.rhythm1; instIndex = 0; break;
            case 'snare_mute': currentKit.snareMuted = false; beatIndex = theBeat.rhythm2; instIndex = 1; break;
            case 'hihat_mute': currentKit.hihatMuted = false; beatIndex = theBeat.rhythm3; instIndex = 2; break;
            case 'tom1_mute': currentKit.tom1Muted = false; beatIndex = theBeat.rhythm4; instIndex = 3; break;
            case 'tom2_mute': currentKit.tom2Muted = false; beatIndex = theBeat.rhythm5; instIndex = 4; break;
            case 'tom3_mute': currentKit.tom3Muted = false; beatIndex = theBeat.rhythm6; instIndex = 5; break;
        }
        paintBtns(instIndex, false);
    }
}

function handleClear(e){
    e.preventDefault();

    var thisClear = e.target.parentNode;
    var clear = thisClear.id;
    var j;
    switch(clear){
        case 'kick_clear': j=0; break;
        case 'snare_clear': j=1; break;
        case 'hihat_clear': j=2; break;
        case 'tom1_clear': j=3; break;
        case 'tom2_clear': j=4; break;
        case 'tom3_clear': j=5; break;
    }
    
    clearBeat(j);

}

/* Start the engine! */

function init(){

	context = new webkitAudioContext();

	loadAssets();
	
	initControls();
	initButtons();

}

function onKeyDown(e){
    if(e.keyCode === 32){
        if(currentKit.isPlaying){
            handleStop();
        }else{
            handlePlay();
        }
    }else if(e.keyCode === 67){
        resetBeat();
    }
}

function initControls(){

    window.addEventListener("keydown", onKeyDown);
    document.getElementById('play').addEventListener('click', handlePlay, false);
    document.getElementById('clear').addEventListener('click', resetBeat, false);
    document.getElementById('funky_house').addEventListener('click', funkyDemo, false);
    document.getElementById('hiphop').addEventListener('click', hiphopDemo, false);
    document.getElementById('dubstep').addEventListener('click', dubstepDemo, false);
}

function initButtons() {        
    var elButton;
    var elMute;
    var kNumInstruments = instruments.length;

    for (i = 0; i < loopLength; ++i) {
        for (j = 0; j < kNumInstruments; j++) {
                elButton = document.getElementById(instruments[j] + '_' + i);
            	elButton.addEventListener("mousedown", handleButtonMouseDown, true);
        }
    }
    for(i=0; i < kNumInstruments; i++){
        elMute = document.getElementById(instruments[i] + '_mute');
        elMute.querySelector('a').addEventListener("mousedown", toggleMute, true);
    }
    for(i=0; i < kNumInstruments; i++){
        elMute = document.getElementById(instruments[i] + '_clear');
        elMute.querySelector('a').addEventListener("mousedown", handleClear, true);
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
    var buttonMuted = elButton.classList.contains('muted');
    switch (drawValue) {
        case 0: elButton.classList.remove('alert'); buttonMuted ? elButton.classList.remove('muted') : null; break;
        case 1: elButton.classList.add('alert'); buttonMuted ? elButton.classList.remove('muted') : null; break;
        case 2: elButton.classList.remove('alert'); elButton.classList.add('muted'); break;
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
    handleStop();
    loadBeat(beatReset);
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