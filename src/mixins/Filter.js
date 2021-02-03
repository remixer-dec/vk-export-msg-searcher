const FilterMixin = {
    'idFilter' : {
        'all' : x => x,
        'users': x => x.id >= 0 && x.id < 2000000000,
        'groups': x => x.id < 0 && x.id > -2000000000,
        'chats': x => x.id >= 2000000000
    }
}

export default FilterMixin
