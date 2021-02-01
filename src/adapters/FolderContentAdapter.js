export default class FolderContentAdapter {
    constructor(src) {
        this.src = src
        this.filenames = Array.from(this.src.files).map(x=>x.webkitRelativePath)
    }
    getFileNames() {
        return this.filenames
    }
    async getFileContent(filepath) {
        let decoder = new TextDecoder("windows-1251");
        let file = Array.from(this.src.files).find(x => x.webkitRelativePath == filepath)
        return decoder.decode(new Uint8Array(await file.arrayBuffer()))
    }
}
