let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_32(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h951b505c4f39d0d8(arg0, arg1);
}

function __wbg_adapter_35(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h48019296ec03b594(arg0, arg1, addHeapObject(arg2));
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
function __wbg_adapter_90(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h85133af50af7580c(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
* Stream for sending player details.
* see: {@link Player.onRequestDetailStream}
*/
export class DetailInputStream {

    static __wrap(ptr) {
        const obj = Object.create(DetailInputStream.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_detailinputstream_free(ptr);
    }
    /**
    */
    close() {
        wasm.detailinputstream_close(this.ptr);
    }
    /**
    * @param {Uint8Array} data
    */
    send(data) {
        wasm.detailinputstream_send(this.ptr, addHeapObject(data));
    }
}
/**
* Factory class for {@link DetailInputStream}.
* see: {@link Player.onRequestDetailStream}
*/
export class DetailInputStreamFactory {

    static __wrap(ptr) {
        const obj = Object.create(DetailInputStreamFactory.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_detailinputstreamfactory_free(ptr);
    }
    /**
    * Create a stream for sending detailed information.
    * see: {@link Player.onRequestDetailStream}
    * @returns {Promise<DetailInputStream>}
    */
    create() {
        const ret = wasm.detailinputstreamfactory_create(this.ptr);
        return takeObject(ret);
    }
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

    static __wrap(ptr) {
        const obj = Object.create(Verse.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_verse_free(ptr);
    }
    /**
    * @param {string} entrance_server_url
    * @param {Player} player
    * @param {OtherPersonFactory} other_person_factory
    * @param {VerseOptions | undefined} options
    * @returns {Verse}
    */
    static new(entrance_server_url, player, other_person_factory, options) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(entrance_server_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.verse_new(retptr, ptr0, len0, addHeapObject(player), addHeapObject(other_person_factory), isLikeNone(options) ? 0 : addHeapObject(options));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Verse.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    setMicAudioConstraints(audio_constraints) {
        wasm.verse_setMicAudioConstraints(this.ptr, addHeapObject(audio_constraints));
    }
    /**
    * Get microphone ON/OFF.
    * @returns {boolean}
    */
    isMicOn() {
        const ret = wasm.verse_isMicOn(this.ptr);
        return ret !== 0;
    }
    /**
    * Turn on the microphone.
    * @returns {Promise<MediaStream | undefined>}
    */
    micOn() {
        const ret = wasm.verse_micOn(this.ptr);
        return takeObject(ret);
    }
    /**
    * Turn off the microphone.
    */
    micOff() {
        wasm.verse_micOff(this.ptr);
    }
    /**
    * Voice receive ON/OFF.
    * @returns {boolean}
    */
    isSpeakerOn() {
        const ret = wasm.verse_isSpeakerOn(this.ptr);
        return ret !== 0;
    }
    /**
    * Turn on the voice receive.
    */
    speakerOn() {
        wasm.verse_speakerOn(this.ptr);
    }
    /**
    * Turn off the voice receive.
    */
    speakerOff() {
        wasm.verse_speakerOff(this.ptr);
    }
    /**
    * Start connecting to the network.
    * @returns {Promise<void>}
    */
    start() {
        const ret = wasm.verse_start(this.ptr);
        return takeObject(ret);
    }
    /**
    * Maximum size of avatar file.
    * @returns {number}
    */
    get maxAvatarFileSize() {
        const ret = wasm.verse_maxAvatarFileSize(this.ptr);
        return ret >>> 0;
    }
    /**
    * Maximum number of people to display
    * @returns {number}
    */
    get maxNumberOfPeople() {
        const ret = wasm.verse_maxNumberOfPeople(this.ptr);
        return ret >>> 0;
    }
    /**
    * For debugging.
    * @returns {string}
    */
    getDebugStatus() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.verse_getDebugStatus(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * For debugging.
    * @returns {string}
    */
    getDebugDistance() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.verse_getDebugDistance(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function getImports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_6894564c2c334c42 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_subarray_7526649b91a252a6 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_805f1c3d65988a5a = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_length_27a2afe8ab42b09f = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_crypto_e1d53a1d73fb10b8 = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_process_038c26bf42b093f8 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_ab37218d2f0b24a8 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_080f4b19d15bc1fe = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg_require_78a3dcfbdba9cbce = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_msCrypto_6e7d3e1f92610cbb = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_b56c882b57805732 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbg_get_27fe3dac1c4d0224 = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_e498fbc24f9c1d4f = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_e7c1f827057f6584 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_a09ec664e14b1b81 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_87cbb8506fecf3a9 = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_c85a9259e621f3db = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_newnoargs_2b8b6bd7753c76ba = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_95d1ea488d03e4e8 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_9495de66fdbe016b = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_9d3a9ce4282a18a8 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_90(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_cf65c07de34b9a08 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_9fb2f11355ecadf5 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_537b7341ce90bb31 = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_17499e8aa4003ebd = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_get_baf4855f9a986186 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_6aa458a4ebdb65cb = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_parse_3ac95b51fc312db8 = function() { return handleError(function (arg0, arg1) {
        const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_stringify_029a979dfb73aa17 = function() { return handleError(function (arg0) {
        const ret = JSON.stringify(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_20cbc34131e76824 = function(arg0, arg1, arg2) {
        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbg_target_b629c177f9bee3da = function(arg0) {
        const ret = getObject(arg0).target;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_RtcDataChannel_dd738864c3b1145d = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof RTCDataChannel;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_data_af909e5dfe73e68c = function(arg0) {
        const ret = getObject(arg0).data;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_MediaStreamTrack_e46721ac3060f259 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof MediaStreamTrack;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_streams_52999e1de6fb52f7 = function(arg0) {
        const ret = getObject(arg0).streams;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_clone_386ad5d2e77063be = function(arg0) {
        const ret = getObject(arg0).clone();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setenabled_1459ab00e4867caf = function(arg0, arg1) {
        getObject(arg0).enabled = arg1 !== 0;
    };
    imports.wbg.__wbg_addTrack_c08804f021b0a2d4 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).addTrack(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createAnswer_c180806649ebb9aa = function(arg0) {
        const ret = getObject(arg0).createAnswer();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_onDetailStream_74dafd5a0ce4a206 = function(arg0, arg1) {
        getObject(arg0).onDetailStream(takeObject(arg1));
    };
    imports.wbg.__wbg_moveTo_6e1637fa7a542fd1 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).moveTo(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_getTextData_778189438f9624c1 = function(arg0, arg1) {
        const ret = getObject(arg1).getTextData();
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getTime_7c59072d1651a3cf = function(arg0) {
        const ret = getObject(arg0).getTime();
        return ret;
    };
    imports.wbg.__wbg_byteLength_29d6f6f493852fd4 = function(arg0) {
        const ret = getObject(arg0).byteLength;
        return ret;
    };
    imports.wbg.__wbg_changeAvatar_335014b705a6e519 = function(arg0, arg1) {
        getObject(arg0).changeAvatar(takeObject(arg1));
    };
    imports.wbg.__wbg_x_0cfe7bd1e087eba5 = function(arg0) {
        const ret = getObject(arg0).x;
        return ret;
    };
    imports.wbg.__wbg_y_233c1ae844141a92 = function(arg0) {
        const ret = getObject(arg0).y;
        return ret;
    };
    imports.wbg.__wbg_z_304156399cfd41e5 = function(arg0) {
        const ret = getObject(arg0).z;
        return ret;
    };
    imports.wbg.__wbg_sdp_869cbbd7bb8216d2 = function(arg0, arg1) {
        const ret = getObject(arg1).sdp;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_new_f9876326328f45ed = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithstrandinit_c45f0dc6da26fd03 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_headers_ab5251d2727ac41e = function(arg0) {
        const ret = getObject(arg0).headers;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_a5d34c36a1a4ebd1 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).set(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_fetch_465e8cb61a0f43ea = function(arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Response_fb3a4df648c1859b = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Response;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_ok_1cd4c5ee1ccf4e0f = function(arg0) {
        const ret = getObject(arg0).ok;
        return ret;
    };
    imports.wbg.__wbg_text_f61464d781b099f0 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).text();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_status_d483a4ac847f380a = function(arg0) {
        const ret = getObject(arg0).status;
        return ret;
    };
    imports.wbg.__wbg_data_dadd6d1e638279f9 = function(arg0) {
        const ret = getObject(arg0).data;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_of_892d7838f8e4cc20 = function(arg0) {
        const ret = Array.of(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getPosition_8a77b6f848751e22 = function(arg0) {
        const ret = getObject(arg0).getPosition();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getAngle_d5f73818ab61e424 = function(arg0) {
        const ret = getObject(arg0).getAngle();
        return ret;
    };
    imports.wbg.__wbg_getTextDataChanged_d60d270eb238c57b = function(arg0) {
        const ret = getObject(arg0).getTextDataChanged();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_getAvatar_87818b1568c71d16 = function(arg0) {
        const ret = getObject(arg0).getAvatar();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getAvatarChanged_6f1dee285fa8ddae = function(arg0) {
        const ret = getObject(arg0).getAvatarChanged();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_onVoiceMediaStream_f020fb945b0d346b = function(arg0, arg1) {
        getObject(arg0).onVoiceMediaStream(getObject(arg1));
    };
    imports.wbg.__wbg_setTextData_d977c8b70c506f6b = function(arg0, arg1, arg2) {
        getObject(arg0).setTextData(getStringFromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_dispose_06cda88c944ec265 = function(arg0) {
        getObject(arg0).dispose();
    };
    imports.wbg.__wbg_setonopen_dcaae75faea7124b = function(arg0, arg1) {
        getObject(arg0).onopen = getObject(arg1);
    };
    imports.wbg.__wbg_close_07bb5fdad9a8467a = function(arg0) {
        getObject(arg0).close();
    };
    imports.wbg.__wbg_channel_ef4bd13c16471e64 = function(arg0) {
        const ret = getObject(arg0).channel;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_candidate_6713293ca384490f = function(arg0) {
        const ret = getObject(arg0).candidate;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createDataChannel_6b3da5e1ddd9823d = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).createDataChannel(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createDataChannel_b0f767c47a0c0279 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).createDataChannel(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setbufferedAmountLowThreshold_24d7e20d0efc9569 = function(arg0, arg1) {
        getObject(arg0).bufferedAmountLowThreshold = arg1 >>> 0;
    };
    imports.wbg.__wbg_bufferedAmount_1adfc60c43bf853b = function(arg0) {
        const ret = getObject(arg0).bufferedAmount;
        return ret;
    };
    imports.wbg.__wbg_create_09ae4c36a17862e8 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        const ret = getObject(arg0).create(getStringFromWasm0(arg1, arg2), takeObject(arg3), arg4, arg5, arg6, arg7);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_detailinputstream_new = function(arg0) {
        const ret = DetailInputStream.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_clearTimeout_76877dbc010e786d = function(arg0) {
        const ret = clearTimeout(takeObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setTimeout_75cb9b6991a4031d = function() { return handleError(function (arg0, arg1) {
        const ret = setTimeout(getObject(arg0), arg1);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_931686b195a14f9d = function() {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_setTimeout_6609c9aa64f32bfc = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_navigator_b18e629f7f0b75fa = function(arg0) {
        const ret = getObject(arg0).navigator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_mediaDevices_633a6d16702659d4 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).mediaDevices;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getUserMedia_701163d4ef4b0bff = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getUserMedia(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_logLevel_dbce2996d26fa012 = function(arg0, arg1) {
        const ret = getObject(arg1).logLevel;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_location_797a1856892cc2de = function(arg0) {
        const ret = getObject(arg0).location;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_href_bb86bb94d1c6861b = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).href;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    }, arguments) };
    imports.wbg.__wbg_maxNumberOfPeople_d3b0605d3d571d6c = function(arg0, arg1) {
        const ret = getObject(arg1).maxNumberOfPeople;
        getInt32Memory0()[arg0 / 4 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_rtcConfiguration_7882d2dcb73496ae = function(arg0) {
        const ret = getObject(arg0).rtcConfiguration;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_maxAvatarFileSize_3aef83c969d16ca3 = function(arg0, arg1) {
        const ret = getObject(arg1).maxAvatarFileSize;
        getInt32Memory0()[arg0 / 4 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_maxNumberOfParallelFileTransfers_87593b3afab1f9ed = function(arg0, arg1) {
        const ret = getObject(arg1).maxNumberOfParallelFileTransfers;
        getInt32Memory0()[arg0 / 4 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_onRequestDetailStream_a71a8eb043ac2671 = function(arg0, arg1) {
        getObject(arg0).onRequestDetailStream(DetailInputStreamFactory.__wrap(arg1));
    };
    imports.wbg.__wbg_getTracks_56c90db8f141d5e5 = function(arg0) {
        const ret = getObject(arg0).getTracks();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stop_48ebbc51514ffed4 = function(arg0) {
        getObject(arg0).stop();
    };
    imports.wbg.__wbg_removeTrack_424c742c1b09c123 = function(arg0, arg1) {
        getObject(arg0).removeTrack(getObject(arg1));
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_then_f753623316e2873a = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_resolve_fd40f858d9db1a04 = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_ec5db6d509eb475f = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_debug_8db2eed1bf6c1e2a = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__wbg_error_fe807da27c4a4ced = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_info_9e6db45ac337c3b5 = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_log_7bb108d119bafbc1 = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_warn_e57696dbb3977030 = function(arg0) {
        console.warn(getObject(arg0));
    };
    imports.wbg.__wbg_getAudioTracks_55ec6fe02403108d = function(arg0) {
        const ret = getObject(arg0).getAudioTracks();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_iceConnectionState_4027aaedd6c0598d = function(arg0) {
        const ret = getObject(arg0).iceConnectionState;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setonnegotiationneeded_ba991701b0244944 = function(arg0, arg1) {
        getObject(arg0).onnegotiationneeded = getObject(arg1);
    };
    imports.wbg.__wbg_setonicecandidate_8e6cd469d2842dd8 = function(arg0, arg1) {
        getObject(arg0).onicecandidate = getObject(arg1);
    };
    imports.wbg.__wbg_setontrack_61201d51a3bfa3f1 = function(arg0, arg1) {
        getObject(arg0).ontrack = getObject(arg1);
    };
    imports.wbg.__wbg_setoniceconnectionstatechange_942079415b405dc9 = function(arg0, arg1) {
        getObject(arg0).oniceconnectionstatechange = getObject(arg1);
    };
    imports.wbg.__wbg_setondatachannel_3dbcc50677ccf718 = function(arg0, arg1) {
        getObject(arg0).ondatachannel = getObject(arg1);
    };
    imports.wbg.__wbg_newwithconfiguration_8a4c8568e8d4666b = function() { return handleError(function (arg0) {
        const ret = new RTCPeerConnection(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_addIceCandidate_98c76f96c1850ea4 = function(arg0, arg1) {
        const ret = getObject(arg0).addIceCandidate(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createOffer_e6d21ce888801b60 = function(arg0) {
        const ret = getObject(arg0).createOffer();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setLocalDescription_95c37b91edebcd99 = function(arg0, arg1) {
        const ret = getObject(arg0).setLocalDescription(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setRemoteDescription_dc51fc8f9f08b74b = function(arg0, arg1) {
        const ret = getObject(arg0).setRemoteDescription(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_label_454b9cae320305c2 = function(arg0, arg1) {
        const ret = getObject(arg1).label;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_maxRetransmits_e66290477f22080c = function(arg0) {
        const ret = getObject(arg0).maxRetransmits;
        return isLikeNone(ret) ? 0xFFFFFF : ret;
    };
    imports.wbg.__wbg_readyState_1ecd730a15949680 = function(arg0) {
        const ret = getObject(arg0).readyState;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setonerror_3436c88ada7e851d = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_setonclose_6f4f88e48d1545ea = function(arg0, arg1) {
        getObject(arg0).onclose = getObject(arg1);
    };
    imports.wbg.__wbg_setonmessage_e49af4602afd59fe = function(arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    };
    imports.wbg.__wbg_setonbufferedamountlow_6255c9c082e3cb6f = function(arg0, arg1) {
        getObject(arg0).onbufferedamountlow = getObject(arg1);
    };
    imports.wbg.__wbg_setbinaryType_1c8adca804a4c457 = function(arg0, arg1) {
        getObject(arg0).binaryType = takeObject(arg1);
    };
    imports.wbg.__wbg_close_f7e7b85d52240ab9 = function(arg0) {
        getObject(arg0).close();
    };
    imports.wbg.__wbg_send_111a5409e76ff296 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_instanceof_Window_e266f02eee43b570 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_candidate_5807aafabae3b03d = function(arg0, arg1) {
        const ret = getObject(arg1).candidate;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_closure_wrapper787 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 33, __wbg_adapter_32);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1792 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 74, __wbg_adapter_35);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1798 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 74, __wbg_adapter_35);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1801 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 74, __wbg_adapter_35);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1804 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 74, __wbg_adapter_35);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1807 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 74, __wbg_adapter_35);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper2243 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 33, __wbg_adapter_35);
        return addHeapObject(ret);
    };

    return imports;
}

function initMemory(imports, maybe_memory) {

}

function finalizeInit(instance, module) {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    cachedFloat64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    const imports = getImports();

    initMemory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return finalizeInit(instance, module);
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('verse_core_bg.wasm', import.meta.url);
    }
    const imports = getImports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    initMemory(imports);

    const { instance, module } = await load(await input, imports);

    return finalizeInit(instance, module);
}

export { initSync }
export default init;
