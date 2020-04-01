
// Globalizes node as smsg.Variable_Name

var GLOBAL_NODE_NAMES = require("global_node_names");


cc.Class({
    extends: cc.Component,
    editor: CC_EDITOR && {
        menu: 'SMSG/Util/globalize_node',
    },
    properties: {
        Variable_Name:{
            default:0,
            type:GLOBAL_NODE_NAMES,
        }
    },
    

    __preload(){
        smsg[Object.keys(GLOBAL_NODE_NAMES)[this.Variable_Name]] = this.node;
    },


    onDestroy(){
        smsg[Object.keys(GLOBAL_NODE_NAMES)[this.Variable_Name]] = null;
    }

});
