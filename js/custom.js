// =====================================================================
// WebKit - 808
// Cameron J Roe
// Version: 1.0
// Credits to Chris Wilson for Inspiration and Code snippets
// =====================================================================
$(function(){

"use strict";

// =====================================================================
// Drum Machine
// =====================================================================

// Globals
var context = null;
var loopLength = 16;
var rhythmIndex = 0;
var minTempo = 50;
var maxTempo = 180;
var noteTime;
var startTime;
var lastDrawTime = -1;
var timeoutId;
var sliderVal = null;
var kMaxSwing = 0.08;
var rec = null;
var currentKit = {};

var instruments = ['kick', 'snare', 'hihat', 'tom1', 'tom2', 'tom3'];
var beatReset = {
    "kitIndex":0,
    "effectIndex":0,
    "tempo":100,
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

// =====================================================
// Kit
// ======================================================

// constructor
function Kit(){


    this.theBeat = {};

    this.kickPath = null;
    this.snarePath = null;
    this.hihatPath = null;
    this.tom1Path = null;
    this.tom2Path = null;
    this.tom3Path = null;

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
    this.isRecording = false;
    this.isPlaying = false;

    this.pitch = 1;
    this.filterVal = 40;
    this.filterOn = false;

}
// setup samples and load them
Kit.prototype.load = function(kitPreset){
    if(this.startedLoading){
        return false;
    }
    this.startedLoading = true;

    switch(kitPreset){
        case 'dubstep':
            this.kickPath = "samples/dubstepKick.wav";
            this.snarePath = "samples/dubstepClap.wav";
            this.hihatPath = "samples/dubstepHH.wav";
            this.tom1Path = "samples/dubstepTom.wav";
            this.tom2Path = "samples/dubstepTom1.wav";
            this.tom3Path = "samples/dubstepReverse.wav";
            break;
        case 'hiphop':
            this.kickPath = "samples/hiphopKick.wav";
            this.snarePath = "samples/hiphopSnare.wav";
            this.hihatPath = "samples/hiphopHH.wav";
            this.tom1Path = "samples/hiphopTom.wav";
            this.tom2Path = "samples/hiphopTom1.wav";
            this.tom3Path = "samples/hiphopTom2.wav";
            break;
        case 'funkyHouse':
            this.kickPath = "samples/909bd4.wav";
            this.snarePath = "samples/909clap2.wav";
            this.hihatPath = "samples/909ophat1.WAV";
            this.tom1Path = "samples/TOM04L.WAV";
            this.tom2Path = "samples/TOM04M.WAV";
            this.tom3Path = "samples/TOM05H.WAV";
            break;
        default:
            this.kickPath = "samples/808kick.WAV";
            this.snarePath = "samples/808clap.WAV";
            this.hihatPath = "samples/808hihat.WAV";
            this.tom1Path = "samples/808tom1.WAV";
            this.tom2Path = "samples/808tom2.WAV";
            this.tom3Path = "samples/808tom3.WAV";
    }

    this.loadSample(0, this.kickPath, false);
    this.loadSample(1, this.snarePath, false);
    this.loadSample(2, this.hihatPath, false);
    this.loadSample(3, this.tom1Path, false);
    this.loadSample(4, this.tom2Path, false);
    this.loadSample(5, this.tom3Path, false);

    this.startedLoading = false;
}
// helper XHR to load the samples into buffers
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
// load the rhythms from a beat object
Kit.prototype.loadBeat = function(beat) {

    // Check that assets are loaded.
    handleStop();
    this.theBeat = cloneBeat(beat);
    updateControls();
    return true;
}

// ==============================================================
// Init
// ==============================================================
window.onload = init;

function init(){

    // create a new context
    context = new webkitAudioContext();

    // initialize our controls and buttons
    initControls();
    initButtons();
    
    // create a fresh instance of our kit
    var kit = new Kit();
    kit.load();
    kit.isLoaded = true;
    // set the global currentKit to our instance (There should alway be one of these)
    currentKit = kit;
    // load up a fresh copy of our beat values
    currentKit.loadBeat(beatReset);
}

function initControls(){

    // add eventListeners on the various HTML elements
    window.addEventListener("keydown", function(e){
        if(e.keyCode === 32){
            if(currentKit.isPlaying){
                handleStop();
            }else{
                handlePlay();
            }
        }else if(e.keyCode === 67){
            handleReset();
        }
    });
    // play button
    $('#play').click(function(){ 
        handlePlay();
    });
    // clear button
    $('#clear').click(function(){ 
        handleReset();
    });

    $('#full-screen').click(function(){
        $('#get-started').toggle();
        $('#drum-machine').toggleClass('eight').toggleClass('twelve').toggleClass('full-screen-mode');
        $('#panel span').toggleClass('small').toggleClass('large');
        $('.filter').prev().toggle();
        // $('.filter').toggle();
        $('#filterButton').toggle();
    });
    // demos in dropdown
    for ( var demo in jsonData ){
        $("#" + demo).bind('click', function(e){
            handleLoadDemo(e.target.id);
        });
    }
    // hide the filter button
    $('.filter').prev().hide();
    $('.filter').hide();
    $('#filterButton').hide();
    $('#filterButton').click(function(){
        $('#filterButton').toggleClass("secondary").toggleClass("success");
        if(currentKit.filterOn){
            currentKit.filterOn = false;
        }else{
            currentKit.filterOn = true;
        }
    });
}

function initButtons() {        
    var elButton, elMute;

    // add handleButtonsMouseDown eventListener to the blue step buttons
    for (var i = 0; i < loopLength; ++i) {
        for (var j = 0; j < instruments.length; j++) {
            elButton = document.getElementById(instruments[j] + '_' + i);
            elButton.addEventListener("mousedown", handleButtonMouseDown, true);
        }
    }
    // add toggleMute eventListener to the mute buttons
    for(var i = 0; i < instruments.length; i++){
        elMute = document.getElementById(instruments[i] + '_mute');
        elMute.querySelector('a').addEventListener("mousedown", handleMute, true);
    }
    // add handleClear eventListener to the x buttons
    for(var i = 0; i < instruments.length; i++){
        elMute = document.getElementById(instruments[i] + '_clear');
        elMute.querySelector('a').addEventListener("mousedown", handleClear, true);
    }
}

// =====================================================================
// Helpers
// =====================================================================

// load and parse a JSON file with kit data
function getData(file){
    var json,
    request = new XMLHttpRequest();
    request.open("GET", file, false);

    request.onreadystatechange = function(){
        if ((request.status === 200) && request.readyState === 4){
            json = JSON.parse(request.responseText);
        }
    };

    request.send();
    return json;
}
// load the demo
function loadDemoKit(demo, params){
    // params = [tempo, pitch, swing];
    currentKit.loadBeat(demo);

    if(demo.name === 'demo808'){
        currentKit.load();
    }else{
        currentKit.load(demo.name);
    }

    $('.pitch').val(params[0]).trigger('change');
    $('.tempo').val(params[1]).trigger('change');
    $('.swing').val(params[2]).trigger('change');
}
// copy source object and return a new instance
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
// draws each note based on state of that given note
function drawNote(drawValue, xindex, yindex) {
    
    var elButton = document.getElementById(instruments[yindex] + '_' + xindex);
    var mute = document.getElementById(instruments[yindex] + '_mute');
    var buttonMuted = mute.classList.contains('active');
    var ofClassMuted = elButton.classList.contains('muted');
    // determine which class to apply
    switch (drawValue) {
        case 0: ofClassMuted ? elButton.classList.remove('muted') : elButton.classList.remove('alert'); break;
        case 1: buttonMuted ? elButton.classList.add('muted') : elButton.classList.add('alert'); break;
        case 2: elButton.classList.remove('alert'); elButton.classList.add('muted'); break;
    }
}
// updates the notes with the currentKit's rhythms
function updateControls() {
    var notes;
    for (var i = 0; i < loopLength; ++i) {
        for (var j = 0; j < instruments.length; j++) {
            switch (j) {
                case 0: notes = currentKit.theBeat.rhythm1; break;
                case 1: notes = currentKit.theBeat.rhythm2; break;
                case 2: notes = currentKit.theBeat.rhythm3; break;
                case 3: notes = currentKit.theBeat.rhythm4; break;
                case 4: notes = currentKit.theBeat.rhythm5; break;
                case 5: notes = currentKit.theBeat.rhythm6; break;
            }

            drawNote(notes[i], i, j);
        }
    }
}
// draws the blue playhead
function drawPlayhead(xindex) {
    // create a percentage of the current xindex
    var percentage = (xindex * 100) / 15;
    // set the meter width to that percentage
    var meter = document.getElementById('transport-meter');
    meter.firstChild.style.width = percentage + '%';
}

// =====================================================================
// Handlers
// =====================================================================

// determine which kit to load
function handleLoadDemo(demo){
    var params = [];

    switch(demo){
        case 'funkyHouse':
            params = [1, 126, 5];
            break;
        case 'hiphop':
            params = [1, 83, 5];
            break;
        case 'dubstep':
            params = [0, 70, 0];
            break;
        case 'demo808':
            params = [0, 114, 4];
            break;
    }
    loadDemoKit(jsonData[demo], params);
}
// handle the play event
function handlePlay(){
    
    noteTime = 0;
    currentKit.isPlaying = true;
    startTime = context.currentTime;

    schedule();
    // remove play button and create stop button
    var stopButton = $('#play');
    stopButton.attr('id', 'stop');
    stopButton.text('Stop');
    stopButton.removeClass('success').addClass('alert playing');
    stopButton.unbind('click');
    stopButton.bind('click', function(){
        handleStop();
    });
}
// handle the stop event
function handleStop(){

    clearTimeout(timeoutId);
    rhythmIndex = 0;
    currentKit.isPlaying = false;   
    // remove stop button and create play button
    var playButton = $('#stop');
    playButton.attr('id', 'play');
    playButton.removeClass('alert playing').addClass('success');
    playButton.text('Play');
    playButton.unbind('click');
    playButton.bind('click', function(){
        handlePlay();
    });
    // reset the playhead to 0
    drawPlayhead(rhythmIndex);
}
// clear the sequence
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

    switch (j){
        case 0:
            currentKit.theBeat.rhythm1 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            break;
        case 1:
            currentKit.theBeat.rhythm2 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            break;
        case 2:
            currentKit.theBeat.rhythm3 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
           break;
        case 3:
            currentKit.theBeat.rhythm4 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            break;
        case 4:
            currentKit.theBeat.rhythm5 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
           break;
        case 5:
            currentKit.theBeat.rhythm6 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            break;
        default:
            return false;
    }

    for(var i = 0; i < loopLength; i++){
        drawNote(0, i, j);  
    }
}
// take action when a step is clicked
function handleButtonMouseDown(event) {
    var elId = event.target.id;
    var notes = currentKit.theBeat.rhythm1;
    var instrumentIndex;
    var rhythmIndex;
    
    // gets the beat number
    rhythmIndex = elId.substr(elId.indexOf('_') + 1, 2);
    // gets the instrument name
    instrumentIndex = instruments.indexOf(elId.substr(0, elId.indexOf('_')));
    
    switch (instrumentIndex) {
        case 0: notes = currentKit.theBeat.rhythm1; break;
        case 1: notes = currentKit.theBeat.rhythm2; break;
        case 2: notes = currentKit.theBeat.rhythm3; break;
        case 3: notes = currentKit.theBeat.rhythm4; break;
        case 4: notes = currentKit.theBeat.rhythm5; break;
        case 5: notes = currentKit.theBeat.rhythm6; break;
    }
    // keep the notes between 0 and 2
    notes[rhythmIndex] = (notes[rhythmIndex] + 1) % 2;
    console.log(notes[rhythmIndex]);
    // draw the note in the on the right step
    drawNote(notes[rhythmIndex], rhythmIndex, instrumentIndex);

    var note = notes[rhythmIndex];
    // play the note
    if (note) {
        switch(instrumentIndex) {
        case 0:  // Kick
            if( !currentKit.kickMuted ){
                playSound(currentKit.kickBuffer);
            }
            break;

        case 1:  // Snare
            if( !currentKit.snareMuted ){
                playSound(currentKit.snareBuffer);
            }
            break;

        case 2:  // Hihat
            // Pan the hihat according to sequence position.
            if( !currentKit.hihatMuted ){
                playSound(currentKit.hihatBuffer);
            }
            break;

        case 3:  // Tom 1 
            if( !currentKit.tom1Muted ){
                playSound(currentKit.tom1Buffer);
            }
            break;

        case 4:  // Tom 2   
            if( !currentKit.tom2Muted ){
                playSound(currentKit.tom2Buffer);
            }
            break;

        case 5:  // Tom 3   
            if( !currentKit.tom3Muted ){
                playSound(currentKit.tom3Buffer);
            }
            break;
        }
    }
}
// reset the kit and sequence
function handleReset(){
    handleStop();
    currentKit.loadBeat(beatReset);
}
// take action to mute a selected row of steps
function handleMute(e){
    e.preventDefault();
    
    var thisMute = e.target.parentNode, instIndex, beatIndex;
    thisMute.classList.toggle('active');

    function _paintBtns(instIndex, mute){
        for(var i = 0; i < loopLength; i++){
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
            case 'kick_mute': currentKit.kickMuted = true; beatIndex = currentKit.theBeat.rhythm1; instIndex = 0; break;
            case 'snare_mute': currentKit.snareMuted = true; beatIndex = currentKit.theBeat.rhythm2; instIndex = 1; break;
            case 'hihat_mute': currentKit.hihatMuted = true; beatIndex = currentKit.theBeat.rhythm3; instIndex = 2; break;
            case 'tom1_mute': currentKit.tom1Muted = true; beatIndex = currentKit.theBeat.rhythm4; instIndex = 3; break;
            case 'tom2_mute': currentKit.tom2Muted = true; beatIndex = currentKit.theBeat.rhythm5; instIndex = 4; break;
            case 'tom3_mute': currentKit.tom3Muted = true; beatIndex = currentKit.theBeat.rhythm6; instIndex = 5; break;
        }
        _paintBtns(instIndex, true);
    }else{
        console.log("Unmuted");
        switch(thisMute.id){
            case 'kick_mute': currentKit.kickMuted = false; beatIndex = currentKit.theBeat.rhythm1; instIndex = 0; break;
            case 'snare_mute': currentKit.snareMuted = false; beatIndex = currentKit.theBeat.rhythm2; instIndex = 1; break;
            case 'hihat_mute': currentKit.hihatMuted = false; beatIndex = currentKit.theBeat.rhythm3; instIndex = 2; break;
            case 'tom1_mute': currentKit.tom1Muted = false; beatIndex = currentKit.theBeat.rhythm4; instIndex = 3; break;
            case 'tom2_mute': currentKit.tom2Muted = false; beatIndex = currentKit.theBeat.rhythm5; instIndex = 4; break;
            case 'tom3_mute': currentKit.tom3Muted = false; beatIndex = currentKit.theBeat.rhythm6; instIndex = 5; break;
        }
        _paintBtns(instIndex, false);
    }
}

// =====================================================================
// Playback
// =====================================================================

// play a buffer
function playSound(buffer, noteTime){
    // voice node
    var voice = context.createBufferSource();
    voice.buffer = buffer;
    voice.playbackRate.value = currentKit.pitch;
    voice.gain.value = 1;

    // gain node
    var gain = context.createGainNode();
    gain.gain.value = 1;

    var filter = context.createBiquadFilter();
    filter.type.value = "lowpass";
    filter.frequency.value = currentKit.filterVal;

    if(currentKit.filterOn === true){
        voice.connect(filter);
        filter.connect(gain);
    }else{
        voice.connect(gain);
    }
    // connect
    gain.connect(context.destination);
    
    // play voice
    voice.noteOn(noteTime);
}

// creates a loop to play the sequence
function schedule() {

    var currentTime = context.currentTime;
    
    // The sequence starts at startTime, so normalize currentTime so that it's 0 at the start of the sequence.
    currentTime -= startTime;
    var offset = currentTime + 0.2;

    while (noteTime < offset) {
        // Convert noteTime to context time.
        var contextPlayTime = noteTime + startTime;
        
        // Kick
        if (currentKit.theBeat.rhythm1[rhythmIndex] && !currentKit.kickMuted ) {
            playSound(currentKit.kickBuffer, contextPlayTime);
        }

        // Snare
        if (currentKit.theBeat.rhythm2[rhythmIndex] && !currentKit.snareMuted ) {
            playSound(currentKit.snareBuffer, contextPlayTime);
        }

        // Hihat
        if (currentKit.theBeat.rhythm3[rhythmIndex] && !currentKit.hihatMuted ) {
            playSound(currentKit.hihatBuffer, contextPlayTime);
        }

        // Tom1    
        if (currentKit.theBeat.rhythm4[rhythmIndex] && !currentKit.tom1Muted ) {
            playSound(currentKit.tom1Buffer, contextPlayTime);
        }
        // Tom2
        if (currentKit.theBeat.rhythm5[rhythmIndex] && !currentKit.tom2Muted ) {
            playSound(currentKit.tom2Buffer, contextPlayTime);
        }
        // Tom3
        if (currentKit.theBeat.rhythm6[rhythmIndex] && !currentKit.tom3Muted ) {
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
// helps the schedule() to increment the rhythm index
function advanceNote() {
    // Advance time by a 16th note...
    var secondsPerBeat = 60.0 / currentKit.theBeat.tempo;
    // increment rhythm index
    rhythmIndex++;
    if (rhythmIndex == loopLength) {
        rhythmIndex = 0;
    }
    // apply swing    
    if (rhythmIndex % 2) {
        noteTime += (0.25 + kMaxSwing * currentKit.theBeat.swingFactor) * secondsPerBeat;
    } else {
        noteTime += (0.25 - kMaxSwing * currentKit.theBeat.swingFactor) * secondsPerBeat;
    }
}

// Set up our demos
var jsonData = getData("js/data/kits.json");
var beatReset = jsonData.beatReset,
funkyHouse = jsonData.funkyHouse,
hiphop = jsonData.hiphop,
demo808 = jsonData.demo808,
dubstep = jsonData.dubstep;

// Pretty Photo
$("a[rel^='prettyPhoto']").prettyPhoto({
    default_width: 854,
    default_height: 510,
    social_tools: ''
});

// jQuery Dials
$("#buttonForModal").click(function() {
  $("#myModal").reveal();
});

$(".pitch").dial({
        fgColor:"#222222",
        bgColor:"#EEEEEE",
        min: 0,
        max: 10,
        thickness : 0.5, 
        change : function (value) {
            // dial = value;
            currentKit.pitch = value;
        }
    }).css({
        display:'inline',padding:'0px 10px'
});
$(".tempo").dial({
        fgColor:"#222222",
        bgColor:"#EEEEEE",
        min: 70,
        max: 129,
        thickness : 0.5, 
        change : function (value) {
            // dial = value;
            currentKit.theBeat.tempo = (value + 129.0) % 130.0;
        }
    }).css({
        display:'inline',padding:'0px 10px'
});
$(".swing").dial({
        fgColor:"#222222",
        bgColor:"#EEEEEE",
        min: 0,
        max: 20,
        thickness : 0.5, 
        change : function (value) {
            // dial = value;
            currentKit.theBeat.swingFactor = (value / 10) % 20;
        }
    }).css({
        display:'inline',
        padding:'0px 10px'
});
$(".filter").dial({
        fgColor:"#222222",
        bgColor:"#EEEEEE",
        min: 20,
        max: 10000,
        thickness : 0.5, 
        change : function (value) {
            // dial = value;
            currentKit.filterVal = value;
        }
    }).css({
        display:'inline',
        padding:'0px 10px'
});
// =====================================================================
// SoundCloud Support
// Coming version 2.0
// =====================================================================

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
}());