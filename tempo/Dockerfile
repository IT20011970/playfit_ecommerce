FROM grafana/tempo:latest

# Copy configuration
COPY tempo-config.yml /etc/tempo.yaml

# Expose Tempo ports
EXPOSE 3200 4317 4318 9411 14268

# Run Tempo
CMD ["-config.file=/etc/tempo.yaml"]
