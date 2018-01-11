// @flow

import {
    _SET_PIP_MODE_LISTENER,
    PIP_MODE_CHANGED,
    REQUEST_PIP_MODE
} from './actionTypes';

/**
 * Sets the listener for the "pictureInPictureModeChanged" event.
 *
 * @param {Function} listener - Function to be set as the event listener.
 * @protected
 * @returns {{
 *     type: _SET_PIP_MODE_LISTENER,
 *     listener: Function
 * }}
 */
export function _setListener(listener: ?Function) {
    return {
        type: _SET_PIP_MODE_LISTENER,
        listener
    };
}

/**
 * Signals that the Picture-in-Picture (PiP) mode has changed. When in PiP mode,
 * the application is displayed in a small view and it's not rendered in full.
 *
 * @param {boolean} inPipMode - True if the app is in PiP mode, false otherwise.
 * @public
 * @returns {{
 *     type: PIP_MODE_CHANGED,
 *     inPipMode: boolean
 * }}
 */
export function pipModeChanged(inPipMode: boolean) {
    return {
        type: PIP_MODE_CHANGED,
        inPipMode
    };
}

/**
 * Requests Picture-in-Picture mode.
 *
 * @public
 * @returns {{
 *     type: REQUEST_PIP_MODE
 * }}
 */
export function requestPipMode() {
    return {
        type: REQUEST_PIP_MODE
    };
}
