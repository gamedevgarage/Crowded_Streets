cc.Class({
    extends: cc.Component,

    properties: {

        Bar: cc.Sprite,
        
        Label: cc.Label,

    },

    __preload(){
        smsg.Day_Indicator = this;
    },
    
    onDestroy(){
        smsg.Day_Indicator = null;
    },

    Set_Indicator(day, ratio){
        this.Label.string = "DAY "+day;
        this.Bar.fillRange = ratio;
    },

});
