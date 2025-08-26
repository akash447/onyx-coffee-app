// Run this in browser console to clear old data and fix the community page crash

// Clear old user stories data
localStorage.removeItem('onyx_user_stories');

// Clear old content data (optional - this won't crash but good to refresh)
localStorage.removeItem('onyx_content_data');

console.log('✅ Cleared old data! Refresh the page to see the community page working.');

// You can also run this one-liner:
// localStorage.clear(); // This clears ALL localStorage data