/**
 * Dropbox Support
 */
export default class Dropbox {

  constructor() {
    const files = [];
    const dbChooser = document.getElementById("db-chooser");
    
    dbChooser.addEventListener("DbxChooserSuccess", function(e) {
      e.files.forEach(function(file){
        files.push(file);
      });
      createAudioEl();
    }, false);

    this.createAudioEl(files[0].link)
  }

  createAudioEl(link){  
    // create an audio element
    const audioEl = document.createElement('audio');
    audioEl.setAttribute('controls', '');
    audioEl.setAttribute('src', link);
    
    document.getElementsByTagName('body')[0].appendChild(audioEl);
  }

}