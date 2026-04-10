(function() {
    const urlInput = document.getElementById('gh-url');
    const historyDiv = document.getElementById('history');

    window.clearTextbox = () => { urlInput.value = ''; urlInput.focus(); };

    function getHistory() {
        return JSON.parse(localStorage.getItem('gh_history') || '[]');
    }

    function parseGH(url) {
        try {
            const parts = url.split('/');
            return {
                repo: parts[3] + '/' + parts[4],
                file: parts.pop()
            };
        } catch(e) { return { repo: 'Unknown Repo', file: 'index.html' }; }
    }

    function renderHistory() {
        const history = getHistory();
        historyDiv.innerHTML = '';
        history.reverse().forEach(url => {
            const info = parseGH(url);
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-repo"><i class="fas fa-book"></i> ${info.repo}</div>
                <a class="card-title" href="#" onclick="launch('${url}')">${info.file}</a>
                <span class="card-url">${url}</span>
                <div class="card-actions">
                    <button class="action-btn" onclick="launch('${url}')" title="Open"><i class="fas fa-external-link-alt"></i> Open</button>
                    <button class="action-btn" onclick="copyLink('${url}')" title="Copy"><i class="fas fa-copy"></i> Copy</button>
                </div>
            `;
            historyDiv.appendChild(card);
        });
    }

    window.copyLink = (url) => {
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    window.launch = (url) => {
        urlInput.value = url;
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
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write('<html><head><title>Loading...</title></head><body style="font-family:sans-serif;text-align:center;padding-top:20%;"><h2>Loading Preview...</h2></body></html>');

        fetch('https://api.codetabs.com/v1/proxy/?quest=' + rawUrl)
            .then(r => r.text())
            .then(html => {
                const base = `<base href="${rawUrl}">`;
                const finalHtml = html.replace(/<head([^>]*)>/i, `<head$1>${base}`);
                previewWindow.document.open();
                previewWindow.document.write(finalHtml);
                previewWindow.document.close();
            })
            .catch(e => {
                previewWindow.close();
                alert("Proxy Error: Try again in a moment.");
            });
    };

    // Export/Import/Clear logic stays the same
    window.exportHistory = function() {
        const blob = new Blob([localStorage.getItem('gh_history') || '[]'], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'history_backup.json';
        a.click();
    };

    window.importHistory = function(input) {
        const reader = new FileReader();
        reader.onload = () => {
            localStorage.setItem('gh_history', reader.result);
            renderHistory();
        };
        reader.readAsText(input.files[0]);
    };

    window.clearAll = function() {
        if(confirm("Delete all saved links?")) {
            localStorage.removeItem('gh_history');
            renderHistory();
        }
    };

    renderHistory();
})();
