

cc.Class({
    extends: cc.Component,

    properties: {

    },

    __preload(){
        smsg.Player_Control = this;
    },

    onDestroy(){
        smsg.Player_Control = null;
    },


    onLoad () {

        this.Walk_Vector = cc.v2();
        this.Walk_Angle = 0;

        this.Rigid_Body = this.node.getComponent(cc.RigidBody);

        // add listeners
        smsg.Input_Control.node.on("joystick_touch_start",this.Touch_On,this);
        smsg.Input_Control.node.on("joystick_touch_move",this.Touch_On,this);
        smsg.Input_Control.node.on("joystick_touch_end",this.Touch_Off,this);

    },


    Touch_On(joystick_vector){

        this.Walk_Vector = joystick_vector.mul(100);

        this.Walk_Angle = -cc.misc.radiansToDegrees(this.Walk_Vector.signAngle(cc.Vec2.UP));
        
        // cc.log("Angle: " + this.node.angle);
    },

    Touch_Off(joystick_vector){
        this.Walk_Vector = cc.v2();
    },



    start () {

    },

    update (dt) {

        this.node.angle = this.Walk_Angle;//cc.misc.lerp(this.node.angle,this.Walk_Angle,0.3);;

        this.Rigid_Body.applyForceToCenter(this.Walk_Vector,true);

    },

});
