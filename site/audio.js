class audio {
    static sounds = [];
    static dir = './';
    static play(name, loops = false, volume = 1) {
        return new Promise(resolve => {
            var path = audio.dir + name;
            var sound = new Audio(path);
            var context = new (window.AudioContext || window.webkitAudioContext)();
            var source = context.createMediaElementSource(sound);
            var panNode = context.createStereoPanner();
            panNode.pan.value = 0;
            source.connect(panNode);
            panNode.connect(context.destination);
            sound.volume = volume;
            sound.loop = loops;
            sound.play();
            audio.sounds.push({ sound, name, context, panNode});
            sound.onended = () => {
                resolve();
                audio.stop(name);
            }
        });
    }
    static stop(name, del = true) {
        var i = audio.sounds.length;
        while (i--) {
            if (audio.sounds[i].name == name) {
                audio.sounds[i].sound.pause();
                if (del) audio.sounds.splice(i, 1);
            }
        }
    }
    static unpause(name) {
        var i = audio.sounds.length;
        while (i--) {
            if (audio.sounds[i].name == name) {
                audio.sounds[i].sound.play();
            }
        }
    }
    static stopAll(del = true) {
        for (let s of audio.sounds) {
            s.sound.pause();
        }
        if (del) audio.sounds = [];
    }
    static getAudio(name) {
        for (let s of audio.sounds) {
            if (s.name == name) return s;
        }
    }
    static getElement(name){
        return audio.getAudio(name).sound;
    }
    static panAudio(name,pan=0){
        audio.getAudio(name).panNode.pan.value = pan;
    }
}