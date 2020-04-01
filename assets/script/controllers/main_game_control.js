
cc.Class({
    extends: cc.Component,

    properties: {
        
        End_Day_Screen:cc.Prefab,

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
    },

    Request_Fullscreen(){
        cc.screen.requestFullScreen();
    },

    Show_End_Day_Screen(){
        if(!smsg.Game_Control){ // make sure we are playing
            return;
        }

        smsg.Input_Control.Disable_Input();

        let end_day_screen = cc.instantiate(this.End_Day_Screen);
        end_day_screen.parent = smsg.UI_Layer;
        let comp = end_day_screen.getComponent("end_day_screen");
        comp.Set_Day_Number(smsg.Game_Control.Today+1);
        comp.Set_New_Infections(smsg.Game_Control.New_Infection_Count);
        comp.Set_Golds_Earned(smsg.Game_Control.Gold_Count);
        comp.Show_Screen();
    },

    Start_Next_Day(){
        smsg.Game_Control.Start_Next_Day();
        smsg.Input_Control.Enable_Input();
    }
 
});
