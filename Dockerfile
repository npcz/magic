FROM trzeci/emscripten:1.39.18-upstream

RUN apt-get update && \
    apt-get install -qqy autoconf automake libtool