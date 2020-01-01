export declare enum MagicFlags {
    /** No flags */
    MAGIC_NONE,
    /** Turn on debugging */
    MAGIC_DEBUG,
    /** Follow symlinks */
    MAGIC_SYMLINK,
    /** Check inside compressed files */
    MAGIC_COMPRESS,
    /** Look at the contents of devices */
    MAGIC_DEVICES,
    /** Return the MIME type */
    MAGIC_MIME_TYPE,
    /** Return all matches */
    MAGIC_CONTINUE,
    /** Print warnings to stderr */
    MAGIC_CHECK,
    /** Restore access time on exit */
    MAGIC_PRESERVE_ATIME,
    /** Don't convert unprintable chars */
    MAGIC_RAW,
    /** Handle ENOENT etc as real errors */
    MAGIC_ERROR,
    /** Return the MIME encoding */
    MAGIC_MIME_ENCODING,
    /** Return both the mime type and the encoding */
    MAGIC_MIME,
    /** Return the Apple creator/type */
    MAGIC_APPLE,
    /** Return a /-separated list of extensions */
    MAGIC_EXTENSION,
    /** Check inside compressed files but not report compression */
    MAGIC_COMPRESS_TRANSP,
    /** Equivalent to MAGIC_EXTENSION|MAGIC_MIME|MAGIC_APPLE  */
    MAGIC_NODESC,
    /** Don't check for compressed files */
    MAGIC_NO_CHECK_COMPRESS,
    /** Don't check for tar files */
    MAGIC_NO_CHECK_TAR,
    /** Don't check magic entries */
    MAGIC_NO_CHECK_SOFT,
    /** Don't check application type */
    MAGIC_NO_CHECK_APPTYPE,
    /** Don't check for elf details */
    MAGIC_NO_CHECK_ELF,
    /** Don't check for text files */
    MAGIC_NO_CHECK_TEXT,
    /** Don't check for cdf files */
    MAGIC_NO_CHECK_CDF,
    /** Don't check for CSV files */
    MAGIC_NO_CHECK_CSV,
    /** Don't check tokens */
    MAGIC_NO_CHECK_TOKENS,
    /** Don't check text encodings */
    MAGIC_NO_CHECK_ENCODING,
    /** Don't check for JSON files */
    MAGIC_NO_CHECK_JSON,
    /** No built-in tests; only consult the magic file */
    MAGIC_NO_CHECK_BUILTIN
}
/**
 * Enhanced interface to the libmagic binding.
 */
export declare class FileMagic {
    /**
     * Path to the magic file.
     *
     * Can be changed only before the first call to getInstance(). This path
     * must be correct and pointing to the location of the magic.mgc file. By
     * default, it is expected to be in the current script working directory.
     */
    static magicFile: string;
    /**
     * Default flags used by libmagic binding.
     *
     * These flags can customize the behavior of file type detection. The
     * default flags can be changed only before the first call to the
     * getInstance() method. After that, detection can always be customized
     * by providing specific flags to the detect() method.
     */
    static defaulFlags: MagicFlags;
    /**
     * The single instance of FileMagic.
     */
    private static _instance;
    /**
     * The binding static interface.
     */
    private static _binding;
    /**
     * The binding instance interface.
     */
    private _magic;
    /**
     * Private constructor to prevent creation of instances of this class
     * except through the getInstance() method.
     */
    private constructor();
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
    static getInstance(): Promise<FileMagic>;
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
    get flags(): MagicFlags;
    /**
     * Get the version of libmagic.
     *
     * @returns The version of libmagic, e.g. 835.
     */
    static version(): number;
    /**
     * Destory the binding and release any resources it was holding (e.g. memory,
     * file desriptors, etc...).
     *
     * This method must be called when the binding is no longer needed. After it
     * has been called, the binding can no longer be used and a new instance must
     * be created.
     */
    close(): void;
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
    detect(path: string, flags?: MagicFlags): string;
}
