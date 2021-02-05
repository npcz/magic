FROM emscripten/emsdk:2.0.13

RUN apt-get update && \
    apt-get install -qqy autoconf automake libtool