import React, { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./fields.scss";
 
import renderComponent from "./renderer";
import {
  getLovMissing,
  stageFields,
  getStagePayload,
  stageSelectFields,
  submitRequest,
  userInputPayload,
} from "./fields.utils";
import Footer from "../footer/footer";
import {
  FieldsetModel,
  KeyStringModel,
  KeyWithAnyModel,
  StoreModel,
  FieldModel,
} from "../../../utils/model/common-model";
import {
  dispatchError,
  ibankEncrypt,
  isFormUpdate,
  lovRequests,
} from "../../../services/common-service";
import { stagesAction } from "../../../utils/store/stages-slice";
import { getStageName, pageScrollTop, stateUrl } from "./stage.utils";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { CONSTANTS } from "../../../utils/common/constants";
import { useNavigate } from "react-router-dom";
import { ValueUpdateAction } from "../../../utils/store/value-update-slice";
import ReviewPage from "../review-page/review-page";
import { FindIndex, getUrl } from "../../../utils/common/change.utils";
 
import {
  assignUpdateUserInput,
  deleteConditionalFieldSelector,
} from "./fields-methods";
import InfoTooltips from "../../../shared/components/info-tooltips/info-tooltips";
import { AxiosError } from "axios";
import { lovDescAction } from "../../../utils/store/lov-desc-slice";
import { errorAction } from "../../../utils/store/error-slice";
import { ContinueBtnAction } from "../../../utils/store/continue-validation-slice";
import trackEvents from "../../../services/track-events";
import { preApprovalAction } from "../../preApproval/store/preApproval-slice";
import { getOffer, getOffer2 } from "../../preApproval/services/preApprovalServices";
import { postAditionalData, postBasicData, postFulFilmentData, postSaveData } from "../../preApproval/services/preApprovalPostServices";
 
import Spinner from "../../../shared/components/spinner/spinner";
import Close from "../../../shared/components/close/close";
import { offerPayload } from "../../preApproval/services/payload";
import { urlParamAction } from "../../../utils/store/urlparam-slice";
import FundDisbursement from "../../preApproval/commonComponents/fundDisbursement/fund-disbursement";
 
const Fields = (props: KeyWithAnyModel) => {
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const lovSelector = useSelector((state: StoreModel) => state.lov);
  const resumeSelector = useSelector(
    (state: StoreModel) => state.urlParam?.resume
  );
  const parentChildToggleSelector = useSelector((state: StoreModel) => state.stages.parentChildFields)
  const employeeToggleSelector = useSelector((state: StoreModel) => state.stages.natureOfEmployeeField)
  const madatoryFieldSelector = useSelector(
    (state: StoreModel) => state.fielderror.mandatoryFields
  );
  const resumeFlag = useSelector(
    (state: StoreModel) => state.stages
  );
  const applicantsSelector = useSelector(
    (state: StoreModel) => state.stages.userInput.applicants[0]
  );
  const conditionalFieldSelector = useSelector(
    (state: StoreModel) => state.stages.conditionalFields
  );
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const currentStageSelector = useSelector(
    (state: StoreModel) => state.stages.currentStage
  );
  const valueSelector = useSelector((state: StoreModel) => state.valueUpdate);
  const applicationJourney = useSelector(
    (state: StoreModel) => state.stages.journeyType
  );
 
  const continueBtnSelector = useSelector((state: StoreModel) => state.continueBtnSlice.continueEnable);
  const currentStage = useSelector((state: StoreModel) => state.preApproval.currentStage);
  const formConfigmetaData = useSelector((state: StoreModel) => state.preApproval.formConfigmetaData);
 
  const dispatch = useDispatch();
  const [fields, setFields] = useState<FieldModel>();
  const [userInputs, setUserInputs] = useState<KeyWithAnyModel>({});
  const [stageId, setStageId] = useState<string>(CONSTANTS.STAGE_NAMES.PD_1);
  let currentStageSection: KeyWithAnyModel = {};
  const [isRequiredValid, setRequiredFormValidation] = useState("form-invalid");
  const [isFormValid, setFormValidation] = useState(true);
  const [checkboxStatus, setCheckboxStatus] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const errorSelector = useSelector((state: StoreModel) => state.error);
  const fieldErrorSelector = useSelector(
    (state: StoreModel) => state.fielderror.error
  );
  const language = getUrl.getLanguageInfo("lang");
  const [backText, setBackText] = useState("Continue");
  const [stage, setStage] = useState(0);
 
  useEffect(() => {
    let updateUserInputs = { ...userInputs };
    if (Object.keys(updateUserInputs).length > 0) {
      dispatch(
        deleteConditionalFieldSelector(
          updateUserInputs,
          conditionalFieldSelector
        )
      ).then((updateUserInputsResponse: any) => {
        updateUserInputs = updateUserInputsResponse;
      });
    }
    if (Object.keys(conditionalFieldSelector.newFields).length > 0) {
      for (let key in conditionalFieldSelector.newFields) {
        updateUserInputs[key] = "";
      }
    }
 
    // if (Object.keys(updateUserInputs).length > 0) {
    let getUsInput = applicantsSelector;
    dispatch(assignUpdateUserInput(getUsInput, updateUserInputs)).then(
      (updateUserInputsResponse: any) => {
        delete updateUserInputs.add_tax_residency;
        setUserInputs(updateUserInputsResponse);
      }
    );
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionalFieldSelector]);
 
  useEffect(() => {
    if (!!currentStageSelector) {
      setStageId(currentStageSelector!);
    }
  }, [currentStageSelector]);
 
  useEffect(() => {
    if (stageSelector[0]) {
      setStageId(stageSelector[0].stageId);
    }
  }, [stageSelector]);
 
  useEffect(() => {
    if (
      stageSelector &&
      stageSelector.length > 0
    ) {
      const stageId = stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.LD_1 ? "ad-11" : stageSelector[0].stageId;
      const stageIndex = FindIndex(stageSelector[0].stageInfo, stageId);
     
      if (stageId === 'bd-5' && (parentChildToggleSelector.selectFields.length > 0)) {
        const resultAdd = (stageSelector[0].stageInfo.fieldMetaData.data.stages[stageIndex].fields).map((res: KeyWithAnyModel) => {
          return {
            ...res,
            default_visibility: (parentChildToggleSelector.addSelectFields.includes(res.logical_field_name)) ? "Yes" : "No"
          }
 
        })
        const resultRemove = resultAdd.map((res: KeyWithAnyModel) => {
          return {
            ...res,
            default_visibility: (parentChildToggleSelector.deleteSelectFields.includes(res.logical_field_name) && res.default_visibility === 'Yes') ? "No" : res.default_visibility
          }
        })
        dispatch(stagesAction.updateAddressFields(resultRemove));
 
        setFields(stageSelectFields(stageSelector, stageId, resultRemove));
      } else {
 
        if (stageSelector[0].stageInfo?.fieldMetaData?.data.stages[stageIndex]) {
          dispatch(stagesAction.updateAddressFields(stageSelector[0].stageInfo.fieldMetaData.data.stages[stageIndex].fields))
 
          setFields(stageFields(stageSelector, stageId));
        }
      }
    }
  }, [stageSelector, stageId, parentChildToggleSelector, employeeToggleSelector]);
 
  let mandatoryFields: Array<string> = [];
  let value: KeyStringModel = {};
 
  useEffect(() => {
 
    if (valueSelector.value !== false) {
 
      const FieldsIgnore = ['client_pl_sc_consent2', 'client_pl_consent4',
        'business_est_date', 'client_pl_sc_consent5', 'client_pl_sc_consent',
        'client_sc_consent_title', 'sc_tips_pl'];
 
      if (fields && fields["fields"] && fields["fields"].length > 0) {
        fields.fields.forEach((res: FieldsetModel) => {
 
          res.fields.forEach((fName: KeyWithAnyModel) => {
 
            if (FieldsIgnore.indexOf(fName.logical_field_name) === -1) {
 
              if (fName.mandatory === "Yes" || fName.mandatory === "Conditional") {
                let logicalFieldVal = stageSelector[0].stageInfo.applicants[0][fName.logical_field_name + '_a_1'];
                if (!logicalFieldVal) {
                  const fullName = stageSelector[0].stageInfo.applicants[0]["full_name_a_1"];
                  if (fullName && fullName.length >= 19) {
                    const firstName = fullName.split(" ")[0];
                    logicalFieldVal = firstName.length >= 19 ? "" : firstName;
                  } else {
                    logicalFieldVal = fullName;
                  }
                }
                let fieldValue = userInputSelector.applicants[0][fName.logical_field_name];
 
                if (stageId === CONSTANTS.STAGE_NAMES.AD_2) {
                  value[fName.logical_field_name] = fieldValue ? fieldValue : "";
                  mandatoryFields.push(fName.logical_field_name);
                }
                else if (stageId === CONSTANTS.STAGE_NAMES.RP) {
                  if (fName.logical_field_name === "acknowledgement_cert") {
                    value[fName.logical_field_name] = fieldValue !== "N" ? fieldValue : ""
                    mandatoryFields.push(fName.logical_field_name);
                  } if (fName.logical_field_name === "client_declaration_cert") {
                    value[fName.logical_field_name] = fieldValue !== "N" ? fieldValue : ""
                    mandatoryFields.push(fName.logical_field_name);
                  }
                }
                else {
                  console.log('----', fName.logical_field_name)
                  value[fName.logical_field_name] = fieldValue ? fieldValue : "";
                  mandatoryFields.push(fName.logical_field_name);
 
                  // value[fName.logical_field_name + '_a_1'] = fieldValue ? fieldValue : "";
                  // mandatoryFields.push(fName.logical_field_name + '_a_1');
                }
 
              }
            }
          });
        });
 
        setUserInputs(value);
 
        dispatch(fieldErrorAction.getMandatoryFields(null));
        dispatch(fieldErrorAction.getMandatoryFields(mandatoryFields));
      }
    }
  }, [fields, dispatch, valueSelector.value, stageSelector]);
 
  useEffect(() => {
    stateUrl(stageId);
    if (stageId !== "ssf-1" && backText === "Continue") {
      trackEvents.triggerAdobeEvent("formStepCompletions");
    } else if (backText === "Back") {
      /* Adobe Analytics - for clicks on a CTA */
      trackEvents.triggerAdobeEvent("ctaClick", "Back");
    }
  }, [stageId, backText]);
 
  useEffect(() => {
    if (errorSelector.submit) {
      dispatch(errorAction.getExceptionList([]));
      submitSuccess();
      dispatch(errorAction.toggleSubmit(false));
    }
  }, [errorSelector.submit])
 
  const submitSuccess = () => {
    dispatch(
      submitRequest(
        applicantsSelector,
        stageSelector[0],
        valueSelector,
        lovSelector,
        applicationJourney,
        userInputSelector,
        errorSelector,
        resumeFlag
      )
    ).then((stage: string) => {
      if (stage === "pd-1") {
        dispatch(stagesAction.setOtpShow(true));
      }
      if (stage === "rp") {
        console.log('submit review here')
      }
      else {
        setStageId(stage);
      }
      pageScrollTop();
    });
    trackEvents.triggerAdobeEvent("ctaClick", "Continue");
    if (stageId === CONSTANTS.STAGE_NAMES.RP) {
      trackEvents.triggerAdobeEvent("formSubmit");
    }
  }
 
 
  const SetNextStageDetaisAfterSave = (Nextstage: string, PreviousStage: string) => {
 
    dispatch(stagesAction.updateStageId(Nextstage));
    setStageId(Nextstage);
    dispatch(lovRequests(stageSelector[0].stageInfo, Nextstage));
    postSaveData().then((res: any) => {
      if (res.status === 200) {
        let responseType = res.data.application.response_type.toUpperCase();
        let responseAction = res.data.application.response_action.toUpperCase();
        if (responseAction === 'SUCCESS' || responseType === 'INFO' || (responseType === 'SOFT' && responseAction === 'CONTINUE')) {
          setShowSpinner(false);
          let stageData = JSON.parse(JSON.stringify(stageSelector[0].stageInfo));
          stageData.application = res.data.application;
          console.log(stageData);
          dispatch(stagesAction.getStage({
            id: Nextstage,
            formConfig: stageData,
          }))
        }
 
        HardStop(responseType, responseAction);
     
      }
    });
  }
 
  const HardStop = (responseType: string, responseAction: string) => {
 
    if ((responseType === 'HARD' && (responseAction === 'STOP' || responseAction === 'RESUBMIT')) ||
      (responseType === 'HARD' && responseAction === 'CORRECT RESUBMIT')) {
      setShowSpinner(false);
      dispatch(stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.RP));
    }
  }
  const handleSubmit = (event: React.FormEvent<EventTarget>): void => {
    setBackText("Continue");
 
    madatoryFieldSelector.forEach((data: string) => {
      if (userInputs[data]) {
        delete userInputs[data];
        delete userInputs["first_name"];
        delete userInputs["marketing_tooltip"];
        delete userInputs["estatement_tooltip"];
      }
    });
 
 
    if ((Object.keys(userInputs).length >= 0)) {
 
      dispatch(userInputPayload(getStagePayload(stageSelector, applicantsSelector), stageSelector));
      dispatch(userInputPayload(userInputSelector.applicants[0], stageSelector));
      dispatch(stagesAction.resetNewAndOldFields());
      setShowSpinner(true);
      if (stageId === CONSTANTS.STAGE_NAMES.PD_1) {
        dispatch(stagesAction.setOtpShow(true));
        if (continueBtnSelector === true) {
          dispatch(stagesAction.setOtpShow(true));
 
        }
      }
      else if (stageId === CONSTANTS.STAGE_NAMES.BD_1A) {
 
        SetNextStageDetaisAfterSave(CONSTANTS.STAGE_NAMES.BD_1, CONSTANTS.STAGE_NAMES.BD_1A);
 
       
      }
      else if (stageId === CONSTANTS.STAGE_NAMES.BD_1) {
 
        SetNextStageDetaisAfterSave(CONSTANTS.STAGE_NAMES.AD_1, CONSTANTS.STAGE_NAMES.BD_1);
 
       
      }
      else if (stageId === CONSTANTS.STAGE_NAMES.AD_1) {
 
        SetNextStageDetaisAfterSave(CONSTANTS.STAGE_NAMES.AD_1A, CONSTANTS.STAGE_NAMES.AD_1);
 
       
      }
      else if (stageId === CONSTANTS.STAGE_NAMES.AD_1A) {
        if (applicantsSelector.work_type === 'S105' || applicantsSelector.work_type === 'S107' || applicantsSelector.work_type === 'S108') {
          dispatch(stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.AD_6));
          setStageId(CONSTANTS.STAGE_NAMES.AD_6);
          dispatch(preApprovalAction.setCurrentStage(CONSTANTS.STAGE_NAMES.AD_6));
          postSaveData().then((res: any) => {
            if (res.status === 200) {
              setShowSpinner(false);
            }
          });
        }
        else {
          dispatch(stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.AD_2));
          setStageId(CONSTANTS.STAGE_NAMES.AD_2);
          dispatch(lovRequests(stageSelector[0].stageInfo, CONSTANTS.STAGE_NAMES.AD_2));
          postSaveData().then((res: any) => {
            if (res.status === 200) {
              setShowSpinner(false);
            }
          });
        }
      }
      else if (stageId === CONSTANTS.STAGE_NAMES.AD_2) {
 
        SetNextStageDetaisAfterSave(CONSTANTS.STAGE_NAMES.AD_3, CONSTANTS.STAGE_NAMES.AD_2);
       
      }
      else if (stageId === CONSTANTS.STAGE_NAMES.AD_3) {
 
        SetNextStageDetaisAfterSave(CONSTANTS.STAGE_NAMES.AD_6, CONSTANTS.STAGE_NAMES.AD_3);
 
     
      }
      else if (stageId === CONSTANTS.STAGE_NAMES.AD_6) {
 
        SetNextStageDetaisAfterSave(CONSTANTS.STAGE_NAMES.RP, CONSTANTS.STAGE_NAMES.AD_6);
 
       
      }
      else if (stageId === CONSTANTS.STAGE_NAMES.RP) {
        dispatch(stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.ACD_1));
        postAditionalData().then(async (res: any) => {
          if (res.status === 200) {
            let responseType = res.data.application.response_type.toUpperCase();
            let responseAction = res.data.application.response_action.toUpperCase();
            if (responseAction === 'SUCCESS' || responseType === 'INFO' || (responseType === 'SOFT' && responseAction === 'CONTINUE')) {
              let stageData = JSON.parse(JSON.stringify(res.data));
              delete stageData.applicants;
              delete stageData.fieldmetadata;
              stageData.fieldMetaData = res.data.fieldmetadata;
              stageData.applicants = [res.data.applicants];
              console.log(stageData);
              dispatch(stagesAction.getStage({
                id: CONSTANTS.STAGE_NAMES.ACD_1,
                formConfig: stageData,
              }))
              dispatch(stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.ACD_1));
              await getOffer(res.data).then(async (offerResponse: any) => {
               
                if (offerResponse.status === 200) {
                  console.log('offer-details', offerResponse)
                  let applicants = offerResponse.data.applicants;
                  let application = offerResponse.data.application;
                  let responseType = offerResponse.data.application.response_type.toUpperCase();
                  let responseAction = offerResponse.data.application.response_action.toUpperCase();
                  if (responseAction === 'SUCCESS' || responseType === 'INFO' || (responseType === 'SOFT' && responseAction === 'CONTINUE')) {
 
                    let formStageData = JSON.parse(JSON.stringify(formConfigmetaData));
                    formStageData.applicants = applicants;
                    dispatch(preApprovalAction.setFormConfigMetaData(formStageData));
                    dispatch(urlParamAction.getAuthorize({ "applicationRefNo": offerResponse.data.application.application_reference }));
                    dispatch(preApprovalAction.setApplicantDouments(offerResponse.data.applicant_documents));
                    dispatch(preApprovalAction.setDedupeApplication(offerResponse.data.application));
                    dispatch(preApprovalAction.setNextStages(offerResponse.data.stage.next_page_values));
 
                    dispatch(stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.ACD_2));
                    let newOfferData = offerResponse.data;
                    await getOffer2(newOfferData).then((offerRes: any) => {
                      if (offerRes.status === 200) {
                        let responseType = offerRes.data.application.response_type.toUpperCase();
                        let responseAction = offerRes.data.application.response_action.toUpperCase();
                        if (responseAction === 'SUCCESS' || responseType === 'INFO' || (responseType === 'SOFT' && responseAction === 'CONTINUE')) {
                          console.log(offerRes)
                          let stageData = Object.assign({}, stageSelector[0].stageInfo);
                          delete stageData.applicants;
                          delete stageData.fieldmetadata;
 
                          stageData.applicant_bureau_details = offerRes.data.applicant_bureau_details;
                          stageData.fieldMetaData = offerRes.data.fieldmetadata;
                          stageData.applicants = [offerRes.data.applicants];
                          stageData.products = offerRes.data.products;
                          stageData.applicant_documents = offerRes.data.applicant_documents;
                          dispatch(
                            stagesAction.getStage({
                              id: CONSTANTS.STAGE_NAMES.ACD_3,
                              formConfig: stageData,
                            })
                          );
                          setShowSpinner(false);
                          dispatch(preApprovalAction.setCurrentStage("LD"));
                          dispatch(stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.ACD_3));
                        }
                   
                        HardStop(responseType, responseAction);
                     
                      }
                    })
                  }
                  HardStop(responseType, responseAction);
             
                }
              });
            }
            HardStop(responseType, responseAction);
           
 
          }
        });
      }
      else if (stageId === CONSTANTS.STAGE_NAMES.LD_1) {
        dispatch(stagesAction.updateStageId(CONSTANTS.STAGE_NAMES.FFD_1));
        setStageId(CONSTANTS.STAGE_NAMES.FFD_1);
        postSaveData().then(async (res: any) => {
          if (res.status === 200) {
           
            let responseType = res.data.application.response_type.toUpperCase();
            let responseAction = res.data.application.response_action.toUpperCase();
            if (responseAction === 'SUCCESS' || responseType === 'INFO' || (responseType === 'SOFT' && responseAction === 'CONTINUE')) {
              setStageId(CONSTANTS.STAGE_NAMES.FFD_2);
              await postFulFilmentData(res.data).then(async (res: any) => {
                if (res.status === 202) {
 
                  setShowSpinner(false);
                  let stageData = JSON.parse(JSON.stringify(stageSelector[0].stageInfo));
                  stageData.applicants = [res.data.applicants];
                  stageData.application = res.data.application;
                  console.log(stageData);
                  dispatch(stagesAction.getStage({
                    id: CONSTANTS.STAGE_NAMES.FFD_2,
                    formConfig: stageData,
                  }))
                  dispatch(preApprovalAction.setCurrentStage("FFD"));
                }
              })
            }
 
            HardStop(responseType, responseAction);
         
          }
        });
      }
     
      else if (stageId === CONSTANTS.STAGE_NAMES.AD_3) {
        if (continueBtnSelector) {
          dispatch(ibankEncrypt(userInputSelector)).then(() => {
            submitSuccess();
          }).catch((error: AxiosError) => {
            dispatchError(error)
          })
        }
      }
      else {
        if ((resumeFlag.otpResume === true && (continueBtnSelector === null || continueBtnSelector === true)) || continueBtnSelector === true) {
          submitSuccess();
        }
      }
      pageScrollTop();
    }
    else {
      dispatch(
        fieldErrorAction.getFieldError({
          fieldName: userInputs,
        })
      );
      window.scroll(0, 0);
    }
    event.preventDefault();
  };
 
  const handleCallback = (
    fieldProps: KeyWithAnyModel,
    childData: string | number | null
  ) => {
 
    currentStageSection = fieldProps;
    if (
      madatoryFieldSelector &&
      madatoryFieldSelector.indexOf(fieldProps.logical_field_name) !== -1
    ) {
 
      if (stageId !== CONSTANTS.STAGE_NAMES.AD_2) {
        madatoryFieldSelector && madatoryFieldSelector.map((fieldName) => {
          let childValue = userInputSelector.applicants[0][fieldName];
 
          if (fieldName === fieldProps.logical_field_name) {
            setUserInputs((prevUser: KeyStringModel) => ({
              ...prevUser,
              // [fieldName]: childData,
              [fieldProps.logical_field_name]: ((stageId === CONSTANTS.STAGE_NAMES.AD_1 || stageId === CONSTANTS.STAGE_NAMES.RP)
                ? (((fieldName === "cb_declaration" || fieldName === "client_declaration_cert" || fieldName === "acknowledgement_cert") && (childData === "N" || childData === undefined)) ? undefined : childData)
                : (childData ? childData : undefined)),
            }));
          }
          if (fieldName !== fieldProps.logical_field_name) {
            setUserInputs((prevUser: KeyStringModel) => ({
              ...prevUser,
              [fieldName]: ((stageId === CONSTANTS.STAGE_NAMES.AD_1 || stageId === CONSTANTS.STAGE_NAMES.RP)
                ? (((fieldName === "cb_declaration" || fieldName === "client_declaration_cert" || fieldName === "acknowledgement_cert") && (childValue === "N" || childValue === undefined)) ? undefined : childValue)
                : (childValue ? childValue : undefined)),
            }));
          }
          return fieldName
        })
      } else {
        setUserInputs({});
      }
    }
    // updateFormVlidation();
  };
 
  const handleFieldDispatch = (
    fieldName: string,
    childData: string | number | null | '',
    option?: string | '' | undefined | null
  ) => {
    dispatch(
      stagesAction.modifyStage({
        fieldData: {
          fieldName: fieldName,
          value: childData,
        },
        currentStageSection: { data: currentStageSection },
      })
    );
    if (stageId === CONSTANTS.STAGE_NAMES.BD_2 || stageId === CONSTANTS.STAGE_NAMES.BD_3 || stageId === CONSTANTS.STAGE_NAMES.BD_4 || fieldName === "country_of_tax_residence") {
      setUserInputs((prevUser: KeyStringModel) => ({
        ...prevUser,
        [fieldName]: (childData ? childData : undefined),
      }));
    }
    if (option)
      dispatch(
        lovDescAction.addLovData({
          fieldData: {
            fieldName: fieldName,
            code_desc: option,
            code_value: childData
          }
        })
      );
  };
 
  const backHandler = () => {
    setBackText("Back");
 
 
 
    if (valueSelector.changesUpdate.changes) {
      dispatch(
        ValueUpdateAction.getChangeUpdate({
          id: stageSelector[0].stageId!,
          changes: false,
        })
      );
    }
    // }
    let stageUpdate = getStageName(
      stageSelector[0].stageId!,
      applicationJourney
    );
 
    //Bypass iBanking screen logic
    if (stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_2 && applicantsSelector.is_banking_registered && applicantsSelector.is_banking_registered === 'true') {
      stageUpdate = CONSTANTS.STAGE_NAMES.AD_1
    }
 
    if (stageUpdate !== CONSTANTS.STAGE_NAMES.PD_1) {
      if (resumeSelector) {
        dispatch(
          getLovMissing(
            stageUpdate,
            stageSelector[0].stageInfo.fieldMetaData.data.stages,
            lovSelector
          )
        );
      }
      dispatch(fieldErrorAction.getMandatoryFields(null));
      dispatch(ContinueBtnAction.getContinueEnableState(true));
      dispatch(isFormUpdate(true));
      setStageId(stageUpdate);
      dispatch(stagesAction.resetCurrentStage(stageUpdate));
      dispatch(stagesAction.updateStageId(stageUpdate));
      dispatch(stagesAction.updateDynamicCityField({ 'label': CONSTANTS.LOGICAL_FIELD_NAMES.RES_CITY_3, 'value': '' }))
      pageScrollTop();
    }
 
  };
 
  const getUserInputData = () => {
 
    let userInputNew = userInputSelector.applicants[0];
 
    let isUserInput = true;
 
    madatoryFieldSelector.forEach((data: string) => {
 
      if (userInputNew[data] && isUserInput) {
        isUserInput = true;
     
      } else {
        isUserInput = false;
 
      }
    });
   
    return isUserInput;
  }
 
 
  const updateFormVlidation = () => {
    //let newUserInputs = JSON.stringify(userInputs)
 
    if (madatoryFieldSelector && madatoryFieldSelector.length > 0) {
      let sortUserInputData: any = getUserInputData()
      // if (!(Object.keys(sortUserInputData).length > 0)) {
 
      if (sortUserInputData && isFormValid && fieldErrorSelector.length === 0) {
        //if (continueBtnSelector === false) {
        setRequiredFormValidation("form-valid");
 
        // } else {
        //   setRequiredFormValidation("form-valid");
        // }
      } else if (stageSelector[0] && stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_6) {
        setRequiredFormValidation("form-valid");
      } else {
        setRequiredFormValidation("form-invalid");
 
      }
    }
    if (stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.LD_1) {
      if (userInputSelector.applicants[0].oth_bank_name !== "" && userInputSelector.applicants[0].oth_bank_number !== "" && userInputSelector.applicants[0].select_account !== "") {
        if (userInputSelector.applicants[0].oth_bank_number?.length === 12) {
          setRequiredFormValidation('form-valid');
        }
      }
    }
 
  }
 
  useEffect(() => {
 
    updateFormVlidation();
 
  }, [isFormValid,valueSelector, fieldErrorSelector,userInputs, userInputSelector, madatoryFieldSelector, continueBtnSelector, stageSelector]);
 
  const validateForm = (e: FormEvent<HTMLFormElement> | null) => {
    if (e && e.currentTarget.checkValidity()) {
 
 
      setFormValidation(true);
 
    }
 
    else {
      setFormValidation(false);
      setRequiredFormValidation('form-invalid');
    }
  };
 
  const updateCheckboxStatus = (checkedStatus: boolean, fieldName: string) => {
    if (stageSelector[0].stageId !== CONSTANTS.STAGE_NAMES.AD_2 || stageSelector[0].stageId !== CONSTANTS.STAGE_NAMES.RP) {
      setCheckboxStatus(!checkboxStatus);
      if (checkedStatus === true) {
        if (isFormValid && !(Object.keys(userInputs).length > 0)) {
          setRequiredFormValidation("form-valid");
        }
      } else {
        if (stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_1 /*|| stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_2*/) {
          dispatch(fieldErrorAction.getMandatoryFields([fieldName]));
        }
        setRequiredFormValidation("form-invalid");
      }
      if (stageSelector[0].stageId !== CONSTANTS.STAGE_NAMES.AD_2 || stageSelector[0].stageId !== CONSTANTS.STAGE_NAMES.RP) {
        handleFieldDispatch(fieldName, checkedStatus ? 'Y' : 'N');
      }
    }
    // AD-2 continue button enable state (Changes done for continue button)
    if (stageSelector[0] && stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.AD_2) {
      setRequiredFormValidation("form-valid");
    }
  };
 
  const confirmCheckboxStatus = (val: boolean) => {
    if (val) {
      setRequiredFormValidation('form-valid')
    }
    else {
      setRequiredFormValidation('form-invalid')
    }
  }
 
  return (
    <>
      {(showSpinner && (stageId === "ld-1" || stageId === "ffd-1" || stageId === "ffd-2")) &&
        <Spinner loaderType="lastStep" />
      }
      {(showSpinner && (stageId !== "ld-1" && stageId !== "ffd-1" && stageId !== "ffd-2")) &&
        <Spinner type="saving" />
      }
      {!showSpinner && (
        <form className="form" onSubmit={handleSubmit} onChange={validateForm}>
          {stageId === "ld-1" &&
            <FundDisbursement
              fields={fields?.fields}
              index
              userInputs
              confirmCheckboxStatus={confirmCheckboxStatus}
              handleCallback={handleCallback}
              handleFieldDispatch={handleFieldDispatch}
            />
          }
          {stageId === "rp" &&
            <ReviewPage fields={fields} currentStageSection
              index
              handleCallback={handleCallback}
              handleFieldDispatch={handleFieldDispatch}
              userInputs
              confirmCheckboxStatus={confirmCheckboxStatus}
            />
          }
          {stageId !== "rp" && stageId !== "ld-1" && fields &&
            fields["fields"] &&
            fields["fields"].map(
              (currentSection: KeyWithAnyModel, i: number) => {
                return (
                  <div key={`fields${i}`}>
                    {currentSection["field_set_name"] &&
                      currentSection["fields"].length > 0 && (
                        <>
                          <div
                            className="field__group"
                            key={currentSection["field_set_name"]}
                          >
                            {currentSection["field_set_name"] !== 'Basic Information' && stageSelector[0].stageId !== CONSTANTS.STAGE_NAMES.PD_1 &&
                              <div className="pending__resume-header banner_ext">
                                <div className="header-wrapper-hk" style={{ display: 'flex' }}>
                                  <div className="hk-banner">
                                    <span className="banner-icon banner-icon-mobile"></span>
                                    <div className="card-title card-title-replace">{currentSection["field_set_name"]}</div>
                                  </div>
 
                                </div>
                                <Close authType="resume" />
                              </div>
 
                              // </div>
                            }
 
                            {currentSection["fields"].map(
                              (
                                currentSection: KeyWithAnyModel,
                                index: number
                              ) => {
                                return renderComponent(
                                  (currentStageSection = currentSection),
                                  index,
                                  handleCallback,
                                  handleFieldDispatch,
                                  userInputs,
                                  updateCheckboxStatus
                                );
                              }
                            )}
                          </div>
                        </>
                      )}
                  </div>
                );
              }
            )
          }{stageId !== "rp" && fields &&
            <div className="hk_copyrights">
              <p>© Standard Chartered Bank (HK) Limited</p>
            </div>
          }
          {/* {stageId !== "rp" && */}
          <div className="app__footer">
 
            <Footer
              backHandler={backHandler}
              validateNxt={isRequiredValid}
            />
          </div>
          {/* } */}
        </form>
      )}
    </>
  );
};
 
export default React.memo(Fields);



Sure! When writing RTL (React Testing Library) test cases, it's common to mock parts like `useSelector` from React Redux, especially if you're not using a provider. Below are examples illustrating how to mock `useSelector` and render a component using RTL.

### Example Component
Assume we have a simple component that uses `useSelector` to fetch some data.

```javascript
// MyComponent.js
import React from 'react';
import { useSelector } from 'react-redux';

const MyComponent = () => {
  const data = useSelector((state) => state.data);
  
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
};

export default MyComponent;
```

### RTL Test Cases
Here’s how you can write test cases for this component while mocking `useSelector`.

```javascript
// MyComponent.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';
import { useSelector } from 'react-redux';

// Mocking the useSelector hook
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('MyComponent', () => {
  beforeEach(() => {
    useSelector.mockClear(); // Clear any previous mock data
  });

  test('renders correctly with title and description', () => {
    // Mock the return value of useSelector
    useSelector.mockReturnValue({
      title: 'Test Title',
      description: 'Test Description',
    });

    render(<MyComponent />);

    // Assert that the title and description are in the document
    expect(screen.getByRole('heading')).toHaveTextContent('Test Title');
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('renders without data', () => {
    // Mock to return default values (empty strings)
    useSelector.mockReturnValue({
      title: '',
      description: '',
    });

    render(<MyComponent />);

    // Assert that empty state is handled
    expect(screen.getByRole('heading')).toHaveTextContent('');
    expect(screen.getByText('')).toBeInTheDocument();
  });
});
```

### Explanation:
1. **Mocking useSelector**: We override `useSelector` with a mock function using `jest.mock()`, ensuring it returns controlled, predictable values.
  
2. **Tests**:
   - The first test checks whether the component renders correctly with given data.
   - The second test verifies how the component behaves when there's no data.

3. **beforeEach**: This clears the mock data before each test to avoid state leakage.

This is a straightforward approach to testing Redux-connected components in isolation without a provider, enabling clean and effective component testing.
