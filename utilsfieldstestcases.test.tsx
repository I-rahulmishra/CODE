import {
  stageFields,
  stageSelectFields,
  userInputPayload,
  submitRequest,
  fieldGroupingFunc,
  compareStageRequest,
} from "./fields.utils";
import { stagesAction } from "../../../utils/store/stages-slice";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { errorAction } from "../../../utils/store/error-slice";
import { CONSTANTS } from "../../../utils/common/constants";
import { StageDetails, ValueSelectModel } from "../../../utils/model/common-model";

// Mock dependencies
jest.mock("../../../utils/store/stages-slice", () => ({
  stagesAction: {
    updateStageFields: jest.fn(),
    resetCurrentStage: jest.fn(),
    updateStageId: jest.fn(),
  },
}));
jest.mock("../../../utils/store/field-error-slice", () => ({
  fieldErrorAction: {
    getMandatoryFields: jest.fn(),
    getFieldError: jest.fn(),
  },
}));
jest.mock("../../../utils/store/error-slice", () => ({
  errorAction: {
    getRetryStatus: jest.fn(),
  },
}));
jest.mock("../../../services/common-service", () => ({
  postRequest: jest.fn(),
  preserveRequest: jest.fn(),
  getLovData: jest.fn(),
}));
jest.mock("../../../utils/common/change.utils", () => ({
  FindIndex: jest.fn(),
}));

describe("fields.utils", () => {
  describe("stageFields", () => {
    const mockStageSelector = [
      {
        stageInfo: {
          fieldMetaData: {
            data: {
              stages: [
                {
                  fields: [
                    { field_set_name: "set1", rwb_category: "cat1" },
                    { field_set_name: "set2", rwb_category: "cat2" },
                  ],
                },
              ],
            },
          },
          application: {},
        },
        stageId: "bd-1",
      },
    ];

    it("should return empty fields if stageSelector is empty", () => {
      const result = stageFields([], "bd-1");
      expect(result).toEqual({ fields: undefined });
    });

    it("should return filtered fields for valid stageSelector", () => {
      const result = stageFields(mockStageSelector, "bd-1");
      expect(result).toHaveProperty("fields");
    });

    it("should apply rules based on stageId (e.g., bd-2)", () => {
      const result = stageFields(mockStageSelector, "bd-2");
      expect(result).toHaveProperty("fields");
    });
  });

  describe("stageSelectFields", () => {
    const mockStageSelector: StageDetails[] = [
      {
        stageId:"bd-1",
        stageInfo: {
          fieldMetaData: {
            data: {
              stages: [
                {
                  fields: [
                    { field_set_name: "set1" },
                    { field_set_name: "set2" }
                  ],
                },
              ],
            },
          },
          applicants: [{}],
          application:{}
        },
      },
    ];

    it("should return empty fields for empty stageSelector", () => {
      const result = stageSelectFields([], "bd-1");
      expect(result).toEqual({ fields: undefined });
    });

    it("should process and return fields for valid stageSelector", () => {
      const result = stageSelectFields(mockStageSelector, "bd-1");
      expect(result).toHaveProperty("fields");
    });
  });

  describe("userInputPayload", () => {
    const mockDispatch = jest.fn();
    const mockApplicantsSelector = { field1: "value1" };
    const mockStageSelector: StageDetails[] = [
      {
        stageId:"bd-1",
        stageInfo: {
          fieldMetaData: {
            data: {
              stages: [
                {
                  fields: [
                    { field_set_name: "set1" },
                    { field_set_name: "set2" }
                  ],
                },
              ],
            },
          },
          applicants: [{}],
          application:{}
        },
      },
    ];

    it("should dispatch updateStageFields with updated payload", () => {
      const mockDispatch = jest.fn();
      const mockApplicantsSelector = {field1: "value1"};
      const action = userInputPayload(mockApplicantsSelector, mockStageSelector);
      action(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith(
        stagesAction.updateStageFields({
          stageInfo: {
            applicants: [{ field1_a_1: "value1" }],
          },
        })
      );
    });
  });

  describe("submitRequest", () => {
    const mockDispatch = jest.fn();
    const mockApplicantsSelector = { field1: "value1" };
    const mockStageSelector: StageDetails = {
      stageId: "bd-1",
      stageInfo: {
        // applicants: [{}],
        fieldMetaData: {
          data: {
            stages: [
              {
                fields: [
                  { logical_field_name: "field1", component_type: "type1" },
                  { logical_field_name: "field2", component_type: "type2" },
                ],
              },
            ],
          },
        },
        applicants:[{}],
        application:{},
      },
    };
    const mockValueSelector: ValueSelectModel ={ 
      changesUpdate:{
        changes:true,
        lastStageId:"bd-1",
      },
      value:null,

    }
    const mockLovSelector = {};
    const mockUserInputSelector = { applicants: [{}] };

    it("should dispatch preserveRequest when isPreserveCall is true", async () => {
      const action = submitRequest(
        mockApplicantsSelector,
        mockStageSelector ,
        mockValueSelector,
        mockLovSelector,
        "journey",
        mockUserInputSelector,
        {},
        {},
        true
      );
      await action(mockDispatch);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it("should dispatch postRequest when isPreserveCall is false", async () => {
      const action = submitRequest(
        mockApplicantsSelector,
        mockStageSelector,
        mockValueSelector,
        mockLovSelector,
        "journey",
        mockUserInputSelector,
        {},
        {},
        false
      );
      await action(mockDispatch);

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe("fieldGroupingFunc", () => {
    it("should add items to an existing field group", () => {
      const prev = [{ field_set_name: "set1", fields: [] }];
      fieldGroupingFunc(0, prev, "set1", { item: "value" });

      expect(prev[0].fields).toEqual([{ item: "value" }]);
    });

    it("should create a new field group if not existing", () => {
      const prev = [] as any;
      fieldGroupingFunc(-1, prev, "set2", { item: "value" });

      expect(prev).toEqual([{ field_set_name: "set2", fields: [{ item: "value" }] }]);
    });
  });

  describe("compareStageRequest", () => {
    const mockStageSelectorApplicants = { field1: "value1", field2: "value2" };
    const mockUserInputSelectorApplicants = { field1: "value1", field2: "value3" };

    it("should return false if fields differ", () => {
      const result = compareStageRequest(
        mockStageSelectorApplicants,
        mockUserInputSelectorApplicants
      );
      expect(result).toBe(false);
    });

    it("should return true if fields match", () => {
      const result = compareStageRequest(
        mockStageSelectorApplicants,
        { ...mockStageSelectorApplicants }
      );
      expect(result).toBe(true);
    });
  });
});




























To maximize test coverage for the utility functions in the fields.utils module, we need to test all edge cases, branches, and scenarios for each function. Here's how you can improve your test cases and increase the coverage:

Steps to Maximize Coverage

1. Test All Conditional Branches
Ensure every if, else, and switch statement is tested.


2. Test Edge Cases
Provide inputs with unexpected or extreme values to see how functions behave.


3. Test Error Scenarios
Mock errors for asynchronous functions and verify error handling.


4. Test Default Behaviors
Check what happens when optional parameters or undefined inputs are passed.


5. Increase Mock Verification
Validate the number of times mocks are called and with what arguments.



Additional Tests

Below is an enhanced version of test cases for better coverage:


---

stageFields

it("should handle missing fieldMetaData gracefully", () => {
  const invalidStageSelector = [
    { stageId: "bd-1", stageInfo: {} },
  ];
  const result = stageFields(invalidStageSelector, "bd-1");
  expect(result).toEqual({ fields: undefined });
});

it("should return undefined fields for an unmatched stageId", () => {
  const result = stageFields(mockStageSelector, "invalid-id");
  expect(result).toEqual({ fields: undefined });
});


---

stageSelectFields

it("should handle empty stages gracefully", () => {
  const mockStageSelector = [
    { stageId: "bd-1", stageInfo: { fieldMetaData: { data: { stages: [] } } } },
  ];
  const result = stageSelectFields(mockStageSelector, "bd-1");
  expect(result).toEqual({ fields: undefined });
});

it("should handle missing fieldMetaData", () => {
  const mockStageSelector = [{ stageId: "bd-1", stageInfo: {} }];
  const result = stageSelectFields(mockStageSelector, "bd-1");
  expect(result).toEqual({ fields: undefined });
});


---

userInputPayload

it("should dispatch resetCurrentStage if applicantsSelector is empty", () => {
  const mockDispatch = jest.fn();
  const emptyApplicantsSelector = {};
  const action = userInputPayload(emptyApplicantsSelector, mockStageSelector);
  action(mockDispatch);

  expect(mockDispatch).toHaveBeenCalledWith(stagesAction.resetCurrentStage());
});

it("should handle missing applicants in stageSelector", () => {
  const mockStageSelector = [{ stageId: "bd-1", stageInfo: {} }];
  const mockDispatch = jest.fn();
  const action = userInputPayload(mockApplicantsSelector, mockStageSelector);
  action(mockDispatch);

  expect(mockDispatch).not.toHaveBeenCalledWith(stagesAction.updateStageFields());
});


---

submitRequest

it("should handle missing stageId in valueSelector gracefully", async () => {
  const invalidValueSelector = { changesUpdate: { changes: true } };
  const action = submitRequest(
    mockApplicantsSelector,
    mockStageSelector,
    invalidValueSelector,
    mockLovSelector,
    "journey",
    mockUserInputSelector,
    {},
    {},
    false
  );
  await action(mockDispatch);

  expect(mockDispatch).not.toHaveBeenCalled();
});


---

fieldGroupingFunc

it("should not modify prev if index is invalid and no field_set_name", () => {
  const prev = [];
  fieldGroupingFunc(-1, prev, undefined, { item: "value" });

  expect(prev).toEqual([]);
});


---

compareStageRequest

it("should return true if both inputs are empty", () => {
  const result = compareStageRequest({}, {});
  expect(result).toBe(true);
});

it("should return false for mismatched nested objects", () => {
  const mockStageSelectorApplicants = { field1: { subfield: "value1" } };
  const mockUserInputSelectorApplicants = { field1: { subfield: "value2" } };

  const result = compareStageRequest(
    mockStageSelectorApplicants,
    mockUserInputSelectorApplicants
  );
  expect(result).toBe(false);
});


---

Suggestions to Boost Coverage

1. Use Code Coverage Reports:
Run tests with coverage flags (jest --coverage) to identify untested lines.


2. Refactor for Testability:
If some logic isn't testable, consider refactoring the code for better separation of concerns.


3. Mock All Dependencies:
Ensure all dependencies are properly mocked, especially for asynchronous operations.



Implement these additional cases and recheck the coverage report; it should approach 90–100%. Let me know if you need help with specific areas!

