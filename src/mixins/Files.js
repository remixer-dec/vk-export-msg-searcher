import JSZip from 'jszip'
import ZipContentAdapter from '../adapters/ZipContentAdapter'
import FolderContentAdapter from '../adapters/FolderContentAdapter'
import IndexContentParser from '../parsers/IndexContentParser'

const FileOperationMixin = {
    async loadZip(input) {
        const zip = await JSZip.loadAsync(input)
        return await FileOperationMixin.contentLoaded(new ZipContentAdapter(zip))
    },
    async loadFolder(input) {
        return await FileOperationMixin.contentLoaded(new FolderContentAdapter(input))
    },
    //excpects array with filenames
    msgFileStructureFormer(fileList) {
        let index = fileList.find(s => s.endsWith('index-messages.html'))
        if (!index) throw new EvalError("Index file not found")
        let indexDir = index == 'index-messages.html' ? '' : index.match(/(.+)index-messages.html/)[1]
        let chatFiles = {}
        for (let filename of fileList) {
            if (filename.startsWith(indexDir)) {
                let messageFile = filename.match(/([0-9-]+)\/messages([0-9]+)/)
                if (messageFile) {
                    if (chatFiles[messageFile[1]]) {
                        chatFiles[messageFile[1]].push(parseInt(messageFile[2]))
                    } else {
                        chatFiles[messageFile[1]] = [parseInt(messageFile[2])]
                    }
                }
            }
        }
        return {chatFiles, index, indexDir}
    },
    async contentLoaded(contentAdapterInstance) {
        let {chatFiles, index, indexDir} = FileOperationMixin.msgFileStructureFormer(contentAdapterInstance.getFileNames())
        let chats = new IndexContentParser().parse(await contentAdapterInstance.getFileContent(index))
        return {chats, chatFiles, indexDir, contentAdapterInstance}
    }
}
export default FileOperationMixin
