# Multi-stage build for User Service

# Build stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy common-dto first (dependency)
COPY ../common-dto/pom.xml ../common-dto/pom.xml
COPY ../common-dto/src ../common-dto/src
RUN cd ../common-dto && mvn clean install -DskipTests

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

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
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8081/actuator/health || exit 1

# Run the application with optimized JVM settings
ENTRYPOINT ["java", \
    "-Xms512m", \
    "-Xmx1024m", \
    "-XX:+UseG1GC", \
    "-XX:MaxGCPauseMillis=200", \
    "-jar", "/app/app.jar"]
