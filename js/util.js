HTMLElement.prototype.on = HTMLElement.prototype.addEventListener;
HTMLElement.prototype.off = HTMLElement.prototype.removeEventListener;
HTMLElement.prototype.addClass = function (className) {
    this.className += ' ' + className;
};

HTMLElement.prototype.removeClass = function(className) {
    let classes = this.className.split(' ');
    let idx = classes.indexOf(className);
    if (idx > -1) {
        classes.splice(idx, 1);
    }

    this.className = classes.join(' ');
};

HTMLElement.prototype.removeClass = function (className) {
    this.className += ' ' + className;
};

HTMLElement.prototype.css = function (key, value) {
    this.style[key] = value;
};

Array.prototype.first = function () {
    return this[0];
};

Array.prototype.last = function () {
    return this[this.length - 1];
};


