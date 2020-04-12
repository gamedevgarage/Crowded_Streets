cc.Class({
    extends: cc.Component,

    properties: {

        Day_Number:cc.Label,

        Golds_Earned:cc.Label,

    },

    Set_Day_Number(number){
        this.Day_Number.string = number;
    },

    Set_Golds_Earned(number){
        this.Golds_Earned.string = number;
    },

    Show_Screen(){
        this.node.active = true;
    },

    Hide_Screen(){
        this.node.active = false;
        this.node.destroy();
    },

    Load_Home_Screen(){
        this.Hide_Screen();
        smsg.Main_Game_Control.Load_Home_Screen();
    },

    Show_Rewarded_Video(){
        smsg.Monetization_Control.Show_Rewarded_Video();
    },

    Share_Game_Over_Screen(){
        smsg.Main_Game_Control.Share_Screenshot();
    },

});
