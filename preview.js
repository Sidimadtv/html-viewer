(function () {
    var previewForm = document.getElementById('previewform');
    var url = location.search.substring(1).replace(/\/\/github\.com/, '//raw.githubusercontent.com').replace(/\/blob\//, '/');

    var fetchProxy = function (url, options, i) {
        var proxy = [
            '', 
            'https://api.codetabs.com/v1/proxy/?quest='
        ];
        return fetch(proxy[i] + url, options).then(function (res) {
            if (!res.ok) throw new Error('Cannot load ' + url);
            return res.text();
        }).catch(function (error) {
            if (i === proxy.length - 1) throw error;
            return fetchProxy(url, options, i + 1);
        });
    };

    var loadHTML = function (data) {
        if (data) {
            // This replaces scripts so they can be injected manually after the DOM is written
            data = data.replace(/<head([^>]*)>/i, '<head$1><base href="' + url + '">')
                       .replace(/<script(\s*src=["'][^"']*["'])?(\s*type=["'](text|application)\/javascript["'])?/gi, '<script type="text/htmlpreview"$1');
            document.open();
            document.write(data);
            document.close();
            // Note: The original replaceAssets() function would go here if you need CSS/JS support
        }
    };

    if (url && url.indexOf(location.hostname) < 0) {
        fetchProxy(url, null, 0).then(loadHTML).catch(console.error);
    } else {
        previewForm.style.display = 'block';
    }
})();
