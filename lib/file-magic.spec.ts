// Copyright (c) 2019-2019 The Authors.
// SPDX-License-Identifier: BSD-3-Clause

import { FileMagic } from './file-magic';
import * as path from 'path';
import { MagicFlags } from './file-magic';
// (node:23174) MaxListenersExceededWarning: Possible EventEmitter memory
// leak detected. 11 uncaughtException listeners added to [process]. Use
// emitter.setMaxListeners() to increase limit
// There is no bug here - Just too many test cases loading the binding module
// which installs the listener each time.
process.setMaxListeners(0);

describe('file magic unit tests', () => {
  let magic: FileMagic;

  beforeEach(() => {
    FileMagic.magicFile = path.normalize(
      path.join(__dirname, '..', 'dist', 'magic.mgc'),
    );
  });
  describe('normal behavior', () => {
    beforeEach(async () => {
      magic = await FileMagic.getInstance();
      expect(magic).not.toBeNull();
    });
    afterEach(() => {
      FileMagic.close();
      magic = undefined;
    });
    it('loads the module and returns a working instance', async () => {});
    it('closing it multiple time is ok', async () => {
      const magic = await FileMagic.getInstance();
      expect(magic).not.toBeNull();
      FileMagic.close();
      FileMagic.close();
      FileMagic.close();
    });
    it('returns the version > 500', async () => {
      expect(magic.version()).toBeGreaterThan(500);
    });
    it('default flags are MAGIC_NONE', async () => {
      expect(magic.flags).toEqual(MagicFlags.MAGIC_NONE);
    });
    it('detect returns full description of file by default', async () => {
      const result = magic.detect(__filename);
      expect(result).toEqual('Java source, ASCII text');
    });
    it('detectMime returns full mime/encoding of file', async () => {
      const result = magic.detectMime(__filename);
      expect(result).toEqual('text/x-java; charset=us-ascii');
    });
    it('detectMimeType returns mime type of file', async () => {
      const result = magic.detectMimeType(__filename);
      expect(result).toEqual('text/x-java');
    });
    it('detectMimeEncoding return full description mime encoding of file', async () => {
      const result = magic.detectMimeEncoding(__filename);
      expect(result).toEqual('us-ascii');
    });
  });

  describe('error handling cases', () => {
    afterEach(() => {
      FileMagic.close();
      magic = undefined;
    });
    it('rejects when initialization fails', () => {
      FileMagic.magicFile = 'xxxxx-does-not-exist';
      return expect(FileMagic.getInstance()).rejects.toMatch('failed');
    });
    it('throws when detection fails', async () => {
      FileMagic.magicFile = path.normalize(
        path.join(__dirname, '..', 'dist', 'magic.mgc'),
      );
      magic = await FileMagic.getInstance();
      expect(magic).not.toBeNull();
      expect(() => magic.detect(__filename)).not.toThrow();
      expect(() => {
        magic.detect('xxxxx');
      }).toThrow();
      FileMagic.close();
      magic = undefined;
    });
  });

  describe('it does not work after FileMagic is closed', () => {
    beforeAll(async () => {
      magic = await FileMagic.getInstance();
      expect(magic).not.toBeNull();
      expect(magic.version()).toBeGreaterThan(500);
      FileMagic.close();
    });
    afterAll(() => {
      magic = undefined;
    });
    it('version', async () => {
      expect(() => {
        magic.version();
      }).toThrowError('FileMagic has not been initialized.');
    });
    it('flags', async () => {
      expect(() => {
        magic.flags;
      }).toThrowError('FileMagic has not been initialized.');
    });
    it('detect', async () => {
      expect(() => {
        magic.detect(__filename);
      }).toThrowError('FileMagic has not been initialized.');
    });
    it('detectMimeType', async () => {
      expect(() => {
        magic.detectMimeType(__filename);
      }).toThrowError('FileMagic has not been initialized.');
    });
    it('detectMimeEncoding', async () => {
      expect(() => {
        magic.detectMimeEncoding(__filename);
      }).toThrowError('FileMagic has not been initialized.');
    });
    it('detectMime', async () => {
      expect(() => {
        magic.detectMime(__filename);
      }).toThrowError('FileMagic has not been initialized.');
    });
  });
});
