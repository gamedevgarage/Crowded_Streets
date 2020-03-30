

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

        // Whistle
        this.Whistle_Enabled = true; // for cooldown
        this.Whistle_Duration = 0.5;
        this.Whistle_Cooldown = 0.5;

        // Warn
        this.Warn_Battery = 100;
        this.Warn_Battery_Consume_Rate = 10;
        this.Warn_Recharging = false;
        this.Warn_Battery_Recharge_Speed = 12;

        // Siren
        this.Siren_Enabled = true; // for cooldown
        this.Siren_Duration = 5;
        this.Siren_Cooldown = 30;


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

    Void_Func(){},

    Joystick_Touch_On(joystick_vector){
        this.Walk_Vector = joystick_vector.mul(120);
        this.Walk_Angle = -cc.misc.radiansToDegrees(this.Walk_Vector.signAngle(cc.Vec2.UP));
    },
    Joystick_Touch_Off(){
        this.Walk_Vector = cc.v2();
    },

    // WHISTLE
    Whistle_Touch_Start(){
        this.Start_Whistle();
    },
    Start_Whistle(){
        if(this.Whistle_Enabled){
            this.Whistle_Enabled = false;
            this.Whistle_Range.active=true;
            this.Whistle_SFX.Trigger_Audio_Action();
            this.scheduleOnce(this.Stop_Whistle,this.Whistle_Duration);
            this.scheduleOnce(this.Enable_Whistle,this.Whistle_Cooldown);
            smsg.Whistle_Cooldown_Indicator.sprite_effect.Start_Wipe_Animation(this.Whistle_Cooldown,0,-1);
        }
    },
    Stop_Whistle(){       
        this.Whistle_Range.active=false;
    },
    Enable_Whistle(){
        this.Whistle_Enabled = true;
    },
    // Whistle_Touch_End(){
    //     this.Whistle_Range.active=false;
    // },

    // WARN
    Warn_Update_Battery(){}, // called in update()
    Warn_Touch_Start(){
        if( !this.Warn_Recharging && this.Warn_Battery > 0 ){
            this.Warn_Range.active=true;
            this.Warn_SFX.node.active = true;
            this.Warn_Start_Consume_Battery();
        }
    },
    Warn_Start_Consume_Battery(){
        this.Warn_Update_Battery = this.Warn_Consume_Battery_Func;
    },
    Warn_Stop_Consume_Battery(){
        this.Warn_Update_Battery = this.Void_Func;
    },
    Warn_Consume_Battery_Func(dt){
        this.Warn_Battery -= this.Warn_Battery_Consume_Rate*dt;
        smsg.Warn_Battery_Indicator.sprite_effect.Set_Wipe(-this.Warn_Battery/100);
        if(this.Warn_Battery < 0){
            this.Warn_Touch_End();
            this.Warn_Start_Recharge();
        }
    },  
    Warn_Start_Recharge(){
        this.Warn_Recharging = true;
        this.Warn_Update_Battery = this.Warn_Recharge_Battery_Func;
    },
    Warn_Stop_Recharge(){
        this.Warn_Recharging = false;
        this.Warn_Update_Battery = this.Void_Func;
    },
    Warn_Recharge_Battery_Func(dt){
        this.Warn_Battery += this.Warn_Battery_Recharge_Speed*dt;
        smsg.Warn_Battery_Indicator.sprite_effect.Set_Wipe(-this.Warn_Battery/100);
        if(this.Warn_Battery > 100){
            this.Warn_Stop_Recharge();
        }
    },  
    Warn_Touch_End(){
        this.Warn_Range.active=false;
        this.Warn_SFX.node.active = false;
        if(!this.Warn_Recharging){
            this.Warn_Stop_Consume_Battery();
        }
    },

    // SIREN
    Siren_Touch_Start(){
        if(this.Siren_Enabled){
            this.Siren_Enabled = false;
            this.Siren_Range.active=true;
            this.Siren_SFX.node.active = true;
            this.scheduleOnce(this.Stop_Siren,this.Siren_Duration);
            this.scheduleOnce(this.Enable_Siren,this.Siren_Cooldown);
            smsg.Siren_Cooldown_Indicator.sprite_effect.Start_Wipe_Animation(this.Siren_Cooldown,0,-1);
        }
    },
    Stop_Siren(){       
        this.Siren_Range.active=false;
        this.Siren_SFX.node.active = false;
    },
    Enable_Siren(){
        this.Siren_Enabled = true;
    },
    // Siren_Touch_End(){
    //     this.Siren_Range.active=false;
    // },
    

    update (dt) {

        this.node.angle = this.Walk_Angle;//cc.misc.lerp(this.node.angle,this.Walk_Angle,0.3);;
        this.Rigid_Body.applyForceToCenter(this.Walk_Vector,true);

        // Warn
        this.Warn_Update_Battery(dt);

    },

    Send_Citizen_Home(node){
        node.citizen_control && node.citizen_control.Go_Home();
    },

});
