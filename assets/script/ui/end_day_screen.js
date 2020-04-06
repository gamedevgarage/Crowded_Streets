cc.Class({
    extends: cc.Component,

    properties: {

        Day_Number:cc.Label,

        New_Infections:cc.Label,

        Golds_Earned:cc.Label,

        Rewarded_Video_Button:cc.Node,

    },

    __preload(){
        smsg.End_Day_Screen = this;
    },

    onDestroy(){
        smsg.End_Day_Screen = null;
    },

    Set_Day_Number(number){
        this.Day_Number.string = number;
    },

    Set_New_Infections(number){
        this.New_Infections.string = number;
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

    Start_Next_Day(){
        this.Hide_Screen();
        smsg.Main_Game_Control.Start_Next_Day();
    },

    Share_End_Day_Screen(){
        smsg.Main_Game_Control.Share_Screenshot();
    },

    Show_Rewarded_Video(){
        smsg.Monetization_Control.Show_Rewarded_Video();
    },

    Video_Reward_Achieved(){
        this.Rewarded_Video_Button.active = false;
    },

});
