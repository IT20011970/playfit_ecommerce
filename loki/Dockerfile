FROM grafana/loki:latest

# Copy configuration
COPY loki-config.yml /etc/loki/local-config.yaml

# Expose Loki port
EXPOSE 3100

# Run Loki
CMD ["-config.file=/etc/loki/local-config.yaml"]
