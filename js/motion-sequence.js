let MotionSequence = {
    $frames() {
        return this.frames
    },
    frames: 42,
    fps: 15,
    repeat: 1,
    page: {
        $dom: document.body
    },
    tracks: [
        {
            widget: {
                $dom: window.box1
            },
            keyframes: [
                {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 100,
                    rotateZ: 0,
                    opacity: 1,
                    easing: "linear",
                    frame: 1,
                },
                {
                    top: 200,
                    left: 0,
                    width: 100,
                    height: 100,
                    frame: 20,
                    rotateZ: 0,
                    opacity: 1,
                    easing: "linear",
                },
                {
                    top: 100,
                    left: 221,
                    width: 100,
                    height: 100,
                    frame: 42,
                    rotateZ: 135,
                    opacity: 1,
                    easing: "linear",
                }
            ]
        },
        {
            widget: {
                $dom: window.box2
            },
            keyframes: [
                {
                    top: 0,
                    left: 220,
                    width: 100,
                    height: 100,
                    rotateZ: 0,
                    opacity: 1,
                    easing: "linear",
                    frame: 1,
                },
                {
                    top: 250,
                    left: 220,
                    width: 100,
                    height: 100,
                    frame: 29,
                    rotateZ: 0,
                    opacity: 1,
                    easing: "ease-in-out",
                },
                {
                    top: 0,
                    left: 0,
                    width: 100,
                    height: 100,
                    frame: 42,
                    rotateZ: 45,
                    opacity: 1,
                    easing: "linear",
                }
            ]
        }
    ]
};
