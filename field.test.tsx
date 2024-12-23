else if (props?.data?.logical_field_name === "res_room_flat" && (event.target.value)) {
      if (!regexAlphaNumeric.test(event.target.value)) {
        setError(`${language === CONSTANTS.LANG_EN ? errorMsg.roomRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.roomRequiredSplChar_CN : errorMsg.roomRequiredSplChar_HK}`);
        return
      }
    }

    else if (props?.data?.logical_field_name === "res_floor" && (event.target.value)) {
      if (!regexAlphaNumeric.test(event.target.value)) {
        setError(`${language === CONSTANTS.LANG_EN ? errorMsg.floorRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.floorRequiredSplChar_CN : errorMsg.floorRequiredSplChar_HK}`);
        return
      }
    }

    else if (props?.data?.logical_field_name === "res_block" && (event.target.value)) {
      if (!regexAlphaNumeric.test(event.target.value)) {
        setError(`${language === CONSTANTS.LANG_EN ? errorMsg.blockRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.blockRequiredSplChar_CN : errorMsg.blockRequiredSplChar_HK}`);
        return
      }
    }


const handleValidation = (logicalFieldName: string, value: string) => {
  const fieldErrorMessages: { [key: string]: { [key: string]: string } } = {
    res_room_flat: {
      [CONSTANTS.LANG_EN]: errorMsg.roomRequiredSplChar,
      [CONSTANTS.LANG_CN]: errorMsg.roomRequiredSplChar_CN,
      [CONSTANTS.LANG_HK]: errorMsg.roomRequiredSplChar_HK,
    },
    res_floor: {
      [CONSTANTS.LANG_EN]: errorMsg.floorRequiredSplChar,
      [CONSTANTS.LANG_CN]: errorMsg.floorRequiredSplChar_CN,
      [CONSTANTS.LANG_HK]: errorMsg.floorRequiredSplChar_HK,
    },
    res_block: {
      [CONSTANTS.LANG_EN]: errorMsg.blockRequiredSplChar,
      [CONSTANTS.LANG_CN]: errorMsg.blockRequiredSplChar_CN,
      [CONSTANTS.LANG_HK]: errorMsg.blockRequiredSplChar_HK,
    },
  };

  // Fields and values
  const roomValue = userInputSelector.applicants[0].res_room_flat || "";
  const floorValue = userInputSelector.applicants[0].res_floor || "";
  const blockValue = userInputSelector.applicants[0].res_block || "";

  // If the current field is invalid
  if (!regexAlphaNumeric.test(value)) {
    setError(fieldErrorMessages[logicalFieldName]?.[language] || "Invalid input");
    return;
  }

  // Validation logic for all three fields
  if (roomValue && floorValue && blockValue) {
    // All fields filled, clear errors
    setError("");
  } else if (roomValue || floorValue || blockValue) {
    // At least one field filled, remove errors from others
    if (logicalFieldName === "res_room_flat") {
      setError("");
    } else if (logicalFieldName === "res_floor") {
      setError("");
    } else if (logicalFieldName === "res_block") {
      setError("");
    }
  } else {
    // All fields empty, throw error for all
    setError(fieldErrorMessages[logicalFieldName]?.[language] || "Field is required");
  }
};

// Usage
if (props?.data?.logical_field_name && event.target.value) {
  handleValidation(props.data.logical_field_name, event.target.value);
}




else if (props?.data?.logical_field_name === "res_room_flat" && (event.target.value)) {
  if (!regexAlphaNumeric.test(event.target.value)) {
    setError(`${language === CONSTANTS.LANG_EN ? errorMsg.roomRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.roomRequiredSplChar_CN : errorMsg.roomRequiredSplChar_HK}`);
    return;
  } else {
    // Clear error for other fields when this one is filled
    setError("");
  }
}

else if (props?.data?.logical_field_name === "res_floor" && (event.target.value)) {
  if (!regexAlphaNumeric.test(event.target.value)) {
    setError(`${language === CONSTANTS.LANG_EN ? errorMsg.floorRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.floorRequiredSplChar_CN : errorMsg.floorRequiredSplChar_HK}`);
    return;
  } else {
    // Clear error for other fields when this one is filled
    setError("");
  }
}

else if (props?.data?.logical_field_name === "res_block" && (event.target.value)) {
  if (!regexAlphaNumeric.test(event.target.value)) {
    setError(`${language === CONSTANTS.LANG_EN ? errorMsg.blockRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.blockRequiredSplChar_CN : errorMsg.blockRequiredSplChar_HK}`);
    return;
  } else {
    // Clear error for other fields when this one is filled
    setError("");
  }
}

// If all fields are empty
if (
  !userInputSelector.applicants[0].res_room_flat &&
  !userInputSelector.applicants[0].res_floor &&
  !userInputSelector.applicants[0].res_block
) {
  setError(`${language === CONSTANTS.LANG_EN ? "All fields are required" : "All fields are required in the selected language"}`);
}



const validateFields = () => {
  const logicalFieldName = props?.data?.logical_field_name;
  const fieldValue = event.target.value;

  if (!fieldValue) {
    if (logicalFieldName === "res_room_flat") {
      setError(
        `${language === CONSTANTS.LANG_EN ? errorMsg.roomRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.roomRequiredSplChar_CN : errorMsg.roomRequiredSplChar_HK}`
      );
    }
    return;
  }

  // Validations for each field
  let roomValid = regexAlphaNumeric.test(fieldValue) && logicalFieldName === "res_room_flat";
  let floorValid = regexAlphaNumeric.test(fieldValue) && logicalFieldName === "res_floor";
  let blockValid = regexAlphaNumeric.test(fieldValue) && logicalFieldName === "res_block";

  // If any of the fields is valid, clear the error
  if (roomValid || floorValid || blockValid) {
    setError('');
    return;
  }

  // Display error for invalid input
  if (logicalFieldName === "res_room_flat") {
    setError(
      `${language === CONSTANTS.LANG_EN ? errorMsg.roomRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.roomRequiredSplChar_CN : errorMsg.roomRequiredSplChar_HK}`
    );
  } else if (logicalFieldName === "res_floor") {
    setError(
      `${language === CONSTANTS.LANG_EN ? errorMsg.floorRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.floorRequiredSplChar_CN : errorMsg.floorRequiredSplChar_HK}`
    );
  } else if (logicalFieldName === "res_block") {
    setError(
      `${language === CONSTANTS.LANG_EN ? errorMsg.blockRequiredSplChar : language === CONSTANTS.LANG_CN ? errorMsg.blockRequiredSplChar_CN : errorMsg.blockRequiredSplChar_HK}`
    );
  }
};
