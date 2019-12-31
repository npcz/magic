FROM trzeci/emscripten-upstream

RUN apt-get update && \
    apt-get install -qqy autoconf automake libtool