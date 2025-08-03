class TabPatternCloser {
  constructor() {
    this.matchingTabs = [];
    this.currentTabId = null;
    this.previewTimeout = null;
    this.initializeElements();
    this.attachEventListeners();
    this.getCurrentTab();
  }

  initializeElements() {
    this.patternInput = document.getElementById('pattern');
    this.matchTypeSelect = document.getElementById('matchType');
    this.caseSensitiveCheckbox = document.getElementById('caseSensitive');
    this.useRegexCheckbox = document.getElementById('useRegex');
    this.previewBtn = document.getElementById('previewBtn');
    this.closeBtn = document.getElementById('closeBtn');
    this.previewSection = document.getElementById('preview');
    this.previewContent = document.getElementById('previewContent');
  }

  attachEventListeners() {
    this.previewBtn.addEventListener('click', () => this.previewMatches());
    this.closeBtn.addEventListener('click', () => this.closeTabs());

    // Enable preview on Enter key
    this.patternInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.previewMatches();
      }
    });

    // Live preview with debouncing
    this.patternInput.addEventListener('input', () => this.debouncedPreview());
    this.matchTypeSelect.addEventListener('change', () => this.debouncedPreview());
    this.caseSensitiveCheckbox.addEventListener('change', () => this.debouncedPreview());
    this.useRegexCheckbox.addEventListener('change', () => this.debouncedPreview());
  }

  async getCurrentTab() {
    try {
      const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
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
      const allTabs = await browser.tabs.query({});

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

    let matcher;

    if (useRegex) {
      try {
        const flags = caseSensitive ? 'g' : 'gi';
        matcher = new RegExp(pattern, flags);
      } catch (error) {
        throw new Error('Invalid regex pattern: ' + error.message);
      }
    } else {
      // Simple string matching
      const searchPattern = caseSensitive ? pattern : pattern.toLowerCase();
      matcher = (text) => {
        const searchText = caseSensitive ? text : text.toLowerCase();
        return searchText.includes(searchPattern);
      };
    }

    return tabs.filter(tab => {
      // Don't close the current tab
      if (tab.id === this.currentTabId) {
        return false;
      }

      let shouldMatch = false;

      if (matchType === 'url' || matchType === 'both') {
        if (useRegex) {
          shouldMatch = shouldMatch || matcher.test(tab.url);
        } else {
          shouldMatch = shouldMatch || matcher(tab.url);
        }
      }

      if (matchType === 'title' || matchType === 'both') {
        if (useRegex) {
          shouldMatch = shouldMatch || matcher.test(tab.title);
        } else {
          shouldMatch = shouldMatch || matcher(tab.title);
        }
      }

      return shouldMatch;
    });
  }

  displayPreview() {
    this.previewContent.innerHTML = '';

    if (this.matchingTabs.length === 0) {
      this.previewContent.innerHTML = '<div class="no-matches">No matching tabs found</div>';
      this.closeBtn.disabled = true;
    } else {
      const countDiv = document.createElement('div');
      countDiv.innerHTML = `<strong>Found <span class="count">${this.matchingTabs.length}</span> matching tabs:</strong>`;
      this.previewContent.appendChild(countDiv);

      this.matchingTabs.forEach(tab => {
        const tabDiv = document.createElement('div');
        tabDiv.className = 'preview-tab';
        tabDiv.innerHTML = `
          <div class="tab-title">${this.escapeHtml(tab.title)}</div>
          <div class="tab-url">${this.escapeHtml(tab.url)}</div>
        `;
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
      await browser.tabs.remove(tabIds);

      // Close the popup after successful operation
      window.close();

    } catch (error) {
      console.error('Error closing tabs:', error);
      this.showError('Error closing tabs: ' + error.message);
    }
  }

  showError(message) {
    this.previewContent.innerHTML = `<div style="color: red; font-weight: bold;">${this.escapeHtml(message)}</div>`;
    this.previewSection.style.display = 'block';
    this.closeBtn.disabled = true;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TabPatternCloser();
});
