(function() {
    const urlInput = document.getElementById('github-url');
    const historyDiv = document.getElementById('history');
    const viewer = document.getElementById('viewer');

    // 1. Load history from LocalStorage immediately
    function loadHistory() {
        const saved = JSON.parse(localStorage.getItem('gh_history') || '[]');
        historyDiv.innerHTML = '';
        saved.forEach(url => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.innerText = url.split('/').pop(); // Just the file name
            span.onclick = () => { urlInput.value = url; runPreview(); };
            historyDiv.appendChild(span);
        });
        return saved;
    }

    // 2. The Preview Engine
    window.runPreview = function() {
        const url = urlInput.value.trim();
        if (!url) return;

        // Save to History
        let history = JSON.parse(localStorage.getItem('gh_history') || '[]');
        if (!history.includes(url)) {
            history.push(url);
            localStorage.setItem('gh_history', JSON.stringify(history));
            loadHistory();
        }

        // Convert to Raw Link
        const rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');

        // Fetch and inject into IFRAME (not the main page!)
        fetch('https://api.codetabs.com/v1/proxy/?quest=' + rawUrl)
            .then(r => r.text())
            .then(html => {
                const base = `<base href="${rawUrl}">`;
                const finalHtml = html.replace(/<head([^>]*)>/i, `<head$1>${base}`);
                
                const dest = viewer.contentWindow.document;
                dest.open();
                dest.write(finalHtml);
                dest.close();
            })
            .catch(e => alert("Failed to load: " + e.message));
    };

    // 3. Export / Import / Clear
    window.exportHistory = function() {
        const data = localStorage.getItem('gh_history') || '[]';
        const blob = new Blob([data], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'history_backup.json';
        a.click();
    };

    window.importHistory = function(input) {
        const reader = new FileReader();
        reader.onload = () => {
            localStorage.setItem('gh_history', reader.result);
            loadHistory();
        };
        reader.readAsText(input.files[0]);
    };

    window.clearAll = function() {
        if(confirm("Delete history?")) {
            localStorage.removeItem('gh_history');
            loadHistory();
            viewer.src = "about:blank"; // Clear the viewer too
        }
    };

    loadHistory(); // Initialize the list on page load
})();
