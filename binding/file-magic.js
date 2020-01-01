// Copyright (c) 2019-2019 The Authors.
// SPDX-License-Identifier: BSD-3-Clause
var bindingModule = require('../../dist/magic-js');
export var MagicFlags;
(function (MagicFlags) {
    /** No flags */
    MagicFlags[MagicFlags["MAGIC_NONE"] = bindingModule.MagicBinding.MAGIC_NONE] = "MAGIC_NONE";
    /** Turn on debugging */
    MagicFlags[MagicFlags["MAGIC_DEBUG"] = bindingModule.MagicBinding.MAGIC_DEBUG] = "MAGIC_DEBUG";
    /** Follow symlinks */
    MagicFlags[MagicFlags["MAGIC_SYMLINK"] = bindingModule.MagicBinding.MAGIC_SYMLINK] = "MAGIC_SYMLINK";
    /** Check inside compressed files */
    MagicFlags[MagicFlags["MAGIC_COMPRESS"] = bindingModule.MagicBinding.MAGIC_COMPRESS] = "MAGIC_COMPRESS";
    /** Look at the contents of devices */
    MagicFlags[MagicFlags["MAGIC_DEVICES"] = bindingModule.MagicBinding.MAGIC_DEVICES] = "MAGIC_DEVICES";
    /** Return the MIME type */
    MagicFlags[MagicFlags["MAGIC_MIME_TYPE"] = bindingModule.MagicBinding.MAGIC_MIME_TYPE] = "MAGIC_MIME_TYPE";
    /** Return all matches */
    MagicFlags[MagicFlags["MAGIC_CONTINUE"] = bindingModule.MagicBinding.MAGIC_CONTINUE] = "MAGIC_CONTINUE";
    /** Print warnings to stderr */
    MagicFlags[MagicFlags["MAGIC_CHECK"] = bindingModule.MagicBinding.MAGIC_CHECK] = "MAGIC_CHECK";
    /** Restore access time on exit */
    MagicFlags[MagicFlags["MAGIC_PRESERVE_ATIME"] = bindingModule.MagicBinding.MAGIC_PRESERVE_ATIME] = "MAGIC_PRESERVE_ATIME";
    /** Don't convert unprintable chars */
    MagicFlags[MagicFlags["MAGIC_RAW"] = bindingModule.MagicBinding.MAGIC_RAW] = "MAGIC_RAW";
    /** Handle ENOENT etc as real errors */
    MagicFlags[MagicFlags["MAGIC_ERROR"] = bindingModule.MagicBinding.MAGIC_ERROR] = "MAGIC_ERROR";
    /** Return the MIME encoding */
    MagicFlags[MagicFlags["MAGIC_MIME_ENCODING"] = bindingModule.MagicBinding.MAGIC_MIME_ENCODING] = "MAGIC_MIME_ENCODING";
    /** Return both the mime type and the encoding */
    MagicFlags[MagicFlags["MAGIC_MIME"] = bindingModule.MagicBinding.MAGIC_MIME] = "MAGIC_MIME";
    /** Return the Apple creator/type */
    MagicFlags[MagicFlags["MAGIC_APPLE"] = bindingModule.MagicBinding.MAGIC_APPLE] = "MAGIC_APPLE";
    /** Return a /-separated list of extensions */
    MagicFlags[MagicFlags["MAGIC_EXTENSION"] = bindingModule.MagicBinding.MAGIC_EXTENSION] = "MAGIC_EXTENSION";
    /** Check inside compressed files but not report compression */
    MagicFlags[MagicFlags["MAGIC_COMPRESS_TRANSP"] = bindingModule.MagicBinding.MAGIC_COMPRESS_TRANSP] = "MAGIC_COMPRESS_TRANSP";
    /** Equivalent to MAGIC_EXTENSION|MAGIC_MIME|MAGIC_APPLE  */
    MagicFlags[MagicFlags["MAGIC_NODESC"] = bindingModule.MagicBinding.MAGIC_NODESC] = "MAGIC_NODESC";
    /** Don't check for compressed files */
    MagicFlags[MagicFlags["MAGIC_NO_CHECK_COMPRESS"] = bindingModule.MagicBinding.MAGIC_NO_CHECK_COMPRESS] = "MAGIC_NO_CHECK_COMPRESS";
    /** Don't check for tar files */
    MagicFlags[MagicFlags["MAGIC_NO_CHECK_TAR"] = bindingModule.MagicBinding.MAGIC_NO_CHECK_TAR] = "MAGIC_NO_CHECK_TAR";
    /** Don't check magic entries */
    MagicFlags[MagicFlags["MAGIC_NO_CHECK_SOFT"] = bindingModule.MagicBinding.MAGIC_NO_CHECK_SOFT] = "MAGIC_NO_CHECK_SOFT";
    /** Don't check application type */
    MagicFlags[MagicFlags["MAGIC_NO_CHECK_APPTYPE"] = bindingModule.MagicBinding.MAGIC_NO_CHECK_APPTYPE] = "MAGIC_NO_CHECK_APPTYPE";
    /** Don't check for elf details */
    MagicFlags[MagicFlags["MAGIC_NO_CHECK_ELF"] = bindingModule.MagicBinding.MAGIC_NO_CHECK_ELF] = "MAGIC_NO_CHECK_ELF";
    /** Don't check for text files */
    MagicFlags[MagicFlags["MAGIC_NO_CHECK_TEXT"] = bindingModule.MagicBinding.MAGIC_NO_CHECK_TEXT] = "MAGIC_NO_CHECK_TEXT";
    /** Don't check for cdf files */
    MagicFlags[MagicFlags["MAGIC_NO_CHECK_CDF"] = bindingModule.MagicBinding.MAGIC_NO_CHECK_CDF] = "MAGIC_NO_CHECK_CDF";
    /** Don't check for CSV files */
    MagicFlags[MagicFlags["MAGIC_NO_CHECK_CSV"] = bindingModule.MagicBinding.MAGIC_NO_CHECK_CSV] = "MAGIC_NO_CHECK_CSV";
    /** Don't check tokens */
    MagicFlags[MagicFlags["MAGIC_NO_CHECK_TOKENS"] = bindingModule.MagicBinding.MAGIC_NO_CHECK_TOKENS] = "MAGIC_NO_CHECK_TOKENS";
    /** Don't check text encodings */
    MagicFlags[MagicFlags["MAGIC_NO_CHECK_ENCODING"] = bindingModule.MagicBinding.MAGIC_NO_CHECK_ENCODING] = "MAGIC_NO_CHECK_ENCODING";
    /** Don't check for JSON files */
    MagicFlags[MagicFlags["MAGIC_NO_CHECK_JSON"] = bindingModule.MagicBinding.MAGIC_NO_CHECK_JSON] = "MAGIC_NO_CHECK_JSON";
    /** No built-in tests; only consult the magic file */
    MagicFlags[MagicFlags["MAGIC_NO_CHECK_BUILTIN"] = bindingModule.MagicBinding.MAGIC_NO_CHECK_BUILTIN] = "MAGIC_NO_CHECK_BUILTIN";
})(MagicFlags || (MagicFlags = {}));
/**
 * Enhanced interface to the libmagic binding.
 */
var FileMagic = /** @class */ (function () {
    /**
     * Private constructor to prevent creation of instances of this class
     * except through the getInstance() method.
     */
    function FileMagic() {
    }
    /**
     * Get the single instance of FileMagic.
     *
     * This method can be called as many times as needed to obtain the single
     * instance of FileMagic. During the first call, libmagic binding is
     * initialized using the magic file path and the flags current values
     * respectively in the magicFile and flags properties.
     *
     * @return a Promise of the single instance of FileMagic that resolves
     * after the binding is properly initialized, or rejects with an Error
     * when it fails.
     */
    FileMagic.getInstance = function () {
        if (!FileMagic._instance) {
            FileMagic._instance = new FileMagic();
            var moduleInstance_1 = bindingModule({
                onRuntimeInitialized: function () {
                    // Initialize libmagic
                    var status = FileMagic._binding.init(FileMagic.magicFile, FileMagic.defaulFlags);
                    if (status === -1)
                        return Promise.reject(new Error('filed to initialize libmagic'));
                    // Initialize the instance members for direct access in later calls
                    FileMagic._binding = moduleInstance_1.MagicBinding;
                    FileMagic._instance._magic = new moduleInstance_1.MagicBinding();
                    return Promise.resolve(FileMagic._instance);
                }
            });
        }
        return Promise.resolve(FileMagic._instance);
    };
    Object.defineProperty(FileMagic.prototype, "flags", {
        /**
         * Get the flags currently used in the libmagic binding.
         *
         * These flags are a property of the class and therefore apply to all
         * instances of the binding created by calling new binding.MagicBinding().
         * They are set when calling the init() method and can be overriden during
         * the detect call.
         *
         * @example<caption>Making multiple detect calls with different flags</caption>
         * magic.detect(file, binding.MagicBinding.flags() | binding.MAGIC_MIME)
         *
         * @return the flags set for the binding instance.
         * @see init
         * @see detect
         */
        get: function () {
            return FileMagic._binding.flags();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the version of libmagic.
     *
     * @returns The version of libmagic, e.g. 835.
     */
    FileMagic.version = function () {
        return FileMagic._binding.version();
    };
    /**
     * Destory the binding and release any resources it was holding (e.g. memory,
     * file desriptors, etc...).
     *
     * This method must be called when the binding is no longer needed. After it
     * has been called, the binding can no longer be used and a new instance must
     * be created.
     */
    FileMagic.prototype.close = function () {
        if (FileMagic._binding) {
            FileMagic._binding.destroy();
        }
        FileMagic._instance = undefined;
        FileMagic._binding = undefined;
    };
    /**
     * Detect a file type.
     *
     * @param path path the file to be detected.
     * @param flags specific flags to be used for this detection request. To use
     * the default flags for the binding, pass -1;
     * @return a string containing the detection result (type description, mime type,
     * mime encoding, etc...) when successful.
     * @throws Error with an error message when the detection fails.
     */
    FileMagic.prototype.detect = function (path, flags) {
        var result = this._magic.detect(path, flags ? flags : -1);
        // Check for detection error
        if (result.startsWith('ERROR')) {
            throw new Error(result.substring('ERROR: '.length));
        }
        return result;
    };
    /**
     * Path to the magic file.
     *
     * Can be changed only before the first call to getInstance(). This path
     * must be correct and pointing to the location of the magic.mgc file. By
     * default, it is expected to be in the current script working directory.
     */
    FileMagic.magicFile = 'magic.mgc';
    /**
     * Default flags used by libmagic binding.
     *
     * These flags can customize the behavior of file type detection. The
     * default flags can be changed only before the first call to the
     * getInstance() method. After that, detection can always be customized
     * by providing specific flags to the detect() method.
     */
    FileMagic.defaulFlags = MagicFlags.MAGIC_PRESERVE_ATIME;
    return FileMagic;
}());
export { FileMagic };
//# sourceMappingURL=file-magic.js.map