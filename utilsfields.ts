import {
  AppDispatch,
  postRequest,
  isFormUpdate,
  preserveRequest,
  getLovData,
  lovRequests,
} from "../../../services/common-service";
import {
  authenticateType,
  FindIndex,
} from "../../../utils/common/change.utils";
import { CONSTANTS } from "../../../utils/common/constants";
import {
  FieldSetGroupModel,
  KeyWithAnyModel,
  StageDetails,
  StageFieldModel,
  ValueSelectModel,
} from "../../../utils/model/common-model";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { stagesAction } from "../../../utils/store/stages-slice";
import Rules_bd_1 from "../../rules/rules_bd-1";
import Rules_bd_2 from "../../rules/rules_bd-2";
import RulesSSF from "../../rules/rules_ssf-1";
import Rules_ad_1 from "../../rules/rules_ad-1";
import Rules_ad_2 from "../../rules/rules_ad-2";
import { nextStage } from "./stage.utils";
import { PAYLOAD_CONSTANTS } from "./constants";
import Rules_bd_3 from "../../rules/rules_bd-3";
import Rules_bd_4 from "../../rules/rules_bd-4";
import { errorAction } from "../../../utils/store/error-slice";
import Rules_ad_6 from "../../rules/rules_ad-6";

/**
 * The method used to filter the response based on stages and forming the grouping for page level
 * @param stageSelector Initial response
 * @param stageId current stageId
 * @returns
 */
export const stageFields = (
  stageSelector: Array<StageDetails>,
  stageId: string,
  employeeToggleSelector?: any,
  other?: string | undefined
) => {
  let stageFields: Array<StageFieldModel> = [];
  if (
    stageSelector && stageSelector.length>0 &&
    stageSelector[0].stageInfo &&
    stageSelector[0].stageInfo.fieldMetaData &&
    stageSelector[0].stageInfo.fieldMetaData.data.stages
  ) {
    let currentStage =
      stageId === CONSTANTS.STAGE_NAMES.LD_1 
        ? ["ad-11"]
        : [stageId];
    currentStage.forEach((name) => {
      const stageIndex = FindIndex(stageSelector[0].stageInfo, name);
      stageFields.push(
        stageSelector[0].stageInfo.fieldMetaData.data.stages[stageIndex]
      );
    });
  }
  let currentStageFields: any;
  if (stageFields) {
    let fieldsetGroup: Array<FieldSetGroupModel[]> = [];
    const groupObj = (response: StageFieldModel) => {
      return response?.fields?.reduce(
        (prev: Array<FieldSetGroupModel>, { field_set_name, ...items }) => {
          let id = prev.findIndex(
            (item: KeyWithAnyModel) => item.field_set_name === field_set_name
          );
          fieldGroupingFunc(id, prev, field_set_name, items);
          return prev;
        },
        []
      );
    };

    let filteredData: any =stageFields.length > 0 ? stageFields[0]?.fields?.filter((item:KeyWithAnyModel) => item.rwb_category===stageSelector[0].stageId) : [];

   
    let stageFieldData= JSON.parse(JSON.stringify(stageFields));
    /* istanbul ignore else */
  if( !Array.isArray(stageFieldData) && stageFieldData.length>0 ){
    stageFieldData[0].fields= filteredData;
  }

    stageFieldData.forEach((data: StageFieldModel) => {

      if (fieldsetGroup.length > 0) {
        fieldsetGroup[0].push(groupObj(data)[0]);
      } else {
        fieldsetGroup.push(groupObj(data));
      }
    });
    if (stageId === "bd-2") {
      currentStageFields = Rules_bd_2(
        fieldsetGroup,
        stageSelector[0].stageInfo.application
      );
    } else if (stageId === "bd-1") {
      currentStageFields = Rules_bd_1(
        fieldsetGroup,
        stageSelector?.[0]?.stageInfo?.fieldMetaData?.data?.stages?.[0]?.fields
      );
    }
    else if (stageId === "pd-1") {

      currentStageFields = Rules_bd_1(
        fieldsetGroup,
        stageSelector[0].stageInfo.fieldMetaData.data.stages[0].fields
      );
    }
    else if (stageId === "bd-1a") {

      currentStageFields = Rules_bd_1(
        fieldsetGroup,
        stageSelector[0].stageInfo.fieldMetaData.data.stages[0].fields
      );
    }
    else if (stageId === "bd-3") {
      currentStageFields = Rules_bd_3(
        fieldsetGroup,
        stageSelector[0].stageInfo.application
      );
    } else if (stageId === "bd-4") {
      currentStageFields = Rules_bd_4(
        fieldsetGroup,
        stageSelector[0].stageInfo.application,
        employeeToggleSelector
      );
    }
    else if (stageId === "ad-1") {
      currentStageFields = Rules_ad_1(
        fieldsetGroup,
        stageSelector[0].stageInfo.fieldMetaData.data.stages[0].fields
      );
    }
    else if (stageId === "ad-1a") {
      currentStageFields = Rules_ad_1(
        fieldsetGroup,
        stageSelector[0].stageInfo.fieldMetaData.data.stages[0].fields
      );
    }
    else if (stageId === "ad-2") {
      currentStageFields = Rules_ad_2(
        fieldsetGroup,
        stageSelector[0].stageInfo.fieldMetaData.data.stages[0].fields
      );
    } 
    else if (stageId === "ad-3") {
      currentStageFields = Rules_ad_2(
        fieldsetGroup,
        stageSelector[0].stageInfo.fieldMetaData.data.stages[0].fields
      );
    } 
    else if (stageId === "ad-6") {
      currentStageFields = Rules_ad_6(
        fieldsetGroup,
        stageSelector[0].stageInfo.fieldMetaData.data.stages[0].fields
      );
    } 
    else if (stageId === "ld-1") {
      currentStageFields = Rules_ad_2(
        fieldsetGroup,
        stageSelector[0].stageInfo.fieldMetaData.data.stages[0].fields
      );
    } 
    else {
      currentStageFields = RulesSSF(
        fieldsetGroup,
        stageSelector[0] && stageSelector[0].stageInfo.application,
      );
    }
  }
  return {
    fields: currentStageFields,
  };
};

export const stageSelectFields = (
  stageSelector: Array<StageDetails>,
  stageId: string,
  other?: any
) => {
  let stageFields: Array<StageFieldModel> = [];
 /* istanbul ignore else */
  if (
    stageSelector &&
    stageSelector?.[0]?.stageInfo &&
    stageSelector?.[0]?.stageInfo?.fieldMetaData &&
    stageSelector[0].stageInfo.fieldMetaData.data.stages
  ) {
    let currentStage =
      stageId === CONSTANTS.STAGE_NAMES.SSF_1 && authenticateType() !== `${process.env.REACT_APP_AUTH_TYPE_MANUAL}`
        ? [stageId]
        : [stageId];
    currentStage.forEach((name) => {
      other = { "fields": other };
      stageFields.push(other);
    });
  }
  let currentStageFields: any;
   /* istanbul ignore else */
  if (stageFields) {
    let fieldsetGroup: Array<FieldSetGroupModel[]> = [];
    const groupObj = (response: StageFieldModel) => {
      return response.fields?.reduce(
        (prev: Array<FieldSetGroupModel>, { field_set_name, ...items }) => {
          let id = prev.findIndex(
            (item: KeyWithAnyModel) => item.field_set_name === field_set_name
          );
          fieldGroupingFunc(id, prev, field_set_name, items);
          return prev;
        },
        []
      );
    };

    stageFields.forEach((data: StageFieldModel) => {
      if (fieldsetGroup.length > 0) {
        fieldsetGroup[0].push(groupObj(data)[0]);
      } else {
        fieldsetGroup.push(groupObj(data));
      }
    });
    if (stageId === "bd-2") {
      currentStageFields = Rules_bd_2(
        fieldsetGroup,
        stageSelector[0].stageInfo.application
      );
    } else if (stageId === "bd-1") {
      currentStageFields = Rules_bd_1(
        fieldsetGroup,
        stageSelector?.[0]?.stageInfo.application
      );
    } else if (stageId === "bd-1a") {
      currentStageFields = Rules_bd_1(
        fieldsetGroup,
        stageSelector[0].stageInfo.application
      );
    } else if (stageId === "bd-3") {
      currentStageFields = Rules_bd_3(
        fieldsetGroup,
        stageSelector[0].stageInfo.application
      );
    } else if (stageId === "ad-1") {
      currentStageFields = Rules_ad_1(
        fieldsetGroup,
        stageSelector[0].stageInfo.application
      );
    } else if (stageId === "ad-2") {
      currentStageFields = Rules_ad_2(
        fieldsetGroup,
        stageSelector[0].stageInfo.application
      );
    } else if (stageId === "ad-6") {
      currentStageFields = Rules_ad_6(
        fieldsetGroup,
        stageSelector[0].stageInfo.application
      );
    } else {
      currentStageFields = RulesSSF(
        fieldsetGroup,
        stageSelector[0].stageInfo.application,
      );
    }
  }
  return {
    fields: currentStageFields,
  };
};

/**
 * The method used to push the fields to make a fieldset grouping
 * @param id
 * @param prev
 * @param field_set_name
 * @param items
 */
export const fieldGroupingFunc = (
  id: number,
  prev: Array<KeyWithAnyModel>,
  field_set_name: string,
  items: KeyWithAnyModel
) => {
  if (id >= 0) {
    prev[id]?.fields.push(items);
  } else {
    prev.push({ field_set_name, fields: [items] });
  }
};

/**
 * The method is used to get user inputs
 * @param applicantsSelector
 * @param stageSelector
 * @returns
 */
export const userInputPayload = (
  applicantsSelector: KeyWithAnyModel,
  stageSelector: Array<StageDetails>
): any => {
  return async (dispatch: AppDispatch) => {
    const fieldUpdate = JSON.parse(JSON.stringify(stageSelector[0]));
    for (let key in applicantsSelector) {
      let newKey= key+'_a_1'
      fieldUpdate.stageInfo.applicants[0][newKey] = applicantsSelector[key];
    }
    dispatch(stagesAction.updateStageFields(fieldUpdate));
  };
};

/**
 * The method used to make API request for all stages.
 * @param userInputSelector To ensure whether all teh fields are filled by userInput
 * @param stageSelector Initial response
 * @param valueSelector to ensure whether any changes deducted or not
 * @returns
 */

export const submitRequest = (
  applicantsSelector: KeyWithAnyModel,
  stageSelector: StageDetails,
  valueSelector: ValueSelectModel,
  lovSelector: KeyWithAnyModel,
  applicationJourney: string | null,
  userInputSelector: KeyWithAnyModel,
  errorSelector: any,
  resumeFlag: any,
  isPreserveCall?: boolean
): any => {
  return async (dispatch: AppDispatch) => {
    let applicationsuccess = false;
    const stagePayload = () => {
      const stageIndex = FindIndex(
        stageSelector.stageInfo,
        stageSelector.stageId === CONSTANTS.STAGE_NAMES.LD_1 ? "ad-11" : stageSelector.stageId
      );
      let metagata = {
        ...stageSelector?.stageInfo?.fieldMetaData?.data?.stages[stageIndex],
      };

      return metagata?.fields?.reduce(
        (prev: any, { logical_field_name, ...item }: any) => {
           /* istanbul ignore else */
          if (!PAYLOAD_CONSTANTS.INFO_FIELDS.includes(item.component_type)) {
             /* istanbul ignore else */
            if (applicantsSelector[logical_field_name]) {
              prev[logical_field_name] = applicantsSelector[logical_field_name] ? applicantsSelector[logical_field_name] : stageSelector.stageInfo.applicants[0][logical_field_name];
            }
          }

          return prev;
        },
        {}
      );
    }

    stagePayload();

    const patchUserInputOnPayload = () => {
      const fieldUpdate = JSON.parse(JSON.stringify(stageSelector));
      for (let key in applicantsSelector) {
        fieldUpdate.stageInfo.applicants[0][key+'_a_1'] = applicantsSelector[key];
      }
      return fieldUpdate;
    };
    if (isPreserveCall) {
      dispatch(fieldErrorAction.getMandatoryFields(null));
      dispatch(fieldErrorAction.getFieldError(null));
      let currentStageFields: any;
       /* istanbul ignore else */
      if (stageSelector) {
        currentStageFields = stagePayload();
      }
      return dispatch(preserveRequest(patchUserInputOnPayload(), currentStageFields, stageSelector?.stageInfo?.applicants?.[0]))?.then((response: any) => {
         /* istanbul ignore else */
        if (response) {
          applicationsuccess = true;
          return applicationsuccess;
        }
        return applicationsuccess
      })
    }
    else {
      let isSaveRequest = false;
      let isRetry = false;
       /* istanbul ignore else */
      if (errorSelector && errorSelector.retry) {
        isRetry = true;
        dispatch(errorAction.getRetryStatus(false));
      }
      if (stageSelector.stageId === "ssf-1") {
        isSaveRequest = false;
      } else if (stageSelector.stageId === "bd-2") {
        if (stageSelector.stageInfo.applicants[0]['bank_name'] ||
          stageSelector.stageInfo.applicants[0]['account_number_type_1'] ||
          stageSelector.stageInfo.applicants[0]['china_id_number'] ||
          stageSelector.stageInfo.applicants[0]['full_name_chinese']
        ) {
          isSaveRequest = compareStageRequest(
            stageSelector.stageInfo.applicants[0],
            userInputSelector.applicants[0],
            stageSelector
          );
        } else {
          isSaveRequest = false;
        }
      } else {
        isSaveRequest = compareStageRequest(
          stageSelector?.stageInfo?.applicants?.[0],
          userInputSelector?.applicants?.[0],
          stageSelector
        );
      }
       /* istanbul ignore else */
      if (valueSelector?.changesUpdate?.changes === false) {
        if (valueSelector?.changesUpdate?.lastStageId !== stageSelector?.stageId) {
          isSaveRequest = true;
        } else {
          isSaveRequest = false;
        }
      }
       /* istanbul ignore else */
      if (isRetry) {
        isSaveRequest = false;
      }

      if (isSaveRequest !== true) {
        dispatch(fieldErrorAction.getMandatoryFields(null));
        dispatch(fieldErrorAction.getFieldError(null));
        let currentStageFields: any;
         /* istanbul ignore else */
        if (stageSelector) {
          currentStageFields = stagePayload();
        }
        return dispatch(
          postRequest(
            patchUserInputOnPayload(),
            currentStageFields,
            patchUserInputOnPayload().stageId,
            applicationJourney,
            stageSelector.stageInfo.applicants[0]
          )
        )?.then((response: any) => {
          dispatch(isFormUpdate(null));
          const journeyType = applicationJourney ? applicationJourney : response;
          let stateStage = nextStage(
            patchUserInputOnPayload().stageId,
            journeyType
          );
          //Bypass iBanking screen logic
           /* istanbul ignore else */
          if (stageSelector.stageId === CONSTANTS.STAGE_NAMES.AD_1 && applicantsSelector['is_banking_registered'] && applicantsSelector['is_banking_registered'] === 'true') {
            stateStage = CONSTANTS.STAGE_NAMES.AD_2
          }
          dispatch(stagesAction.resetCurrentStage(stateStage));
          dispatch(stagesAction.updateStageId(stateStage));
          return stateStage;
        });
      }
      else {
        let stateStage = nextStage(
          patchUserInputOnPayload().stageId,
          applicationJourney
        );
           /* istanbul ignore else */
        if(stageSelector.stageId === CONSTANTS.STAGE_NAMES.AD_2) {
           /* istanbul ignore else */
          if(resumeFlag.otpResume) {
            dispatch(lovRequests(stageSelector.stageInfo, CONSTANTS.STAGE_NAMES.RP, '', true));
          }
        }

        //Bypass iBanking screen logic
         /* istanbul ignore else */
        if (stageSelector.stageId === CONSTANTS.STAGE_NAMES.AD_1 && applicantsSelector['is_banking_registered'] && applicantsSelector['is_banking_registered'] === 'true') {
          stateStage = CONSTANTS.STAGE_NAMES.AD_2
        }

        dispatch(stagesAction.resetCurrentStage(stateStage));
        dispatch(stagesAction.updateStageId(stateStage));
        dispatch(
          getLovMissing(
            stateStage,
            stageSelector.stageInfo.fieldMetaData.data.stages,
            lovSelector
          )
        );
        return stateStage;
      }
    }
  };
};

export const getLovMissing = (
  stageId: string,
  stageSpecInfo: KeyWithAnyModel,
  lovSelector: KeyWithAnyModel
): any => {
  return (dispatch: AppDispatch) => {
    stageSpecInfo.forEach((stageVal: KeyWithAnyModel) => {
       /* istanbul ignore else */
      if (stageVal.stageId === stageId) {
         /* istanbul ignore else */
        if (stageVal.fields.length > 0) {
          stageVal.fields.forEach((fName: KeyWithAnyModel) => {
             /* istanbul ignore else */
            if (fName.lov === "Yes") {
              const existingLov = lovSelector.lov.find(
                (item: KeyWithAnyModel) =>
                  item.label === fName.logical_field_name
              );
               /* istanbul ignore else */
              if (!existingLov) {
                dispatch(getLovData(fName.logical_field_name));
              }
            }
          });
        }
      }
    });
  };
};

export const compareStageRequest = (
  stageSelectorApplicants: KeyWithAnyModel,
  userInputSelectorApplicants: KeyWithAnyModel,
  stageSelector?: KeyWithAnyModel,
): any => {
  const newStageSelectorApplicants = stageSelector ? getStagePayload([stageSelector], stageSelectorApplicants) : stageSelectorApplicants
  const newuserInputSelectorApplicants = stageSelector ? getStagePayload([stageSelector], userInputSelectorApplicants) : userInputSelectorApplicants
  let isChanged = true;
  for (let key in newuserInputSelectorApplicants) {
     /* istanbul ignore else */
    if (newuserInputSelectorApplicants[key] !== newStageSelectorApplicants[key]) {
      isChanged = false;
      return isChanged;
    }
  }
  return isChanged;
};

export const getStagePayload = (stageSelector: KeyWithAnyModel, applicantsSelector: KeyWithAnyModel) => {
  const stageIndex = FindIndex(
    stageSelector[0].stageInfo,
    stageSelector[0].stageId === CONSTANTS.STAGE_NAMES.LD_1 ? "ad-11" : stageSelector[0].stageId
  );
  let metagata = {
    ...stageSelector[0]?.stageInfo?.fieldMetaData.data.stages[stageIndex],
  };
  return metagata.fields?.reduce(
    (prev: any, { logical_field_name, ...item }: any) => {
       /* istanbul ignore else */
      if (!PAYLOAD_CONSTANTS.INFO_FIELDS.includes(item.component_type)) {
         /* istanbul ignore else */
        if (applicantsSelector[logical_field_name]) {
          prev[logical_field_name] = applicantsSelector[logical_field_name] ? applicantsSelector[logical_field_name] : stageSelector[0].stageInfo.applicants[0][logical_field_name];
        }
      }

      return prev;
    },
    {}
  );
}
