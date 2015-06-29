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

package gov.nist.hit.base.web.controller;

import gov.nist.hit.core.service.exception.MessageParserException;
import gov.nist.hit.core.service.exception.MessageValidationException;
import gov.nist.hit.core.service.exception.ProfileParserException;
import gov.nist.hit.core.service.exception.TestCaseException;
import gov.nist.hit.core.service.exception.ValidationReportException;
import gov.nist.hit.core.service.exception.XmlFormatterException;
import gov.nist.hit.core.service.exception.XmlParserException;
import gov.nist.hit.core.transport.TransportClientException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * @author Harold Affo (NIST)
 * 
 */
@ControllerAdvice
public class ExceptionHandlingController {
  static final Logger logger = LoggerFactory.getLogger(ExceptionHandlingController.class);

  public ExceptionHandlingController() {
    super();
  }

  @ExceptionHandler(Exception.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String exception(Exception ex) {
    logger.debug(ex.getMessage());
    return "Sorry, an error occurred";
  }

  @ExceptionHandler(TestCaseException.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String testCaseException(TestCaseException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, an error occurred";
  }

  @ExceptionHandler(MessageValidationException.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String messageValidationException(MessageValidationException ex) {
    logger.debug(ex.getMessage());
    ex.printStackTrace();
    return "Sorry, validation failed \n";
  }


  @ExceptionHandler(MessageParserException.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String MessageParserException(MessageValidationException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, message parsing failed: \n";
  }

  @ExceptionHandler(ValidationReportException.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String reportException(ValidationReportException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, exporting the report Failed.\n";
  }


  @ExceptionHandler(TransportClientException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String reportException(TransportClientException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, connection failed.";
  }

  @ExceptionHandler(ProfileParserException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String profileParserExeption(ProfileParserException ex) {
    logger.debug(ex.getMessage());
    return "Sorry, integrationProfile cannot be parsed.\n";
  }


  @ExceptionHandler(XmlParserException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String xmlParserException(XmlParserException ex) {
    logger.debug(ex.getMessage());
    return "Malformed xml content.";
  }

  @ExceptionHandler(XmlFormatterException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String xmlFormatterException(XmlFormatterException ex) {
    logger.debug(ex.getMessage());
    return "Malformed xml content.";
  }

}
