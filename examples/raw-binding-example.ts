// Copyright (c) 2019-2019 The Authors.
// SPDX-License-Identifier: BSD-3-Clause

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
