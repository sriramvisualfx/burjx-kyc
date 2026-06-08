import AsyncStorage from "@react-native-async-storage/async-storage";
import { FakeServiceRecord } from "../services/fakeKycService";
import { KycApplication } from "../utils/validation";

const LOCAL_DRAFT_KEY = "kyc.localDraft.v1";
const REMOTE_RECORD_KEY = "kyc.remoteRecord.v1";

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as T;
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadLocalDraft(): Promise<KycApplication | null> {
  return readJson<KycApplication>(LOCAL_DRAFT_KEY);
}

export async function saveLocalDraft(
  application: KycApplication | null,
): Promise<void> {
  if (!application) {
    await AsyncStorage.removeItem(LOCAL_DRAFT_KEY);
    return;
  }

  await writeJson(LOCAL_DRAFT_KEY, application);
}

export async function loadRemoteRecord(): Promise<FakeServiceRecord | null> {
  return readJson<FakeServiceRecord>(REMOTE_RECORD_KEY);
}

export async function saveRemoteRecord(
  record: FakeServiceRecord | null,
): Promise<void> {
  if (!record) {
    await AsyncStorage.removeItem(REMOTE_RECORD_KEY);
    return;
  }

  await writeJson(REMOTE_RECORD_KEY, record);
}

export async function clearKycStorage(): Promise<void> {
  await AsyncStorage.removeItem(LOCAL_DRAFT_KEY);
  await AsyncStorage.removeItem(REMOTE_RECORD_KEY);
}
