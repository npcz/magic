// Copyright (c) 2019-2019 The Authors.
// SPDX-License-Identifier: BSD-3-Clause

import {
  MagicBindingModule,
  MagicBindingStaticInterface,
  MagicBindingInterface
} from './binding';
const bindingModule = require('../../dist/magic-js');

export enum MagicFlags {
  /** No flags */
  MAGIC_NONE = bindingModule.MagicBinding.MAGIC_NONE,
  /** Turn on debugging */
  MAGIC_DEBUG = bindingModule.MagicBinding.MAGIC_DEBUG,
  /** Follow symlinks */
  MAGIC_SYMLINK = bindingModule.MagicBinding.MAGIC_SYMLINK,
  /** Check inside compressed files */
  MAGIC_COMPRESS = bindingModule.MagicBinding.MAGIC_COMPRESS,
  /** Look at the contents of devices */
  MAGIC_DEVICES = bindingModule.MagicBinding.MAGIC_DEVICES,
  /** Return the MIME type */
  MAGIC_MIME_TYPE = bindingModule.MagicBinding.MAGIC_MIME_TYPE,
  /** Return all matches */
  MAGIC_CONTINUE = bindingModule.MagicBinding.MAGIC_CONTINUE,
  /** Print warnings to stderr */
  MAGIC_CHECK = bindingModule.MagicBinding.MAGIC_CHECK,
  /** Restore access time on exit */
  MAGIC_PRESERVE_ATIME = bindingModule.MagicBinding.MAGIC_PRESERVE_ATIME,
  /** Don't convert unprintable chars */
  MAGIC_RAW = bindingModule.MagicBinding.MAGIC_RAW,
  /** Handle ENOENT etc as real errors */
  MAGIC_ERROR = bindingModule.MagicBinding.MAGIC_ERROR,
  /** Return the MIME encoding */
  MAGIC_MIME_ENCODING = bindingModule.MagicBinding.MAGIC_MIME_ENCODING,
  /** Return both the mime type and the encoding */
  MAGIC_MIME = bindingModule.MagicBinding.MAGIC_MIME,
  /** Return the Apple creator/type */
  MAGIC_APPLE = bindingModule.MagicBinding.MAGIC_APPLE,
  /** Return a /-separated list of extensions */
  MAGIC_EXTENSION = bindingModule.MagicBinding.MAGIC_EXTENSION,
  /** Check inside compressed files but not report compression */
  MAGIC_COMPRESS_TRANSP = bindingModule.MagicBinding.MAGIC_COMPRESS_TRANSP,
  /** Equivalent to MAGIC_EXTENSION|MAGIC_MIME|MAGIC_APPLE  */
  MAGIC_NODESC = bindingModule.MagicBinding.MAGIC_NODESC,
  /** Don't check for compressed files */
  MAGIC_NO_CHECK_COMPRESS = bindingModule.MagicBinding.MAGIC_NO_CHECK_COMPRESS,
  /** Don't check for tar files */
  MAGIC_NO_CHECK_TAR = bindingModule.MagicBinding.MAGIC_NO_CHECK_TAR,
  /** Don't check magic entries */
  MAGIC_NO_CHECK_SOFT = bindingModule.MagicBinding.MAGIC_NO_CHECK_SOFT,
  /** Don't check application type */
  MAGIC_NO_CHECK_APPTYPE = bindingModule.MagicBinding.MAGIC_NO_CHECK_APPTYPE,
  /** Don't check for elf details */
  MAGIC_NO_CHECK_ELF = bindingModule.MagicBinding.MAGIC_NO_CHECK_ELF,
  /** Don't check for text files */
  MAGIC_NO_CHECK_TEXT = bindingModule.MagicBinding.MAGIC_NO_CHECK_TEXT,
  /** Don't check for cdf files */
  MAGIC_NO_CHECK_CDF = bindingModule.MagicBinding.MAGIC_NO_CHECK_CDF,
  /** Don't check for CSV files */
  MAGIC_NO_CHECK_CSV = bindingModule.MagicBinding.MAGIC_NO_CHECK_CSV,
  /** Don't check tokens */
  MAGIC_NO_CHECK_TOKENS = bindingModule.MagicBinding.MAGIC_NO_CHECK_TOKENS,
  /** Don't check text encodings */
  MAGIC_NO_CHECK_ENCODING = bindingModule.MagicBinding.MAGIC_NO_CHECK_ENCODING,
  /** Don't check for JSON files */
  MAGIC_NO_CHECK_JSON = bindingModule.MagicBinding.MAGIC_NO_CHECK_JSON,
  /** No built-in tests; only consult the magic file */
  MAGIC_NO_CHECK_BUILTIN = bindingModule.MagicBinding.MAGIC_NO_CHECK_BUILTIN
}

/**
 * Enhanced interface to the libmagic binding.
 */
export class FileMagic {
  /**
   * Path to the magic file.
   *
   * Can be changed only before the first call to getInstance(). This path
   * must be correct and pointing to the location of the magic.mgc file. By
   * default, it is expected to be in the current script working directory.
   */
  static magicFile: string = 'magic.mgc';
  /**
   * Default flags used by libmagic binding.
   *
   * These flags can customize the behavior of file type detection. The
   * default flags can be changed only before the first call to the
   * getInstance() method. After that, detection can always be customized
   * by providing specific flags to the detect() method.
   */
  static defaulFlags: MagicFlags = MagicFlags.MAGIC_PRESERVE_ATIME;
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
   * @return a Promise of the single instance of FileMagic that resolves
   * after the binding is properly initialized, or rejects with an Error
   * when it fails.
   */
  static getInstance(): Promise<FileMagic> {
    if (!FileMagic._instance) {
      FileMagic._instance = new FileMagic();
      const moduleInstance: MagicBindingModule = bindingModule({
        onRuntimeInitialized() {
          // Initialize libmagic
          const status = FileMagic._binding.init(
            FileMagic.magicFile,
            FileMagic.defaulFlags
          );
          if (status === -1)
            return Promise.reject(new Error('filed to initialize libmagic'));

          // Initialize the instance members for direct access in later calls
          FileMagic._binding = moduleInstance.MagicBinding;
          FileMagic._instance._magic = new moduleInstance.MagicBinding();

          return Promise.resolve(FileMagic._instance);
        }
      });
    }
    return Promise.resolve(FileMagic._instance);
  }

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
  get flags(): MagicFlags {
    return FileMagic._binding.flags();
  }

  /**
   * Get the version of libmagic.
   *
   * @returns The version of libmagic, e.g. 835.
   */
  static version(): number {
    return FileMagic._binding.version();
  }

  /**
   * Destory the binding and release any resources it was holding (e.g. memory,
   * file desriptors, etc...).
   *
   * This method must be called when the binding is no longer needed. After it
   * has been called, the binding can no longer be used and a new instance must
   * be created.
   */
  close(): void {
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
   * @throws Error with an error message when the detection fails.
   */
  detect(path: string, flags?: MagicFlags): string {
    const result = this._magic.detect(path, flags ? flags : -1);
    // Check for detection error
    if (result.startsWith('ERROR')) {
      throw new Error(result.substring('ERROR: '.length));
    }
    return result;
  }

  /**
   * Run libmagic detection for the given file to produce a string with the
   * mime type corresponding to its content.
   *
   * @param path path the file to be detected.
   * @return a string containing the mime type of the file contents (e.g.
   * text/plain) when successful.
   * @throws Error with an error message when the detection fails.
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
   * @throws Error with an error message when the detection fails.
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
   * @throws Error with an error message when the detection fails.
   * @see detect
   */
  detectMime(path: string): string {
    return this.detect(path, this.flags | MagicFlags.MAGIC_MIME);
  }
}
