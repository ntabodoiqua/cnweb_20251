# Multi-stage build for Product Service

# Build stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy common-dto first (dependency)
COPY common-dto/pom.xml common-dto/pom.xml
COPY common-dto/src common-dto/src
RUN cd common-dto && mvn clean install -DskipTests

# Copy product-service files
COPY product-service/pom.xml product-service/pom.xml
RUN cd product-service && mvn dependency:go-offline -B

COPY product-service/src product-service/src

# Build the application
RUN cd product-service && mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Create a non-root user
RUN addgroup -S spring && adduser -S spring -G spring && \
    chown -R spring:spring /app
USER spring:spring

# Copy the JAR from build stage
COPY --from=build /app/product-service/target/*.jar app.jar

# Expose port
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8082/actuator/health || exit 1

# Run the application with optimized JVM settings
# Add --add-opens for Elasticsearch to access BigDecimal fields (Java module system)
ENTRYPOINT ["java", \
    "-Xms512m", \
    "-Xmx1024m", \
    "-XX:+UseG1GC", \
    "-XX:MaxGCPauseMillis=200", \
    "--add-opens=java.base/java.math=ALL-UNNAMED", \
    "--add-opens=java.base/java.lang=ALL-UNNAMED", \
    "--add-opens=java.base/java.util=ALL-UNNAMED", \
    "--add-opens=java.base/java.time=ALL-UNNAMED", \
    "-jar", "/app/app.jar"]
