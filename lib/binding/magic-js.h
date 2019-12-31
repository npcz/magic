// Copyright (c) 2019-2019 The Authors.
// This module uses the open source implementation of the file(1) command
// from https://darwinsys.com/file.
//
// SPDX-License-Identifier: BSD-3-Clause

#ifndef MAGIC_JS_H_INCLUDED
#define MAGIC_JS_H_INCLUDED

#include <emscripten/bind.h>

#include <string>
#include <queue>
#include <mutex>

#include <magic.h>

using namespace emscripten;

class MagicBinding
{
public:
  static int init(const std::string &path, int flags);
  static void destroy();

  static int version();
  static std::string defaultPath();
  static int flags() { return _flags; };

  MagicBinding();
  std::string detect(const std::string &path, int flags = MAGIC_NONE);

private:
  magic_t ms = nullptr;

  static std::queue<magic_t> ms_pool;
  static std::mutex ms_pool_mutex;
  static std::string magicPath;
  static int _flags;
};

EMSCRIPTEN_BINDINGS(magic_js)
{
  constant("MAGIC_NONE", MAGIC_NONE);
  constant("MAGIC_DEBUG", MAGIC_DEBUG);
  constant("MAGIC_SYMLINK", MAGIC_SYMLINK);
  constant("MAGIC_COMPRESS", MAGIC_COMPRESS);
  constant("MAGIC_DEVICES", MAGIC_DEVICES);
  constant("MAGIC_MIME_TYPE", MAGIC_MIME_TYPE);
  constant("MAGIC_CONTINUE", MAGIC_CONTINUE);
  constant("MAGIC_CHECK", MAGIC_CHECK);
  constant("MAGIC_PRESERVE_ATIME", MAGIC_PRESERVE_ATIME);
  constant("MAGIC_RAW", MAGIC_RAW);
  constant("MAGIC_ERROR", MAGIC_ERROR);
  constant("MAGIC_MIME_ENCODING", MAGIC_MIME_ENCODING);
  constant("MAGIC_MIME", MAGIC_MIME);
  constant("MAGIC_APPLE", MAGIC_APPLE);
  constant("MAGIC_EXTENSION", MAGIC_EXTENSION);
  constant("MAGIC_COMPRESS_TRANSP", MAGIC_COMPRESS_TRANSP);
  constant("MAGIC_NODESC", MAGIC_NODESC);
  constant("MAGIC_NO_CHECK_COMPRESS", MAGIC_NO_CHECK_COMPRESS);
  constant("MAGIC_NO_CHECK_TAR", MAGIC_NO_CHECK_TAR);
  constant("MAGIC_NO_CHECK_SOFT", MAGIC_NO_CHECK_SOFT);
  constant("MAGIC_NO_CHECK_APPTYPE", MAGIC_NO_CHECK_APPTYPE);
  constant("MAGIC_NO_CHECK_ELF", MAGIC_NO_CHECK_ELF);
  constant("MAGIC_NO_CHECK_TEXT", MAGIC_NO_CHECK_TEXT);
  constant("MAGIC_NO_CHECK_CDF", MAGIC_NO_CHECK_CDF);
  constant("MAGIC_NO_CHECK_CSV", MAGIC_NO_CHECK_CSV);
  constant("MAGIC_NO_CHECK_TOKENS", MAGIC_NO_CHECK_TOKENS);
  constant("MAGIC_NO_CHECK_ENCODING", MAGIC_NO_CHECK_ENCODING);
  constant("MAGIC_NO_CHECK_JSON", MAGIC_NO_CHECK_JSON);
  constant("MAGIC_NO_CHECK_BUILTIN", MAGIC_NO_CHECK_BUILTIN);

  class_<MagicBinding>("MagicBinding")
      .constructor()
      .function("detect", &MagicBinding::detect)
      .class_function("flags", &MagicBinding::flags)
      .class_function("init", &MagicBinding::init)
      .class_function("destroy", &MagicBinding::destroy)
      .class_function("version", &MagicBinding::version)
      .class_function("defaultPath", &MagicBinding::defaultPath);
}

#endif // MAGIC_JS_H_INCLUDED
