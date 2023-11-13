// Copyright (c) 2019-2019 The Authors.
// SPDX-License-Identifier: BSD-3-Clause

import {
  MagicBindingModule,
  MagicBindingStaticInterface,
  MagicBindingInterface,
} from './binding';
const createBindingModule = require('@npcz/magic/dist/magic-js');

/**
 * Reproduces exactly the same values than in magic.h of libmagic but using
 * a much more type safe enum.
 */
export enum MagicFlags {
  /** No flags */
  MAGIC_NONE = 0x0000000,
  /** Turn on debugging */
  MAGIC_DEBUG = 0x0000001,
  /** Follow symlinks */
  MAGIC_SYMLINK = 0x0000002,
  /** Check inside compressed files */
  MAGIC_COMPRESS = 0x0000004,
  /** Look at the contents of devices */
  MAGIC_DEVICES = 0x0000004,
  /** Return the MIME type */
  MAGIC_MIME_TYPE = 0x0000010,
  /** Return all matches */
  MAGIC_CONTINUE = 0x0000020,
  /** Print warnings to stderr */
  MAGIC_CHECK = 0x0000040,
  /** Restore access time on exit - should only be used on systems that support it */
  MAGIC_PRESERVE_ATIME = 0x0000080,
  /** Don't convert unprintable chars */
  MAGIC_RAW = 0x0000100,
  /** Handle ENOENT etc as real errors */
  MAGIC_ERROR = 0x0000200,
  /** Return the MIME encoding */
  MAGIC_MIME_ENCODING = 0x0000400,
  /** Return both the mime type and the encoding */
  MAGIC_MIME = MAGIC_MIME_TYPE | MAGIC_MIME_ENCODING,
  /** Return the Apple creator/type */
  MAGIC_APPLE = 0x0000800,
  /** Return a /-separated list of extensions */
  MAGIC_EXTENSION = 0x1000000,
  /** Check inside compressed files but not report compression */
  MAGIC_COMPRESS_TRANSP = 0x2000000,
  /** Equivalent to MAGIC_EXTENSION|MAGIC_MIME|MAGIC_APPLE  */
  MAGIC_NODESC = MAGIC_EXTENSION | MAGIC_MIME | MAGIC_APPLE,
  /** Don't check for compressed files */
  MAGIC_NO_CHECK_COMPRESS = 0x0001000,
  /** Don't check for tar files */
  MAGIC_NO_CHECK_TAR = 0x0002000,
  /** Don't check magic entries */
  MAGIC_NO_CHECK_SOFT = 0x0004000,
  /** Don't check application type */
  MAGIC_NO_CHECK_APPTYPE = 0x0008000,
  /** Don't check for elf details */
  MAGIC_NO_CHECK_ELF = 0x0010000,
  /** Don't check for text files */
  MAGIC_NO_CHECK_TEXT = 0x0020000,
  /** Don't check for cdf files */
  MAGIC_NO_CHECK_CDF = 0x0040000,
  /** Don't check for CSV files */
  MAGIC_NO_CHECK_CSV = 0x0080000,
  /** Don't check tokens */
  MAGIC_NO_CHECK_TOKENS = 0x0100000,
  /** Don't check text encodings */
  MAGIC_NO_CHECK_ENCODING = 0x0200000,
  /** Don't check for JSON files */
  MAGIC_NO_CHECK_JSON = 0x0400000,
  /** No built-in tests; only consult the magic file */
  MAGIC_NO_CHECK_BUILTIN = MAGIC_NO_CHECK_COMPRESS |
    MAGIC_NO_CHECK_TAR |
    /*	MAGIC_NO_CHECK_SOFT	| */
    MAGIC_NO_CHECK_APPTYPE |
    MAGIC_NO_CHECK_ELF |
    MAGIC_NO_CHECK_TEXT |
    MAGIC_NO_CHECK_CSV |
    MAGIC_NO_CHECK_CDF |
    MAGIC_NO_CHECK_TOKENS |
    MAGIC_NO_CHECK_ENCODING |
    MAGIC_NO_CHECK_JSON,
}

/**
 * Enhanced interface to the libmagic binding.
 */
export class FileMagic {
  /**
   * Path to the magic file.
   *
   * Can only be (and should be) changed before the first call to getInstance().
   *
   * This path must be correct and pointing to the location of the magic.mgc file.
   * By default, it is expected to be in the current script working directory.
   */
  static magicFile: string = require.resolve('@npcz/magic/dist/magic.mgc');
  /**
   * Default flags used by libmagic binding.
   *
   * These flags can customize the behavior of file type detection. The
   * default flags can be changed only before the first call to the
   * getInstance() method. After that, detection can always be customized
   * by providing specific flags to the detect() method.
   */
  static defaultFlags: MagicFlags = MagicFlags.MAGIC_NONE;
  /**
   * The single instance of FileMagic.
   */
  private static _instance: FileMagic;
  /**
   * The binding static interface.
   */
  private static _binding: MagicBindingStaticInterface;
  /**
   * The binding instance interface.
   */
  private _magic: MagicBindingInterface;

  /**
   * Private constructor to prevent creation of instances of this class
   * except through the getInstance() method.
   */
  private constructor() {}

  /**
   * Get the single instance of FileMagic.
   *
   * This method can be called as many times as needed to obtain the single
   * instance of FileMagic. During the first call, libmagic binding is
   * initialized using the magic file path and the flags current values
   * respectively in the magicFile and flags properties.
   *
   * @param locateFile custom function to locate the WASM file. This is
   * particularly helpful when the wasm file is moved away from the js
   * binding file or when it needs to be fetched via http.
   * @return a Promise of the single instance of FileMagic that resolves
   * after the binding is properly initialized, or rejects with an Error
   * when it fails.
   */
  static getInstance(
    locateFile?: (wasmFile: string, dir: string) => string,
  ): Promise<FileMagic> {
    if (!FileMagic._instance) {
      return new Promise((resolve, reject) => {
        createBindingModule({ locateFile: locateFile }).then(
          (moduleInstance: MagicBindingModule) => {
            // Initialize libmagic
            const status = moduleInstance.MagicBinding.init(
              FileMagic.magicFile,
              FileMagic.defaultFlags,
            );
            if (status === -1) {
              reject('failed to initialize libmagic');
            }

            // Initialize the instance members for direct access in later calls
            FileMagic._binding = moduleInstance.MagicBinding;
            FileMagic._instance = new FileMagic();
            FileMagic._instance._magic = new moduleInstance.MagicBinding();

            resolve(FileMagic._instance);
          },
        );
      });
    }
    return Promise.resolve(FileMagic._instance);
  }

  /**
   * Get the flags currently used in the libmagic binding.
   *
   * These flags are a property of the class and therefore apply to all
   * instances of the binding created by calling new binding.MagicBinding().
   * They are set when calling the init() method and can be overridden during
   * the detect call.
   *
   * @example<caption>Making multiple detect calls with different flags</caption>
   * magic.detect(file, binding.MagicBinding.flags() | binding.MAGIC_MIME)
   *
   * @return the flags set for the binding instance.
   * @throws Error when used after the binding is closed.
   * @see init
   * @see detect
   */
  get flags(): MagicFlags {
    if (FileMagic._binding) {
      return FileMagic._binding.flags();
    } else {
      throw new Error(
        'FileMagic has not been initialized. Did you forget to call getInstance()?',
      );
    }
  }

  /**
   * Get the version of libmagic.
   *
   * @returns The version of libmagic, e.g. 835.
   * @throws Error when used after the binding is closed.
   */
  version(): number {
    if (FileMagic._binding) {
      return FileMagic._binding.version();
    } else {
      throw new Error(
        'FileMagic has not been initialized. Did you forget to call getInstance()?',
      );
    }
  }

  /**
   * Destroy the binding and release any resources it was holding (e.g. memory,
   * file descriptors, etc...).
   *
   * This method must be called when the binding is no longer needed. After it
   * has been called, the binding can no longer be used and a new instance must
   * be created.
   */
  static close(): void {
    if (FileMagic._binding) {
      FileMagic._binding.destroy();
    }
    FileMagic._instance = undefined;
    FileMagic._binding = undefined;
  }

  /**
   * Run libmagic detection for the given file to produce a description of
   * its content.
   *
   * There are three sets of tests, performed in this order: filesystem tests,
   * magic tests, and language tests. The first test that succeeds causes the
   * detection to complete.
   *
   * The detection result will usually contain one of the words *text* (the
   * file contains only printing characters and a few com-mon control characters
   * and is probably safe to read on an ASCII terminal), *executable* (the
   * file an executable file understandable by whatever operating system it was
   * made for), or *data* meaning anything else (data is usually ``binary'' or
   * non-printable).
   *
   * The filesystem tests are based on examining the return from a stat(2) system
   * call.  The library checks to see if the file is empty, or if it's some sort
   * of special file (sockets, symbolic links, or named pipes (FIFOs) on those
   * systems that implement them).
   *
   * The magic tests are used to check for files with data in particular fixed
   * formats.  The canonical example of this is a binary executable file. These
   * files have a ``magic number'' stored in a particular place near the beginning
   * of the file. The concept of a *'magic'* has been applied by extension to data
   * files.  Any file with some invariant identifier at a small fixed offset into
   * the file can usually be described in this way.  The information identifying
   * these files is read from the compiled magic file.
   *
   * If a file does not match any of the entries in the magic file, it is examined
   * to see if it seems to be a text file and identify the character set it uses.
   * Any file that cannot be identified as having been written in any of the character
   * sets known to libmagic is simply said to be *'data'*.
   *
   * @param path path the file to be detected.
   * @param flags specific flags to be used for this detection request. To use
   * the default flags for the binding, pass -1;
   * @return a string containing the detection result (type description, mime type,
   * mime encoding, etc...) when successful.
   * @throws Error with an error message when the detection fails or when used
   * after the binding is closed.
   */
  detect(path: string, flags?: MagicFlags): string {
    if (FileMagic._binding) {
      const result = this._magic.detect(path, flags ? flags : -1);
      // Check for detection error
      if (result.startsWith('ERROR')) {
        throw new Error(result.substring('ERROR: '.length));
      }
      return result;
    } else {
      throw new Error(
        'FileMagic has not been initialized. Did you forget to call getInstance()?',
      );
    }
  }

  /**
   * Run libmagic detection for the given file to produce a string with the
   * mime type corresponding to its content.
   *
   * @param path path the file to be detected.
   * @return a string containing the mime type of the file contents (e.g.
   * text/plain) when successful.
   * @throws Error with an error message when the detection fails or when used
   * after the binding is closed.
   * @see detect
   */
  detectMimeType(path: string): string {
    return this.detect(path, this.flags | MagicFlags.MAGIC_MIME_TYPE);
  }

  /**
   * Run libmagic detection for the given file to produce a string with the
   * mime encoding corresponding to its content.
   *
   * @param path path the file to be detected.
   * @return a string containing the mime type of the file contents (e.g.
   * charset=us-ascii) when successful.
   * @throws Error with an error message when the detection fails or when used
   * after the binding is closed.
   * @see detect
   */
  detectMimeEncoding(path: string): string {
    return this.detect(path, this.flags | MagicFlags.MAGIC_MIME_ENCODING);
  }

  /**
   * Run libmagic detection for the given file to produce a string with the
   * mime type and encoding corresponding to its content.
   *
   * @param path path the file to be detected.
   * @return a string containing the mime type of the file contents (e.g.
   * text/plain; charset=us-ascii) when successful.
   * @throws Error with an error message when the detection fails or when used
   * after the binding is closed.
   * @see detect
   */
  detectMime(path: string): string {
    return this.detect(path, this.flags | MagicFlags.MAGIC_MIME);
  }
}
