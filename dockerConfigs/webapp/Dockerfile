FROM tomcat:9.0.108-jdk17-temurin-noble

ENV JAVA_OPTS="-Xmx4096m -Xms4096m"

COPY ./hit-base-web/target/ss-r2.war /usr/local/tomcat/webapps/ss-r2.war
COPY ./dockerConfigs/webapp/context.xml /usr/local/tomcat/conf/context.xml
COPY ./dockerConfigs/webapp/server.xml /usr/local/tomcat/conf/server.xml

CMD ["catalina.sh", "run"]