return await dispatch(await preserveRequest(patchUserInputOnPayload(), currentStageFields ,isExit)).then((response:any)=>{
        return Promise.resolve(response);
       }).catch((err: any) => {
        return Promise.reject(err);
      });


appData.applicationdata.application.notification_required = true;
          appData.applicationdata.application.is_save_to_pega = 'Yes';
