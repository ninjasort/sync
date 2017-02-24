
"use strict";

window.MACHINE = function(){

	this.context = null;
	this.loopLength = 16;
	this.rhythmIndex = 0;
	this.minTempo = 50;
	this.maxTempo = 180;
	this.noteTime;
	this.startTime;
	this.lastDrawTime = -1;
	this.timeoutId;
	this.sliderVal = null;
	this.kMaxSwing = 0.08;
	this.rec = null;
	this.currentKit = {};

	this.instruments = ['kick', 'snare', 'hihat', 'tom1', 'tom2', 'tom3'];
	this.beatReset = {
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

};