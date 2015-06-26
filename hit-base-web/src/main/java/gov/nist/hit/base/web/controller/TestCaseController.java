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

import gov.nist.hit.core.domain.TestCase;
import gov.nist.hit.core.domain.TestContext;
import gov.nist.hit.core.domain.TestStep;
import gov.nist.hit.core.repo.TestCaseRepository;
import gov.nist.hit.core.repo.TestContextRepository;
import gov.nist.hit.core.repo.TestStepRepository;
import gov.nist.hit.core.service.MessageParser;
import gov.nist.hit.core.service.MessageValidator;
import gov.nist.hit.core.service.exception.MessageException;
import gov.nist.hit.core.service.exception.TestCaseException;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */

@RestController
public class TestCaseController {

  Logger logger = LoggerFactory.getLogger(TestCaseController.class);

  @Autowired
  private TestContextRepository testContextRepository;

  @Autowired
  private TestStepRepository testStepRepository;

  @Autowired
  private MessageValidator messageValidator;

  @Autowired
  private MessageParser messageParser;

  @Autowired
  protected TestCaseRepository testCaseRepository;

  @RequestMapping(value = "/testcase/{testCaseId}")
  public TestCase testCase(@PathVariable final Long testCaseId) {
    logger.info("Fetching testCase with id=" + testCaseId);
    TestCase testCase = testCaseRepository.findOne(testCaseId);
    if (testCase == null) {
      throw new TestCaseException(testCaseId);
    }
    return testCase;
  }

  @RequestMapping(value = "/teststep/{testStepId}")
  public TestStep testStep(@PathVariable final Long testStepId) {
    logger.info("Fetching testCase with id=" + testStepId);
    TestStep testStep = testStepRepository.findOne(testStepId);
    if (testStep == null) {
      throw new TestCaseException(testStepId);
    }
    return testStep;
  }



  @RequestMapping(value = "/testcase/{testCaseId}/downloadTestPackage", method = RequestMethod.POST)
  public void testPackage(@PathVariable Long testCaseId, HttpServletRequest request,
      HttpServletResponse response) throws MessageException {
    try {
      TestCase tc = testCaseRepository.findOne(testCaseId);
      if (tc == null) {
        throw new IllegalArgumentException("The test case cannot be retrieved");
      }
      if (tc.getTestPackage() == null || tc.getTestPackage().getPdfPath() == null) {
        throw new IllegalArgumentException("No test package found");
      }
      InputStream content =
          TestCaseController.class.getResourceAsStream(tc.getTestPackage().getPdfPath());
      response
          .setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      response.setHeader("Content-disposition", "attachment;filename=" + tc.getName() + ".docx");
      FileCopyUtils.copy(content, response.getOutputStream());

    } catch (IOException e) {
      logger.debug("Failed to download the test package ");
      throw new TestCaseException("Cannot download the test package " + e.getMessage());
    }
  }

  @RequestMapping(value = "/{testCaseId}/downloadTestStory", method = RequestMethod.POST,
      consumes = "application/x-www-form-urlencoded; charset=UTF-8")
  public String testStory(@RequestParam("path") String path, @RequestParam("title") String title,
      HttpServletRequest request, HttpServletResponse response) throws MessageException {
    try {
      if (path == null) {
        throw new IllegalArgumentException("No test story path found");
      }
      InputStream content = TestCaseController.class.getResourceAsStream(path);
      response.setContentType("application/pdf");
      response.setHeader("Content-disposition", "attachment;filename=" + title + "-TestStory.pdf");
      FileCopyUtils.copy(content, response.getOutputStream());

    } catch (IOException e) {
      logger.debug("Failed to download the test stoty of " + title);
      throw new TestCaseException("Cannot download the test story " + e.getMessage());
    }
    return null;
  }



  @RequestMapping(value = "/teststep/{testStepId}/testcontext")
  public TestContext testContext(@PathVariable final Long testStepId) {
    logger.info("Fetching testContext from testStepId=" + testStepId);
    TestContext testContext = testStep(testStepId).getTestContext();
    if (testContext == null)
      throw new TestCaseException("No testcontext available for teststep id=" + testStepId);
    return testContext;
  }



}
