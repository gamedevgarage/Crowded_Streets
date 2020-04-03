
var AUDIO_LAYERS = require("audio_layers");

cc.Class({
    extends: cc.Component,

    properties: {

        SFX_Button:cc.Sprite,

        Music_Button:cc.Sprite,

        Std_Material:cc.Material,

        Gray_Material:cc.Material,

    },

    __preload(){
        smsg.Pause_Screen_Control = this;
    },

    onDestroy(){
        if(smsg.Pause_Screen_Control === this){
            smsg.Pause_Screen_Control = null;
        }
    },

    onEnable(){

        if(smsg.Audio_Control.Layer_Volume[AUDIO_LAYERS.Default]){
            this.SFX_Button.setMaterial(0,this.Std_Material);
        }else{
            this.SFX_Button.setMaterial(0,this.Gray_Material);
        }

        if(smsg.Audio_Control.Layer_Volume[AUDIO_LAYERS.Background_Music]){
            this.Music_Button.setMaterial(0,this.Std_Material);
        }else{
            this.Music_Button.setMaterial(0,this.Gray_Material);
        }

    },

    Toggle_SFX(){
        if(smsg.Main_Game_Control.Toggle_SFX()){ // Unmuted
            this.SFX_Button.setMaterial(0,this.Std_Material);
        }else{ // Muted
            this.SFX_Button.setMaterial(0,this.Gray_Material);
        }
    },

    Toggle_Music(){
        if(smsg.Main_Game_Control.Toggle_Music()){ // Unmuted
            this.Music_Button.setMaterial(0,this.Std_Material);
        }else{ // Muted
            this.Music_Button.setMaterial(0,this.Gray_Material);
        }
    },

    Resume(){
        smsg.Main_Game_Control.Toggle_Pause();
    },

    Exit(){
        smsg.Main_Game_Control.Load_Home_Screen();
    },

    Show_Screen(){
        this.node.active = true;
    },

    Hide_Screen(){
        this.node.active = false;
        this.node.destroy();
    },

});
