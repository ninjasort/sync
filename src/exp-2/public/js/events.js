window.EVENTS = function(){
	

};

EVENTS.prototype.addEventsToButtons = function(button){

	switch(button){
		case 'mute':
			(function(){
				// add toggleMute eventListener to the mute buttons
				console.log("Add mute events to buttons");
				// for(var i = 0; i < instruments.length; i++){
				//     elMute = document.getElementById(instruments[i] + '_mute');
				//     elMute.querySelector('a').addEventListener("mousedown", handleMute, true);
				// }
			})();
			break;
		case 'clear':
			(function(){
				// add handleClear eventListener to the x buttons
				console.log("Add clear events to buttons");
				// for(var i = 0; i < instruments.length; i++){
				//     elMute = document.getElementById(instruments[i] + '_clear');
				//     elMute.querySelector('a').addEventListener("mousedown", handleClear, true);
				// }
			})();
			break;
		case 'step':
			(function(){
				// add handleButtonsMouseDown eventListener to the blue step buttons
				console.log("Add step events to buttons");
			    // for (var i = 0; i < loopLength; ++i) {
			    //     for (var j = 0; j < instruments.length; j++) {
			    //         elButton = document.getElementById(instruments[j] + '_' + i);
			    //         elButton.addEventListener("mousedown", handleButtonMouseDown, true);
			    //     }
			    // }
			})();
			break;
	}

};
// =====================================================================
// Handlers
// =====================================================================

// determine which kit to load
EVENTS.prototype.handleLoadDemo = function(demo){
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
EVENTS.prototype.handlePlay = function(){
    
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
EVENTS.prototype.handleStop = function(){

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
EVENTS.prototype.handleClear = function(e){
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
EVENTS.prototype.handleButtonMouseDown = function(event) {
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
EVENTS.prototype.handleReset = function(){
    this.handleStop();
    currentKit.loadBeat(beatReset);
}
// take action to mute a selected row of steps
EVENTS.prototype.handleMute = function(e){
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
/**
 * Create jQuery Kontrol Dials
 * @param  {string}
 * @change {function}
 * @min {number}
 * @max {number}
 * @return {null}
 *
 * Ex.
 * something.createDials('tempo', function(){
 * 
 * 		currentKit.rhythm.tempo = (value + 129.0) % 130.0;
 * 
 * });
 * 
 */
EVENTS.prototype.createDials = function(param, change, min, max){

	$(param).dial({
        fgColor:"#222222",
        bgColor:"#EEEEEE",
        min: 0,
        max: 10,
        thickness : 0.5, 
        change: change
    }).css({
        display:'inline',padding:'0px 10px'
	});

    // TODO: Add handler support
	// Pitch handler
    // change : function (value) {
    //     // dial = value;
    //     currentKit[param] = value;
    // }
	// Tempo handler
	// min: 70,
	// max: 129,
	// change : function (value) {
	//     // dial = value;
	//     currentKit.theBeat.tempo = (value + 129.0) % 130.0;
	// }
	// Swing Handler
	// min: 0,
	// max: 20,
	// thickness : 0.5, 
	// change : function (value) {
	//     // dial = value;
	//     currentKit.theBeat.swingFactor = (value / 10) % 20;
	// }
	// Filter Handler
	// min: 20,
	// max: 10000,
	// thickness : 0.5, 
	// change : function (value) {
	// // dial = value;
	// currentKit.filterVal = value;
	// }
	
};