// ==============================================================
// Init
// ==============================================================
window.onload = init
var context

function init() {
  // create a new context
  context = new webkitAudioContext()

  // initialize our controls and buttons
  // initControls();
  // initButtons();

  // create a fresh instance of our kit
  // var kit = new Kit();
  // kit.load();
  // kit.isLoaded = true;
  // set the global currentKit to our instance (There should alway be one of these)
  // currentKit = kit;
  // load up a fresh copy of our beat values
  // currentKit.loadBeat(beatReset);
}

function initControls() {
  // add eventListeners on the various HTML elements
  window.addEventListener('keydown', function (e) {
    if (e.keyCode === 32) {
      if (currentKit.isPlaying) {
        handleStop()
      } else {
        handlePlay()
      }
    } else if (e.keyCode === 67) {
      handleReset()
    }
  })
  // play button
  $('#play').on('click', handlePlay)
  // clear button
  $('#clear').on('click', handleReset)

  $('#full-screen').click(function () {
    $('#get-started').toggle()
    $('#drum-machine')
      .toggleClass('eight')
      .toggleClass('twelve')
      .toggleClass('full-screen-mode')
    $('#panel span').toggleClass('small').toggleClass('large')
    $('.filter').prev().toggle()
    // $('.filter').toggle();
    $('#filterButton').toggle()
  })
  // demos in dropdown
  for (var demo in jsonData) {
    $('#' + demo).bind('click', function (e) {
      handleLoadDemo(e.target.id)
    })
  }
  // hide the filter button
  $('.filter').prev().hide()
  $('.filter').hide()
  $('#filterButton').hide()
  $('#filterButton').click(function () {
    $('#filterButton').toggleClass('secondary').toggleClass('success')
    if (currentKit.filterOn) {
      currentKit.filterOn = false
    } else {
      currentKit.filterOn = true
    }
  })
}

// =====================================================================
// Helpers
// =====================================================================

// load and parse a JSON file with kit data
function getData(file) {
  var json,
    request = new XMLHttpRequest()
  request.open('GET', file, false)

  request.onreadystatechange = function () {
    if (request.status === 200 && request.readyState === 4) {
      json = JSON.parse(request.responseText)
    }
  }

  request.send()
  return json
}
// load the demo
function loadDemoKit(demo, params) {
  // params = [tempo, pitch, swing];
  currentKit.loadBeat(demo)

  if (demo.name === 'demo808') {
    currentKit.load()
  } else {
    currentKit.load(demo.name)
  }

  $('.pitch').val(params[0]).trigger('change')
  $('.tempo').val(params[1]).trigger('change')
  $('.swing').val(params[2]).trigger('change')
}
// copy source object and return a new instance
function cloneBeat(source) {
  var beat = new Object()

  beat.kitIndex = source.kitIndex
  beat.effectIndex = source.effectIndex
  beat.tempo = source.tempo
  beat.swingFactor = source.swingFactor
  beat.effectMix = source.effectMix
  beat.kickPitchVal = source.kickPitchVal
  beat.snarePitchVal = source.snarePitchVal
  beat.hihatPitchVal = source.hihatPitchVal
  beat.tom1PitchVal = source.tom1PitchVal
  beat.tom2PitchVal = source.tom2PitchVal
  beat.tom3PitchVal = source.tom3PitchVal
  beat.rhythm1 = source.rhythm1.slice(0) // slice(0) is an easy way to copy the full array
  beat.rhythm2 = source.rhythm2.slice(0)
  beat.rhythm3 = source.rhythm3.slice(0)
  beat.rhythm4 = source.rhythm4.slice(0)
  beat.rhythm5 = source.rhythm5.slice(0)
  beat.rhythm6 = source.rhythm6.slice(0)

  return beat
}
// draws each note based on state of that given note
function drawNote(drawValue, xindex, yindex) {
  var elButton = document.getElementById(instruments[yindex] + '_' + xindex)
  var mute = document.getElementById(instruments[yindex] + '_mute')
  var buttonMuted = mute.classList.contains('active')
  var ofClassMuted = elButton.classList.contains('muted')
  // determine which class to apply
  switch (drawValue) {
    case 0:
      ofClassMuted
        ? elButton.classList.remove('muted')
        : elButton.classList.remove('alert')
      break
    case 1:
      buttonMuted
        ? elButton.classList.add('muted')
        : elButton.classList.add('alert')
      break
    case 2:
      elButton.classList.remove('alert')
      elButton.classList.add('muted')
      break
  }
}
// updates the notes with the currentKit's rhythms
function updateControls() {
  var notes
  for (var i = 0; i < loopLength; ++i) {
    for (var j = 0; j < instruments.length; j++) {
      switch (j) {
        case 0:
          notes = currentKit.theBeat.rhythm1
          break
        case 1:
          notes = currentKit.theBeat.rhythm2
          break
        case 2:
          notes = currentKit.theBeat.rhythm3
          break
        case 3:
          notes = currentKit.theBeat.rhythm4
          break
        case 4:
          notes = currentKit.theBeat.rhythm5
          break
        case 5:
          notes = currentKit.theBeat.rhythm6
          break
      }

      drawNote(notes[i], i, j)
    }
  }
}
// draws the blue playhead
function drawPlayhead(xindex) {
  // create a percentage of the current xindex
  var percentage = (xindex * 100) / 15
  // set the meter width to that percentage
  var meter = document.getElementById('transport-meter')
  meter.firstChild.style.width = percentage + '%'
}

// =====================================================================
// Playback
// =====================================================================

// play a buffer
function playSound(buffer, noteTime) {
  // voice node
  var voice = context.createBufferSource()
  voice.buffer = buffer
  voice.playbackRate.value = currentKit.pitch
  voice.gain.value = 1

  // gain node
  var gain = context.createGainNode()
  gain.gain.value = 1

  var filter = context.createBiquadFilter()
  filter.type.value = 'lowpass'
  filter.frequency.value = currentKit.filterVal

  if (currentKit.filterOn === true) {
    voice.connect(filter)
    filter.connect(gain)
  } else {
    voice.connect(gain)
  }
  // connect
  gain.connect(context.destination)

  // play voice
  voice.noteOn(noteTime)
}

// creates a loop to play the sequence
function schedule() {
  var currentTime = context.currentTime

  // The sequence starts at startTime, so normalize currentTime so that it's 0 at the start of the sequence.
  currentTime -= startTime
  var offset = currentTime + 0.2

  while (noteTime < offset) {
    // Convert noteTime to context time.
    var contextPlayTime = noteTime + startTime

    // Kick
    if (currentKit.theBeat.rhythm1[rhythmIndex] && !currentKit.kickMuted) {
      playSound(currentKit.kickBuffer, contextPlayTime)
    }

    // Snare
    if (currentKit.theBeat.rhythm2[rhythmIndex] && !currentKit.snareMuted) {
      playSound(currentKit.snareBuffer, contextPlayTime)
    }

    // Hihat
    if (currentKit.theBeat.rhythm3[rhythmIndex] && !currentKit.hihatMuted) {
      playSound(currentKit.hihatBuffer, contextPlayTime)
    }

    // Tom1
    if (currentKit.theBeat.rhythm4[rhythmIndex] && !currentKit.tom1Muted) {
      playSound(currentKit.tom1Buffer, contextPlayTime)
    }
    // Tom2
    if (currentKit.theBeat.rhythm5[rhythmIndex] && !currentKit.tom2Muted) {
      playSound(currentKit.tom2Buffer, contextPlayTime)
    }
    // Tom3
    if (currentKit.theBeat.rhythm6[rhythmIndex] && !currentKit.tom3Muted) {
      playSound(currentKit.tom3Buffer, contextPlayTime)
    }

    // Attempt to synchronize drawing time with sound
    if (noteTime != lastDrawTime) {
      lastDrawTime = noteTime
      drawPlayhead((rhythmIndex + 15) % 16)
    }

    advanceNote()
  }

  timeoutId = setTimeout(schedule, 0)
}
// helps the schedule() to increment the rhythm index
function advanceNote() {
  // Advance time by a 16th note...
  var secondsPerBeat = 60.0 / currentKit.theBeat.tempo
  // increment rhythm index
  rhythmIndex++
  if (rhythmIndex == loopLength) {
    rhythmIndex = 0
  }
  // apply swing
  if (rhythmIndex % 2) {
    noteTime +=
      (0.25 + kMaxSwing * currentKit.theBeat.swingFactor) * secondsPerBeat
  } else {
    noteTime +=
      (0.25 - kMaxSwing * currentKit.theBeat.swingFactor) * secondsPerBeat
  }
}

// Set up our demos
$.getJSON('https://webkit-808.firebaseio.com/.json', function (data) {
  console.log(data)
})

// // Pretty Photo
// $("a[rel^='prettyPhoto']").prettyPhoto({
//     default_width: 854,
//     default_height: 510,
//     social_tools: ''
// });

// // jQuery Dials
// $("#buttonForModal").click(function() {
//   $("#myModal").reveal();
// });
