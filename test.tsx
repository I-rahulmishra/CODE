export const submitRequest = (
  applicantsSelector: KeyWithAnyModel,
  stageSelector: StageDetails,
  stageSelectorThankYou:Array<StageDetails>,
  valueSelector: ValueSelectModel,
  applicationJourney: string | null,
  lovSelector: KeyWithAnyModel,
  userInputSelector: KeyWithAnyModel,
  errorSelector: any,
  otpAuth: boolean,
  isPreserveCall?: boolean,
  isExit? :boolean,
  bancaSelector? : KeyWithAnyModel
): any => {
  return async (dispatch: AppDispatch) => {
    const stagePayload = () => {
      const stageIndex = (stageSelector.stageId === "bd-1" || stageSelector.stageId === "bd-2" || stageSelector.stageId === "bd-3")? 0 : stageSelector.stageId === "ACD" ? 1 :2
      // const stageIndex = FindIndex(
      //   stageSelector.stageInfo,
      //   stageSelector.stageId
      // );
      if (stageSelector.stageId !== "rp" && stageSelector.stageId !== "doc") {
        let metagata = {
          ...stageSelector.stageInfo.fieldmetadata.data.stages[stageIndex],
        };
        if (stageSelector.stageId === "ad-1") {
          let fields = [...metagata.fields];
          let i = 1;
          while (i < 6) {
            fields.push(
              { logical_field_name: `country_of_tax_residence_${i}` },
              { logical_field_name: `tax_id_no_${i}` },
              { logical_field_name: `crs_reason_code_${i}` },
              { logical_field_name: `crs_comments_${i}` }
            );
            i++;
          }
          metagata.fields = fields;
          let fieldIndex = metagata.fields.findIndex(
            (field: KeyWithAnyModel) =>
              field.logical_field_name === "add_tax_residency_note"
          );
          if (fieldIndex > -1) {
            metagata.fields.splice(fieldIndex, 1);
          }
          const tmpStore = store.getState().stages.stages[0].stageInfo;
          if (
            tmpStore &&
            tmpStore.applicants["casa_fatca_declaration_a_1"] === "Y"
          ) {
            fieldIndex = metagata.fields.findIndex(
              (field: KeyWithAnyModel) =>
                field.logical_field_name === "tax_id_no"
            );
            if (fieldIndex > -1) {
              metagata.fields.splice(fieldIndex, 1);
            }
          }
        }
        return metagata.fields.reduce(
          (prev: any, { logical_field_name, ...item }: any) => {
            if (!PAYLOAD_CONSTANTS.INFO_FIELDS.includes(item.component_type)) {
              if (applicantsSelector[logical_field_name + "_a_1"]) {
                prev[logical_field_name + "_a_1"] = applicantsSelector[
                  logical_field_name + "_a_1"
                ]
                  ? applicantsSelector[logical_field_name + "_a_1"]
                  : stageSelector.stageInfo.applicants[
                      logical_field_name + "_a_1"
                    ];
              }
            }
            if ((stageSelector.stageId === "ad-2" ||(stageSelector.stageId === "bd-3" && applicantsSelector.credit_limit_consent_a_1 === "N"))) 
            {
                  if(bancaSelector && bancaSelector.eligible_banca_insurances)
                  {
                    bancaSelector.eligible_banca_insurances.map((eligibleBancaInsurance: any, index: number) => {
                      if(applicantsSelector["insurance_consent_" + eligibleBancaInsurance + "_a_1"])
                      {
                        prev["insurance_consent_" + eligibleBancaInsurance + "_a_1"] =
                        applicantsSelector["insurance_consent_" + eligibleBancaInsurance + "_a_1"];
                      }

                      if(eligibleBancaInsurance === 'SG-PA' && applicantsSelector["insurance_consent_" + eligibleBancaInsurance + "_a_1"] === 'Y')
                      {
                        prev['banca_benefit_amount1_a_1'] = "50000.0";
                        prev['banca_eligible_prdcd_a_1'] = stageSelector.stageInfo.products[0].product_type;
                        prev['banca_premium_amount_a_1'] = bancaSelector.eligible_banca_insurance_informations[index].Premium.InsurancePremiumAmount;
                        prev['banca_product_applicable_a_1'] = 'Y';
                        prev['banca_product_code_a_1'] = "PA";
                      }
                    })
                  }
            }
            return prev;
          },
          {}
        );
      } else if(stageSelector.stageId === "rp") {
        
        const fieldUpdate = JSON.parse(JSON.stringify(stageSelectorThankYou[0]));
        for (let key in applicantsSelector) {
          fieldUpdate.stageInfo.applicants[key] = applicantsSelector[key];
        }
        let stateInfofield = fieldUpdate.stageInfo;
        return stateInfofield
       
      }
    };

    stagePayload();

    const patchUserInputOnPayload = () => {
      const fieldUpdate = JSON.parse(JSON.stringify(stageSelector));
      for (let key in applicantsSelector) {
        fieldUpdate.stageInfo.applicants[key] = applicantsSelector[key];
      }
      return fieldUpdate;
    };

    if (isPreserveCall) {
      dispatch(fieldErrorAction.getMandatoryFields(null));
      dispatch(fieldErrorAction.getFieldError(null));
      let currentStageFields: any;
      if (
        stageSelector &&
        stageSelector.stageId !== "ssf-1" &&
        stageSelector.stageId !== "ssf-2" &&
        stageSelector.stageId !== "bd-1"
      ) {
        currentStageFields = stagePayload();
      } else {
        currentStageFields = applicantsSelector;
      }
      return await dispatch(await preserveRequest(patchUserInputOnPayload(), currentStageFields ,isExit)).then((response:any)=>{
        return Promise.resolve(response);
       }).catch((err: any) => {
        return Promise.reject(err);
      });
    } else {
      let isSaveRequest = false;
      let isRetry = false;
      if (errorSelector && errorSelector.retry) {
        isRetry = true;
        dispatch(errorAction.getRetryStatus(false));
      }
      // bd-1 back nav should always skip api calls
      if (stageSelector.stageId === "bd-1") {
        isSaveRequest = true;
      } else if (
        (valueSelector.backNavigation.formChange !== null &&
          stageSelector.stageId !== "rp" &&
          stageSelector.stageId !== "ssf-1" && stageSelector.stageId !== "ssf-2") ||
        (stageSelector.stageId === "ssf-2" &&
          valueSelector.otherMyInfo &&
          getUrl.getChannelRefNo().applicationRefNo)
      ) {
        isSaveRequest = compareStageRequest(
          stageSelector.stageInfo.applicants,
          userInputSelector.applicants
        );
        if(isSaveRequest && otpAuth){
          isSaveRequest = false;
        }
      }

      if (
        (getUrl.getChangeUpdate() && stageSelector.stageId === "ad-2") ||
        valueSelector.backNavigation.nextStageId === stageSelector.stageId ||
        isRetry
      ) {
        isSaveRequest = false;
      }

      if (isSaveRequest !== true) {
        dispatch(fieldErrorAction.getMandatoryFields(null));
        dispatch(fieldErrorAction.getFieldError(null));
        let currentStageFields: any;
        if (
          stageSelector &&
          stageSelector.stageId !== "ssf-1" &&
          stageSelector.stageId !== "ssf-2" &&
          stageSelector.stageId !== "bd-1"
        ) {
          currentStageFields = stagePayload();
        } else {
          currentStageFields = applicantsSelector;
        }
        return dispatch(
          postRequest(
            patchUserInputOnPayload(),
            currentStageFields,
            patchUserInputOnPayload().stageId,
            applicationJourney
          )
          )
          .then((response: any) => {
            
            dispatch(isFormUpdate(null));
            const journeyType = applicationJourney
              ? applicationJourney
              : response;
            const stateStage = nextStage(
              patchUserInputOnPayload().stageId,
              journeyType
            );
           //  dispatch(StepCountAction.modifyStepCount(stateStage));
            dispatch(stagesAction.updateStageId(stateStage));
            dispatch(stagesAction.resetCurrentStage(stateStage));
            if (journeyType && stateStage !== "ffd-1") {
              // const nextStage = getUrl.getSteps().steps;
              // const nextStageId = valueSelector.backNavigation.nextStageId;
              // const stageUpdate =
              //   nextStageId && nextStage && 
              //   nextStage[stateStage].step > nextStage[nextStageId].step
              //     ? true
              //     : false;
              // if (!nextStageId || stageUpdate) {
              //   dispatch(ValueUpdateAction.getNextStageId(stateStage));
              // } 
            }
            return stateStage;
          })
          .catch((err: any) => {
            return Promise.reject(err);
          });
      } else {
        dispatch(fieldErrorAction.getMandatoryFields(null));
        dispatch(fieldErrorAction.getFieldError(null));
        const stateStage = nextStage(
          patchUserInputOnPayload().stageId,
          applicationJourney
        );
        dispatch(stagesAction.resetCurrentStage(stateStage));
        dispatch(stagesAction.updateStageId(stateStage));
        dispatch(
          getLovMissing(
            stateStage,
            stageSelector.stageInfo.fieldmetadata.data.stages,
            lovSelector
          )
        );
        return stateStage;
      }
    }
  };
};


appData.applicationdata.application.notification_required = true;
          appData.applicationdata.application.is_save_to_pega = 'Yes';
