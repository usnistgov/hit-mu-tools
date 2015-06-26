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

package gov.nist.hit.base.web.util;

import gov.nist.hit.core.domain.Command;
import gov.nist.hit.core.domain.Profile;
import gov.nist.hit.core.service.exception.MessageContentNotFoundException;
import gov.nist.hit.core.service.exception.ProfileException;

/**
 * @author Harold Affo (NIST)
 * 
 */
public class Util {

  public static String getContent(Profile profile) throws ProfileException {
    if (profile == null || "".equals(profile.getXml())) {
      throw new ProfileException("No profile found in the request");
    }
    return profile.getXml();
  }

  public static String getContent(Command request) {
    if (request == null || "".equals(request.getContent())) {
      throw new MessageContentNotFoundException("No content found in the request");
    }
    return request.getContent();
  }

}
