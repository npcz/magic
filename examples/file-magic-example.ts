import * as fs from 'fs';
import * as path from 'path';
import { FileMagic, MagicFlags } from '@npcz/magic';

// Tell FileMagic where to find the magic.mgc file
FileMagic.magicFile = require.resolve('@npcz/magic/dist/magic.mgc');

// We can only use MAGIC_PRESERVE_ATIME on operating systems that support
// it and that includes OS X for example. It's a good practice as we don't
// want to change the last access time because we are just checking the file
// contents type
if (process.platform === 'darwin' || process.platform === 'linux') {
  FileMagic.defaultFlags = MagicFlags.MAGIC_PRESERVE_ATIME;
}

// Get the single instance of FileMagic and work with it
FileMagic.getInstance()
  .then((magic: FileMagic) => {
    // The version is a number with the left most digit being the major
    // version and the other digits are the minor
    const version = magic.version();
    const major = ('' + version).charAt(0);
    const minor = ('' + version).substr(1);
    console.log(`Using magic version: ${major}.${minor}`);

    // We can call the detection methods
    const files = fs.readdirSync('.');
    console.log(`${files.length} files to check`);
    files.forEach((file) => {
      console.log(
        file,
        ' : ',
        magic.detect(file, magic.flags | MagicFlags.MAGIC_MIME),
      );
      console.log(file, ' : ', magic.detect(file));
    });

    // When we are done, close
    FileMagic.close();
  })
  .catch((err: Error) => {
    console.error(err);
    // when the initialization fails, FileMagic already cleans up, but
    // there is no harm in getting used to always close when no longer
    // needed.
    FileMagic.close();
  });
