// Copyright (c) 2019-2019 The Authors.
// SPDX-License-Identifier: BSD-3-Clause

/**
 * Represents the Module object returned from the embind generated javascript
 * module.
 *
 * All symbols exposed by embind are available on the Emscripten Module object.
 *
 * Important:
 *   Always access objects through the Module object object, as shown above.
 *   While the objects are also available in the global namespace by default,
 *   there are cases where they will not be (for example, if you use the closure
 *   compiler to minify code or wrap compiled code in a function to avoid
 *   polluting the global namespace). You can of course use whatever name you
 *   like for the module by assigning it to a new variable:
 *     var MyModuleName = Module;
 *
 * @example<caption>Using the binding module</caption>
 * const bindingModule = require('magic-js');
 * const binding: MagicBindingModule = bindingModule({
 *   onRuntimeInitialized() {
 *     ... do things with the binding ...
 *   }
 * });
 * @see MagicBindingInterface
 */
export interface MagicBindingModule {
  /** Holds the static interface and the constructor to the libmagic binding. */
  MagicBinding: MagicBindingStaticInterface;

  /** No flags */
  MAGIC_NONE: number;
  /** Turn on debugging */
  MAGIC_DEBUG: number;
  /** Follow symlinks */
  MAGIC_SYMLINK: number;
  /** Check inside compressed files */
  MAGIC_COMPRESS: number;
  /** Look at the contents of devices */
  MAGIC_DEVICES: number;
  /** Return the MIME type */
  MAGIC_MIME_TYPE: number;
  /** Return all matches */
  MAGIC_CONTINUE: number;
  /** Print warnings to stderr */
  MAGIC_CHECK: number;
  /** Restore access time on exit */
  MAGIC_PRESERVE_ATIME: number;
  /** Don't convert unprintable chars */
  MAGIC_RAW: number;
  /** Handle ENOENT etc as real errors */
  MAGIC_ERROR: number;
  /** Return the MIME encoding */
  MAGIC_MIME_ENCODING: number;
  /** Return both the mime type and the encoding */
  MAGIC_MIME: number;
  /** Return the Apple creator/type */
  MAGIC_APPLE: number;
  /** Return a /-separated list of extensions */
  MAGIC_EXTENSION: number;
  /** Check inside compressed files but not report compression */
  MAGIC_COMPRESS_TRANSP: number;
  /** Equivalent to MAGIC_EXTENSION|MAGIC_MIME|MAGIC_APPLE  */
  MAGIC_NODESC: number;
  /** Don't check for compressed files */
  MAGIC_NO_CHECK_COMPRESS: number;
  /** Don't check for tar files */
  MAGIC_NO_CHECK_TAR: number;
  /** Don't check magic entries */
  MAGIC_NO_CHECK_SOFT: number;
  /** Don't check application type */
  MAGIC_NO_CHECK_APPTYPE: number;
  /** Don't check for elf details */
  MAGIC_NO_CHECK_ELF: number;
  /** Don't check for text files */
  MAGIC_NO_CHECK_TEXT: number;
  /** Don't check for cdf files */
  MAGIC_NO_CHECK_CDF: number;
  /** Don't check for CSV files */
  MAGIC_NO_CHECK_CSV: number;
  /** Don't check tokens */
  MAGIC_NO_CHECK_TOKENS: number;
  /** Don't check text encodings */
  MAGIC_NO_CHECK_ENCODING: number;
  /** Don't check for JSON files */
  MAGIC_NO_CHECK_JSON: number;
  /** No built-in tests; only consult the magic file */
  MAGIC_NO_CHECK_BUILTIN: number;
}

/**
 * Provides the constructor and the class interface of the binding.
 *
 * To access the libmagic detection interface, create a new instance by calling
 * new Module.MagicBinding().
 *
 * IMPORTANT:
 *   The binding must always be initialized before use and when no longer
 *   needed, it must be destroyed to free resources.
 *
 * @example<caption>Creating an instance of the binding</caption>
 * const bindingModule = require('magic-js');
 * const binding: MagicBindingModule = bindingModule({
 *   onRuntimeInitialized() {
 *     // Initialize the binding
 *     binding.MagicBinding.init('magic.mgc',binding.MAGIC_NONE);
 *
 *     const magic = new binding.MagicBinding();
 *     magic.detect('path-to-file', -1);
 *
 *     // Destroy the binding after it is no longer needed
 *     binding.MagicBinding.destroy();
 *   }
 * });
 * @see MagicBindingInterface
 */
export interface MagicBindingStaticInterface {
  /**
   * Create an instance of the libmagic binding that can be used to access
   * its instance methods for example to detect a file type.
   *
   * @returns an instance of the libmagic binding.
   */
  new (): MagicBindingInterface;
  /** The instance interface of the libmagic binding. */
  prototype: MagicBindingInterface;

  /**
   * Get the version of libmagic.
   *
   * @returns The version of libmagic, e.g. 835.
   */
  version(): number;

  /**
   * Get the default path used by libmagic to load the magic.mgc file.
   */
  defaultPath(): string;

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
  flags(): number;

  /**
   * Initialize the libmagic binding.
   *
   * This method must be called before any use of the binding. Multiple calls
   * to this method have no effect and will not produce an error.
   *
   * @param magicPath the path to the magic.mgc file.
   * @param flags flags to be set and used by default when calling libmagic.
   * @see flags
   * @see destroy
   */
  init(magicPath: string, flags: number): number;

  /**
   * Destory the binding and release any resources it was holding (e.g. memory,
   * file desriptors, etc...).
   *
   * This method must be called when the binding is no longer needed. After it
   * has been called, the binding can no longer be used and a new instance must
   * be created.
   */
  destroy(): void;
}

/**
 * Provides the instance interface of the libmagic binding that can be accessed
 * after a binding instance is creating with a call to new binding.MagicBinding().
 *
 * @see MagicBindingStaticInterface.new
 */
export interface MagicBindingInterface {
  /**
   * Detect a file type.
   *
   * Due to limitations on the way libmagic handles errors, the API here uses a
   * simple convention to signal a detection error. When the call is successful,
   * the returned string contains the description, mime type, etc... but when it
   * fails, the returned string starts with ERROR and contains the error message.
   *
   * @param path path the file to be detected.
   * @param flags specific flags to be used for this detection request. To use
   * the default flags for the binding, pass -1;
   * @return a string containing the file type detection result. When it fails,
   * the string will start with 'ERROR'.
   */
  detect(path: string, flags: number): string;
}
