(function () {
    var previewForm = document.getElementById('previewform');
    // Get everything after the '?'
    var query = window.location.search.substring(1); 
    
    if (query) {
        // 1. Clean the URL and convert to Raw GitHub link
        var rawUrl = query.replace(/\/\/github\.com/, '//raw.githubusercontent.com')
                          .replace(/\/blob\//, '/');

        // 2. Fetch the content through the proxy
        fetch('https://api.codetabs.com/v1/proxy/?quest=' + rawUrl)
            .then(res => {
                if (!res.ok) throw new Error('File not found (404)');
                return res.text();
            })
            .then(data => {
                // 3. Inject a <base> tag so images and CSS load from GitHub
                data = data.replace(/<head([^>]*)>/i, '<head$1><base href="' + rawUrl + '">');
                
                document.open();
                document.write(data);
                document.close();
            })
            .catch(err => {
                previewForm.style.display = 'block';
                previewForm.innerHTML = '<h2 style="color:red">Error</h2><p>' + err.message + '</p>';
            });
    } else {
        // If no URL is provided, show the input form
        previewForm.style.display = 'block';
    }
})();
