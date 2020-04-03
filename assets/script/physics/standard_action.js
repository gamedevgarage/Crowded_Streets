var AUDIO_LAYERS = require("audio_layers");

// STANDARD ACTION MODULE
// Used in electric generator like classes to tirgger some actions

// Action type
var ACTION_TYPE = require("action_type");

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

// Camera shake type list
var CAMERA_SHAKE_TYPE = require("camera_shake_type"); 

// Camera shake duration list
var CAMERA_SHAKE_PLAY_TYPE = require("camera_shake_play_type"); 

// Distance Reference
var DISTANCE_REF = cc.Enum({
    Camera:-1,
    Spaceship:-1
});

// For Set_Camera_Target
var CAMERA_MOTION = cc.Enum({
    Follow:-1,
    Fixed:-1,
});

// Analytics event type
var ANALYTICS_EVENT_TYPE = require("analytics_event_type");

// Audio Action Type
var AUDIO_ACTION_TYPE = cc.Enum({
    Play:-1,
    Stop:-1,
    Play_FadeIn:-1,
    Stop_FadeOut:-1,
});

// Audio_Source_Comp
var AUDIO_SOURCE_COMP = cc.Enum({
    Custom:0,
    Self:1
});

// Space Travel Approach Point Selection for target level
// var APPROACH_POINT_LIST = require("level_approach_point_list");

// Mission Categories
// var MISSION_CATEGORY_LIST = require("mission_category_list").MISSION_CATEGORY_LIST;

// Object Tag List
var OBJECT_TAG_LIST = require("object_tag_list");

var CHECK_OBJECTS_FOR = cc.Enum({
    Count:-1,
    Crystal_Energy:-1
});

var STANDARD_ACTION = cc.Class({
    name: "STANDARD_ACTION",
    //extends: cc.Component,
    properties: {

        Trigger_Once:{
            default:false,
            visible:true,
            tooltip:"Trigger once",
        },

        Delay_Time:{
            default:0,
            min:0,
            visible:true,
        },

        Trigger_Count:{
            default:0,
            visible:false,
        },

        Action_Type:{
            default:ACTION_TYPE.Activate_Node,
            type:ACTION_TYPE,
        },

        Action_Node:{
            default:null,
            type:cc.Node,
            visible(){
                return this.Action_Type == ACTION_TYPE.Activate_Node || this.Action_Type == ACTION_TYPE.Deactivate_Node || this.Action_Type == ACTION_TYPE.Toggle_Node_Activation;
            }
        },

        Fade_Node:{
            default:false,
            visible(){
                return this.Action_Type == ACTION_TYPE.Activate_Node || this.Action_Type == ACTION_TYPE.Deactivate_Node || this.Action_Type == ACTION_TYPE.Toggle_Node_Activation;
            }
        },

        Fade_Node_Duration:{
            default:0.5,
            min:0,
            visible(){
                return (this.Action_Type == ACTION_TYPE.Activate_Node || this.Action_Type == ACTION_TYPE.Deactivate_Node || this.Action_Type == ACTION_TYPE.Toggle_Node_Activation) && this.Fade_Node;
            }
        },

        Event_Handler:{
            default:null,
            type:cc.Component.EventHandler,
            visible(){
                return this.Action_Type == ACTION_TYPE.Emit_Event;
            },   
        },


        // Check Objects in Trigger -----------------------------

        Physics_Trigger:{
            default:null,
            type: cc.Node,
            tooltip:"Physics Trigger to check",
            visible(){
                return this.Action_Type == ACTION_TYPE.Check_Objects_In_Trigger || this.Action_Type == ACTION_TYPE.Remove_Objects_In_Trigger;
            },
            notify(){
                if(this.Physics_Trigger){
                    let comp = this.Physics_Trigger.getComponent("physics_trigger");
                    if(!comp){
                        cc.log(this.Physics_Trigger.name + " doesn't have a physics_trigger component!");
                        this.Physics_Trigger = null;
                    }
                }
            },
        },

        Include_Tags:{
            default:[],
            type:[OBJECT_TAG_LIST],
            tooltip:"Objects to include",
            visible(){
                return this.Action_Type == ACTION_TYPE.Check_Objects_In_Trigger || this.Action_Type == ACTION_TYPE.Remove_Objects_In_Trigger;
            },
        },

        Check_Objects_For:{
            default:CHECK_OBJECTS_FOR.Count,
            type:CHECK_OBJECTS_FOR,
            tooltip:"Check objects for",
            visible(){
                return this.Action_Type == ACTION_TYPE.Check_Objects_In_Trigger;
            },
        },

        Object_Count:{
            default:1,
            type:cc.Integer,
            min:1,
            tooltip:"Object count",
            visible(){
                return (this.Action_Type == ACTION_TYPE.Check_Objects_In_Trigger && this.Check_Objects_For == CHECK_OBJECTS_FOR.Count);
            },
        },

        Remove_Objects_Count:{
            default:0,
            type:cc.Integer,
            min:0,
            tooltip:"Object count to remove, zero = infinity",
            visible(){
                return  this.Action_Type == ACTION_TYPE.Remove_Objects_In_Trigger;
            },
        },

        // Logic Trigger ------------------------------------

        Target_Logic_Trigger:{
            default:null,
            type:cc.Node,
            tooltip:"Target Logic Trigger",
            visible(){
                return this.Action_Type == ACTION_TYPE.Logic_Trigger || this.Action_Type == ACTION_TYPE.Check_Objects_In_Trigger;
            },
            notify(){
                if(this.Target_Logic_Trigger){
                    let comp = this.Target_Logic_Trigger.getComponent("logic_trigger");
                    if(comp){
                        if(this.Input_Port > comp.Input_Ports.length-1){

                            this.Input_Port = comp.Input_Ports.length-1;
                            cc.warn("***** " + this.Target_Logic_Trigger.name + " has only " + comp.Input_Ports.length + " inputs!");

                        }else{
                            this.Input_Port_Name = comp.Input_Ports[this.Input_Port].Name;
                        }
                    }
                }else{
                    this.Input_Port_Name = "";
                }
            },
        },

        Input_Port:{
            default:0,
            type:LOGIC_TRIGGER_INPUT_SELECTION,
            visible(){
                return this.Action_Type == ACTION_TYPE.Logic_Trigger || this.Action_Type == ACTION_TYPE.Check_Objects_In_Trigger;
            },
            notify(){
                if(this.Target_Logic_Trigger){
                    let comp = this.Target_Logic_Trigger.getComponent("logic_trigger");
                    if(comp){
                        if(this.Input_Port > comp.Input_Ports.length-1){

                            this.Input_Port = comp.Input_Ports.length-1;
                            cc.warn("***** " + this.Target_Logic_Trigger.name + " has only " + comp.Input_Ports.length + " inputs!");

                        }else{
                            this.Input_Port_Name = comp.Input_Ports[this.Input_Port].Name;
                        }
                    }
                }
            },
        },

        Input_Port_Name:{
            default:"",
            readonly:true,
            visible(){
                return this.Action_Type == ACTION_TYPE.Logic_Trigger || this.Action_Type == ACTION_TYPE.Check_Objects_In_Trigger;
            },
        },

        Logic_Data:{
            default:LOGIC_DATA.True,
            type:LOGIC_DATA,
            visible(){
                return this.Action_Type == ACTION_TYPE.Logic_Trigger;
            },
        },

        Animation:{
            default:null,
            type:cc.Animation,
            visible(){
                return this.Action_Type == ACTION_TYPE.Trigger_Animation;
            },
            notify(){
                if(this.Animation){
                    let comp = this.Animation.getComponent(cc.Animation);
                    if(comp){
                        let clips = comp.getClips();
                        switch(this.Animation_Clip){
                            case ANIMATION_CLIP.Default:
                                if(this.Animation.defaultClip == null){
                                    cc.warn("<standard_action>: selected clip is not valid on "+ this.Animation.name + "!");
                                }else{
                                    this.Animation_Clip_Name = this.Animation.defaultClip.name;
                                }
                            break;
                            default:
                                if(clips.length > 0){
                                    if(this.Animation_Clip > clips.length-1){
                                        this.Animation_Clip = clips.length-1;
                                        cc.warn("<standard_action>: " + this.Animation.name + " has only " + clips.length + " animation clips!");
                                    }else if(clips[this.Animation_Clip] == null){ // selection in range, check if clip is valid
                                        cc.warn("<standard_action>: selected clip is not valid on "+ this.Animation.name + "!");
                                    }else{
                                        this.Animation_Clip_Name = clips[this.Animation_Clip].name;
                                    }
                                }else{
                                    cc.warn("<standard_action>: " + this.Animation.name + " doesn't have any animation clips!");
                                }
                            break;
                        }
                    }
                }else{
                    this.Animation_Clip_Name = "";
                }
            },
        },

        Animation_Mode:{
            default:ANIMATION_MODE.Play,
            type:ANIMATION_MODE,
            visible(){
                return this.Action_Type == ACTION_TYPE.Trigger_Animation;
            }, 
        },

        Animation_Clip:{
            default:ANIMATION_CLIP.Default,
            type:ANIMATION_CLIP,
            visible(){
                return this.Action_Type == ACTION_TYPE.Trigger_Animation;
            },
            notify(){
                if(this.Animation){
                    let comp = this.Animation.getComponent(cc.Animation);
                    if(comp){
                        let clips = comp.getClips();
                        switch(this.Animation_Clip){
                            case ANIMATION_CLIP.Default:
                                if(this.Animation.defaultClip == null){
                                    cc.warn("<standard_action>: selected clip is not valid on "+ this.Animation.name + "!");
                                }else{
                                    this.Animation_Clip_Name = this.Animation.defaultClip.name;
                                }
                            break;
                            default:
                                if(clips.length > 0){
                                    if(this.Animation_Clip > clips.length-1){
                                        this.Animation_Clip = clips.length-1;
                                        cc.warn("<standard_action>: " + this.Animation.name + " has only " + clips.length + " animation clips!");
                                    }else if(clips[this.Animation_Clip] == null){ // selection in range, check if clip is valid
                                        cc.warn("<standard_action>: selected clip is not valid on "+ this.Animation.name + "!");
                                    }else{
                                        this.Animation_Clip_Name = clips[this.Animation_Clip].name;
                                    }
                                }else{
                                    cc.warn("<standard_action>: " + this.Animation.name + " doesn't have any animation clips!");
                                }
                            break;
                        }
                    }
                }else{
                    this.Animation_Clip_Name = "";
                }
            },
        },

        Animation_Clip_Name:{
            default:"",
            readonly:true,
            visible(){
                return this.Action_Type == ACTION_TYPE.Trigger_Animation;
            },
        },

        Cam_Shake_Type:{
            default:CAMERA_SHAKE_TYPE.Explosion,
            type:CAMERA_SHAKE_TYPE,
            visible(){
                return this.Action_Type == ACTION_TYPE.Camera_Shake;
            }
        },

        Cam_Shake_Play_Type:{
            default:CAMERA_SHAKE_PLAY_TYPE.Once,
            type:CAMERA_SHAKE_PLAY_TYPE,
            tooltip:"Play type.",            
            visible(){
                return this.Action_Type == ACTION_TYPE.Camera_Shake;
            }
        },

        Cam_Shake_Distance:{
            default:500,
            min:0,
            tooltip:"Maximum distance for camera shake.",
            visible(){
                return this.Action_Type == ACTION_TYPE.Camera_Shake && this.Cam_Shake_Play_Type != CAMERA_SHAKE_PLAY_TYPE.Stop;
            }
        },

        Distance_Reference:{
            default:DISTANCE_REF.Camera,
            type:DISTANCE_REF,
            visible(){
                return this.Action_Type == ACTION_TYPE.Camera_Shake && this.Cam_Shake_Play_Type != CAMERA_SHAKE_PLAY_TYPE.Stop;
            },
        },

        Target_Object:{
            default:null,
            type:cc.Node,
            tooltip:"Null means Space_Ship_Container.",
            visible(){
                return this.Action_Type == ACTION_TYPE.Set_Camera_Target;
            }
        },

        Follow_Angle:{
            default:false,
            tooltip:"Follow Angle",
            visible(){
                return this.Action_Type == ACTION_TYPE.Set_Camera_Target && this.Target_Object !== null;
            }
        },

        Follow_Zoom:{
            default:false,
            tooltip:"Follow Zoom",
            visible(){
                return this.Action_Type == ACTION_TYPE.Set_Camera_Target && this.Target_Object !== null;
            }
        },

        Smooth_Motion:{
            default:true,
            tooltip:"Smooth camera motion",
            visible(){
                return this.Action_Type == ACTION_TYPE.Set_Camera_Target && this.Target_Object !== null;
            }

        },

        Scene_Name:{
            default:"",
            visible(){
                return this.Action_Type == ACTION_TYPE.Load_Scene || this.Action_Type == ACTION_TYPE.Activate_Level;
            }
        },

        Analytics_Event_Type:{
            default:ANALYTICS_EVENT_TYPE.Custom_Event,
            type:ANALYTICS_EVENT_TYPE,
            tooltip:"Event type",
            visible(){
                return this.Action_Type == ACTION_TYPE.Analytics_Event;
            },
        },

        Analytics_Event_Detail:{
            default:"",
            tooltip:"Event detail",
            visible(){
                return this.Action_Type == ACTION_TYPE.Analytics_Event;
            },
        },

        Fade_Screen_Duration:{
            default:2,
            min:0,
            max:10,
            visible(){
                return this.Action_Type == ACTION_TYPE.Fade_In_Screen || this.Action_Type == ACTION_TYPE.Fade_Out_Screen;
            },
        },

        Indicator_Target:{
            default:null,
            type:cc.Node,
            visible(){
                return this.Action_Type == ACTION_TYPE.Set_Indicator_Target;
            },
        },

        Message_Text:{
            default:"",
            multiline:true,
            visible(){
                return this.Action_Type == ACTION_TYPE.Show_Message;
            },
        },

        i18n_Key:{
            default:"",
            multiline:false,
            tooltip:"i18n key for message text",
            notify(){
                let str = smsg.util.Eval("smsg.i18n." + this.i18n_Key);
                if(typeof str === "string" || typeof str === "number"){
                    this.Message_Text = str;
                }
            },
            visible(){
                return this.Action_Type == ACTION_TYPE.Show_Message;
            },
        },

        Message_Color:{
            default: cc.color(255,255,255),
            visible(){
                return this.Action_Type == ACTION_TYPE.Show_Message;
            },
        },

        Message_Duration:{
            default:5,
            min:0,
            visible(){
                return this.Action_Type == ACTION_TYPE.Show_Message;
            },
        },

        Audio_Source_Comp:{
            default: AUDIO_SOURCE_COMP.Self,
            type: AUDIO_SOURCE_COMP,
            tooltip:"Audio source component.",
            visible(){
                return this.Action_Type == ACTION_TYPE.Audio_Action;
            },
        },

        Audio_Source:{
            default:null,
            type:cc.AudioSource,
            visible(){
                return this.Action_Type == ACTION_TYPE.Audio_Action && this.Audio_Source_Comp == AUDIO_SOURCE_COMP.Custom;
            },
        },

        Audio_Action_Type:{
            default:AUDIO_ACTION_TYPE.Play,
            type:AUDIO_ACTION_TYPE,
            visible(){
                return this.Action_Type == ACTION_TYPE.Audio_Action;
            },
        },

        Audio_Layer:{
            default:AUDIO_LAYERS.Default,
            type:AUDIO_LAYERS,
            tooltip:"Audio layer",
            visible(){
                return this.Action_Type == ACTION_TYPE.Audio_Action && ( this.Audio_Action_Type == AUDIO_ACTION_TYPE.Play || this.Audio_Action_Type == AUDIO_ACTION_TYPE.Play_FadeIn );
            },
        },

        Audio_Volume:{
            default:0.7,
            range:[0,1],
            tooltip:"Audio volume",
            visible(){
                return this.Action_Type == ACTION_TYPE.Audio_Action && ( this.Audio_Action_Type == AUDIO_ACTION_TYPE.Play || this.Audio_Action_Type == AUDIO_ACTION_TYPE.Play_FadeIn );
            },
        },

        Audio_Fade_Duration:{
            default:1,
            min:0,
            tooltip:"Audio fade duration",
            visible(){
                return this.Action_Type == ACTION_TYPE.Audio_Action && ( this.Audio_Action_Type == AUDIO_ACTION_TYPE.Play_FadeIn || this.Audio_Action_Type == AUDIO_ACTION_TYPE.Stop_FadeOut );
            },
        },

        Cinematic_Prefab:{
            default:null,
            type:cc.Prefab,
            visible(){
                return this.Action_Type == ACTION_TYPE.Play_Cinematic;
            },

        },


        Level_Completed_Event:{ // Always send event, "monetization_control" decides what to do
            default:true,
            tooltip:"Trigger event for monetization_control.",
            visible(){
                return false; //this.Action_Type == ACTION_TYPE.Space_Travel;
            },
        },

        Remove_Objects_List:{
            default:[],
            type:[cc.Node],
            tooltip:"Remove Objects List",
            visible(){
                return this.Action_Type == ACTION_TYPE.Remove_Objects;
            },
        },

    },

    // Scheduler
    // This in not a real component. so let's fake the scheduler ;)
    // CAUTION!!! ALWAYS USE ".bind(this)"
    scheduleOnce(callback, delay){
        this.node._components[0].scheduleOnce(callback,delay);
    },
    
    onLoad(){

        //this.__instanceId = cc.ClassManager.getNewInstanceId();

        this.Animation_Clips = []; // Cache animation clips


        // Check Properties ===============================
        if(this.Action_Type == ACTION_TYPE.Logic_Trigger){ // Logic Trigger selected
            if(!this.Target_Logic_Trigger){
                cc.warn(this.node.name + ": Target_Logic_Trigger is not defined!");
                this.Logic_Trigger = function(){}; // Deactivate function
            }else{
                let comp = this.Target_Logic_Trigger.getComponent("logic_trigger");
                if(!comp){
                    cc.warn(this.node.name + ": logic_trigger component is missing on "+ this.Target_Logic_Trigger.name);
                    this.Logic_Trigger = function(){}; // Deactivate function
                }else{
                    if(this.Input_Port > comp.Input_Ports.length-1){

                        this.Input_Port = comp.Input_Ports.length-1;
                        cc.warn(this.Target_Logic_Trigger.name + " used in " + this.node.name + " has only " + comp.Input_Ports.length + " inputs!");
                        this.Logic_Trigger = function(){}; // Deactivate function
                    }
                }
            }   
        }


        if(this.Action_Type == ACTION_TYPE.Trigger_Animation){ // Play Animation selected

            if(!this.Animation){
                cc.warn(this.node.name + "<standard_action>: this.Animation is not defined!");
                this.Trigger_Animation = function(){}; // Deactivate function
            }else{

                this.Animation_Clips = this.Animation.getClips(); // Get Animation Clips from Animation Component

                if(this.Animation_Clip != ANIMATION_CLIP.Default && this.Animation_Clip != ANIMATION_CLIP.All){ // Clip number selected. Check if animation has those clips

                    if(this.Animation_Clips.length > 0){

                        if(this.Animation_Clip > this.Animation_Clips.length-1){

                            this.Animation_Clip = this.Animation_Clips.length-1;
                            cc.warn(this.node.name + "<standard_action>: " + this.Animation.name + " has only " + this.Animation_Clips.length + " animation clips!");
                            this.Trigger_Animation = function(){}; // Deactivate function

                        }else if(this.Animation_Clips[this.Animation_Clip] == null){ // selection in range, check if clip is valid

                            cc.warn(this.node.name + "<standard_action>: selected clip is not valid on "+ this.Animation.name + "!");
                            this.Trigger_Animation = function(){}; // Deactivate function
                            
                        }

                    }else{
                        cc.warn(this.node.name + "<standard_action>: " + this.Animation.name + " doesn't have any animation clips!");
                        this.Trigger_Animation = function(){}; // Deactivate function
                    }

                }else if(this.Animation_Clip == ANIMATION_CLIP.Default && this.Animation.defaultClip == null){ // check if default animation exists

                    cc.warn(this.node.name + "<standard_action>: selected clip is not valid on "+ this.Animation.name + "!");
                    this.Trigger_Animation = function(){}; // Deactivate function

                }

                

            }

        }

        // Audio Action
        if(this.Action_Type == ACTION_TYPE.Audio_Action){

            if(this.Audio_Source_Comp == AUDIO_SOURCE_COMP.Self){
                this.Audio_Source = this.node.getComponent(cc.AudioSource);
            }

            if(!this.Audio_Source){
                cc.warn(this.node.name + "<standard_action>: this.Audio_Source is invalid!");
                // Deactivate function
                this.Audio_Action = function(){};
            }

        }


        // SETUP ACTION FUNCTION
        this.Action_Function = this.Handle_Action_Function; 

        // Delay Time
        this.Delay_Remaining = this.Delay_Time; 

        // Camera shake distance
        this.Cam_Shake_Distance_Sqr = this.Cam_Shake_Distance*this.Cam_Shake_Distance;

        // Optimize
        this.Zero_Vec = cc.v2();
        this.Dist_Vec = cc.v2();

        // For delay call
        this.Scheduled_Function = null;
        this.Check_Delay_Time = function(){};

    },

    onDestroy(){
    },

    update(dt){
        this.Check_Delay_Time(dt);
    },

    Setup_Delay_Time_Check(node,remaining_time){

        this.Delay_Remaining = remaining_time || this.Delay_Time;  

        this.Check_Delay_Time = function(dt){
            this.Delay_Remaining-=dt;
            if(this.Delay_Remaining <= 0){
                this.Call_Action_Function(node);
                this.Check_Delay_Time = function(){};
            }
        };
    },

    // Handling function for all other functions
    Handle_Action_Function(node){

        if(this.Delay_Time){ // Delay_Time > 0 
            
            this.Setup_Delay_Time_Check(node);

        }else{ // CALL FUNCTION HERE **** Delay_Time == 0

            this.Call_Action_Function(node);

        }

        this.Trigger_Count_Check(); // Disable trigger if Trigger_Once is selected     

    },

    Call_Action_Function(node){
        let original_function = Object.keys(ACTION_TYPE)[this.Action_Type];
        this[original_function](node); // Call original function
    },

    // Action Functions =======================

    // None
    None: function(){},

    
    // Activate node
    Activate_Node: function(){
        if(this.Action_Node && cc.isValid(this.Action_Node)){
            this.Action_Node.active = true;
            if(this.Fade_Node){
                let fade = cc.fadeIn(this.Fade_Node_Duration);
                this.Action_Node.runAction(fade);
            }
        }
    },

    // Deactivate node
    Deactivate_Node: function(){
        if(this.Action_Node && cc.isValid(this.Action_Node)){
            if(this.Fade_Node){
                let fade = cc.fadeOut(this.Fade_Node_Duration);
                let seq = cc.sequence(fade, cc.callFunc(function(){this.Action_Node.active=false;}.bind(this), this));
                this.Action_Node.runAction(seq);
            }else{
                this.Action_Node.active = false;
            }
        }
    },

    // Toggle node activation
    Toggle_Node_Activation: function(){
        if(this.Action_Node && cc.isValid(this.Action_Node)){
            if(this.Action_Node.active){
                this.Deactivate_Node();
            }else{
                this.Activate_Node();
            }
            
        }
    },

    // Emit event
    Emit_Event:function(node){
        if(this.Event_Handler){
            this.Event_Handler.emit([node]);
        }
    },

    // Logic Trigger
    Logic_Trigger:function(node){

        // Call Function on the target
        if(this.Target_Logic_Trigger){
            let eventHandler = new cc.Component.EventHandler();
            eventHandler.target = this.Target_Logic_Trigger;
            eventHandler.component = "logic_trigger";
            eventHandler.handler = "Set_Input"
            eventHandler.emit([this.Input_Port, this.Logic_Data]);
        }

    },

    // Trigger Animation
    Trigger_Animation:function(node){

        if(this.Animation_Clip === ANIMATION_CLIP.Default){ // handle default clip

            switch(this.Animation_Mode){

                case ANIMATION_MODE.Play:
                    this.Animation.play();
                break;

                case ANIMATION_MODE.Play_Additive:
                    this.Animation.playAdditive();
                break;

                case ANIMATION_MODE.Stop:
                    this.Animation.stop(this.Animation.defaultClip.name);
                break;

                case ANIMATION_MODE.Pause:
                    this.Animation.pause(this.Animation.defaultClip.name);
                break;

                case ANIMATION_MODE.Resume:
                    let anim_state = this.Animation.getAnimationState(this.Animation.defaultClip.name);
                    if(anim_state.isPaused){
                        this.Animation.resume(this.Animation.defaultClip.name);
                    }else{
                        this.Animation.playAdditive(this.Animation.defaultClip.name);
                    }
                break;

            }

        }else if(this.Animation_Clip === ANIMATION_CLIP.All){


            switch(this.Animation_Mode){

                case ANIMATION_MODE.Play:

                    for(let i = 0 , n = this.Animation_Clips.length ; i<n ; i++){ // Play all clips
                        this.Animation.playAdditive(this.Animation_Clips[i].name);
                    }

                break;

                case ANIMATION_MODE.Play_Additive:

                    for(let i = 0 , n = this.Animation_Clips.length ; i<n ; i++){ // Play all clips
                        this.Animation.playAdditive(this.Animation_Clips[i].name);
                    }

                break;

                case ANIMATION_MODE.Stop:
                    this.Animation.stop();
                break;

                case ANIMATION_MODE.Pause:
                    this.Animation.pause();
                break;

                case ANIMATION_MODE.Resume:

                    for(let i = 0 , n = this.Animation_Clips.length ; i<n ; i++){ // Resume all clips

                        let anim_state = this.Animation.getAnimationState(this.Animation_Clips[i].name);
                        if(anim_state.isPaused){
                            this.Animation.resume(this.Animation_Clips[i].name);
                        }else{
                            this.Animation.playAdditive(this.Animation_Clips[i].name);
                        }

                    }
                    
                break;

            }


        }else{

            switch(this.Animation_Mode){

                case ANIMATION_MODE.Play:
                    this.Animation.play(this.Animation_Clips[this.Animation_Clip].name);
                break;

                case ANIMATION_MODE.Play_Additive:
                    this.Animation.playAdditive(this.Animation_Clips[this.Animation_Clip].name);
                break;

                case ANIMATION_MODE.Stop:
                    this.Animation.stop(this.Animation_Clips[this.Animation_Clip].name);
                break;

                case ANIMATION_MODE.Pause:
                    this.Animation.pause(this.Animation_Clips[this.Animation_Clip].name);
                break;

                case ANIMATION_MODE.Resume:
                    let anim_state = this.Animation.getAnimationState(this.Animation_Clips[this.Animation_Clip].name);
                    if(anim_state.isPaused){
                        this.Animation.resume(this.Animation_Clips[this.Animation_Clip].name);
                    }else{
                        this.Animation.playAdditive(this.Animation_Clips[this.Animation_Clip].name);
                    }
                break;
                
            }

        }

    },

    // Activate node
    Render_Visibility: function(){
        this.Action_Node._sgNode.setVisible(this.Visibility);    
    },

    // Camera Shake
    Camera_Shake: function(){

        this.Dist_Vec = this.node.convertToWorldSpaceAR(this.Zero_Vec);

        if( this.Cam_Shake_Play_Type == CAMERA_SHAKE_PLAY_TYPE.Stop ){ // Stop regardless of distance
            
            // Make sure smsg.Camera_Control not null. onDisable called when no camera control during transition from Game Level to Home_Screen
            smsg.Camera_Control && smsg.Camera_Control.Camera_Shake_Stop(this.Cam_Shake_Type);

        }else{

            if(this.Cam_Shake_Play_Type == CAMERA_SHAKE_PLAY_TYPE.Once){
                smsg.Camera_Control && smsg.Camera_Control.Camera_Shake(this.Cam_Shake_Type);
            }else if( this.Cam_Shake_Play_Type == CAMERA_SHAKE_PLAY_TYPE.Start ){
                smsg.Camera_Control && smsg.Camera_Control.Camera_Shake_Start(this.Cam_Shake_Type);
            }

        }

 
    },

    // Set_Camera_Target
    Set_Camera_Target: function(){

        if(this.Target_Object){
            smsg.Camera_Control.Set_Follow_Object(this.Target_Object);
            if(this.Follow_Angle === true){
                smsg.Camera_Control.Follow_Object_Rotation();
            }else{
                smsg.Camera_Control.Follow_Gravity_Rotation();
            }
    
            if(this.Follow_Zoom === true){
                smsg.Camera_Control.Follow_Object_Zoom(true);
            }else{
                smsg.Camera_Control.Follow_Object_Zoom(false);
            }
    
            if(this.Smooth_Motion === true){
                smsg.Camera_Control.Smooth_Motion(true);
            }else{
                smsg.Camera_Control.Smooth_Motion(false);
            }
        }else{
            smsg.Camera_Control.Set_Follow_Object(smsg.Space_Ship_Container);
            smsg.Camera_Control.Follow_Gravity_Rotation();
            smsg.Camera_Control.Follow_Object_Zoom(false);
            smsg.Camera_Control.Smooth_Motion(true);
        }
        
          
    },

    // Bu iptal olacak. Level'lar arası geçiş smsg.Main_Game_Control.Space_Travel_to_Level() ile yapılacak
    Load_Scene:function(){

        var spaceship_data = null;
        
        try{

            if(this.Save_Spaceship_Data && smsg.Space_Ship_Control){
                spaceship_data = smsg.Space_Ship_Control.Get_Spaceship_Data();
                //cc.director.preloadScene(this.Scene_Name);
                cc.director.loadScene(this.Scene_Name,function(){
                    smsg.Space_Ship_Control.Set_Spaceship_Data(spaceship_data);
                });
            }else{
                //cc.director.preloadScene(this.Scene_Name);
                cc.director.loadScene(this.Scene_Name);
            }

            
            
        }catch(err){
            cc.warn( this.node.name + "<standard_action>: Load_Scene():" + err);
        }
  
    },

    Activate_Level: function(){
        smsg.Main_Game_Control.Activate_Level(this.Scene_Name);
    },

    Analytics_Event: function(){
        
        let Analytics_Event_Type = this.Analytics_Event_Type;
        let Analytics_Event_Detail = this.Analytics_Event_Detail;
        this.scheduleOnce(function(){ // Be safe on destroy
            smsg.Analytics_Control.Handle_Analytics_Event( Analytics_Event_Type , Analytics_Event_Detail );
        }.bind(this), 0.1)

    },

    Fade_In_Screen: function(){

        smsg.Main_Game_Control.Fade_In_Screen(this.Fade_Screen_Duration);
    
    },

    Fade_Out_Screen: function(){

        smsg.Main_Game_Control.Fade_Out_Screen(this.Fade_Screen_Duration);
   
    },

    Enable_Controls: function(){

        smsg.Main_Game_Control.Enable_Controls();
             
    },

    Disable_Controls: function(){

        smsg.Main_Game_Control.Disable_Controls();

    },

    Show_Message: function(){
        let message = smsg.util.Eval("smsg.i18n." + this.i18n_Key) || this.Message_Text;
        smsg.Main_Game_Control.Show_Message( message , this.Message_Color , this.Message_Duration );
    },

    Audio_Action: function(){

        switch(this.Audio_Action_Type){

            case AUDIO_ACTION_TYPE.Play:

                smsg.Audio_Control.Play_AudioSource(this.Audio_Source,this.Audio_Volume,this.Audio_Layer);

            break;

            case AUDIO_ACTION_TYPE.Stop:

                smsg.Audio_Control.Stop_AudioSource(this.Audio_Source);

            break;

            case AUDIO_ACTION_TYPE.Play_FadeIn:

                smsg.Audio_Control.Play_Fadein_AudioSource(this.Audio_Source,this.Audio_Fade_Duration,this.Audio_Volume,this.Audio_Layer);

            break;

            case AUDIO_ACTION_TYPE.Stop_FadeOut:

                smsg.Audio_Control.Stop_Fadeout_AudioSource(this.Audio_Source,this.Audio_Fade_Duration);

            break;

        }

    },

    Play_Cinematic: function(){

        let cinematic_node = cc.instantiate(this.Cinematic_Prefab);

        cinematic_node.parent = smsg.UI_Foreground.getChildByName("Cinematic_Layer");
        cinematic_node.setPosition(0,0);
        cinematic_node.active = true;

    },

    Space_Travel: function(node){

        if(this.Level_Completed_Event && this.Target_Level != smsg.util.Get_Current_Scene_Name()){ // Don't show ad if use choosed to stay here
            smsg.Monetization_Control.node.emit("level_completed", function(){ 
                smsg.Main_Game_Control.Space_Travel_to_Level( this.Target_Level , this.Approach_Point , node );
            }.bind(this) ) // Emit event for ad show
        }else{
            smsg.Main_Game_Control.Space_Travel_to_Level( this.Target_Level , this.Approach_Point , node );
        }
        
    },

    Show_Space_Travel_Panel: function(node){

        // Called by physics trigger and node is space ship or connected object
        if( node !== undefined && ( node == smsg.Space_Ship_Container || node == smsg.Space_Ship_Control.Docking_Object || node == smsg.Space_Ship_Control.Roping_Object ) ){ 

            if(this.is_OK_For_Space_Travel()){
                smsg.Space_Travel_Panel_Control.Show_Space_Travel_Panel();
            }
  
        }
        
    },

    is_OK_For_Space_Travel(){
        if(smsg.Space_Ship_Control.Killed){
            return false;
        }
        if(smsg.Space_Ship_Control.Fuel < 10){ // Don't let space travel if fuel is low
            smsg.Main_Game_Control.Show_Message( "Low fuel for space travel!", cc.color(255,160,55) , 3 );
            return false;
        }
        // "Ignore Space Travel" Check
        if( (smsg.Space_Ship_Control.Docking_Object && smsg.util.Test_Object_Tag( smsg.Space_Ship_Control.Docking_Object.tag , smsg.util.Get_Bit_Key(OBJECT_TAG_LIST.Ignore_Space_Travel) ) ) ||
            (smsg.Space_Ship_Control.Roping_Object && smsg.util.Test_Object_Tag( smsg.Space_Ship_Control.Roping_Object.tag , smsg.util.Get_Bit_Key(OBJECT_TAG_LIST.Ignore_Space_Travel) ) ) ){
        
            smsg.Main_Game_Control.Show_Message( "You can't take this object!", cc.color(255,160,55) , 3 );
            return false;
        }
        return true;
    },

    Activate_Space_Travel_Destination(){
        smsg.Space_Travel_Panel_Control.Activate_Destination( this.Destination );
    },
    
    Load_Arcade_Level(){
        smsg.Main_Game_Control.Load_Arcade_Level(this.Scene_Name);
    },

    Activate_Arcade_Level(){
        smsg.Main_Game_Control.Activate_Arcade_Level(this.Scene_Name);
    },

    Configure_Spaceship(){

        let config = {

            Engine_Power: this.Engine_Power,
            Booster_Engine_Power: this.Booster_Engine_Power,
            Fuel_Consumption: this.Fuel_Consumption,
            Booster_Fuel_Consumption: this.Booster_Fuel_Consumption,
            Collision_Damage_Treshold_Impulse: this.Collision_Damage_Treshold_Impulse,
            Docking_Arm_Damage_Treshold_Impulse: this.Docking_Arm_Damage_Treshold_Impulse,
            Force_Damage_Treshold: this.Force_Damage_Treshold,
            Damage_Kill: this.Damage_Kill,
            Damage: this.Damage,
            Armor_Damage_Max: this.Armor_Damage_Max,
            Fuel_Max: this.Fuel_Max,
            Fuel: this.Fuel,
            Crystal_Energy: this.Crystal_Energy,
            Crystal_Energy_Max: this.Crystal_Energy_Max,
            Crystal_Energy_Converter_Speed: this.Crystal_Energy_Converter_Speed,
            Docking_Arm_Installed: this.Docking_Arm_Installed,
            Rope_Installed: this.Rope_Installed,
            Rocket_Booster_Installed: this.Rocket_Booster_Installed,
            Dock_Crystal_Energy_Converter_Installed: this.Dock_Crystal_Energy_Converter_Installed,
            Rope_Crystal_Energy_Converter_Installed: this.Rope_Crystal_Energy_Converter_Installed,
            Energy_Converter_Booster_Installed: this.Energy_Converter_Booster_Installed,
            Armor_Installed: this.Armor_Installed,
            Armor_Pack_Count: this.Armor_Pack_Count,
            Emergency_Refuel_Pack_Count: this.Emergency_Refuel_Pack_Count,
            Emergency_Repair_Pack_Count: this.Emergency_Repair_Pack_Count,
            Recover_Pack_Count: this.Recover_Pack_Count,

        }

        smsg.Space_Ship_Control.Configure_Spaceship(config);

    },

    // Check_Objects_In_Trigger(){

    //     let pt_comp = this.Physics_Trigger.getComponent("physics_trigger");
        
    //     if(pt_comp){

    //         // Object Tag Filter -----------------
    //         let Include_Tags_Filter_Key = 0;
    //         for(let i = 0, n = this.Include_Tags.length ; i < n ; i++){
    //             let bit = smsg.util.Get_Bit_Key(this.Include_Tags[i]);
    //             Include_Tags_Filter_Key |=bit;
    //         }
    //         let Object_Filter = function(node){return true;};// Default filter
    //         if(this.Include_Tags.length > 0){
    //             Object_Filter=function(node){
    //                 return smsg.util.Test_Object_Tag( node.tag , Include_Tags_Filter_Key );
    //             }
    //         }

    //         // Check Objects For -----------------
    //         let Bodies = pt_comp.Bodies;

    //         // Count
    //         if(this.Check_Objects_For == CHECK_OBJECTS_FOR.Count){

    //             let count = 0;
    //             for(let i = 0 ; i < Bodies.length ; i++ ){
    //                 if(!Object_Filter(Bodies[i].node)) continue; // pass if object doesn't match
    //                 count++;
    //             }

    //             if(count >= this.Object_Count){
    //                 this.Trigger_Output(1);
    //             }else{
    //                 this.Trigger_Output(0);
    //             }

    //         }else if(this.Check_Objects_For == CHECK_OBJECTS_FOR.Crystal_Energy){

    //             let total_energy = 0;
    //             for(let i = 0 ; i < Bodies.length ; i++ ){
    //                 //if(!Object_Filter(Bodies[i].node)) continue; // pass if object doesn't match
    //                 let ce_comp = Bodies[i].node.getComponent("crystal_energy");
    //                 if(ce_comp){
    //                     total_energy += ce_comp.Crystal_Energy;
    //                 }
    //             }

    //             if(total_energy >= this.Min_Energy && total_energy < this.Max_Energy){
    //                 this.Trigger_Output(1);
    //             }else{
    //                 this.Trigger_Output(0);
    //             }

    //         }

    //     }

    // },

    Trigger_Output(output){
        if(this.Target_Logic_Trigger){
            let eventHandler = new cc.Component.EventHandler();
            eventHandler.target = this.Target_Logic_Trigger;
            eventHandler.component = "logic_trigger";
            eventHandler.handler = "Set_Input"
            eventHandler.emit([this.Input_Port, output]);
        }
    },

    Remove_Objects_In_Trigger(){

        let pt_comp = this.Physics_Trigger.getComponent("physics_trigger");
        
        if(pt_comp){

            // Object Tag Filter -----------------
            let Include_Tags_Filter_Key = 0;
            for(let i = 0, n = this.Include_Tags.length ; i < n ; i++){
                let bit = smsg.util.Get_Bit_Key(this.Include_Tags[i]);
                Include_Tags_Filter_Key |=bit;
            }
            let Object_Filter = function(node){return true;};// Default filter
            if(this.Include_Tags.length > 0){
                Object_Filter=function(node){
                    return smsg.util.Test_Object_Tag( node.tag , Include_Tags_Filter_Key );
                }
            }

            // Check Objects For -----------------
            let Bodies = pt_comp.Bodies;
            let destroy_list = [];
            let count = 0;
            for(let i = 0 ; i < Bodies.length ; i++ ){
                if(Object_Filter(Bodies[i].node)){ // Destroy if filter matches
                    destroy_list.push(Bodies[i].node);
                    count++;
                    if(this.Remove_Objects_Count > 0 && count == this.Remove_Objects_Count){
                        break;
                    }
                }
            }  
            for(let i = 0 ; i < destroy_list.length ; i++){
                destroy_list[i].destroy();
            }  

        }

    },

    Remove_Objects(){

        for(let i = 0 ; i < this.Remove_Objects_List.length ; i++){

            if( cc.isValid(this.Remove_Objects_List[i]) ){
                this.Remove_Objects_List[i].destroy();
            }

        }

    },
    
    // END Action Functions =======================



    // Required for the Trigger_Once feature
    Trigger_Count_Check(){

        this.Trigger_Count++;
        if(this.Trigger_Once === true && this.Trigger_Count > 0){
            this.Action_Function = function(){};
        }

    },

    // Action function
    Action_Function: function(){},

    // Get Target Node
    Get_Target_Node(){

        switch(this.Action_Type){

            case ACTION_TYPE.Activate_Node:
            case ACTION_TYPE.Deactivate_Node:
            case ACTION_TYPE.Toggle_Node_Activation:

                return this.Action_Node;

            break;

            case ACTION_TYPE.Emit_Event:

                return this.Event_Handler.target;

            break;

            case ACTION_TYPE.Logic_Trigger:

                return this.Target_Logic_Trigger;

            break;

        }

    },

    // Save Game
    Get_Comp_Data(){

        let comp_data = {};
        comp_data.Trigger_Count = this.Trigger_Count;

        comp_data.Delay_Remaining = this.Delay_Remaining;
        
        return comp_data;

    },

    // Load Game
    Set_Comp_Data( comp_data  ){
        
        this.Trigger_Count = comp_data.Trigger_Count;
        // Disable trigger if Trigger_Once selected and already triggered
        if(this.Trigger_Once === true && this.Trigger_Count > 0){
            this.Action_Function = function(){};
        }

        if(comp_data.Delay_Remaining !== this.Delay_Time){ // Actions still not called, schedule remaining time to call
            this.Setup_Delay_Time_Check(null,comp_data.Delay_Remaining);
        }

    },


});

module.exports = STANDARD_ACTION;