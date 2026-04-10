(function () {
    var previewForm = document.getElementById('previewform');
    var query = location.search.substring(1); 
    
    // Convert GitHub URL to Raw URL
    var rawUrl = query.replace(/\/\/github\.com/, '//raw.githubusercontent.com')
                      .replace(/\/blob\//, '/');

    if (query) {
        // Use the CodeTabs proxy to bypass CORS
        fetch('https://api.codetabs.com/v1/proxy/?quest=' + rawUrl)
            .then(res => {
                if (!res.ok) throw new Error('Target file not found (404)');
                return res.text();
            })
            .then(data => {
                // Replace relative paths so images/css load
                data = data.replace(/<head([^>]*)>/i, '<head$1><base href="' + rawUrl + '">');
                
                document.open();
                document.write(data);
                document.close();
            })
            .catch(err => {
                previewForm.style.display = 'block';
                previewForm.innerHTML = '<p style="color:red">Error: ' + err.message + '</p><a href="index.html">Go Back</a>';
            });
    } else {
        previewForm.style.display = 'block';
    }
})();
