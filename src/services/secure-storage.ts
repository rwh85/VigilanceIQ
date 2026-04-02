import * as SecureStore from 'expo-secure-store';
import { ModelParameters, GROUP_AVERAGE_PARAMS } from '../models/types';

export async function saveUserParameters(params: ModelParameters): Promise<void> {
  await SecureStore.setItemAsync('userParameters', JSON.stringify(params));
}

export async function loadUserParameters(): Promise<ModelParameters> {
  const stored = await SecureStore.getItemAsync('userParameters');
  if (!stored) return GROUP_AVERAGE_PARAMS;
  try {
    return JSON.parse(stored) as ModelParameters;
  } catch {
    return GROUP_AVERAGE_PARAMS;
  }
}

export async function clearUserParameters(): Promise<void> {
  await SecureStore.deleteItemAsync('userParameters');
}
