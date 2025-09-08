import { APIRequestContext, request } from '@playwright/test';
import { AuthApi } from '@integrations/auth.api';
import { env } from '@utils/env';

export async function getUshurTokenFromApi(): Promise<{ token: string, account: string }> {
  // Use environment variables instead of hardcoded test account
  const email = env.email;
  const password = env.password;

  if (!email || !password) {
    throw new Error('USHUR_USER_EMAIL and USHUR_USER_PASSWORD environment variables must be set');
  }

  const reqContext: APIRequestContext = await request.newContext();
  const authApi = new AuthApi(reqContext);

  const res = await authApi.login({ email, password, forceLogin: false });

  if (res.status() !== 200) throw new Error(`Login failed for ${email}`);
  
  const json = await res.json();
  
  // Check if the response indicates authentication failure
  if (json.status === 'failure') {
    throw new Error(`Authentication failed: ${json.infoText || 'Invalid credentials'}`);
  }
  
  const token = json.token || json.data?.token || json.tokenId;

  if (!token) throw new Error('Token not found in response');
  return { token, account: email };
}
