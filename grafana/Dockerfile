FROM grafana/grafana:latest

# Copy provisioning configuration for Azure
COPY provisioning/datasources/datasources-azure.yml /etc/grafana/provisioning/datasources/datasources.yml
COPY grafana.ini /etc/grafana/grafana.ini

# Expose Grafana port
EXPOSE 3000

# Set environment variables
ENV GF_SECURITY_ADMIN_USER=admin
ENV GF_SECURITY_ADMIN_PASSWORD=admin
ENV GF_USERS_ALLOW_SIGN_UP=false
ENV GF_SERVER_ROOT_URL=https://devplayfitgrafana.azurewebsites.net

# Run Grafana
USER grafana
ENTRYPOINT ["/run.sh"]
