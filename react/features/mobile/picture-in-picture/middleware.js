// @flow

import { Dimensions, NativeModules } from 'react-native';

import {
    APP_WILL_MOUNT,
    APP_WILL_UNMOUNT
} from '../../app';
import {
    CONFERENCE_JOINED,
    VIDEO_QUALITY_LEVELS,
    setLastN,
    setReceiveVideoQuality
} from '../../base/conference';
import { pinParticipant } from '../../base/participants';
import { MiddlewareRegistry } from '../../base/redux';

import {
    _setListener,
    pipModeChanged
} from './actions';
import {
    _SET_PIP_MODE_LISTENER,
    PIP_MODE_CHANGED,
    REQUEST_PIP_MODE
} from './actionTypes';

/**
 * Reference to the Picture-in-Picture helper module. Currently only implemented
 * for Android, as iOS "fakes" it since there is PiP support for phones.
 */
const pip = NativeModules.PictureInPicture;

/**
 * Threshold for detecting if the application is in Picture-in-Picture mode. If
 * either the width or height is below this threshold, the app is considered to
 * be in PiP mode and the UI will be adjusted accordingly.
 */
const PIP_THRESHOLD_SIZE = 240;

/**
 * Middleware that handles Picture-in-Picture mode changes and reacts to them
 * by dispatching the needed actions for the application to adjust itself to
 * the mode. Currently the following happens when PiP mode is engaged:
 *  - any pinned participant is unpinned
 *  - last N is set to 1
 *  - received video quality is set to low
 * All these actions are reversed when PiP mode is disengaged. If audio-only
 * mode is in use, last N and received video quality remain untouched.
 *
 * @param {Store} store - Redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    switch (action.type) {
    case _SET_PIP_MODE_LISTENER: {
        // Remove the current/old listener.
        const { pipModeListener } = store.getState()['features/pip'];

        if (pipModeListener) {
            pipModeListener.remove();
        }
        break;
    }

    case APP_WILL_MOUNT:
        _appWillMount(store);
        break;

    case APP_WILL_UNMOUNT:
        store.dispatch(_setListener(undefined));
        break;

    case CONFERENCE_JOINED:
    case PIP_MODE_CHANGED:
        _pipModeChanged(store, action);
        break;

    case REQUEST_PIP_MODE:
        _requestPipMode();
        break;

    }

    return next(action);
});

/**
 * Notifies the feature pip that the action {@link APP_WILL_MOUNT} is being
 * dispatched within a specific redux {@code store}.
 *
 * @param {Store} store - The redux store in which the specified {@code action}
 * is being dispatched.
 * @param {Dispatch} next - The redux dispatch function to dispatch the
 * specified {@code action} to the specified {@code store}.
 * @param {Action} action - The redux action {@code APP_WILL_MOUNT} which is
 * being dispatched in the specified {@code store}.
 * @private
 * @returns {*}
 */
function _appWillMount({ dispatch, getState }) {
    const context = {
        dispatch,
        getState
    };

    const listener
        = Dimensions.addEventListener(
            'change', _onDimensionsChanged.bind(context));

    dispatch(_setListener(listener));
}

/**
 * Handle window dimension changes. When the window size (either width or
 * height) is below the threshold, we consider the app to be in PiP mode. Here
 * we focus on the 'window', because the 'screen' represents the entire
 * available surface on the device, not the surface our view is taking.
 *
 * @param {Object} dimensions - Representation of the device dimensions,
 * according to React Native's {@link Dimensions} module.
 * @private
 * @returns {void}
 */
function _onDimensionsChanged(dimensions: Object) {
    const { dispatch, getState } = this; // eslint-disable-line no-invalid-this
    const { width, height } = dimensions.window;
    const wasInPipMode = getState()['features/pip'].inPipMode;
    const inPipMode = width < PIP_THRESHOLD_SIZE || height < PIP_THRESHOLD_SIZE;

    if (wasInPipMode !== inPipMode) {
        dispatch(pipModeChanged(inPipMode));
    }
}

/**
 * Handles PiP mode changes. Dispatches the necessary Redux actions for setting
 * the app layout / behavior to the PiP mode. See above for details.
 *
 * @param {Object} store - Redux store.
 * @param {Action} action - The Redux action {@code CONFERENCE_JOINED} or
 * {@code PIP_MODE_CHANGED} which is * being dispatched in the specified
 * {@code store}.
 * @private
 * @returns {void}
 */
function _pipModeChanged({ dispatch, getState }, action: Object) {
    const state = getState();
    const { audioOnly } = state['features/base/conference'];
    let { inPipMode } = action;

    if (typeof inPipMode === 'undefined') {
        inPipMode = state['features/pip'].inPipMode;
    }

    inPipMode && dispatch(pinParticipant(null));

    if (!audioOnly) {
        dispatch(setLastN(inPipMode ? 1 : undefined));
        dispatch(
            setReceiveVideoQuality(
                inPipMode
                    ? VIDEO_QUALITY_LEVELS.LOW : VIDEO_QUALITY_LEVELS.HIGH));
    }
}

/**
 * Handle a request for entering Picture-Picture mode.
 *
 * @private
 * @returns {void}
 */
function _requestPipMode() {
    if (pip) {
        pip.enterPictureInPictureMode();
    }
}
