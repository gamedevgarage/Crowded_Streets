

cc.Class({
    extends: cc.Component,

    properties: {
        Whistle_Range:cc.Node,
        Warn_Range:cc.Node,
        Siren_Range:cc.Node,

        Whistle_SFX:require("audio_action"),
        Warn_SFX:require("audio_action"),
        Siren_SFX:require("audio_action"),
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

        // Actions
        this.Whistle_Duration = 0.5;
        this.Whistle_Cooldown = 0.5;
        this.Whistle_Countdown = 0;
        this.Whistle_Durability = 100;

        this.Warn_Battery = 100;
        this.Warn_Battery_Drain = 10;
        this.update_warn_battery = 0; // (-) when using , (+) when charging
        this.Warn_Recharging = false;
        this.Warn_Battery_Recharge_Speed = 12;
        this.Warn_Durability = 100;

        // Actions
        this.Siren_Duration = 5;
        this.Siren_Cooldown = 30;
        this.Siren_Countdown = 0;
        this.Siren_Durability = 100;


        // add listeners
        smsg.Input_Control.node.on("joystick_touch_start",this.Joystick_Touch_On,this);
        smsg.Input_Control.node.on("joystick_touch_move",this.Joystick_Touch_On,this);
        smsg.Input_Control.node.on("joystick_touch_end",this.Joystick_Touch_Off,this);

        smsg.Input_Control.node.on("whistle_touch_start",this.Whistle_Touch_Start,this);
        // smsg.Input_Control.node.on("whistle_touch_end",this.Whistle_Touch_End,this);

        smsg.Input_Control.node.on("warn_touch_start",this.Warn_Touch_Start,this);
        smsg.Input_Control.node.on("warn_touch_end",this.Warn_Touch_End,this);

        smsg.Input_Control.node.on("siren_touch_start",this.Siren_Touch_Start,this);
        // smsg.Input_Control.node.on("siren_touch_end",this.Siren_Touch_End,this);
        
    },

    Joystick_Touch_On(joystick_vector){
        this.Walk_Vector = joystick_vector.mul(100);
        this.Walk_Angle = -cc.misc.radiansToDegrees(this.Walk_Vector.signAngle(cc.Vec2.UP));
    },

    Joystick_Touch_Off(){
        this.Walk_Vector = cc.v2();
    },

    Whistle_Touch_Start(){
        if(this.Whistle_Countdown < 0 && this.Whistle_Durability > 0){
            this.Whistle_Countdown = this.Whistle_Cooldown;
            this.Whistle_Range.active=true;
            this.Whistle_SFX.Trigger_Audio_Action();
            this.scheduleOnce(this.Stop_Whistle,this.Whistle_Duration);
            // this.Whistle_Durability -= 2;
        }
    },
    Stop_Whistle(){       
        this.Whistle_Range.active=false;
    },
    // Whistle_Touch_End(){
    //     this.Whistle_Range.active=false;
    // },

    Warn_Touch_Start(){

        if( !this.Warn_Recharging && this.Warn_Battery > 0 && this.Warn_Durability > 0){
            this.Warn_Range.active=true;
            this.Warn_SFX.node.active = true;
            this.Warn_Active = true;
            this.update_warn_battery = -this.Warn_Battery_Drain;
            this.Warn_Update_Battery(-this.Warn_Battery_Drain/2);
        }

    },
    Warn_Update_Battery(amount){
        this.Warn_Battery += amount;
        if(!this.Warn_Recharging && this.Warn_Battery < 0){
            this.Warn_Touch_End();
        }else if(this.Warn_Recharging && this.Warn_Battery > 100 ){
            this.Warn_Stop_Recharge();
        }
        // cc.log("Battery: " +this.Warn_Battery);
    },  
    Warn_Touch_End(){

        this.Warn_Range.active=false;
        this.Warn_SFX.node.active = false;

        if(!this.Warn_Recharging){
            this.update_warn_battery = 0;
            if(this.Warn_Battery < 0){
                this.Warn_Start_Recharge();
            }
        }
    },

    Warn_Start_Recharge(){
        this.Warn_Recharging = true;
        this.update_warn_battery = this.Warn_Battery_Recharge_Speed;
    },

    Warn_Stop_Recharge(){
        this.Warn_Recharging = false;
        this.update_warn_battery = 0;
    },

    Siren_Touch_Start(){
        if(this.Siren_Countdown < 0 && this.Siren_Durability > 0){
            this.Siren_Countdown = this.Siren_Cooldown;
            this.Siren_Range.active=true;
            this.Siren_SFX.node.active = true;
            this.scheduleOnce(this.Stop_Siren,this.Siren_Duration);
            // this.Siren_Durability -= 2;
        }
    },
    
    Stop_Siren(){       
        this.Siren_Range.active=false;
        this.Siren_SFX.node.active = false;
    },

    // Siren_Touch_End(){
    //     this.Siren_Range.active=false;
    // },

    update (dt) {

        this.node.angle = this.Walk_Angle;//cc.misc.lerp(this.node.angle,this.Walk_Angle,0.3);;
        this.Rigid_Body.applyForceToCenter(this.Walk_Vector,true);

        // Whistle
        this.Whistle_Countdown-=dt;

        // Warn
        this.Warn_Update_Battery(this.update_warn_battery*dt);

        // Siren
        this.Siren_Countdown-=dt;

    },

    Send_Citizen_Home(node){
        node.citizen_control && node.citizen_control.Go_Home();
    },

});
