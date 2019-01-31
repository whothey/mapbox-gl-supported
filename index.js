'use strict';

if (typeof module !== 'undefined' && module.exports) {
    module.exports = isSupported;
} else if (window) {
    window.mapboxgl = window.mapboxgl || {};
    window.mapboxgl.supported = isSupported;
}

/**
 * Test whether the current browser supports Mapbox GL JS
 * @param {Object} options
 * @param {boolean} [options.failIfMajorPerformanceCaveat=false] Return `false`
 *   if the performance of Mapbox GL JS would be dramatically worse than
 *   expected (i.e. a software renderer is would be used)
 * @return {boolean}
 */
function isSupported(options) {
    return !!(
        isBrowser() &&
        isArraySupported() &&
        isFunctionSupported() &&
        isObjectSupported() &&
        isJSONSupported() &&
        isWorkerSupported() &&
        isUint8ClampedArraySupported() &&
        isArrayBufferSupported() &&
        isWebGLSupportedCached(options && options.failIfMajorPerformanceCaveat)
    );
}

function isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

var arrayValidations = {
  'Array.prototype': Array.prototype,
  'Array.prototype.every': Array.prototype.every,
  'Array.prototype.filter': Array.prototype.filter,
  'Array.prototype.forEach': Array.prototype.forEach,
  'Array.prototype.indexOf': Array.prototype.indexOf,
  'Array.prototype.lastIndexOf': Array.prototype.lastIndexOf,
  'Array.prototype.map': Array.prototype.map,
  'Array.prototype.some': Array.prototype.some,
  'Array.prototype.reduce': Array.prototype.reduce,
  'Array.prototype.reduceRight': Array.prototype.reduceRight,
  'Array.isArray': Array.isArray
};

function isArraySupported() {
  return Object.keys(arrayValidations).every(x => !!arrayValidations[x]);
}

function isFunctionSupported() {
    return Function.prototype && Function.prototype.bind;
}

var objectValidations = {
  'Object.keys': Object.keys,
  'Object.create': Object.create,
  'Object.getPrototypeOf': Object.getPrototypeOf,
  'Object.getOwnPropertyNames': Object.getOwnPropertyNames,
  'Object.isSealed': Object.isSealed,
  'Object.isFrozen': Object.isFrozen,
  'Object.isExtensible': Object.isExtensible,
  'Object.getOwnPropertyDescriptor': Object.getOwnPropertyDescriptor,
  'Object.defineProperty': Object.defineProperty,
  'Object.defineProperties': Object.defineProperties,
  'Object.seal': Object.seal,
  'Object.freeze': Object.freeze,
  'Object.preventExtension': Object.preventExtensions
};

function isObjectSupported() {
  return Object.keys(objectValidations).every(x => !!objectValidations[x]);
}

function isJSONSupported() {
    return 'JSON' in window && 'parse' in JSON && 'stringify' in JSON;
}

function isWorkerSupported() {
    if (!('Worker' in window && 'Blob' in window && 'URL' in window)) {
        return false;
    }

    var blob = new Blob([''], { type: 'text/javascript' });
    var workerURL = URL.createObjectURL(blob);
    var supported;
    var worker;

    try {
        worker = new Worker(workerURL);
        supported = true;
    } catch (e) {
        supported = false;
    }

    if (worker) {
        worker.terminate();
    }
    URL.revokeObjectURL(workerURL);

    return supported;
}

// IE11 only supports `Uint8ClampedArray` as of version
// [KB2929437](https://support.microsoft.com/en-us/kb/2929437)
function isUint8ClampedArraySupported() {
    return 'Uint8ClampedArray' in window;
}

// https://github.com/mapbox/mapbox-gl-supported/issues/19
function isArrayBufferSupported() {
    return ArrayBuffer.isView;
}

var isWebGLSupportedCache = {};
function isWebGLSupportedCached(failIfMajorPerformanceCaveat) {

    if (isWebGLSupportedCache[failIfMajorPerformanceCaveat] === undefined) {
        isWebGLSupportedCache[failIfMajorPerformanceCaveat] = isWebGLSupported(failIfMajorPerformanceCaveat);
    }

    return isWebGLSupportedCache[failIfMajorPerformanceCaveat];
}

isSupported.webGLContextAttributes = {
    antialias: false,
    alpha: true,
    stencil: true,
    depth: true
};

function isWebGLSupported(failIfMajorPerformanceCaveat) {

    var canvas = document.createElement('canvas');

    var attributes = Object.create(isSupported.webGLContextAttributes);
    attributes.failIfMajorPerformanceCaveat = failIfMajorPerformanceCaveat;

    if (canvas.probablySupportsContext) {
        return (
            canvas.probablySupportsContext('webgl', attributes) ||
            canvas.probablySupportsContext('experimental-webgl', attributes)
        );

    } else if (canvas.supportsContext) {
        return (
            canvas.supportsContext('webgl', attributes) ||
            canvas.supportsContext('experimental-webgl', attributes)
        );

    } else {
        return (
            canvas.getContext('webgl', attributes) ||
            canvas.getContext('experimental-webgl', attributes)
        );
    }
}
