// Chrome/Firefox compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

class TabPatternCloser {
  constructor() {
    this.matchingTabs = [];
    this.currentTabId = null;
    this.previewTimeout = null;
    this.initializeElements();
    this.attachEventListeners();
    this.getCurrentTab();
    this.patternInput.focus();
  }

  initializeElements() {
    this.patternInput = document.getElementById('pattern');
    this.matchTypeSelect = document.getElementById('matchType');
    this.caseSensitiveCheckbox = document.getElementById('caseSensitive');
    this.useRegexCheckbox = document.getElementById('useRegex');
    this.closeBtn = document.getElementById('closeBtn');
    this.previewSection = document.getElementById('preview');
    this.previewContent = document.getElementById('previewContent');
  }

  attachEventListeners() {
    this.closeBtn.addEventListener('click', () => this.closeTabs());

    // Live preview with debouncing
    this.patternInput.addEventListener('input', () => this.debouncedPreview());
    this.matchTypeSelect.addEventListener('change', () => this.debouncedPreview());
    this.caseSensitiveCheckbox.addEventListener('change', () => this.debouncedPreview());
    this.useRegexCheckbox.addEventListener('change', () => this.debouncedPreview());

    // Add Enter key listener for closing tabs
    this.patternInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.closeBtn.disabled) {
        this.closeTabs();
      }
    });
  }

  async getCurrentTab() {
    try {
      const [currentTab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
      this.currentTabId = currentTab.id;
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
  }

  resetPreview() {
    this.previewSection.style.display = 'none';
    this.closeBtn.disabled = true;
    this.matchingTabs = [];
  }

  debouncedPreview() {
    // Clear any existing timeout
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
    }

    // Reset preview immediately for visual feedback
    this.resetPreview();

    // Set new timeout for preview update
    this.previewTimeout = setTimeout(() => {
      const pattern = this.patternInput.value.trim();
      if (pattern) {
        this.previewMatches();
      }
    }, 200); // 200ms delay after user stops typing
  }

  async previewMatches() {
    const pattern = this.patternInput.value.trim();

    if (!pattern) {
      this.showError('Please enter a pattern to match');
      return;
    }

    try {
      // Get all tabs
      const allTabs = await browserAPI.tabs.query({});

      // Filter tabs based on pattern and options
      this.matchingTabs = this.filterTabs(allTabs, pattern);

      // Display preview
      this.displayPreview();

    } catch (error) {
      console.error('Error previewing matches:', error);
      this.showError('Error searching tabs: ' + error.message);
    }
  }

  filterTabs(tabs, pattern) {
    const matchType = this.matchTypeSelect.value;
    const caseSensitive = this.caseSensitiveCheckbox.checked;
    const useRegex = this.useRegexCheckbox.checked;

    const createMatcher = () => {
      if (useRegex) {
        try {
          const flags = caseSensitive ? 'g' : 'gi';
          return new RegExp(pattern, flags);
        } catch (error) {
          throw new Error('Invalid regex pattern: ' + error.message);
        }
      } else {
        const searchPattern = caseSensitive ? pattern : pattern.toLowerCase();
        return (text) => {
          const searchText = caseSensitive ? text : text.toLowerCase();
          return searchText.includes(searchPattern);
        };
      }
    };

    const matcher = createMatcher();

    return tabs.filter(tab => {
      if (tab.id === this.currentTabId) {
        return false;
      }

      const check = (text) => useRegex ? matcher.test(text) : matcher(text);

      if (matchType === 'url' && check(tab.url)) return true;
      if (matchType === 'title' && check(tab.title)) return true;
      if (matchType === 'both' && (check(tab.url) || check(tab.title))) return true;

      return false;
    });
  }

  displayPreview() {
    // Clear previous preview content
    this.previewContent.textContent = '';

    if (this.matchingTabs.length === 0) {
      const noMatchesDiv = document.createElement('div');
      noMatchesDiv.className = 'no-matches';
      noMatchesDiv.textContent = 'No matching tabs found';
      this.previewContent.appendChild(noMatchesDiv);
      this.closeBtn.disabled = true;
    } else {
      const countDiv = document.createElement('div');
      const strongTag = document.createElement('strong');
      strongTag.textContent = 'Found ';

      const countSpan = document.createElement('span');
      countSpan.className = 'count';
      countSpan.textContent = this.matchingTabs.length;

      strongTag.appendChild(countSpan);
      strongTag.append(' matching tabs:'); // Append text node

      countDiv.appendChild(strongTag);
      this.previewContent.appendChild(countDiv);

      this.matchingTabs.forEach(tab => {
        const tabDiv = document.createElement('div');
        tabDiv.className = 'preview-tab';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'tab-title';
        titleDiv.textContent = tab.title;

        const urlDiv = document.createElement('div');
        urlDiv.className = 'tab-url';
        urlDiv.textContent = tab.url;

        tabDiv.appendChild(titleDiv);
        tabDiv.appendChild(urlDiv);
        this.previewContent.appendChild(tabDiv);
      });

      this.closeBtn.disabled = false;
    }

    this.previewSection.style.display = 'block';
  }

  async closeTabs() {
    if (this.matchingTabs.length === 0) {
      return;
    }

    try {
      const tabIds = this.matchingTabs.map(tab => tab.id);
      await browserAPI.tabs.remove(tabIds);

      // Reset the UI instead of closing the window
      this.patternInput.value = '';
      this.resetPreview();
      this.patternInput.focus();

    } catch (error) {
      console.error('Error closing tabs:', error);
      this.showError('Error closing tabs: ' + error.message);
    }
  }

  showError(message) {
    // Clear previous preview content
    this.previewContent.textContent = '';

    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.style.fontWeight = 'bold';
    errorDiv.textContent = message;

    this.previewContent.appendChild(errorDiv);
    this.previewSection.style.display = 'block';
    this.closeBtn.disabled = true;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TabPatternCloser();
});
