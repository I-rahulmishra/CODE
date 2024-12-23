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
