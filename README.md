# Tab Pattern Closer

A Chrome/Firefox extension to close all tabs matching a URL or title pattern.

## Installation

1. Create a new directory for the extension
2. Save all the files (`manifest.json`, `popup.html`, `popup.js`) in that directory
3. Open Firefox and go to `about:debugging`
4. Click "This Firefox" in the left sidebar
5. Click "Load Temporary Add-on"
6. Navigate to your extension directory and select `manifest.json`

The extension will be loaded and you'll see a new icon in the toolbar.

## Usage

1. Click the extension icon to open the popup
2. Enter a pattern to match (e.g., "reddit.com", "Stack Overflow")
3. Choose where to match:
   - **URL**: Match against the tab's URL
   - **Title**: Match against the tab's title
   - **URL or Title**: Match in either field
4. Optional settings:
   - **Case sensitive**: Make matching case-sensitive
   - **Use regex pattern**: Treat the pattern as a regular expression
5. The preview updates automatically as you type
6. Review the list and click **Close Tabs** to proceed

## Features

- **Safe**: Never closes your current active tab
- **Live preview**: See matching tabs update automatically as you type
- **Flexible matching**: Match by URL, title, or both
- **Regex support**: Use regular expressions for complex patterns
- **Case sensitivity**: Optional case-sensitive matching

## Examples

- Close all Reddit tabs: `reddit.com`
- Close all YouTube tabs: `youtube.com`
- Close all tabs with "documentation" in title: Set match to "Title", enter `documentation`
- Close all GitHub issue tabs (regex): Enable regex, enter `github\.com/.+/issues/`

## Files

- `manifest.json`: Extension configuration and permissions
- `popup.html`: User interface layout
- `popup.js`: Core functionality and tab management logic

## Notes

- This is loaded as a temporary extension and will be removed when Firefox restarts
- To make it permanent, you'd need to package and sign it through Mozilla's process
- The extension requires the `tabs` permission to query and close tabs
