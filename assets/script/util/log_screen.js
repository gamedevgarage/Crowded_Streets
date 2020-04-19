
// requires "smsg_log.js" as plugin

cc.Class({
    extends: cc.Component,

    properties: {

        Log_Text:cc.Label,

        ScrollView:cc.ScrollView,

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    onEnable () {
        smsg.log_screen = this;
        this.Log_Text.string = "";
        this.Add_Log_Text(smsg.log_data);
    },


    onDisable(){
        smsg.log_screen = null;
    },

    
    // update (dt) {},

    Toggle_Log_Screen(){
        if(this.node.active){
            this.node.active = false;
        }else{
            this.Log_Text.string = "";
            this.Add_Log_Text(smsg.log_data);
            this.Show_Log_Screen();
        }
    },

    Show_Log_Screen(){      
        this.node.active = true;
        this.ScrollView.scrollToBottom();
    },

    Hide_Log_Screen(){
        this.node.active = false;
    },

    Add_Log_Text(txt){
        this.Log_Text.string = this.Log_Text.string + txt;

        if(this.Log_Text.string.length > 10000){
            this.Log_Text.string = this.Log_Text.string.substring(this.Log_Text.string.length-10000); 
        }

    },

    Clear_Log_Text(){
        this.Log_Text.string = "";
        smsg.log_data = "";
    },


});
