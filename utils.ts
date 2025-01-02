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






import rulesUtils from '../rulesUtils'; // Update path as necessary
import { FieldsetModel, KeyWithAnyModel } from '../../utils/model/common-model';

describe('rulesUtils Function', () => {
    const mockValidationObj = {
        nonEditable: [
            ['logical_field_1', 'logical_field_2']
        ]
    };

    const mockProps: Array<FieldsetModel> = [
        {
            fields: [
                { logical_field_name: 'logical_field_1', value: 'value1' },
                { logical_field_name: 'logical_field_2', value: 'value2' },
                { logical_field_name: 'office_phone_number', value: '12345' },
                { logical_field_name: 'place_of_birth', value: 'USA' },
                { logical_field_name: 'monthly_installment_mortgage_payment', value: '1000' },
            ]
        }
    ];

    it('should set "editable" to true for nonEditable fields', () => {
        const result = rulesUtils(mockProps, mockValidationObj);
        expect(result.fields[0].editable).toBe(true); // logical_field_1
        expect(result.fields[1].editable).toBe(true); // logical_field_2
    });

    it('should set default_visibility to null for default_visibility_no_field', () => {
        const result = rulesUtils(mockProps, mockValidationObj);
        const field = result.fields.find(
            (field) => field.logical_field_name === 'monthly_installment_mortgage_payment'
        );
        expect(field.default_visibility).toBeNull();
    });

    it('should set mandatory to "Yes" for mandatoryField', () => {
        const result = rulesUtils(mockProps, mockValidationObj);
        const field = result.fields.find(
            (field) => field.logical_field_name === 'office_phone_number'
        );
        expect(field.mandatory).toBe('Yes');
    });

    it('should set default_visibility to "No" for hiddenFields', () => {
        const result = rulesUtils(mockProps, mockValidationObj);
        const field = result.fields.find(
            (field) => field.logical_field_name === 'place_of_birth'
        );
        expect(field.default_visibility).toBe('No');
    });

    it('should filter out fields with default_visibility set to "No"', () => {
        const result = rulesUtils(mockProps, mockValidationObj);
        const filteredFields = result.fields.filter(
            (field) => field.default_visibility === 'No'
        );
        expect(filteredFields.length).toBe(0); // No fields with default_visibility='No'
    });

    it('should return updated fields array with correct modifications', () => {
        const result = rulesUtils(mockProps, mockValidationObj);
        expect(result).toEqual([
            {
                fields: [
                    { logical_field_name: 'logical_field_1', value: 'value1', editable: true },
                    { logical_field_name: 'logical_field_2', value: 'value2', editable: true },
                    { logical_field_name: 'office_phone_number', value: '12345', mandatory: 'Yes' },
                    { logical_field_name: 'monthly_installment_mortgage_payment', value: '1000', default_visibility: null, mandatory: 'Yes' },
                ]
            }
        ]);
    });
});









import rulesUtils from '../rulesUtils'; // Update path as necessary
import { FieldsetModel, KeyWithAnyModel } from '../../utils/model/common-model';

describe('rulesUtils Function', () => {
    const mockValidationObj = {
        nonEditable: [
            ['logical_field_1', 'logical_field_2']
        ]
    };

    const mockProps: Array<Array<FieldsetModel>> = [
        [
            {
                fields: [
                    { logical_field_name: 'logical_field_1', value: 'value1' },
                    { logical_field_name: 'logical_field_2', value: 'value2' },
                    { logical_field_name: 'office_phone_number', value: '12345' },
                    { logical_field_name: 'place_of_birth', value: 'USA' },
                    { logical_field_name: 'monthly_installment_mortgage_payment', value: '1000' },
                ]
            }
        ]
    ];

    it('should set "editable" to true for nonEditable fields', () => {
        const result = rulesUtils(mockProps, mockValidationObj);
        expect(result[0].fields[0].editable).toBe(true); // logical_field_1
        expect(result[0].fields[1].editable).toBe(true); // logical_field_2
    });

    it('should set default_visibility to null for default_visibility_no_field', () => {
        const result = rulesUtils(mockProps, mockValidationObj);
        const field = result[0].fields.find(
            (field) => field.logical_field_name === 'monthly_installment_mortgage_payment'
        );
        expect(field.default_visibility).toBeNull();
    });

    it('should set mandatory to "Yes" for mandatoryField', () => {
        const result = rulesUtils(mockProps, mockValidationObj);
        const field = result[0].fields.find(
            (field) => field.logical_field_name === 'office_phone_number'
        );
        expect(field.mandatory).toBe('Yes');
    });

    it('should set default_visibility to "No" for hiddenFields', () => {
        const result = rulesUtils(mockProps, mockValidationObj);
        const field = result[0].fields.find(
            (field) => field.logical_field_name === 'place_of_birth'
        );
        expect(field.default_visibility).toBe('No');
    });

    it('should filter out fields with default_visibility set to "No"', () => {
        const result = rulesUtils(mockProps, mockValidationObj);
        const filteredFields = result[0].fields.filter(
            (field) => field.default_visibility === 'No'
        );
        expect(filteredFields.length).toBe(0); // No fields with default_visibility='No'
    });

    it('should return updated fields array with correct modifications', () => {
        const result = rulesUtils(mockProps, mockValidationObj);
        expect(result).toEqual([
            {
                fields: [
                    { logical_field_name: 'logical_field_1', value: 'value1', editable: true },
                    { logical_field_name: 'logical_field_2', value: 'value2', editable: true },
                    { logical_field_name: 'office_phone_number', value: '12345', mandatory: 'Yes' },
                    { logical_field_name: 'monthly_installment_mortgage_payment', value: '1000', default_visibility: null, mandatory: 'Yes' },
                ]
            }
        ]);
    });
});
