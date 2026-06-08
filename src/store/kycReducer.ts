import { KycAction, KycActionType } from "./kycAction";
import {
  KycConflict,
  applyStepFields,
  createEmptyApplication,
  resolveKycView,
} from "./kycDomain";
import { KycApplication, KycRequiredField, KycStep } from "../utils/validation";

export interface KycState {
  isHydrating: boolean;
  isSubmitting: boolean;
  isPolling: boolean;
  error: string | null;
  pollAttempts: number;
  localDraft: KycApplication | null;
  remoteApplication: KycApplication | null;
  activeApplication: KycApplication;
  currentStep: KycStep;
  conflict: KycConflict | null;
}

function withResolvedState(
  state: KycState,
  localDraft: KycApplication | null,
  remoteApplication: KycApplication | null,
): KycState {
  return {
    ...state,
    localDraft,
    remoteApplication,
    ...resolveKycView(localDraft, remoteApplication),
  };
}

function setRequiredFields(
  application: KycApplication | null,
  fields: KycRequiredField[] | undefined,
): KycApplication | null {
  if (!application) {
    return application;
  }

  return {
    ...application,
    requiredFields: fields,
    updatedAt: new Date().toISOString(),
  };
}

export const initialState: KycState = {
  isHydrating: true,
  isSubmitting: false,
  isPolling: false,
  error: null,
  pollAttempts: 0,
  localDraft: null,
  remoteApplication: null,
  activeApplication: createEmptyApplication(),
  currentStep: "personal_info",
  conflict: null,
};

export function kycReducer(state: KycState, action: KycActionType): KycState {
  switch (action.type) {
    case KycAction.HYDRATE_START:
      return {
        ...state,
        isHydrating: true,
        error: null,
      };

    case KycAction.HYDRATE_SUCCESS:
      return {
        ...withResolvedState(
          state,
          action.data.localDraft,
          action.data.remoteApplication,
        ),
        isHydrating: false,
        isPolling: action.data.remoteApplication?.status === "submitted",
        error: null,
      };

    case KycAction.SAVE_PERSONAL_INFO: {
      const base = state.localDraft ?? state.activeApplication;
      return withResolvedState(
        {
          ...state,
          error: null,
        },
        applyStepFields(base, "personal_info", action.data, undefined),
        state.remoteApplication,
      );
    }

    case KycAction.SAVE_ADDRESS_INFO: {
      const base = state.localDraft ?? state.activeApplication;
      return withResolvedState(
        {
          ...state,
          error: null,
        },
        applyStepFields(base, "address", action.data, undefined),
        state.remoteApplication,
      );
    }

    case KycAction.SAVE_DOCUMENT_INFO: {
      const base = state.localDraft ?? state.activeApplication;
      return withResolvedState(
        {
          ...state,
          error: null,
        },
        applyStepFields(base, "document", action.data, undefined),
        state.remoteApplication,
      );
    }

    case KycAction.SET_STEP: {
      const draft = state.localDraft ?? state.activeApplication;
      return withResolvedState(
        {
          ...state,
          error: null,
        },
        {
          ...draft,
          currentStep: action.data,
          updatedAt: new Date().toISOString(),
        },
        state.remoteApplication,
      );
    }

    case KycAction.SET_REQUIRED_FIELDS:
      return withResolvedState(
        {
          ...state,
          error: null,
        },
        setRequiredFields(state.localDraft, action.data),
        setRequiredFields(state.remoteApplication, action.data),
      );

    case KycAction.CLEAR_REQUIRED_FIELDS:
      return withResolvedState(
        {
          ...state,
          error: null,
        },
        setRequiredFields(state.localDraft, undefined),
        setRequiredFields(state.remoteApplication, undefined),
      );

    case KycAction.SUBMIT_START:
      return {
        ...state,
        isSubmitting: true,
        error: null,
      };

    case KycAction.SUBMIT_SUCCESS:
      return {
        ...withResolvedState(state, action.data, action.data),
        isSubmitting: false,
        isPolling: action.data.status === "submitted",
        pollAttempts: 0,
        error: null,
      };

    case KycAction.SUBMIT_FAILURE:
      return {
        ...state,
        isSubmitting: false,
        isPolling: false,
        error: action.data,
      };

    case KycAction.POLL_START:
      return {
        ...state,
        isPolling: true,
        error: null,
      };

    case KycAction.POLL_SUCCESS:
      return {
        ...withResolvedState(state, state.localDraft, action.data),
        isPolling: action.data.status === "submitted",
        isSubmitting: false,
        error: null,
      };

    case KycAction.POLL_FAILURE:
      return {
        ...state,
        isPolling: false,
        error: action.data,
      };

    case KycAction.SET_POLL_ATTEMPTS:
      return {
        ...state,
        pollAttempts: action.data,
      };

    case KycAction.RESTART_APPLICATION:
      return {
        ...initialState,
        isHydrating: false,
        localDraft: action.data,
        activeApplication: action.data,
        currentStep: action.data.currentStep,
      };

    case KycAction.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}
