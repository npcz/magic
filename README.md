# Web Assembly port of [libmagic](https://darwinsys.com/file/) as used in [file(1)](https://en.wikipedia.org/wiki/File_(command))) command


The file command uses sophisticated methods to identify file types from their name and contents. This library brings that powerful capability to javascript projects in an efficient and integrated way.

* * *

The projects directly uses the native C implementation of libmagic, transpiled to Web Assembly using emscripten. The result is a close to native performance for file type identification, portable across any platform that has node.js.

### List of features

*   Get a descriptive string of the file contents
*   Get the mime type and mime encoding of a file
*   Optimized loading of the magic file for multiple calls to the API or uses from multiple threads (e.g. WebWorker)

NOTE: file system access is required and therefore the module is only useful in node.js environment. There is possibility though to enhance it to provide content identification using buffers and with the magic file preloaded in emscripten virtual filesystem (not implemented for now).

### Using the simple FileMagic API

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { FileMagic, MagicFlags } from '../lib/index';

// Tell FileMagic where to find the magic.mgc file
FileMagic.magicFile = path.normalize(
  path.join(__dirname, '..', '..', 'dist', 'magic.mgc')
);

// We can onlu use MAGIC_PRESERVE_ATIME on operating suystems that support
// it and that includes OS X for example. It's a good practice as we don't
// want to change the last access time because we are just checking the file
// contents type
if (process.platform === 'darwin' || process.platform === 'linux') {
  FileMagic.defaulFlags = MagicFlags.MAGIC_PRESERVE_ATIME;
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
    files.forEach(file => {
      console.log(
        file,
        ' : ',
        magic.detect(file, magic.flags | MagicFlags.MAGIC_MIME)
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
```

### Using the raw binding

```typescript

import * as fs from 'fs';
import { MagicBindingModule, MagicBindingInterface } from '../lib/index';

const bindingModule = require('../../dist/magic-js');
const binding: MagicBindingModule = bindingModule({
  onRuntimeInitialized() {
    console.log(binding);
    console.log(`Magic version : ${binding.MagicBinding.version()}`);

    if (
      -1 ===
      binding.MagicBinding.init(
        '/Users/abdessattar/Projects/maestro-magic/dist/magic.mgc',
        binding.MAGIC_PRESERVE_ATIME
      )
    ) {
      console.error('Initialization failed!');
      return;
    }

    const magic: MagicBindingInterface = new binding.MagicBinding();

    const files = fs.readdirSync('.');
    console.log(`${files.length} files to check`);
    files.forEach(file => {
      console.log(
        file,
        ' : ',
        magic.detect(file, binding.MagicBinding.flags() | binding.MAGIC_MIME)
      );
      console.log(file, ' : ', magic.detect(file, -1));
    });

    binding.MagicBinding.destroy();
  }
});

```

### Download & Installation

```shell 
$ npm i @npcz/magic
```

```shell 
$ yarn add @npcz/magic
```

### Contributing

To build the module from source:

```shell 
$ git clone https://github.com/npcz/magic.git
$ cd magic
$ yarn build

$ node tests/raw-binding-example.js
```

The build uses docker to reduce the hassle of platform specific things when building libmagic. Setting up docker varies between platforms, refer to the official [docker documentation](https://docs.docker.com/get-started).

Pull requests, bug reports, enhancement suggestions etc... are welcome at the github repository.

### Acknowledgments

* This file command (and magic file) was originally written by Ian Darwin (who still contributes occasionally) and is now maintained by a group of developers lead by Christos Zoulas.
* Piotr Paczkowski for the emscripten [docker images](https://github.com/trzecieu/emscripten-docker).
* The [emscripten](https://emscripten.org) project.

### License

This project is licensed under the BSD-3-Clause [License](./LICENSE)
