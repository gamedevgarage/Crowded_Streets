
// Globalizes node as smsg.Variable_Name

var GLOBAL_VAR_NAME = cc.Enum({
    Test_Node:-1,
    Joystick_Button:-1,
    Whistle_Button:-1,
    Warn_Button:-1,
    Siren_Button:-1,
});


cc.Class({
    extends: cc.Component,

    properties: {
        Variable_Name:{
            default:0,
            type:GLOBAL_VAR_NAME,
        }
    },
    

    __preload(){
        smsg[Object.keys(GLOBAL_VAR_NAME)[this.Variable_Name]] = this.node;
    },


    onDestroy(){
        smsg[Object.keys(GLOBAL_VAR_NAME)[this.Variable_Name]] = null;
    }

});
