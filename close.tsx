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
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Close from "./Close";
import closeInfo from "../../../assets/_json/close.json";

const mockStore = configureStore([]);

describe("Close Component", () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: [
          {
            stageInfo: {
              applicants: {
                email_a_1: "test@example.com",
                mobile_number_a_1: "1234567890",
                auth_mode_a_1: "IX",
              },
              application: { application_reference: "12345" },
            },
            stageId: "ssf-1",
          },
        ],
        userInput: { applicants: {} },
        journeyType: "testJourney",
      },
      lov: {},
      valueUpdate: {},
      error: {},
      bancaList: { bancaDetails: {} },
    });
  });

  test("should render Close component", () => {
    render(
      <Provider store={store}>
        <Close authType="non-resume" />
      </Provider>
    );

    expect(screen.getByText(closeInfo.closeMessage.headText)).toBeInTheDocument();
  });

  test("should display popup when clicked", () => {
    render(
      <Provider store={store}>
        <Close authType="non-resume" />
      </Provider>
    );

    const closeButton = screen.getByText(closeInfo.closeMessage.headText);
    fireEvent.click(closeButton);

    expect(screen.getByText(closeInfo.closeParameters.exitAppText)).toBeInTheDocument();
  });

  test("should handle Without Save and Exit", () => {
    render(
      <Provider store={store}>
        <Close authType="non-resume" />
      </Provider>
    );

    fireEvent.click(screen.getByText(closeInfo.closeMessage.headText));

    const yesButton = screen.getByText("Yes");
    fireEvent.click(yesButton);

    expect(window.location.href).toContain(process.env.REACT_APP_HOME_PAGE_URL);
  });

  test("should handle With Save and Exit", async () => {
    render(
      <Provider store={store}>
        <Close authType="non-resume" />
      </Provider>
    );

    fireEvent.click(screen.getByText(closeInfo.closeMessage.headText));

    const exitButton = screen.getByText("Exit");
    fireEvent.click(exitButton);

    // Mock a dispatch and check it's called
    expect(store.getActions()).toHaveLength(1);
  });

  test("should close popup on Cancel", () => {
    render(
      <Provider store={store}>
        <Close authType="non-resume" />
      </Provider>
    );

    fireEvent.click(screen.getByText(closeInfo.closeMessage.headText));

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(screen.queryByText(closeInfo.closeParameters.exitAppText)).not.toBeInTheDocument();
  });

  test("should render resume popup correctly", () => {
    render(
      <Provider store={store}>
        <Close authType="resume" />
      </Provider>
    );

    expect(screen.getByText("OK")).toBeInTheDocument();
  });
});
