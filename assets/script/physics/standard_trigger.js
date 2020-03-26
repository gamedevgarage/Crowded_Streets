
// Module for trigger area

// Action type
var ACTION_TYPE = require("action_type");

// Standard action
var STANDARD_ACTION = require("standard_action");

// Trigger type
var TRIGGER_TYPE = cc.Enum({
    onEnter:-1,
    onExit:-1,
    onAreaOccupied: -1,
    onAreaCleared: -1,
    onHit:-1,
    onChange:-1,
});


// Logic Data
var LOGIC_DATA = cc.Enum({
    True:1,
    False:0,
});

// Logic Trigger Input Selection
var LOGIC_TRIGGER_INPUT_SELECTION = cc.Enum({
    Input_0:-1,
    Input_1:-1,
    Input_2:-1,
    Input_3:-1,
    Input_4:-1,
    Input_5:-1,
    Input_6:-1,
    Input_7:-1,
    Input_8:-1,
    Input_9:-1,
});

// Animation Mode
var ANIMATION_MODE = cc.Enum({
    Play:-1,
    Play_Additive:-1,
    Stop:-1,
    Pause:-1,
    Resume:-1,
});

// Animation Clip
var ANIMATION_CLIP = cc.Enum({
    Clip_0:-1,
    Clip_1:-1,
    Clip_2:-1,
    Clip_3:-1,
    Clip_4:-1,
    Clip_5:-1,
    Default:-1,
    All:-1,
});



var TRIGGER = cc.Class({
    name: "TRIGGER",
    properties: {

        Trigger_Type:{ // Trigger Area
            default:TRIGGER_TYPE.onEnter,
            type:TRIGGER_TYPE,
        },

        Hit_Treshold:{
            default:25,
            visible(){
                return this.Trigger_Type == TRIGGER_TYPE.onHit;
            }
        },

        Actions:{
            default:[],
            type:[STANDARD_ACTION],
        }



    },

    
    // onLoad function must be called by master component
    onLoad(){

        this.Contacted_Objects = []; // Object list for begin/end contact

        this.Wait_Frames = this.Wait_Time * (1/cc.game.getFrameRate());
        this.vec_area = cc.v2();
        this.vec_object = cc.v2();
        this.v_angular = 0;
        this.v_linear = cc.v2();

        this.Rigid_Body =  this.node.getComponent(cc.RigidBody);

        // STANDARD_ACTION: Set action functions to required action functions and call onLoad for each action
        for(let i = 0 , n = this.Actions.length ; i<n ; i++){
            //this.Actions[i].Action_Function = this.Actions[i][Object.keys(ACTION_TYPE)[this.Actions[i].Action_Type]]; // RELOAD PROBLEM
            this.Actions[i].node = this.node;
            this.Actions[i].onLoad(); // onLoad call
        }

        // Optimization
        this.PI_div_180 = Math.PI / 180;
        this.Actions_Length = this.Actions.length;
    },

    onDestroy(){
        for(let i = 0 , n = this.Actions.length ; i<n ; i++){
            this.Actions[i].onDestroy(); // onDestroy call
        }
    },

    update(dt){
        for(let i = 0 , n = this.Actions.length ; i<n ; i++){
            this.Actions[i].update(dt);
        }
    },

    // Trigger Functions =======================

    onEnter: function(node){},
    onExit: function(node){},
    onAreaOccupied: function(node){},
    onAreaCleared: function(){},
    onHit: function(node){},
    onChange: function(node){},

    // onHit solver
    onPostSolve(contact, selfCollider, otherCollider) {

        if( Math.abs( contact.getImpulse().normalImpulses ) > this.Hit_Treshold ){ // treshold reached

            let index = this.Contacted_Objects.indexOf(otherCollider.node);

            if( index == -1  ){ // if not in list (new body) -> we apply onHit

                this.Contacted_Objects.push(otherCollider.node); // add body to list

                this.onHit(otherCollider.node); // Apply on Hit

            }

        }
    },

    onBeginContact(node){

        // BEGIN CONTACT
        //cc.log("Begin Contact: " + node.name);

    },

    onEndContact(node){

        let index = this.Contacted_Objects.indexOf(node);
        this.Contacted_Objects.splice(index, 1); // remove body from list

        // END CONTACT
        //cc.log("End Contact: " + node.name);

    },


    // Action function
    Action_Function(node){

        for(let i = 0 ; i<this.Actions_Length ; i++){
            this.Actions[i].Action_Function(node);
        }
        
    },

    // Save Game
    Get_Comp_Data(){

        let comp_data = {};
        comp_data.Actions = [];

        for(let i = 0 , n = this.Actions.length ; i < n ; i++ ){
            comp_data.Actions.push( this.Actions[i].Get_Comp_Data() ); // 
        }

        return comp_data;
    },

    // Load Game
    Set_Comp_Data( comp_data  ){

        for(let i = 0 , n = this.Actions.length ; i < n ; i++ ){
            this.Actions[i].Set_Comp_Data(comp_data.Actions[i]);
        }

    },
    

});



module.exports = TRIGGER;