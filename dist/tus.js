(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tus = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fingerprint;

var _isReactNative = require("./isReactNative");

var _isReactNative2 = _interopRequireDefault(_isReactNative);

var _isCordova = require("./isCordova");

var _isCordova2 = _interopRequireDefault(_isCordova);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Generate a fingerprint for a file which will be used the store the endpoint
 *
 * @param {File} file
 * @param {Object} options
 * @param {Function} callback
 */
function fingerprint(file, options, callback) {
  if ((0, _isCordova2.default)()) {
    return callback(new Error("Fingerprint cannot be computed for file input type"));
  }

  if (_isReactNative2.default) {
    return callback(null, reactNativeFingerprint(file, options));
  }

  return callback(null, ["tus-br", file.name, file.type, file.size, file.lastModified, options.endpoint].join("-"));
}

function reactNativeFingerprint(file, options) {
  var exifHash = file.exif ? hashCode(JSON.stringify(file.exif)) : "noexif";
  return ["tus-rn", file.name || "noname", file.size || "nosize", exifHash, options.endpoint].join("/");
}

function hashCode(str) {
  // from https://stackoverflow.com/a/8831937/151666
  var hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

},{"./isCordova":2,"./isReactNative":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var isCordova = function isCordova() {
  return typeof window != "undefined" && (typeof window.PhoneGap != "undefined" || typeof window.Cordova != "undefined" || typeof window.cordova != "undefined");
};

exports.default = isCordova;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var isReactNative = typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";

exports.default = isReactNative;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * readAsByteArray converts a File object to a Uint8Array.
 * This function is only used on the Apache Cordova platform.
 * See https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#read-a-file
 */
function readAsByteArray(chunk, callback) {
  var reader = new FileReader();
  reader.onload = function () {
    callback(null, new Uint8Array(reader.result));
  };
  reader.onerror = function (err) {
    callback(err);
  };
  reader.readAsArrayBuffer(chunk);
}

exports.default = readAsByteArray;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.newRequest = newRequest;
exports.resolveUrl = resolveUrl;

var _urlParse = require("url-parse");

var _urlParse2 = _interopRequireDefault(_urlParse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function newRequest() {
  return new window.XMLHttpRequest();
} /* global window */
function resolveUrl(origin, link) {
  return new _urlParse2.default(link, origin).toString();
}

},{"url-parse":16}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getSource = getSource;

var _isReactNative = require("./isReactNative");

var _isReactNative2 = _interopRequireDefault(_isReactNative);

var _uriToBlob = require("./uriToBlob");

var _uriToBlob2 = _interopRequireDefault(_uriToBlob);

var _isCordova = require("./isCordova");

var _isCordova2 = _interopRequireDefault(_isCordova);

var _readAsByteArray = require("./readAsByteArray");

var _readAsByteArray2 = _interopRequireDefault(_readAsByteArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileSource = function () {
  function FileSource(file) {
    _classCallCheck(this, FileSource);

    this._file = file;
    this.size = file.size;
  }

  _createClass(FileSource, [{
    key: "slice",
    value: function slice(start, end, callback) {
      // In Apache Cordova applications, a File must be resolved using
      // FileReader instances, see
      // https://cordova.apache.org/docs/en/8.x/reference/cordova-plugin-file/index.html#read-a-file
      if ((0, _isCordova2.default)()) {
        (0, _readAsByteArray2.default)(this._file.slice(start, end), function (err, chunk) {
          if (err) return callback(err);

          callback(null, chunk);
        });
        return;
      }

      callback(null, this._file.slice(start, end));
    }
  }, {
    key: "close",
    value: function close() {}
  }]);

  return FileSource;
}();

var StreamSource = function () {
  function StreamSource(reader, chunkSize) {
    _classCallCheck(this, StreamSource);

    this._chunkSize = chunkSize;
    this._buffer = undefined;
    this._bufferOffset = 0;
    this._reader = reader;
    this._done = false;
  }

  _createClass(StreamSource, [{
    key: "slice",
    value: function slice(start, end, callback) {
      if (start < this._bufferOffset) {
        callback(new Error("Requested data is before the reader's current offset"));
        return;
      }

      return this._readUntilEnoughDataOrDone(start, end, callback);
    }
  }, {
    key: "_readUntilEnoughDataOrDone",
    value: function _readUntilEnoughDataOrDone(start, end, callback) {
      var _this = this;

      var hasEnoughData = end <= this._bufferOffset + len(this._buffer);
      if (this._done || hasEnoughData) {
        var value = this._getDataFromBuffer(start, end);
        callback(null, value, value == null ? this._done : false);
        return;
      }
      this._reader.read().then(function (_ref) {
        var value = _ref.value,
            done = _ref.done;

        if (done) {
          _this._done = true;
        } else if (_this._buffer === undefined) {
          _this._buffer = value;
        } else {
          _this._buffer = concat(_this._buffer, value);
        }

        _this._readUntilEnoughDataOrDone(start, end, callback);
      }).catch(function (err) {
        callback(new Error("Error during read: " + err));
      });
    }
  }, {
    key: "_getDataFromBuffer",
    value: function _getDataFromBuffer(start, end) {
      // Remove data from buffer before `start`.
      // Data might be reread from the buffer if an upload fails, so we can only
      // safely delete data when it comes *before* what is currently being read.
      if (start > this._bufferOffset) {
        this._buffer = this._buffer.slice(start - this._bufferOffset);
        this._bufferOffset = start;
      }
      // If the buffer is empty after removing old data, all data has been read.
      var hasAllDataBeenRead = len(this._buffer) === 0;
      if (this._done && hasAllDataBeenRead) {
        return null;
      }
      // We already removed data before `start`, so we just return the first
      // chunk from the buffer.
      return this._buffer.slice(0, end - start);
    }
  }, {
    key: "close",
    value: function close() {
      if (this._reader.cancel) {
        this._reader.cancel();
      }
    }
  }]);

  return StreamSource;
}();

function len(blobOrArray) {
  if (blobOrArray === undefined) return 0;
  if (blobOrArray.size !== undefined) return blobOrArray.size;
  return blobOrArray.length;
}

/*
  Typed arrays and blobs don't have a concat method.
  This function helps StreamSource accumulate data to reach chunkSize.
*/
function concat(a, b) {
  if (a.concat) {
    // Is `a` an Array?
    return a.concat(b);
  }
  if (a instanceof Blob) {
    return new Blob([a, b], { type: a.type });
  }
  if (a.set) {
    // Is `a` a typed array?
    var c = new a.constructor(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
  }
  throw new Error("Unknown data type");
}

function getSource(input, chunkSize, callback) {
  // In React Native, when user selects a file, instead of a File or Blob,
  // you usually get a file object {} with a uri property that contains
  // a local path to the file. We use XMLHttpRequest to fetch
  // the file blob, before uploading with tus.
  // TODO: The __tus__forceReactNative property is currently used to force
  // a React Native environment during testing. This should be removed
  // once we move away from PhantomJS and can overwrite navigator.product
  // properly.
  if ((_isReactNative2.default || window.__tus__forceReactNative) && input && typeof input.uri !== "undefined") {
    (0, _uriToBlob2.default)(input.uri, function (err, blob) {
      if (err) {
        return callback(new Error("tus: cannot fetch `file.uri` as Blob, make sure the uri is correct and accessible. " + err));
      }
      callback(null, new FileSource(blob));
    });
    return;
  }

  // Since we emulate the Blob type in our tests (not all target browsers
  // support it), we cannot use `instanceof` for testing whether the input value
  // can be handled. Instead, we simply check is the slice() function and the
  // size property are available.
  if (typeof input.slice === "function" && typeof input.size !== "undefined") {
    callback(null, new FileSource(input));
    return;
  }

  if (typeof input.read === "function") {
    chunkSize = +chunkSize;
    if (!isFinite(chunkSize)) {
      callback(new Error("cannot create source for stream without a finite value for the `chunkSize` option"));
      return;
    }
    callback(null, new StreamSource(input, chunkSize));
    return;
  }

  callback(new Error("source object may only be an instance of File, Blob, or Reader in this environment"));
}

},{"./isCordova":2,"./isReactNative":3,"./readAsByteArray":4,"./uriToBlob":8}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getStorage = getStorage;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global window, localStorage */

var hasStorage = false;
try {
  hasStorage = "localStorage" in window;

  // Attempt to store and read entries from the local storage to detect Private
  // Mode on Safari on iOS (see #49)
  var key = "tusSupport";
  localStorage.setItem(key, localStorage.getItem(key));
} catch (e) {
  // If we try to access localStorage inside a sandboxed iframe, a SecurityError
  // is thrown. When in private mode on iOS Safari, a QuotaExceededError is
  // thrown (see #49)
  if (e.code === e.SECURITY_ERR || e.code === e.QUOTA_EXCEEDED_ERR) {
    hasStorage = false;
  } else {
    throw e;
  }
}

var canStoreURLs = exports.canStoreURLs = hasStorage;

var LocalStorage = function () {
  function LocalStorage() {
    _classCallCheck(this, LocalStorage);
  }

  _createClass(LocalStorage, [{
    key: "setItem",
    value: function setItem(key, value, cb) {
      cb(null, localStorage.setItem(key, value));
    }
  }, {
    key: "getItem",
    value: function getItem(key, cb) {
      cb(null, localStorage.getItem(key));
    }
  }, {
    key: "removeItem",
    value: function removeItem(key, cb) {
      cb(null, localStorage.removeItem(key));
    }
  }]);

  return LocalStorage;
}();

function getStorage() {
  return hasStorage ? new LocalStorage() : null;
}

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * uriToBlob resolves a URI to a Blob object. This is used for
 * React Native to retrieve a file (identified by a file://
 * URI) as a blob.
 */
function uriToBlob(uri, done) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = "blob";
  xhr.onload = function () {
    var blob = xhr.response;
    done(null, blob);
  };
  xhr.onerror = function (err) {
    done(err);
  };
  xhr.open("GET", uri);
  xhr.send();
}

exports.default = uriToBlob;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DetailedError = function (_Error) {
  _inherits(DetailedError, _Error);

  function DetailedError(error) {
    var causingErr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var xhr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, DetailedError);

    var _this = _possibleConstructorReturn(this, (DetailedError.__proto__ || Object.getPrototypeOf(DetailedError)).call(this, error.message));

    _this.originalRequest = xhr;
    _this.causingError = causingErr;

    var message = error.message;
    if (causingErr != null) {
      message += ", caused by " + causingErr.toString();
    }
    if (xhr != null) {
      message += ", originated from request (response code: " + xhr.status + ", response text: " + xhr.responseText + ")";
    }
    _this.message = message;
    return _this;
  }

  return DetailedError;
}(Error);

exports.default = DetailedError;

},{}],10:[function(require,module,exports){
"use strict";

var _upload = require("./upload");

var _upload2 = _interopRequireDefault(_upload);

var _storage = require("./node/storage");

var storage = _interopRequireWildcard(_storage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global window */
var defaultOptions = _upload2.default.defaultOptions;


var moduleExport = {
  Upload: _upload2.default,
  canStoreURLs: storage.canStoreURLs,
  defaultOptions: defaultOptions
};

if (typeof window !== "undefined") {
  // Browser environment using XMLHttpRequest
  var _window = window,
      XMLHttpRequest = _window.XMLHttpRequest,
      Blob = _window.Blob;


  moduleExport.isSupported = XMLHttpRequest && Blob && typeof Blob.prototype.slice === "function";
} else {
  // Node.js environment using http module
  moduleExport.isSupported = true;
  // make FileStorage module available as it will not be set by default.
  moduleExport.FileStorage = storage.FileStorage;
}

// The usage of the commonjs exporting syntax instead of the new ECMAScript
// one is actually inteded and prevents weird behaviour if we are trying to
// import this module in another module using Babel.
module.exports = moduleExport;

},{"./node/storage":7,"./upload":11}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window */


// We import the files used inside the Node environment which are rewritten
// for browsers using the rules defined in the package.json


var _error = require("./error");

var _error2 = _interopRequireDefault(_error);

var _extend = require("extend");

var _extend2 = _interopRequireDefault(_extend);

var _jsBase = require("js-base64");

var _request = require("./node/request");

var _source = require("./node/source");

var _storage = require("./node/storage");

var _fingerprint = require("./node/fingerprint");

var _fingerprint2 = _interopRequireDefault(_fingerprint);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultOptions = {
  endpoint: null,
  fingerprint: _fingerprint2.default,
  resume: true,
  onProgress: null,
  onChunkComplete: null,
  onSuccess: null,
  onError: null,
  headers: {},
  chunkSize: Infinity,
  withCredentials: false,
  uploadUrl: null,
  uploadSize: null,
  overridePatchMethod: false,
  retryDelays: null,
  removeFingerprintOnSuccess: false,
  uploadLengthDeferred: false,
  urlStorage: null,
  fileReader: null
};

var Upload = function () {
  function Upload(file, options) {
    _classCallCheck(this, Upload);

    this.options = (0, _extend2.default)(true, {}, defaultOptions, options);

    // The storage module used to store URLs
    this._storage = this.options.urlStorage;

    // The underlying File/Blob object
    this.file = file;

    // The URL against which the file will be uploaded
    this.url = null;

    // The underlying XHR object for the current PATCH request
    this._xhr = null;

    // The fingerpinrt for the current file (set after start())
    this._fingerprint = null;

    // The offset used in the current PATCH request
    this._offset = null;

    // True if the current PATCH request has been aborted
    this._aborted = false;

    // The file's size in bytes
    this._size = null;

    // The Source object which will wrap around the given file and provides us
    // with a unified interface for getting its size and slice chunks from its
    // content allowing us to easily handle Files, Blobs, Buffers and Streams.
    this._source = null;

    // The current count of attempts which have been made. Null indicates none.
    this._retryAttempt = 0;

    // The timeout's ID which is used to delay the next retry
    this._retryTimeout = null;

    // The offset of the remote upload before the latest attempt was started.
    this._offsetBeforeRetry = 0;
  }

  _createClass(Upload, [{
    key: "start",
    value: function start() {
      var _this = this;

      var file = this.file;

      if (!file) {
        this._emitError(new Error("tus: no file or stream to upload provided"));
        return;
      }

      if (!this.options.endpoint && !this.options.uploadUrl) {
        this._emitError(new Error("tus: neither an endpoint or an upload URL is provided"));
        return;
      }

      if (this.options.resume && this._storage == null) {
        this._storage = (0, _storage.getStorage)();
      }

      if (this._source) {
        this._start(this._source);
      } else {
        var fileReader = this.options.fileReader || _source.getSource;
        fileReader(file, this.options.chunkSize, function (err, source) {
          if (err) {
            _this._emitError(err);
            return;
          }

          _this._source = source;
          _this._start(source);
        });
      }
    }
  }, {
    key: "_start",
    value: function _start(source) {
      var _this2 = this;

      var file = this.file;

      // First, we look at the uploadLengthDeferred option.
      // Next, we check if the caller has supplied a manual upload size.
      // Finally, we try to use the calculated size from the source object.
      if (this.options.uploadLengthDeferred) {
        this._size = null;
      } else if (this.options.uploadSize != null) {
        this._size = +this.options.uploadSize;
        if (isNaN(this._size)) {
          this._emitError(new Error("tus: cannot convert `uploadSize` option into a number"));
          return;
        }
      } else {
        this._size = source.size;
        if (this._size == null) {
          this._emitError(new Error("tus: cannot automatically derive upload's size from input and must be specified manually using the `uploadSize` option"));
          return;
        }
      }

      var retryDelays = this.options.retryDelays;
      if (retryDelays != null) {
        if (Object.prototype.toString.call(retryDelays) !== "[object Array]") {
          this._emitError(new Error("tus: the `retryDelays` option must either be an array or null"));
          return;
        } else {
          var errorCallback = this.options.onError;
          this.options.onError = function (err) {
            // Restore the original error callback which may have been set.
            _this2.options.onError = errorCallback;

            // We will reset the attempt counter if
            // - we were already able to connect to the server (offset != null) and
            // - we were able to upload a small chunk of data to the server
            var shouldResetDelays = _this2._offset != null && _this2._offset > _this2._offsetBeforeRetry;
            if (shouldResetDelays) {
              _this2._retryAttempt = 0;
            }

            var isOnline = true;
            if (typeof window !== "undefined" && "navigator" in window && window.navigator.onLine === false) {
              isOnline = false;
            }

            // We only attempt a retry if
            // - we didn't exceed the maxium number of retries, yet, and
            // - this error was caused by a request or it's response and
            // - the error is server error (i.e. no a status 4xx or a 409 or 423) and
            // - the browser does not indicate that we are offline
            var status = err.originalRequest ? err.originalRequest.status : 0;
            var isServerError = !inStatusCategory(status, 400) || status === 409 || status === 423;
            var shouldRetry = _this2._retryAttempt < retryDelays.length && err.originalRequest != null && isServerError && isOnline;

            if (!shouldRetry) {
              _this2._emitError(err);
              return;
            }

            var delay = retryDelays[_this2._retryAttempt++];

            _this2._offsetBeforeRetry = _this2._offset;
            _this2.options.uploadUrl = _this2.url;

            _this2._retryTimeout = setTimeout(function () {
              _this2.start();
            }, delay);
          };
        }
      }

      // Reset the aborted flag when the upload is started or else the
      // _startUpload will stop before sending a request if the upload has been
      // aborted previously.
      this._aborted = false;

      // The upload had been started previously and we should reuse this URL.
      if (this.url != null) {
        this._resumeUpload();
        return;
      }

      // A URL has manually been specified, so we try to resume
      if (this.options.uploadUrl != null) {
        this.url = this.options.uploadUrl;
        this._resumeUpload();
        return;
      }

      // Try to find the endpoint for the file in the storage
      if (this._hasStorage()) {
        this.options.fingerprint(file, this.options, function (err, fingerprintValue) {
          if (err) {
            _this2._emitError(err);
            return;
          }

          _this2._fingerprint = fingerprintValue;
          _this2._storage.getItem(_this2._fingerprint, function (err, resumedUrl) {
            if (err) {
              _this2._emitError(err);
              return;
            }

            if (resumedUrl != null) {
              _this2.url = resumedUrl;
              _this2._resumeUpload();
            } else {
              _this2._createUpload();
            }
          });
        });
      } else {
        // An upload has not started for the file yet, so we start a new one
        this._createUpload();
      }
    }
  }, {
    key: "abort",
    value: function abort() {
      if (this._xhr !== null) {
        this._xhr.abort();
        this._source.close();
      }
      this._aborted = true;

      if (this._retryTimeout != null) {
        clearTimeout(this._retryTimeout);
        this._retryTimeout = null;
      }
    }
  }, {
    key: "_hasStorage",
    value: function _hasStorage() {
      return this.options.resume && this._storage;
    }
  }, {
    key: "_emitXhrError",
    value: function _emitXhrError(xhr, err, causingErr) {
      this._emitError(new _error2.default(err, causingErr, xhr));
    }
  }, {
    key: "_emitError",
    value: function _emitError(err) {
      if (typeof this.options.onError === "function") {
        this.options.onError(err);
      } else {
        throw err;
      }
    }
  }, {
    key: "_emitSuccess",
    value: function _emitSuccess() {
      if (typeof this.options.onSuccess === "function") {
        this.options.onSuccess();
      }
    }

    /**
     * Publishes notification when data has been sent to the server. This
     * data may not have been accepted by the server yet.
     * @param  {number} bytesSent  Number of bytes sent to the server.
     * @param  {number} bytesTotal Total number of bytes to be sent to the server.
     */

  }, {
    key: "_emitProgress",
    value: function _emitProgress(bytesSent, bytesTotal) {
      if (typeof this.options.onProgress === "function") {
        this.options.onProgress(bytesSent, bytesTotal);
      }
    }

    /**
     * Publishes notification when a chunk of data has been sent to the server
     * and accepted by the server.
     * @param  {number} chunkSize  Size of the chunk that was accepted by the
     *                             server.
     * @param  {number} bytesAccepted Total number of bytes that have been
     *                                accepted by the server.
     * @param  {number} bytesTotal Total number of bytes to be sent to the server.
     */

  }, {
    key: "_emitChunkComplete",
    value: function _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
      if (typeof this.options.onChunkComplete === "function") {
        this.options.onChunkComplete(chunkSize, bytesAccepted, bytesTotal);
      }
    }

    /**
     * Set the headers used in the request and the withCredentials property
     * as defined in the options
     *
     * @param {XMLHttpRequest} xhr
     */

  }, {
    key: "_setupXHR",
    value: function _setupXHR(xhr) {
      this._xhr = xhr;

      xhr.setRequestHeader("Tus-Resumable", "1.0.0");
      var headers = this.options.headers;

      for (var name in headers) {
        xhr.setRequestHeader(name, headers[name]);
      }

      xhr.withCredentials = this.options.withCredentials;
    }

    /**
     * Create a new upload using the creation extension by sending a POST
     * request to the endpoint. After successful creation the file will be
     * uploaded
     *
     * @api private
     */

  }, {
    key: "_createUpload",
    value: function _createUpload() {
      var _this3 = this;

      if (!this.options.endpoint) {
        this._emitError(new Error("tus: unable to create upload because no endpoint is provided"));
        return;
      }

      var xhr = (0, _request.newRequest)();
      xhr.open("POST", this.options.endpoint, true);

      xhr.onload = function () {
        if (!inStatusCategory(xhr.status, 200)) {
          _this3._emitXhrError(xhr, new Error("tus: unexpected response while creating upload"));
          return;
        }

        var location = xhr.getResponseHeader("Location");
        if (location == null) {
          _this3._emitXhrError(xhr, new Error("tus: invalid or missing Location header"));
          return;
        }

        _this3.url = (0, _request.resolveUrl)(_this3.options.endpoint, location);

        if (_this3._size === 0) {
          // Nothing to upload and file was successfully created
          _this3._emitSuccess();
          _this3._source.close();
          return;
        }

        if (_this3._hasStorage()) {
          _this3._storage.setItem(_this3._fingerprint, _this3.url, function (err) {
            if (err) {
              _this3._emitError(err);
            }
          });
        }

        _this3._offset = 0;
        _this3._startUpload();
      };

      xhr.onerror = function (err) {
        _this3._emitXhrError(xhr, new Error("tus: failed to create upload"), err);
      };

      this._setupXHR(xhr);
      if (this.options.uploadLengthDeferred) {
        xhr.setRequestHeader("Upload-Defer-Length", 1);
      } else {
        xhr.setRequestHeader("Upload-Length", this._size);
      }

      // Add metadata if values have been added
      var metadata = encodeMetadata(this.options.metadata);
      if (metadata !== "") {
        xhr.setRequestHeader("Upload-Metadata", metadata);
      }

      xhr.send(null);
    }

    /*
     * Try to resume an existing upload. First a HEAD request will be sent
     * to retrieve the offset. If the request fails a new upload will be
     * created. In the case of a successful response the file will be uploaded.
     *
     * @api private
     */

  }, {
    key: "_resumeUpload",
    value: function _resumeUpload() {
      var _this4 = this;

      var xhr = (0, _request.newRequest)();
      xhr.open("HEAD", this.url, true);

      xhr.onload = function () {
        if (!inStatusCategory(xhr.status, 200)) {
          if (_this4._hasStorage() && inStatusCategory(xhr.status, 400)) {
            // Remove stored fingerprint and corresponding endpoint,
            // on client errors since the file can not be found
            _this4._storage.removeItem(_this4._fingerprint, function (err) {
              if (err) {
                _this4._emitError(err);
              }
            });
          }

          // If the upload is locked (indicated by the 423 Locked status code), we
          // emit an error instead of directly starting a new upload. This way the
          // retry logic can catch the error and will retry the upload. An upload
          // is usually locked for a short period of time and will be available
          // afterwards.
          if (xhr.status === 423) {
            _this4._emitXhrError(xhr, new Error("tus: upload is currently locked; retry later"));
            return;
          }

          if (!_this4.options.endpoint) {
            // Don't attempt to create a new upload if no endpoint is provided.
            _this4._emitXhrError(xhr, new Error("tus: unable to resume upload (new upload cannot be created without an endpoint)"));
            return;
          }

          // Try to create a new upload
          _this4.url = null;
          _this4._createUpload();
          return;
        }

        var offset = parseInt(xhr.getResponseHeader("Upload-Offset"), 10);
        if (isNaN(offset)) {
          _this4._emitXhrError(xhr, new Error("tus: invalid or missing offset value"));
          return;
        }

        var length = parseInt(xhr.getResponseHeader("Upload-Length"), 10);
        if (isNaN(length) && !_this4.options.uploadLengthDeferred) {
          _this4._emitXhrError(xhr, new Error("tus: invalid or missing length value"));
          return;
        }

        // Upload has already been completed and we do not need to send additional
        // data to the server
        if (offset === length) {
          _this4._emitProgress(length, length);
          _this4._emitSuccess();
          return;
        }

        _this4._offset = offset;
        _this4._startUpload();
      };

      xhr.onerror = function (err) {
        _this4._emitXhrError(xhr, new Error("tus: failed to resume upload"), err);
      };

      this._setupXHR(xhr);
      xhr.send(null);
    }

    /**
     * Start uploading the file using PATCH requests. The file will be divided
     * into chunks as specified in the chunkSize option. During the upload
     * the onProgress event handler may be invoked multiple times.
     *
     * @api private
     */

  }, {
    key: "_startUpload",
    value: function _startUpload() {
      var _this5 = this;

      // If the upload has been aborted, we will not send the next PATCH request.
      // This is important if the abort method was called during a callback, such
      // as onChunkComplete or onProgress.
      if (this._aborted) {
        return;
      }

      var xhr = (0, _request.newRequest)();

      // Some browser and servers may not support the PATCH method. For those
      // cases, you can tell tus-js-client to use a POST request with the
      // X-HTTP-Method-Override header for simulating a PATCH request.
      if (this.options.overridePatchMethod) {
        xhr.open("POST", this.url, true);
        xhr.setRequestHeader("X-HTTP-Method-Override", "PATCH");
      } else {
        xhr.open("PATCH", this.url, true);
      }

      xhr.onload = function () {
        if (!inStatusCategory(xhr.status, 200)) {
          _this5._emitXhrError(xhr, new Error("tus: unexpected response while uploading chunk"));
          return;
        }

        var offset = parseInt(xhr.getResponseHeader("Upload-Offset"), 10);
        if (isNaN(offset)) {
          _this5._emitXhrError(xhr, new Error("tus: invalid or missing offset value"));
          return;
        }

        _this5._emitProgress(offset, _this5._size);
        _this5._emitChunkComplete(offset - _this5._offset, offset, _this5._size);

        _this5._offset = offset;

        if (offset == _this5._size) {
          if (_this5.options.removeFingerprintOnSuccess && _this5.options.resume) {
            // Remove stored fingerprint and corresponding endpoint. This causes
            // new upload of the same file must be treated as a different file.
            _this5._storage.removeItem(_this5._fingerprint, function (err) {
              if (err) {
                _this5._emitError(err);
              }
            });
          }

          // Yay, finally done :)
          _this5._emitSuccess();
          _this5._source.close();
          return;
        }

        _this5._startUpload();
      };

      xhr.onerror = function (err) {
        // Don't emit an error if the upload was aborted manually
        if (_this5._aborted) {
          return;
        }

        _this5._emitXhrError(xhr, new Error("tus: failed to upload chunk at offset " + _this5._offset), err);
      };

      // Test support for progress events before attaching an event listener
      if ("upload" in xhr) {
        xhr.upload.onprogress = function (e) {
          if (!e.lengthComputable) {
            return;
          }

          _this5._emitProgress(start + e.loaded, _this5._size);
        };
      }

      this._setupXHR(xhr);

      xhr.setRequestHeader("Upload-Offset", this._offset);
      xhr.setRequestHeader("Content-Type", "application/offset+octet-stream");

      var start = this._offset;
      var end = this._offset + this.options.chunkSize;

      // The specified chunkSize may be Infinity or the calcluated end position
      // may exceed the file's size. In both cases, we limit the end position to
      // the input's total size for simpler calculations and correctness.
      if ((end === Infinity || end > this._size) && !this.options.uploadLengthDeferred) {
        end = this._size;
      }

      this._source.slice(start, end, function (err, value, complete) {
        if (err) {
          _this5._emitError(err);
          return;
        }

        if (_this5.options.uploadLengthDeferred) {
          if (complete) {
            _this5._size = _this5._offset + (value && value.size ? value.size : 0);
            xhr.setRequestHeader("Upload-Length", _this5._size);
          }
        }

        if (value === null) {
          xhr.send();
        } else {
          xhr.send(value);
          _this5._emitProgress(_this5._offset, _this5._size);
        }
      });
    }
  }]);

  return Upload;
}();

function encodeMetadata(metadata) {
  var encoded = [];

  for (var key in metadata) {
    encoded.push(key + " " + _jsBase.Base64.encode(metadata[key]));
  }

  return encoded.join(",");
}

/**
 * Checks whether a given status is in the range of the expected category.
 * For example, only a status between 200 and 299 will satisfy the category 200.
 *
 * @api private
 */
function inStatusCategory(status, category) {
  return status >= category && status < category + 100;
}

Upload.defaultOptions = defaultOptions;

exports.default = Upload;

},{"./error":9,"./node/fingerprint":1,"./node/request":5,"./node/source":6,"./node/storage":7,"extend":12,"js-base64":13}],12:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],13:[function(require,module,exports){
(function (global){
/*
 *  base64.js
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? module.exports = factory(global)
        : typeof define === 'function' && define.amd
        ? define(factory) : factory(global)
}((
    typeof self !== 'undefined' ? self
        : typeof window !== 'undefined' ? window
        : typeof global !== 'undefined' ? global
: this
), function(global) {
    'use strict';
    // existing version for noConflict()
    var _Base64 = global.Base64;
    var version = "2.4.9";
    // if node.js and NOT React Native, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        try {
            buffer = eval("require('buffer').Buffer");
        } catch (err) {
            buffer = undefined;
        }
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer ?
        buffer.from && Uint8Array && buffer.from !== Uint8Array.from
        ? function (u) {
            return (u.constructor === buffer.constructor ? u : buffer.from(u))
                .toString('base64')
        }
        :  function (u) {
            return (u.constructor === buffer.constructor ? u : new  buffer(u))
                .toString('base64')
        }
        : function (u) { return btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe
            ? _encode(String(u))
            : _encode(String(u)).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
    var _decode = buffer ?
        buffer.from && Uint8Array && buffer.from !== Uint8Array.from
        ? function(a) {
            return (a.constructor === buffer.constructor
                    ? a : buffer.from(a, 'base64')).toString();
        }
        : function(a) {
            return (a.constructor === buffer.constructor
                    ? a : new buffer(a, 'base64')).toString();
        }
        : function(a) { return btou(atob(a)) };
    var decode = function(a){
        return _decode(
            String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict,
        __buffer__: buffer
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    //
    // export Base64 to the namespace
    //
    if (global['Meteor']) { // Meteor.js
        Base64 = global.Base64;
    }
    // module.exports and AMD are mutually exclusive.
    // module.exports has precedence.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.Base64 = global.Base64;
    }
    else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function(){ return global.Base64 });
    }
    // that's it!
    return {Base64: global.Base64}
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],14:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

/**
 * Decode a URI encoded string.
 *
 * @param {String} input The URI encoded string.
 * @returns {String} The decoded string.
 * @api private
 */
function decode(input) {
  return decodeURIComponent(input.replace(/\+/g, ' '));
}

/**
 * Simple query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object}
 * @api public
 */
function querystring(query) {
  var parser = /([^=?&]+)=?([^&]*)/g
    , result = {}
    , part;

  while (part = parser.exec(query)) {
    var key = decode(part[1])
      , value = decode(part[2]);

    //
    // Prevent overriding of existing properties. This ensures that build-in
    // methods like `toString` or __proto__ are not overriden by malicious
    // querystrings.
    //
    if (key in result) continue;
    result[key] = value;
  }

  return result;
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix) {
  prefix = prefix || '';

  var pairs = [];

  //
  // Optionally prefix with a '?' if needed
  //
  if ('string' !== typeof prefix) prefix = '?';

  for (var key in obj) {
    if (has.call(obj, key)) {
      pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
    }
  }

  return pairs.length ? prefix + pairs.join('&') : '';
}

//
// Expose the module.
//
exports.stringify = querystringify;
exports.parse = querystring;

},{}],15:[function(require,module,exports){
'use strict';

/**
 * Check if we're required to add a port number.
 *
 * @see https://url.spec.whatwg.org/#default-port
 * @param {Number|String} port Port number we need to check
 * @param {String} protocol Protocol we need to check against.
 * @returns {Boolean} Is it a default port for the given protocol
 * @api private
 */
module.exports = function required(port, protocol) {
  protocol = protocol.split(':')[0];
  port = +port;

  if (!port) return false;

  switch (protocol) {
    case 'http':
    case 'ws':
    return port !== 80;

    case 'https':
    case 'wss':
    return port !== 443;

    case 'ftp':
    return port !== 21;

    case 'gopher':
    return port !== 70;

    case 'file':
    return false;
  }

  return port !== 0;
};

},{}],16:[function(require,module,exports){
(function (global){
'use strict';

var required = require('requires-port')
  , qs = require('querystringify')
  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;

/**
 * These are the parse rules for the URL parser, it informs the parser
 * about:
 *
 * 0. The char it Needs to parse, if it's a string it should be done using
 *    indexOf, RegExp using exec and NaN means set as current value.
 * 1. The property we should set when parsing this value.
 * 2. Indication if it's backwards or forward parsing, when set as number it's
 *    the value of extra chars that should be split off.
 * 3. Inherit from location if non existing in the parser.
 * 4. `toLowerCase` the resulting value.
 */
var rules = [
  ['#', 'hash'],                        // Extract from the back.
  ['?', 'query'],                       // Extract from the back.
  function sanitize(address) {          // Sanitize what is left of the address
    return address.replace('\\', '/');
  },
  ['/', 'pathname'],                    // Extract from the back.
  ['@', 'auth', 1],                     // Extract from the front.
  [NaN, 'host', undefined, 1, 1],       // Set left over value.
  [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
];

/**
 * These properties should not be copied or inherited from. This is only needed
 * for all non blob URL's as a blob URL does not include a hash, only the
 * origin.
 *
 * @type {Object}
 * @private
 */
var ignore = { hash: 1, query: 1 };

/**
 * The location object differs when your code is loaded through a normal page,
 * Worker or through a worker using a blob. And with the blobble begins the
 * trouble as the location object will contain the URL of the blob, not the
 * location of the page where our code is loaded in. The actual origin is
 * encoded in the `pathname` so we can thankfully generate a good "default"
 * location from it so we can generate proper relative URL's again.
 *
 * @param {Object|String} loc Optional default location object.
 * @returns {Object} lolcation object.
 * @public
 */
function lolcation(loc) {
  var location = global && global.location || {};
  loc = loc || location;

  var finaldestination = {}
    , type = typeof loc
    , key;

  if ('blob:' === loc.protocol) {
    finaldestination = new Url(unescape(loc.pathname), {});
  } else if ('string' === type) {
    finaldestination = new Url(loc, {});
    for (key in ignore) delete finaldestination[key];
  } else if ('object' === type) {
    for (key in loc) {
      if (key in ignore) continue;
      finaldestination[key] = loc[key];
    }

    if (finaldestination.slashes === undefined) {
      finaldestination.slashes = slashes.test(loc.href);
    }
  }

  return finaldestination;
}

/**
 * @typedef ProtocolExtract
 * @type Object
 * @property {String} protocol Protocol matched in the URL, in lowercase.
 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
 * @property {String} rest Rest of the URL that is not part of the protocol.
 */

/**
 * Extract protocol information from a URL with/without double slash ("//").
 *
 * @param {String} address URL we want to extract from.
 * @return {ProtocolExtract} Extracted information.
 * @private
 */
function extractProtocol(address) {
  var match = protocolre.exec(address);

  return {
    protocol: match[1] ? match[1].toLowerCase() : '',
    slashes: !!match[2],
    rest: match[3]
  };
}

/**
 * Resolve a relative URL pathname against a base URL pathname.
 *
 * @param {String} relative Pathname of the relative URL.
 * @param {String} base Pathname of the base URL.
 * @return {String} Resolved pathname.
 * @private
 */
function resolve(relative, base) {
  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
    , i = path.length
    , last = path[i - 1]
    , unshift = false
    , up = 0;

  while (i--) {
    if (path[i] === '.') {
      path.splice(i, 1);
    } else if (path[i] === '..') {
      path.splice(i, 1);
      up++;
    } else if (up) {
      if (i === 0) unshift = true;
      path.splice(i, 1);
      up--;
    }
  }

  if (unshift) path.unshift('');
  if (last === '.' || last === '..') path.push('');

  return path.join('/');
}

/**
 * The actual URL instance. Instead of returning an object we've opted-in to
 * create an actual constructor as it's much more memory efficient and
 * faster and it pleases my OCD.
 *
 * It is worth noting that we should not use `URL` as class name to prevent
 * clashes with the global URL instance that got introduced in browsers.
 *
 * @constructor
 * @param {String} address URL we want to parse.
 * @param {Object|String} location Location defaults for relative paths.
 * @param {Boolean|Function} parser Parser for the query string.
 * @private
 */
function Url(address, location, parser) {
  if (!(this instanceof Url)) {
    return new Url(address, location, parser);
  }

  var relative, extracted, parse, instruction, index, key
    , instructions = rules.slice()
    , type = typeof location
    , url = this
    , i = 0;

  //
  // The following if statements allows this module two have compatibility with
  // 2 different API:
  //
  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
  //    where the boolean indicates that the query string should also be parsed.
  //
  // 2. The `URL` interface of the browser which accepts a URL, object as
  //    arguments. The supplied object will be used as default values / fall-back
  //    for relative paths.
  //
  if ('object' !== type && 'string' !== type) {
    parser = location;
    location = null;
  }

  if (parser && 'function' !== typeof parser) parser = qs.parse;

  location = lolcation(location);

  //
  // Extract protocol information before running the instructions.
  //
  extracted = extractProtocol(address || '');
  relative = !extracted.protocol && !extracted.slashes;
  url.slashes = extracted.slashes || relative && location.slashes;
  url.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  //
  // When the authority component is absent the URL starts with a path
  // component.
  //
  if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];

  for (; i < instructions.length; i++) {
    instruction = instructions[i];

    if (typeof instruction === 'function') {
      address = instruction(address);
      continue;
    }

    parse = instruction[0];
    key = instruction[1];

    if (parse !== parse) {
      url[key] = address;
    } else if ('string' === typeof parse) {
      if (~(index = address.indexOf(parse))) {
        if ('number' === typeof instruction[2]) {
          url[key] = address.slice(0, index);
          address = address.slice(index + instruction[2]);
        } else {
          url[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if ((index = parse.exec(address))) {
      url[key] = index[1];
      address = address.slice(0, index.index);
    }

    url[key] = url[key] || (
      relative && instruction[3] ? location[key] || '' : ''
    );

    //
    // Hostname, host and protocol should be lowercased so they can be used to
    // create a proper `origin`.
    //
    if (instruction[4]) url[key] = url[key].toLowerCase();
  }

  //
  // Also parse the supplied query string in to an object. If we're supplied
  // with a custom parser as function use that instead of the default build-in
  // parser.
  //
  if (parser) url.query = parser(url.query);

  //
  // If the URL is relative, resolve the pathname against the base URL.
  //
  if (
      relative
    && location.slashes
    && url.pathname.charAt(0) !== '/'
    && (url.pathname !== '' || location.pathname !== '')
  ) {
    url.pathname = resolve(url.pathname, location.pathname);
  }

  //
  // We should not add port numbers if they are already the default port number
  // for a given protocol. As the host also contains the port number we're going
  // override it with the hostname which contains no port number.
  //
  if (!required(url.port, url.protocol)) {
    url.host = url.hostname;
    url.port = '';
  }

  //
  // Parse down the `auth` for the username and password.
  //
  url.username = url.password = '';
  if (url.auth) {
    instruction = url.auth.split(':');
    url.username = instruction[0] || '';
    url.password = instruction[1] || '';
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? url.protocol +'//'+ url.host
    : 'null';

  //
  // The href is just the compiled result.
  //
  url.href = url.toString();
}

/**
 * This is convenience method for changing properties in the URL instance to
 * insure that they all propagate correctly.
 *
 * @param {String} part          Property we need to adjust.
 * @param {Mixed} value          The newly assigned value.
 * @param {Boolean|Function} fn  When setting the query, it will be the function
 *                               used to parse the query.
 *                               When setting the protocol, double slash will be
 *                               removed from the final url if it is true.
 * @returns {URL} URL instance for chaining.
 * @public
 */
function set(part, value, fn) {
  var url = this;

  switch (part) {
    case 'query':
      if ('string' === typeof value && value.length) {
        value = (fn || qs.parse)(value);
      }

      url[part] = value;
      break;

    case 'port':
      url[part] = value;

      if (!required(value, url.protocol)) {
        url.host = url.hostname;
        url[part] = '';
      } else if (value) {
        url.host = url.hostname +':'+ value;
      }

      break;

    case 'hostname':
      url[part] = value;

      if (url.port) value += ':'+ url.port;
      url.host = value;
      break;

    case 'host':
      url[part] = value;

      if (/:\d+$/.test(value)) {
        value = value.split(':');
        url.port = value.pop();
        url.hostname = value.join(':');
      } else {
        url.hostname = value;
        url.port = '';
      }

      break;

    case 'protocol':
      url.protocol = value.toLowerCase();
      url.slashes = !fn;
      break;

    case 'pathname':
    case 'hash':
      if (value) {
        var char = part === 'pathname' ? '/' : '#';
        url[part] = value.charAt(0) !== char ? char + value : value;
      } else {
        url[part] = value;
      }
      break;

    default:
      url[part] = value;
  }

  for (var i = 0; i < rules.length; i++) {
    var ins = rules[i];

    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? url.protocol +'//'+ url.host
    : 'null';

  url.href = url.toString();

  return url;
}

/**
 * Transform the properties back in to a valid and full URL string.
 *
 * @param {Function} stringify Optional query stringify function.
 * @returns {String} Compiled version of the URL.
 * @public
 */
function toString(stringify) {
  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

  var query
    , url = this
    , protocol = url.protocol;

  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  var result = protocol + (url.slashes ? '//' : '');

  if (url.username) {
    result += url.username;
    if (url.password) result += ':'+ url.password;
    result += '@';
  }

  result += url.host + url.pathname;

  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

  if (url.hash) result += url.hash;

  return result;
}

Url.prototype = { set: set, toString: toString };

//
// Expose the URL parser and some additional properties that might be useful for
// others or testing.
//
Url.extractProtocol = extractProtocol;
Url.location = lolcation;
Url.qs = qs;

module.exports = Url;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"querystringify":14,"requires-port":15}]},{},[10])(10)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvYnJvd3Nlci9maW5nZXJwcmludC5qcyIsImxpYi9icm93c2VyL2lzQ29yZG92YS5qcyIsImxpYi9icm93c2VyL2lzUmVhY3ROYXRpdmUuanMiLCJsaWIvYnJvd3Nlci9yZWFkQXNCeXRlQXJyYXkuanMiLCJsaWIvYnJvd3Nlci9yZXF1ZXN0LmpzIiwibGliL2Jyb3dzZXIvc291cmNlLmpzIiwibGliL2Jyb3dzZXIvc3RvcmFnZS5qcyIsImxpYi9icm93c2VyL3VyaVRvQmxvYi5qcyIsImxpYi9lcnJvci5qcyIsImxpYi9pbmRleC5qcyIsImxpYi91cGxvYWQuanMiLCJub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2pzLWJhc2U2NC9iYXNlNjQuanMiLCJub2RlX21vZHVsZXMvcXVlcnlzdHJpbmdpZnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVxdWlyZXMtcG9ydC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy91cmwtcGFyc2UvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztrQkNVd0IsVzs7QUFWeEI7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7Ozs7QUFPZSxTQUFTLFdBQVQsQ0FBcUIsSUFBckIsRUFBMkIsT0FBM0IsRUFBb0MsUUFBcEMsRUFBOEM7QUFDM0QsTUFBSSwwQkFBSixFQUFpQjtBQUNmLFdBQU8sU0FBUyxJQUFJLEtBQUosQ0FBVSxvREFBVixDQUFULENBQVA7QUFDRDs7QUFFRCxNQUFJLHVCQUFKLEVBQW1CO0FBQ2pCLFdBQU8sU0FBUyxJQUFULEVBQWUsdUJBQXVCLElBQXZCLEVBQTZCLE9BQTdCLENBQWYsQ0FBUDtBQUNEOztBQUVELFNBQU8sU0FBUyxJQUFULEVBQWUsQ0FDcEIsUUFEb0IsRUFFcEIsS0FBSyxJQUZlLEVBR3BCLEtBQUssSUFIZSxFQUlwQixLQUFLLElBSmUsRUFLcEIsS0FBSyxZ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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IGlzUmVhY3ROYXRpdmUgZnJvbSBcIi4vaXNSZWFjdE5hdGl2ZVwiO1xyXG5pbXBvcnQgaXNDb3Jkb3ZhIGZyb20gXCIuL2lzQ29yZG92YVwiO1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIGEgZmluZ2VycHJpbnQgZm9yIGEgZmlsZSB3aGljaCB3aWxsIGJlIHVzZWQgdGhlIHN0b3JlIHRoZSBlbmRwb2ludFxyXG4gKlxyXG4gKiBAcGFyYW0ge0ZpbGV9IGZpbGVcclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbmdlcnByaW50KGZpbGUsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XHJcbiAgaWYgKGlzQ29yZG92YSgpKSB7XHJcbiAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKFwiRmluZ2VycHJpbnQgY2Fubm90IGJlIGNvbXB1dGVkIGZvciBmaWxlIGlucHV0IHR5cGVcIikpO1xyXG4gIH1cclxuXHJcbiAgaWYgKGlzUmVhY3ROYXRpdmUpIHtcclxuICAgIHJldHVybiBjYWxsYmFjayhudWxsLCByZWFjdE5hdGl2ZUZpbmdlcnByaW50KGZpbGUsIG9wdGlvbnMpKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBjYWxsYmFjayhudWxsLCBbXHJcbiAgICBcInR1cy1iclwiLFxyXG4gICAgZmlsZS5uYW1lLFxyXG4gICAgZmlsZS50eXBlLFxyXG4gICAgZmlsZS5zaXplLFxyXG4gICAgZmlsZS5sYXN0TW9kaWZpZWQsXHJcbiAgICBvcHRpb25zLmVuZHBvaW50XHJcbiAgXS5qb2luKFwiLVwiKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWN0TmF0aXZlRmluZ2VycHJpbnQoZmlsZSwgb3B0aW9ucykge1xyXG4gIGxldCBleGlmSGFzaCA9IGZpbGUuZXhpZiA/IGhhc2hDb2RlKEpTT04uc3RyaW5naWZ5KGZpbGUuZXhpZikpIDogXCJub2V4aWZcIjtcclxuICByZXR1cm4gW1xyXG4gICAgXCJ0dXMtcm5cIixcclxuICAgIGZpbGUubmFtZSB8fCBcIm5vbmFtZVwiLFxyXG4gICAgZmlsZS5zaXplIHx8IFwibm9zaXplXCIsXHJcbiAgICBleGlmSGFzaCxcclxuICAgIG9wdGlvbnMuZW5kcG9pbnRcclxuICBdLmpvaW4oXCIvXCIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYXNoQ29kZShzdHIpIHtcclxuICAvLyBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS84ODMxOTM3LzE1MTY2NlxyXG4gIHZhciBoYXNoID0gMDtcclxuICBpZiAoc3RyLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgcmV0dXJuIGhhc2g7XHJcbiAgfVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgY2hhciA9IHN0ci5jaGFyQ29kZUF0KGkpO1xyXG4gICAgaGFzaCA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgY2hhcjtcclxuICAgIGhhc2ggPSBoYXNoICYgaGFzaDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXHJcbiAgfVxyXG4gIHJldHVybiBoYXNoO1xyXG59XHJcbiIsImNvbnN0IGlzQ29yZG92YSA9ICgpID0+IHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIiAmJiAoXHJcbiAgdHlwZW9mIHdpbmRvdy5QaG9uZUdhcCAhPSBcInVuZGVmaW5lZFwiIHx8XHJcbiAgICB0eXBlb2Ygd2luZG93LkNvcmRvdmEgIT0gXCJ1bmRlZmluZWRcIiB8fFxyXG4gICAgdHlwZW9mIHdpbmRvdy5jb3Jkb3ZhICE9IFwidW5kZWZpbmVkXCIpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaXNDb3Jkb3ZhO1xyXG4iLCJjb25zdCBpc1JlYWN0TmF0aXZlID0gKHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiZcclxuICB0eXBlb2YgbmF2aWdhdG9yLnByb2R1Y3QgPT09IFwic3RyaW5nXCIgJiZcclxuICBuYXZpZ2F0b3IucHJvZHVjdC50b0xvd2VyQ2FzZSgpID09PSBcInJlYWN0bmF0aXZlXCIpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaXNSZWFjdE5hdGl2ZTtcclxuIiwiLyoqXHJcbiAqIHJlYWRBc0J5dGVBcnJheSBjb252ZXJ0cyBhIEZpbGUgb2JqZWN0IHRvIGEgVWludDhBcnJheS5cclxuICogVGhpcyBmdW5jdGlvbiBpcyBvbmx5IHVzZWQgb24gdGhlIEFwYWNoZSBDb3Jkb3ZhIHBsYXRmb3JtLlxyXG4gKiBTZWUgaHR0cHM6Ly9jb3Jkb3ZhLmFwYWNoZS5vcmcvZG9jcy9lbi9sYXRlc3QvcmVmZXJlbmNlL2NvcmRvdmEtcGx1Z2luLWZpbGUvaW5kZXguaHRtbCNyZWFkLWEtZmlsZVxyXG4gKi9cclxuZnVuY3Rpb24gcmVhZEFzQnl0ZUFycmF5KGNodW5rLCBjYWxsYmFjaykge1xyXG4gIGxldCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gIHJlYWRlci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICBjYWxsYmFjayhudWxsLCBuZXcgVWludDhBcnJheShyZWFkZXIucmVzdWx0KSk7XHJcbiAgfTtcclxuICByZWFkZXIub25lcnJvciA9IChlcnIpID0+IHtcclxuICAgIGNhbGxiYWNrKGVycik7XHJcbiAgfTtcclxuICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoY2h1bmspO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCByZWFkQXNCeXRlQXJyYXk7XHJcbiIsIi8qIGdsb2JhbCB3aW5kb3cgKi9cclxuaW1wb3J0IFVSTCBmcm9tIFwidXJsLXBhcnNlXCI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbmV3UmVxdWVzdCgpIHtcclxuICByZXR1cm4gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVVybChvcmlnaW4sIGxpbmspIHtcclxuICByZXR1cm4gbmV3IFVSTChsaW5rLCBvcmlnaW4pLnRvU3RyaW5nKCk7XHJcbn1cclxuIiwiaW1wb3J0IGlzUmVhY3ROYXRpdmUgZnJvbSBcIi4vaXNSZWFjdE5hdGl2ZVwiO1xyXG5pbXBvcnQgdXJpVG9CbG9iIGZyb20gXCIuL3VyaVRvQmxvYlwiO1xyXG5pbXBvcnQgaXNDb3Jkb3ZhIGZyb20gXCIuL2lzQ29yZG92YVwiO1xyXG5pbXBvcnQgcmVhZEFzQnl0ZUFycmF5IGZyb20gXCIuL3JlYWRBc0J5dGVBcnJheVwiO1xyXG5cclxuY2xhc3MgRmlsZVNvdXJjZSB7XHJcbiAgY29uc3RydWN0b3IoZmlsZSkge1xyXG4gICAgdGhpcy5fZmlsZSA9IGZpbGU7XHJcbiAgICB0aGlzLnNpemUgPSBmaWxlLnNpemU7XHJcbiAgfVxyXG5cclxuICBzbGljZShzdGFydCwgZW5kLCBjYWxsYmFjaykge1xyXG4gICAgLy8gSW4gQXBhY2hlIENvcmRvdmEgYXBwbGljYXRpb25zLCBhIEZpbGUgbXVzdCBiZSByZXNvbHZlZCB1c2luZ1xyXG4gICAgLy8gRmlsZVJlYWRlciBpbnN0YW5jZXMsIHNlZVxyXG4gICAgLy8gaHR0cHM6Ly9jb3Jkb3ZhLmFwYWNoZS5vcmcvZG9jcy9lbi84LngvcmVmZXJlbmNlL2NvcmRvdmEtcGx1Z2luLWZpbGUvaW5kZXguaHRtbCNyZWFkLWEtZmlsZVxyXG4gICAgaWYgKGlzQ29yZG92YSgpKSB7XHJcbiAgICAgIHJlYWRBc0J5dGVBcnJheSh0aGlzLl9maWxlLnNsaWNlKHN0YXJ0LCBlbmQpLCAoZXJyLCBjaHVuaykgPT4ge1xyXG4gICAgICAgIGlmIChlcnIpIHJldHVybiBjYWxsYmFjayhlcnIpO1xyXG5cclxuICAgICAgICBjYWxsYmFjayhudWxsLCBjaHVuayk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY2FsbGJhY2sobnVsbCwgdGhpcy5fZmlsZS5zbGljZShzdGFydCwgZW5kKSk7XHJcbiAgfVxyXG5cclxuICBjbG9zZSgpIHt9XHJcbn1cclxuXHJcbmNsYXNzIFN0cmVhbVNvdXJjZSB7XHJcbiAgY29uc3RydWN0b3IocmVhZGVyLCBjaHVua1NpemUpIHtcclxuICAgIHRoaXMuX2NodW5rU2l6ZSA9IGNodW5rU2l6ZTtcclxuICAgIHRoaXMuX2J1ZmZlciA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuX2J1ZmZlck9mZnNldCA9IDA7XHJcbiAgICB0aGlzLl9yZWFkZXIgPSByZWFkZXI7XHJcbiAgICB0aGlzLl9kb25lID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBzbGljZShzdGFydCwgZW5kLCBjYWxsYmFjaykge1xyXG4gICAgaWYgKHN0YXJ0IDwgdGhpcy5fYnVmZmVyT2Zmc2V0KSB7XHJcbiAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcihcIlJlcXVlc3RlZCBkYXRhIGlzIGJlZm9yZSB0aGUgcmVhZGVyJ3MgY3VycmVudCBvZmZzZXRcIikpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX3JlYWRVbnRpbEVub3VnaERhdGFPckRvbmUoc3RhcnQsIGVuZCwgY2FsbGJhY2spO1xyXG4gIH1cclxuXHJcbiAgX3JlYWRVbnRpbEVub3VnaERhdGFPckRvbmUoc3RhcnQsIGVuZCwgY2FsbGJhY2spIHtcclxuICAgIGNvbnN0IGhhc0Vub3VnaERhdGEgPSBlbmQgPD0gdGhpcy5fYnVmZmVyT2Zmc2V0ICsgbGVuKHRoaXMuX2J1ZmZlcik7XHJcbiAgICBpZiAodGhpcy5fZG9uZSB8fCBoYXNFbm91Z2hEYXRhKSB7XHJcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMuX2dldERhdGFGcm9tQnVmZmVyKHN0YXJ0LCBlbmQpO1xyXG4gICAgICBjYWxsYmFjayhudWxsLCB2YWx1ZSwgdmFsdWUgPT0gbnVsbCA/IHRoaXMuX2RvbmUgOiBmYWxzZSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuX3JlYWRlci5yZWFkKCkudGhlbigoeyB2YWx1ZSwgZG9uZSB9KSA9PiB7XHJcbiAgICAgIGlmIChkb25lKSB7XHJcbiAgICAgICAgdGhpcy5fZG9uZSA9IHRydWU7XHJcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYnVmZmVyID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aGlzLl9idWZmZXIgPSB2YWx1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLl9idWZmZXIgPSBjb25jYXQodGhpcy5fYnVmZmVyLCB2YWx1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX3JlYWRVbnRpbEVub3VnaERhdGFPckRvbmUoc3RhcnQsIGVuZCwgY2FsbGJhY2spO1xyXG4gICAgfSkuY2F0Y2goZXJyID0+IHtcclxuICAgICAgY2FsbGJhY2sobmV3IEVycm9yKFwiRXJyb3IgZHVyaW5nIHJlYWQ6IFwiK2VycikpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBfZ2V0RGF0YUZyb21CdWZmZXIoc3RhcnQsIGVuZCkge1xyXG4gICAgLy8gUmVtb3ZlIGRhdGEgZnJvbSBidWZmZXIgYmVmb3JlIGBzdGFydGAuXHJcbiAgICAvLyBEYXRhIG1pZ2h0IGJlIHJlcmVhZCBmcm9tIHRoZSBidWZmZXIgaWYgYW4gdXBsb2FkIGZhaWxzLCBzbyB3ZSBjYW4gb25seVxyXG4gICAgLy8gc2FmZWx5IGRlbGV0ZSBkYXRhIHdoZW4gaXQgY29tZXMgKmJlZm9yZSogd2hhdCBpcyBjdXJyZW50bHkgYmVpbmcgcmVhZC5cclxuICAgIGlmIChzdGFydCA+IHRoaXMuX2J1ZmZlck9mZnNldCkge1xyXG4gICAgICB0aGlzLl9idWZmZXIgPSB0aGlzLl9idWZmZXIuc2xpY2Uoc3RhcnQgLSB0aGlzLl9idWZmZXJPZmZzZXQpO1xyXG4gICAgICB0aGlzLl9idWZmZXJPZmZzZXQgPSBzdGFydDtcclxuICAgIH1cclxuICAgIC8vIElmIHRoZSBidWZmZXIgaXMgZW1wdHkgYWZ0ZXIgcmVtb3Zpbmcgb2xkIGRhdGEsIGFsbCBkYXRhIGhhcyBiZWVuIHJlYWQuXHJcbiAgICBjb25zdCBoYXNBbGxEYXRhQmVlblJlYWQgPSBsZW4odGhpcy5fYnVmZmVyKSA9PT0gMDtcclxuICAgIGlmICh0aGlzLl9kb25lICYmIGhhc0FsbERhdGFCZWVuUmVhZCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIC8vIFdlIGFscmVhZHkgcmVtb3ZlZCBkYXRhIGJlZm9yZSBgc3RhcnRgLCBzbyB3ZSBqdXN0IHJldHVybiB0aGUgZmlyc3RcclxuICAgIC8vIGNodW5rIGZyb20gdGhlIGJ1ZmZlci5cclxuICAgIHJldHVybiB0aGlzLl9idWZmZXIuc2xpY2UoMCwgZW5kIC0gc3RhcnQpO1xyXG4gIH1cclxuXHJcbiAgY2xvc2UoKSB7XHJcbiAgICBpZiAodGhpcy5fcmVhZGVyLmNhbmNlbCkge1xyXG4gICAgICB0aGlzLl9yZWFkZXIuY2FuY2VsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBsZW4oYmxvYk9yQXJyYXkpIHtcclxuICBpZiAoYmxvYk9yQXJyYXkgPT09IHVuZGVmaW5lZCkgcmV0dXJuIDA7XHJcbiAgaWYgKGJsb2JPckFycmF5LnNpemUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGJsb2JPckFycmF5LnNpemU7XHJcbiAgcmV0dXJuIGJsb2JPckFycmF5Lmxlbmd0aDtcclxufVxyXG5cclxuLypcclxuICBUeXBlZCBhcnJheXMgYW5kIGJsb2JzIGRvbid0IGhhdmUgYSBjb25jYXQgbWV0aG9kLlxyXG4gIFRoaXMgZnVuY3Rpb24gaGVscHMgU3RyZWFtU291cmNlIGFjY3VtdWxhdGUgZGF0YSB0byByZWFjaCBjaHVua1NpemUuXHJcbiovXHJcbmZ1bmN0aW9uIGNvbmNhdChhLCBiKSB7XHJcbiAgaWYgKGEuY29uY2F0KSB7IC8vIElzIGBhYCBhbiBBcnJheT9cclxuICAgIHJldHVybiBhLmNvbmNhdChiKTtcclxuICB9XHJcbiAgaWYgKGEgaW5zdGFuY2VvZiBCbG9iKSB7XHJcbiAgICByZXR1cm4gbmV3IEJsb2IoW2EsYl0sIHt0eXBlOiBhLnR5cGV9KTtcclxuICB9XHJcbiAgaWYgKGEuc2V0KSB7IC8vIElzIGBhYCBhIHR5cGVkIGFycmF5P1xyXG4gICAgdmFyIGMgPSBuZXcgYS5jb25zdHJ1Y3RvcihhLmxlbmd0aCArIGIubGVuZ3RoKTtcclxuICAgIGMuc2V0KGEpO1xyXG4gICAgYy5zZXQoYiwgYS5sZW5ndGgpO1xyXG4gICAgcmV0dXJuIGM7XHJcbiAgfVxyXG4gIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gZGF0YSB0eXBlXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0U291cmNlKGlucHV0LCBjaHVua1NpemUsIGNhbGxiYWNrKSB7XHJcbiAgLy8gSW4gUmVhY3QgTmF0aXZlLCB3aGVuIHVzZXIgc2VsZWN0cyBhIGZpbGUsIGluc3RlYWQgb2YgYSBGaWxlIG9yIEJsb2IsXHJcbiAgLy8geW91IHVzdWFsbHkgZ2V0IGEgZmlsZSBvYmplY3Qge30gd2l0aCBhIHVyaSBwcm9wZXJ0eSB0aGF0IGNvbnRhaW5zXHJcbiAgLy8gYSBsb2NhbCBwYXRoIHRvIHRoZSBmaWxlLiBXZSB1c2UgWE1MSHR0cFJlcXVlc3QgdG8gZmV0Y2hcclxuICAvLyB0aGUgZmlsZSBibG9iLCBiZWZvcmUgdXBsb2FkaW5nIHdpdGggdHVzLlxyXG4gIC8vIFRPRE86IFRoZSBfX3R1c19fZm9yY2VSZWFjdE5hdGl2ZSBwcm9wZXJ0eSBpcyBjdXJyZW50bHkgdXNlZCB0byBmb3JjZVxyXG4gIC8vIGEgUmVhY3QgTmF0aXZlIGVudmlyb25tZW50IGR1cmluZyB0ZXN0aW5nLiBUaGlzIHNob3VsZCBiZSByZW1vdmVkXHJcbiAgLy8gb25jZSB3ZSBtb3ZlIGF3YXkgZnJvbSBQaGFudG9tSlMgYW5kIGNhbiBvdmVyd3JpdGUgbmF2aWdhdG9yLnByb2R1Y3RcclxuICAvLyBwcm9wZXJseS5cclxuICBpZiAoKGlzUmVhY3ROYXRpdmUgfHwgd2luZG93Ll9fdHVzX19mb3JjZVJlYWN0TmF0aXZlKSAmJiBpbnB1dCAmJiB0eXBlb2YgaW5wdXQudXJpICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICB1cmlUb0Jsb2IoaW5wdXQudXJpLCAoZXJyLCBibG9iKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKFwidHVzOiBjYW5ub3QgZmV0Y2ggYGZpbGUudXJpYCBhcyBCbG9iLCBtYWtlIHN1cmUgdGhlIHVyaSBpcyBjb3JyZWN0IGFuZCBhY2Nlc3NpYmxlLiBcIiArIGVycikpO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbGxiYWNrKG51bGwsIG5ldyBGaWxlU291cmNlKGJsb2IpKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gU2luY2Ugd2UgZW11bGF0ZSB0aGUgQmxvYiB0eXBlIGluIG91ciB0ZXN0cyAobm90IGFsbCB0YXJnZXQgYnJvd3NlcnNcclxuICAvLyBzdXBwb3J0IGl0KSwgd2UgY2Fubm90IHVzZSBgaW5zdGFuY2VvZmAgZm9yIHRlc3Rpbmcgd2hldGhlciB0aGUgaW5wdXQgdmFsdWVcclxuICAvLyBjYW4gYmUgaGFuZGxlZC4gSW5zdGVhZCwgd2Ugc2ltcGx5IGNoZWNrIGlzIHRoZSBzbGljZSgpIGZ1bmN0aW9uIGFuZCB0aGVcclxuICAvLyBzaXplIHByb3BlcnR5IGFyZSBhdmFpbGFibGUuXHJcbiAgaWYgKHR5cGVvZiBpbnB1dC5zbGljZSA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBpbnB1dC5zaXplICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICBjYWxsYmFjayhudWxsLCBuZXcgRmlsZVNvdXJjZShpbnB1dCkpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiBpbnB1dC5yZWFkID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgIGNodW5rU2l6ZSA9ICtjaHVua1NpemU7XHJcbiAgICBpZiAoIWlzRmluaXRlKGNodW5rU2l6ZSkpIHtcclxuICAgICAgY2FsbGJhY2sobmV3IEVycm9yKFwiY2Fubm90IGNyZWF0ZSBzb3VyY2UgZm9yIHN0cmVhbSB3aXRob3V0IGEgZmluaXRlIHZhbHVlIGZvciB0aGUgYGNodW5rU2l6ZWAgb3B0aW9uXCIpKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY2FsbGJhY2sobnVsbCwgbmV3IFN0cmVhbVNvdXJjZShpbnB1dCwgY2h1bmtTaXplKSk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjYWxsYmFjayhuZXcgRXJyb3IoXCJzb3VyY2Ugb2JqZWN0IG1heSBvbmx5IGJlIGFuIGluc3RhbmNlIG9mIEZpbGUsIEJsb2IsIG9yIFJlYWRlciBpbiB0aGlzIGVudmlyb25tZW50XCIpKTtcclxufVxyXG4iLCIvKiBnbG9iYWwgd2luZG93LCBsb2NhbFN0b3JhZ2UgKi9cclxuXHJcbmxldCBoYXNTdG9yYWdlID0gZmFsc2U7XHJcbnRyeSB7XHJcbiAgaGFzU3RvcmFnZSA9IFwibG9jYWxTdG9yYWdlXCIgaW4gd2luZG93O1xyXG5cclxuICAvLyBBdHRlbXB0IHRvIHN0b3JlIGFuZCByZWFkIGVudHJpZXMgZnJvbSB0aGUgbG9jYWwgc3RvcmFnZSB0byBkZXRlY3QgUHJpdmF0ZVxyXG4gIC8vIE1vZGUgb24gU2FmYXJpIG9uIGlPUyAoc2VlICM0OSlcclxuICB2YXIga2V5ID0gXCJ0dXNTdXBwb3J0XCI7XHJcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpKTtcclxuXHJcbn0gY2F0Y2ggKGUpIHtcclxuICAvLyBJZiB3ZSB0cnkgdG8gYWNjZXNzIGxvY2FsU3RvcmFnZSBpbnNpZGUgYSBzYW5kYm94ZWQgaWZyYW1lLCBhIFNlY3VyaXR5RXJyb3JcclxuICAvLyBpcyB0aHJvd24uIFdoZW4gaW4gcHJpdmF0ZSBtb2RlIG9uIGlPUyBTYWZhcmksIGEgUXVvdGFFeGNlZWRlZEVycm9yIGlzXHJcbiAgLy8gdGhyb3duIChzZWUgIzQ5KVxyXG4gIGlmIChlLmNvZGUgPT09IGUuU0VDVVJJVFlfRVJSIHx8IGUuY29kZSA9PT0gZS5RVU9UQV9FWENFRURFRF9FUlIpIHtcclxuICAgIGhhc1N0b3JhZ2UgPSBmYWxzZTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhyb3cgZTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjYW5TdG9yZVVSTHMgPSBoYXNTdG9yYWdlO1xyXG5cclxuY2xhc3MgTG9jYWxTdG9yYWdlIHtcclxuICBzZXRJdGVtKGtleSwgdmFsdWUsIGNiKSB7XHJcbiAgICBjYihudWxsLCBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKSk7XHJcbiAgfVxyXG5cclxuICBnZXRJdGVtKGtleSwgY2IpIHtcclxuICAgIGNiKG51bGwsIGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkpO1xyXG4gIH1cclxuXHJcbiAgcmVtb3ZlSXRlbShrZXksIGNiKSB7XHJcbiAgICBjYihudWxsLCBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTdG9yYWdlKCkge1xyXG4gIHJldHVybiBoYXNTdG9yYWdlID8gbmV3IExvY2FsU3RvcmFnZSgpIDogbnVsbDtcclxufVxyXG4iLCIvKipcclxuICogdXJpVG9CbG9iIHJlc29sdmVzIGEgVVJJIHRvIGEgQmxvYiBvYmplY3QuIFRoaXMgaXMgdXNlZCBmb3JcclxuICogUmVhY3QgTmF0aXZlIHRvIHJldHJpZXZlIGEgZmlsZSAoaWRlbnRpZmllZCBieSBhIGZpbGU6Ly9cclxuICogVVJJKSBhcyBhIGJsb2IuXHJcbiAqL1xyXG5mdW5jdGlvbiB1cmlUb0Jsb2IodXJpLCBkb25lKSB7XHJcbiAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgeGhyLnJlc3BvbnNlVHlwZSA9IFwiYmxvYlwiO1xyXG4gIHhoci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBibG9iID0geGhyLnJlc3BvbnNlO1xyXG4gICAgZG9uZShudWxsLCBibG9iKTtcclxuICB9O1xyXG4gIHhoci5vbmVycm9yID0gKGVycikgPT4ge1xyXG4gICAgZG9uZShlcnIpO1xyXG4gIH07XHJcbiAgeGhyLm9wZW4oXCJHRVRcIiwgdXJpKTtcclxuICB4aHIuc2VuZCgpO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB1cmlUb0Jsb2I7XHJcbiIsImNsYXNzIERldGFpbGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgY29uc3RydWN0b3IoZXJyb3IsIGNhdXNpbmdFcnIgPSBudWxsLCB4aHIgPSBudWxsKSB7XHJcbiAgICBzdXBlcihlcnJvci5tZXNzYWdlKTtcclxuXHJcbiAgICB0aGlzLm9yaWdpbmFsUmVxdWVzdCA9IHhocjtcclxuICAgIHRoaXMuY2F1c2luZ0Vycm9yID0gY2F1c2luZ0VycjtcclxuXHJcbiAgICBsZXQgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICBpZiAoY2F1c2luZ0VyciAhPSBudWxsKSB7XHJcbiAgICAgIG1lc3NhZ2UgKz0gYCwgY2F1c2VkIGJ5ICR7Y2F1c2luZ0Vyci50b1N0cmluZygpfWA7XHJcbiAgICB9XHJcbiAgICBpZiAoeGhyICE9IG51bGwpIHtcclxuICAgICAgbWVzc2FnZSArPSBgLCBvcmlnaW5hdGVkIGZyb20gcmVxdWVzdCAocmVzcG9uc2UgY29kZTogJHt4aHIuc3RhdHVzfSwgcmVzcG9uc2UgdGV4dDogJHt4aHIucmVzcG9uc2VUZXh0fSlgO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERldGFpbGVkRXJyb3I7XHJcbiIsIi8qIGdsb2JhbCB3aW5kb3cgKi9cclxuaW1wb3J0IFVwbG9hZCBmcm9tIFwiLi91cGxvYWRcIjtcclxuaW1wb3J0ICogYXMgc3RvcmFnZSBmcm9tIFwiLi9ub2RlL3N0b3JhZ2VcIjtcclxuXHJcbmNvbnN0IHtkZWZhdWx0T3B0aW9uc30gPSBVcGxvYWQ7XHJcblxyXG5jb25zdCBtb2R1bGVFeHBvcnQgPSB7XHJcbiAgVXBsb2FkLFxyXG4gIGNhblN0b3JlVVJMczogc3RvcmFnZS5jYW5TdG9yZVVSTHMsXHJcbiAgZGVmYXVsdE9wdGlvbnNcclxufTtcclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgLy8gQnJvd3NlciBlbnZpcm9ubWVudCB1c2luZyBYTUxIdHRwUmVxdWVzdFxyXG4gIGNvbnN0IHtYTUxIdHRwUmVxdWVzdCwgQmxvYn0gPSB3aW5kb3c7XHJcblxyXG4gIG1vZHVsZUV4cG9ydC5pc1N1cHBvcnRlZCA9IChcclxuICAgIFhNTEh0dHBSZXF1ZXN0ICYmXHJcbiAgICBCbG9iICYmXHJcbiAgICB0eXBlb2YgQmxvYi5wcm90b3R5cGUuc2xpY2UgPT09IFwiZnVuY3Rpb25cIlxyXG4gICk7XHJcbn0gZWxzZSB7XHJcbiAgLy8gTm9kZS5qcyBlbnZpcm9ubWVudCB1c2luZyBodHRwIG1vZHVsZVxyXG4gIG1vZHVsZUV4cG9ydC5pc1N1cHBvcnRlZCA9IHRydWU7XHJcbiAgLy8gbWFrZSBGaWxlU3RvcmFnZSBtb2R1bGUgYXZhaWxhYmxlIGFzIGl0IHdpbGwgbm90IGJlIHNldCBieSBkZWZhdWx0LlxyXG4gIG1vZHVsZUV4cG9ydC5GaWxlU3RvcmFnZSA9IHN0b3JhZ2UuRmlsZVN0b3JhZ2U7XHJcbn1cclxuXHJcbi8vIFRoZSB1c2FnZSBvZiB0aGUgY29tbW9uanMgZXhwb3J0aW5nIHN5bnRheCBpbnN0ZWFkIG9mIHRoZSBuZXcgRUNNQVNjcmlwdFxyXG4vLyBvbmUgaXMgYWN0dWFsbHkgaW50ZWRlZCBhbmQgcHJldmVudHMgd2VpcmQgYmVoYXZpb3VyIGlmIHdlIGFyZSB0cnlpbmcgdG9cclxuLy8gaW1wb3J0IHRoaXMgbW9kdWxlIGluIGFub3RoZXIgbW9kdWxlIHVzaW5nIEJhYmVsLlxyXG5tb2R1bGUuZXhwb3J0cyA9IG1vZHVsZUV4cG9ydDtcclxuIiwiLyogZ2xvYmFsIHdpbmRvdyAqL1xyXG5pbXBvcnQgRGV0YWlsZWRFcnJvciBmcm9tIFwiLi9lcnJvclwiO1xyXG5pbXBvcnQgZXh0ZW5kIGZyb20gXCJleHRlbmRcIjtcclxuaW1wb3J0IHsgQmFzZTY0IH0gZnJvbSBcImpzLWJhc2U2NFwiO1xyXG5cclxuLy8gV2UgaW1wb3J0IHRoZSBmaWxlcyB1c2VkIGluc2lkZSB0aGUgTm9kZSBlbnZpcm9ubWVudCB3aGljaCBhcmUgcmV3cml0dGVuXHJcbi8vIGZvciBicm93c2VycyB1c2luZyB0aGUgcnVsZXMgZGVmaW5lZCBpbiB0aGUgcGFja2FnZS5qc29uXHJcbmltcG9ydCB7IG5ld1JlcXVlc3QsIHJlc29sdmVVcmwgfSBmcm9tIFwiLi9ub2RlL3JlcXVlc3RcIjtcclxuaW1wb3J0IHsgZ2V0U291cmNlIH0gZnJvbSBcIi4vbm9kZS9zb3VyY2VcIjtcclxuaW1wb3J0IHsgZ2V0U3RvcmFnZSB9IGZyb20gXCIuL25vZGUvc3RvcmFnZVwiO1xyXG5pbXBvcnQgZmluZ2VycHJpbnQgZnJvbSBcIi4vbm9kZS9maW5nZXJwcmludFwiO1xyXG5cclxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgZW5kcG9pbnQ6IG51bGwsXHJcbiAgZmluZ2VycHJpbnQsXHJcbiAgcmVzdW1lOiB0cnVlLFxyXG4gIG9uUHJvZ3Jlc3M6IG51bGwsXHJcbiAgb25DaHVua0NvbXBsZXRlOiBudWxsLFxyXG4gIG9uU3VjY2VzczogbnVsbCxcclxuICBvbkVycm9yOiBudWxsLFxyXG4gIGhlYWRlcnM6IHt9LFxyXG4gIGNodW5rU2l6ZTogSW5maW5pdHksXHJcbiAgd2l0aENyZWRlbnRpYWxzOiBmYWxzZSxcclxuICB1cGxvYWRVcmw6IG51bGwsXHJcbiAgdXBsb2FkU2l6ZTogbnVsbCxcclxuICBvdmVycmlkZVBhdGNoTWV0aG9kOiBmYWxzZSxcclxuICByZXRyeURlbGF5czogbnVsbCxcclxuICByZW1vdmVGaW5nZXJwcmludE9uU3VjY2VzczogZmFsc2UsXHJcbiAgdXBsb2FkTGVuZ3RoRGVmZXJyZWQ6IGZhbHNlLFxyXG4gIHVybFN0b3JhZ2U6IG51bGwsXHJcbiAgZmlsZVJlYWRlcjogbnVsbFxyXG59O1xyXG5cclxuY2xhc3MgVXBsb2FkIHtcclxuICBjb25zdHJ1Y3RvcihmaWxlLCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQodHJ1ZSwge30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcbiAgICAvLyBUaGUgc3RvcmFnZSBtb2R1bGUgdXNlZCB0byBzdG9yZSBVUkxzXHJcbiAgICB0aGlzLl9zdG9yYWdlID0gdGhpcy5vcHRpb25zLnVybFN0b3JhZ2U7XHJcblxyXG4gICAgLy8gVGhlIHVuZGVybHlpbmcgRmlsZS9CbG9iIG9iamVjdFxyXG4gICAgdGhpcy5maWxlID0gZmlsZTtcclxuXHJcbiAgICAvLyBUaGUgVVJMIGFnYWluc3Qgd2hpY2ggdGhlIGZpbGUgd2lsbCBiZSB1cGxvYWRlZFxyXG4gICAgdGhpcy51cmwgPSBudWxsO1xyXG5cclxuICAgIC8vIFRoZSB1bmRlcmx5aW5nIFhIUiBvYmplY3QgZm9yIHRoZSBjdXJyZW50IFBBVENIIHJlcXVlc3RcclxuICAgIHRoaXMuX3hociA9IG51bGw7XHJcblxyXG4gICAgLy8gVGhlIGZpbmdlcnBpbnJ0IGZvciB0aGUgY3VycmVudCBmaWxlIChzZXQgYWZ0ZXIgc3RhcnQoKSlcclxuICAgIHRoaXMuX2ZpbmdlcnByaW50ID0gbnVsbDtcclxuXHJcbiAgICAvLyBUaGUgb2Zmc2V0IHVzZWQgaW4gdGhlIGN1cnJlbnQgUEFUQ0ggcmVxdWVzdFxyXG4gICAgdGhpcy5fb2Zmc2V0ID0gbnVsbDtcclxuXHJcbiAgICAvLyBUcnVlIGlmIHRoZSBjdXJyZW50IFBBVENIIHJlcXVlc3QgaGFzIGJlZW4gYWJvcnRlZFxyXG4gICAgdGhpcy5fYWJvcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIFRoZSBmaWxlJ3Mgc2l6ZSBpbiBieXRlc1xyXG4gICAgdGhpcy5fc2l6ZSA9IG51bGw7XHJcblxyXG4gICAgLy8gVGhlIFNvdXJjZSBvYmplY3Qgd2hpY2ggd2lsbCB3cmFwIGFyb3VuZCB0aGUgZ2l2ZW4gZmlsZSBhbmQgcHJvdmlkZXMgdXNcclxuICAgIC8vIHdpdGggYSB1bmlmaWVkIGludGVyZmFjZSBmb3IgZ2V0dGluZyBpdHMgc2l6ZSBhbmQgc2xpY2UgY2h1bmtzIGZyb20gaXRzXHJcbiAgICAvLyBjb250ZW50IGFsbG93aW5nIHVzIHRvIGVhc2lseSBoYW5kbGUgRmlsZXMsIEJsb2JzLCBCdWZmZXJzIGFuZCBTdHJlYW1zLlxyXG4gICAgdGhpcy5fc291cmNlID0gbnVsbDtcclxuXHJcbiAgICAvLyBUaGUgY3VycmVudCBjb3VudCBvZiBhdHRlbXB0cyB3aGljaCBoYXZlIGJlZW4gbWFkZS4gTnVsbCBpbmRpY2F0ZXMgbm9uZS5cclxuICAgIHRoaXMuX3JldHJ5QXR0ZW1wdCA9IDA7XHJcblxyXG4gICAgLy8gVGhlIHRpbWVvdXQncyBJRCB3aGljaCBpcyB1c2VkIHRvIGRlbGF5IHRoZSBuZXh0IHJldHJ5XHJcbiAgICB0aGlzLl9yZXRyeVRpbWVvdXQgPSBudWxsO1xyXG5cclxuICAgIC8vIFRoZSBvZmZzZXQgb2YgdGhlIHJlbW90ZSB1cGxvYWQgYmVmb3JlIHRoZSBsYXRlc3QgYXR0ZW1wdCB3YXMgc3RhcnRlZC5cclxuICAgIHRoaXMuX29mZnNldEJlZm9yZVJldHJ5ID0gMDtcclxuICB9XHJcblxyXG4gIHN0YXJ0KCkge1xyXG4gICAgbGV0IGZpbGUgPSB0aGlzLmZpbGU7XHJcblxyXG4gICAgaWYgKCFmaWxlKSB7XHJcbiAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IG5vIGZpbGUgb3Igc3RyZWFtIHRvIHVwbG9hZCBwcm92aWRlZFwiKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5lbmRwb2ludCAmJiAhdGhpcy5vcHRpb25zLnVwbG9hZFVybCkge1xyXG4gICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiBuZWl0aGVyIGFuIGVuZHBvaW50IG9yIGFuIHVwbG9hZCBVUkwgaXMgcHJvdmlkZWRcIikpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5yZXN1bWUgJiYgdGhpcy5fc3RvcmFnZSA9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMuX3N0b3JhZ2UgPSBnZXRTdG9yYWdlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX3NvdXJjZSkge1xyXG4gICAgICB0aGlzLl9zdGFydCh0aGlzLl9zb3VyY2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgZmlsZVJlYWRlciA9IHRoaXMub3B0aW9ucy5maWxlUmVhZGVyIHx8IGdldFNvdXJjZTtcclxuICAgICAgZmlsZVJlYWRlcihmaWxlLCB0aGlzLm9wdGlvbnMuY2h1bmtTaXplLCAoZXJyLCBzb3VyY2UpID0+IHtcclxuICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICB0aGlzLl9lbWl0RXJyb3IoZXJyKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcclxuICAgICAgICB0aGlzLl9zdGFydChzb3VyY2UpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9zdGFydChzb3VyY2UpIHtcclxuICAgIGxldCBmaWxlID0gdGhpcy5maWxlO1xyXG5cclxuICAgIC8vIEZpcnN0LCB3ZSBsb29rIGF0IHRoZSB1cGxvYWRMZW5ndGhEZWZlcnJlZCBvcHRpb24uXHJcbiAgICAvLyBOZXh0LCB3ZSBjaGVjayBpZiB0aGUgY2FsbGVyIGhhcyBzdXBwbGllZCBhIG1hbnVhbCB1cGxvYWQgc2l6ZS5cclxuICAgIC8vIEZpbmFsbHksIHdlIHRyeSB0byB1c2UgdGhlIGNhbGN1bGF0ZWQgc2l6ZSBmcm9tIHRoZSBzb3VyY2Ugb2JqZWN0LlxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy51cGxvYWRMZW5ndGhEZWZlcnJlZCkge1xyXG4gICAgICB0aGlzLl9zaXplID0gbnVsbDtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnVwbG9hZFNpemUgIT0gbnVsbCkge1xyXG4gICAgICB0aGlzLl9zaXplID0gK3RoaXMub3B0aW9ucy51cGxvYWRTaXplO1xyXG4gICAgICBpZiAoaXNOYU4odGhpcy5fc2l6ZSkpIHtcclxuICAgICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiBjYW5ub3QgY29udmVydCBgdXBsb2FkU2l6ZWAgb3B0aW9uIGludG8gYSBudW1iZXJcIikpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fc2l6ZSA9IHNvdXJjZS5zaXplO1xyXG4gICAgICBpZiAodGhpcy5fc2l6ZSA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogY2Fubm90IGF1dG9tYXRpY2FsbHkgZGVyaXZlIHVwbG9hZCdzIHNpemUgZnJvbSBpbnB1dCBhbmQgbXVzdCBiZSBzcGVjaWZpZWQgbWFudWFsbHkgdXNpbmcgdGhlIGB1cGxvYWRTaXplYCBvcHRpb25cIikpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCByZXRyeURlbGF5cyA9IHRoaXMub3B0aW9ucy5yZXRyeURlbGF5cztcclxuICAgIGlmIChyZXRyeURlbGF5cyAhPSBudWxsKSB7XHJcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocmV0cnlEZWxheXMpICE9PSBcIltvYmplY3QgQXJyYXldXCIpIHtcclxuICAgICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiB0aGUgYHJldHJ5RGVsYXlzYCBvcHRpb24gbXVzdCBlaXRoZXIgYmUgYW4gYXJyYXkgb3IgbnVsbFwiKSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBlcnJvckNhbGxiYWNrID0gdGhpcy5vcHRpb25zLm9uRXJyb3I7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uRXJyb3IgPSAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAvLyBSZXN0b3JlIHRoZSBvcmlnaW5hbCBlcnJvciBjYWxsYmFjayB3aGljaCBtYXkgaGF2ZSBiZWVuIHNldC5cclxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkVycm9yID0gZXJyb3JDYWxsYmFjaztcclxuXHJcbiAgICAgICAgICAvLyBXZSB3aWxsIHJlc2V0IHRoZSBhdHRlbXB0IGNvdW50ZXIgaWZcclxuICAgICAgICAgIC8vIC0gd2Ugd2VyZSBhbHJlYWR5IGFibGUgdG8gY29ubmVjdCB0byB0aGUgc2VydmVyIChvZmZzZXQgIT0gbnVsbCkgYW5kXHJcbiAgICAgICAgICAvLyAtIHdlIHdlcmUgYWJsZSB0byB1cGxvYWQgYSBzbWFsbCBjaHVuayBvZiBkYXRhIHRvIHRoZSBzZXJ2ZXJcclxuICAgICAgICAgIGxldCBzaG91bGRSZXNldERlbGF5cyA9IHRoaXMuX29mZnNldCAhPSBudWxsICYmICh0aGlzLl9vZmZzZXQgPiB0aGlzLl9vZmZzZXRCZWZvcmVSZXRyeSk7XHJcbiAgICAgICAgICBpZiAoc2hvdWxkUmVzZXREZWxheXMpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmV0cnlBdHRlbXB0ID0gMDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsZXQgaXNPbmxpbmUgPSB0cnVlO1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiZcclxuICAgICAgICAgICAgIFwibmF2aWdhdG9yXCIgaW4gd2luZG93ICYmXHJcbiAgICAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLm9uTGluZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgaXNPbmxpbmUgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBXZSBvbmx5IGF0dGVtcHQgYSByZXRyeSBpZlxyXG4gICAgICAgICAgLy8gLSB3ZSBkaWRuJ3QgZXhjZWVkIHRoZSBtYXhpdW0gbnVtYmVyIG9mIHJldHJpZXMsIHlldCwgYW5kXHJcbiAgICAgICAgICAvLyAtIHRoaXMgZXJyb3Igd2FzIGNhdXNlZCBieSBhIHJlcXVlc3Qgb3IgaXQncyByZXNwb25zZSBhbmRcclxuICAgICAgICAgIC8vIC0gdGhlIGVycm9yIGlzIHNlcnZlciBlcnJvciAoaS5lLiBubyBhIHN0YXR1cyA0eHggb3IgYSA0MDkgb3IgNDIzKSBhbmRcclxuICAgICAgICAgIC8vIC0gdGhlIGJyb3dzZXIgZG9lcyBub3QgaW5kaWNhdGUgdGhhdCB3ZSBhcmUgb2ZmbGluZVxyXG4gICAgICAgICAgbGV0IHN0YXR1cyA9IGVyci5vcmlnaW5hbFJlcXVlc3QgPyBlcnIub3JpZ2luYWxSZXF1ZXN0LnN0YXR1cyA6IDA7XHJcbiAgICAgICAgICBsZXQgaXNTZXJ2ZXJFcnJvciA9ICFpblN0YXR1c0NhdGVnb3J5KHN0YXR1cywgNDAwKSB8fCBzdGF0dXMgPT09IDQwOSB8fCBzdGF0dXMgPT09IDQyMztcclxuICAgICAgICAgIGxldCBzaG91bGRSZXRyeSA9IHRoaXMuX3JldHJ5QXR0ZW1wdCA8IHJldHJ5RGVsYXlzLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyLm9yaWdpbmFsUmVxdWVzdCAhPSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlcnZlckVycm9yICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc09ubGluZTtcclxuXHJcbiAgICAgICAgICBpZiAoIXNob3VsZFJldHJ5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2VtaXRFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgbGV0IGRlbGF5ID0gcmV0cnlEZWxheXNbdGhpcy5fcmV0cnlBdHRlbXB0KytdO1xyXG5cclxuICAgICAgICAgIHRoaXMuX29mZnNldEJlZm9yZVJldHJ5ID0gdGhpcy5fb2Zmc2V0O1xyXG4gICAgICAgICAgdGhpcy5vcHRpb25zLnVwbG9hZFVybCA9IHRoaXMudXJsO1xyXG5cclxuICAgICAgICAgIHRoaXMuX3JldHJ5VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XHJcbiAgICAgICAgICB9LCBkZWxheSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBhYm9ydGVkIGZsYWcgd2hlbiB0aGUgdXBsb2FkIGlzIHN0YXJ0ZWQgb3IgZWxzZSB0aGVcclxuICAgIC8vIF9zdGFydFVwbG9hZCB3aWxsIHN0b3AgYmVmb3JlIHNlbmRpbmcgYSByZXF1ZXN0IGlmIHRoZSB1cGxvYWQgaGFzIGJlZW5cclxuICAgIC8vIGFib3J0ZWQgcHJldmlvdXNseS5cclxuICAgIHRoaXMuX2Fib3J0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBUaGUgdXBsb2FkIGhhZCBiZWVuIHN0YXJ0ZWQgcHJldmlvdXNseSBhbmQgd2Ugc2hvdWxkIHJldXNlIHRoaXMgVVJMLlxyXG4gICAgaWYgKHRoaXMudXJsICE9IG51bGwpIHtcclxuICAgICAgdGhpcy5fcmVzdW1lVXBsb2FkKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBIFVSTCBoYXMgbWFudWFsbHkgYmVlbiBzcGVjaWZpZWQsIHNvIHdlIHRyeSB0byByZXN1bWVcclxuICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkVXJsICE9IG51bGwpIHtcclxuICAgICAgdGhpcy51cmwgPSB0aGlzLm9wdGlvbnMudXBsb2FkVXJsO1xyXG4gICAgICB0aGlzLl9yZXN1bWVVcGxvYWQoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRyeSB0byBmaW5kIHRoZSBlbmRwb2ludCBmb3IgdGhlIGZpbGUgaW4gdGhlIHN0b3JhZ2VcclxuICAgIGlmICh0aGlzLl9oYXNTdG9yYWdlKCkpIHtcclxuICAgICAgdGhpcy5vcHRpb25zLmZpbmdlcnByaW50KGZpbGUsIHRoaXMub3B0aW9ucywgKGVyciwgZmluZ2VycHJpbnRWYWx1ZSkgPT4ge1xyXG4gICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgIHRoaXMuX2VtaXRFcnJvcihlcnIpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fZmluZ2VycHJpbnQgPSBmaW5nZXJwcmludFZhbHVlO1xyXG4gICAgICAgIHRoaXMuX3N0b3JhZ2UuZ2V0SXRlbSh0aGlzLl9maW5nZXJwcmludCwgKGVyciwgcmVzdW1lZFVybCkgPT4ge1xyXG4gICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICB0aGlzLl9lbWl0RXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChyZXN1bWVkVXJsICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy51cmwgPSByZXN1bWVkVXJsO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXN1bWVVcGxvYWQoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVVwbG9hZCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEFuIHVwbG9hZCBoYXMgbm90IHN0YXJ0ZWQgZm9yIHRoZSBmaWxlIHlldCwgc28gd2Ugc3RhcnQgYSBuZXcgb25lXHJcbiAgICAgIHRoaXMuX2NyZWF0ZVVwbG9hZCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYWJvcnQoKSB7XHJcbiAgICBpZiAodGhpcy5feGhyICE9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMuX3hoci5hYm9ydCgpO1xyXG4gICAgICB0aGlzLl9zb3VyY2UuY2xvc2UoKTtcclxuICAgIH1cclxuICAgIHRoaXMuX2Fib3J0ZWQgPSB0cnVlO1xyXG5cclxuICAgIGlmICh0aGlzLl9yZXRyeVRpbWVvdXQgIT0gbnVsbCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmV0cnlUaW1lb3V0KTtcclxuICAgICAgdGhpcy5fcmV0cnlUaW1lb3V0ID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9oYXNTdG9yYWdlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5yZXN1bWUgJiYgdGhpcy5fc3RvcmFnZTtcclxuICB9XHJcblxyXG4gIF9lbWl0WGhyRXJyb3IoeGhyLCBlcnIsIGNhdXNpbmdFcnIpIHtcclxuICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRGV0YWlsZWRFcnJvcihlcnIsIGNhdXNpbmdFcnIsIHhocikpO1xyXG4gIH1cclxuXHJcbiAgX2VtaXRFcnJvcihlcnIpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICB0aGlzLm9wdGlvbnMub25FcnJvcihlcnIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgZXJyO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX2VtaXRTdWNjZXNzKCkge1xyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25TdWNjZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgdGhpcy5vcHRpb25zLm9uU3VjY2VzcygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHVibGlzaGVzIG5vdGlmaWNhdGlvbiB3aGVuIGRhdGEgaGFzIGJlZW4gc2VudCB0byB0aGUgc2VydmVyLiBUaGlzXHJcbiAgICogZGF0YSBtYXkgbm90IGhhdmUgYmVlbiBhY2NlcHRlZCBieSB0aGUgc2VydmVyIHlldC5cclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzU2VudCAgTnVtYmVyIG9mIGJ5dGVzIHNlbnQgdG8gdGhlIHNlcnZlci5cclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzVG90YWwgVG90YWwgbnVtYmVyIG9mIGJ5dGVzIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cclxuICAgKi9cclxuICBfZW1pdFByb2dyZXNzKGJ5dGVzU2VudCwgYnl0ZXNUb3RhbCkge1xyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25Qcm9ncmVzcyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgIHRoaXMub3B0aW9ucy5vblByb2dyZXNzKGJ5dGVzU2VudCwgYnl0ZXNUb3RhbCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQdWJsaXNoZXMgbm90aWZpY2F0aW9uIHdoZW4gYSBjaHVuayBvZiBkYXRhIGhhcyBiZWVuIHNlbnQgdG8gdGhlIHNlcnZlclxyXG4gICAqIGFuZCBhY2NlcHRlZCBieSB0aGUgc2VydmVyLlxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gY2h1bmtTaXplICBTaXplIG9mIHRoZSBjaHVuayB0aGF0IHdhcyBhY2NlcHRlZCBieSB0aGVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyLlxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gYnl0ZXNBY2NlcHRlZCBUb3RhbCBudW1iZXIgb2YgYnl0ZXMgdGhhdCBoYXZlIGJlZW5cclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXB0ZWQgYnkgdGhlIHNlcnZlci5cclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzVG90YWwgVG90YWwgbnVtYmVyIG9mIGJ5dGVzIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cclxuICAgKi9cclxuICBfZW1pdENodW5rQ29tcGxldGUoY2h1bmtTaXplLCBieXRlc0FjY2VwdGVkLCBieXRlc1RvdGFsKSB7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNodW5rQ29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICB0aGlzLm9wdGlvbnMub25DaHVua0NvbXBsZXRlKGNodW5rU2l6ZSwgYnl0ZXNBY2NlcHRlZCwgYnl0ZXNUb3RhbCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGhlYWRlcnMgdXNlZCBpbiB0aGUgcmVxdWVzdCBhbmQgdGhlIHdpdGhDcmVkZW50aWFscyBwcm9wZXJ0eVxyXG4gICAqIGFzIGRlZmluZWQgaW4gdGhlIG9wdGlvbnNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3R9IHhoclxyXG4gICAqL1xyXG4gIF9zZXR1cFhIUih4aHIpIHtcclxuICAgIHRoaXMuX3hociA9IHhocjtcclxuXHJcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIlR1cy1SZXN1bWFibGVcIiwgXCIxLjAuMFwiKTtcclxuICAgIGxldCBoZWFkZXJzID0gdGhpcy5vcHRpb25zLmhlYWRlcnM7XHJcblxyXG4gICAgZm9yIChsZXQgbmFtZSBpbiBoZWFkZXJzKSB7XHJcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIGhlYWRlcnNbbmFtZV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0aGlzLm9wdGlvbnMud2l0aENyZWRlbnRpYWxzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgbmV3IHVwbG9hZCB1c2luZyB0aGUgY3JlYXRpb24gZXh0ZW5zaW9uIGJ5IHNlbmRpbmcgYSBQT1NUXHJcbiAgICogcmVxdWVzdCB0byB0aGUgZW5kcG9pbnQuIEFmdGVyIHN1Y2Nlc3NmdWwgY3JlYXRpb24gdGhlIGZpbGUgd2lsbCBiZVxyXG4gICAqIHVwbG9hZGVkXHJcbiAgICpcclxuICAgKiBAYXBpIHByaXZhdGVcclxuICAgKi9cclxuICBfY3JlYXRlVXBsb2FkKCkge1xyXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuZW5kcG9pbnQpIHtcclxuICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogdW5hYmxlIHRvIGNyZWF0ZSB1cGxvYWQgYmVjYXVzZSBubyBlbmRwb2ludCBpcyBwcm92aWRlZFwiKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgeGhyID0gbmV3UmVxdWVzdCgpO1xyXG4gICAgeGhyLm9wZW4oXCJQT1NUXCIsIHRoaXMub3B0aW9ucy5lbmRwb2ludCwgdHJ1ZSk7XHJcblxyXG4gICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgaWYgKCFpblN0YXR1c0NhdGVnb3J5KHhoci5zdGF0dXMsIDIwMCkpIHtcclxuICAgICAgICB0aGlzLl9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IHVuZXhwZWN0ZWQgcmVzcG9uc2Ugd2hpbGUgY3JlYXRpbmcgdXBsb2FkXCIpKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBsb2NhdGlvbiA9IHhoci5nZXRSZXNwb25zZUhlYWRlcihcIkxvY2F0aW9uXCIpO1xyXG4gICAgICBpZiAobG9jYXRpb24gPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogaW52YWxpZCBvciBtaXNzaW5nIExvY2F0aW9uIGhlYWRlclwiKSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnVybCA9IHJlc29sdmVVcmwodGhpcy5vcHRpb25zLmVuZHBvaW50LCBsb2NhdGlvbik7XHJcblxyXG4gICAgICBpZiAodGhpcy5fc2l6ZSA9PT0gMCkge1xyXG4gICAgICAgIC8vIE5vdGhpbmcgdG8gdXBsb2FkIGFuZCBmaWxlIHdhcyBzdWNjZXNzZnVsbHkgY3JlYXRlZFxyXG4gICAgICAgIHRoaXMuX2VtaXRTdWNjZXNzKCk7XHJcbiAgICAgICAgdGhpcy5fc291cmNlLmNsb3NlKCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5faGFzU3RvcmFnZSgpKSB7XHJcbiAgICAgICAgdGhpcy5fc3RvcmFnZS5zZXRJdGVtKHRoaXMuX2ZpbmdlcnByaW50LCB0aGlzLnVybCwgKGVycikgPT4ge1xyXG4gICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICB0aGlzLl9lbWl0RXJyb3IoZXJyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fb2Zmc2V0ID0gMDtcclxuICAgICAgdGhpcy5fc3RhcnRVcGxvYWQoKTtcclxuICAgIH07XHJcblxyXG4gICAgeGhyLm9uZXJyb3IgPSAoZXJyKSA9PiB7XHJcbiAgICAgIHRoaXMuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogZmFpbGVkIHRvIGNyZWF0ZSB1cGxvYWRcIiksIGVycik7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3NldHVwWEhSKHhocik7XHJcbiAgICBpZiAodGhpcy5vcHRpb25zLnVwbG9hZExlbmd0aERlZmVycmVkKSB7XHJcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiVXBsb2FkLURlZmVyLUxlbmd0aFwiLCAxKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiVXBsb2FkLUxlbmd0aFwiLCB0aGlzLl9zaXplKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGQgbWV0YWRhdGEgaWYgdmFsdWVzIGhhdmUgYmVlbiBhZGRlZFxyXG4gICAgdmFyIG1ldGFkYXRhID0gZW5jb2RlTWV0YWRhdGEodGhpcy5vcHRpb25zLm1ldGFkYXRhKTtcclxuICAgIGlmIChtZXRhZGF0YSAhPT0gXCJcIikge1xyXG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIlVwbG9hZC1NZXRhZGF0YVwiLCBtZXRhZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgeGhyLnNlbmQobnVsbCk7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIFRyeSB0byByZXN1bWUgYW4gZXhpc3RpbmcgdXBsb2FkLiBGaXJzdCBhIEhFQUQgcmVxdWVzdCB3aWxsIGJlIHNlbnRcclxuICAgKiB0byByZXRyaWV2ZSB0aGUgb2Zmc2V0LiBJZiB0aGUgcmVxdWVzdCBmYWlscyBhIG5ldyB1cGxvYWQgd2lsbCBiZVxyXG4gICAqIGNyZWF0ZWQuIEluIHRoZSBjYXNlIG9mIGEgc3VjY2Vzc2Z1bCByZXNwb25zZSB0aGUgZmlsZSB3aWxsIGJlIHVwbG9hZGVkLlxyXG4gICAqXHJcbiAgICogQGFwaSBwcml2YXRlXHJcbiAgICovXHJcbiAgX3Jlc3VtZVVwbG9hZCgpIHtcclxuICAgIGxldCB4aHIgPSBuZXdSZXF1ZXN0KCk7XHJcbiAgICB4aHIub3BlbihcIkhFQURcIiwgdGhpcy51cmwsIHRydWUpO1xyXG5cclxuICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgIGlmICghaW5TdGF0dXNDYXRlZ29yeSh4aHIuc3RhdHVzLCAyMDApKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hhc1N0b3JhZ2UoKSAmJiBpblN0YXR1c0NhdGVnb3J5KHhoci5zdGF0dXMsIDQwMCkpIHtcclxuICAgICAgICAgIC8vIFJlbW92ZSBzdG9yZWQgZmluZ2VycHJpbnQgYW5kIGNvcnJlc3BvbmRpbmcgZW5kcG9pbnQsXHJcbiAgICAgICAgICAvLyBvbiBjbGllbnQgZXJyb3JzIHNpbmNlIHRoZSBmaWxlIGNhbiBub3QgYmUgZm91bmRcclxuICAgICAgICAgIHRoaXMuX3N0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLl9maW5nZXJwcmludCwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fZW1pdEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHVwbG9hZCBpcyBsb2NrZWQgKGluZGljYXRlZCBieSB0aGUgNDIzIExvY2tlZCBzdGF0dXMgY29kZSksIHdlXHJcbiAgICAgICAgLy8gZW1pdCBhbiBlcnJvciBpbnN0ZWFkIG9mIGRpcmVjdGx5IHN0YXJ0aW5nIGEgbmV3IHVwbG9hZC4gVGhpcyB3YXkgdGhlXHJcbiAgICAgICAgLy8gcmV0cnkgbG9naWMgY2FuIGNhdGNoIHRoZSBlcnJvciBhbmQgd2lsbCByZXRyeSB0aGUgdXBsb2FkLiBBbiB1cGxvYWRcclxuICAgICAgICAvLyBpcyB1c3VhbGx5IGxvY2tlZCBmb3IgYSBzaG9ydCBwZXJpb2Qgb2YgdGltZSBhbmQgd2lsbCBiZSBhdmFpbGFibGVcclxuICAgICAgICAvLyBhZnRlcndhcmRzLlxyXG4gICAgICAgIGlmICh4aHIuc3RhdHVzID09PSA0MjMpIHtcclxuICAgICAgICAgIHRoaXMuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogdXBsb2FkIGlzIGN1cnJlbnRseSBsb2NrZWQ7IHJldHJ5IGxhdGVyXCIpKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmVuZHBvaW50KSB7XHJcbiAgICAgICAgICAvLyBEb24ndCBhdHRlbXB0IHRvIGNyZWF0ZSBhIG5ldyB1cGxvYWQgaWYgbm8gZW5kcG9pbnQgaXMgcHJvdmlkZWQuXHJcbiAgICAgICAgICB0aGlzLl9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IHVuYWJsZSB0byByZXN1bWUgdXBsb2FkIChuZXcgdXBsb2FkIGNhbm5vdCBiZSBjcmVhdGVkIHdpdGhvdXQgYW4gZW5kcG9pbnQpXCIpKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRyeSB0byBjcmVhdGUgYSBuZXcgdXBsb2FkXHJcbiAgICAgICAgdGhpcy51cmwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2NyZWF0ZVVwbG9hZCgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IG9mZnNldCA9IHBhcnNlSW50KHhoci5nZXRSZXNwb25zZUhlYWRlcihcIlVwbG9hZC1PZmZzZXRcIiksIDEwKTtcclxuICAgICAgaWYgKGlzTmFOKG9mZnNldCkpIHtcclxuICAgICAgICB0aGlzLl9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGludmFsaWQgb3IgbWlzc2luZyBvZmZzZXQgdmFsdWVcIikpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IGxlbmd0aCA9IHBhcnNlSW50KHhoci5nZXRSZXNwb25zZUhlYWRlcihcIlVwbG9hZC1MZW5ndGhcIiksIDEwKTtcclxuICAgICAgaWYgKGlzTmFOKGxlbmd0aCkgJiYgIXRoaXMub3B0aW9ucy51cGxvYWRMZW5ndGhEZWZlcnJlZCkge1xyXG4gICAgICAgIHRoaXMuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogaW52YWxpZCBvciBtaXNzaW5nIGxlbmd0aCB2YWx1ZVwiKSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVcGxvYWQgaGFzIGFscmVhZHkgYmVlbiBjb21wbGV0ZWQgYW5kIHdlIGRvIG5vdCBuZWVkIHRvIHNlbmQgYWRkaXRpb25hbFxyXG4gICAgICAvLyBkYXRhIHRvIHRoZSBzZXJ2ZXJcclxuICAgICAgaWYgKG9mZnNldCA9PT0gbGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5fZW1pdFByb2dyZXNzKGxlbmd0aCwgbGVuZ3RoKTtcclxuICAgICAgICB0aGlzLl9lbWl0U3VjY2VzcygpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fb2Zmc2V0ID0gb2Zmc2V0O1xyXG4gICAgICB0aGlzLl9zdGFydFVwbG9hZCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB4aHIub25lcnJvciA9IChlcnIpID0+IHtcclxuICAgICAgdGhpcy5fZW1pdFhockVycm9yKHhociwgbmV3IEVycm9yKFwidHVzOiBmYWlsZWQgdG8gcmVzdW1lIHVwbG9hZFwiKSwgZXJyKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fc2V0dXBYSFIoeGhyKTtcclxuICAgIHhoci5zZW5kKG51bGwpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhcnQgdXBsb2FkaW5nIHRoZSBmaWxlIHVzaW5nIFBBVENIIHJlcXVlc3RzLiBUaGUgZmlsZSB3aWxsIGJlIGRpdmlkZWRcclxuICAgKiBpbnRvIGNodW5rcyBhcyBzcGVjaWZpZWQgaW4gdGhlIGNodW5rU2l6ZSBvcHRpb24uIER1cmluZyB0aGUgdXBsb2FkXHJcbiAgICogdGhlIG9uUHJvZ3Jlc3MgZXZlbnQgaGFuZGxlciBtYXkgYmUgaW52b2tlZCBtdWx0aXBsZSB0aW1lcy5cclxuICAgKlxyXG4gICAqIEBhcGkgcHJpdmF0ZVxyXG4gICAqL1xyXG4gIF9zdGFydFVwbG9hZCgpIHtcclxuICAgIC8vIElmIHRoZSB1cGxvYWQgaGFzIGJlZW4gYWJvcnRlZCwgd2Ugd2lsbCBub3Qgc2VuZCB0aGUgbmV4dCBQQVRDSCByZXF1ZXN0LlxyXG4gICAgLy8gVGhpcyBpcyBpbXBvcnRhbnQgaWYgdGhlIGFib3J0IG1ldGhvZCB3YXMgY2FsbGVkIGR1cmluZyBhIGNhbGxiYWNrLCBzdWNoXHJcbiAgICAvLyBhcyBvbkNodW5rQ29tcGxldGUgb3Igb25Qcm9ncmVzcy5cclxuICAgIGlmICh0aGlzLl9hYm9ydGVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgeGhyID0gbmV3UmVxdWVzdCgpO1xyXG5cclxuICAgIC8vIFNvbWUgYnJvd3NlciBhbmQgc2VydmVycyBtYXkgbm90IHN1cHBvcnQgdGhlIFBBVENIIG1ldGhvZC4gRm9yIHRob3NlXHJcbiAgICAvLyBjYXNlcywgeW91IGNhbiB0ZWxsIHR1cy1qcy1jbGllbnQgdG8gdXNlIGEgUE9TVCByZXF1ZXN0IHdpdGggdGhlXHJcbiAgICAvLyBYLUhUVFAtTWV0aG9kLU92ZXJyaWRlIGhlYWRlciBmb3Igc2ltdWxhdGluZyBhIFBBVENIIHJlcXVlc3QuXHJcbiAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJyaWRlUGF0Y2hNZXRob2QpIHtcclxuICAgICAgeGhyLm9wZW4oXCJQT1NUXCIsIHRoaXMudXJsLCB0cnVlKTtcclxuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJYLUhUVFAtTWV0aG9kLU92ZXJyaWRlXCIsIFwiUEFUQ0hcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB4aHIub3BlbihcIlBBVENIXCIsIHRoaXMudXJsLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICB4aHIub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICBpZiAoIWluU3RhdHVzQ2F0ZWdvcnkoeGhyLnN0YXR1cywgMjAwKSkge1xyXG4gICAgICAgIHRoaXMuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogdW5leHBlY3RlZCByZXNwb25zZSB3aGlsZSB1cGxvYWRpbmcgY2h1bmtcIikpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IG9mZnNldCA9IHBhcnNlSW50KHhoci5nZXRSZXNwb25zZUhlYWRlcihcIlVwbG9hZC1PZmZzZXRcIiksIDEwKTtcclxuICAgICAgaWYgKGlzTmFOKG9mZnNldCkpIHtcclxuICAgICAgICB0aGlzLl9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGludmFsaWQgb3IgbWlzc2luZyBvZmZzZXQgdmFsdWVcIikpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fZW1pdFByb2dyZXNzKG9mZnNldCwgdGhpcy5fc2l6ZSk7XHJcbiAgICAgIHRoaXMuX2VtaXRDaHVua0NvbXBsZXRlKG9mZnNldCAtIHRoaXMuX29mZnNldCwgb2Zmc2V0LCB0aGlzLl9zaXplKTtcclxuXHJcbiAgICAgIHRoaXMuX29mZnNldCA9IG9mZnNldDtcclxuXHJcbiAgICAgIGlmIChvZmZzZXQgPT0gdGhpcy5fc2l6ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmVtb3ZlRmluZ2VycHJpbnRPblN1Y2Nlc3MgJiYgdGhpcy5vcHRpb25zLnJlc3VtZSkge1xyXG4gICAgICAgICAgLy8gUmVtb3ZlIHN0b3JlZCBmaW5nZXJwcmludCBhbmQgY29ycmVzcG9uZGluZyBlbmRwb2ludC4gVGhpcyBjYXVzZXNcclxuICAgICAgICAgIC8vIG5ldyB1cGxvYWQgb2YgdGhlIHNhbWUgZmlsZSBtdXN0IGJlIHRyZWF0ZWQgYXMgYSBkaWZmZXJlbnQgZmlsZS5cclxuICAgICAgICAgIHRoaXMuX3N0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLl9maW5nZXJwcmludCwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fZW1pdEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gWWF5LCBmaW5hbGx5IGRvbmUgOilcclxuICAgICAgICB0aGlzLl9lbWl0U3VjY2VzcygpO1xyXG4gICAgICAgIHRoaXMuX3NvdXJjZS5jbG9zZSgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fc3RhcnRVcGxvYWQoKTtcclxuICAgIH07XHJcblxyXG4gICAgeGhyLm9uZXJyb3IgPSAoZXJyKSA9PiB7XHJcbiAgICAgIC8vIERvbid0IGVtaXQgYW4gZXJyb3IgaWYgdGhlIHVwbG9hZCB3YXMgYWJvcnRlZCBtYW51YWxseVxyXG4gICAgICBpZiAodGhpcy5fYWJvcnRlZCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fZW1pdFhockVycm9yKHhociwgbmV3IEVycm9yKFwidHVzOiBmYWlsZWQgdG8gdXBsb2FkIGNodW5rIGF0IG9mZnNldCBcIiArIHRoaXMuX29mZnNldCksIGVycik7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFRlc3Qgc3VwcG9ydCBmb3IgcHJvZ3Jlc3MgZXZlbnRzIGJlZm9yZSBhdHRhY2hpbmcgYW4gZXZlbnQgbGlzdGVuZXJcclxuICAgIGlmIChcInVwbG9hZFwiIGluIHhocikge1xyXG4gICAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSAoZSkgPT4ge1xyXG4gICAgICAgIGlmICghZS5sZW5ndGhDb21wdXRhYmxlKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9lbWl0UHJvZ3Jlc3Moc3RhcnQgKyBlLmxvYWRlZCwgdGhpcy5fc2l6ZSk7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fc2V0dXBYSFIoeGhyKTtcclxuXHJcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIlVwbG9hZC1PZmZzZXRcIiwgdGhpcy5fb2Zmc2V0KTtcclxuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vb2Zmc2V0K29jdGV0LXN0cmVhbVwiKTtcclxuXHJcbiAgICBsZXQgc3RhcnQgPSB0aGlzLl9vZmZzZXQ7XHJcbiAgICBsZXQgZW5kID0gdGhpcy5fb2Zmc2V0ICsgdGhpcy5vcHRpb25zLmNodW5rU2l6ZTtcclxuXHJcbiAgICAvLyBUaGUgc3BlY2lmaWVkIGNodW5rU2l6ZSBtYXkgYmUgSW5maW5pdHkgb3IgdGhlIGNhbGNsdWF0ZWQgZW5kIHBvc2l0aW9uXHJcbiAgICAvLyBtYXkgZXhjZWVkIHRoZSBmaWxlJ3Mgc2l6ZS4gSW4gYm90aCBjYXNlcywgd2UgbGltaXQgdGhlIGVuZCBwb3NpdGlvbiB0b1xyXG4gICAgLy8gdGhlIGlucHV0J3MgdG90YWwgc2l6ZSBmb3Igc2ltcGxlciBjYWxjdWxhdGlvbnMgYW5kIGNvcnJlY3RuZXNzLlxyXG4gICAgaWYgKChlbmQgPT09IEluZmluaXR5IHx8IGVuZCA+IHRoaXMuX3NpemUpICYmICF0aGlzLm9wdGlvbnMudXBsb2FkTGVuZ3RoRGVmZXJyZWQpIHtcclxuICAgICAgZW5kID0gdGhpcy5fc2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zb3VyY2Uuc2xpY2Uoc3RhcnQsIGVuZCwgKGVyciwgdmFsdWUsIGNvbXBsZXRlKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICB0aGlzLl9lbWl0RXJyb3IoZXJyKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkTGVuZ3RoRGVmZXJyZWQpIHtcclxuICAgICAgICBpZiAoY29tcGxldGUpIHtcclxuICAgICAgICAgIHRoaXMuX3NpemUgPSB0aGlzLl9vZmZzZXQgKyAodmFsdWUgJiYgdmFsdWUuc2l6ZSA/IHZhbHVlLnNpemUgOiAwKTtcclxuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiVXBsb2FkLUxlbmd0aFwiLCB0aGlzLl9zaXplKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgIHhoci5zZW5kKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgeGhyLnNlbmQodmFsdWUpO1xyXG4gICAgICAgIHRoaXMuX2VtaXRQcm9ncmVzcyh0aGlzLl9vZmZzZXQsIHRoaXMuX3NpemUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVuY29kZU1ldGFkYXRhKG1ldGFkYXRhKSB7XHJcbiAgdmFyIGVuY29kZWQgPSBbXTtcclxuXHJcbiAgZm9yICh2YXIga2V5IGluIG1ldGFkYXRhKSB7XHJcbiAgICBlbmNvZGVkLnB1c2goa2V5ICsgXCIgXCIgKyBCYXNlNjQuZW5jb2RlKG1ldGFkYXRhW2tleV0pKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBlbmNvZGVkLmpvaW4oXCIsXCIpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBzdGF0dXMgaXMgaW4gdGhlIHJhbmdlIG9mIHRoZSBleHBlY3RlZCBjYXRlZ29yeS5cclxuICogRm9yIGV4YW1wbGUsIG9ubHkgYSBzdGF0dXMgYmV0d2VlbiAyMDAgYW5kIDI5OSB3aWxsIHNhdGlzZnkgdGhlIGNhdGVnb3J5IDIwMC5cclxuICpcclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5mdW5jdGlvbiBpblN0YXR1c0NhdGVnb3J5KHN0YXR1cywgY2F0ZWdvcnkpIHtcclxuICByZXR1cm4gKHN0YXR1cyA+PSBjYXRlZ29yeSAmJiBzdGF0dXMgPCAoY2F0ZWdvcnkgKyAxMDApKTtcclxufVxyXG5cclxuVXBsb2FkLmRlZmF1bHRPcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBVcGxvYWQ7XHJcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIGlzQXJyYXkoYXJyKSB7XG5cdGlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGFycik7XG5cdH1cblxuXHRyZXR1cm4gdG9TdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRpZiAoIW9iaiB8fCB0b1N0ci5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGhhc093bkNvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc0lzUHJvdG90eXBlT2YgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc093bkNvbnN0cnVjdG9yICYmICFoYXNJc1Byb3RvdHlwZU9mKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gT3duIHByb3BlcnRpZXMgYXJlIGVudW1lcmF0ZWQgZmlyc3RseSwgc28gdG8gc3BlZWQgdXAsXG5cdC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBvYmopIHsvKiovfVxuXG5cdHJldHVybiB0eXBlb2Yga2V5ID09PSAndW5kZWZpbmVkJyB8fCBoYXNPd24uY2FsbChvYmosIGtleSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCgpIHtcblx0dmFyIG9wdGlvbnMsIG5hbWUsIHNyYywgY29weSwgY29weUlzQXJyYXksIGNsb25lLFxuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1swXSxcblx0XHRpID0gMSxcblx0XHRsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuXHRcdGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH0gZWxzZSBpZiAoKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnICYmIHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicpIHx8IHRhcmdldCA9PSBudWxsKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdH1cblxuXHRmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1tpXTtcblx0XHQvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG5cdFx0aWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuXHRcdFx0Ly8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuXHRcdFx0Zm9yIChuYW1lIGluIG9wdGlvbnMpIHtcblx0XHRcdFx0c3JjID0gdGFyZ2V0W25hbWVdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG5cdFx0XHRcdGlmICh0YXJnZXQgIT09IGNvcHkpIHtcblx0XHRcdFx0XHQvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBhcnJheXNcblx0XHRcdFx0XHRpZiAoZGVlcCAmJiBjb3B5ICYmIChpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IGlzQXJyYXkoY29weSkpKSkge1xuXHRcdFx0XHRcdFx0aWYgKGNvcHlJc0FycmF5KSB7XG5cdFx0XHRcdFx0XHRcdGNvcHlJc0FycmF5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIE5ldmVyIG1vdmUgb3JpZ2luYWwgb2JqZWN0cywgY2xvbmUgdGhlbVxuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gZXh0ZW5kKGRlZXAsIGNsb25lLCBjb3B5KTtcblxuXHRcdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb3B5ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gY29weTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxuIiwiLypcbiAqICBiYXNlNjQuanNcbiAqXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIEJTRCAzLUNsYXVzZSBMaWNlbnNlLlxuICogICAgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICpcbiAqICBSZWZlcmVuY2VzOlxuICogICAgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CYXNlNjRcbiAqL1xuOyhmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gICAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KGdsb2JhbClcbiAgICAgICAgOiB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWRcbiAgICAgICAgPyBkZWZpbmUoZmFjdG9yeSkgOiBmYWN0b3J5KGdsb2JhbClcbn0oKFxuICAgIHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGZcbiAgICAgICAgOiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvd1xuICAgICAgICA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsXG46IHRoaXNcbiksIGZ1bmN0aW9uKGdsb2JhbCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBleGlzdGluZyB2ZXJzaW9uIGZvciBub0NvbmZsaWN0KClcbiAgICB2YXIgX0Jhc2U2NCA9IGdsb2JhbC5CYXNlNjQ7XG4gICAgdmFyIHZlcnNpb24gPSBcIjIuNC45XCI7XG4gICAgLy8gaWYgbm9kZS5qcyBhbmQgTk9UIFJlYWN0IE5hdGl2ZSwgd2UgdXNlIEJ1ZmZlclxuICAgIHZhciBidWZmZXI7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBidWZmZXIgPSBldmFsKFwicmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyXCIpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGJ1ZmZlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBjb25zdGFudHNcbiAgICB2YXIgYjY0Y2hhcnNcbiAgICAgICAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG4gICAgdmFyIGI2NHRhYiA9IGZ1bmN0aW9uKGJpbikge1xuICAgICAgICB2YXIgdCA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGJpbi5sZW5ndGg7IGkgPCBsOyBpKyspIHRbYmluLmNoYXJBdChpKV0gPSBpO1xuICAgICAgICByZXR1cm4gdDtcbiAgICB9KGI2NGNoYXJzKTtcbiAgICB2YXIgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcbiAgICAvLyBlbmNvZGVyIHN0dWZmXG4gICAgdmFyIGNiX3V0b2IgPSBmdW5jdGlvbihjKSB7XG4gICAgICAgIGlmIChjLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIHZhciBjYyA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgIHJldHVybiBjYyA8IDB4ODAgPyBjXG4gICAgICAgICAgICAgICAgOiBjYyA8IDB4ODAwID8gKGZyb21DaGFyQ29kZSgweGMwIHwgKGNjID4+PiA2KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoMHg4MCB8IChjYyAmIDB4M2YpKSlcbiAgICAgICAgICAgICAgICA6IChmcm9tQ2hhckNvZGUoMHhlMCB8ICgoY2MgPj4+IDEyKSAmIDB4MGYpKVxuICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKDB4ODAgfCAoKGNjID4+PiAgNikgJiAweDNmKSlcbiAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgweDgwIHwgKCBjYyAgICAgICAgICYgMHgzZikpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBjYyA9IDB4MTAwMDBcbiAgICAgICAgICAgICAgICArIChjLmNoYXJDb2RlQXQoMCkgLSAweEQ4MDApICogMHg0MDBcbiAgICAgICAgICAgICAgICArIChjLmNoYXJDb2RlQXQoMSkgLSAweERDMDApO1xuICAgICAgICAgICAgcmV0dXJuIChmcm9tQ2hhckNvZGUoMHhmMCB8ICgoY2MgPj4+IDE4KSAmIDB4MDcpKVxuICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgweDgwIHwgKChjYyA+Pj4gMTIpICYgMHgzZikpXG4gICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKDB4ODAgfCAoKGNjID4+PiAgNikgJiAweDNmKSlcbiAgICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoMHg4MCB8ICggY2MgICAgICAgICAmIDB4M2YpKSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHZhciByZV91dG9iID0gL1tcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRkZdfFteXFx4MDAtXFx4N0ZdL2c7XG4gICAgdmFyIHV0b2IgPSBmdW5jdGlvbih1KSB7XG4gICAgICAgIHJldHVybiB1LnJlcGxhY2UocmVfdXRvYiwgY2JfdXRvYik7XG4gICAgfTtcbiAgICB2YXIgY2JfZW5jb2RlID0gZnVuY3Rpb24oY2NjKSB7XG4gICAgICAgIHZhciBwYWRsZW4gPSBbMCwgMiwgMV1bY2NjLmxlbmd0aCAlIDNdLFxuICAgICAgICBvcmQgPSBjY2MuY2hhckNvZGVBdCgwKSA8PCAxNlxuICAgICAgICAgICAgfCAoKGNjYy5sZW5ndGggPiAxID8gY2NjLmNoYXJDb2RlQXQoMSkgOiAwKSA8PCA4KVxuICAgICAgICAgICAgfCAoKGNjYy5sZW5ndGggPiAyID8gY2NjLmNoYXJDb2RlQXQoMikgOiAwKSksXG4gICAgICAgIGNoYXJzID0gW1xuICAgICAgICAgICAgYjY0Y2hhcnMuY2hhckF0KCBvcmQgPj4+IDE4KSxcbiAgICAgICAgICAgIGI2NGNoYXJzLmNoYXJBdCgob3JkID4+PiAxMikgJiA2MyksXG4gICAgICAgICAgICBwYWRsZW4gPj0gMiA/ICc9JyA6IGI2NGNoYXJzLmNoYXJBdCgob3JkID4+PiA2KSAmIDYzKSxcbiAgICAgICAgICAgIHBhZGxlbiA+PSAxID8gJz0nIDogYjY0Y2hhcnMuY2hhckF0KG9yZCAmIDYzKVxuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gICAgfTtcbiAgICB2YXIgYnRvYSA9IGdsb2JhbC5idG9hID8gZnVuY3Rpb24oYikge1xuICAgICAgICByZXR1cm4gZ2xvYmFsLmJ0b2EoYik7XG4gICAgfSA6IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgcmV0dXJuIGIucmVwbGFjZSgvW1xcc1xcU117MSwzfS9nLCBjYl9lbmNvZGUpO1xuICAgIH07XG4gICAgdmFyIF9lbmNvZGUgPSBidWZmZXIgP1xuICAgICAgICBidWZmZXIuZnJvbSAmJiBVaW50OEFycmF5ICYmIGJ1ZmZlci5mcm9tICE9PSBVaW50OEFycmF5LmZyb21cbiAgICAgICAgPyBmdW5jdGlvbiAodSkge1xuICAgICAgICAgICAgcmV0dXJuICh1LmNvbnN0cnVjdG9yID09PSBidWZmZXIuY29uc3RydWN0b3IgPyB1IDogYnVmZmVyLmZyb20odSkpXG4gICAgICAgICAgICAgICAgLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgICAgICB9XG4gICAgICAgIDogIGZ1bmN0aW9uICh1KSB7XG4gICAgICAgICAgICByZXR1cm4gKHUuY29uc3RydWN0b3IgPT09IGJ1ZmZlci5jb25zdHJ1Y3RvciA/IHUgOiBuZXcgIGJ1ZmZlcih1KSlcbiAgICAgICAgICAgICAgICAudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgICAgIH1cbiAgICAgICAgOiBmdW5jdGlvbiAodSkgeyByZXR1cm4gYnRvYSh1dG9iKHUpKSB9XG4gICAgO1xuICAgIHZhciBlbmNvZGUgPSBmdW5jdGlvbih1LCB1cmlzYWZlKSB7XG4gICAgICAgIHJldHVybiAhdXJpc2FmZVxuICAgICAgICAgICAgPyBfZW5jb2RlKFN0cmluZyh1KSlcbiAgICAgICAgICAgIDogX2VuY29kZShTdHJpbmcodSkpLnJlcGxhY2UoL1srXFwvXS9nLCBmdW5jdGlvbihtMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtMCA9PSAnKycgPyAnLScgOiAnXyc7XG4gICAgICAgICAgICB9KS5yZXBsYWNlKC89L2csICcnKTtcbiAgICB9O1xuICAgIHZhciBlbmNvZGVVUkkgPSBmdW5jdGlvbih1KSB7IHJldHVybiBlbmNvZGUodSwgdHJ1ZSkgfTtcbiAgICAvLyBkZWNvZGVyIHN0dWZmXG4gICAgdmFyIHJlX2J0b3UgPSBuZXcgUmVnRXhwKFtcbiAgICAgICAgJ1tcXHhDMC1cXHhERl1bXFx4ODAtXFx4QkZdJyxcbiAgICAgICAgJ1tcXHhFMC1cXHhFRl1bXFx4ODAtXFx4QkZdezJ9JyxcbiAgICAgICAgJ1tcXHhGMC1cXHhGN11bXFx4ODAtXFx4QkZdezN9J1xuICAgIF0uam9pbignfCcpLCAnZycpO1xuICAgIHZhciBjYl9idG91ID0gZnVuY3Rpb24oY2NjYykge1xuICAgICAgICBzd2l0Y2goY2NjYy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgdmFyIGNwID0gKCgweDA3ICYgY2NjYy5jaGFyQ29kZUF0KDApKSA8PCAxOClcbiAgICAgICAgICAgICAgICB8ICAgICgoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgxKSkgPDwgMTIpXG4gICAgICAgICAgICAgICAgfCAgICAoKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMikpIDw8ICA2KVxuICAgICAgICAgICAgICAgIHwgICAgICgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDMpKSxcbiAgICAgICAgICAgIG9mZnNldCA9IGNwIC0gMHgxMDAwMDtcbiAgICAgICAgICAgIHJldHVybiAoZnJvbUNoYXJDb2RlKChvZmZzZXQgID4+PiAxMCkgKyAweEQ4MDApXG4gICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKChvZmZzZXQgJiAweDNGRikgKyAweERDMDApKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIGZyb21DaGFyQ29kZShcbiAgICAgICAgICAgICAgICAoKDB4MGYgJiBjY2NjLmNoYXJDb2RlQXQoMCkpIDw8IDEyKVxuICAgICAgICAgICAgICAgICAgICB8ICgoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgxKSkgPDwgNilcbiAgICAgICAgICAgICAgICAgICAgfCAgKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMikpXG4gICAgICAgICAgICApO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICBmcm9tQ2hhckNvZGUoXG4gICAgICAgICAgICAgICAgKCgweDFmICYgY2NjYy5jaGFyQ29kZUF0KDApKSA8PCA2KVxuICAgICAgICAgICAgICAgICAgICB8ICAoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgxKSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHZhciBidG91ID0gZnVuY3Rpb24oYikge1xuICAgICAgICByZXR1cm4gYi5yZXBsYWNlKHJlX2J0b3UsIGNiX2J0b3UpO1xuICAgIH07XG4gICAgdmFyIGNiX2RlY29kZSA9IGZ1bmN0aW9uKGNjY2MpIHtcbiAgICAgICAgdmFyIGxlbiA9IGNjY2MubGVuZ3RoLFxuICAgICAgICBwYWRsZW4gPSBsZW4gJSA0LFxuICAgICAgICBuID0gKGxlbiA+IDAgPyBiNjR0YWJbY2NjYy5jaGFyQXQoMCldIDw8IDE4IDogMClcbiAgICAgICAgICAgIHwgKGxlbiA+IDEgPyBiNjR0YWJbY2NjYy5jaGFyQXQoMSldIDw8IDEyIDogMClcbiAgICAgICAgICAgIHwgKGxlbiA+IDIgPyBiNjR0YWJbY2NjYy5jaGFyQXQoMildIDw8ICA2IDogMClcbiAgICAgICAgICAgIHwgKGxlbiA+IDMgPyBiNjR0YWJbY2NjYy5jaGFyQXQoMyldICAgICAgIDogMCksXG4gICAgICAgIGNoYXJzID0gW1xuICAgICAgICAgICAgZnJvbUNoYXJDb2RlKCBuID4+PiAxNiksXG4gICAgICAgICAgICBmcm9tQ2hhckNvZGUoKG4gPj4+ICA4KSAmIDB4ZmYpLFxuICAgICAgICAgICAgZnJvbUNoYXJDb2RlKCBuICAgICAgICAgJiAweGZmKVxuICAgICAgICBdO1xuICAgICAgICBjaGFycy5sZW5ndGggLT0gWzAsIDAsIDIsIDFdW3BhZGxlbl07XG4gICAgICAgIHJldHVybiBjaGFycy5qb2luKCcnKTtcbiAgICB9O1xuICAgIHZhciBhdG9iID0gZ2xvYmFsLmF0b2IgPyBmdW5jdGlvbihhKSB7XG4gICAgICAgIHJldHVybiBnbG9iYWwuYXRvYihhKTtcbiAgICB9IDogZnVuY3Rpb24oYSl7XG4gICAgICAgIHJldHVybiBhLnJlcGxhY2UoL1tcXHNcXFNdezEsNH0vZywgY2JfZGVjb2RlKTtcbiAgICB9O1xuICAgIHZhciBfZGVjb2RlID0gYnVmZmVyID9cbiAgICAgICAgYnVmZmVyLmZyb20gJiYgVWludDhBcnJheSAmJiBidWZmZXIuZnJvbSAhPT0gVWludDhBcnJheS5mcm9tXG4gICAgICAgID8gZnVuY3Rpb24oYSkge1xuICAgICAgICAgICAgcmV0dXJuIChhLmNvbnN0cnVjdG9yID09PSBidWZmZXIuY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICAgICAgPyBhIDogYnVmZmVyLmZyb20oYSwgJ2Jhc2U2NCcpKS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIDogZnVuY3Rpb24oYSkge1xuICAgICAgICAgICAgcmV0dXJuIChhLmNvbnN0cnVjdG9yID09PSBidWZmZXIuY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICAgICAgPyBhIDogbmV3IGJ1ZmZlcihhLCAnYmFzZTY0JykpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgOiBmdW5jdGlvbihhKSB7IHJldHVybiBidG91KGF0b2IoYSkpIH07XG4gICAgdmFyIGRlY29kZSA9IGZ1bmN0aW9uKGEpe1xuICAgICAgICByZXR1cm4gX2RlY29kZShcbiAgICAgICAgICAgIFN0cmluZyhhKS5yZXBsYWNlKC9bLV9dL2csIGZ1bmN0aW9uKG0wKSB7IHJldHVybiBtMCA9PSAnLScgPyAnKycgOiAnLycgfSlcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9dL2csICcnKVxuICAgICAgICApO1xuICAgIH07XG4gICAgdmFyIG5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIEJhc2U2NCA9IGdsb2JhbC5CYXNlNjQ7XG4gICAgICAgIGdsb2JhbC5CYXNlNjQgPSBfQmFzZTY0O1xuICAgICAgICByZXR1cm4gQmFzZTY0O1xuICAgIH07XG4gICAgLy8gZXhwb3J0IEJhc2U2NFxuICAgIGdsb2JhbC5CYXNlNjQgPSB7XG4gICAgICAgIFZFUlNJT046IHZlcnNpb24sXG4gICAgICAgIGF0b2I6IGF0b2IsXG4gICAgICAgIGJ0b2E6IGJ0b2EsXG4gICAgICAgIGZyb21CYXNlNjQ6IGRlY29kZSxcbiAgICAgICAgdG9CYXNlNjQ6IGVuY29kZSxcbiAgICAgICAgdXRvYjogdXRvYixcbiAgICAgICAgZW5jb2RlOiBlbmNvZGUsXG4gICAgICAgIGVuY29kZVVSSTogZW5jb2RlVVJJLFxuICAgICAgICBidG91OiBidG91LFxuICAgICAgICBkZWNvZGU6IGRlY29kZSxcbiAgICAgICAgbm9Db25mbGljdDogbm9Db25mbGljdCxcbiAgICAgICAgX19idWZmZXJfXzogYnVmZmVyXG4gICAgfTtcbiAgICAvLyBpZiBFUzUgaXMgYXZhaWxhYmxlLCBtYWtlIEJhc2U2NC5leHRlbmRTdHJpbmcoKSBhdmFpbGFibGVcbiAgICBpZiAodHlwZW9mIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgbm9FbnVtID0gZnVuY3Rpb24odil7XG4gICAgICAgICAgICByZXR1cm4ge3ZhbHVlOnYsZW51bWVyYWJsZTpmYWxzZSx3cml0YWJsZTp0cnVlLGNvbmZpZ3VyYWJsZTp0cnVlfTtcbiAgICAgICAgfTtcbiAgICAgICAgZ2xvYmFsLkJhc2U2NC5leHRlbmRTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgU3RyaW5nLnByb3RvdHlwZSwgJ2Zyb21CYXNlNjQnLCBub0VudW0oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2RlKHRoaXMpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgIFN0cmluZy5wcm90b3R5cGUsICd0b0Jhc2U2NCcsIG5vRW51bShmdW5jdGlvbiAodXJpc2FmZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW5jb2RlKHRoaXMsIHVyaXNhZmUpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgIFN0cmluZy5wcm90b3R5cGUsICd0b0Jhc2U2NFVSSScsIG5vRW51bShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbmNvZGUodGhpcywgdHJ1ZSlcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vXG4gICAgLy8gZXhwb3J0IEJhc2U2NCB0byB0aGUgbmFtZXNwYWNlXG4gICAgLy9cbiAgICBpZiAoZ2xvYmFsWydNZXRlb3InXSkgeyAvLyBNZXRlb3IuanNcbiAgICAgICAgQmFzZTY0ID0gZ2xvYmFsLkJhc2U2NDtcbiAgICB9XG4gICAgLy8gbW9kdWxlLmV4cG9ydHMgYW5kIEFNRCBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlLlxuICAgIC8vIG1vZHVsZS5leHBvcnRzIGhhcyBwcmVjZWRlbmNlLlxuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cy5CYXNlNjQgPSBnbG9iYWwuQmFzZTY0O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCl7IHJldHVybiBnbG9iYWwuQmFzZTY0IH0pO1xuICAgIH1cbiAgICAvLyB0aGF0J3MgaXQhXG4gICAgcmV0dXJuIHtCYXNlNjQ6IGdsb2JhbC5CYXNlNjR9XG59KSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIERlY29kZSBhIFVSSSBlbmNvZGVkIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFVSSSBlbmNvZGVkIHN0cmluZy5cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBkZWNvZGVkIHN0cmluZy5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChpbnB1dC5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG59XG5cbi8qKlxuICogU2ltcGxlIHF1ZXJ5IHN0cmluZyBwYXJzZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHF1ZXJ5IFRoZSBxdWVyeSBzdHJpbmcgdGhhdCBuZWVkcyB0byBiZSBwYXJzZWQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gcXVlcnlzdHJpbmcocXVlcnkpIHtcbiAgdmFyIHBhcnNlciA9IC8oW149PyZdKyk9PyhbXiZdKikvZ1xuICAgICwgcmVzdWx0ID0ge31cbiAgICAsIHBhcnQ7XG5cbiAgd2hpbGUgKHBhcnQgPSBwYXJzZXIuZXhlYyhxdWVyeSkpIHtcbiAgICB2YXIga2V5ID0gZGVjb2RlKHBhcnRbMV0pXG4gICAgICAsIHZhbHVlID0gZGVjb2RlKHBhcnRbMl0pO1xuXG4gICAgLy9cbiAgICAvLyBQcmV2ZW50IG92ZXJyaWRpbmcgb2YgZXhpc3RpbmcgcHJvcGVydGllcy4gVGhpcyBlbnN1cmVzIHRoYXQgYnVpbGQtaW5cbiAgICAvLyBtZXRob2RzIGxpa2UgYHRvU3RyaW5nYCBvciBfX3Byb3RvX18gYXJlIG5vdCBvdmVycmlkZW4gYnkgbWFsaWNpb3VzXG4gICAgLy8gcXVlcnlzdHJpbmdzLlxuICAgIC8vXG4gICAgaWYgKGtleSBpbiByZXN1bHQpIGNvbnRpbnVlO1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhIHF1ZXJ5IHN0cmluZyB0byBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBPYmplY3QgdGhhdCBzaG91bGQgYmUgdHJhbnNmb3JtZWQuXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJlZml4IE9wdGlvbmFsIHByZWZpeC5cbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBxdWVyeXN0cmluZ2lmeShvYmosIHByZWZpeCkge1xuICBwcmVmaXggPSBwcmVmaXggfHwgJyc7XG5cbiAgdmFyIHBhaXJzID0gW107XG5cbiAgLy9cbiAgLy8gT3B0aW9uYWxseSBwcmVmaXggd2l0aCBhICc/JyBpZiBuZWVkZWRcbiAgLy9cbiAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgcHJlZml4KSBwcmVmaXggPSAnPyc7XG5cbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChoYXMuY2FsbChvYmosIGtleSkpIHtcbiAgICAgIHBhaXJzLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyc9JysgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhaXJzLmxlbmd0aCA/IHByZWZpeCArIHBhaXJzLmpvaW4oJyYnKSA6ICcnO1xufVxuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuZXhwb3J0cy5zdHJpbmdpZnkgPSBxdWVyeXN0cmluZ2lmeTtcbmV4cG9ydHMucGFyc2UgPSBxdWVyeXN0cmluZztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDaGVjayBpZiB3ZSdyZSByZXF1aXJlZCB0byBhZGQgYSBwb3J0IG51bWJlci5cbiAqXG4gKiBAc2VlIGh0dHBzOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jZGVmYXVsdC1wb3J0XG4gKiBAcGFyYW0ge051bWJlcnxTdHJpbmd9IHBvcnQgUG9ydCBudW1iZXIgd2UgbmVlZCB0byBjaGVja1xuICogQHBhcmFtIHtTdHJpbmd9IHByb3RvY29sIFByb3RvY29sIHdlIG5lZWQgdG8gY2hlY2sgYWdhaW5zdC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJcyBpdCBhIGRlZmF1bHQgcG9ydCBmb3IgdGhlIGdpdmVuIHByb3RvY29sXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXF1aXJlZChwb3J0LCBwcm90b2NvbCkge1xuICBwcm90b2NvbCA9IHByb3RvY29sLnNwbGl0KCc6JylbMF07XG4gIHBvcnQgPSArcG9ydDtcblxuICBpZiAoIXBvcnQpIHJldHVybiBmYWxzZTtcblxuICBzd2l0Y2ggKHByb3RvY29sKSB7XG4gICAgY2FzZSAnaHR0cCc6XG4gICAgY2FzZSAnd3MnOlxuICAgIHJldHVybiBwb3J0ICE9PSA4MDtcblxuICAgIGNhc2UgJ2h0dHBzJzpcbiAgICBjYXNlICd3c3MnOlxuICAgIHJldHVybiBwb3J0ICE9PSA0NDM7XG5cbiAgICBjYXNlICdmdHAnOlxuICAgIHJldHVybiBwb3J0ICE9PSAyMTtcblxuICAgIGNhc2UgJ2dvcGhlcic6XG4gICAgcmV0dXJuIHBvcnQgIT09IDcwO1xuXG4gICAgY2FzZSAnZmlsZSc6XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHBvcnQgIT09IDA7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVxdWlyZWQgPSByZXF1aXJlKCdyZXF1aXJlcy1wb3J0JylcbiAgLCBxcyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5naWZ5JylcbiAgLCBwcm90b2NvbHJlID0gL14oW2Etel1bYS16MC05ListXSo6KT8oXFwvXFwvKT8oW1xcU1xcc10qKS9pXG4gICwgc2xhc2hlcyA9IC9eW0EtWmEtel1bQS1aYS16MC05Ky0uXSo6XFwvXFwvLztcblxuLyoqXG4gKiBUaGVzZSBhcmUgdGhlIHBhcnNlIHJ1bGVzIGZvciB0aGUgVVJMIHBhcnNlciwgaXQgaW5mb3JtcyB0aGUgcGFyc2VyXG4gKiBhYm91dDpcbiAqXG4gKiAwLiBUaGUgY2hhciBpdCBOZWVkcyB0byBwYXJzZSwgaWYgaXQncyBhIHN0cmluZyBpdCBzaG91bGQgYmUgZG9uZSB1c2luZ1xuICogICAgaW5kZXhPZiwgUmVnRXhwIHVzaW5nIGV4ZWMgYW5kIE5hTiBtZWFucyBzZXQgYXMgY3VycmVudCB2YWx1ZS5cbiAqIDEuIFRoZSBwcm9wZXJ0eSB3ZSBzaG91bGQgc2V0IHdoZW4gcGFyc2luZyB0aGlzIHZhbHVlLlxuICogMi4gSW5kaWNhdGlvbiBpZiBpdCdzIGJhY2t3YXJkcyBvciBmb3J3YXJkIHBhcnNpbmcsIHdoZW4gc2V0IGFzIG51bWJlciBpdCdzXG4gKiAgICB0aGUgdmFsdWUgb2YgZXh0cmEgY2hhcnMgdGhhdCBzaG91bGQgYmUgc3BsaXQgb2ZmLlxuICogMy4gSW5oZXJpdCBmcm9tIGxvY2F0aW9uIGlmIG5vbiBleGlzdGluZyBpbiB0aGUgcGFyc2VyLlxuICogNC4gYHRvTG93ZXJDYXNlYCB0aGUgcmVzdWx0aW5nIHZhbHVlLlxuICovXG52YXIgcnVsZXMgPSBbXG4gIFsnIycsICdoYXNoJ10sICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBmcm9tIHRoZSBiYWNrLlxuICBbJz8nLCAncXVlcnknXSwgICAgICAgICAgICAgICAgICAgICAgIC8vIEV4dHJhY3QgZnJvbSB0aGUgYmFjay5cbiAgZnVuY3Rpb24gc2FuaXRpemUoYWRkcmVzcykgeyAgICAgICAgICAvLyBTYW5pdGl6ZSB3aGF0IGlzIGxlZnQgb2YgdGhlIGFkZHJlc3NcbiAgICByZXR1cm4gYWRkcmVzcy5yZXBsYWNlKCdcXFxcJywgJy8nKTtcbiAgfSxcbiAgWycvJywgJ3BhdGhuYW1lJ10sICAgICAgICAgICAgICAgICAgICAvLyBFeHRyYWN0IGZyb20gdGhlIGJhY2suXG4gIFsnQCcsICdhdXRoJywgMV0sICAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBmcm9tIHRoZSBmcm9udC5cbiAgW05hTiwgJ2hvc3QnLCB1bmRlZmluZWQsIDEsIDFdLCAgICAgICAvLyBTZXQgbGVmdCBvdmVyIHZhbHVlLlxuICBbLzooXFxkKykkLywgJ3BvcnQnLCB1bmRlZmluZWQsIDFdLCAgICAvLyBSZWdFeHAgdGhlIGJhY2suXG4gIFtOYU4sICdob3N0bmFtZScsIHVuZGVmaW5lZCwgMSwgMV0gICAgLy8gU2V0IGxlZnQgb3Zlci5cbl07XG5cbi8qKlxuICogVGhlc2UgcHJvcGVydGllcyBzaG91bGQgbm90IGJlIGNvcGllZCBvciBpbmhlcml0ZWQgZnJvbS4gVGhpcyBpcyBvbmx5IG5lZWRlZFxuICogZm9yIGFsbCBub24gYmxvYiBVUkwncyBhcyBhIGJsb2IgVVJMIGRvZXMgbm90IGluY2x1ZGUgYSBoYXNoLCBvbmx5IHRoZVxuICogb3JpZ2luLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG52YXIgaWdub3JlID0geyBoYXNoOiAxLCBxdWVyeTogMSB9O1xuXG4vKipcbiAqIFRoZSBsb2NhdGlvbiBvYmplY3QgZGlmZmVycyB3aGVuIHlvdXIgY29kZSBpcyBsb2FkZWQgdGhyb3VnaCBhIG5vcm1hbCBwYWdlLFxuICogV29ya2VyIG9yIHRocm91Z2ggYSB3b3JrZXIgdXNpbmcgYSBibG9iLiBBbmQgd2l0aCB0aGUgYmxvYmJsZSBiZWdpbnMgdGhlXG4gKiB0cm91YmxlIGFzIHRoZSBsb2NhdGlvbiBvYmplY3Qgd2lsbCBjb250YWluIHRoZSBVUkwgb2YgdGhlIGJsb2IsIG5vdCB0aGVcbiAqIGxvY2F0aW9uIG9mIHRoZSBwYWdlIHdoZXJlIG91ciBjb2RlIGlzIGxvYWRlZCBpbi4gVGhlIGFjdHVhbCBvcmlnaW4gaXNcbiAqIGVuY29kZWQgaW4gdGhlIGBwYXRobmFtZWAgc28gd2UgY2FuIHRoYW5rZnVsbHkgZ2VuZXJhdGUgYSBnb29kIFwiZGVmYXVsdFwiXG4gKiBsb2NhdGlvbiBmcm9tIGl0IHNvIHdlIGNhbiBnZW5lcmF0ZSBwcm9wZXIgcmVsYXRpdmUgVVJMJ3MgYWdhaW4uXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBsb2MgT3B0aW9uYWwgZGVmYXVsdCBsb2NhdGlvbiBvYmplY3QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBsb2xjYXRpb24gb2JqZWN0LlxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiBsb2xjYXRpb24obG9jKSB7XG4gIHZhciBsb2NhdGlvbiA9IGdsb2JhbCAmJiBnbG9iYWwubG9jYXRpb24gfHwge307XG4gIGxvYyA9IGxvYyB8fCBsb2NhdGlvbjtcblxuICB2YXIgZmluYWxkZXN0aW5hdGlvbiA9IHt9XG4gICAgLCB0eXBlID0gdHlwZW9mIGxvY1xuICAgICwga2V5O1xuXG4gIGlmICgnYmxvYjonID09PSBsb2MucHJvdG9jb2wpIHtcbiAgICBmaW5hbGRlc3RpbmF0aW9uID0gbmV3IFVybCh1bmVzY2FwZShsb2MucGF0aG5hbWUpLCB7fSk7XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT09IHR5cGUpIHtcbiAgICBmaW5hbGRlc3RpbmF0aW9uID0gbmV3IFVybChsb2MsIHt9KTtcbiAgICBmb3IgKGtleSBpbiBpZ25vcmUpIGRlbGV0ZSBmaW5hbGRlc3RpbmF0aW9uW2tleV07XG4gIH0gZWxzZSBpZiAoJ29iamVjdCcgPT09IHR5cGUpIHtcbiAgICBmb3IgKGtleSBpbiBsb2MpIHtcbiAgICAgIGlmIChrZXkgaW4gaWdub3JlKSBjb250aW51ZTtcbiAgICAgIGZpbmFsZGVzdGluYXRpb25ba2V5XSA9IGxvY1trZXldO1xuICAgIH1cblxuICAgIGlmIChmaW5hbGRlc3RpbmF0aW9uLnNsYXNoZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZmluYWxkZXN0aW5hdGlvbi5zbGFzaGVzID0gc2xhc2hlcy50ZXN0KGxvYy5ocmVmKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmluYWxkZXN0aW5hdGlvbjtcbn1cblxuLyoqXG4gKiBAdHlwZWRlZiBQcm90b2NvbEV4dHJhY3RcbiAqIEB0eXBlIE9iamVjdFxuICogQHByb3BlcnR5IHtTdHJpbmd9IHByb3RvY29sIFByb3RvY29sIG1hdGNoZWQgaW4gdGhlIFVSTCwgaW4gbG93ZXJjYXNlLlxuICogQHByb3BlcnR5IHtCb29sZWFufSBzbGFzaGVzIGB0cnVlYCBpZiBwcm90b2NvbCBpcyBmb2xsb3dlZCBieSBcIi8vXCIsIGVsc2UgYGZhbHNlYC5cbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSByZXN0IFJlc3Qgb2YgdGhlIFVSTCB0aGF0IGlzIG5vdCBwYXJ0IG9mIHRoZSBwcm90b2NvbC5cbiAqL1xuXG4vKipcbiAqIEV4dHJhY3QgcHJvdG9jb2wgaW5mb3JtYXRpb24gZnJvbSBhIFVSTCB3aXRoL3dpdGhvdXQgZG91YmxlIHNsYXNoIChcIi8vXCIpLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhZGRyZXNzIFVSTCB3ZSB3YW50IHRvIGV4dHJhY3QgZnJvbS5cbiAqIEByZXR1cm4ge1Byb3RvY29sRXh0cmFjdH0gRXh0cmFjdGVkIGluZm9ybWF0aW9uLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZXh0cmFjdFByb3RvY29sKGFkZHJlc3MpIHtcbiAgdmFyIG1hdGNoID0gcHJvdG9jb2xyZS5leGVjKGFkZHJlc3MpO1xuXG4gIHJldHVybiB7XG4gICAgcHJvdG9jb2w6IG1hdGNoWzFdID8gbWF0Y2hbMV0udG9Mb3dlckNhc2UoKSA6ICcnLFxuICAgIHNsYXNoZXM6ICEhbWF0Y2hbMl0sXG4gICAgcmVzdDogbWF0Y2hbM11cbiAgfTtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGEgcmVsYXRpdmUgVVJMIHBhdGhuYW1lIGFnYWluc3QgYSBiYXNlIFVSTCBwYXRobmFtZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcmVsYXRpdmUgUGF0aG5hbWUgb2YgdGhlIHJlbGF0aXZlIFVSTC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBiYXNlIFBhdGhuYW1lIG9mIHRoZSBiYXNlIFVSTC5cbiAqIEByZXR1cm4ge1N0cmluZ30gUmVzb2x2ZWQgcGF0aG5hbWUuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiByZXNvbHZlKHJlbGF0aXZlLCBiYXNlKSB7XG4gIHZhciBwYXRoID0gKGJhc2UgfHwgJy8nKS5zcGxpdCgnLycpLnNsaWNlKDAsIC0xKS5jb25jYXQocmVsYXRpdmUuc3BsaXQoJy8nKSlcbiAgICAsIGkgPSBwYXRoLmxlbmd0aFxuICAgICwgbGFzdCA9IHBhdGhbaSAtIDFdXG4gICAgLCB1bnNoaWZ0ID0gZmFsc2VcbiAgICAsIHVwID0gMDtcblxuICB3aGlsZSAoaS0tKSB7XG4gICAgaWYgKHBhdGhbaV0gPT09ICcuJykge1xuICAgICAgcGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChwYXRoW2ldID09PSAnLi4nKSB7XG4gICAgICBwYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgaWYgKGkgPT09IDApIHVuc2hpZnQgPSB0cnVlO1xuICAgICAgcGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIGlmICh1bnNoaWZ0KSBwYXRoLnVuc2hpZnQoJycpO1xuICBpZiAobGFzdCA9PT0gJy4nIHx8IGxhc3QgPT09ICcuLicpIHBhdGgucHVzaCgnJyk7XG5cbiAgcmV0dXJuIHBhdGguam9pbignLycpO1xufVxuXG4vKipcbiAqIFRoZSBhY3R1YWwgVVJMIGluc3RhbmNlLiBJbnN0ZWFkIG9mIHJldHVybmluZyBhbiBvYmplY3Qgd2UndmUgb3B0ZWQtaW4gdG9cbiAqIGNyZWF0ZSBhbiBhY3R1YWwgY29uc3RydWN0b3IgYXMgaXQncyBtdWNoIG1vcmUgbWVtb3J5IGVmZmljaWVudCBhbmRcbiAqIGZhc3RlciBhbmQgaXQgcGxlYXNlcyBteSBPQ0QuXG4gKlxuICogSXQgaXMgd29ydGggbm90aW5nIHRoYXQgd2Ugc2hvdWxkIG5vdCB1c2UgYFVSTGAgYXMgY2xhc3MgbmFtZSB0byBwcmV2ZW50XG4gKiBjbGFzaGVzIHdpdGggdGhlIGdsb2JhbCBVUkwgaW5zdGFuY2UgdGhhdCBnb3QgaW50cm9kdWNlZCBpbiBicm93c2Vycy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBhZGRyZXNzIFVSTCB3ZSB3YW50IHRvIHBhcnNlLlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBsb2NhdGlvbiBMb2NhdGlvbiBkZWZhdWx0cyBmb3IgcmVsYXRpdmUgcGF0aHMuXG4gKiBAcGFyYW0ge0Jvb2xlYW58RnVuY3Rpb259IHBhcnNlciBQYXJzZXIgZm9yIHRoZSBxdWVyeSBzdHJpbmcuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBVcmwoYWRkcmVzcywgbG9jYXRpb24sIHBhcnNlcikge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgVXJsKSkge1xuICAgIHJldHVybiBuZXcgVXJsKGFkZHJlc3MsIGxvY2F0aW9uLCBwYXJzZXIpO1xuICB9XG5cbiAgdmFyIHJlbGF0aXZlLCBleHRyYWN0ZWQsIHBhcnNlLCBpbnN0cnVjdGlvbiwgaW5kZXgsIGtleVxuICAgICwgaW5zdHJ1Y3Rpb25zID0gcnVsZXMuc2xpY2UoKVxuICAgICwgdHlwZSA9IHR5cGVvZiBsb2NhdGlvblxuICAgICwgdXJsID0gdGhpc1xuICAgICwgaSA9IDA7XG5cbiAgLy9cbiAgLy8gVGhlIGZvbGxvd2luZyBpZiBzdGF0ZW1lbnRzIGFsbG93cyB0aGlzIG1vZHVsZSB0d28gaGF2ZSBjb21wYXRpYmlsaXR5IHdpdGhcbiAgLy8gMiBkaWZmZXJlbnQgQVBJOlxuICAvL1xuICAvLyAxLiBOb2RlLmpzJ3MgYHVybC5wYXJzZWAgYXBpIHdoaWNoIGFjY2VwdHMgYSBVUkwsIGJvb2xlYW4gYXMgYXJndW1lbnRzXG4gIC8vICAgIHdoZXJlIHRoZSBib29sZWFuIGluZGljYXRlcyB0aGF0IHRoZSBxdWVyeSBzdHJpbmcgc2hvdWxkIGFsc28gYmUgcGFyc2VkLlxuICAvL1xuICAvLyAyLiBUaGUgYFVSTGAgaW50ZXJmYWNlIG9mIHRoZSBicm93c2VyIHdoaWNoIGFjY2VwdHMgYSBVUkwsIG9iamVjdCBhc1xuICAvLyAgICBhcmd1bWVudHMuIFRoZSBzdXBwbGllZCBvYmplY3Qgd2lsbCBiZSB1c2VkIGFzIGRlZmF1bHQgdmFsdWVzIC8gZmFsbC1iYWNrXG4gIC8vICAgIGZvciByZWxhdGl2ZSBwYXRocy5cbiAgLy9cbiAgaWYgKCdvYmplY3QnICE9PSB0eXBlICYmICdzdHJpbmcnICE9PSB0eXBlKSB7XG4gICAgcGFyc2VyID0gbG9jYXRpb247XG4gICAgbG9jYXRpb24gPSBudWxsO1xuICB9XG5cbiAgaWYgKHBhcnNlciAmJiAnZnVuY3Rpb24nICE9PSB0eXBlb2YgcGFyc2VyKSBwYXJzZXIgPSBxcy5wYXJzZTtcblxuICBsb2NhdGlvbiA9IGxvbGNhdGlvbihsb2NhdGlvbik7XG5cbiAgLy9cbiAgLy8gRXh0cmFjdCBwcm90b2NvbCBpbmZvcm1hdGlvbiBiZWZvcmUgcnVubmluZyB0aGUgaW5zdHJ1Y3Rpb25zLlxuICAvL1xuICBleHRyYWN0ZWQgPSBleHRyYWN0UHJvdG9jb2woYWRkcmVzcyB8fCAnJyk7XG4gIHJlbGF0aXZlID0gIWV4dHJhY3RlZC5wcm90b2NvbCAmJiAhZXh0cmFjdGVkLnNsYXNoZXM7XG4gIHVybC5zbGFzaGVzID0gZXh0cmFjdGVkLnNsYXNoZXMgfHwgcmVsYXRpdmUgJiYgbG9jYXRpb24uc2xhc2hlcztcbiAgdXJsLnByb3RvY29sID0gZXh0cmFjdGVkLnByb3RvY29sIHx8IGxvY2F0aW9uLnByb3RvY29sIHx8ICcnO1xuICBhZGRyZXNzID0gZXh0cmFjdGVkLnJlc3Q7XG5cbiAgLy9cbiAgLy8gV2hlbiB0aGUgYXV0aG9yaXR5IGNvbXBvbmVudCBpcyBhYnNlbnQgdGhlIFVSTCBzdGFydHMgd2l0aCBhIHBhdGhcbiAgLy8gY29tcG9uZW50LlxuICAvL1xuICBpZiAoIWV4dHJhY3RlZC5zbGFzaGVzKSBpbnN0cnVjdGlvbnNbM10gPSBbLyguKikvLCAncGF0aG5hbWUnXTtcblxuICBmb3IgKDsgaSA8IGluc3RydWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIGluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb25zW2ldO1xuXG4gICAgaWYgKHR5cGVvZiBpbnN0cnVjdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYWRkcmVzcyA9IGluc3RydWN0aW9uKGFkZHJlc3MpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgcGFyc2UgPSBpbnN0cnVjdGlvblswXTtcbiAgICBrZXkgPSBpbnN0cnVjdGlvblsxXTtcblxuICAgIGlmIChwYXJzZSAhPT0gcGFyc2UpIHtcbiAgICAgIHVybFtrZXldID0gYWRkcmVzcztcbiAgICB9IGVsc2UgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgcGFyc2UpIHtcbiAgICAgIGlmICh+KGluZGV4ID0gYWRkcmVzcy5pbmRleE9mKHBhcnNlKSkpIHtcbiAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgaW5zdHJ1Y3Rpb25bMl0pIHtcbiAgICAgICAgICB1cmxba2V5XSA9IGFkZHJlc3Muc2xpY2UoMCwgaW5kZXgpO1xuICAgICAgICAgIGFkZHJlc3MgPSBhZGRyZXNzLnNsaWNlKGluZGV4ICsgaW5zdHJ1Y3Rpb25bMl0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVybFtrZXldID0gYWRkcmVzcy5zbGljZShpbmRleCk7XG4gICAgICAgICAgYWRkcmVzcyA9IGFkZHJlc3Muc2xpY2UoMCwgaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICgoaW5kZXggPSBwYXJzZS5leGVjKGFkZHJlc3MpKSkge1xuICAgICAgdXJsW2tleV0gPSBpbmRleFsxXTtcbiAgICAgIGFkZHJlc3MgPSBhZGRyZXNzLnNsaWNlKDAsIGluZGV4LmluZGV4KTtcbiAgICB9XG5cbiAgICB1cmxba2V5XSA9IHVybFtrZXldIHx8IChcbiAgICAgIHJlbGF0aXZlICYmIGluc3RydWN0aW9uWzNdID8gbG9jYXRpb25ba2V5XSB8fCAnJyA6ICcnXG4gICAgKTtcblxuICAgIC8vXG4gICAgLy8gSG9zdG5hbWUsIGhvc3QgYW5kIHByb3RvY29sIHNob3VsZCBiZSBsb3dlcmNhc2VkIHNvIHRoZXkgY2FuIGJlIHVzZWQgdG9cbiAgICAvLyBjcmVhdGUgYSBwcm9wZXIgYG9yaWdpbmAuXG4gICAgLy9cbiAgICBpZiAoaW5zdHJ1Y3Rpb25bNF0pIHVybFtrZXldID0gdXJsW2tleV0udG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIC8vXG4gIC8vIEFsc28gcGFyc2UgdGhlIHN1cHBsaWVkIHF1ZXJ5IHN0cmluZyBpbiB0byBhbiBvYmplY3QuIElmIHdlJ3JlIHN1cHBsaWVkXG4gIC8vIHdpdGggYSBjdXN0b20gcGFyc2VyIGFzIGZ1bmN0aW9uIHVzZSB0aGF0IGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgYnVpbGQtaW5cbiAgLy8gcGFyc2VyLlxuICAvL1xuICBpZiAocGFyc2VyKSB1cmwucXVlcnkgPSBwYXJzZXIodXJsLnF1ZXJ5KTtcblxuICAvL1xuICAvLyBJZiB0aGUgVVJMIGlzIHJlbGF0aXZlLCByZXNvbHZlIHRoZSBwYXRobmFtZSBhZ2FpbnN0IHRoZSBiYXNlIFVSTC5cbiAgLy9cbiAgaWYgKFxuICAgICAgcmVsYXRpdmVcbiAgICAmJiBsb2NhdGlvbi5zbGFzaGVzXG4gICAgJiYgdXJsLnBhdGhuYW1lLmNoYXJBdCgwKSAhPT0gJy8nXG4gICAgJiYgKHVybC5wYXRobmFtZSAhPT0gJycgfHwgbG9jYXRpb24ucGF0aG5hbWUgIT09ICcnKVxuICApIHtcbiAgICB1cmwucGF0aG5hbWUgPSByZXNvbHZlKHVybC5wYXRobmFtZSwgbG9jYXRpb24ucGF0aG5hbWUpO1xuICB9XG5cbiAgLy9cbiAgLy8gV2Ugc2hvdWxkIG5vdCBhZGQgcG9ydCBudW1iZXJzIGlmIHRoZXkgYXJlIGFscmVhZHkgdGhlIGRlZmF1bHQgcG9ydCBudW1iZXJcbiAgLy8gZm9yIGEgZ2l2ZW4gcHJvdG9jb2wuIEFzIHRoZSBob3N0IGFsc28gY29udGFpbnMgdGhlIHBvcnQgbnVtYmVyIHdlJ3JlIGdvaW5nXG4gIC8vIG92ZXJyaWRlIGl0IHdpdGggdGhlIGhvc3RuYW1lIHdoaWNoIGNvbnRhaW5zIG5vIHBvcnQgbnVtYmVyLlxuICAvL1xuICBpZiAoIXJlcXVpcmVkKHVybC5wb3J0LCB1cmwucHJvdG9jb2wpKSB7XG4gICAgdXJsLmhvc3QgPSB1cmwuaG9zdG5hbWU7XG4gICAgdXJsLnBvcnQgPSAnJztcbiAgfVxuXG4gIC8vXG4gIC8vIFBhcnNlIGRvd24gdGhlIGBhdXRoYCBmb3IgdGhlIHVzZXJuYW1lIGFuZCBwYXNzd29yZC5cbiAgLy9cbiAgdXJsLnVzZXJuYW1lID0gdXJsLnBhc3N3b3JkID0gJyc7XG4gIGlmICh1cmwuYXV0aCkge1xuICAgIGluc3RydWN0aW9uID0gdXJsLmF1dGguc3BsaXQoJzonKTtcbiAgICB1cmwudXNlcm5hbWUgPSBpbnN0cnVjdGlvblswXSB8fCAnJztcbiAgICB1cmwucGFzc3dvcmQgPSBpbnN0cnVjdGlvblsxXSB8fCAnJztcbiAgfVxuXG4gIHVybC5vcmlnaW4gPSB1cmwucHJvdG9jb2wgJiYgdXJsLmhvc3QgJiYgdXJsLnByb3RvY29sICE9PSAnZmlsZTonXG4gICAgPyB1cmwucHJvdG9jb2wgKycvLycrIHVybC5ob3N0XG4gICAgOiAnbnVsbCc7XG5cbiAgLy9cbiAgLy8gVGhlIGhyZWYgaXMganVzdCB0aGUgY29tcGlsZWQgcmVzdWx0LlxuICAvL1xuICB1cmwuaHJlZiA9IHVybC50b1N0cmluZygpO1xufVxuXG4vKipcbiAqIFRoaXMgaXMgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjaGFuZ2luZyBwcm9wZXJ0aWVzIGluIHRoZSBVUkwgaW5zdGFuY2UgdG9cbiAqIGluc3VyZSB0aGF0IHRoZXkgYWxsIHByb3BhZ2F0ZSBjb3JyZWN0bHkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhcnQgICAgICAgICAgUHJvcGVydHkgd2UgbmVlZCB0byBhZGp1c3QuXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZSAgICAgICAgICBUaGUgbmV3bHkgYXNzaWduZWQgdmFsdWUuXG4gKiBAcGFyYW0ge0Jvb2xlYW58RnVuY3Rpb259IGZuICBXaGVuIHNldHRpbmcgdGhlIHF1ZXJ5LCBpdCB3aWxsIGJlIHRoZSBmdW5jdGlvblxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlZCB0byBwYXJzZSB0aGUgcXVlcnkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXaGVuIHNldHRpbmcgdGhlIHByb3RvY29sLCBkb3VibGUgc2xhc2ggd2lsbCBiZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZCBmcm9tIHRoZSBmaW5hbCB1cmwgaWYgaXQgaXMgdHJ1ZS5cbiAqIEByZXR1cm5zIHtVUkx9IFVSTCBpbnN0YW5jZSBmb3IgY2hhaW5pbmcuXG4gKiBAcHVibGljXG4gKi9cbmZ1bmN0aW9uIHNldChwYXJ0LCB2YWx1ZSwgZm4pIHtcbiAgdmFyIHVybCA9IHRoaXM7XG5cbiAgc3dpdGNoIChwYXJ0KSB7XG4gICAgY2FzZSAncXVlcnknOlxuICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgdmFsdWUgJiYgdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgIHZhbHVlID0gKGZuIHx8IHFzLnBhcnNlKSh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHVybFtwYXJ0XSA9IHZhbHVlO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdwb3J0JzpcbiAgICAgIHVybFtwYXJ0XSA9IHZhbHVlO1xuXG4gICAgICBpZiAoIXJlcXVpcmVkKHZhbHVlLCB1cmwucHJvdG9jb2wpKSB7XG4gICAgICAgIHVybC5ob3N0ID0gdXJsLmhvc3RuYW1lO1xuICAgICAgICB1cmxbcGFydF0gPSAnJztcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgdXJsLmhvc3QgPSB1cmwuaG9zdG5hbWUgKyc6JysgdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnaG9zdG5hbWUnOlxuICAgICAgdXJsW3BhcnRdID0gdmFsdWU7XG5cbiAgICAgIGlmICh1cmwucG9ydCkgdmFsdWUgKz0gJzonKyB1cmwucG9ydDtcbiAgICAgIHVybC5ob3N0ID0gdmFsdWU7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2hvc3QnOlxuICAgICAgdXJsW3BhcnRdID0gdmFsdWU7XG5cbiAgICAgIGlmICgvOlxcZCskLy50ZXN0KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnNwbGl0KCc6Jyk7XG4gICAgICAgIHVybC5wb3J0ID0gdmFsdWUucG9wKCk7XG4gICAgICAgIHVybC5ob3N0bmFtZSA9IHZhbHVlLmpvaW4oJzonKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVybC5ob3N0bmFtZSA9IHZhbHVlO1xuICAgICAgICB1cmwucG9ydCA9ICcnO1xuICAgICAgfVxuXG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3Byb3RvY29sJzpcbiAgICAgIHVybC5wcm90b2NvbCA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgICB1cmwuc2xhc2hlcyA9ICFmbjtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAncGF0aG5hbWUnOlxuICAgIGNhc2UgJ2hhc2gnOlxuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIHZhciBjaGFyID0gcGFydCA9PT0gJ3BhdGhuYW1lJyA/ICcvJyA6ICcjJztcbiAgICAgICAgdXJsW3BhcnRdID0gdmFsdWUuY2hhckF0KDApICE9PSBjaGFyID8gY2hhciArIHZhbHVlIDogdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cmxbcGFydF0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHVybFtwYXJ0XSA9IHZhbHVlO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpbnMgPSBydWxlc1tpXTtcblxuICAgIGlmIChpbnNbNF0pIHVybFtpbnNbMV1dID0gdXJsW2luc1sxXV0udG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIHVybC5vcmlnaW4gPSB1cmwucHJvdG9jb2wgJiYgdXJsLmhvc3QgJiYgdXJsLnByb3RvY29sICE9PSAnZmlsZTonXG4gICAgPyB1cmwucHJvdG9jb2wgKycvLycrIHVybC5ob3N0XG4gICAgOiAnbnVsbCc7XG5cbiAgdXJsLmhyZWYgPSB1cmwudG9TdHJpbmcoKTtcblxuICByZXR1cm4gdXJsO1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgcHJvcGVydGllcyBiYWNrIGluIHRvIGEgdmFsaWQgYW5kIGZ1bGwgVVJMIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmdpZnkgT3B0aW9uYWwgcXVlcnkgc3RyaW5naWZ5IGZ1bmN0aW9uLlxuICogQHJldHVybnMge1N0cmluZ30gQ29tcGlsZWQgdmVyc2lvbiBvZiB0aGUgVVJMLlxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiB0b1N0cmluZyhzdHJpbmdpZnkpIHtcbiAgaWYgKCFzdHJpbmdpZnkgfHwgJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIHN0cmluZ2lmeSkgc3RyaW5naWZ5ID0gcXMuc3RyaW5naWZ5O1xuXG4gIHZhciBxdWVyeVxuICAgICwgdXJsID0gdGhpc1xuICAgICwgcHJvdG9jb2wgPSB1cmwucHJvdG9jb2w7XG5cbiAgaWYgKHByb3RvY29sICYmIHByb3RvY29sLmNoYXJBdChwcm90b2NvbC5sZW5ndGggLSAxKSAhPT0gJzonKSBwcm90b2NvbCArPSAnOic7XG5cbiAgdmFyIHJlc3VsdCA9IHByb3RvY29sICsgKHVybC5zbGFzaGVzID8gJy8vJyA6ICcnKTtcblxuICBpZiAodXJsLnVzZXJuYW1lKSB7XG4gICAgcmVzdWx0ICs9IHVybC51c2VybmFtZTtcbiAgICBpZiAodXJsLnBhc3N3b3JkKSByZXN1bHQgKz0gJzonKyB1cmwucGFzc3dvcmQ7XG4gICAgcmVzdWx0ICs9ICdAJztcbiAgfVxuXG4gIHJlc3VsdCArPSB1cmwuaG9zdCArIHVybC5wYXRobmFtZTtcblxuICBxdWVyeSA9ICdvYmplY3QnID09PSB0eXBlb2YgdXJsLnF1ZXJ5ID8gc3RyaW5naWZ5KHVybC5xdWVyeSkgOiB1cmwucXVlcnk7XG4gIGlmIChxdWVyeSkgcmVzdWx0ICs9ICc/JyAhPT0gcXVlcnkuY2hhckF0KDApID8gJz8nKyBxdWVyeSA6IHF1ZXJ5O1xuXG4gIGlmICh1cmwuaGFzaCkgcmVzdWx0ICs9IHVybC5oYXNoO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cblVybC5wcm90b3R5cGUgPSB7IHNldDogc2V0LCB0b1N0cmluZzogdG9TdHJpbmcgfTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgVVJMIHBhcnNlciBhbmQgc29tZSBhZGRpdGlvbmFsIHByb3BlcnRpZXMgdGhhdCBtaWdodCBiZSB1c2VmdWwgZm9yXG4vLyBvdGhlcnMgb3IgdGVzdGluZy5cbi8vXG5VcmwuZXh0cmFjdFByb3RvY29sID0gZXh0cmFjdFByb3RvY29sO1xuVXJsLmxvY2F0aW9uID0gbG9sY2F0aW9uO1xuVXJsLnFzID0gcXM7XG5cbm1vZHVsZS5leHBvcnRzID0gVXJsO1xuIl19
