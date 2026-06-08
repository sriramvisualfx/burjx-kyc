import { KycApplication, KycStep } from "../utils/validation";

export const KycAction = {
  HYDRATE_START: "HYDRATE_START",
  HYDRATE_SUCCESS: "HYDRATE_SUCCESS",
  SAVE_PERSONAL_INFO: "SAVE_PERSONAL_INFO",
  SAVE_ADDRESS_INFO: "SAVE_ADDRESS_INFO",
  SAVE_DOCUMENT_INFO: "SAVE_DOCUMENT_INFO",
  SET_STEP: "SET_STEP",
  SET_REQUIRED_FIELDS: "SET_REQUIRED_FIELDS",
  CLEAR_REQUIRED_FIELDS: "CLEAR_REQUIRED_FIELDS",
  SUBMIT_START: "SUBMIT_START",
  SUBMIT_SUCCESS: "SUBMIT_SUCCESS",
  SUBMIT_FAILURE: "SUBMIT_FAILURE",
  POLL_START: "POLL_START",
  POLL_SUCCESS: "POLL_SUCCESS",
  POLL_FAILURE: "POLL_FAILURE",
  SET_POLL_ATTEMPTS: "SET_POLL_ATTEMPTS",
  RESTART_APPLICATION: "RESTART_APPLICATION",
  CLEAR_ERROR: "CLEAR_ERROR",
} as const;

export type KycActionType =
  | { type: typeof KycAction.HYDRATE_START }
  | {
      type: typeof KycAction.HYDRATE_SUCCESS;
      data: {
        localDraft: KycApplication | null;
        remoteApplication: KycApplication | null;
      };
    }
  | {
      type: typeof KycAction.SAVE_PERSONAL_INFO;
      data: NonNullable<KycApplication["personalInfo"]>;
    }
  | {
      type: typeof KycAction.SAVE_ADDRESS_INFO;
      data: NonNullable<KycApplication["address"]>;
    }
  | {
      type: typeof KycAction.SAVE_DOCUMENT_INFO;
      data: NonNullable<KycApplication["document"]>;
    }
  | { type: typeof KycAction.SET_STEP; data: KycStep }
  | {
      type: typeof KycAction.SET_REQUIRED_FIELDS;
      data: KycApplication["requiredFields"];
    }
  | { type: typeof KycAction.CLEAR_REQUIRED_FIELDS }
  | { type: typeof KycAction.SUBMIT_START }
  | { type: typeof KycAction.SUBMIT_SUCCESS; data: KycApplication }
  | { type: typeof KycAction.SUBMIT_FAILURE; data: string }
  | { type: typeof KycAction.POLL_START }
  | { type: typeof KycAction.POLL_SUCCESS; data: KycApplication }
  | { type: typeof KycAction.POLL_FAILURE; data: string }
  | { type: typeof KycAction.SET_POLL_ATTEMPTS; data: number }
  | { type: typeof KycAction.RESTART_APPLICATION; data: KycApplication }
  | { type: typeof KycAction.CLEAR_ERROR };
