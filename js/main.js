let elem = document.getElementById('box');
let seeked = false;
let restartAnimation = false;

elem.addEventListener('animationstart', function (e) {
    seeked && pause();
    console.log('start:', e.type);
}, false);

elem.addEventListener('animationiteration', function (e) {
    console.log('iter:', e.type);
}, false);

elem.addEventListener('animationend', function (e) {
    restartAnimation && play();
    console.log('end:', e.type);
}, false);

function appendCss(css) {
    let head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);

    appendCss.style && head.removeChild(appendCss.style);
    appendCss.style = style;
}

let animIndex = 0;
let fps = 24;
let MotionKeyframe = [
    {
        "top": 0,
        "left": 0,
        "width": 200,
        "height": 200,
        "frame": 15,
        "rotateZ": 0,
        "opacity": 1,
        "backgroundColor": "#f00",
        "easing": "ease-in-out"
    },
    {
        "top": 264,
        "left": 63,
        "width": 200,
        "height": 85,
        "frame": 35,
        "rotateZ": 30,
        "opacity": 1,
        "backgroundColor": "#0f0",
        "easing": "linear",
    },
    {
        "top": 55,
        "left": 231,
        "width": 84,
        "height": 66,
        "frame": 46,
        "rotateZ": 135,
        "opacity": 1,
        "backgroundColor": "#00f",
        "easing": "linear",
    }
];

function playPause() {
    if (elem.style.animationPlayState !== 'paused') {
        elem.style.animationPlayState = 'paused'
    } else {
        elem.style.animationPlayState = 'running'
    }
}

function pause() {
    console.log('pause called');
    elem.style.animationPlayState = 'paused';
}

function play() {
    elem.style.animationPlayState = 'running';
}

function getFramesAndCount(keyframes) {
    let frames = keyframes.map(k => k.frame - 1);
    let last = frames[keyframes.length - 1];

    return {
        frames,
        framesCount: last + 1,
    }
}

function getFramesPercentsAndDuration(keyframes) {
    let  { frames, framesCount } = getFramesAndCount(keyframes);
    let percents = frames.map(f => Math.round( f / (framesCount - 1) * 100));
    let duration = framesCount / fps;
    return { percents, duration }
}

function keyframesToCss(keyframes) {
    let { percents, duration } = getFramesPercentsAndDuration(keyframes);
    keyframes.forEach((k, i) => {
        k.percent = percents[i];
    });
    let keyframeCss = keyframes.map(k => {
        return `
        ${k.percent}% {
            top: ${k.top}px;
            left: ${k.left}px;
            width: ${k.width}px; 
            height: ${k.height}px;
            opacity: ${k.opacity};
            transform: rotate(${k.rotateZ}deg); 
            animation-timing-function: ${k.easing};
            background-color: ${k.backgroundColor}; 
        }
        `
    }).join('');

    let animationName = `anim${animIndex++}`;
    let css = `@keyframes ${animationName} { 
        ${keyframeCss}
    }`;

    return {
        css,
        animationName,
        duration
    }
}

function applyAnimation(value = 0) {
    seeked = !!value;

    let { css, animationName, duration } = keyframesToCss(MotionKeyframe);

    value = +value;
    if (value === 1) {
        restartAnimation = true;
        value = 0.9999;
    }
    let delay = -value * duration;

    css = `
        ${css}
        
        #box {
            animation-name: ${animationName};
            background-color: red;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        }
    `;
    appendCss(css);
}

applyAnimation();

function seekTo(value) {
    applyAnimation(value)
}
