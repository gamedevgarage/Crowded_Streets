// Makes node persist

cc.Class({
    extends: cc.Component,

    editor: CC_EDITOR && {
        menu: 'SMSG/Util/persist_root_node',
    },

    properties: {

    },

    onLoad () {

        // Make this node persist
        cc.game.addPersistRootNode(this.node);

        // Before unload scene
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,this.Before_Unload,this); 

        // Before onLoad called
        cc.director.on('persist_nodes_attached',this.Before_Onload,this); 

    },

    // Before unload scene
    Before_Unload(){
        
        // Hide children from scene and put in list
        this.Children_List = [];

        for(let i = 0 , n = this.node.children.length ; i < n ; i++){
            this.Children_List.push(this.node.children[i]);
        }

        for(let i = 0 , n = this.Children_List.length ; i < n ; i++){
            this.Children_List[i].parent = null;
        }
        
    },

    // After scene loaded before onLoad call for nodes
    __preload(){

        // Restore children from list
        for(let i = 0 , n = this.Children_List.length ; i < n ; i++){
            this.Children_List[i].parent = this.node;
        }

    },

});
