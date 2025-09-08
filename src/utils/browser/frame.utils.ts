// External library imports
import type { Frame, Locator, Page, Response } from '@playwright/test';

// Core framework imports
import { WaitUntil } from '@core/enums';
import { LocatorUtils } from '@utils/browser';

/**
 * @fileoverview Frame Utilities - Comprehensive iframe and frame management
 * @description Provides advanced frame navigation, content access, and frame hierarchy management
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { FrameUtils, LocatorUtils } from '@utils/browser';
 *
 * const locatorUtils = new LocatorUtils(page);
 * const frameUtils = new FrameUtils(page, locatorUtils);
 *
 * const frame = frameUtils.getFrameByName('payment-frame');
 * const input = frameUtils.getLocatorInFrame(frame, '#card-number');
 * ```
 */

/**
 * Comprehensive frame management utility class.
 *
 * Provides advanced iframe and frame manipulation capabilities including:
 * - Frame location by name, URL, or index
 * - Frame hierarchy navigation (parent/child relationships)
 * - Content access and manipulation within frames
 * - Frame-specific element location strategies
 * - Frame load state monitoring
 * - Cross-frame content evaluation
 *
 * This class handles the complexities of working with nested frames
 * and provides a unified interface for frame operations.
 *
 * @class FrameUtils
 * @example
 * ```typescript
 * import { test } from '@playwright/test';
 * import { FrameUtils, LocatorUtils } from '@utils/browser';
 *
 * test('Frame operations', async ({ page }) => {
 *   const locatorUtils = new LocatorUtils(page);
 *   const frameUtils = new FrameUtils(page, locatorUtils);
 *
 *   // Work with payment iframe
 *   const paymentFrame = frameUtils.getFrameByName('stripe-payment');
 *   await frameUtils.waitForFrameLoad(paymentFrame);
 *
 *   // Find elements within the frame
 *   const cardInput = frameUtils.getLocatorInFrame(paymentFrame, '#card-element');
 *   await cardInput.fill('4242424242424242');
 *
 *   // Navigate frame hierarchy
 *   const childFrames = frameUtils.getChildFrames(paymentFrame);
 *   const mainFrame = frameUtils.getMainFrame();
 * });
 * ```
 */
export class FrameUtils {
  private readonly page: Page;
  private readonly locatorUtils: LocatorUtils;
  /**
   * Creates a new FrameUtils instance.
   *
   * @param {Page} page - The Playwright Page instance for frame operations
   * @param {LocatorUtils} locatorUtils - LocatorUtils instance for element location within frames
   * @example
   * ```typescript
   * import { test } from '@playwright/test';
   * import { FrameUtils, LocatorUtils } from '@utils/browser';
   *
   * test('Create frame utils', async ({ page }) => {
   *   const locatorUtils = new LocatorUtils(page);
   *   const frameUtils = new FrameUtils(page, locatorUtils);
   *   // Use frameUtils for frame operations
   * });
   * ```
   */
  constructor(page: Page, locatorUtils: LocatorUtils) {
    this.page = page;
    this.locatorUtils = locatorUtils;
  }

  /**
   * Helper method to resolve frame selector or frame to a frame object.
   * @param frameSelectorOrFrame - Frame selector object or frame object
   * @returns Promise resolving to frame object or null
   */
  resolveFrame(frameSelectorOrFrame: Parameters<Page['frame']>[0] | Frame): Frame | null {
    if (typeof frameSelectorOrFrame === 'object' && 'locator' in frameSelectorOrFrame) {
      // It's already a Frame object
      return frameSelectorOrFrame;
    }
    // It's a frame selector
    return this.getFrame(frameSelectorOrFrame);
  }

  /**
   * Gets a frame by its name or URL.
   * @param nameOrUrl - Frame name or URL to match.
   * @returns Promise resolving to Frame or null if not found.
   */
  getFrame(frameSelector: Parameters<Page['frame']>[0]): Frame | null {
    return this.page.frame(frameSelector);
  }

  /**
   * Gets a frame by its name.
   * @param name - Frame name to match.
   * @returns Promise resolving to Frame or null if not found.
   */
  getFrameByName(name: string): Frame | null {
    return this.getFrame({ name: name });
  }

  /**
   * Gets a frame by its URL.
   * @param url - Frame URL to match (string or regex).
   * @returns Promise resolving to Frame or null if not found.
   */
  getFrameByUrl(url: string | RegExp | ((url: URL) => boolean)): Frame | null {
    return this.getFrame({ url: url });
  }

  /**
   * Gets all frames in the page.
   * @returns Promise resolving to array of Frame objects.
   */
  getAllFrames(): Array<Frame> {
    return this.page.frames();
  }

  /**
   * Gets the main frame of the page.
   * @returns The main frame.
   */
  getMainFrame(): Frame {
    return this.page.mainFrame();
  }

  /**
   * Gets a frame by its index.
   * @param index - Zero-based frame index.
   * @returns Promise resolving to Frame or null if not found.
   */
  getFrameByIndex(index: number): Frame | null {
    return this.getAllFrames()[index] || null;
  }

  /**
   * Gets a locator within a specific frame.
   * @param frame - The frame to search in.
   * @param selector - The selector string.
   * @param options - Optional locator options.
   * @returns Promise resolving to Locator.
   */
  getLocatorInFrame(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    selector: Parameters<Frame['locator']>[0],
    options?: Parameters<Frame['locator']>[1]
  ): Locator | null {
    return this.resolveFrame(frameOrSelector)?.locator(selector, options) || null;
  }

  /**
   * Gets a locator by text within a specific frame.
   * @param frame - The frame to search in.
   * @param text - The text or RegExp to match.
   * @param options - Optional getByText options.
   * @returns Promise resolving to Locator.
   */
  getLocatorByTextInFrame(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    text: Parameters<Frame['getByText']>[0],
    options?: Parameters<Frame['getByText']>[1]
  ): Locator | null {
    return this.resolveFrame(frameOrSelector)?.getByText(text, options) || null;
  }

  /**
   * Gets a locator by role within a specific frame.
   * @param frame - The frame to search in.
   * @param role - The ARIA role.
   * @param options - Optional getByRole options.
   * @returns Promise resolving to Locator.
   */
  getLocatorByRoleInFrame(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    role: Parameters<Frame['getByRole']>[0],
    options?: Parameters<Frame['getByRole']>[1]
  ): Locator | null {
    return this.resolveFrame(frameOrSelector)?.getByRole(role, options) || null;
  }

  /**
   * Gets a locator by test ID within a specific frame.
   * @param frame - The frame to search in.
   * @param testId - The test ID string or RegExp.
   * @returns Promise resolving to Locator.
   */
  getLocatorByTestIdInFrame(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    testId: Parameters<Frame['getByTestId']>[0]
  ): Locator | null {
    return this.resolveFrame(frameOrSelector)?.getByTestId(testId) || null;
  }

  /**
   * Gets a locator by placeholder within a specific frame.
   * @param frame - The frame to search in.
   * @param text - The placeholder text or RegExp.
   * @param options - Optional getByPlaceholder options.
   * @returns Promise resolving to Locator.
   */
  getLocatorByPlaceholderInFrame(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    text: Parameters<Frame['getByPlaceholder']>[0],
    options?: Parameters<Frame['getByPlaceholder']>[1]
  ): Locator | null {
    return this.resolveFrame(frameOrSelector)?.getByPlaceholder(text, options) || null;
  }

  /**
   * Gets a locator by label within a specific frame.
   * @param frame - The frame to search in.
   * @param text - The label text or RegExp.
   * @param options - Optional getByLabel options.
   * @returns Promise resolving to Locator.
   */
  getLocatorByLabelInFrame(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    text: Parameters<Frame['getByLabel']>[0],
    options?: Parameters<Frame['getByLabel']>[1]
  ): Locator | null {
    return this.resolveFrame(frameOrSelector)?.getByLabel(text, options) || null;
  }

  /**
   * Gets a locator by alt text within a specific frame.
   * @param frame - The frame to search in.
   * @param text - The alt text or RegExp.
   * @param options - Optional getByAltText options.
   * @returns Promise resolving to Locator.
   */
  getLocatorByAltTextInFrame(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    text: Parameters<Frame['getByAltText']>[0],
    options?: Parameters<Frame['getByAltText']>[1]
  ): Locator | null {
    return this.resolveFrame(frameOrSelector)?.getByAltText(text, options) || null;
  }

  /**
   * Gets a locator by title within a specific frame.
   * @param frame - The frame to search in.
   * @param text - The title text or RegExp.
   * @param options - Optional getByTitle options.
   * @returns Promise resolving to Locator.
   */
  getLocatorByTitleInFrame(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    text: Parameters<Frame['getByTitle']>[0],
    options?: Parameters<Frame['getByTitle']>[1]
  ): Locator | null {
    return this.resolveFrame(frameOrSelector)?.getByTitle(text, options) || null;
  }

  /**
   * Navigates a frame to a URL.
   * @param frame - The frame to navigate.
   * @param url - The URL to navigate to.
   * @param options - Optional navigation options.
   * @returns Promise resolving to Response or null.
   */
  async navigateFrame(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    url: Parameters<Frame['goto']>[0],
    options?: Parameters<Frame['goto']>[1]
  ): Promise<null | Response> {
    return (await this.resolveFrame(frameOrSelector)?.goto(url, options)) || null;
  }

  /**
   * Reloads a frame by navigating to its current URL.
   * @param frame - The frame to reload.
   * @param options - Optional navigation options.
   * @returns Promise resolving to Response or null.
   */
  async reloadFrame(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    options?: Parameters<Frame['goto']>[1]
  ): Promise<null | Response> {
    const currentUrl = this.resolveFrame(frameOrSelector)?.url() || '';
    return (await this.resolveFrame(frameOrSelector)?.goto(currentUrl, options)) || null;
  }

  /**
   * Gets the URL of a frame.
   * @param frame - The frame to get URL from.
   * @returns The frame's URL.
   */
  getFrameUrl(frameOrSelector: Frame | Parameters<Page['frame']>[0]): string | null {
    return this.resolveFrame(frameOrSelector)?.url() || null;
  }

  /**
   * Gets the name of a frame.
   * @param frame - The frame to get name from.
   * @returns The frame's name or null.
   */
  getFrameName(frameOrSelector: Frame | Parameters<Page['frame']>[0]): string | null {
    return this.resolveFrame(frameOrSelector)?.name() || null;
  }

  /**
   * Gets the title of a frame.
   * @param frame - The frame to get title from.
   * @returns Promise resolving to the frame's title.
   */
  async getFrameTitle(frameOrSelector: Frame | Parameters<Page['frame']>[0]): Promise<string | null> {
    return this.resolveFrame(frameOrSelector)?.title() || null;
  }

  /**
   * Gets the content of a frame.
   * @param frame - The frame to get content from.
   * @returns Promise resolving to the frame's HTML content.
   */
  async getFrameContent(frameOrSelector: Frame | Parameters<Page['frame']>[0]): Promise<string | null> {
    return this.resolveFrame(frameOrSelector)?.content() || null;
  }

  /**
   * Checks if a frame is detached.
   * @param frame - The frame to check.
   * @returns True if the frame is detached.
   */
  isFrameDetached(frameOrSelector: Frame | Parameters<Page['frame']>[0]): boolean {
    return this.resolveFrame(frameOrSelector)?.isDetached() || false;
  }

  /**
   * Waits for a frame to load.
   * @param frame - The frame to wait for.
   * @param options - Optional wait options.
   */
  async waitForFrameLoad(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    options?: Parameters<Frame['waitForLoadState']>[1]
  ): Promise<void> {
    await this.resolveFrame(frameOrSelector)?.waitForLoadState(WaitUntil.LOAD, options);
  }

  /**
   * Waits for a frame to have DOM content loaded.
   * @param frame - The frame to wait for.
   * @param options - Optional wait options.
   */
  async waitForFrameDomContentLoaded(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    options?: Parameters<Frame['waitForLoadState']>[1]
  ): Promise<void> {
    await this.resolveFrame(frameOrSelector)?.waitForLoadState(WaitUntil.DOMCONTENTLOADED, options);
  }

  /**
   * Waits for a frame to have network idle.
   * @param frame - The frame to wait for.
   * @param options - Optional wait options.
   */
  async waitForFrameNetworkIdle(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    options?: Parameters<Frame['waitForLoadState']>[1]
  ): Promise<void> {
    await this.resolveFrame(frameOrSelector)?.waitForLoadState(WaitUntil.NETWORKIDLE, options);
  }

  /**
   * Waits for a frame to have a specific URL.
   * @param frame - The frame to wait for.
   * @param url - The URL to wait for (string or regex).
   * @param options - Optional wait options.
   */
  async waitForFrameUrl(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    url: Parameters<Frame['waitForURL']>[0],
    options?: Parameters<Frame['waitForURL']>[1]
  ): Promise<void> {
    await this.resolveFrame(frameOrSelector)?.waitForURL(url, options);
  }

  /**
   * Evaluates JavaScript in a frame.
   * @param frame - The frame to evaluate in.
   * @param expression - The JavaScript expression to evaluate.
   * @param arg - Optional argument to pass to the expression.
   * @returns Promise resolving to the evaluation result.
   */
  async evaluateInFrame<T>(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    expression: Parameters<Frame['evaluate']>[0],
    arg?: Parameters<Frame['evaluate']>[1]
  ): Promise<T> {
    return this.resolveFrame(frameOrSelector)?.evaluate(expression, arg) as Promise<T>;
  }

  /**
   * Evaluates JavaScript on an element in a frame.
   * @param frame - The frame containing the element.
   * @param selector - The selector for the element.
   * @param expression - The JavaScript expression to evaluate.
   * @param arg - Optional argument to pass to the expression.
   * @returns Promise resolving to the evaluation result.
   */
  async evaluateOnElementInFrame<T>(
    frameOrSelector: Frame | Parameters<Page['frame']>[0],
    selector: Parameters<Frame['locator']>[0],
    expression: Parameters<Locator['evaluate']>[0],
    arg?: Parameters<Locator['evaluate']>[1]
  ): Promise<T> {
    return this.resolveFrame(frameOrSelector)?.locator(selector)?.evaluate(expression, arg) as Promise<T>;
  }

  /**
   * Gets the bounding box of a frame element.
   * @param frame - The frame to get bounding box from.
   * @returns Promise resolving to the bounding box or null.
   */
  async getFrameBoundingBox(
    frameOrSelector: Frame | Parameters<Page['frame']>[0]
  ): Promise<{ x: number; y: number; width: number; height: number } | null> {
    // Note: Frame doesn't have direct boundingBox method, using frame element
    return this.locatorUtils
      .getLocator(
        `iframe[name="${this.resolveFrame(frameOrSelector)?.name()}"], iframe[src*="${this.resolveFrame(frameOrSelector)?.url()}"]`
      )
      .first()
      .boundingBox();
  }

  /**
   * Checks if a frame is visible.
   * @param frame - The frame to check.
   * @returns Promise resolving to true if the frame is visible.
   */
  async isFrameVisible(frameOrSelector: Frame | Parameters<Page['frame']>[0]): Promise<boolean> {
    const boundingBox = await this.getFrameBoundingBox(frameOrSelector);
    return boundingBox !== null;
  }

  /**
   * Gets the parent frame of a frame.
   * @param frame - The frame to get parent from.
   * @returns The parent frame or null if it's the main frame.
   */
  getParentFrame(frameOrSelector: Frame | Parameters<Page['frame']>[0]): Frame | null {
    return this.resolveFrame(frameOrSelector)?.parentFrame() || null;
  }

  /**
   * Gets all child frames of a frame.
   * @param frame - The frame to get children from.
   * @returns Array of child frames.
   */
  getChildFrames(frameOrSelector: Frame | Parameters<Page['frame']>[0]): Frame[] {
    return this.resolveFrame(frameOrSelector)?.childFrames() || [];
  }

  /**
   * Gets the first child frame of a frame.
   * @param frame - The frame to get first child from.
   * @returns The first child frame or null if no children.
   */
  getFirstChildFrame(frameOrSelector: Frame | Parameters<Page['frame']>[0]): Frame | null {
    const children = this.getChildFrames(frameOrSelector);
    return children.length > 0 ? children[0] : null;
  }

  /**
   * Gets the last child frame of a frame.
   * @param frame - The frame to get last child from.
   * @returns The last child frame or null if no children.
   */
  getLastChildFrame(frameOrSelector: Frame | Parameters<Page['frame']>[0]): Frame | null {
    const children = this.getChildFrames(frameOrSelector);
    return children.length > 0 ? children[children.length - 1] : null;
  }

  /**
   * Gets a child frame by index.
   * @param frame - The parent frame.
   * @param index - The zero-based index of the child frame.
   * @returns The child frame or null if index is out of bounds.
   */
  getChildFrameByIndex(frameOrSelector: Frame | Parameters<Page['frame']>[0], index: number): Frame | null {
    const children = this.getChildFrames(frameOrSelector);
    return children[index] || null;
  }

  /**
   * Gets a child frame by name.
   * @param frame - The parent frame.
   * @param name - The name of the child frame.
   * @returns The child frame or null if not found.
   */
  getChildFrameByName(frameOrSelector: Frame | Parameters<Page['frame']>[0], name: string): Frame | null {
    const children = this.getChildFrames(frameOrSelector);
    return children.find((child) => child.name() === name) || null;
  }

  /**
   * Gets a child frame by URL.
   * @param frame - The parent frame.
   * @param url - The URL of the child frame (string or regex).
   * @returns The child frame or null if not found.
   */
  getChildFrameByUrl(frameOrSelector: Frame | Parameters<Page['frame']>[0], url: string | RegExp): Frame | null {
    const children = this.getChildFrames(frameOrSelector);
    return (
      children.find((child) => {
        const childUrl = child.url();
        if (typeof url === 'string') {
          return childUrl.includes(url);
        } else {
          return url.test(childUrl);
        }
      }) || null
    );
  }

  /**
   * Counts the number of child frames.
   * @param frame - The parent frame.
   * @returns The number of child frames.
   */
  getChildFrameCount(frameOrSelector: Frame | Parameters<Page['frame']>[0]): number {
    return this.getChildFrames(frameOrSelector).length;
  }

  /**
   * Checks if a frame has child frames.
   * @param frame - The frame to check.
   * @returns True if the frame has child frames.
   */
  hasChildFrames(frameOrSelector: Frame | Parameters<Page['frame']>[0]): boolean {
    return this.getChildFrames(frameOrSelector).length > 0;
  }

  /**
   * Gets the depth of a frame in the frame hierarchy.
   * @param frame - The frame to get depth for.
   * @returns The depth of the frame (0 for main frame, 1 for first level children, etc.).
   */
  getFrameDepth(frameSelectorOrFrame: Frame | Parameters<Page['frame']>[0]): number {
    let depth = 0;

    while (this.resolveFrame(frameSelectorOrFrame)?.parentFrame()) {
      depth++;
      frameSelectorOrFrame = this.resolveFrame(frameSelectorOrFrame)?.parentFrame()!;
    }
    return depth;
  }

  /**
   * Gets all frames at a specific depth in the frame hierarchy.
   * @param depth - The depth to get frames from (0 for main frame, 1 for first level children, etc.).
   * @returns Array of frames at the specified depth.
   */
  getFramesAtDepth(depth: number): Frame[] {
    return this.getAllFrames().filter((frame) => this.getFrameDepth(frame) === depth);
  }

  /**
   * Gets the frame hierarchy as a tree structure.
   * @returns Promise resolving to a tree structure of frames.
   */
  getFrameHierarchy(): any[] {
    const buildHierarchy = (frame: Frame): any => {
      return {
        frame,
        name: frame.name(),
        url: frame.url(),
        children: frame.childFrames().map((child) => buildHierarchy(child)),
      };
    };

    const mainFrame = this.getMainFrame();
    return [buildHierarchy(mainFrame)];
  }

  /**
   * Finds a frame by traversing the frame hierarchy.
   * @param predicate - Function to test each frame.
   * @returns Promise resolving to the first matching frame or null.
   */
  findFrame(predicate: (frame: Frame) => boolean): Frame | null {
    return this.getAllFrames().find(predicate) || null;
  }

  /**
   * Finds all frames that match a predicate.
   * @param predicate - Function to test each frame.
   * @returns Promise resolving to array of matching frames.
   */
  findAllFrames(predicate: (frame: Frame) => boolean): Frame[] {
    return this.getAllFrames().filter(predicate);
  }
}
