(function () {
    const previewForm = document.getElementById('previewform');
    const historyList = document.getElementById('history-list');
    const fileInput = document.getElementById('file');
    const query = window.location.search.substring(1);

    // --- STORAGE LOGIC ---
    
    function getHistory() {
        return JSON.parse(localStorage.getItem('preview_history') || '[]');
    }

    function renderHistory() {
        const history = getHistory();
        historyList.innerHTML = history.length ? '' : '<p>No history yet.</p>';
        history.reverse().forEach(url => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `<a href="./index.html?${url}">${url}</a>`;
            historyList.appendChild(div);
        });
    }

    window.saveAndGo = function() {
        const url = fileInput.value.trim();
        if (!url) return;
        
        let history = getHistory();
        if (!history.includes(url)) {
            history.push(url);
            if (history.length > 10) history.shift(); // Keep last 10
            localStorage.setItem('preview_history', JSON.stringify(history));
        }
        window.location.href = './index.html?' + url;
    };

    window.clearHistory = function() {
        if(confirm("Clear all saved URLs?")) {
            localStorage.removeItem('preview_history');
            renderHistory();
        }
    };

    // --- EXPORT / IMPORT ---

    window.exportJSON = function() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getHistory()));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "preview_history.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    window.importJSON = function(input) {
        const reader = new FileReader();
        reader.onload = function() {
            try {
                const imported = JSON.parse(reader.result);
                if (Array.isArray(imported)) {
                    localStorage.setItem('preview_history', JSON.stringify(imported));
                    renderHistory();
                    alert("Import successful!");
                }
            } catch (e) { alert("Invalid JSON file"); }
        };
        reader.readAsText(input.files[0]);
    };

    // --- PREVIEW ENGINE ---

    if (query) {
        // Hide UI while viewing content
        document.body.innerHTML = 'Loading preview...';

        const rawUrl = query.replace(/\/\/github\.com/, '//raw.githubusercontent.com').replace(/\/blob\//, '/');

        fetch('https://api.codetabs.com/v1/proxy/?quest=' + rawUrl)
            .then(res => {
                if (!res.ok) throw new Error('404: File not found');
                return res.text();
            })
            .then(data => {
                // Fix relative assets
                data = data.replace(/<head([^>]*)>/i, `<head$1><base href="${rawUrl}">`);
                document.open();
                document.write(data);
                document.close();
            })
            .catch(err => {
                document.body.innerHTML = `<h2 style="color:red">Error</h2><p>${err.message}</p><a href="index.html">Back</a>`;
            });
    } else {
        renderHistory();
    }
})();
