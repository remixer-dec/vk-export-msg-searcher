export default class ZipContentAdapter {
    constructor(src) {
        this.src = src
        this.filenames = Object.keys(this.src.files)
    }
    getFileNames() {
        return this.filenames
    }
    async getFileContent(filename) {
        let decoder = new TextDecoder("windows-1251")
        return decoder.decode(await this.src.file(filename).async('uint8array'))
    }
}
