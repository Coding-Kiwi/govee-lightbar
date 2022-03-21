const noble = require("@abandonware/noble");

/**
 * Currently there is no way to properly shutdown / stop noble.
 * There is an issue/PR but its in the abandoned original `noble/noble` project https://github.com/noble/noble/issues/299
 * The function overwrites / modifications in this file mirror the changes suggested in this PR https://github.com/noble/noble/pull/577
 */

const hci = noble._bindings._hci;

if (hci) {
    hci.stop = function () {
        this._socket.stop();
        clearTimeout(this._pollIsDevUpTimeout);
    };

    hci.pollIsDevUp = function () {
        const isDevUp = this._socket.isDevUp();

        if (this._isDevUp !== isDevUp) {
            if (isDevUp) {
                if (this._state === 'poweredOff') {
                    this._socket.removeAllListeners();
                    this._state = null;
                    this.init();
                    return;
                }
                this.setSocketFilter();
                this.setEventMask();
                this.setLeEventMask();
                this.readLocalVersion();
                this.writeLeHostSupported();
                this.readLeHostSupported();
                this.readLeBufferSize();
                this.readBdAddr();
            } else {
                this.emit('stateChange', 'poweredOff');
            }

            this._isDevUp = isDevUp;
        }

        this._pollIsDevUpTimeout = setTimeout(this.pollIsDevUp.bind(this), 1000);
    };

    noble.stop = function () {
        this._bindings._hci.stop();
    };
}

module.exports = noble;