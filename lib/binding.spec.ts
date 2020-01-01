// Copyright (c) 2019-2019 The Authors.
// SPDX-License-Identifier: BSD-3-Clause

import { MagicBindingModule } from './binding';
import * as path from 'path';

// (node:23174) MaxListenersExceededWarning: Possible EventEmitter memory
// leak detected. 11 uncaughtException listeners added to [process]. Use
// emitter.setMaxListeners() to increase limit
// process.setMaxListeners(0);

const moduleOptions = {
  // This can be used to override the way the wasm file is located in
  // the file system when it is not located jsut besides the js script.
  locateFile: function(path: string, scriptDirectory: string) {
    return scriptDirectory + path;
  }
};

describe('Raw binding to libmagic unit tests', () => {
  let bindingModule: any;
  beforeEach(() => {
    bindingModule = require('../dist/magic-js');
  });
  it('loads wasm code when imported', done => {
    const binding: MagicBindingModule = bindingModule({
      ...moduleOptions,
      onRuntimeInitialized() {
        expect(binding).not.toBeNull();
        expect(binding.MagicBinding).not.toBeNull();
        done();
      }
    });
  });
  it('exports libmagic flags', done => {
    const binding: MagicBindingModule = bindingModule({
      ...moduleOptions,
      onRuntimeInitialized() {
        expect(binding).not.toBeNull();
        const props = Object.getOwnPropertyNames(binding);
        expect(props.includes('MAGIC_NONE'));
        expect(props.includes('MAGIC_DEBUG'));
        expect(props.includes('MAGIC_SYMLINK'));
        expect(props.includes('MAGIC_COMPRESS'));
        expect(props.includes('MAGIC_DEVICES'));
        expect(props.includes('MAGIC_MIME_TYPE'));
        expect(props.includes('MAGIC_CONTINUE'));
        expect(props.includes('MAGIC_CHECK'));
        expect(props.includes('MAGIC_PRESERVE_ATIME'));
        expect(props.includes('MAGIC_RAW'));
        expect(props.includes('MAGIC_ERROR'));
        expect(props.includes('MAGIC_MIME_ENCODING'));
        expect(props.includes('MAGIC_MIME_ENCODING)'));
        expect(props.includes('MAGIC_APPLE'));
        expect(props.includes('MAGIC_EXTENSION'));
        expect(props.includes('MAGIC_COMPRESS_TRANSP'));
        expect(props.includes('MAGIC_APPLE)'));
        expect(props.includes('MAGIC_NO_CHECK_COMPRESS'));
        expect(props.includes('MAGIC_NO_CHECK_TAR'));
        expect(props.includes('MAGIC_NO_CHECK_SOFT'));
        expect(props.includes('MAGIC_NO_CHECK_APPTYPE'));
        expect(props.includes('MAGIC_NO_CHECK_ELF'));
        expect(props.includes('MAGIC_NO_CHECK_TEXT'));
        expect(props.includes('MAGIC_NO_CHECK_CDF'));
        expect(props.includes('MAGIC_NO_CHECK_CSV'));
        expect(props.includes('MAGIC_NO_CHECK_TOKENS'));
        expect(props.includes('MAGIC_NO_CHECK_ENCODING'));
        expect(props.includes('MAGIC_NO_CHECK_JSON'));
        expect(props.includes('MAGIC_NO_CHECK_BUILTIN'));
        done();
      }
    });
  });
  it('implements static version()', done => {
    const binding: MagicBindingModule = bindingModule({
      ...moduleOptions,
      onRuntimeInitialized() {
        const version = binding.MagicBinding.version();
        // We're at least using libmagic 5.x
        expect(version).toBeGreaterThan(500);
        done();
      }
    });
  });

  it('implements static defaultPath()', done => {
    const binding: MagicBindingModule = bindingModule({
      ...moduleOptions,
      onRuntimeInitialized() {
        const path = binding.MagicBinding.defaultPath();
        expect(path).not.toBeNull();
        done();
      }
    });
  });
  it('can be successfully initialized with a magic.mgc path and specific flags', done => {
    const binding: MagicBindingModule = bindingModule({
      ...moduleOptions,
      onRuntimeInitialized() {
        const result = binding.MagicBinding.init(
          path.normalize(path.join(__dirname, '..', 'dist', 'magic.mgc')),
          binding.MAGIC_DEBUG
        );
        expect(result).not.toEqual(-1);
        expect(binding.MagicBinding.flags()).toEqual(binding.MAGIC_DEBUG);
        done();
      }
    });
  });
  it('init fails with return val -1 if path does not point to magic.mgc', done => {
    const binding: MagicBindingModule = bindingModule({
      ...moduleOptions,
      onRuntimeInitialized() {
        const result = binding.MagicBinding.init(
          path.normalize(path.join(__dirname, '..', 'dist', 'NOT_magic.mgc')),
          binding.MAGIC_DEBUG
        );
        expect(result).toEqual(-1);
        done();
      }
    });
  });
  it('can not do detection before init is called', done => {
    const binding: MagicBindingModule = bindingModule({
      ...moduleOptions,
      onRuntimeInitialized() {
        const magic = new binding.MagicBinding();
        const result = magic.detect('fffff', -1);
        expect(result.startsWith('ERROR: ')).toBeTruthy();
        done();
      }
    });
  });
  it('does the magic detection', done => {
    const binding: MagicBindingModule = bindingModule({
      ...moduleOptions,
      onRuntimeInitialized() {
        const magicPath = path.normalize(
          path.join(__dirname, '..', 'dist', 'magic.mgc')
        );
        const initResult = binding.MagicBinding.init(
          magicPath,
          binding.MAGIC_NONE
        );
        expect(initResult).not.toEqual(-1);
        const magic = new binding.MagicBinding();
        let result = magic.detect(magicPath, -1);
        expect(
          result.startsWith('magic binary file for file(1) cmd')
        ).toBeTruthy();
        result = magic.detect(magicPath, binding.MAGIC_MIME);
        expect(result).toEqual('application/octet-stream; charset=binary');
        done();
      }
    });
  });
});
