(function() {
    const urlInput = document.getElementById('gh-url');
    const xBtn = document.getElementById('clear-btn');
    const historyDiv = document.getElementById('history');

    // Toggle the 'X' button visibility
    window.toggleX = () => {
        xBtn.style.display = urlInput.value.length > 0 ? 'block' : 'none';
    };

    // Robust Clear Function
    window.clearTextbox = () => {
        urlInput.value = '';
        xBtn.style.display = 'none';
        urlInput.focus();
    };

    function getHistory() {
        return JSON.parse(localStorage.getItem('gh_history') || '[]');
    }

    // Extracts User/Repo and the Base Repo URL
    function parseInfo(url) {
        try {
            const parts = url.split('/');
            const repoOwner = parts[3];
            const repoName = parts[4];
            return {
                name: `${repoOwner}/${repoName}`,
                repoUrl: `https://github.com/${repoOwner}/${repoName}`,
                fileName: parts.pop()
            };
        } catch(e) {
            return { name: "Unknown Repository", repoUrl: "#", fileName: "File" };
        }
    }

    function renderHistory() {
        const history = getHistory();
        historyDiv.innerHTML = '';
        history.reverse().forEach(url => {
            const info = parseInfo(url);
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div>
                    <div class="card-header"><i class="fas fa-database"></i> ${info.name}</div>
                    <a href="${url}" class="card-url" target="_blank" title="View File Source">${url}</a>
                </div>
                <div class="card-footer">
                    <button class="icon-btn" onclick="openPrev('${url}')"><i class="fas fa-play"></i> Preview</button>
                    <a href="${info.repoUrl}" target="_blank" class="icon-btn"><i class="fas fa-code-branch"></i> Repo</a>
                    <button class="icon-btn" onclick="copyText('${url}')"><i class="fas fa-copy"></i> Copy</button>
                </div>
            `;
            historyDiv.appendChild(card);
        });
    }

    window.copyText = (text) => {
        navigator.clipboard.writeText(text);
        alert("URL Copied!");
    };

    window.openPrev = (url) => {
        urlInput.value = url;
        toggleX();
        runPreview();
    };

    window.runPreview = function() {
        const url = urlInput.value.trim();
        if (!url) return;

        let history = getHistory();
        if (!history.includes(url)) {
            history.push(url);
            localStorage.setItem('gh_history', JSON.stringify(history));
            renderHistory();
        }

        const rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        const win = window.open('', '_blank');
        
        fetch('https://api.codetabs.com/v1/proxy/?quest=' + rawUrl)
            .then(r => r.text())
            .then(html => {
                const base = `<base href="${rawUrl}">`;
                const content = html.replace(/<head([^>]*)>/i, `<head$1>${base}`);
                win.document.open();
                win.document.write(content);
                win.document.close();
            })
            .catch(() => { win.close(); alert("Preview failed. Check the URL."); });
    };

    // Standard JSON Utilities
    window.exportHistory = () => {
        const blob = new Blob([localStorage.getItem('gh_history')], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'github_history.json';
        a.click();
    };

    window.importHistory = (input) => {
        const reader = new FileReader();
        reader.onload = () => {
            localStorage.setItem('gh_history', reader.result);
            renderHistory();
        };
        reader.readAsText(input.files[0]);
    };

    window.clearAll = () => {
        if(confirm("Delete all history?")) {
            localStorage.removeItem('gh_history');
            renderHistory();
        }
    };

    renderHistory();
})();
