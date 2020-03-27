

var CITIZEN_STATE_LIST = cc.Enum({
    Idle:-1,
    Walk_Random:-1,
    Walk_Home:-1,
});

cc.Class({
    extends: cc.Component,

    properties: {

        Sensor:cc.Node,

        Infected:{
            default:false,
            tooltip:"Infection status",
        },

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

        this.Idle_Duration = 1; // duration to count
        this.Idle_Time = this.Idle_Duration; // count value

        this.Walk_Target = null;
        this.Walk_Target_Radius = 50;
        this.Walk_Force = 5000;

        this.Rotation_Speed = 5;
        this.Target_Distance = 400;
        this.Min_Clear_Distance = 200; // Checks if this much area is clear when setting target.

        this.Sensor_Off_Duration = 1;


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

                this.Rotate_To( -cc.misc.radiansToDegrees( walk_vec.signAngle( cc.Vec2.UP ) ) );
                
            break;

            case CITIZEN_STATE_LIST.Walk_Home: // WALK HOME
                cur_pos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);

                walk_vec = this.Walk_Target.sub(cur_pos);
                walk_vec.normalizeSelf();
                walk_vec.mulSelf(this.Walk_Force);
                this.Rigid_Body.applyForceToCenter(walk_vec,true);

                this.Rotate_To( -cc.misc.radiansToDegrees( walk_vec.signAngle( cc.Vec2.UP ) ) );
                
            break;

        }

    },

    Change_State(state){

        // cc.log("Change_State: " + state);

        switch(state){

            case CITIZEN_STATE_LIST.Idle:
                this.Idle_Time = this.Idle_Duration;
                this.STATE = CITIZEN_STATE_LIST.Idle;
                this.Walk_Target = null;
                this.Sensor.active=false;
            break;

            case CITIZEN_STATE_LIST.Walk_Random:
                if(!this.Walk_Target){ // if no target, set target
                    this.Set_Random_Walk_Target();
                }
                this.Sensor.active=false;
                this.scheduleOnce(function(){
                    this.Sensor.active=true;
                }.bind(this),this.Sensor_Off_Duration);
                this.STATE = CITIZEN_STATE_LIST.Walk_Random;
            break;

            case CITIZEN_STATE_LIST.Walk_Home:
                this.Set_Walk_Home_Target();
                this.Sensor.active=false;
                this.scheduleOnce(function(){
                    this.Sensor.active=true;
                }.bind(this),this.Sensor_Off_Duration);
                
                this.STATE = CITIZEN_STATE_LIST.Walk_Home;
            break;

        }

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

    Rotate_To(angle){

        if(angle - this.node.angle > this.Rotation_Speed){
            this.node.angle += this.Rotation_Speed;
        }else if(angle - this.node.angle < -this.Rotation_Speed){
            this.node.angle -= this.Rotation_Speed;
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

    // PUBLIC METHODS

    Hit_Something(node){
        switch(this.STATE){

            case CITIZEN_STATE_LIST.Walk_Home:

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


    

});
