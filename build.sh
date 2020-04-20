#!/bin/bash
# Copyright (c) 2019-2019 The Authors.
# SPDX-License-Identifier: BSD-3-Clause

# saner programming env: these switches turn some bugs into errors
set -o errexit -o pipefail -o noclobber -o nounset

# Takes a path argument and returns it as an absolute path.
# No-op if the path is already absolute.
function toAbsolutePath {
    local target="$1"
    
    if [ "$target" == "." ]; then
        pwd
        elif [ "$target" == ".." ]; then
        dirname "$(pwd)"
    else
        echo "$(cd "$(dirname "$1")"; pwd)/$(basename "$1")"
    fi
}

# -allow a command to fail with !’s side effect on errexit
# -use return value from ${PIPESTATUS[0]}, because ! hosed $?
! getopt --test > /dev/null
if [[ ${PIPESTATUS[0]} -ne 4 ]]; then
cat << EOF;
I’m sorry, 'getopt --test' failed in this environment.
Enhanced getopt is available on most "bash-systems", including Cygwin;
 on OS X try brew install gnu-getopt or sudo port install getopt
EOF
    exit 1
fi

OPTIONS=d:vh
LONGOPTS=dist:,verbose,help

function usage() {
cat << EOF;

Usage:
 build.sh [options] [target]

Build the module targets. By default the script will build all targets,
including: magic, libmagic, file and the binding.

Note that libmagic builds the magic.mgx file during native build, which is
required for the library to properly work. Therefore we have to do a 2-pass
build for the file sub-module, the first one to generate the magic file and
the second one to generate the emscripten artifacts. Once the magic file is
built, it is automatically saved to the dist directory.

Target:
    magic    native build of 'file' submodule to create the magic file
    emlib    emscripten build of libmagic static lib for use by binding
    binding  emscripten/embind build of the binding
    all      (default) clean build all targets

Options:
 -d, --dist      set the destination of build artifacts relative to the script
                 directory (default is dist)
 -v, --verbose   show all output from build commands (default is no output)

 -h, --help      display this help
EOF
}

# -regarding ! and PIPESTATUS see above
# -temporarily store output to be able to check for errors
# -activate quoting/enhanced mode (e.g. by writing out “--options”)
# -pass arguments only via   -- "$@"   to separate them correctly
! PARSED=$(getopt --options=$OPTIONS --longoptions=$LONGOPTS --name "$0" -- "$@")
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    # e.g. return value is 1
    #  then getopt has complained about wrong arguments to stdout
    exit 2
fi

# read getopt’s output this way to handle the quoting right:
eval set -- "$PARSED"
DIST_DIR="dist" VERBOSE=no TARGET=all
# now enjoy the options in order and nicely split until we see --
while true; do
    case "$1" in
        -h|--help)
            usage
            exit 0
        ;;
        -v|--verbose)
            VERBOSE=yes
            shift
        ;;
        -d|--dist)
            DIST_DIR="$2"
            shift 2
        ;;
        --)
            shift
            break
        ;;
        *)
            echo "Programming error"
            exit 3
        ;;
    esac
done

# handle non-option arguments
if [ $# -ne 0 ]; then
    if [ $# -ne 1 ]; then
        echo "$0: A single target name can be specified."
        exit 4
    fi
    TARGET=$1
    if [ "$TARGET" != magic ] && [ "$TARGET" != emlib ] && [ "$TARGET" != binding ] && [ "$TARGET" != all ]; then
        echo "$0: invalid target '$TARGET'"
        usage
        exit 4
    fi
fi


ROOT_DIR=$(toAbsolutePath "$(dirname $0)")
[ $VERBOSE == "yes" ] && echo "-- Root directory is: $ROOT_DIR"

LIBMAGIC_SRC_DIR=$ROOT_DIR/node_modules/c-libmagic
[ $VERBOSE == "yes" ] && echo "-- Using libmagic in: $LIBMAGIC_SRC_DIR"
LIBMAGIC_BUILD_DIR=$ROOT_DIR/build/libmagic
! mkdir -p "$LIBMAGIC_BUILD_DIR"
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    echo "$0: failed to setup the build dir for libmagic at $LIBMAGIC_BUILD_DIR"
    exit 3
fi
[ $VERBOSE == "yes" ] && echo "-- Using libmagic in: $LIBMAGIC_SRC_DIR"

DIST_DIR=$ROOT_DIR/$DIST_DIR
[ $VERBOSE == "yes" ] && echo "-- Final build artifacts will be placed in: $DIST_DIR"
! mkdir -p "$DIST_DIR"
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    echo "$0: failed to setup the dist dir at $DIST_DIR"
    exit 3
fi

#
# Native magic file
#
if [ "$TARGET" == "all" ] || [ "$TARGET" == "magic" ]; then
    echo "-- [native-magic] configure stage"
    cd "$LIBMAGIC_BUILD_DIR"
    if [ $VERBOSE == yes ]; then
        ! autoreconf -f -i "$LIBMAGIC_SRC_DIR"
    else
        ! autoreconf -f -i "$LIBMAGIC_SRC_DIR" > /dev/null
    fi
    if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
        echo "$0: failed to autoreconf"
        exit 4
    fi
    if [ $VERBOSE == yes ]; then
        ! "$LIBMAGIC_SRC_DIR"/configure --prefix="$DIST_DIR"/file --enable-static=yes --enable-shared=no
    else
        ! "$LIBMAGIC_SRC_DIR"/configure --prefix="$DIST_DIR"/file --enable-static=yes --enable-shared=no > /dev/null
    fi
    if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
        echo "$0: failed to run configure"
        exit 4
    fi
    echo "-- [native-magic] build stage"
    ! make
    if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
        echo "$0: failed to run make"
        exit 4
    fi
    echo "-- [native-magic] copy magic.mgc to dist dir"
    ! cp magic/magic.mgc "$DIST_DIR"
    if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
        echo "$0: failed to copy magic file to dist dir"
        exit 4
    fi
    cd "$ROOT_DIR"
fi

#
# Emscript build of libmagic
#
if [ "$TARGET" == "all" ] || [ "$TARGET" == "emlib" ]; then
    cd "$LIBMAGIC_BUILD_DIR"
    if [ -f Makefile ]; then
        echo "-- [emscript-libmagic] clean any remaining things from previous builds"
        if [ $VERBOSE == yes ]; then
            ! make clean
        else
            ! make clean > /dev/null
        fi
        if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
            echo "$0: failed to run make clean"
            exit 4
        fi
    else
        if [ $VERBOSE == yes ]; then
            ! autoreconf -f -i "$LIBMAGIC_BUILD_DIR"
        else
            ! autoreconf -f -i "$LIBMAGIC_BUILD_DIR" > /dev/null
        fi
        if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
            echo "$0: failed to autoreconf"
            exit 4
        fi
    fi
    echo "-- [emscript-libmagic] configure stage"
    if [ $VERBOSE == yes ]; then
        ! emconfigure "$LIBMAGIC_SRC_DIR"/configure --enable-static=yes --enable-shared=yes
    else
        ! emconfigure "$LIBMAGIC_SRC_DIR"/configure --enable-static=yes --enable-shared=yes  > /dev/null
    fi
    if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
        echo "$0: failed to run configure"
        exit 4
    fi
    echo "-- [emscript-libmagic] build stage"
    cd src
    ! emmake make
    if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
        echo "$0: failed to run make"
        exit 4
    fi
    cd "$ROOT_DIR"
fi

#
# Emscripten binding
#
if [ "$TARGET" == "all" ] || [ "$TARGET" == "binding" ]; then
    echo "-- [binding] generate js and wasm"
    cd lib/binding
    
    SRCS="magic-js.cpp"
    # Compile the code
    EMCC_OPTIONS="-O3 \
-fno-exceptions \
--bind \
-s ASSERTIONS=1 \
-s ALLOW_MEMORY_GROWTH=1 \
-s MALLOC=emmalloc \
-s MODULARIZE=1 \
-s FILESYSTEM=1 \
-s NODERAWFS=1 \
-o ../magic-js.js \
-I $LIBMAGIC_BUILD_DIR/src \
-L $LIBMAGIC_BUILD_DIR/src/.libs \
-lmagic \
$SRCS"
    echo "em++ $EMCC_OPTIONS"
    # shellcheck disable=SC2086
    ! em++ $EMCC_OPTIONS
    if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
        echo "$0: failed to compile binding"
        exit 4
    fi
    # Copy the generated files to dist
    echo "-- [binding] copy js and wasm to dist"
    ! cp ../magic-js.js ../magic-js.wasm "$DIST_DIR"
    if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
        echo "$0: failed to copy generated magic-js files to dist dir"
        exit 4
    fi
    echo "-- [binding] copy js and wasm to build/lib"
    ! mkdir -p "$ROOT_DIR"/build/lib
    if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
        echo "$0: failed to create destination $ROOT_DIR/build/lib"
        exit 4
    fi
    ! cp ../magic-js.js ../magic-js.wasm "$ROOT_DIR"/build/lib
    if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
        echo "$0: failed to copy generated magic-js files to build dir"
        exit 4
    fi
    cd "$ROOT_DIR"
fi
