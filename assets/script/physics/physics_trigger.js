

var OBJECT_TAG_LIST = require("object_tag_list"); // Get tag list

// Action type
var ACTION_TYPE = require("action_type");

// Standard action
var STANDARD_ACTION = require("standard_action");

// Standard trigger
var STANDARD_TRIGGER = require("standard_trigger");


// Trigger type
var TRIGGER_TYPE = cc.Enum({
    onEnter:-1,
    onExit:-1,
    onAreaOccupied: -1,
    onAreaCleared: -1,
    onHit:-1,
    onChange:-1,
});



// =====================================================================================
// =====================================================================================
// =====================================================================================


var PHYSICS_TRIGGER = cc.Class({

    extends: cc.Component,

    editor: CC_EDITOR && {
        menu: 'SMSG/Triggers/physics_trigger',
        /* requireComponent: cc.PhysicsBoxCollider, */
    },

    properties: {

        Include_Objects:{
            default:[],
            type:[cc.Node],
            visible(){
                return !this.Exclude_Tags.length && !this.Include_Tags.length && !this.Exclude_Objects.length;
            }
        },

        Exclude_Objects:{
            default:[],
            type:[cc.Node],
            visible(){
                return !this.Exclude_Tags.length && !this.Include_Tags.length && !this.Include_Objects.length;
            }
        },

        Include_Tags:{
            default:[],
            type:[OBJECT_TAG_LIST],
            tooltip:"Objects to include",
            visible(){
                return !this.Exclude_Tags.length && !this.Include_Objects.length && !this.Exclude_Objects.length;
            }
        },

        Exclude_Tags:{
            default:[],
            type:[OBJECT_TAG_LIST],
            tooltip:"Objects to exclude",
            visible(){
                return !this.Include_Tags.length && !this.Include_Objects.length && !this.Exclude_Objects.length;
            }
        },

        Triggers:{
            default:[],
            type:[STANDARD_TRIGGER],
        }

    },

    __preload(){
        this.node.physics_trigger = this;
    },

    onLoad () {

        // Get RigidBody
        this.body = this.node.getComponent(cc.RigidBody);

        if(!this.body){
            cc.warn(this.name +": No RigidBody component!");
            return;
        }

        // Make sure it's enabled
        this.body.enabledContactListener = true; 


        this.Bodies = []; // Bodies interacting to area
        this.Colliders = []; // Collider count for bodies


        // Animated Trigger Area
        this.Lock_Position = cc.v2();
        this.Lock_Rotation = 0;

        this.Animate_Area = function(){};
        if(this.body.type !=  cc.RigidBodyType.Static && this.body.type !=  cc.RigidBodyType.Dynamic){
            this.Animate_Area = function(){
                this.node.x = this.Lock_Position.x;
                this.node.y = this.Lock_Position.y;
                this.node.angle = this.Lock_Rotation;
            };
        }


        // Filter Function

        // Generate keys
        this.Exclude_Tags_Filter_Key = 0;
        for(let i = 0, n = this.Exclude_Tags.length ; i < n ; i++){
            let bit = smsg.util.Get_Bit_Key(this.Exclude_Tags[i]);
            this.Exclude_Tags_Filter_Key |=bit;
        }

        this.Include_Tags_Filter_Key = 0;
        for(let i = 0, n = this.Include_Tags.length ; i < n ; i++){
            let bit = smsg.util.Get_Bit_Key(this.Include_Tags[i]);
            this.Include_Tags_Filter_Key |=bit;
        }

        this.Object_Filter = function(node){return true;};
    
        if(this.Exclude_Objects.length){
            this.Object_Filter=function(node){ 
                return ( this.Exclude_Objects.indexOf(node) == -1 ); // return true if this object is not defined in the property
            };
        }else if(this.Include_Objects.length){
            this.Object_Filter=function(node){ 
                return ( this.Include_Objects.indexOf(node) != -1); // return true if this object defined in the property
            };
        }else if(this.Exclude_Tags.length){
            this.Object_Filter=function(node){ 
                return !smsg.util.Test_Object_Tag( node.smsg_tag , this.Exclude_Tags_Filter_Key );// return true if not excluded
            };
        }else if(this.Include_Tags.length){
            this.Object_Filter=function(node){ 
                return smsg.util.Test_Object_Tag( node.smsg_tag , this.Include_Tags_Filter_Key );// return true if included
            };
        }


        // Trigger Functions ==========================================================

        this.Trigger_List = [];

        // define arrays
        let vals = Object.values(TRIGGER_TYPE);
        for(let i = 0 , n = vals.length ; i < n ; i++){
            this.Trigger_List[vals[i]] = [];
        }


        for(let i = 0 , n = this.Triggers.length ; i<n ; i++ ){
            this.Trigger_List[this.Triggers[i].Trigger_Type].push(this.Triggers[i]);
        }



        // Trigger Functions
        this.onEnter = function(node){
            let sub_list = this.Trigger_List[TRIGGER_TYPE.onEnter];
            for( let i = 0 , n = sub_list.length ; i<n ; i++ ){
                sub_list[i].onEnter(node);
            }
        };

        this.onExit = function(node){
            let sub_list = this.Trigger_List[TRIGGER_TYPE.onExit];
            for( let i = 0 , n = sub_list.length ; i<n ; i++ ){
                sub_list[i].onExit(node);
            }
        };

        this.onChange = function(node){
            let sub_list = this.Trigger_List[TRIGGER_TYPE.onChange];
            for( let i = 0 , n = sub_list.length ; i<n ; i++ ){
                sub_list[i].onChange(node);
            }
        };

        this.onAreaOccupied = function(node){
            let sub_list = this.Trigger_List[TRIGGER_TYPE.onAreaOccupied];
            for( let i = 0 , n = sub_list.length ; i<n ; i++ ){
                sub_list[i].onAreaOccupied(node);
            }
        };
        this.onAreaCleared = function(){
            let sub_list = this.Trigger_List[TRIGGER_TYPE.onAreaCleared];
            for( let i = 0 , n = sub_list.length ; i<n ; i++ ){
                sub_list[i].onAreaCleared();
            }
        };
        this.onHit = function(contact, selfCollider, otherCollider){
            let sub_list = this.Trigger_List[TRIGGER_TYPE.onHit];
            for( let i = 0 , n = sub_list.length ; i<n ; i++ ){
                sub_list[i].onPostSolve(contact, selfCollider, otherCollider);
            }
        };
        

        // Set triggers to actions  ** !MAGIC! **
        for(let i = 0 , n = this.Triggers.length ; i<n ; i++ ){
             // Set trigger function to related action function  ** !MAGIC! **
             this.Triggers[i][Object.keys(TRIGGER_TYPE)[this.Triggers[i].Trigger_Type]] = this.Triggers[i]["Action_Function"];
        }

        // onLoad Actions 
        for(let i = 0 , n = this.Triggers.length ; i<n ; i++ ){
            this.Triggers[i].node = this.node;
            this.Triggers[i].onLoad();
        }

        // Optimization
        this.onhit_list = this.Trigger_List[TRIGGER_TYPE.onHit];
        this.onhit_list_length = this.onhit_list.length;

        // Stop actions when scene unloading because destroyed objects may trigger onEndContact
        smsg.Main_Game_Control.node.on("unloading_scene",this.Game_Loading,this);
    },

    onEnable(){
        this.Bodies = []; // Bodies interacting to area
        this.Colliders = []; // Collider count for bodies
    },

    Game_Loading(){ // Prevent stupid triggers while game is loading

        this.onEndContact = function(){};

    },

    onDestroy(){
        for(let i = 0 , n = this.Triggers.length ; i<n ; i++ ){
            this.Triggers[i].onDestroy();
        }
    },

    start(){

        this.Lock_Position.x = this.node.position.x; this.Lock_Position.y = this.node.position.y;
        this.Lock_Rotation = this.node.angle;

    },

    Animate_Area:function(){}, // Dynamically set if animated body

    update (dt) {

        for(let i = 0 , n = this.Triggers.length ; i<n ; i++){
            this.Triggers[i].update(dt);
        }
        
        // If animated trigger area
        this.Animate_Area();

    },


    onBeginContact(contact, selfCollider, otherCollider) {
        
        if(this.Object_Filter(otherCollider.node)){ // Object passed the filter

            let index = this.Bodies.indexOf(otherCollider.body);

            if( index === -1  ){ // if not in list (new body)

                this.Bodies.push(otherCollider.body); // add body to list
                this.Colliders.push(1); // add collider count for this body
                
                // onEnter trigger
                this.onEnter(otherCollider.body.node);

                // onChange
                this.onChange(otherCollider.body.node);

                // Notify trigger for onBeginContact
                for( let i = 0 ; i < this.onhit_list_length ; i++ ){
                    this.onhit_list[i].onBeginContact(otherCollider.node);
                }

                // onAreaOccupied trigger
                if(this.Bodies.length === 1){ // first object entered
                    this.onAreaOccupied(otherCollider.node);
                }


            }else{ // already in list, another collider of same body entered the area, increment the count
                this.Colliders[index]++;
            }

        }

    },


    onEndContact(contact, selfCollider, otherCollider) { 

        if(this.node._activeInHierarchy===false)return;// prevent stupid trigger when destroying

        //if(this.Object_Filter(otherCollider.node)){ // Object passed the filter *** no need filtering!

            let index = this.Bodies.indexOf(otherCollider.body);

            if (index != -1) {
                this.Colliders[index]--;// decrement collider count of the body

                if(this.Colliders[index] == 0){ // if all colliders are out
                    this.Bodies.splice(index, 1); // remove body from list
                    this.Colliders.splice(index, 1); // remove collider count from list

                    // onExit trigger
                    this.onExit(otherCollider.body.node);

                    // onChange
                    this.onChange(otherCollider.body.node);

                    // Notify trigger for onEndContact
                    for( let i = 0  ; i < this.onhit_list_length ; i++ ){
                        this.onhit_list[i].onEndContact(otherCollider.node);
                    }

                    // onAreaCleared trigger
                    if(this.Bodies.length == 0){
                        this.onAreaCleared();
                    } 

                }
                
            }

            
        //}
    },

    onPostSolve(contact, selfCollider, otherCollider) {

        this.onHit(contact, selfCollider, otherCollider);
        
    },

    // Public
    Node_In_List(node){ // Check if node is in collided list
        for(let i = 0 ; i < this.Bodies.length ; i++){
            if(this.Bodies[i].node === node){
                return true;
            }
        }
        return false;
    },

    // Save Game
    Get_Comp_Data(){

        let comp_data = {};
        comp_data.Triggers = [];

        for(let i = 0 , n = this.Triggers.length ; i < n ; i++ ){
            comp_data.Triggers.push( this.Triggers[i].Get_Comp_Data() ); // 
        }

        return comp_data;
    },

    // Load Game
    Set_Comp_Data( comp_data  ){

        for(let i = 0 , n = this.Triggers.length ; i < n ; i++ ){
            this.Triggers[i].Set_Comp_Data(comp_data.Triggers[i]);
        }

    },

});

module.exports = PHYSICS_TRIGGER;
