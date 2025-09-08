/**
 * @fileoverview Locator Enums - ARIA roles and element states for locator strategies
 * @description Element location and state enums for Playwright locator methods
 * @author Anand Sogalad
 */

/**
 * Supported ARIA roles.
 * @description ARIA roles for Playwright's getByRole method
 */
export enum LocatorRole {
  ALERT = 'alert',
  ALERT_DIALOG = 'alertdialog',
  APPLICATION = 'application',
  ARTICLE = 'article',
  BANNER = 'banner',
  BLOCKQUOTE = 'blockquote',
  BUTTON = 'button',
  CAPTION = 'caption',
  CELL = 'cell',
  CHECKBOX = 'checkbox',
  CODE = 'code',
  COLUMN_HEADER = 'columnheader',
  COMBOBOX = 'combobox',
  COMPLEMENTARY = 'complementary',
  CONTENT_INFO = 'contentinfo',
  DEFINITION = 'definition',
  DELETION = 'deletion',
  DIALOG = 'dialog',
  DIRECTORY = 'directory',
  DOCUMENT = 'document',
  EMPHASIS = 'emphasis',
  FEED = 'feed',
  FIGURE = 'figure',
  FORM = 'form',
  GENERIC = 'generic',
  GRID = 'grid',
  GRID_CELL = 'gridcell',
  GROUP = 'group',
  HEADING = 'heading',
  IMG = 'img',
  INSERTION = 'insertion',
  LINK = 'link',
  LIST = 'list',
  LISTBOX = 'listbox',
  LIST_ITEM = 'listitem',
  LOG = 'log',
  MAIN = 'main',
  MARQUEE = 'marquee',
  MATH = 'math',
  MENU = 'menu',
  MENU_BAR = 'menubar',
  MENU_ITEM = 'menuitem',
  MENU_ITEM_CHECKBOX = 'menuitemcheckbox',
  MENU_ITEM_RADIO = 'menuitemradio',
  METER = 'meter',
  NAVIGATION = 'navigation',
  NONE = 'none',
  NOTE = 'note',
  OPTION = 'option',
  PRESENTATION = 'presentation',
  PROGRESSBAR = 'progressbar',
  RADIO = 'radio',
  RADIO_GROUP = 'radiogroup',
  REGION = 'region',
  ROW = 'row',
  ROW_GROUP = 'rowgroup',
  ROW_HEADER = 'rowheader',
  SCROLLBAR = 'scrollbar',
  SEARCH = 'search',
  SEARCH_BOX = 'searchbox',
  SEPARATOR = 'separator',
  SLIDER = 'slider',
  SPINBUTTON = 'spinbutton',
  STATUS = 'status',
  STRONG = 'strong',
  SUBSCRIPT = 'subscript',
  SUPERSCRIPT = 'superscript',
  SWITCH = 'switch',
  TAB = 'tab',
  TABLE = 'table',
  TABLIST = 'tablist',
  TABPANEL = 'tabpanel',
  TERM = 'term',
  TEXTBOX = 'textbox',
  TIME = 'time',
  TIMER = 'timer',
  TOOLBAR = 'toolbar',
  TOOLTIP = 'tooltip',
  TREE = 'tree',
  TREEGRID = 'treegrid',
  TREEITEM = 'treeitem',
}

/**
 * Navigation wait states.
 * @description Supported waitUntil states for navigation and load events
 */
export enum WaitUntil {
  LOAD = 'load',
  DOMCONTENTLOADED = 'domcontentloaded',
  NETWORKIDLE = 'networkidle',
  COMMIT = 'commit',
}

/**
 * Element wait states.
 * @description Supported element states for Playwright's locator.waitFor() method
 */
export enum WaitState {
  ATTACHED = 'attached',
  DETACHED = 'detached',
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
}
