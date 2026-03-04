const statusText = document.getElementById("status");
const toggleBtn = document.getElementById("toggle");
const modalStatusText = document.getElementById("modalStatus");
const toggleModalBtn = document.getElementById("toggleModal");

function updateUI(enabled) {
    statusText.textContent = enabled ? "ON" : "OFF";
    toggleBtn.textContent = enabled ? "Turn OFF" : "Turn ON";
}
function updateModalUI(modalEnabled) {
    modalStatusText.textContent = modalEnabled ? "ON" : "OFF";
    toggleModalBtn.textContent = modalEnabled ? "MODAL OFF" : "MODAL ON";
}

// Load saved state
chrome.storage.local.get(["enabled", "modalEnabled"], (result) => {
    const enabled = result.enabled || false;
    const modalEnabled = result.modalEnabled || false;
    updateUI(enabled);
    updateModalUI(modalEnabled);
});

// Toggle button
toggleBtn.addEventListener("click", () => {
    chrome.storage.local.get(["enabled"], (result) => {
        const newState = !result.enabled;
        chrome.storage.local.set({ enabled: newState });
        updateUI(newState);
    });
});

// Toggle modal button
toggleModalBtn.addEventListener("click", () => {
    chrome.storage.local.get(["modalEnabled"], (result) => {
        const newState = !result.modalEnabled;
        chrome.storage.local.set({ modalEnabled: newState });
        updateModalUI(newState);
    });
});

// Export
document.getElementById('export').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "getPosts" }, (response) => {
        if (!response) return;

        const posts = response.posts;
        let csvContent = "data:text/csv;charset=utf-8,Post\n";

        posts.forEach(post => {
            csvContent += `"${post.replace(/"/g, '""')}"\n`;
        });

        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = "posts.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});