

var CITIZEN_STATE_LIST = cc.Enum({
    Idle:-1,
    Walk_Random:-1,
    Walk_Home:-1,
    Pause: -1,
});


// Audio_Presets
var AUDIO_PRESET_LIST = require("audio_preset_list");

cc.Class({
    extends: cc.Component,

    properties: {

        Sensor:cc.Node,

        Infected:{
            default:false,
            tooltip:"Infection status",
        },

        Sneeze_Rate:{
            default:10,
            min:1,
            tooltip:"Per minute",
        },

        Sneeze_Range:cc.Node,

        Sneeze_SFX_Control:require("audio_action"),

    },

    __preload(){
        this.node.citizen_control = this;
        this.node.smsg_tag = smsg.util.Get_Bit_Key(smsg.OBJECT_TAG_LIST.Citizen);
    },

    onDestroy(){
    },

    onLoad () {

        this.Rigid_Body = this.node.getComponent(cc.RigidBody);

        // Defaults
        this.STATE = CITIZEN_STATE_LIST.Idle;
        this.Previous_State = this.STATE;

        this.Idle_Duration = 1; // duration to count
        this.Idle_Time = this.Idle_Duration; // count value

        this.Walk_Target = null;
        this.Walk_Target_Radius = 50;
        this.Walk_Force = 3000;
        this.Rotation_Speed = 2.5;

        this.Walk_Home_Force = 5000;
        this.Walk_Home_Rotation_Speed = 4;

        this.Target_Distance = 400;
        this.Min_Clear_Distance = 200; // Checks if this much area is clear when setting target.

        this.Sensor_Off_Duration = 1;

        this.Sneeze_Rate_Randomize = 0.3;

        if(this.Infected){
            this.Set_Infected(true,true);
        }

    },

    update (dt) {

        let cur_pos;
        let walk_vec;
        switch(this.STATE){

            case CITIZEN_STATE_LIST.Idle: // IDLE
                this.Idle_Time -= dt;
                if(this.Idle_Time <= 0){
                    this.Change_State(CITIZEN_STATE_LIST.Walk_Random);
                }
            break;

            case CITIZEN_STATE_LIST.Walk_Random: // WALK RANDOM
                cur_pos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);

                // we are on target
                if( cur_pos.x < this.Walk_Target.x+this.Walk_Target_Radius && cur_pos.x > this.Walk_Target.x-this.Walk_Target_Radius &&
                    cur_pos.y < this.Walk_Target.y+this.Walk_Target_Radius && cur_pos.y > this.Walk_Target.y-this.Walk_Target_Radius)
                {
                    // this.Change_State(CITIZEN_STATE_LIST.Idle);
                    this.Set_Random_Walk_Target();
                    return;
                }

                walk_vec = this.Walk_Target.sub(cur_pos);
                walk_vec.normalizeSelf();
                walk_vec.mulSelf(this.Walk_Force);
                this.Rigid_Body.applyForceToCenter(walk_vec,true);

                this.Rotate_To( -cc.misc.radiansToDegrees( walk_vec.signAngle( cc.Vec2.UP ) ) , this.Rotation_Speed);
                
            break;

            case CITIZEN_STATE_LIST.Walk_Home: // WALK HOME
                cur_pos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);

                walk_vec = this.Walk_Target.sub(cur_pos);
                walk_vec.normalizeSelf();
                walk_vec.mulSelf(this.Walk_Home_Force);
                this.Rigid_Body.applyForceToCenter(walk_vec,true);

                this.Rotate_To( -cc.misc.radiansToDegrees( walk_vec.signAngle( cc.Vec2.UP ) ) , this.Walk_Home_Rotation_Speed);
                
            break;

            case CITIZEN_STATE_LIST.Pause: // IDLE
                
            break;

            default:

        }
    },

    Change_State(state){
        switch(state){
            case CITIZEN_STATE_LIST.Idle:
                this.Idle_Time = this.Idle_Duration;
                this.STATE = CITIZEN_STATE_LIST.Idle;
                this.Walk_Target = null;
                this.Deactivate_Sensor();
            break;

            case CITIZEN_STATE_LIST.Walk_Random:
                if(!this.Walk_Target){ // if no target, set target
                    this.Set_Random_Walk_Target();
                }
                this.Deactivate_Sensor();
                this.scheduleOnce(this.Activate_Sensor,this.Sensor_Off_Duration);
                this.STATE = CITIZEN_STATE_LIST.Walk_Random;
            break;

            case CITIZEN_STATE_LIST.Walk_Home:
                this.Set_Walk_Home_Target();
                this.Deactivate_Sensor();
                this.scheduleOnce(this.Activate_Sensor,this.Sensor_Off_Duration);
                this.STATE = CITIZEN_STATE_LIST.Walk_Home;
            break;

            case CITIZEN_STATE_LIST.Pause:
                this.Previous_State = this.STATE;
                this.STATE = CITIZEN_STATE_LIST.Pause;
                this.unschedule(this.Activate_Sensor);
                this.Stop_Sneeze();
            break;
        }
    },

    Activate_Sensor(){
        this.Sensor.active=true;
    },

    Deactivate_Sensor(){
        this.Sensor.active=false;
    },

    Set_Random_Walk_Target(){

        let cur_pos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);

        let walk_vec = cc.v2(0,this.Target_Distance);
        let target_point;
        let try_count=0;
        for(let i = 0 ; i < 5 ; i++){
            try_count++;
            walk_vec.rotateSelf(Math.random() * Math.PI * 2);
            target_point = walk_vec.add(cur_pos);

            let obstacle = this.Ray_Cast_Closest(cur_pos,target_point)[0];
            if(obstacle){
                let distanceSqr = obstacle.point.sub(cur_pos).magSqr();
                if(distanceSqr >= this.Min_Clear_Distance*this.Min_Clear_Distance){ // Area clear
                    break;
                }
            }else{
                break;
            }
        }
        // cc.log("Try Count: " + try_count);

        this.Walk_Target = target_point;

        this.Target_Node && this.Target_Node.setPosition(this.Walk_Target);
    },

    Set_Walk_Home_Target(){

        // Get home positions
        let home_list = [];
        let distance_list = [];
        let obstacle_list = [];

        smsg.util.Find_Nodes_With_Tag_In_Tree( smsg.Game_Layer, smsg.OBJECT_TAG_LIST.Home , home_list );

        let self_pos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);

        // Check raycast from closest to furthest home node for obstacles
        for(let i = 0 ; i < home_list.length ; i++ ){
            let home_pos = home_list[i].convertToWorldSpaceAR(cc.Vec2.ZERO);
            distance_list.push(self_pos.sub(home_pos).magSqr());
            obstacle_list.push(this.Ray_Cast_All(self_pos,home_pos));

            let tag_filter = smsg.util.Get_Bit_Key(smsg.OBJECT_TAG_LIST.Home) // Ignore these objects
                           | smsg.util.Get_Bit_Key(smsg.OBJECT_TAG_LIST.Sensor) 
                           | smsg.util.Get_Bit_Key(smsg.OBJECT_TAG_LIST.Citizen);

            for(let o = 0 ; o < obstacle_list[i].length ; o++){
                if( smsg.util.Test_Object_Tag( obstacle_list[i][o].collider.node.smsg_tag , tag_filter ) ){
                    obstacle_list[i].splice(o,1);
                    o--;
                }
            }

        }

        // Set target to closest home without static obstacles if possible
        let combined_list = [];
        for(let i = 0 ; i < home_list.length ; i++){
            combined_list.push({ home: home_list[i] , distance: distance_list[i] , obstacle: obstacle_list[i] });
        }

        combined_list.sort(function (a, b) {
            if(a.obstacle.length === 0 && b.obstacle.length > 0){
                return -1;
            }
            if(a.obstacle.length > 0 && b.obstacle.length === 0){
                return 1;
            }
            if (a.distance < b.distance) {
                return -1;
            }
            if (a.distance < b.distance) {
                return -1;
            }
            if (a.distance > b.distance) {
                return 1;
            }
            return 0;
        });

        // Set walk target
        let target_home = combined_list[0].home;
        this.Walk_Target = target_home.convertToWorldSpaceAR(cc.Vec2.ZERO);

        if(target_home.physics_trigger.Node_In_List(this.node)){
            target_home.home_control.Citizen_Arrived(this.node,true);
        }

    },

    Rotate_To(angle,speed){

        if(angle - this.node.angle > speed){
            this.node.angle += speed;
        }else if(angle - this.node.angle < -speed){
            this.node.angle -= speed;
        }else{
            this.node.angle = angle;
        }
        
    },

    Ray_Cast_Closest(p1,p2){
        return cc.director.getPhysicsManager().rayCast(p1,p2,cc.RayCastType.Closest);
    },

    Ray_Cast_All(p1,p2){
        return cc.director.getPhysicsManager().rayCast(p1,p2,cc.RayCastType.AllClosest);
    },

    // Activates sneeze range sensor to infect people inside
    Sneeze(){
        this.Sneeze_Range.active = true;
        this.Play_Sneeze_SFX();
        this.scheduleOnce(function(){
            this.Sneeze_Range.active = false;
        }.bind(this),0.25);
    },

    Play_Sneeze_SFX(){
        this.Sneeze_SFX_Control.Trigger_Audio_Action();
    },


    // PUBLIC METHODS =========================================================

    Hit_Something(node){
        switch(this.STATE){

            case CITIZEN_STATE_LIST.Walk_Home:

            break;

            case CITIZEN_STATE_LIST.Pause:

            break;

            default:
                this.Change_State(CITIZEN_STATE_LIST.Idle);
        }
        
    },

    Go_Home(){
        switch(this.STATE){

            case CITIZEN_STATE_LIST.Walk_Home:

            break;

            default:
                this.Change_State(CITIZEN_STATE_LIST.Walk_Home);
        }
        
    },

    Set_Infected(status,internal = false){
        if(status){ // Infect
            if(internal || !this.Infected){
                this.Infected = true;
                this.Start_Sneeze();
                this.node.color = new cc.Color(255, 25, 25);

                if(!internal){
                    smsg.Game_Control.Citizen_Infected(1);
                }
            }
        }else{ // Heal
            if(this.Infected){
                this.Infected = false;
                this.Stop_Sneeze();
                this.node.color = new cc.Color(255, 255, 255);
            }
        }
    },

    Start_Sneeze(){
        if(this.Sneeze_Rate>0){
            let rate_randomized = this.Sneeze_Rate+(this.Sneeze_Rate*this.Sneeze_Rate_Randomize* Math.random())-(this.Sneeze_Rate*this.Sneeze_Rate_Randomize/ 2);
            this.schedule(this.Sneeze,60/(rate_randomized));
        }
    },

    Stop_Sneeze(){
        this.unschedule(this.Sneeze);
    },

    Infect_With_Sneeze(node){ // Called by sensor physics trigger
        node.citizen_control && node.citizen_control.Set_Infected(true);
    },


    Pause(){
        this.Change_State(CITIZEN_STATE_LIST.Pause);
    },


    

});
