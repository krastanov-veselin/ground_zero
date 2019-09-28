'use strict';

const Data = {
    /** @type {Map<string, List>} */
    lists: new Map(),
    create: (id = "") => {
        if (Data.lists.has(id)) {
            console.warn("Trying to add list with already existing listID.");
            
            return;
        }
        
        const list = new List(id);
        
        Data.lists.set(id, list);
    },
    remove: (id = "") => {
        if (Data.lists.has(id) === false) {
            console.warn("Trying to remove nonexisting list.");
            
            return;
        }
        
        Data.lists.get(id).unmount();
        
        Data.lists.delete(id);
    }
};
