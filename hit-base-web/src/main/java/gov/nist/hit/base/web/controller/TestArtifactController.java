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

import gov.nist.hit.core.domain.AbstractTestCase;
import gov.nist.hit.core.domain.TestArtifact;
import gov.nist.hit.core.repo.TestCaseRepository;
import gov.nist.hit.core.repo.TestStepRepository;
import gov.nist.hit.core.service.exception.MessageException;
import gov.nist.hit.core.service.exception.TestCaseException;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

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

@RequestMapping("/testartifact")
@RestController
public class TestArtifactController {

  static final Logger logger = LoggerFactory.getLogger(TestArtifactController.class);

  @Autowired
  private TestCaseRepository testCaseRepository;

  @Autowired
  private TestStepRepository testStepRepository;

  @RequestMapping(value = "/download", method = RequestMethod.POST,
      consumes = "application/x-www-form-urlencoded; charset=UTF-8")
  public String download(@RequestParam("path") String path, HttpServletRequest request,
      HttpServletResponse response) throws MessageException {
    try {
      if (path != null && path.endsWith("pdf")) {
        InputStream content = null;
        String fileName = path.substring(path.lastIndexOf("/") + 1);
        content = TestArtifactController.class.getResourceAsStream("/" + path);
        response.setContentType("application/pdf");
        response.setHeader("Content-disposition", "attachment;filename=" + fileName);
        FileCopyUtils.copy(content, response.getOutputStream());
      } else if (path != null && path.endsWith("docx")) {
        InputStream content = null;
        String fileName = path.substring(path.lastIndexOf("/") + 1);
        if (!path.startsWith("/")) {
          content = TestArtifactController.class.getResourceAsStream("/" + path);
        } else {
          content = TestArtifactController.class.getResourceAsStream(path);
        }
        response
            .setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        response.setHeader("Content-disposition", "attachment;filename=" + fileName);
        FileCopyUtils.copy(content, response.getOutputStream());
      }

      throw new IllegalArgumentException("Invalid Path Provided");
    } catch (IOException e) {
      logger.debug("Failed to download the test package ");
      throw new TestCaseException("Cannot download the artifact " + e.getMessage());
    }

  }


  @RequestMapping(value = "/{testId}", method = RequestMethod.GET)
  public Map<String, TestArtifact> allArtifacts(@RequestParam("type") String type,
      @PathVariable final Long testId) {
    AbstractTestCase obj = null;
    Map<String, TestArtifact> result = new HashMap<String, TestArtifact>();
    logger.info("Fetching artifacts of " + type + " with id=" + testId);
    if ("TestCase".equalsIgnoreCase(type)) {
      obj = testCaseRepository.findOne(testId);
    } else if ("TestStep".equalsIgnoreCase(type)) {
      obj = testStepRepository.findOne(testId);
    }
    if (obj != null) {
      result.put("jurorDocument", obj.getJurorDocument());
      result.put("messageContent", obj.getMessageContent());
      result.put("testDataSpecification", obj.getTestDataSpecification());
      result.put("testStory", obj.getTestStory());
      result.put("testPackage", obj.getTestPackage());
    }
    return result;
  }


  @RequestMapping(value = "/{testId}/jurordocument", method = RequestMethod.GET)
  public TestArtifact tcJurordocument(@RequestParam("type") String type,
      @PathVariable final Long testId) {
    logger.info("Fetching juror document of testcase/teststep with id=" + testId);
    if ("TestCase".equalsIgnoreCase(type)) {
      return testCaseRepository.jurorDocument(testId);
    } else if ("TestStep".equalsIgnoreCase(type)) {
      return testStepRepository.jurorDocument(testId);
    }
    return null;
  }

  @RequestMapping(value = "/{testId}/messagecontent", method = RequestMethod.GET)
  public TestArtifact tcMessageContent(@RequestParam("type") String type,
      @PathVariable final Long testId) {
    logger.info("Fetching messagecontent of testcase/teststep with id=" + testId);
    if ("TestCase".equalsIgnoreCase(type)) {
      return testCaseRepository.messageContent(testId);
    } else if ("TestStep".equalsIgnoreCase(type)) {
      return testStepRepository.messageContent(testId);
    }
    return null;
  }

  @RequestMapping(value = "/{testId}/teststory", method = RequestMethod.GET)
  public TestArtifact tcTestStory(@RequestParam("type") String type, @PathVariable final Long testId) {
    logger.info("Fetching teststory of testcase/teststep with id=" + testId);
    if ("TestCase".equalsIgnoreCase(type)) {
      return testCaseRepository.testStory(testId);
    } else if ("TestStep".equalsIgnoreCase(type)) {
      return testStepRepository.testStory(testId);
    }
    return null;
  }

  @RequestMapping(value = "/{testId}/tds", method = RequestMethod.GET)
  public TestArtifact tcTestDataSpecification(@RequestParam("type") String type,
      @PathVariable final Long testId) {
    logger.info("Fetching testDataSpecification of testcase/teststep with id=" + testId);
    if ("TestCase".equalsIgnoreCase(type)) {
      return testCaseRepository.testDataSpecification(testId);
    } else if ("TestStep".equalsIgnoreCase(type)) {
      return testStepRepository.testDataSpecification(testId);
    }
    return null;
  }

  @RequestMapping(value = "/{testId}/testpackage", method = RequestMethod.GET)
  public TestArtifact tcTestPackage(@RequestParam("type") String type,
      @PathVariable final Long testId) {
    logger.info("Fetching testDataSpecification of testcase/teststep with id=" + testId);
    if ("TestCase".equalsIgnoreCase(type)) {
      return testCaseRepository.testPackage(testId);
    } else if ("TestStep".equalsIgnoreCase(type)) {
      return testStepRepository.testPackage(testId);
    }
    return null;
  }


}
