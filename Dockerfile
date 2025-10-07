# --- build stage ---
FROM maven:3.8.8-eclipse-temurin-17 AS build

WORKDIR /app

# copy maven files first for better caching
COPY pom.xml .
# copy source
COPY src ./src

# build the jar (skip tests to speed up; remove -DskipTests to run tests)
RUN mvn -B -DskipTests package

# --- runtime stage ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# copy packaged jar. if your artifact name differs, the wildcard handles it
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS=""

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
