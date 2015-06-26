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

import gov.nist.hit.core.domain.TestPlan;
import gov.nist.hit.core.repo.TestPlanRepository;
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
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Harold Affo (NIST)
 * 
 */

@RestController
@RequestMapping("/testplans")
public class TestPlanController extends ExceptionHandlingController {

  static final Logger logger = LoggerFactory.getLogger(TestPlanController.class);

  @Autowired
  protected TestPlanRepository testPlanRepository;

  @RequestMapping(value = "/{testPlanId}/downloadTestProcedure", method = RequestMethod.POST)
  public String testProcedure(@PathVariable Long testPlanId, HttpServletRequest request,
      HttpServletResponse response) throws MessageException {
    try {
      TestPlan testPlan = testPlanRepository.findOne(testPlanId);
      if (testPlan == null) {
        throw new IllegalArgumentException("The test plan cannot be retrieved");
      }
      String path = testPlan.getTestProcedure().getPdfPath();
      if (path == null) {
        throw new IllegalArgumentException("No test procedure found");
      }
      InputStream content = TestPlanController.class.getResourceAsStream(path);
      response
          .setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      response.setHeader("Content-disposition", "attachment;filename=" + "TestProcedure-"
          + testPlan.getName() + ".docx");
      FileCopyUtils.copy(content, response.getOutputStream());
    } catch (IOException e) {
      logger.debug("Failed to download the test procedure ");
      throw new TestCaseException("Cannot download the procedure " + e.getMessage());
    }
    return null;
  }

}
