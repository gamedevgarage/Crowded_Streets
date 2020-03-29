
cc.Class({
    extends: cc.Component,

    properties: {
        Debug_Draw:false,
    },

    __preload(){

        // Make this node persist
        cc.game.addPersistRootNode(this.node);
        
        // Globalize
        smsg.Main_Game_Control = this;
        smsg.Audio_Control = require("audio_control"); // initializes itself
        smsg.Game_Layer = cc.find("Game_Layer");
        smsg.OBJECT_TAG_LIST = require("object_tag_list");

    },

    onLoad(){

        cc.screen.requestFullScreen();

        // Physics Settings
        this.physics_manager = cc.director.getPhysicsManager();
        this.physics_manager.enabled = true; // physics collision manager
        this.physics_manager.gravity = cc.v2();

        // Debug Draw
        if(this.Debug_Draw){
            var Bits = cc.PhysicsManager.DrawBits;
            cc.director.getPhysicsManager().debugDrawFlags = Bits.e_aabbBit |
            Bits.e_pairBit |
            Bits.e_centerOfMassBit |
            Bits.e_jointBit |
            Bits.e_shapeBit;
        }
    }
 
});
