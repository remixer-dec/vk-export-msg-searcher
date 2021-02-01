export default class IndexContentParser {
    parse(src) {
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(src, 'text/html');
        let items = htmlDoc.getElementsByClassName('item')
        let names = {}
        for (let dialog of items) {
            let link = dialog.getElementsByTagName('a')[0]
            names[link.getAttribute('href').match(/([0-9-]+)+\//)[1]] = link.innerText
        }
        return names
    }
}
