(function() {
    const urlInput = document.getElementById('gh-url');
    const historyDiv = document.getElementById('history');
    const viewer = document.getElementById('viewer');

    function getHistory() {
        return JSON.parse(localStorage.getItem('gh_history') || '[]');
    }

    function renderHistory() {
        const history = getHistory();
        historyDiv.innerHTML = '';
        history.reverse().forEach(url => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.innerText = url.split('/').pop() || url;
            span.onclick = () => { urlInput.value = url; runPreview(); };
            historyDiv.appendChild(span);
        });
    }

    window.runPreview = function() {
        const url = urlInput.value.trim();
        if (!url) return;

        // Save to LocalStorage
        let history = getHistory();
        if (!history.includes(url)) {
            history.push(url);
            localStorage.setItem('gh_history', JSON.stringify(history));
            renderHistory();
        }

        // Convert GitHub URL to Raw URL
        const rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');

        // Create a new tab to act as the viewer
        const newTab = window.open('', '_blank');
        newTab.document.write('<html><body>Loading Preview...</body></html>');

        fetch('https://api.codetabs.com/v1/proxy/?quest=' + rawUrl)
            .then(r => r.text())
            .then(html => {
                const base = `<base href="${rawUrl}">`;
                const finalHtml = html.replace(/<head([^>]*)>/i, `<head$1>${base}`);
                
                // Injecting into the new tab instead of the hidden iframe
                newTab.document.open();
                newTab.document.write(finalHtml);
                newTab.document.close();
            })
            .catch(e => {
                newTab.close();
                alert("Error: " + e.message);
            });
    };

    window.exportHistory = function() {
        const data = localStorage.getItem('gh_history') || '[]';
        const blob = new Blob([data], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'my_history.json';
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
        if(confirm("Clear everything?")) {
            localStorage.removeItem('gh_history');
            renderHistory();
            viewer.src = "about:blank";
        }
    };

    renderHistory();
})();
