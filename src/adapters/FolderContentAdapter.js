export default class FolderContentAdapter {
    constructor(src) {
        this.src = src
        this.filenames = Array.from(this.src.files).map(x=>x.webkitRelativePath)
    }
    getFileNames() {
        return this.filenames
    }
    async getFileContent(filepath) {
        return new Promise((resolve) => {
            let reader = new FileReader()
            let file = Array.from(this.src.files).find(x => x.webkitRelativePath == filepath)
            reader.onload = function() {
                let arrayBuffer = new Uint8Array(reader.result)
                let decoder = new TextDecoder("windows-1251");
                resolve(decoder.decode(arrayBuffer))
            }
            reader.readAsArrayBuffer(file)
        })
    }
}
