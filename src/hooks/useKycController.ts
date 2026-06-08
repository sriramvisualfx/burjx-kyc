import { useCallback, useEffect, useMemo, useReducer } from "react";
import { KycAction } from "../store/kycAction";
import { initialState, kycReducer } from "../store/kycReducer";
import { createEmptyApplication } from "../store/kycDomain";
import {
  EditableKycStep,
  KycApplication,
  KycStep,
  getFirstInvalidStep,
  getNextStep,
  getPreviousStep,
} from "../utils/validation";
import {
  clearKycStorage,
  loadLocalDraft,
  loadRemoteRecord,
  saveLocalDraft,
  saveRemoteRecord,
} from "../storage/kycStorage";
import {
  pollFakeKycApplication,
  submitFakeKycApplication,
} from "../services/fakeKycService";

const MAX_POLL_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 1200;

export function hasRemainingPollAttempts(
  attempts: number,
  maxAttempts = MAX_POLL_ATTEMPTS,
): boolean {
  return attempts < maxAttempts;
}

export function useKycController() {
  const [state, dispatch] = useReducer(kycReducer, initialState);

  const hydrate = useCallback(async () => {
    dispatch({ type: KycAction.HYDRATE_START });

    try {
      const [localDraft, remoteRecord] = await Promise.all([
        loadLocalDraft(),
        loadRemoteRecord(),
      ]);

      dispatch({
        type: KycAction.HYDRATE_SUCCESS,
        data: {
          localDraft,
          remoteApplication: remoteRecord?.application ?? null,
        },
      });
    } catch {
      dispatch({
        type: KycAction.SUBMIT_FAILURE,
        data: "We could not restore the saved KYC state.",
      });
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (state.isHydrating) {
      return;
    }

    void saveLocalDraft(state.localDraft);
  }, [state.isHydrating, state.localDraft]);

  const saveStep = useCallback(
    (
      step: EditableKycStep,
      value:
        | NonNullable<KycApplication["personalInfo"]>
        | NonNullable<KycApplication["address"]>
        | NonNullable<KycApplication["document"]>,
    ) => {
      if (step === "personal_info") {
        dispatch({
          type: KycAction.SAVE_PERSONAL_INFO,
          data: value as NonNullable<KycApplication["personalInfo"]>,
        });
        return;
      }

      if (step === "address") {
        dispatch({
          type: KycAction.SAVE_ADDRESS_INFO,
          data: value as NonNullable<KycApplication["address"]>,
        });
        return;
      }

      dispatch({
        type: KycAction.SAVE_DOCUMENT_INFO,
        data: value as NonNullable<KycApplication["document"]>,
      });
    },
    [],
  );

  const goToStep = useCallback((step: KycStep) => {
    dispatch({ type: KycAction.SET_STEP, data: step });
  }, []);

  const goNext = useCallback(() => {
    dispatch({ type: KycAction.CLEAR_ERROR });
    dispatch({ type: KycAction.SET_STEP, data: getNextStep(state.currentStep) });
  }, [state.currentStep]);

  const goBack = useCallback(() => {
    dispatch({
      type: KycAction.SET_STEP,
      data: getPreviousStep(state.currentStep),
    });
  }, [state.currentStep]);

  const submit = useCallback(async () => {
    const firstInvalid = getFirstInvalidStep(state.activeApplication);
    if (firstInvalid) {
      dispatch({
        type: KycAction.SET_REQUIRED_FIELDS,
        data: firstInvalid.fields,
      });
      dispatch({ type: KycAction.SET_STEP, data: firstInvalid.step });
      return;
    }

    dispatch({ type: KycAction.CLEAR_REQUIRED_FIELDS });
    dispatch({ type: KycAction.SUBMIT_START });

    try {
      const remoteApplication = await submitFakeKycApplication(
        state.activeApplication,
      );
      dispatch({ type: KycAction.SUBMIT_SUCCESS, data: remoteApplication });
    } catch (error) {
      dispatch({
        type: KycAction.SUBMIT_FAILURE,
        data:
          error instanceof Error
            ? error.message
            : "The fake KYC service could not submit the application.",
      });
    }
  }, [state.activeApplication]);

  const pollStatus = useCallback(async () => {
    if (!state.remoteApplication) {
      return;
    }

    if (!hasRemainingPollAttempts(state.pollAttempts)) {
      dispatch({
        type: KycAction.POLL_FAILURE,
        data: "Status polling timed out. Retry to check the fake service again.",
      });
      return;
    }

    dispatch({ type: KycAction.SET_POLL_ATTEMPTS, data: state.pollAttempts + 1 });
    dispatch({ type: KycAction.POLL_START });

    try {
      const remoteApplication = await pollFakeKycApplication(
        state.remoteApplication.id,
      );
      dispatch({ type: KycAction.POLL_SUCCESS, data: remoteApplication });
    } catch (error) {
      dispatch({
        type: KycAction.POLL_FAILURE,
        data:
          error instanceof Error
            ? error.message
            : "The fake KYC service could not provide a status update.",
      });
    }
  }, [state.pollAttempts, state.remoteApplication]);

  useEffect(() => {
    if (state.remoteApplication?.status !== "submitted") {
      return;
    }
    if (state.error || !hasRemainingPollAttempts(state.pollAttempts)) {
      return;
    }

    const timeout = setTimeout(() => {
      void pollStatus();
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timeout);
  }, [pollStatus, state.error, state.pollAttempts, state.remoteApplication?.status]);

  const retryStatusCheck = useCallback(async () => {
    dispatch({ type: KycAction.CLEAR_ERROR });
    await pollStatus();
  }, [pollStatus]);

  const restart = useCallback(async () => {
    await clearKycStorage();
    await saveRemoteRecord(null);
    dispatch({
      type: KycAction.RESTART_APPLICATION,
      data: createEmptyApplication(),
    });
  }, []);

  const actions = useMemo(
    () => ({
      saveStep,
      goToStep,
      goNext,
      goBack,
      submit,
      retryStatusCheck,
      restart,
    }),
    [goBack, goNext, goToStep, restart, retryStatusCheck, saveStep, submit],
  );

  return { state, actions, maxPollAttempts: MAX_POLL_ATTEMPTS };
}
