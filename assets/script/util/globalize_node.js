
// Globalizes node as smsg.Variable_Name

var GLOBAL_VAR_NAME = cc.Enum({
    Test_Node:-1,
    Joystick_Button:-1,
    Whistle_Button:-1,
    Warn_Button:-1,
    Siren_Button:-1,
    Whistle_Cooldown_Indicator:-1,
    Warn_Battery_Indicator:-1,
    Siren_Cooldown_Indicator:-1,
    Infected_Indicator:-1,
    Street_Indicator:-1,
});


cc.Class({
    extends: cc.Component,
    editor: CC_EDITOR && {
        menu: 'SMSG/Util/globalize_node',
    },
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
