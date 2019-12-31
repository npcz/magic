// Copyright (c) 2019-2019 The Authors.
// SPDX-License-Identifier: BSD-3-Clause

import * as fs from 'fs';
import { MagicBindingModule, MagicBindingInterface } from '../lib/index';

const binding = require('../../dist/magic-js');
const instance: MagicBindingModule = binding({
  onRuntimeInitialized() {
    console.log(instance);
    console.log(`Magic version : ${instance.MagicBinding.version()}`);

    if (
      -1 ===
      instance.MagicBinding.init(
        '/Users/abdessattar/Projects/maestro-magic/dist/magic.mgc',
        instance.MAGIC_PRESERVE_ATIME
      )
    ) {
      console.error('Initialization failed!');
      return;
    }

    const m: MagicBindingInterface = new instance.MagicBinding();

    const files = fs.readdirSync('.');
    console.log(`${files.length} files to check`);
    files.forEach(file => {
      console.log(
        file,
        ' : ',
        m.detect(file, instance.MagicBinding.flags() | instance.MAGIC_MIME)
      );
      console.log(file, ' : ', m.detect(file, -1));
    });

    instance.MagicBinding.destroy();
  }
});
