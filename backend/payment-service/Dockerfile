# Multi-stage build for Payment Service

# Build stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy common-dto first (dependency)
COPY common-dto/pom.xml common-dto/pom.xml
COPY common-dto/src common-dto/src
RUN cd common-dto && mvn clean install -DskipTests

# Copy payment-service files
COPY payment-service/pom.xml payment-service/pom.xml
RUN cd payment-service && mvn dependency:go-offline -B

COPY payment-service/src payment-service/src

# Build the application
RUN cd payment-service && mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
# Set timezone to Asia/Ho_Chi_Minh (fix lệch giờ)
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
    && echo "Asia/Ho_Chi_Minh" > /etc/timezone \
    && apk del tzdata
# Create a non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the JAR from build stage
COPY --from=build /app/payment-service/target/*.jar app.jar

# Expose port
EXPOSE 8086

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8086/actuator/health || exit 1

# Run the application with optimized JVM settings
ENTRYPOINT ["java", \
    "-Xms256m", \
    "-Xmx512m", \
    "-XX:+UseG1GC", \
    "-XX:MaxGCPauseMillis=200", \
    "-jar", "/app/app.jar"]
