// External library imports
import { test as base } from '@playwright/test';

// Framework utility imports
import { UserPool } from '@utils/redis/user.pool';

// Type imports
import type { UserCredential } from '@core/interfaces';

/**
 * @fileoverview User Fixture - Automated user management for parallel test execution
 * @description Provides automatic user allocation and cleanup with Redis-based user pool
 * @author Anand Sogalad
 * @example import { test } from '@fixtures/user.fixture';
 */

/**
 * Extended Playwright test with automatic user management.
 *
 * This fixture automatically:
 * - Allocates a unique test user from the user pool
 * - Provides the user to your test
 * - Returns the user to the pool after test completion
 * - Handles cleanup even if tests fail
 *
 * @description Playwright test extended with automatic user allocation and cleanup
 * @example
 * ```typescript
 * import { test } from '@fixtures/user.fixture';
 *
 * test('Login test', async ({ user, page }) => {
 *   await page.goto('/login');
 *   await page.fill('#email', user.email);
 *   await page.fill('#password', user.password);
 * });
 * ```
 */
export const test = base.extend<{ user: UserCredential }>({
  /**
   * User fixture that provides automatic user management for tests.
   *
   * @param use - Playwright's fixture use function
   * @param testInfo - Test execution information including worker index and test title
   * @returns Promise that resolves after user allocation, test execution, and cleanup
   */
  user: async ({}, use, testInfo) => {
    let user: UserCredential | null = null;

    try {
      // Get user using LPOP with static method
      user = await UserPool.getUser();

      console.log(`[Worker ${testInfo.workerIndex}] [${testInfo.title}] - allocated user: ${user?.email}`);

      // Provide user to test
      await use(user!);
    } finally {
      // Return user using RPUSH with static method
      if (user) {
        try {
          await UserPool.returnUser(user);
          console.log(`[Worker ${testInfo.workerIndex}] [${testInfo.title}] - returned user: ${user.email}`);
        } catch (error) {
          console.error(
            `[Worker ${testInfo.workerIndex}] [${testInfo.title}] - failed to return user ${user.email}:`,
            error
          );
        }
      }
    }
  },
});
