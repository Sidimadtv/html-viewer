(function () {
    const fileInput = document.getElementById('file');
    const historyList = document.getElementById('history-list');
    const frame = document.getElementById('preview-frame');

    // --- History Logic ---
    function getHistory() {
        return JSON.parse(localStorage.getItem('preview_history') || '[]');
    }

    function renderHistory() {
        const history = getHistory();
        historyList.innerHTML = '';
        history.forEach(url => {
            const span = document.createElement('span');
            span.className = 'history-tag';
            span.innerText = url.split('/').pop(); // Show just filename
            span.onclick = () => { fileInput.value = url; launchPreview(); };
            historyList.appendChild(span);
        });
    }

    // --- Preview Logic ---
    window.launchPreview = function(customUrl) {
        const url = customUrl || fileInput.value.trim();
        if (!url) return;

        // Save to History
        let history = getHistory();
        if (!history.includes(url)) {
            history.push(url);
            localStorage.setItem('preview_history', JSON.stringify(history));
            renderHistory();
        }

        // Convert to Raw
        const rawUrl = url.replace(/\/\/github\.com/, '//raw.githubusercontent.com').replace(/\/blob\//, '/');
        
        // Show Frame
        frame.style.display = 'block';
        
        fetch('https://api.codetabs.com/v1/proxy/?quest=' + rawUrl)
            .then(res => res.text())
            .then(data => {
                const baseTag = `<base href="${rawUrl}">`;
                const content = data.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
                
                const doc = frame.contentWindow.document;
                doc.open();
                doc.write(content);
                doc.close();
            })
            .catch(err => alert("Error loading page: " + err.message));
    };

    // --- Export / Import ---
    window.exportJSON = function() {
        const blob = new Blob([JSON.stringify(getHistory())], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "history.json";
        a.click();
    };

    window.importJSON = function(input) {
        const reader = new FileReader();
        reader.onload = function() {
            localStorage.setItem('preview_history', reader.result);
            renderHistory();
        };
        reader.readAsText(input.files[0]);
    };

    window.clearHistory = function() {
        localStorage.removeItem('preview_history');
        renderHistory();
        frame.style.display = 'none';
    };

    // Initialize
    renderHistory();
})();
