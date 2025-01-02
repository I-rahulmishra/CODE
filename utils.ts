import { FieldsetModel, KeyWithAnyModel } from '../../utils/model/common-model';

const rulesUtils = (props: KeyWithAnyModel, validationObj: any) => {
    const result = props.map((element: Array<FieldsetModel>) => {
        return element && element.map((res: FieldsetModel) => {
            const eFields = res.fields.map((res: KeyWithAnyModel) => {
                return {
                    ...res,
                    editable: validationObj.nonEditable[0] && validationObj.nonEditable[0].includes(res.logical_field_name) ? true : false
                }
            })
            const default_visibility_no_field=[
                "monthly_installment_mortgage_payment",
                "total_outstanding_other_loan_amount",
                "total_outstanding_other_monthly_payment",
                "direct_marketing_opt_out",
                "oth_bank_name",
                "oth_bank_number"
            ]
            const mandatoryField =['office_phone_number','business_est_date',"monthly_installment_mortgage_payment"]
                 eFields.map((subElement: KeyWithAnyModel) =>{
                if(default_visibility_no_field.indexOf(subElement.logical_field_name)>-1){
                    subElement.default_visibility=null;
                }
                if(mandatoryField.indexOf(subElement.logical_field_name)>-1){
                    subElement.mandatory ='Yes';
                }
                const hiddenFields = ["place_of_birth","purpose_of_account","temp_cli_label","enotice_label","credit_limit_extension", "estatement","note_credit","estatement_fee"];
                if(hiddenFields.indexOf(subElement.logical_field_name)>-1){
                    subElement.default_visibility='No';

                }    
            });
            const vFields = eFields.filter((subElement: KeyWithAnyModel) => (subElement.default_visibility !== 'No'));
            return { ...res, fields: vFields }
        })
    })
    return result[0]
}

export default rulesUtils
