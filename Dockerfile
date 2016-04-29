FROM node:6.0.0
MAINTAINER Mr.Kananek Thongkam

RUN wget https://github.com/github/git-lfs/releases/download/v1.1.2/git-lfs-linux-amd64-1.1.2.tar.gz
RUN tar -xvf git-lfs-linux-amd64-1.1.2.tar.gz
RUN cd git-lfs-1.1.2
RUN /bin/bash install.sh

WORKDIR /data