import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import validateService from "../../../services/validation-service";
import { KeyWithAnyModel, LovInputModel, StoreModel } from "../../../utils/model/common-model";
import { fieldError, fieldIdAppend, getUrl, isFieldUpdate, isFieldValueUpdate } from "../../../utils/common/change.utils";
import "./phone.scss";
import errorMsg from "../../../assets/_json/error.json";
import { lastAction } from "../../../utils/store/last-accessed-slice";

export const Phone = (props: KeyWithAnyModel) => {
  const [lovData, setLovData] = useState<any>([]);
  const [error, setError] = useState('');
  const lovSelector = useSelector((state: StoreModel) => state.lov);
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const fieldErrorSelector = useSelector(
    (state: StoreModel) => state.fielderror.error
  );
  
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const dispatch = useDispatch();
  const [defaultValue, setDefaultValue] = useState("");

  useEffect(() => {
    if (
      stageSelector &&
      stageSelector[0] &&
      stageSelector[0].stageInfo &&
      stageSelector[0].stageInfo.applicants
    ) {
      if (
        stageSelector[0].stageInfo.applicants[
          props.data.logical_field_name + "_a_1"
        ]
      ) {
        const userInputResponse =
          userInputSelector.applicants[fieldIdAppend(props)];

        const stageIndex = getUrl
          .getUpdatedStage()
          .updatedStageInputs.findIndex(
            (ref: any) => ref && ref.stageId === stageSelector[0].stageId
          );
        let updatedVal = null;
        if (stageIndex > -1) {
          updatedVal =
            getUrl.getUpdatedStage().updatedStageInputs[stageIndex].applicants[
              fieldIdAppend(props)
            ];
        }

        let fieldValue = "";
        if (updatedVal) {
          fieldValue = updatedVal;
        } else if (userInputResponse) {
          fieldValue = userInputResponse;
        } else if (
          stageSelector[0].stageInfo.applicants[fieldIdAppend(props)] &&
          updatedVal !== ""
        ) {
          fieldValue =
            stageSelector[0].stageInfo.applicants[fieldIdAppend(props)];
        }
        const userMobileNum = fieldValue;
        const mobileNum =
          userMobileNum.indexOf("-") >= 0
            ? userMobileNum.split("-")[1]
            : userMobileNum;
        setDefaultValue(mobileNum);
        phoneValidation(props.data.logical_field_name, mobileNum, "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lovSelector.lov.length > 0) {
      lovSelector.lov.forEach((ref: LovInputModel) => {
        if (props.data.logical_field_name.includes(ref.label)) {
          setLovData(ref.value);
        }
      });
    }
  }, [lovSelector.lov, props.data.logical_field_name]);
  useEffect(() => {
    if(fieldError(fieldErrorSelector, props) && props.data.rwb_label_name !=="Office number (Optional)"){
       setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`)
    } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldErrorSelector]);

  const changeHandler = (fieldName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultValue(event.target.value);
    props.handleCallback(props.data, event.target.value);
    setError('');
    phoneValidation(fieldName,event.target.value,event.target.validity)
    console.log(fieldName,event.target.value,event.target.validity, "check the changeHandler")
  };
  const phoneValidation = (fieldName:string, value:string, validity:any) => {
    debugger;
    if ((props.data.mandatory === "Yes" || props.data.mandatory ==="Conditional") && value.length < 1) {
      setError(`${errorMsg.emity} ${props.data.rwb_label_name}`);
    } else if (fieldName === "mobile_number" && !(value[0] === '8' || value[0] === '9')) {
      setError(`${errorMsg.sgMobile}`);
    } 
    else if (props.data.min_length && `${value}`.length < props.data.min_length) {
      setError(`${errorMsg.minLength} ${props.data.min_length} digits`)
    } 
    else if (props.data.regex && !(`${value}`.match(props.data.regex)) 
    ) {
      setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`)
    } 
    else if(validity) {
      setError(!validity.valid ? (`${errorMsg.patterns} ${props.data.rwb_label_name}`) : '');
    }
  }
  const allowOnlyCharacter = (event: any, fieldName: string) => {
    validateService.allowOnlyCharacter(event, fieldName);
  };

  const bindHandler = (fieldName: string, event: any) => {
    if (event.target.validity.valid) {
      const fieldValue =
        fieldName === "mobile_number" ? event.target.value : "";
      dispatch(isFieldUpdate(props, fieldValue, fieldName));
      dispatch(isFieldValueUpdate(props, stageSelector, fieldValue));
    }
  };
  const focusHandler = (fieldName: string, event: React.FocusEvent<HTMLInputElement>) => {
    dispatch(lastAction.getField(fieldName))
  }

  const countryCode = (data:string) => {
    const code = data.indexOf('(+');
    if(code > 0) {
      return data.slice(code)
    } 
    return data;
  }

  return (
    <>
      <div className="phone">
        <label htmlFor={props.data.logical_field_name}>
          {props.data.rwb_label_name}
        </label>
        <div className={`phone__container ${props.data.editable ? 'disabled' : ''}`}>
          {lovData &&
            lovData.map((res: any, index: any) => {
              return (
                <div key={index}>
                  <span className="phone__flag"></span> {countryCode(res.CODE_DESC)}
                  <span className="vertical-line"></span>
                </div>
              );
            })}
          <input
            // type={props.data.type}
            type="text"
            name={props.data.logical_field_name}
            id={fieldIdAppend(props)}
            placeholder={props.data.rwb_label_name}
            value={defaultValue}
            minLength={props.data.min_length}
            maxLength={props.data.length}
            pattern={props.data.regex}
            onChange={changeHandler.bind(this, props.data.logical_field_name)}
            onKeyPress={(event) =>
              allowOnlyCharacter(event, props.data.logical_field_name)
            }
            onBlur={bindHandler.bind(this, props.data.logical_field_name)}
            disabled={props.data.editable}
            onFocus={focusHandler.bind(this, props.data.logical_field_name)}
          />
        </div>
        {error && (
        <span className="error-msg">
           {error}
        </span>
      )}
      </div>
    </>
  );
};

export default Phone;
