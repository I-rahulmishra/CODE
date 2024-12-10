import React, { useState, useEffect } from "react";
import "./close.scss";
import PopupModel from "../popup-model/popup-model";
import { useDispatch, useSelector } from "react-redux";
import {KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import { getUrl } from "../../../utils/common/change.utils";
import { submitRequest } from "../../../modules/dashboard/fields/fields.utils";
import trackEvents from "../../../services/track-events";
import { redirectingToIbanking } from "../../../services/common-service";
import closeInfo from "../../../assets/_json/close.json";

const Close = (props:KeyWithAnyModel) => {
  const [displayPopup, setdisplayPopup] = useState(false);
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const stageSelectorThankYou = useSelector((state: StoreModel) => state.stages.stages);

  const lovSelector = useSelector((state: StoreModel) => state.lov);
  const userExitDetails = { emailId: null, mobile: null, appRef: null };
  const [userDetails, setUserDetails] = useState(userExitDetails);
  const dispatch = useDispatch();
  const applicantsSelector = useSelector(
    (state: StoreModel) => state.stages.userInput.applicants
  );
  const valueSelector = useSelector((state: StoreModel) => state.valueUpdate);
  const applicationJourney = useSelector(
    (state: StoreModel) => state.stages.journeyType
  );
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const errorSelector = useSelector((state: StoreModel) => state.error);
  const bancaSelector = useSelector(
    (state: StoreModel) => state.bancaList.bancaDetails
  );

  useEffect(() => {
    if (stageSelector && stageSelector.length > 0 ) {
      if (stageSelector[0].stageInfo.applicants.email_a_1 !== null) {
        setUserDetails((preuserDetails: any) => {
          return {
            ...preuserDetails,
            emailId: stageSelector[0].stageInfo.applicants.email_a_1,
            mobile: stageSelector[0].stageInfo.applicants.mobile_number_a_1,
          };
        });
      }
      if (
        stageSelector[0].stageInfo.application.application_reference !== null
      ) {
        setUserDetails((preuserDetails: any) => {
          return {
            ...preuserDetails,
            appRef: getUrl.getChannelRefNo().applicationRefNo! || stageSelector[0].stageInfo.application.application_reference,
          };
        });
      }
    }
  }, [stageSelector]);

  const logout = () => {
    setdisplayPopup(true);
    trackEvents.triggerAdobeEvent("ctaClick", "Close:formAbandonment");
    trackEvents.triggerAdobeEvent("popupViewed", closeInfo.closeParameters.exitAppText);
  };

  const withoutSaveAndExit = () => {
    trackEvents.triggerAdobeEvent("formAbandonment", "Exit");
    if (
      stageSelector && 
      stageSelector.length > 0  &&
     (stageSelector[0].stageInfo.applicants["auth_mode_a_1"] === "IX" || stageSelector[0].stageInfo.applicants["auth_mode_a_1"] === "IM")
    ) {
      if (getUrl.getParameterByName("source") === "scm") {
        //Ibanking redirection for app
        const redirectUrl = getUrl.getParameterByName('transfer-token') ? `${process.env.REACT_APP_IBANKING_SC_MOBILE_TRANSFER}` : `${process.env.REACT_APP_IBANKING_SC_MOBILE}`;
        window.location.href = redirectUrl;
      }  else if(getUrl.getUpdatedStage().ccplChannel=== "MBNK") {
        const redirectUrl =  `${process.env.REACT_APP_IBANKING_SC_MOBILE_TRANSFER}`;
        window.location.href = redirectUrl;
      } else {
        redirectingToIbanking();
      }
    } else {
      window.location.href = `${process.env.REACT_APP_HOME_PAGE_URL}`;
    }
  };

  const withSaveAndExit = async () => {
    const isPreserveCall = true;
    const otpAuth = false;
    const isExit = true
    dispatch(
      await submitRequest(
        applicantsSelector,
        stageSelector[0],
        stageSelectorThankYou,
         valueSelector,
        applicationJourney,
        userInputSelector,
        lovSelector,
        errorSelector,
        otpAuth,
        isPreserveCall,
        isExit,
        bancaSelector
      )
    ).then((response:any)=>{
      if(response){
        if (
          stageSelector &&
          (stageSelector[0].stageInfo.applicants["auth_mode_a_1"] === "IX" || stageSelector[0].stageInfo.applicants["auth_mode_a_1"] === "IM")
        ) {
          if (getUrl.getParameterByName("source") === "scm") {
            //Ibanking redirection for app
            window.location.href = `${process.env.REACT_APP_IBANKING_SC_MOBILE}`;
          } else if(getUrl.getUpdatedStage().ccplChannel=== "MBNK") {
            const redirectUrl =  `${process.env.REACT_APP_IBANKING_SC_MOBILE_TRANSFER}`;
            window.location.href = redirectUrl;
          } else {
            redirectingToIbanking();
          }
        } else {
          window.location.href = `${process.env.REACT_APP_RESUME_URL}`;
        }
      }
    })
    
  };

  const closePopup = (e: React.MouseEvent<HTMLElement>) => {
    trackEvents.triggerAdobeEvent("ctaClick", "Cancel:formAbandonment");
    setdisplayPopup(false);
    e.stopPropagation();
  };

  return (
    <>
      <div className="close" onClick={logout}>
        {props.authType !== 'resume' && displayPopup && (
          <PopupModel displayPopup={displayPopup}>
            <div className="closeModal__container">
              <div className="closeModal__img"></div>
              {(stageSelector[0].stageId === "ssf-1" ||
                stageSelector[0].stageId === "ssf-2") && (
                <div className="closeModal__content">
                  <div className="closeModal__header">
                    {closeInfo.closeMessage.headText}
                  </div>
                  <div>{closeInfo.closeWithoutSave.exitAppText}</div>
                </div>
              )}
              {stageSelector[0].stageId !== "ssf-1" &&
                stageSelector[0].stageId !== "ssf-2" && (
                  <div className="closeModal__content">
                    <div>{closeInfo.closeParameters.exitAppText}</div>
                    <div>
                      {closeInfo.closeMessage.completLaterText}{" "}
                      {closeInfo.closeMessage.linkText} {closeInfo.closeParameters.tobeComplete}
                    </div>
                    <div className="user__details">
                      {userDetails.emailId !== null ? (
                        <p>
                          Email: <span>{userDetails.emailId}</span>
                        </p>
                      ) : (
                        ""
                      )}
                      {userDetails.mobile !== null ? (
                        <p>
                          Mobile: <span>+{userDetails.mobile}</span>
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                    {userDetails.appRef !== null &&
                    userDetails.appRef !== "" ? (
                      <div className="app__ref">
                        Ref No: {userDetails.appRef}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                )}
              <div className="closeModal__footer">
                {(stageSelector[0].stageId === "ssf-1" ||
                  stageSelector[0].stageId === "ssf-2") && (
                  <button
                    className="withoutSavenExit__btn"
                    onClick={withoutSaveAndExit}
                  >
                    Yes
                  </button>
                )}
                {stageSelector[0].stageId !== "ssf-1" &&
                  stageSelector[0].stageId !== "ssf-2" && (
                    <button
                      className="withoutSavenExit__btn"
                      onClick={withSaveAndExit}
                    >
                      Exit
                    </button>
                  )}
                <button
                  className="withSavenExit__btn"
                  onClick={(e) => closePopup(e)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </PopupModel>
        )}
        {props.authType === 'resume' && displayPopup && (
          <PopupModel displayPopup={displayPopup}>
          <div className="closeModal__container">
            <div className="closeModal__img"></div>
              <div className="closeModal__content">
                <div className="closeModal__header">
                  {closeInfo.closeMessage.headText}
                </div>
              </div>
            <div className="closeModal__footer">
                <button
                  className="withoutSavenExit__btn"
                  onClick={withoutSaveAndExit}
                >
                  OK
                </button>
              
              <button
                className="withSavenExit__btn"
                onClick={(e) => closePopup(e)}
              >
                Cancel
              </button>
            </div>
          </div>
        </PopupModel>
        )}
      </div>
    </>
  );
};

export default Close;



import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import Close from "./Close";
import trackEvents from "../../../services/track-events";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../../services/track-events", () => ({
  triggerAdobeEvent: jest.fn(),
}));

jest.mock("../../../utils/common/change.utils", () => ({
  getUrl: {
    getChannelRefNo: jest.fn(() => ({ applicationRefNo: "APP123" })),
    getParameterByName: jest.fn(),
    getUpdatedStage: jest.fn(() => ({ ccplChannel: "MBNK" })),
  },
}));

describe("Close Component", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn.toString().includes("state.stages.stages")) {
        return [
          {
            stageInfo: {
              applicants: {
                email_a_1: "test@example.com",
                mobile_number_a_1: "1234567890",
                auth_mode_a_1: "IX",
              },
              application: { application_reference: "APP123" },
            },
            stageId: "ssf-1",
          },
        ];
      }
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the close button", () => {
  render(<Close authType="default" />);
  const closeButton = screen.getByRole("button", { name: /close/i });
  expect(closeButton).toBeInTheDocument();
});

         it("should trigger logout action and display the popup", () => {
  render(<Close authType="default" />);
  const closeButton = screen.getByRole("button", { name: /close/i });
  fireEvent.click(closeButton);

  expect(trackEvents.triggerAdobeEvent).toHaveBeenCalledWith(
    "ctaClick",
    "Close:formAbandonment"
  );

  const popup = screen.getByText(/exit app/i);
  expect(popup).toBeInTheDocument();
});



         it("should trigger 'withoutSaveAndExit' logic correctly", () => {
  render(<Close authType="default" />);
  fireEvent.click(screen.getByRole("button", { name: /close/i }));

  const withoutSaveButton = screen.getByRole("button", { name: /yes/i });
  fireEvent.click(withoutSaveButton);

  expect(trackEvents.triggerAdobeEvent).toHaveBeenCalledWith(
    "formAbandonment",
    "Exit"
  );
});


         it("should dispatch 'withSaveAndExit' logic on button click", async () => {
  const mockSubmitRequest = jest.fn().mockResolvedValue(true);
  jest.mock("../../../modules/dashboard/fields/fields.utils", () => ({
    submitRequest: mockSubmitRequest,
  }));

  render(<Close authType="default" />);
  fireEvent.click(screen.getByRole("button", { name: /close/i }));

  const withSaveButton = screen.getByRole("button", { name: /exit/i });
  fireEvent.click(withSaveButton);

  expect(mockDispatch).toHaveBeenCalled();
  expect(mockSubmitRequest).toHaveBeenCalled();
});

it("should close the popup on cancel button click", () => {
  render(<Close authType="default" />);
  fireEvent.click(screen.getByRole("button", { name: /close/i }));

  const cancelButton = screen.getByRole("button", { name: /cancel/i });
  fireEvent.click(cancelButton);

  expect(trackEvents.triggerAdobeEvent).toHaveBeenCalledWith(
    "ctaClick",
    "Cancel:formAbandonment"
  );

  expect(screen.queryByText(/exit app/i)).not.toBeInTheDocument();
});


         it("should display user details when available", () => {
  render(<Close authType="default" />);
  fireEvent.click(screen.getByRole("button", { name: /close/i }));

  const email = screen.getByText(/email: test@example.com/i);
  const mobile = screen.getByText(/mobile: \+1234567890/i);
  const appRef = screen.getByText(/ref no: APP123/i);

  expect(email).toBeInTheDocument();
  expect(mobile).toBeInTheDocument();
  expect(appRef).toBeInTheDocument();
});




import { authenticateType } from "./change.utils";

export const getTotalStep = (flowType: any) => {
  return {
    STAGE_NAMES: {
      SSF_1: "ssf-1",
      SSF_2: "ssf-2",
      LD_1: "ld-1",
      BD_1: "bd-1",
      BD_2: "bd-2",
      BD_3: "bd-3",
      DOC: "doc",
      AD_1: "ad-1",
      AD_2: "ad-2",
      ACD: "ACD",
      ACD_2: "acd-2",
      RP: "rp",
      FFD_1: "ffd-1",
    },
    STATE_URLS: {
      SUPER_SHORT_FORM: "sg/super-short-form",
      MYINFO_DETAILS: "sg/myinfo-details",
      PERSONAL_DETAILS: "sg/personal-details",
      EMPLOYMENT: "sg/employment",
      DOCUMENTS: "sg/documents",
      CREDIT_CARD_DETAILS: "sg/credit-card-details",
      REVIEW: "sg/review",
      TAX_DETAILS: "sg/tax-details",
      ADDITIONAL_DATA: "sg/additional-data",
      OFFER: "sg/offer",
      LOAN_DETAILS: "sg/loan-details",
      LOAN_CALCULATOR:"sg/loan-calculator",
      CREDIT_LIMIT: "sg/credit-limit",
      THANKYOU: "sg/thankyou",
    },
    ETC_CASA: {
      totalStages: flowType === "ibnk" ? "4" : "5",
      startCount: flowType === "ibnk" ? "1" : "2",
      "ssf-1": {
        step: "1",
        path: "super-short-form",
        name: "Basic Information",
      },
      "ssf-2": {
        step: "2",
        path: "super-short-form",
        name: "MyInfo Details",
      },
      "bd-1": {
        step: "1",
        path: "super-short-form",
        name: "Basic Information",
      },
      "doc": {
        step: null,
        path: "document",
        name: "Document",
      },
      "ad-1": {
        step: null,
        path: "tax-details",
        name: "Tax Details",
      },
      "ad-2": {
        step: null,
        path: "product-details",
        name: "Product Details",
      },
      rp: {
        step: null,
        path: "rp",
        name: "Terms and Conditions",
      },
      'ffd-1': {
        step: null,
        path: "thankyou",
        name: "Thank You",
      }
    },
    NON_ETC_CASA: {
      totalStages: "6",
      startCount: flowType === "ibnk" ? "1" : "2",
      "ssf-1": {
        step: "1",
        path: "super-short-form",
        name: "Basic Information",
      },
      "ssf-2": {
        step: "2",
        path: "super-short-form",
        name: "MyInfo Details",
      },
      "bd-1": {
        step: "1",
        path: "super-short-form",
        name: "Basic Information",
      },
      "bd-3": {
        step: null,
        path: "employment",
        name: "Employment Details",
      },
      doc: {
        step: null,
        path: "document",
        name: "Document",
      },
      "ad-1": {
        step: null,
        path: "tax-details",
        name: "Tax Details",
      },
      "ad-2": {
        step: null,
        path: "product-details",
        name: "Product Details",
      },
      rp: {
        step: null,
        path: "rp",
        name: "Terms and Conditions",
      },
      'ffd-1': {
        step: null,
        path: "thankyou",
        name: "Thank You",
      }
    },
    ETC_CC: {
      totalStages: flowType === "ibnk" ? "4" : "5",
      startCount: flowType === "ibnk" ? "1" : "2",
      "ssf-1": {
        step: "1",
        path: "super-short-form",
        name: "Basic Information",
      },
      "ssf-2": {
        step: "2",
        path: "super-short-form",
        name: "MyInfo Details",
      },
      "ld-1": {
        step: null,
        path: "loan-calculator",
        name: "Loan Calculator"
      },
      "bd-1": {
        step: "1",
        path: "super-short-form",
        name: "Basic Information",
      },
      "bd-3": {
        step: null,
        path: "employment",
        name: "Employment Details",
      },
      doc: {
        step: null,
        path: "document",
        name: "Document",
      },
      "ad-2": {
        step: null,
        path: "credit-card-details",
        name: "Credit Card Details",
      },
      "ACD": {
        step: null,
        path: "trust-credit-limit-porting",
        name: "Trust Credit Limit Porting",
      },
      rp: {
        step: null,
        path: "rp",
        name: "Terms and Conditions",
      },
      'ffd-1': {
        step: null,
        path: "thankyou",
        name: "Thank You",
      }
    },
    NON_ETC_CC: {
      totalStages: flowType === "manual" ? "5" : "5",
      startCount: flowType === "manual" ? "1" : "2",
      "ssf-1": {
        step: "1",
        path: "super-short-form",
        name: "Basic Information",
      },
      "ssf-2": {
        step: "2",
        path: "super-short-form",
        name: "MyInfo Details",
      },
      "bd-2": {
        step: null,
        path: "personal-details",
        name: "Personal Details",
      },
      "ld-1": {
        step: null,
        path: "loan-calculator",
        name: "Loan Calculator"
      },
      "bd-1": {
        step: '1',
        path: "super-short-form",
        name: "Basic Information",
      },
      "bd-3": {
        step: null,
        path: "employment",
        name: "Employment Details",
      },
      doc: {
        step: null,
        path: "document",
        name: "Document",
      },
      "ad-2": {
        step: null,
        path: "credit-card-details",
        name: "Credit Card Details",
      },
      "ACD": {
        step: null,
        path: "trust-credit-limit-porting",
        name: "Trust Credit Limit Porting",
      },
      rp: {
        step: null,
        path: "rp",
        name: "Terms and Conditions",
      },
      'ffd-1': {
        step: null,
        path: "thankyou",
        name: "Thank You",
      }
    },
    DEFAULT_EDITABLE: ['name_of_employer', 'annual_income', 'email', 'mobile_number', 'marital_status']
  }
};

export const resumeHeaderText :any = {
  HEADER_TEXT: {
    resume: "Resume Application",
    resumeSubHeader: "Thank you for choosing Standard Chartered Bank.",
  }
}

export const BANCAINFO :any = {
  DEFAULT_BANCA_VALUE: ['banca_benefit_amount1_a_1','banca_premium_amount_a_1','banca_product_code_a_1','banca_product_applicable_a_1']
}

export const DEFAULT_NONEDITABLE :any = {
   NONEDITABLE: ['residential_address',"annual_income_fff_1","year_of_assessment_fff_1"]

}
export const getStageCounts = () =>{
  const flowType = authenticateType();
  return getTotalStep(flowType);
}
 
export const CONSTANTS:any = getStageCounts();
 



 src/shared/components/close/close.test.tsx
  ● Test suite failed to run

    TypeError: (0 , _change.authenticateType) is not a function

      260 | }
      261 | export const getStageCounts = () =>{
    > 262 |   const flowType = authenticateType();
          |                                    ^
      263 |   return getTotalStep(flowType);
      264 | }
      265 |

      at getStageCounts (src/utils/common/constants.ts:262:36)
      at Object.getStageCounts (src/utils/common/constants.ts:266:30)
      at Object.require (src/modules/dashboard/fields/stage.utils.ts:1:1)
      at Object.require (src/services/common-service.ts:2:1)
      at Object.require (src/modules/dashboard/fields/fields.utils.ts:1:1)
      at Object.require (src/shared/components/close/close.tsx:7:1)
      at Object.require (src/shared/components/close/close.test.tsx:4:1)
      at TestScheduler.scheduleTests (node_modules/react-scripts/node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/react-scripts/node_modules/@jest/core/build/runJest.js:404:19)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        1.553 s
Ran all test suites matching /close/i.

Watch Usage: Press w to show more.
