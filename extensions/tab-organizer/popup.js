document.addEventListener('DOMContentLoaded', function() {
    // Initialize the extension
    refreshTabs();
    setupEventListeners();
  });
  
  function setupEventListeners() {
    // Search functionality
    document.getElementById('search-tabs').addEventListener('input', filterTabs);
    
    // Refresh button
    document.getElementById('refresh-tabs').addEventListener('click', refreshTabs);
    
    // Group/Ungroup buttons
    document.getElementById('group-all').addEventListener('click', groupAllTabs);
    document.getElementById('ungroup-all').addEventListener('click', ungroupAllTabs);
    
    // Category minimize buttons
    document.querySelectorAll('.minimize-button').forEach(button => {
      button.addEventListener('click', toggleCategory);
    });
    
    // Add custom category
    // document.getElementById('add-category').addEventListener('click', addCustomCategory);
  }
  
  function refreshTabs() {
    chrome.tabs.query({}, function(tabs) {
      const categories = {
        work: [],
        entertainment: [],
        sports: [],
        education: [],
        other: []
      };
      
      // Categorize tabs
      tabs.forEach(tab => {
        const category = categorizeTab(tab);
        categories[category].push(tab);
      });
      
      // Update UI for each category
      Object.keys(categories).forEach(category => {
        updateCategoryUI(category, categories[category]);
      });
      
      // Update tab counts
      updateTabCounts();
    });
  }
  
  function categorizeTab(tab) {
    const url = tab.url.toLowerCase();
    const title = tab.title.toLowerCase();
    
    // Work category
    if (/github|gitlab|jira|confluence|slack|teams|linkedin|docs|trello|asana|\.test|\.site/i.test(url)) {
      return 'work';
    }
    
    // Entertainment category
    if (/youtube|netflix|hulu|spotify|twitch|disney|prime|hbo/i.test(url)) {
      return 'entertainment';
    }
    
    // Sports category
    if (/espn|sports|nba|nfl|mlb|fifa|goal|cricket|tennis/i.test(url)) {
      return 'sports';
    }
    
    // Education category
    if (/coursera|udemy|edx|khan|tutorial|learn|course|study|documentation/i.test(url)) {
      return 'education';
    }
    
    // Check custom categories
    const customCategories = document.querySelectorAll('.category[data-custom="true"]');
    for (const category of customCategories) {
      const tags = JSON.parse(category.dataset.tags || '[]');
      if (tags.some(tag => url.includes(tag) || title.includes(tag))) {
        return category.dataset.category;
      }
    }
    
    return 'other';
  }
  
  function updateCategoryUI(category, tabs) {
    const tabList = document.getElementById(`${category}-tabs`);
    if (!tabList) return;
    
    tabList.innerHTML = '';
    
    tabs.forEach(tab => {
      const tabElement = createTabElement(tab);
      tabList.appendChild(tabElement);
    });
  }
  
  function createTabElement(tab) {
    const li = document.createElement('li');
    li.className = 'tab-item';
    
    const favicon = document.createElement('img');
    favicon.className = 'tab-favicon';
    favicon.src = tab.favIconUrl || '';
    favicon.onerror = () => favicon.src = '';
    
    const title = document.createElement('span');
    title.className = 'tab-title';
    title.textContent = tab.title;
    
    li.appendChild(favicon);
    li.appendChild(title);
    
    li.addEventListener('click', () => {
      chrome.tabs.update(tab.id, { active: true });
      chrome.windows.update(tab.windowId, { focused: true });
    });
    
    return li;
  }
  
  function filterTabs() {
    const searchTerm = document.getElementById('search-tabs').value.toLowerCase();
    const tabItems = document.querySelectorAll('.tab-item');
    
    tabItems.forEach(item => {
      const title = item.querySelector('.tab-title').textContent.toLowerCase();
      item.style.display = title.includes(searchTerm) ? '' : 'none';
    });
  }
  
  function toggleCategory(event) {
    const header = event.target.closest('.category-header');
    const category = header.closest('.category');
    const tabList = category.querySelector('.tab-list');
    const button = event.target;
    
    if (tabList.style.display === 'none') {
      tabList.style.display = '';
      button.textContent = '−';
    } else {
      tabList.style.display = 'none';
      button.textContent = '+';
    }
  }
  
  function updateTabCounts() {
    document.querySelectorAll('.category').forEach(category => {
      const count = category.querySelector('.tab-list').children.length;
      category.querySelector('.tab-count').textContent = count;
    });
  }
  
  function groupAllTabs() {
    chrome.tabs.query({}, function(tabs) {
      const categories = {};
      
      // Group tabs by category
      tabs.forEach(tab => {
        const category = categorizeTab(tab);
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(tab.id);
      });
      
      // Create groups for each category
      Object.entries(categories).forEach(([category, tabIds]) => {
        if (tabIds.length > 0) {
          chrome.tabs.group({ tabIds }, function(groupId) {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
              return;
            }
            chrome.tabGroups.update(groupId, {
              collapsed: false,
              title: category.charAt(0).toUpperCase() + category.slice(1),
              color: getCategoryColor(category)
            });
          });
        }
      });
    });
  }
  
  function ungroupAllTabs() {
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(tab => {
        if (tab.groupId !== -1) {
          chrome.tabs.ungroup(tab.id);
        }
      });
    });
  }
  
  function getCategoryColor(category) {
    const colors = {
      work: 'blue',
      entertainment: 'red',
      sports: 'green',
      education: 'yellow',
      other: 'grey'
    };
    return colors[category] || 'grey';
  }
  
  function addCustomCategory() {
    const nameInput = document.getElementById('new-category-name');
    const tagsInput = document.getElementById('new-category-tags');
    
    const name = nameInput.value.trim();
    const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean);
    
    if (!name || tags.length === 0) {
      alert('Please enter both a category name and at least one tag.');
      return;
    }
    
    const categoryId = name.toLowerCase().replace(/\s+/g, '-');
    
    // Create new category element
    const category = document.createElement('div');
    category.className = 'category';
    category.dataset.category = categoryId;
    category.dataset.custom = 'true';
    category.dataset.tags = JSON.stringify(tags);
    
    category.innerHTML = `
      <div class="category-header">
        <h2>${name}</h2>
        <span class="tab-count">0</span>
        <button class="minimize-button">−</button>
      </div>
      <ul id="${categoryId}-tabs" class="tab-list"></ul>
    `;
    
    // Add the new category before the "Other" category
    const otherCategory = document.querySelector('.category[data-category="other"]');
    otherCategory.parentNode.insertBefore(category, otherCategory);
    
    // Setup event listeners for the new category
    category.querySelector('.minimize-button').addEventListener('click', toggleCategory);
    
    // Clear inputs
    nameInput.value = '';
    tagsInput.value = '';
    
    // Refresh tabs to populate the new category
    refreshTabs();
  }