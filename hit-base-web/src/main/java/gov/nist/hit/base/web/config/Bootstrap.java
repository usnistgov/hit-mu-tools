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

import gov.nist.hit.core.service.ResourcebundleLoader;

import java.io.IOException;

import javax.annotation.PostConstruct;
import javax.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Bootstrap {

  static final Logger logger = LoggerFactory.getLogger(Bootstrap.class);

  @Autowired
  ResourcebundleLoader resourcebundleLoader;

  @Transactional()
  @PostConstruct
  public void init() throws Exception {
    try {
      logger.info("Bootstrapping data...");
      resourcebundleLoader.appInfo();
      resourcebundleLoader.constraints();
      resourcebundleLoader.vocabularyLibraries();
      resourcebundleLoader.integrationProfiles();
//      resourcebundleLoader.cf();
      resourcebundleLoader.cb();
      logger.info("...Bootstrapping completed");
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  public Bootstrap() {}



}
