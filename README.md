# Tab Pattern Closer

A Chrome/Firefox extension to close all tabs matching a URL or title pattern.

## How to Use

1.  Click the "Tab Pattern Closer" icon in your browser's toolbar.
2.  In the text box, type a pattern you want to match (e.g., `youtube.com` or `Work Document`).
3.  As you type, the extension will show you a live preview of all the tabs that will be closed.
4.  You can refine your search using the following options:
    *   **Match in:** Choose whether to search in the tab's URL, its title, or both.
    *   **Case sensitive:** Make your search pattern case-sensitive.
    *   **Use regex pattern:** Use a powerful regular expression for more complex matching.
5.  When you are happy with the previewed list, click the "Close Tabs" button.

## Features

-   **Live Preview:** See which tabs will be closed before you take action.
-   **Flexible Matching:** Match by URL, title, or both.
-   **Regex Support:** Use regular expressions for advanced matching.
-   **Case-Insensitive by Default:** Matching is case-insensitive unless you specify otherwise.
-   **Safe:** The extension will never close the currently active tab.

## Examples

-   **Close all Reddit tabs:**
    *   Pattern: `reddit.com`
    *   Match in: `URL`
-   **Close all tabs with "documentation" in the title:**
    *   Pattern: `documentation`
    *   Match in: `Title`
-   **Close all GitHub issue tabs using a regular expression:**
    *   Pattern: `github\.com/.+/issues/`
    *   Match in: `URL`
    *   Enable: `Use regex pattern`

## Privacy Policy

This extension runs entirely on your computer. It does not collect, store, or transmit any of your data. All tab information is processed locally and is only used for the purpose of matching and closing tabs.

## Support and Feedback

If you encounter any issues or have suggestions for improvement, please open an issue on the project's GitHub page.
