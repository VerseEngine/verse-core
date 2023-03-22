/* tslint:disable */
/* eslint-disable */

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};
/**
 * Avatar Information.
 */
export interface AvatarInfo {
  /**
   * Serialized avatar data.
   */
  data: Uint8Array;
};
/**
 * Player.
 * It must be created by the user of {@link Verse}.
 */
export interface Player {
  /**
   * position.
   */
  getPosition(): Vector3;
  /**
   * Front orientation.  Controlled by y-axis only.
   */
  getAngle(): number;
  /**
   * name
   */
  getName(): string|undefined;
  /**
   * My Avatar Information.
   */
  getAvatar(): AvatarInfo;
  /**
   * Date and time the avatar was changed.
   */
  getAvatarChanged(): Date | null;
  /**
   * Callback method to retrieve the Stream to send detailed information.
   * This stream is used to send hand and head movements, facial expressions, etc.
   */
  onRequestDetailStream(factory:DetailInputStreamFactory): void;
};

/**
 * Other player on the remote.
 */
export interface OtherPerson {
  /**
   * Receive movement.
   *
   * @param position_x - Position passed by {@link Player.getPosition}.
   * @param position_y - Position passed by {@link Player.getPosition}.
   * @param position_z - Position passed by {@link Player.getPosition}.
   * @param angle - Frontal orientation passed in {@link Player.getAngle}.
   */
  moveTo(
    position_x: number,
    position_y: number,
    position_z: number,
    angle: number
  ): void;
  /**
   * name
   */
  setName(name:string): void;
  /**
   * Receive a {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream | MediaStream} of the voice chat.
   *
   * @remarks
   * In Chrome, you have to add it to Audio Element to get sound.
   * In Mobile Safari, if you do not set the timing of the tap, it will not play.
   *
   * @example
   * Simple example.
   * see: {@link
   * https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamSource | AudioContext.createMediaStreamSource}
   * ```ts
   * onVoiceMediaStream(ms) {
   *   ...
   *   const source = audioCtx.createMediaStreamSource(stream);
   *   source.connect(audioCtx.destination);
   * }
   * ```
   *
   * @example
   * Example using three.js.
   * see: {@link https://threejs.org/docs/?q=Audio#api/en/audio/PositionalAudio |
   * THREE.PositionalAudio}
   * ```ts
   * onVoiceMediaStream(ms) {
   *   ...
   *   this._audio = new THREE.PositionalAudio(
   *     this._envAdapter.getAudioListener()
   *   );
   *   this._object3D.add(this._audio);
   *   this._audio.setMaxDistance(5);
   *   this._audio.setRefDistance(2);
   *   this._audio.setRolloffFactor(2);
   *
   * 
   *   // In Chrome, you have to add it to Audio Element to get sound.
   *   // https://stackoverflow.com/questions/55703316/audio-from-rtcpeerconnection-is-not-audible-after-processing-in-audiocontext
   *   this._audioEl = new Audio();
   *   this._audioEl.setAttribute("autoplay", "autoplay");
   *   this._audioEl.setAttribute("playsinline", "playsinline");
   *   this._audioEl.srcObject = ms;
   *   this._audioEl.muted = true;
   *
   *   this._audio.setMediaStreamSource(ms);
   * }
   * ```
   */
  onVoiceMediaStream(ms: MediaStream): void;
  /**
   * Receive avatar changes.
   * @param avatarData - Serialized avatar data.
   */
  changeAvatar(avatarData: Uint8Array): void;
  /**
   * Releases all resources allocated by this instance.
   */
  dispose(): void;
  /**
   * Callback method to retrieve the Stream to receive detailed information.
   * This stream is used to receive hand and head movements, facial expressions, etc
   * see: {@link Player.onRequestDetailStream}
   */
  onDetailStream(data:Uint8Array): void;
};
/**
* Factory class for {@link OtherPerson}.
* It must be created by the user of {@link Verse}.
*
* @remarks
* `create` is called each time a connection is made with another player to be displayed.  
*/
export interface OtherPersonFactory {
  /**
   * Create {@link OtherPerson}.
   *
   * @param sessionIdStr - Uniquely identifying ID.  The same user will have a different ID each time they connect.
   * @param avatar - Avatar data passed by {@link Player.getAvatar}.
   * @param position_x - Position passed by {@link Player.getPosition}.
   * @param position_y - Position passed by {@link Player.getPosition}.
   * @param position_z - Position passed by {@link Player.getPosition}.
   * @param angle - Frontal orientation passed in {@link Player.getAngle}.
   */
  create(
    sessionIdStr: string,
    avatar: Uint8Array,
    position_x: number,
    position_y: number,
    position_z: number,
    angle: number
  ): OtherPerson;
};



export interface VerseOptions {
    /**
     * Maximum number of people to display. Default is 10.
     * @remarks
     * It only limits the number of displays; the number of users that can exist in the same space is unlimited regardless of this value.
     */
    maxNumberOfPeople?: number;
    /**
     * Maximum size of avatar file. Default is 1024 * 1024 * 32 (32MB).
     */
    maxAvatarFileSize?: number;

    /**
     * Maximum number of parallel file transfers. Default is 1 (send = 1 and receive = 1).
     */
    maxNumberOfParallelFileTransfers?: number;
    /**
     * The `rtc_configuration` parameter is a parameter of the constructor of  {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection | RTCPeerConnection}. It is mainly used to configure `iceServers` and `certificates`.
     */
    rtcConfiguration?: RTCConfiguration;
    /**
     * log level. Default is `info`.
     *
     * @remarks
     * see {@link https://docs.rs/log/latest/log/enum.Level.html | log::Level}
     */
    logLevel?: string;
}


/**
* Stream for sending player details.
* see: {@link Player.onRequestDetailStream}
*/
export class DetailInputStream {
/**
* The free function is required to be invoked to deallocate resources on the WebAssembly side of things.
*/
  free(): void;
/**
*/
  close(): void;
/**
* @param {Uint8Array} data
*/
  send(data: Uint8Array): void;
}
/**
* Factory class for {@link DetailInputStream}.
* see: {@link Player.onRequestDetailStream}
*/
export class DetailInputStreamFactory {
/**
* The free function is required to be invoked to deallocate resources on the WebAssembly side of things.
*/
  free(): void;
/**
* Create a stream for sending detailed information.
* see: {@link Player.onRequestDetailStream}
* @returns {Promise<DetailInputStream>}
*/
  create(): Promise<DetailInputStream>;
}
/**
* VerseEngine - Web-based Metaverse Engine on P2P overlay network.
*
* To use this class, three classes must be implemented: {@link Player}, {@link OtherPersonFactory}, and {@link OtherPerson}.
*
* @example
* ```ts
* import verseInit, * as VerseCore from "verse-core";
*
* ...
*
* async function start() {
*   // Initialize by specifying the URL of the WebAssembly file.
*   await verseInit("./assets/verse_core_bg.wasm");
*
*   const verse = VerseCore.Verse.new(
*     "https://entrance.verseengine.cloud",
*     player,
*     new OtherPersonFactory(scene, adapter),
*     {
*       // WebRTC settings to connect to overlay network.
*       iceServers: [
*         { urls: "stun:stun.l.google.com:19302" },
*         { urls: "stun:stun1.l.google.com:19302" },
*       ],
*     } as RTCConfiguration,
*   );
*   await verse.start();
* }
* ```
*/
export class Verse {
/**
* The free function is required to be invoked to deallocate resources on the WebAssembly side of things.
*/
  free(): void;
/**
* @param {string} entrance_server_url
* @param {Player} player
* @param {OtherPersonFactory} other_person_factory
* @param {VerseOptions | undefined} options
* @returns {Verse}
*/
  static new(entrance_server_url: string, player: Player, other_person_factory: OtherPersonFactory, options?: VerseOptions): Verse;
/**
* Setting up a microphone for voice chat.
*
* @remarks
* When calling {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia | navigator.mediaDevices.getUserMedia}, set the parameter to the `audio` property.
*
* see: {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia |
* MediaDevices.getUserMedia}, {@link
* https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints | MediaDevices.getSupportedConstraints}, {@link
* https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings | MediaTrackSettings },
* {@link
* https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Constraints
* | Capabilities, constraints, and settings}
*
* @example
* ```ts
* verse.setMicAudioConstraints({
*   channelCount: 1
* });
* ```
*
* ```ts
* verse.setMicAudioConstraints(true);
* ```
*
* ```ts
* verse.setMicAudioConstraints({
*   channelCount: 1,
*   echoCancellation: false
* });
* ```
* @param {any} audio_constraints
*/
  setMicAudioConstraints(audio_constraints: any): void;
/**
* Get microphone ON/OFF.
* @returns {boolean}
*/
  isMicOn(): boolean;
/**
* Turn on the microphone.
* @returns {Promise<MediaStream | undefined>}
*/
  micOn(): Promise<MediaStream | undefined>;
/**
* Turn off the microphone.
*/
  micOff(): void;
/**
* Voice receive ON/OFF.
* @returns {boolean}
*/
  isSpeakerOn(): boolean;
/**
* Turn on the voice receive.
*/
  speakerOn(): void;
/**
* Turn off the voice receive.
*/
  speakerOff(): void;
/**
* Start connecting to the network.
* @returns {Promise<void>}
*/
  start(): Promise<void>;
/**
* For debugging.
* @returns {string}
*/
  getDebugStatus(): string;
/**
* For debugging.
* @returns {string}
*/
  getDebugDistance(): string;
/**
* Maximum size of avatar file.
*/
  readonly maxAvatarFileSize: number;
/**
* Maximum number of people to display
*/
  readonly maxNumberOfPeople: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly detailinputstreamfactory_create: (a: number) => number;
  readonly detailinputstream_close: (a: number) => void;
  readonly detailinputstream_send: (a: number, b: number) => void;
  readonly __wbg_detailinputstream_free: (a: number) => void;
  readonly __wbg_verse_free: (a: number) => void;
  readonly verse_new: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly verse_setMicAudioConstraints: (a: number, b: number) => void;
  readonly verse_isMicOn: (a: number) => number;
  readonly verse_micOn: (a: number) => number;
  readonly verse_micOff: (a: number) => void;
  readonly verse_isSpeakerOn: (a: number) => number;
  readonly verse_speakerOn: (a: number) => void;
  readonly verse_speakerOff: (a: number) => void;
  readonly verse_start: (a: number) => number;
  readonly verse_maxAvatarFileSize: (a: number) => number;
  readonly verse_maxNumberOfPeople: (a: number) => number;
  readonly verse_getDebugStatus: (a: number, b: number) => void;
  readonly verse_getDebugDistance: (a: number, b: number) => void;
  readonly __wbg_detailinputstreamfactory_free: (a: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h951b505c4f39d0d8: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h48019296ec03b594: (a: number, b: number, c: number) => void;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h85133af50af7580c: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
