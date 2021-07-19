module.exports = {
    formatProxy: (proxy) => {
        if (!proxy || proxy.replace(/\s/g, '') == "")
            return;

        let proxySplit = proxy.split(":");
        
        if (proxySplit.length > 2) {
            return 'http://' + proxySplit[2] + ':' + proxySplit[3] + '@' + proxySplit[0] + ':' + proxySplit[1];
        } else {
            return 'http://' + proxySplit[0] + ':' + proxySplit[1];
        };
    },
    sleep: (ms) => {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}