cc.Class({
    extends: cc.Component,

    properties: {

        Bar: cc.Sprite,
        
        Label: cc.Label,

    },

    __preload(){
        smsg.Infected_Indicator = this;
    },
    
    onDestroy(){
        smsg.Infected_Indicator = null;
    },

    Set_Indicator(infected, total){
        this.Label.string = infected+"/"+total;
        this.Bar.fillRange = infected/total;
    },

});
