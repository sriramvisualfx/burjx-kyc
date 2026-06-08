import { KycApplication, KycStep, validateSteps } from "../utils/validation";
import { KycAction, KycActionType } from "./kycAction";
import {
  KycConflict,
  isEditableRemote,
  getCurrentStepForApplication,
} from "./kycDomain";

const stepsOrder: KycStep[] = [
  "personal_info",
  "address",
  "document",
  "review",
  "status",
];
function updateApplication(
  state: KycState,
  updater: (application: KycApplication) => KycApplication,
): KycState {
  const application = updater(state.application ?? createInitialApp());
  return {
    ...state,
    application,
    currentStep: isEditableRemote(application.status)
      ? state.currentStep
      : getCurrentStepForApplication(application),
    syncDraft: true,
    error: null,
  };
}
function getNextStep(currentStep: KycStep): KycStep {
  const currentIndex = stepsOrder.indexOf(currentStep);
  return stepsOrder[currentIndex + 1];
}

function getPrevStep(currentStep: KycStep): KycStep {
  const currentIndex = stepsOrder.indexOf(currentStep);
  return stepsOrder[currentIndex - 1];
}

function createInitialApp(): KycApplication {
  return {
    id: crypto.randomUUID(),
    status: "not_started",
    currentStep: "personal_info",
    updatedAt: new Date().toISOString(),
  };
}

export interface KycState {
  application: KycApplication | null;
  currentStep: KycStep;
  isLoading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  isPolling: boolean;
  error: string | null;
  conflict: KycConflict | null;
  syncDraft: boolean;
}

export const initialState: KycState = {
  currentStep: "personal_info",
  application: null,
  isLoading: true,
  isSaving: false,
  isSubmitting: false,
  isPolling: false,
  error: null,
  conflict: null,
  syncDraft: false,
};

export function kycReducer(state: KycState, action: KycActionType): KycState {
  switch (action.type) {
    case KycAction.LOAD_LOCAL_DRAFT:
    case KycAction.RESUME_DRAFT:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case KycAction.LOAD_SUCCESS:
      return {
        ...state,
        currentStep: action.data.currentStep,
        application: action.data.application,
        isLoading: false,
        isSaving: false,
        isSubmitting: false,
        isPolling: action.data.application.status === "submitted",
        syncDraft: action.data.syncDraft,
        conflict: action.data.conflict,
        error: null,
      };
    case KycAction.RESTART_APPLICATION:
      return {
        ...initialState,
        isLoading: false,
        application: createInitialApp(),
      };
    case KycAction.SET_STATE:
      return {
        ...state,
        currentStep: action.data,
      };
    case KycAction.SET_ERROR:
      return {
        ...state,
        error: action.data,
        isLoading: false,
        isSaving: false,
        isSubmitting: false,
      };
    case KycAction.SET_POLLING:
      return {
        ...state,
        isPolling: action.data,
      };
    case KycAction.SET_LOADING:
      return {
        ...state,
        isLoading: action.data,
      };
    case KycAction.SET_REQUIRED_FIELDS:
      if (!state.application) return state;
      return {
        ...state,
        application: {
          ...state.application,
          requiredFields: action.data,
          updatedAt: new Date().toISOString(),
        },
      };
    case KycAction.SAVE_SUCCESS:
      return {
        ...state,
        application: action.data,
        currentStep: isEditableRemote(action.data.status)
          ? action.data.currentStep
          : getCurrentStepForApplication(action.data),
        isSaving: false,
        syncDraft: false,
        error: null,
      };
    case KycAction.SET_STATE:
      if (!state.application) return state;
      return {
        ...state,
        currentStep: action.data,
        application: {
          ...state.application,
          currentStep: action.data,
          updatedAt: new Date().toISOString(),
          requiredFields: undefined,
        },
        syncDraft: true,
      };
    case KycAction.SAVE_PERSONAL_INFO:
      return updateApplication(state, (application) => ({
        ...application,
        status:
          application.status === "not_started" ? "draft" : application.status,
        personalInfo: action.data,
        requiredFields: undefined,
        updatedAt: new Date().toISOString(),
      }));
    case KycAction.SAVE_ADDRESS_INFO:
      return updateApplication(state, (application) => ({
        ...application,
        status:
          application.status === "not_started" ? "draft" : application.status,
        address: action.data,
        requiredFields: undefined,
        updatedAt: new Date().toISOString(),
      }));
    case KycAction.SAVE_DOCUMENT_INFO:
      return updateApplication(state, (application) => ({
        ...application,
        status:
          application.status === "not_started" ? "draft" : application.status,
        document: action.data,
        requiredFields: undefined,
        updatedAt: new Date().toISOString(),
      }));
    case KycAction.NEXT_STEP:
      const nextStep = getNextStep(state.currentStep);
      if (state.application && state.currentStep !== "review") {
        const errors = validateSteps(state.currentStep, state.application);
        if (errors.length > 0) {
          return {
            ...state,
            application: {
              ...state.application,
              requiredFields: errors,
              updatedAt: new Date().toISOString(),
            },
          };
        }
      }
      if (!state.application) return state;
      return {
        ...state,
        currentStep: nextStep,
        application: {
          ...state.application,
          currentStep: nextStep,
          requiredFields: undefined,
          updatedAt: new Date().toISOString(),
        },
        syncDraft: true,
      };
    case KycAction.PREV_STEP:
      if(!state.application) return state;
      return {
        ...state,
        currentStep: getPrevStep(state.currentStep),
        application: {
          ...state.application,
          currentStep: getPrevStep(state.currentStep),
          requiredFields: undefined,
          updatedAt: new Date().toISOString(),
        },
        syncDraft: true,
      }
    case KycAction.SUBMIT_SUCCESS:
      return {
        ...state,
        application: action.data,
        isLoading: false,
        isSaving: false,
        isSubmitting: false,
        error: null,
        conflict: null,
      };
    default:
      return state;
  }
}
