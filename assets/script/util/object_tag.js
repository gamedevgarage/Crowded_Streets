

// Sets object tag for game logic

var OBJECT_TAG_LIST = require("object_tag_list"); // Get tag list

cc.Class({
    extends: cc.Component,

    editor: CC_EDITOR && {
        menu: 'SMSG/Util/object_tag',
    },

    properties: {
        Object_Tags:{
            default:[],
            type:[OBJECT_TAG_LIST],
        },

    },

    onLoad () {

        let tag = 0;
        // generate key based on OBJECT_TAG_LIST
        for(let i = 0, n = this.Object_Tags.length ; i < n ; i++){

            let bit = smsg.util.Get_Bit_Key(this.Object_Tags[i]);

            tag |=bit;

        }

        this.node.smsg_tag = tag;
    },

});
