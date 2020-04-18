

var CITIZEN_STATE_LIST = require("citizen_state_list");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    __preload(){
        this.node.home_control = this;
        this.node.smsg_tag = smsg.util.Get_Bit_Key(smsg.OBJECT_TAG_LIST.Home);
    },

    onLoad () {
        if(!this.node.physics_trigger){
            cc.error(this.name + "No physics_trigger found!");
        }
    },

    // start () {},

    // update (dt) {},

    Citizen_Arrived(node,force=false){
       // Arrived at home
       if(force || ( node.citizen_control && node.citizen_control.STATE === CITIZEN_STATE_LIST.Walk_Home ) ){
            node.active = false;
            node.parent = null;
            
            smsg.Camera_Control.Add_Node_Tree_To_Mesh_List(node);

            smsg.Game_Control.Home_Citizen(node);
            
        }
    }, 

    Spawn_Citizen(citizen_node){

        let position = cc.v2(0,30);
        let rotation = smsg.util.Get_World_Rotation(this.node);
        position.rotateSelf(cc.misc.degreesToRadians(-rotation));
        position.addSelf(this.node.convertToWorldSpaceAR(cc.Vec2.ZERO));

        citizen_node.parent = smsg.Game_Layer;
        citizen_node.position = position;
        citizen_node.angle = -rotation;

        citizen_node.citizen_control.Change_State(CITIZEN_STATE_LIST.Walk_Random);

        citizen_node.active = true;

        smsg.Camera_Control.Add_Node_Tree_To_Mesh_List(citizen_node);

    },

});
