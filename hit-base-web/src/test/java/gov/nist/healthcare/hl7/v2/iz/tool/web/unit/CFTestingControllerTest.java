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
package gov.nist.healthcare.hl7.v2.iz.tool.web.unit;

import gov.nist.hit.base.web.controller.CFTestingController;
import gov.nist.hit.core.repo.IntegrationProfileRepository;
import gov.nist.hit.core.repo.TestContextRepository;
import gov.nist.hit.core.repo.TestObjectRepository;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Rule;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

/**
 * @author Harold Affo
 * 
 */
@RunWith(SpringJUnit4ClassRunner.class)
@Ignore
public class CFTestingControllerTest {


  @Mock
  TestObjectRepository testObjectRepository;

  @Mock
  IntegrationProfileRepository integrationProfileRepository;

  @Mock
  TestContextRepository testContextRepository;


  @InjectMocks
  CFTestingController controller;

  MockMvc mockMvc;

  @Rule
  public ExpectedException thrown = ExpectedException.none();

  @Before
  public void setup() {
    MockitoAnnotations.initMocks(this);
    controller.setTestObjectRepository(testObjectRepository);
    mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
  }

  // @Test
  // public void testGetTestCases() throws Exception {
  // List<TestObject> testCases = getTestCases();
  // when(testObjectRepository.findAll()).thenReturn(testCases);
  // MvcResult mvcResult =
  // mockMvc.perform(get("/cf/testcases")).andExpect(request().asyncStarted()).andReturn();
  //
  // this.mockMvc.perform(asyncDispatch(mvcResult)).andExpect(status().isOk());
  //
  // verify(testContextRepository, times(1)).findAllTestCases();
  // verifyNoMoreInteractions(testContextRepository);
  // }
  //
  // /**
  // * Get a test case by its id. Return the testcase
  // *
  // * @throws Exception
  // */
  // @Test
  // public void testGetTestCaseById() throws Exception {
  // SoapTestCase testCase = create();
  // when(mockRepository.findOne(testCase.getId())).thenReturn(testCase);
  //
  // MvcResult mvcResult =
  // mockMvc.perform(get("/cf/testCases/" + testCase.getId()))
  // .andExpect(request().asyncStarted()).andReturn();
  //
  // this.mockMvc.perform(asyncDispatch(mvcResult)).andExpect(status().isOk())
  // .andExpect(jsonPath("$.label").value(testCase.getName()));
  //
  // // mockMvc.perform(
  // // get("/cf/testCases/" + testCase.getId()).accept(
  // // )).andDo(print())
  // // .andExpect(status().isOk())
  // // .andExpect(jsonPath("$.label").value(testCase.getName()));
  // verify(mockRepository, times(1)).findOne(testCase.getId());
  // verifyNoMoreInteractions(mockRepository);
  // }
  //
  // // /**
  // // * Get a test case with an invalid id
  // // *
  // // * @throws Exception
  // // */
  // // @Test
  // // public void testGetInvalidCFTestCaseById() throws Exception {
  // // when(mockRepository.findOne(new Long(2000))).thenReturn(null);
  // //
  // // MvcResult mvcResult = mockMvc
  // // .perform(
  // // get("/cf/testCases/2000").contentType(
  // // ))
  // // .andExpect(request().asyncStarted()).andReturn();
  // //
  // // this.mockMvc.perform(asyncDispatch(mvcResult)).andExpect(
  // // status().isNotFound());
  // // //
  // // // mockMvc.perform(get("/cf/testCases/2000")).andExpect(
  // // // status().isNotFound());
  // // verify(mockRepository, times(1)).findOne(new Long(2000));
  // // verifyNoMoreInteractions(mockRepository);
  // // }
  //
  // @Test
  // public void testParse() throws Exception {
  // SoapTestCase testCase = create();
  // Long testCaseId = testCase.getId();
  // when(testContextRepository.getProfileXmlByTestCaseId(testCaseId)).thenReturn(
  // ((ContextFreeTestContext) testCase.getTestContext()).getProfile().getXml());
  //
  // MessageCommand command = new MessageCommand();
  // ObjectMapper objectMapper = new ObjectMapper();
  //
  // // valid request object
  // command.setEr7Message(getMessage().getContent());
  // String jsonText = objectMapper.writeValueAsString(command);
  //
  // // mockMvc.perform(
  // // post("/cf/testCases/" + testCaseId + "/message/model")
  // // .content(
  // // jsonText)).andExpect(status().isOk())
  // // ;
  //
  // MvcResult mvcResult =
  // mockMvc.perform(post("/cf/testCases/" + testCaseId + "/message/parse").content(jsonText))
  // .andExpect(request().asyncStarted()).andReturn();
  //
  // this.mockMvc.perform(asyncDispatch(mvcResult)).andExpect(status().isOk());
  //
  // // invalid request object: testCaseId missing
  // command = new MessageCommand();
  // command.setTestCaseId(testCaseId);
  // jsonText = objectMapper.writeValueAsString(command);
  //
  // // // mockMvc.perform(
  // // // post("/cf/testCases/" + testCaseId + "/message/model")
  // // // .content(
  // // // jsonText)).andExpect(status().isNotFound())
  // // // ;
  // //
  // // mvcResult = mockMvc
  // // .perform(
  // // post("/cf/testCases/" + testCaseId + "/message/parse")
  // // .content(jsonText).contentType(
  // // ))
  // // .andExpect(request().asyncStarted()).andReturn();
  // //
  // // this.mockMvc.perform(asyncDispatch(mvcResult))
  // //
  // // .andExpect(status().isNotFound());
  //
  // // invalid request object: testCaseId missing
  // command = new MessageCommand();
  // command.setEr7Message(getMessage().getContent());
  // jsonText = objectMapper.writeValueAsString(command);
  //
  // mockMvc.perform(post("/cf/testCases/message/parse").content(jsonText)).andExpect(
  // status().isNotFound());
  // //
  // when(testContextRepository.getProfileXmlByTestCaseId(testCaseId)).thenReturn(null);
  //
  // command = new MessageCommand();
  // jsonText = objectMapper.writeValueAsString(command);
  //
  // mvcResult =
  // mockMvc.perform(post("/cf/testCases/" + testCaseId + "/message/parse").content(jsonText))
  // .andExpect(request().asyncStarted()).andReturn();
  //
  // this.mockMvc.perform(asyncDispatch(mvcResult)).andExpect(status().isBadRequest());
  // //
  // // verify(mockProfileRepository, times(2)).findContentByCFTestCaseId(
  // // testCaseId);
  // // verifyNoMoreInteractions(mockProfileRepository);
  // }

  // private TestObject create() throws IOException {
  // TestObject tc = new TestObject();
  // tc.setId(new Random().nextLong());
  // tc.setName("IZ-TC-1");
  // TestContext testContext = new TestContext();
  // tc.setTestContext(testContext);
  // testContext.setProfile(getProfile());
  // testContext.setConstraints(getConstraints());
  // return tc;
  // }
  //
  // private List<TestObject> getTestCases() throws IOException {
  // List<TestObject> res = new ArrayList<TestObject>();
  // for (int i = 0; i < 3; i++) {
  // res.add(create());
  // }
  // return res;
  // }
  //
  // public Message getMessage() throws IOException {
  // Message message = new Message();
  // message.setId(new Random().nextLong());
  // message.setName("IZ-TC-" + new Random().nextInt());
  // message.setContent(IOUtils.toString(CFTestingControllerTest.class
  // .getResourceAsStream("/messages/ELR.txt")));
  // return message;
  // }
  //
  // public IntegrationProfile getProfile() throws IOException {
  // IntegrationProfile integrationProfile = new IntegrationProfile();
  // integrationProfile.setId(new Random().nextLong());
  // integrationProfile.setName("New Validation IntegrationProfile");
  // integrationProfile.setXml(IOUtils.toString(CFTestingControllerTest.class
  // .getResourceAsStream("/profiles/IntegrationProfile.xml")));
  // return integrationProfile;
  // }
  //
  // public Constraints getConstraints() throws IOException {
  // return new Constraints(IOUtils.toString(CFTestingControllerTest.class
  // .getResourceAsStream("/profiles/Constraints.xml")));
  // }

}
