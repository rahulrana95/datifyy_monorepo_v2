FROM bufbuild/buf:latest

WORKDIR /workspace

# Install bash for the watcher script
RUN apk add --no-cache bash coreutils findutils

# Copy proto files and buf.gen.yaml
COPY proto/ ./proto/

# Update dependencies
RUN cd proto && buf dep update

# Default command
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["buf generate proto"]