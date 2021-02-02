const DownloaderMixin = {
    downloadBlob: function(data, fileName, mimeType) {
        let blob, url;
        blob = new Blob([data], {type: mimeType})
        url = window.URL.createObjectURL(blob)
        DownloaderMixin.downloadURL(url, fileName)
        setTimeout(function() {
            return window.URL.revokeObjectURL(url)
        }, 1000)
    },

    downloadURL: function(data, fileName) {
        let a = document.createElement('a')
        a.href = data
        a.download = fileName
        a.style = 'display: none'
        document.body.appendChild(a)
        a.click()
        a.remove()
    }
}
export default DownloaderMixin
