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

package gov.nist.hit.base.web;

import gov.nist.hit.core.domain.AppInfo;
import gov.nist.hit.core.repo.AppInfoRepository;
import gov.nist.hit.core.service.ResourcebundleLoader;
import gov.nist.hit.core.service.util.FileUtil;
import gov.nist.hit.core.service.util.ResourcebundleHelper;

import java.io.IOException;
import java.util.Date;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.transaction.annotation.Transactional;

public class Bootstrap implements InitializingBean {

  static final Logger logger = LoggerFactory.getLogger(Bootstrap.class);

  @Autowired
  AppInfoRepository appInfoRepository;

  @Autowired
  @Override
  @Transactional()
  public void afterPropertiesSet() throws Exception {
    System.setProperty("javax.xml.parsers.SAXParserFactory",
        "com.sun.org.apache.xerces.internal.jaxp.SAXParserFactoryImpl");
    logger.info("Bootstrapping data...");
    loadAppInfo();
    logger.info("...Bootstrapping completed");
  }


  private void loadAppInfo() throws JsonProcessingException, IOException {
    logger.info("loading app info...");
    Resource resource =
        ResourcebundleHelper.getResource(ResourcebundleLoader.ABOUT_PATTERN + "MetaData.json");
    if (resource == null)
      throw new RuntimeException("No MetaData.json found in the resource bundle");
    AppInfo appInfo = new AppInfo();
    ObjectMapper mapper = new ObjectMapper();
    JsonNode appInfoJson = mapper.readTree(FileUtil.getContent(resource));
    appInfo.setAdminEmail(appInfoJson.get("adminEmail").getTextValue());
    appInfo.setDomain(appInfoJson.get("domain").getTextValue());
    appInfo.setHeader(appInfoJson.get("header").getTextValue());
    appInfo.setHomeContent(appInfoJson.get("homeContent").getTextValue());
    appInfo.setHomeTitle(appInfoJson.get("homeTitle").getTextValue());
    appInfo.setName(appInfoJson.get("name").getTextValue());
    appInfo.setVersion(appInfoJson.get("version").getTextValue());

    java.text.SimpleDateFormat dateFormat = new java.text.SimpleDateFormat("MM/dd/yyyy HH:mm:ss");
    Date date = new Date();
    appInfo.setDate(dateFormat.format(date));
    appInfoRepository.save(appInfo);
    logger.info("loading app info...DONE");
  }

}
