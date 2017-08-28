'use strict';

const player = new SequencePlayer();

//noinspection JSUnresolvedVariable
let play_Pause_Btn = window.playPauseBtn,
    range_Input = window.rangeInput;

let progressDebounceId = -1;
let $scope = {
    get isPlaying() {
        return this._isPlaying;
    },

    set isPlaying(value) {
        play_Pause_Btn.value = value ? 'pause' : 'play';
        this._isPlaying = value;
    }
};

let setSeekerProgress = () => {
    range_Input.value = player.progress();
};

let progressDebounce = () => {
    setSeekerProgress();
    progressDebounceId = window.requestAnimationFrame(progressDebounce);
};

//noinspection JSUnusedGlobalSymbols // calls in computed form
let delegate = {
    destroy: () => {
        $scope.isPlaying = false;
        window.cancelAnimationFrame(progressDebounceId);
        progressDebounceId = null;
    },
    play: () => {
        $scope.isPlaying = true;
    },
    pause: () => {
        $scope.isPlaying = false;

        if (progressDebounceId) {
            window.cancelAnimationFrame(progressDebounceId);
            progressDebounceId = null;
            setSeekerProgress();
        }
    },
    iteration: () => {
        range_Input.value = 0;
    },
    end: () => {
        setSeekerProgress();
    }
};

let play = function (seek) {
    player.play(MotionSequence, delegate, seek);

    if (typeof seek !== 'number') {
        progressDebounceId = requestAnimationFrame(progressDebounce);
    }
};

window.seekTo = (value) => play(+value);
window.playPause = () => $scope.isPlaying ? player.pause() : play();

play();
