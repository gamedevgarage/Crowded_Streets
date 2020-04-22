
var INPUT_CHANNEL_LIST = require("input_channel_list");

var INPUT_TYPE = require("input_type");

var KEY_LIST = cc.Enum(cc.macro.KEY);

var JOYSTICK_KEYS = cc.Enum({
    WASD: -1,
    Arrows:-1,
});

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

        Joystick_Ball:{
            default:null,
            type:cc.Node,
            visible(){
                return this.Input_Type === INPUT_TYPE.Joystick;
            },
        },

        Key:{
            default:0,
            type: KEY_LIST,
            visible(){
                return this.Input_Type === INPUT_TYPE.Button;
            }
        },

        Joystick_Keys:{
            default:JOYSTICK_KEYS.Arrows,
            type:JOYSTICK_KEYS,
            visible(){
                return this.Input_Type === INPUT_TYPE.Joystick;
            },
        }

    },

    onLoad () {

        switch(this.Input_Type){
            case INPUT_TYPE.Joystick:
                this.node.on(cc.Node.EventType.TOUCH_MOVE, this.Joystick_Touch_Move, this);
                this.node.on(cc.Node.EventType.TOUCH_START, this.Joystick_Touch_Start, this);
                this.node.on(cc.Node.EventType.TOUCH_END, this.Joystick_Touch_End, this);
                this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.Joystick_Touch_End, this);
                cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.Joystick_onKeyDown, this);
                cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.Joystick_onKeyUp, this);
            break;
            case INPUT_TYPE.Button:
                this.node.on(cc.Node.EventType.TOUCH_START, this.Button_Touch_Start, this);
                this.node.on(cc.Node.EventType.TOUCH_END, this.Button_Touch_End, this);
                this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.Button_Touch_End, this);
                if(this.Key){
                    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
                    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
                }
            break;
        }

        // Joystick
        this.Dead_Zone = 20;
        this.Joystick_Min = 50;
        this.Joystick_Max = 100;
        this.Joystick_Down = false;
        this.Joystick_Vector = cc.v2();
        this.Joystick_Key_Vector = cc.v2();
        this.Key_Vec_Up = 0;
        this.Key_Vec_Down = 0;
        this.Key_Vec_Left = 0;
        this.Key_Vec_Right = 0;        
    },

    onDisable(){
        this.Touch_End();
    },


    onKeyDown (event) {
        if(event.keyCode === this.Key){
            this.Button_Touch_Start();
        }
    },

    onKeyUp (event) {
        if(event.keyCode === this.Key){
            this.Button_Touch_End();
        }
    },

    Joystick_onKeyDown (event) {

        if(this.Joystick_Keys === JOYSTICK_KEYS.WASD){

            switch(event.keyCode){

                case cc.macro.KEY.w:
                    this.Key_Vec_Up = 1;
                    this.Joystick_Key_Update();
                break;

                case cc.macro.KEY.s:
                    this.Key_Vec_Down = 1;
                    this.Joystick_Key_Update();
                break;

                case cc.macro.KEY.a:
                    this.Key_Vec_Left = 1;
                    this.Joystick_Key_Update();
                break;

                case cc.macro.KEY.d:
                    this.Key_Vec_Right = 1;
                    this.Joystick_Key_Update();
                break;

            }

        }else if(this.Joystick_Keys === JOYSTICK_KEYS.Arrows){

            switch(event.keyCode){

                case cc.macro.KEY.up:
                    this.Key_Vec_Up = 1;
                    this.Joystick_Key_Update();
                break;

                case cc.macro.KEY.down:
                    this.Key_Vec_Down = 1;
                    this.Joystick_Key_Update();
                break;

                case cc.macro.KEY.left:
                    this.Key_Vec_Left = 1;
                    this.Joystick_Key_Update();
                break;

                case cc.macro.KEY.right:
                    this.Key_Vec_Right = 1;
                    this.Joystick_Key_Update();
                break;
                
            }

        }

    },

    Joystick_onKeyUp (event) {

        if(this.Joystick_Keys === JOYSTICK_KEYS.WASD){

            switch(event.keyCode){

                case cc.macro.KEY.w:
                    this.Key_Vec_Up = 0;
                    this.Joystick_Key_Update();
                break;

                case cc.macro.KEY.s:
                    this.Key_Vec_Down = 0;
                    this.Joystick_Key_Update();
                break;

                case cc.macro.KEY.a:
                    this.Key_Vec_Left = 0;
                    this.Joystick_Key_Update();
                break;

                case cc.macro.KEY.d:
                    this.Key_Vec_Right = 0;
                    this.Joystick_Key_Update();
                break;

            }

        }else if(this.Joystick_Keys === JOYSTICK_KEYS.Arrows){

            switch(event.keyCode){

                case cc.macro.KEY.up:
                    this.Key_Vec_Up = 0;
                    this.Joystick_Key_Update();
                break;

                case cc.macro.KEY.down:
                    this.Key_Vec_Down = 0;
                    this.Joystick_Key_Update();
                break;

                case cc.macro.KEY.left:
                    this.Key_Vec_Left = 0;
                    this.Joystick_Key_Update();
                break;

                case cc.macro.KEY.right:
                    this.Key_Vec_Right = 0;
                    this.Joystick_Key_Update();
                break;
                
            }

        }

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
        this.Set_Joystick_Ball_Position(local_touch_pos);
        
        // out of dead zone
        if( this.Check_Dead_Zone(local_touch_pos) ){
            this.Limit_Joystick_Vector(local_touch_pos);
            this.Joystick_Down = true;
            this.Joystick_Vector = local_touch_pos;
            smsg.Input_Control.Joystick_Touch_Start(this.Input_Channel,this.Joystick_Vector);
        }
    },

    Joystick_Key_Update(){
        
        this.Joystick_Key_Vector.x = this.Key_Vec_Left*(-1) + this.Key_Vec_Right*1;
        this.Joystick_Key_Vector.y = this.Key_Vec_Down*(-1) + this.Key_Vec_Up*1;

        if(this.Joystick_Key_Vector.x == 0 && this.Joystick_Key_Vector.y == 0){
            this.Joystick_Touch_End();
            return;
        }

        let local_touch_pos = this.Joystick_Key_Vector.mul(100);
        this.Set_Joystick_Ball_Position(local_touch_pos);
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
        this.Set_Joystick_Ball_Position(cc.Vec2.ZERO);
    },

    Joystick_Touch_Move(event){

        let touch = event.getTouches()[0];

        let touch_pos = touch.getLocation();
        let local_touch_pos = this.node.convertToNodeSpaceAR(touch_pos);
        this.Set_Joystick_Ball_Position(local_touch_pos);

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

    Set_Joystick_Ball_Position(joystick_vector){  
        let pos = joystick_vector;
        let input_mag = joystick_vector.mag();
        if(input_mag > this.Joystick_Max){ // max
            pos = joystick_vector.mul(this.Joystick_Max/input_mag);
        }
        this.Joystick_Ball.setPosition(pos);
    },

    Touch_End(){ // called on disable
        switch(this.Input_Type){
            case INPUT_TYPE.Joystick:
                this.Joystick_Touch_End();
            break;
            case INPUT_TYPE.Button:
                this.Button_Touch_End();
            break;
        }
    },
    

});
