
var INPUT_CHANNEL_LIST = require("input_channel_list");

var INPUT_TYPE = require("input_type");


cc.Class({
    extends: cc.Component,

    properties: {
        Input_Channel:{
            default:0,
            type:INPUT_CHANNEL_LIST,
        },

        Input_Type:{
            default:0,
            type:INPUT_TYPE,
        },

    },

    onLoad () {

        switch(this.Input_Type){
            case INPUT_TYPE.Joystick:
                this.node.on(cc.Node.EventType.TOUCH_MOVE, this.Joystick_Touch_Move, this);
                this.node.on(cc.Node.EventType.TOUCH_START, this.Joystick_Touch_Start, this);
                this.node.on(cc.Node.EventType.TOUCH_END, this.Joystick_Touch_End, this);
                this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.Joystick_Touch_End, this);
            break;

            case INPUT_TYPE.Button:
                this.node.on(cc.Node.EventType.TOUCH_START, this.Button_Touch_Start, this);
                this.node.on(cc.Node.EventType.TOUCH_END, this.Button_Touch_End, this);
                this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.Button_Touch_End, this);
            break;
        }

        // Joystick
        this.Dead_Zone = 20;
        this.Joystick_Min = 50;
        this.Joystick_Max = 100;
        this.Joystick_Down = false;
        this.Joystick_Vector = cc.v2();
        
    },

    onDisable(){
        this.Touch_End();
    },

    onDestroy(){
        this.Touch_End();
    },

    Button_Touch_Start(event){
        smsg.Input_Control.Button_Touch_Start(this.Input_Channel);
    },

    Button_Touch_End(event){
        smsg.Input_Control.Button_Touch_End(this.Input_Channel);
    },

    Joystick_Touch_Start(event){
        let touch_pos = event.getLocation();
        let local_touch_pos = this.node.convertToNodeSpaceAR(touch_pos);

        // out of dead zone
        if( this.Check_Dead_Zone(local_touch_pos) ){
            this.Limit_Joystick_Vector(local_touch_pos);
            this.Joystick_Down = true;
            this.Joystick_Vector = local_touch_pos;
            smsg.Input_Control.Joystick_Touch_Start(this.Input_Channel,this.Joystick_Vector);
        }
    },

    Joystick_Touch_End(){
        this.Joystick_Down = false;
        this.Joystick_Vector = cc.Vec2.ZERO;
        smsg.Input_Control.Joystick_Touch_End(this.Input_Channel);
    },

    Joystick_Touch_Move(event){

        let touch = event.getTouches()[0];

        let touch_pos = touch.getLocation();
        let local_touch_pos = this.node.convertToNodeSpaceAR(touch_pos);


        if( this.Check_Dead_Zone(local_touch_pos) ){

            if(this.Joystick_Down === false){ // touch was in dead zone
                this.Joystick_Touch_Start(touch);
                return;
            }
            this.Limit_Joystick_Vector(local_touch_pos);
            this.Joystick_Vector = local_touch_pos;
            smsg.Input_Control.Joystick_Touch_Move(this.Input_Channel,this.Joystick_Vector);

        }else if(this.Joystick_Down === true){ // call end
            this.Joystick_Touch_End();
        }

    },

    Check_Dead_Zone(local_touch_pos){
        return ! ((local_touch_pos.x < this.Dead_Zone && local_touch_pos.x > -this.Dead_Zone) && (local_touch_pos.y < this.Dead_Zone && local_touch_pos.y > -this.Dead_Zone));
    },

    Limit_Joystick_Vector(joystick_vector){    
        let input_mag = joystick_vector.mag();
        if(input_mag > this.Joystick_Max){ // max
            joystick_vector.mulSelf(this.Joystick_Max/input_mag);
        }else if(input_mag < this.Joystick_Min){ // min
            joystick_vector.mulSelf(this.Joystick_Min/input_mag);
        }else{ 
            input_mag = (this.Joystick_Max-this.Joystick_Min)/(100-this.Dead_Zone)*(input_mag-this.Dead_Zone)+this.Joystick_Min;// lerp
            joystick_vector.normalizeSelf();
            joystick_vector.mulSelf(input_mag);
        }
    },
    

});
