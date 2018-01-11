/**
 * The type of redux action to set the PiP mode change event listener.
 *
 * {
 *     type: _SET_PIP_MODE_LISTENER,
 *     listener: Function
 * }
 *
 * @protected
 */
export const _SET_PIP_MODE_LISTENER = Symbol('_SET_PIP_MODE_LISTENER');

/**
 * The type of redux action which signals that the PiP mode has changed.
 *
 * {
 *     type: PIP_MODE_CHANGED,
 *     inPipMode: boolean
 * }
 *
 * @public
 */
export const PIP_MODE_CHANGED = Symbol('PIP_MODE_CHANGED');

/**
 * The type of redux action which signals that the PiP mode is requested.
 *
 * {
 *      type: REQUEST_PIP_MODE
 * }
 *
 * @public
 */
export const REQUEST_PIP_MODE = Symbol('REQUEST_PIP_MODE');
