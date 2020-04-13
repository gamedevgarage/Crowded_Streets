
cc.Class({
    extends: cc.Component,

    editor : CC_EDITOR && {
        executeInEditMode : true,
    },

    properties: {
        Scene_Name:{
            default:"",
            notify(){
                this.node.name = this.Scene_Name;
            },

        },
        Activated:{
            default:false,
            notify(){
                this.Update_Thumbnail();
            },
        }
    },

    onLoad () {

        this.Day_Number_Label = cc.find("Day_Group/Day_Number",this.node).getComponent(cc.Label);
        this.Update_Thumbnail();
    },

    Update_Thumbnail(){
        if(this.Activated){
            let sprite = this.node.getComponent(cc.Sprite);
            smsg.Home_Screen_Control && sprite.setMaterial(0,smsg.Home_Screen_Control.Std_Material);
            // Register touch event
            this.node.on(cc.Node.EventType.TOUCH_END, this.Load_Level, this);
        }else{
            let sprite = this.node.getComponent(cc.Sprite);
            smsg.Home_Screen_Control && sprite.setMaterial(0,smsg.Home_Screen_Control.Gray_Material);
            // Remove touch event
            this.node.off(cc.Node.EventType.TOUCH_END, this.Load_Level, this);
        }
    },

    Load_Level(){
        smsg.Main_Game_Control.Load_Level(this.Scene_Name);
    },

    Activate_Level(day_number){
        this.Activated = true;
        this.Day_Number_Label = day_number;
    },

    onDestroy(){
        this.node.off(cc.Node.EventType.TOUCH_END, this.Load_Level, this);
    },

    
});
