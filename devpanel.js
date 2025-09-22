// devpanel.js - for repo: https://github.com/phern007-tech/Notes
(function () {
  'use strict';

  // Prevent duplicate initialization
  if (document.getElementById('devtools-panel')) return;

  // Inject CSS directly (no external file)
  const injectCSS = () => {
    const style = document.createElement('style');
    style.textContent = `
.devtools-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 30%;
  height: 100vh;
  background: #2d2d2d;
  color: #e0e0e0;
  font-family: 'Consolas', 'Menlo', 'Monaco', monospace;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0,0,0,0.5);
  resize: horizontal;
  min-width: 250px;
  max-width: 80%;
  overflow: hidden;
}

.devtools-panel.light-theme {
  background: #f5f5f5;
  color: #333;
}

.tab-bar-container {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #444;
}

.light-theme .tab-bar-container {
  border-bottom: 1px solid #ccc;
}

.tab-bar {
  display: flex;
  background: #3c3c3c;
  padding: 0 4px;
  gap: 2px;
  min-height: 32px;
  align-items: center;
}

.light-theme .tab-bar {
  background: #e0e0e0;
}

.tab {
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
  border-radius: 4px 4px 0 0;
  user-select: none;
  white-space: nowrap;
  position: relative;
}

.tab.active {
  background: #1e1e1e;
  color: white;
}

.light-theme .tab.active {
  background: white;
  color: #333;
  border: 1px solid #ccc;
  border-bottom: none;
}

.tab .close-tab {
  margin-left: 6px;
  opacity: 0.6;
  font-weight: bold;
}

.tab .close-tab:hover {
  opacity: 1;
}

.add-tab-btn {
  padding: 0 8px;
  cursor: pointer;
  color: #aaa;
  font-weight: bold;
}

.add-tab-btn:hover {
  color: white;
}

.light-theme .add-tab-btn:hover {
  color: #333;
}

.panel-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: #1e1e1e;
  display: none;
}

.panel-content.active {
  display: block;
}

.light-theme .panel-content {
  background: white;
}

.editable-panel {
  width: 100%;
  height: 100%;
  background: transparent;
  color: inherit;
  border: none;
  outline: none;
  resize: none;
  font: inherit;
  padding: 0;
}

.theme-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 16px;
}

.theme-toggle:hover {
  color: white;
}

.light-theme .theme-toggle:hover {
  color: #333;
}
    `;
    document.head.appendChild(style);
  };

  // Create main panel
  const createPanel = () => {
    const panel = document.createElement('div');
    panel.id = 'devtools-panel';
    panel.className = 'devtools-panel';
    panel.innerHTML = `
      <button class="theme-toggle" title="Toggle Theme">🌓</button>

      <!-- TOP SECTION -->
      <div class="tab-section" data-section="top">
        <div class="tab-bar-container">
          <div class="tab-bar" data-type="top"></div>
        </div>
        <div class="panels-container">
          <!-- Panels will be injected here -->
        </div>
      </div>

      <!-- BOTTOM SECTION -->
      <div class="tab-section" data-section="bottom">
        <div class="tab-bar-container">
          <div class="tab-bar" data-type="bottom"></div>
        </div>
        <div class="panels-container">
          <!-- Panels will be injected here -->
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    return panel;
  };

  // State management
  const state = {
    topTabs: [{ id: 'elements', title: 'Elements', content: '// Start typing...' }],
    bottomTabs: [{ id: 'computed', title: 'Computed', content: '// Sub-panel content...' }],
    activeTopTab: 'elements',
    activeBottomTab: 'computed',
    maxTabs: 5,
    isDark: true
  };

  // Render tabs and panels for a section
  const renderSection = (sectionType) => {
    const section = document.querySelector(`.tab-section[data-section="${sectionType}"]`);
    const tabBar = section.querySelector('.tab-bar');
    const panelsContainer = section.querySelector('.panels-container');

    const tabs = sectionType === 'top' ? state.topTabs : state.bottomTabs;
    const activeTabId = sectionType === 'top' ? state.activeTopTab : state.activeBottomTab;

    // Clear current
    tabBar.innerHTML = '';
    panelsContainer.innerHTML = '';

    // Add tabs
    tabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.className = `tab ${tab.id === activeTabId ? 'active' : ''}`;
      tabEl.dataset.id = tab.id;
      tabEl.innerHTML = `
        <span class="tab-title" contenteditable="false">${escapeHTML(tab.title)}</span>
        <span class="close-tab" onclick="event.stopPropagation();">×</span>
      `;
      tabBar.appendChild(tabEl);

      // Panel
      const panelEl = document.createElement('div');
      panelEl.className = `panel-content ${tab.id === activeTabId ? 'active' : ''}`;
      panelEl.dataset.id = tab.id;
      const textarea = document.createElement('textarea');
      textarea.className = 'editable-panel';
      textarea.value = tab.content;
      textarea.addEventListener('input', (e) => {
        tab.content = e.target.value;
      });
      panelEl.appendChild(textarea);
      panelsContainer.appendChild(panelEl);
    });

    // Add tab button
    const addBtn = document.createElement('div');
    addBtn.className = 'add-tab-btn';
    addBtn.textContent = '+';
    addBtn.title = `Add new ${sectionType} tab`;
    if (tabs.length >= state.maxTabs) {
      addBtn.style.opacity = '0.3';
      addBtn.style.cursor = 'not-allowed';
    } else {
      addBtn.addEventListener('click', () => addTab(sectionType));
    }
    tabBar.appendChild(addBtn);
  };

  // Helper: Escape HTML to prevent XSS in titles
  const escapeHTML = (str) => str.replace(/[&<>"']/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[tag]));

  // Add new tab
  const addTab = (sectionType) => {
    const tabs = sectionType === 'top' ? state.topTabs : state.bottomTabs;
    if (tabs.length >= state.maxTabs) return;

    const newId = `${sectionType}-tab-${Date.now()}`;
    const newTitle = `New Tab ${tabs.length + 1}`;
    tabs.push({ id: newId, title: newTitle, content: '' });

    if (sectionType === 'top') state.activeTopTab = newId;
    else state.activeBottomTab = newId;

    renderAll();
    makeTitlesEditable();
  };

  // Switch active tab
  const switchTab = (sectionType, tabId) => {
    if (sectionType === 'top') state.activeTopTab = tabId;
    else state.activeBottomTab = tabId;
    renderAll();
  };

  // Delete tab
  const deleteTab = (sectionType, tabId) => {
    const tabs = sectionType === 'top' ? state.topTabs : state.bottomTabs;
    const index = tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    // If deleting active tab, activate previous or next
    let newActiveId = null;
    if ((sectionType === 'top' && state.activeTopTab === tabId) ||
        (sectionType === 'bottom' && state.activeBottomTab === tabId)) {

      if (index > 0) newActiveId = tabs[index - 1].id;
      else if (index < tabs.length - 1) newActiveId = tabs[index + 1].id;
    }

    tabs.splice(index, 1);

    if (newActiveId) {
      if (sectionType === 'top') state.activeTopTab = newActiveId;
      else state.activeBottomTab = newActiveId;
    }

    renderAll();
  };

  // Make tab titles editable on double-click
  const makeTitlesEditable = () => {
    document.querySelectorAll('.tab-title').forEach(el => {
      el.removeEventListener('dblclick', handleTitleEdit);
      el.addEventListener('dblclick', handleTitleEdit);
    });
  };

  const handleTitleEdit = (e) => {
    const tabEl = e.target.closest('.tab');
    const sectionType = tabEl.closest('.tab-section').dataset.section;
    const tabId = tabEl.dataset.id;

    const tabs = sectionType === 'top' ? state.topTabs : state.bottomTabs;
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    e.target.contentEditable = true;
    e.target.focus();

    const saveTitle = () => {
      tab.title = e.target.textContent.trim() || 'Untitled';
      e.target.contentEditable = false;
      renderAll(); // Re-render to escape HTML properly
    };

    e.target.addEventListener('blur', saveTitle, { once: true });
    e.target.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        saveTitle();
      } else if (ev.key === 'Escape') {
        e.target.textContent = escapeHTML(tab.title); // revert
        e.target.contentEditable = false;
      }
    }, { once: true });
  };

  // Toggle theme
  const toggleTheme = () => {
    state.isDark = !state.isDark;
    const panel = document.getElementById('devtools-panel');
    if (state.isDark) {
      panel.classList.remove('light-theme');
    } else {
      panel.classList.add('light-theme');
    }
  };

  // Render both sections
  const renderAll = () => {
    renderSection('top');
    renderSection('bottom');
