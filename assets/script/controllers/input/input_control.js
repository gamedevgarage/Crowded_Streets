// Controller for all user inputs

// Events:
// -> "joystick_touch_start"
// -> "joystick_touch_end"
// -> "joystick_touch_move"
// -> "whistle_touch_start"
// -> "whistle_touch_end"
// -> "warn_touch_start"
// -> "warn_touch_end"
// -> "siren_touch_start"
// -> "siren_touch_end"

var INPUT_CHANNEL_LIST = require("input_channel_list");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    __preload(){

        // Make this node persist
        cc.game.addPersistRootNode(this.node);

        // Globalize
        smsg.Input_Control = this;
        
    },

    onLoad(){
        this.Init_Handlers();
    },

    Init_Handlers() {
        // key input listeners
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.Key_Down, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.Key_Up, this);
    },

    Remove_Handlers(){
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.Key_Down, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.Key_Up, this);
    },

    // INPUT CHANNELS =========================================

    // Input Type: Button -------------------------------------
    Button_Touch_Start(input_channel){
        switch(input_channel){
            case INPUT_CHANNEL_LIST.Whistle:
                this.node.emit("whistle_touch_start");
            break;
            case INPUT_CHANNEL_LIST.Warn:
                this.node.emit("warn_touch_start");
            break;
            case INPUT_CHANNEL_LIST.Siren:
                this.node.emit("siren_touch_start");
            break;
        }
    },

    Button_Touch_End(input_channel){
        switch(input_channel){
            case INPUT_CHANNEL_LIST.Whistle:
                this.node.emit("whistle_touch_end");
            break;
            case INPUT_CHANNEL_LIST.Warn:
                this.node.emit("warn_touch_end");
            break;
            case INPUT_CHANNEL_LIST.Siren:
                this.node.emit("siren_touch_end");
            break;
        }
    },

    // Input Type: Joystick -----------------------------------
    Joystick_Touch_Start(input_channel, joystick_vector){
            this.node.emit("joystick_touch_start", joystick_vector);
    },

    Joystick_Touch_End(input_channel){
        this.node.emit("joystick_touch_end", input_channel);
    },

    Joystick_Touch_Move(input_channel, joystick_vector){
        this.node.emit("joystick_touch_move", joystick_vector);
    },

    // Input Type: Key ----------------------------------------
    Key_Down (event) {
        if(event.keyCode ==  cc.macro.KEY.back){ // back button

        }
        if(!this.Input_Enabled){
            return;
        }
    },

    Key_Up (event) {
        if(!this.Input_Enabled){
            return;
        }
    },
   
    // END INPUT CHANNELS =====================================

    // Global Enable
    Enable_Input(){
        this.Input_Enabled = true;
        smsg.Input_Control_Buttons.active = true;
    },

    // Global Disable
    Disable_Input(){
        for(let i = 0 ; i < Object.keys(INPUT_CHANNEL_LIST).length ; i++){
            this.Button_Touch_End(INPUT_CHANNEL_LIST[i]);
        }
        for(let i = 0 ; i < Object.keys(INPUT_CHANNEL_LIST).length ; i++){
            this.Joystick_Touch_End(INPUT_CHANNEL_LIST[i]);
        }
        smsg.Input_Control_Buttons.active = false;
        this.Input_Enabled = false;
    },

});
