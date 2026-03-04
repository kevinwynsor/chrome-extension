let collectedPosts = new Map(); 
let enabled = false;

// Load saved state
chrome.storage.local.get(["enabled"], (result) => {
    enabled = result.enabled || false;
    updateUI();
});

chrome.storage.local.get(["modalEnabled"], (result) => {
    const modalEnabled = result.modalEnabled || false;
    if (modalEnabled) {
        createFloatingPanel();
    }
    updateUI();
});

// Listen for state change
chrome.storage.onChanged.addListener((changes) => {
    const modalEnabled = changes.modalEnabled?.newValue ?? true;  
    
    if (changes.enabled) {enabled = changes.enabled.newValue;
        updateUI();
    }
    if (modalEnabled) {
        createFloatingPanel();
    }else{
        const panel = document.getElementById("scrollCollectorPanel");
        if(panel) panel.remove();
    }
});

// ========== FLOATING PANEL ==========

function createFloatingPanel() {
    if (document.getElementById("scrollCollectorPanel")) return;

    const panel = document.createElement("div");
    panel.id = "scrollCollectorPanel";

    panel.style.position = "fixed";
    panel.style.bottom = "20px";
    panel.style.right = "20px";
    panel.style.zIndex = "999999";
    panel.style.background = "#111";
    panel.style.color = "#fff";
    panel.style.padding = "12px";
    panel.style.borderRadius = "10px";
    panel.style.fontSize = "14px";
    panel.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
    panel.style.width = "180px";

    panel.innerHTML = `
        <div style="margin-bottom:8px;">
            Status: <strong id="statusText">OFF</strong>
        </div>
        <div style="margin-bottom:8px;">
            Collected: <span id="countText">0</span>
        </div>
        <button id="toggleBtn" style="width:100%;margin-bottom:6px;">Turn ON</button>
        <button id="exportBtn" style="width:100%;">Export CSV</button>
    `;

    document.body.appendChild(panel);

    document.getElementById("toggleBtn").onclick = toggleState;
    document.getElementById("exportBtn").onclick = exportCSV;

    updateUI();
}

function updateUI() {
    const statusText = document.getElementById("statusText");
    const toggleBtn = document.getElementById("toggleBtn");
    const countText = document.getElementById("countText");

    if (!statusText) return;

    statusText.textContent = enabled ? "ON" : "OFF";
    toggleBtn.textContent = enabled ? "Turn OFF" : "Turn ON";
    countText.textContent = collectedPosts.size;
}

function toggleState() {
    enabled = !enabled;
    chrome.storage.local.set({ enabled });
    updateUI();
}

// ========== SCRAPING LOGIC ==========

function extractPosts() {
    if (!enabled) return;

    const posts = document.querySelectorAll('article[data-post-id^="t3"]');   
    posts.forEach(post => {
        const scores = post.querySelectorAll('shreddit-post');
        const scoreValue = scores[0].getAttribute('score');
        const text = post.innerText;
        collectedPosts.set(text, scoreValue);
    });

    updateUI();
}

// Scroll listener
let scrollTimeout;

document.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        extractPosts();
    }, 500);
});

// Export
function exportCSV() {
    if (collectedPosts.size === 0) {
        alert("No posts collected yet.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";

    collectedPosts.forEach((score, post) => {
        csvContent += `"${post.replace(/"/g, '""')}","${String(score).replace(/"/g, '""')}"\n`;
    });

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "posts.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
