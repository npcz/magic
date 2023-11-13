FROM emscripten/emsdk:3.1.48

RUN apt-get update && \
    apt-get install -qqy autoconf automake libtool
