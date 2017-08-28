'use strict';

let player = new SequencePlayer();
let play_Pause_Btn = window.playPauseBtn;
let range_Input = window.rangeInput;

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

let delegate = {
    destroy: () => {
        $scope.isPlaying = false;
        window.clearInterval(progressDebounceId);
        progressDebounceId = null;
    },
    play: () => {
        $scope.isPlaying = true;
    },
    pause: () => {
        $scope.isPlaying = false;

        if (progressDebounceId) {
            window.clearInterval(progressDebounceId);
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

let play = function () {
    player.play(MotionSequence, delegate);
    requestAnimationFrame(setSeekerProgress);
    progressDebounceId = window.setInterval(setSeekerProgress, 1000 / 60);
};

play();

window.seekTo = (value) => {
    player.play(MotionSequence, delegate, +value);
};

window.playPause = () => {
    $scope.isPlaying ? player.pause() : play();
};
