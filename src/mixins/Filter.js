const FilterMixin = {
    'idFilter' : {
        'all' : x => x,
        'users': x => x.id >= 0 && x.id < 2000000000,
        'groups': x => x.id < 0 && x.id > -2000000000,
        'chats': x => x.id >= 2000000000
    },
    SQLFilterFormer(req) {
        let txt = ''
        let rowIteration = 0
        for (let rowName in req) {
            if (rowName[0] == '_') continue
            if (rowIteration != 0) {
                txt += ' AND '
            }
            txt += rowName
            txt += ' '
            let opIteration = 0
            for (let operator in req[rowName]) {
                if (opIteration != 0) {
                    txt += (' AND ' + rowName + ' ')
                }
                txt += operator + ' '
                txt += req[rowName][operator]
                opIteration++
            }
            rowIteration++
        }
        if('_order' in req) {
            txt += ' ORDER BY ' + req['_order']
            if ('_order_type' in req) {
                txt += ' ' + req['_order_type']
            }
        }
        if ('_limit' in req) {
            txt += ' LIMIT ' + req['_limit']
        }
        if ('_offset' in req) {
            txt += ' OFFSET ' + req['_offset']
        }
        return txt
    }
}

export default FilterMixin
