

var CITIZEN_STATE_LIST = cc.Enum({
    Idle:-1,
    Walk:-1,
});

cc.Class({
    extends: cc.Component,

    properties: {

        Sensor:cc.Node,

        Target_Node:cc.Node,

    },

    __preload(){
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


    },

    start () {

        this.Change_State(CITIZEN_STATE_LIST.Idle);

    },

    update (dt) {

        switch(this.STATE){

            case CITIZEN_STATE_LIST.Idle: // IDLE
                this.Idle_Time -= dt;
                if(this.Idle_Time <= 0){
                    this.Change_State(CITIZEN_STATE_LIST.Walk);
                }
            break;

            case CITIZEN_STATE_LIST.Walk: // WALK
                let cur_pos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);

                // we are on target
                if( cur_pos.x < this.Walk_Target.x+this.Walk_Target_Radius && cur_pos.x > this.Walk_Target.x-this.Walk_Target_Radius &&
                    cur_pos.y < this.Walk_Target.y+this.Walk_Target_Radius && cur_pos.y > this.Walk_Target.y-this.Walk_Target_Radius)
                {
                    // this.Change_State(CITIZEN_STATE_LIST.Idle);
                    this.Set_Random_Walk_Target();
                    return;
                }

                let walk_vec = this.Walk_Target.sub(cur_pos);
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

            case CITIZEN_STATE_LIST.Walk:
                
                if(!this.Walk_Target){ // if no target, set target
                    this.Set_Random_Walk_Target();
                    
                }
                this.scheduleOnce(function(){
                    this.Sensor.active=true;
                }.bind(this),1);
                
                this.STATE = CITIZEN_STATE_LIST.Walk;
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

            let obstacle = this.Ray_Cast(cur_pos,target_point)[0];
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

    Hit_Something(){
        // cc.log("Hit_Something");
        this.Change_State(CITIZEN_STATE_LIST.Idle);
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

    Ray_Cast(p1,p2){
        return cc.director.getPhysicsManager().rayCast(p1,p2,cc.RayCastType.Closest);
    },

});
