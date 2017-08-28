'use strict';

window.SequencePlayer = function () {

    let sequence = null;
    let parentElem = null;
    let delegate = null;

    let framesCount = null;
    let duration = null;
    let tracks = null;

    let paused = null;
    let isPlaying = false;
    let seeked = false;
    let _seek = null;
    let restartAnimation = false;
    let animIndex = 0; // do not reset on destroy
    let progressControl = null;

    const closeToOne = 0.9999;

    class ProgressControl {
        constructor(duration, initialSeek = 0) {
            this.duration = duration;
            this._progress = initialSeek;
        }

        reset() {
            this._progress = 0;
        }

        startRecord() {
            this._start = Date.now();
        }

        endRecord() {
            this._progress += Math.min(1, this._progressPassed());
            this._start = null;
        }

        _progressPassed() {
            return (Date.now() - this._start) / 1000 / this.duration;
        }

        get progress() {
            if (this._start) {
                return Math.min(1, this._progress + this._progressPassed());
            } else {
                return this._progress;
            }
        }
    }

    function notify(method, ...args) {
        if (delegate && typeof delegate[method] === 'function') {
            delegate[method].apply(null, args);
        }
    }

    function getFramesPercentsAndDuration(keyframes) {
        let frames = keyframes.map(k => k.frame - 1);
        let percents = frames.map(f => f / framesCount * 100);
        return percents;
    }

    function keyframesToCss(keyframes) {
        let percents = getFramesPercentsAndDuration(keyframes);

        if (percents.first() > 0) {
            percents = [ 0, ...percents ];
            keyframes = [ keyframes.first(), ...keyframes ];
        }

        if (percents.last() < 100) {
            percents = [ ...percents, 100 ];
            keyframes = [ ...keyframes, keyframes.last() ];
        }

        let keyframeCss = keyframes.map((k, i) => {
            return `
                    ${percents[i]}% {
                        top: ${k.top}px;
                        left: ${k.left}px;
                        width: ${k.width}px; 
                        height: ${k.height}px;
                        opacity: ${k.opacity};
                        transform: rotate(${k.rotateZ}deg); 
                        animation-timing-function: ${k.easing}; 
                    }
                    `;
        }).join('');

        animIndex++;

        let animationName = `anim-${animIndex}`;

        let css = `
                  @keyframes ${animationName} { 
                        ${keyframeCss}
                  }
                  `;

        return {
            css,
            animationName
        };
    }

    function trackToCss(track) {
        let { css, animationName } = keyframesToCss(track.keyframes);
        let className = `sequence-animation-${animationName}`;

        css = `
                ${css}
                
                .${className} {
                    animation-name: ${animationName};
                }
        `;

        return { css, className, dom: track.widget.$dom };
    }

    function bindAnimation(seek, willResume) {
        framesCount = sequence.$frames() - 1;
        duration = framesCount / sequence.fps;
        progressControl = new ProgressControl(duration, seek);
        tracks = sequence.tracks.map(trackToCss);

        let delay = 0;
        let longDuration = willResume ? duration : 1e9;
        if (typeof seek === 'number') {
            seeked = !willResume;
            if (seek === 1) {
                restartAnimation = true;
                seek = closeToOne;
            }
            delay = -seek * longDuration;
        }

        tracks.forEach(t => {
            t.dom.addClass(`sequence-animating-element ${t.className}`);
        });

        let d = seeked ? longDuration : duration;
        let tracksCss = tracks.map(t => t.css).join('\n');
        let css = `
            ${tracksCss}
            
            .sequence-animating-element { 
                animation-duration: ${d}s;
                -webkit-animation-duration: ${d}s;
                animation-delay: ${delay}s;
                -webkit-animation-delay: ${delay}s;
                animation-iteration-count: ${sequence.repeat};
            }
        `; // -webkit- prefix added to support PhantomJS to success tests, may be removed after updateing PhantomJS

        appendCss(css);
    }

    function resetTracks() {
        if (!tracks) return;

        tracks.forEach(t => {
            t.dom.removeClass(`sequence-animating-element ${t.className}`);
        });
    }

    function play(_sequence_, _delegate_, seek) {
        if (typeof seek === 'number') {         // seek
            initFromSequence(_sequence_, _delegate_);
            bindAnimation(seek);
        } else {

            if (typeof _seek === 'number') {    // paused for seek
                if (_seek === 1) {              // have bean seeked to end, replay
                    destroy();
                    play(_sequence_, _delegate_);
                } else {                        // restart with seek
                    let cacheSeek = _seek;
                    initFromSequence(_sequence_, _delegate_);
                    bindAnimation(cacheSeek, true);
                    resume();
                }

            } else if (paused === true) {       // resume playing
                resume();
                progressControl.startRecord();
            } else {                            // play from scratch
                initFromSequence(_sequence_, _delegate_);
                bindAnimation();
                resume();
            }

        }

        _seek = seek;
    }

    function resume() {
        tracks.forEach(t => {
            t.dom.css('animationPlayState', 'running');
        });
        isPlaying = true;
        paused = false;
        notify('play');
    }

    function pause() {
        tracks.forEach(t => {
            t.dom.css('animationPlayState', 'paused');
        });
        progressControl.endRecord();
        isPlaying = false;
        paused = true;
        seeked = false;
        notify('pause');
    }

    function initFromSequence(_sequence_, _delegate_) {
        destroy();
        sequence = _sequence_;
        delegate = _delegate_;
        parentElem = sequence.page.$dom;
        attachEvents();
    }

    function attachEvents() {
        parentElem.on('animationstart', startHandler);
        parentElem.on('animationiteration', iterHandler);
        parentElem.on('animationend', endHandler);
    }

    function detachEvents() {
        if (!parentElem) return;
        parentElem.off('animationstart', startHandler);
        parentElem.off('animationiteration', iterHandler);
        parentElem.off('animationend', endHandler);
    }

    function destroy() {
        detachEvents();
        sequence = null;
        parentElem = null;
        framesCount = null;
        duration = null;
        paused = null;
        isPlaying = false;
        seeked = false;
        _seek = null;
        progressControl = null;
        restartAnimation = false;
        appendCss();
        notify('destroy');
        delegate = null;
        resetTracks();
        tracks = null;
    }

    function startHandler() {
        if (seeked) {
            pause();
        } else {
            progressControl.startRecord();
            notify('play');
        }
        parentElem.off('animationstart', startHandler); // force to call only once for all child nodes
    }

    function endHandler() {
        if (restartAnimation) play();
        parentElem.off('animationend', endHandler);     // force to call only once for all child nodes
        progressControl.endRecord();
        progressControl.reset();
        notify('end');
        destroy();
    }

    function iterHandler() {
        progressControl.reset();
        progressControl.startRecord();
        notify('iteration');
    }

    // -------------------------------------- //
    function appendCss(css) {
        let head = document.head || document.getElementsByTagName('head')[0];
        if (!css) {
            if (appendCss.style) head.removeChild(appendCss.style);
            appendCss.style = null;
            return;
        }

        let style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);

        if (appendCss.style) head.removeChild(appendCss.style);
        appendCss.style = style;
    }
    // -------------------------------------- //

    function progress() {
        return progressControl ? progressControl.progress : 0;
    }

    return {
        destroy,
        play,
        pause,
        progress
    };

};
