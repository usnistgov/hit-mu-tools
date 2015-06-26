/**
 * This software was developed at the National Institute of Standards and Technology by employees of
 * the Federal Government in the course of their official duties. Pursuant to title 17 Section 105
 * of the United States Code this software is not subject to copyright protection and is in the
 * public domain. This is an experimental system. NIST assumes no responsibility whatsoever for its
 * use by other parties, and makes no guarantees, expressed or implied, about its quality,
 * reliability, or any other characteristic. We would appreciate acknowledgement if the software is
 * used. This software can be redistributed and/or modified freely provided that any derivative
 * works bear some notice that they are derived from it, and any modified versions bear some notice
 * that they have been modified.
 */

package gov.nist.hit.base.web.config;

import org.springframework.context.annotation.Configuration;

/**
 * @author Harold Affo (NIST)
 * 
 */

@Configuration
// @ImportResource("classpath:/iztool-ws-context.xml")
public class WebBeanConfig {

  // @Autowired
  // AppConfig appConfig;

  //
  // @Bean
  // public MessageParser er7MessageParser() {
  // appConfig.checkProperty("app.message.parser");
  // try {
  // Class<?> clazz = Class.forName("app.message.parser");
  // Constructor<?> constructor = clazz.getDeclaredConstructor();
  // MessageParser parser =
  // (MessageParser) constructor.newInstance();
  // return parser;
  // } catch (Exception e) {
  // throw new RuntimeException(e.getMessage());
  // }
  //
  //
  // return new Er7MessageParserImpl();
  // }

  // @Bean
  // public MessageValidator er7Validator() {
  // return new Er7MessageValidatorImpl();
  // }



  //
  // @Bean
  // public XmlMessageParser xmlParser() {
  // return new XmlMessageParserImpl();
  // }

  // @Bean
  // public Er7MessageParser er7Parser() {
  // return new Er7MessageParserImpl();
  // }


  //
  // @Bean
  // public Er7ValidationReportGenerator er7ReportGenerator() {
  // return new Er7ValidationReportGeneratorImpl();
  // }

  // @Bean
  // public SimpleJaxWsServiceExporter simpleJaxWsServiceExporter() {
  // return new SimpleJaxWsServiceExporter();
  // }

  // @Bean
  // public Receiver receiver() {
  // return new IISReceiver();
  // }

  // public MessageValidator get(String className) {
  // try {
  // Class<?> clazz = Class.forName(className);
  // Constructor<?> constructor = clazz.getDeclaredConstructor();
  // ValueSetLibrarySerializerImpl tableSerializer =
  // (ValueSetLibrarySerializerImpl) constructor.newInstance();
  // return tableSerializer;
  // } catch (Exception e) {
  // throw new RuntimeException(e.getMessage());
  // }
  // }
}
