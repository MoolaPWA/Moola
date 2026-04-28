FROM ubuntu:latest
LABEL authors="arkadiy"

ENTRYPOINT ["top", "-b"]