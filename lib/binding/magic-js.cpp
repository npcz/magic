// Copyright (c) 2019-2019 The Authors.
// This module uses the opensource implementation of the file(1) command
// from https://darwinsys.com/file.
//
// SPDX-License-Identifier: BSD-3-Clause

#include <iostream>

#include "magic-js.h"

#include <magic.h>

int MagicBinding::_flags = MAGIC_NONE;
std::string MagicBinding::magicPath;
std::queue<magic_t> MagicBinding::ms_pool;
std::mutex MagicBinding::ms_pool_mutex;

static magic_t newMagic(const std::string &path, int flags)
{
    auto ms = magic_open(flags);
    if (ms)
    {
        if (-1 == magic_load(ms, path.c_str()))
        {
            magic_close(ms);
            return nullptr;
        }
    }

    const char *e;
    if ((e = magic_error(ms)) != NULL)
        std::cerr << "WARNING: " << e << std::endl;

    return ms;
}

MagicBinding::MagicBinding()
{
}

std::string MagicBinding::detect(const std::string &path, int flags)
{
    // Acquire a magic context from the pool or make a new one
    magic_t ms = nullptr;
    {
        std::lock_guard<std::mutex> lock(ms_pool_mutex);
        if (!ms_pool.empty())
        {
            ms = ms_pool.front();
            ms_pool.pop();
        }
    }
    if (!ms)
    {
        ms = newMagic(MagicBinding::magicPath, (flags == -1) ? MagicBinding::_flags : flags);
        if (!ms)
            return "ERROR: could not initialize the magic context for this request";
    }
    else
    {
        magic_setflags(ms, (flags == -1) ? MagicBinding::_flags : flags);
    }

    std::string detectedType;
    auto result = magic_file(ms, path.c_str());
    if (!result)
    {
        detectedType.append("ERROR: ").append(magic_error(ms));
    }
    else if (std::string(result).rfind("cannot open", 0) == 0)
    {
        detectedType.append("ERROR: ").append(result);
    }
    else
    {
        detectedType.append(result);
    }
    {
        // Return the magic context to the pool
        std::lock_guard<std::mutex> lock(ms_pool_mutex);
        ms_pool.push(ms);
    }
    return detectedType;
}

int MagicBinding::version()
{
    return magic_version();
}

std::string MagicBinding::defaultPath()
{
    return magic_getpath(nullptr, 0);
}

int MagicBinding::init(const std::string &path, int flags)
{
    if (!ms_pool.empty())
        return 0;

    magicPath = path;
    MagicBinding::_flags = flags;

    // At initialization always make one magic context data available
    auto ms = newMagic(path, flags);
    if (ms == nullptr)
        return -1;

    std::lock_guard<std::mutex> lock(ms_pool_mutex);
    ms_pool.push(ms);
    return 0;
}

void MagicBinding::destroy()
{
    std::lock_guard<std::mutex> lock(ms_pool_mutex);
    while (!ms_pool.empty())
    {
        auto ms = ms_pool.front();
        ms_pool.pop();
        magic_close(ms);
    }
}
