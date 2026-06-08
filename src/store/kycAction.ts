import { KycApplication, KycRequiredField, KycStep } from "../utils/validation";
import { KycConflict } from "./kycDomain";

export const KycAction = {
    SET_STATE: "SET_STATE",
    SET_REQUIRED_FIELDS: "SET_REQUIRED_FIELDS",
    NEXT_STEP: "NEXT_STEP",
    PREV_STEP: "PREV_STEP",
    SAVE_PERSONAL_INFO: "SAVE_PERSONAL_INFO",
    SAVE_ADDRESS_INFO: "SAVE_ADDRESS_INFO",
    SAVE_DOCUMENT_INFO: "SAVE_DOCUMENT_INFO",
    LOAD_LOCAL_DRAFT: "LOAD_LOCAL_DRAFT",
    LOAD_SUCCESS: "LOAD_SUCCESS",
    SAVE_SUCCESS: "SAVE_SUCCESS",
    SUBMIT_SUCCESS: "SUBMIT_SUCCESS",
    SET_POLLING: "SET_POLLING",
    SET_ERROR: "SET_ERROR",
    SET_LOADING: "SET_LOADING",
    RESUME_DRAFT: "RESUME_DRAFT",
    RESTART_APPLICATION: "RESTART_APPLICATION",
} as const;

export type KycActionType = 
    | { type: typeof KycAction.SET_STATE; data: KycStep }
    | { type: typeof KycAction.SET_REQUIRED_FIELDS; data: KycRequiredField[] | undefined }
    | { type: typeof KycAction.NEXT_STEP }
    | { type: typeof KycAction.PREV_STEP }
    | { type: typeof KycAction.SAVE_PERSONAL_INFO; data: NonNullable<KycApplication["personalInfo"]> }
    | { type: typeof KycAction.SAVE_ADDRESS_INFO; data: NonNullable<KycApplication["address"]> }
    | { type: typeof KycAction.SAVE_DOCUMENT_INFO; data: NonNullable<KycApplication["document"]> }
    | { type: typeof KycAction.LOAD_LOCAL_DRAFT }
    | { type: typeof KycAction.LOAD_SUCCESS; data: {
        application: KycApplication;
        currentStep: KycStep;
        conflict: KycConflict | null;
        syncDraft: boolean;
    }}
    | { type: typeof KycAction.SAVE_SUCCESS; data: KycApplication }
    | { type: typeof KycAction.SUBMIT_SUCCESS; data: KycApplication }
    | { type: typeof KycAction.SET_POLLING; data: boolean }
    | { type: typeof KycAction.SET_ERROR; data: string }
    | { type: typeof KycAction.SET_LOADING; data: boolean }
    | { type: typeof KycAction.RESUME_DRAFT; }
    | { type: typeof KycAction.RESTART_APPLICATION; };