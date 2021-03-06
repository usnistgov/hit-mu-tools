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

import gov.nist.hit.core.domain.Json;
import gov.nist.hit.core.domain.MessageCommand;
import gov.nist.hit.core.domain.TestContext;
import gov.nist.hit.core.repo.TestCaseRepository;
import gov.nist.hit.core.repo.TestContextRepository;
import gov.nist.hit.core.repo.TestStepRepository;
import gov.nist.hit.core.service.MessageParser;
import gov.nist.hit.core.service.MessageValidator;
import gov.nist.hit.core.service.ProfileParser;
import gov.nist.hit.core.service.exception.MessageException;
import gov.nist.hit.core.service.exception.MessageParserException;
import gov.nist.hit.core.service.exception.MessageValidationException;
import gov.nist.hit.core.service.exception.TestCaseException;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */

@RequestMapping("/testcontext")
@RestController
public class TestContextController {

  Logger logger = LoggerFactory.getLogger(TestContextController.class);

  @Autowired
  private TestContextRepository testContextRepository;

  @Autowired
  private TestStepRepository testStepRepository;

  @Autowired
  private MessageValidator messageValidator;

  @Autowired
  private MessageParser messageParser;

  @Autowired
  private ProfileParser profileParser;



  @Autowired
  protected TestCaseRepository testCaseRepository;

  @RequestMapping(value = "/{testContextId}")
  public TestContext testContext(@PathVariable final Long testContextId) {
    logger.info("Fetching testContext with id=" + testContextId);
    TestContext testContext = testContextRepository.findOne(testContextId);
    if (testContext == null) {
      throw new TestCaseException("No test context available with id=" + testContextId);
    }
    return testContext;

  }

  @RequestMapping(value = "/{testContextId}/parseMessage", method = RequestMethod.POST)
  public List<gov.nist.hit.core.domain.MessageElement> parse(
      @PathVariable final Long testContextId, @RequestBody final MessageCommand command)
      throws MessageParserException {
    try {
      logger.info("Parsing message");
      TestContext testContext = testContext(testContextId);
      String message = getMessageContent(command);
      return messageParser.parse(message,
          testContext.getConformanceProfile().getIntegrationProfile().getXml(),
          testContext.getConformanceProfile().getSourceId()).getElements();
    } catch (MessageException e) {
      throw new MessageParserException(e.getMessage());
    }
  }

  @RequestMapping(value = "/{testContextId}/validateMessage", method = RequestMethod.POST)
  public Json validate(@PathVariable final Long testContextId,
      @RequestBody final MessageCommand command) throws MessageValidationException {
    try {
      TestContext testContext = testContext(testContextId);
      String res =
          messageValidator.validate(command.getName(), getMessageContent(command), testContext
              .getConformanceProfile().getSourceId(), testContext.getConformanceProfile()
              .getIntegrationProfile().getXml(), testContext.getVocabularyLibrary().getXml(),
              testContext.getConstraints().getXml(),
              testContext.getAddditionalConstraints() != null ? testContext
                  .getAddditionalConstraints().getXml() : null);
      return new Json(res);
    } catch (MessageException e) {
      throw new MessageValidationException(e.getMessage());
    } catch (MessageValidationException e) {
      throw new MessageValidationException(e.getMessage());
    }
  }

  public static String getMessageContent(MessageCommand command) throws MessageException {
    String message = command.getContent();
    if (message == null) {
      throw new MessageException("No message provided");
    }
    return message;
  }



}
