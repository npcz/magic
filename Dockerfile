FROM emscripten/emsdk:3.1.0

RUN apt-get update && \
    apt-get install -qqy autoconf automake libtool
