return await dispatch(await preserveRequest(patchUserInputOnPayload(), currentStageFields ,isExit)).then((response:any)=>{
        return Promise.resolve(response);
       }).catch((err: any) => {
        return Promise.reject(err);
      });
