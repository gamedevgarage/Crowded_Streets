// Controller for all user inputs

// Events:
// -> "joystick_touch_start"
// -> "joystick_touch_end"
// -> "joystick_touch_move"

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

        // Joystcik dead zone in pixels
        this.dead_zone = 20;
        this.joystick_max = 100;

        // Input data for global usage
        this.Input_Data = {
            Joystick_Down: false,
            Joystick_Vector:cc.v2(),
        };

        this.Init_Handlers();
    },


    Init_Handlers() {

        //add input listeners
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.Key_Down, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.Key_Up, this);

        smsg.Joystick_Node.on(cc.Node.EventType.TOUCH_MOVE, this.Joystick_Touch_Move, this);
        smsg.Joystick_Node.on(cc.Node.EventType.TOUCH_START, this.Joystick_Touch_Start, this);
        smsg.Joystick_Node.on(cc.Node.EventType.TOUCH_END, this.Joystick_Touch_End, this);
        smsg.Joystick_Node.on(cc.Node.EventType.TOUCH_CANCEL, this.Joystick_Touch_End, this);
       
    },

    Remove_Handlers(){
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.Key_Down, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.Key_Up, this);
    },

    Joystick_Touch_Start(event){
        
        let touch_pos = event.getLocation();
        let local_touch_pos = smsg.Joystick_Node.convertToNodeSpaceAR(touch_pos);

        // out of dead zone
        if( this.Check_Dead_Zone(local_touch_pos) ){

            this.Limit_Joystick_Vector(local_touch_pos);

            this.Input_Data.Joystick_Down = true;
            this.Input_Data.Joystick_Vector = local_touch_pos;
    
            this.node.emit("joystick_touch_start",local_touch_pos);
    
            // cc.log("Start: " + this.Input_Data.Joystick_Vector.x+","+this.Input_Data.Joystick_Vector.y);
        }

    },

    Joystick_Touch_End(event){
        this.Input_Data.Joystick_Down = false;
        this.Input_Data.Joystick_Vector = cc.Vec2.ZERO;

        this.node.emit("joystick_touch_end");

        // cc.log("End: " + this.Input_Data.Joystick_Vector.x+","+this.Input_Data.Joystick_Vector.y);
    },

    Joystick_Touch_Move(event){

        let touch = event.getTouches()[0];

        let touch_pos = touch.getLocation();
        let local_touch_pos = smsg.Joystick_Node.convertToNodeSpaceAR(touch_pos);


        if( this.Check_Dead_Zone(local_touch_pos) ){

            if(this.Input_Data.Joystick_Down === false){ // touch was in dead zone
                this.Joystick_Touch_Start(touch);
                return;
            }
            this.Limit_Joystick_Vector(local_touch_pos);
            this.Input_Data.Joystick_Vector = local_touch_pos;

            this.node.emit("joystick_touch_move",local_touch_pos);

            // cc.log("Move: " + this.Input_Data.Joystick_Vector.x+","+this.Input_Data.Joystick_Vector.y);

        }else if(this.Input_Data.Joystick_Down === true){ // call end
            this.Joystick_Touch_End();
        }

    },

    Check_Dead_Zone(local_touch_pos){
        return ! ((local_touch_pos.x < this.dead_zone && local_touch_pos.x > -this.dead_zone) && (local_touch_pos.y < this.dead_zone && local_touch_pos.y > -this.dead_zone));
    },

    Limit_Joystick_Vector(joystick_vector){
        
        let len = joystick_vector.mag();
        if(len > this.joystick_max){
            joystick_vector.mulSelf(this.joystick_max/len);
        }

    },
    
    Key_Down (event) {

        if(event.keyCode ==  cc.KEY.back){ // back button

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
   
    Enable_Input(){
        this.Input_Enabled = true;
    },

    Disable_Input(){
        this.Input_Enabled = false;
    },

});
