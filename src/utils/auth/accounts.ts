import { ushurAccounts } from '@configs/user.config';

export function getRandomAccount() {
  const index = Math.floor(Math.random() * ushurAccounts.length);
  return ushurAccounts[index];
}
