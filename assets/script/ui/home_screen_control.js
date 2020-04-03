

cc.Class({
    extends: cc.Component,

    editor : CC_EDITOR && {
        executeInEditMode : true,
    },

    properties: {

        Level_Thumbnails:cc.Node,

        Std_Material:cc.Material,

        Gray_Material:cc.Material,

        SFX_Button:cc.Node,
        
        Music_Button:cc.Node,


    },

    __preload(){
        smsg.Home_Screen_Control = this;
    },

    onDestroy(){
        smsg.Home_Screen_Control = null;
    },

    onLoad(){

        if(CC_EDITOR){
            return;
        }

        // Load savedata
        smsg.Main_Game_Control.Read_Save_Data();

        // Level Thumbnail comps
        let thumb_comp_list = this.Level_Thumbnails.getComponentsInChildren("level_thumbnail");
        let scene_name_list = []; 
        for(let i = 0 ; i < thumb_comp_list.length ; i++ ){
            scene_name_list.push(thumb_comp_list[i].Scene_Name);
        }

        // Activate level thumbnails
        for(let i = 0 ; i < smsg.Main_Game_Control.Save_Data.Activated_Levels.length ; i++ ){
            let data = smsg.Main_Game_Control.Save_Data.Activated_Levels[i];
            let comp_index = scene_name_list.indexOf(data.Scene_Name);
            if(comp_index !== -1){
                thumb_comp_list[comp_index].Activate_Level();
            }
        }

    },

    Toggle_SFX(){
        if(smsg.Main_Game_Control.Toggle_SFX()){ // Unmuted
            let sprite = this.SFX_Button.getComponent(cc.Sprite);
            sprite.setMaterial(0,this.Std_Material);
        }else{// Muted
            let sprite = this.SFX_Button.getComponent(cc.Sprite);
            sprite.setMaterial(0,this.Gray_Material);
        }
    },

    Toggle_Music(){
        if(smsg.Main_Game_Control.Toggle_Music()){ // Unmuted
            let sprite = this.Music_Button.getComponent(cc.Sprite);
            sprite.setMaterial(0,this.Std_Material);
        }else{// Muted
            let sprite = this.Music_Button.getComponent(cc.Sprite);
            sprite.setMaterial(0,this.Gray_Material);
        }
    },

    Share_Home_Screen(){
        smsg.Main_Game_Control.Share_Screenshot();
    },

    Request_Fullscreen(){
        smsg.Main_Game_Control.Request_Fullscreen();
    },

});
