FORM node:5.10.0

RUN wget https://github.com/github/git-lfs/releases/download/v0.5.1-tracing/git-lfs-linux-amd64-0.5.1.tar.gz
RUN tar -xvf git-lfs-linux-amd64-0.5.1.tar.gz
RUN cd git-lfs-0.5.1
RUN /bin/bash install.sh
