document.addEventListener('DOMContentLoaded', function() {
    organizeTabs();
    document.getElementById('add-category').addEventListener('click', addCategory);
});

function organizeTabs() {
    chrome.tabs.query({}, function(tabs) {
        const workTabs = document.getElementById('work-tabs');
        const entertainmentTabs = document.getElementById('entertainment-tabs');
        const sportsTabs = document.getElementById('sports-tabs');
        const educationTabs = document.getElementById('education-tabs');
        const otherTabs = document.getElementById('other-tabs');

        // Clear existing tabs
        workTabs.innerHTML = '';
        entertainmentTabs.innerHTML = '';
        sportsTabs.innerHTML = '';
        educationTabs.innerHTML = '';
        otherTabs.innerHTML = '';

        tabs.forEach(tab => {
            console.log(`Tab URL: ${tab.url}`); // Log the URL of each tab for debugging
            const listItem = document.createElement('li');
            listItem.textContent = tab.title;
            listItem.onclick = function() {
                openTab(tab.url);
            };

            // Categorization logic
            if (/work|upwork|linkedin/i.test(tab.url)) {
                workTabs.appendChild(listItem);
            } else if (/youtube|music|netflix|hulu/i.test(tab.url)) {
                entertainmentTabs.appendChild(listItem);
            } else if (/cric|football|nba|nfl/i.test(tab.url)) { 
                sportsTabs.appendChild(listItem);
            } else if (/coursera|edx|udemy|education/i.test(tab.url)) {
                educationTabs.appendChild(listItem);
            } else {
                // Check for custom categories with tags
                const categories = document.querySelectorAll('.category');
                categories.forEach(category => {
                    const tags = JSON.parse(category.dataset.tags || '[]');
                    if (tags.some(tag => tab.url.includes(tag))) {
                        const categoryList = category.querySelector('ul');
                        categoryList.appendChild(listItem.cloneNode(true)); // Clone the list item for the new category
                    }
                });
                otherTabs.appendChild(listItem); // Catch-all for uncategorized tabs
            }
        });
    });
}

function openTab(url) {
    chrome.tabs.create({ url: url });
}

function addCategory() {
    const categoryName = document.getElementById('new-category-name').value.trim();
    const tagsInput = document.getElementById('new-category-tags').value.trim();
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag); // Split tags and trim whitespace

    if (categoryName && tags.length > 0) {
        // Create a new category div
        const newCategoryDiv = document.createElement('div');
        newCategoryDiv.className = 'category';

        // Create a new heading for the category
        const newCategoryHeading = document.createElement('h2');
        newCategoryHeading.textContent = categoryName;

        // Create a new unordered list for the category
        const newCategoryList = document.createElement('ul');
        newCategoryList.id = `${categoryName.toLowerCase().replace(/\s+/g, '-')}-tabs`; // Generate a unique ID

        // Append heading and list to the new category div
        newCategoryDiv.appendChild(newCategoryHeading);
        newCategoryDiv.appendChild(newCategoryList);

        // Store tags for later use (you can adjust how you want to store these)
        newCategoryDiv.dataset.tags = JSON.stringify(tags);

        // Append the new category to the categories container
        const categoriesContainer = document.getElementById('categories');
        const otherCategory = document.getElementById('other-tabs');
        if (otherCategory) {
            categoriesContainer.insertBefore(newCategoryDiv, otherCategory.parentElement); // Insert before "Other"
        } else {
            categoriesContainer.appendChild(newCategoryDiv); // Append if "Other" doesn't exist
        }

        // Clear the input fields
        document.getElementById('new-category-name').value = '';
        document.getElementById('new-category-tags').value = '';
    } else {
        alert('Please enter a category name and at least one tag.');
    }
}