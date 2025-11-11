FROM bufbuild/buf:latest AS buf

WORKDIR /workspace

# Copy proto files
COPY proto/ ./proto/

# Install dependencies if needed
RUN cd proto && buf mod update

# Generate command will be run via docker-compose
CMD ["buf", "generate", "proto"]