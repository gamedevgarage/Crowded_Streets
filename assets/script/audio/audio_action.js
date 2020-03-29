

// Action to do
var AUDIO_ACTION = cc.Enum({
    PLAY: -1,
    STOP: -1,
    DELAY_STOP:-1,
    FADE_STOP:-1,
    FADE_PLAY:-1
});

// Audio Action Component Event
var COMP_EVENT = require("audio_trigger_type");

// Audio_Presets
var AUDIO_PRESET = require("audio_preset_list");

// Distance Reference
var DISTANCE_REF = cc.Enum({
    Camera:-1,
    Spaceship:-1
});

var AUDIO_LAYERS = require("audio_layers");

cc.Class({
    extends: cc.Component,

    editor: CC_EDITOR && {
        menu: 'SMSG/Audio/audio_action',
    },
  
    properties: {

        Comp_Event:{
            default:1,
            type:COMP_EVENT
        },

        Impulse_Min:{
            default:100,
            visible () {
                return false;//this.Comp_Event == COMP_EVENT.onHit;
            }
        },

        Impulse_Max:{
            default:400,
            visible () {
                return this.Comp_Event == COMP_EVENT.onHit;
            }
        },

        Volume_Min:{
            default:0.2,
            range:[0,1],
            visible () {
                return false;//this.Comp_Event == COMP_EVENT.onHit;
            }
        },
        
        Volume_Max:{
            default:0.4,
            range:[0,1],
            visible () {
                return false;//this.Comp_Event == COMP_EVENT.onHit;
            }
        },

        Wait_Frames:{
            default:15,
            range:[10,500],
            visible () {
                return false;//this.Comp_Event == COMP_EVENT.onHit;
            }
        },

        Max_Distance:{
            default:1000,
            range:[0,10000],
            tooltip:"Max distance the sfx can be heard",
        },

        Distance_Reference:{
            default:DISTANCE_REF.Camera,
            type:DISTANCE_REF,
            visible(){
                return this.Max_Distance != 0;
            },
        },

        Volume:{
            default:1,
            range:[0,1],
            visible () {
                return ( this.Comp_Event == COMP_EVENT.None || this.Comp_Event == COMP_EVENT.start || this.Comp_Event == COMP_EVENT.onEnable || this.Comp_Event == COMP_EVENT.onDisable || this.Comp_Event == COMP_EVENT.onBeginContact || this.Comp_Event == COMP_EVENT.Distance_Update );
            }
        },

        Update_Rate:{

            default:5,
            range:[0.1,30],
            visible(){
                return false;//(this.Comp_Event == COMP_EVENT.Distance_Update);
            },
            tooltip: "Volume updates in second"

        },

        Audio_Preset:{
            default:0,
            type:AUDIO_PRESET,
            notify(){
                this.Audio_Preset_Name = Object.keys(AUDIO_PRESET)[this.Audio_Preset];
            }
        },

        Audio_Preset_Name:{
            default:"",
            visible:false
        },

        Audio_Source:{
            default:[],
            type:[cc.AudioSource],
            visible(){
                return (this.Audio_Preset == AUDIO_PRESET.Custom);
            }
        },

        Action:{
            default:1, // 1:play, 0:stop
            type:AUDIO_ACTION,
            visible(){
                return (this.Comp_Event != COMP_EVENT.Distance_Update);
            }
        },

        Fade_Time:{
            default:5,
            range:[0.5,30],
            visible () {
                return ( this.Comp_Event != COMP_EVENT.Distance_Update && ( (this.Action == AUDIO_ACTION.FADE_PLAY) || (this.Action == AUDIO_ACTION.FADE_STOP) ) ) ;
            }
        },

        Play_Once:{
            default:false,
            visible () {
                return ( this.Comp_Event != COMP_EVENT.Distance_Update && ( (this.Action == AUDIO_ACTION.FADE_PLAY) || (this.Action == AUDIO_ACTION.PLAY) ) ) ;
            }
        },

        Audio_Layer:{
            default: AUDIO_LAYERS.Default,
            type:AUDIO_LAYERS,
            visible(){
                return this.Action == AUDIO_ACTION.PLAY || this.Action == AUDIO_ACTION.FADE_PLAY;
            },
        }

    },

    __preload(){
        this.node.audio_action = this;
    },

    onLoad(){

        // Defaults
        this.Impulse_Min = this.Impulse_Max*0.05;
        this.Volume_Max = 0.9;
        this.Volume_Min = 0.2;
        this.Update_Rate = 5;

        // Audio Presets
        // Set this.Audio_Source based on this.Audio_Preset

        if(this.Audio_Preset == AUDIO_PRESET.Custom){ // Custom
        // Do nothing

        }else if(this.Audio_Preset == AUDIO_PRESET.Self_AudioSource){ // Self AudioSource

            this.Audio_Source = new Array();

            let as_comps = this.node.getComponents(cc.AudioSource); // get list of AudioSource components
            for(var i = 0 , n = as_comps.length ; i < n ; i++){
                this.Audio_Source.push(as_comps[i]); // push in to the array
            }

        }else if(!CC_EDITOR){// Preset is selected
            
            this.Audio_Source = new Array(); // reset array


            var SFX_List = cc.find(smsg.Scene_Nodes.Audio_Sources+"/"+this.Audio_Preset_Name); // Get preset node

            if(SFX_List){ // if node exists

                SFX_List = SFX_List.children; // get list

                for(var i = 0 , n = SFX_List.length ; i < n ; i++){ // add list

                    let as = SFX_List[i].getComponent(cc.AudioSource);
                    if(as){
                        this.Audio_Source.push(as); // push into the array
                    }else{
                        cc.warn("audio_action: cc.AudioSource is not defined in the preset: " + SFX_List[i].name);
                    }
                }

            }else{ // if node doesn't exist
                cc.warn("audio_action: Preset node doesn't exists: " + smsg.Scene_Nodes.Audio_Sources+"/"+this.Audio_Preset_Name);
            }

            
        }




        // Check audio sources
        if(!this.Audio_Source.length){
            cc.warn("audio_action: Audio Source is not set!: "+ this.node.name);
            this.Trigger_Audio_Action = function(){};
        }

        // check rigid body
        if((this.Comp_Event == COMP_EVENT.onHit || this.Comp_Event == COMP_EVENT.onBeginContact || this.Comp_Event == COMP_EVENT.onEndContact)){
            let rb = this.node.getComponent(cc.RigidBody);
            if(rb){
                rb.enabledContactListener = true;
            }else{
                cc.warn("audio_action: Rigid Body doesn't exists!: "+ this.node.name);
            }

        }

        
        // flag
        this.Played_Last_Frame = 0; // to limit crazy frequent play on collision
        this.Collided=false; // only play once for a collided object
        this.Play_Count = 0;


        // Camera position
        // this.Camera_Container = cc.find(smsg.Global_Settings.Camera_Container);
        // this.Dist_Vec = cc.v2();
        // this.Ref_Pos = cc.v2();
        // this.Max_Distance_Sqr = this.Max_Distance*this.Max_Distance;

        // Optimization
        this.Audio_Source_Count = this.Audio_Source.length;

        // Zero Vector
        this.Zero_Vec = cc.v2();

        // Distance Reference
        // this.Distance_Ref_Node = this.Camera_Container;
    

        // Distance Update Function
        // this.Distance_Update_Function = function(){

        //     let World_Pos = this.node.convertToWorldSpaceAR(this.Zero_Vec);

        //     this.Dist_Vec.x = World_Pos.x; this.Dist_Vec.y = World_Pos.y;
            
        //     this.Ref_Pos.x = this.Distance_Ref_Node.x;
        //     this.Ref_Pos.y = this.Distance_Ref_Node.y;
            
            
        //     this.Dist_Vec.subSelf(this.Ref_Pos);
        //     let vol_mult = (1-cc.clamp01(this.Dist_Vec.magSqr()/this.Max_Distance_Sqr));

        //     for(let i = 0 , n = this.Audio_Source_Count ; i < n ; i++){
        //         smsg.Audio_Control.Set_AudioSource_Volume( this.Audio_Source[i] , this.Volume*vol_mult );
        //         //this.Audio_Source[i].volume = this.Volume*vol_mult;
        //     }

        // };



        // First onEnable() call needs to be called in start()
        if(this.Comp_Event === COMP_EVENT.onEnable){ // if onDisable selected
        
            this.old_onEnable = this.onEnable;
            this.old_start = this.start;

            this.onEnable = function(){}; // null it

            this.start = function(){
                
                this.old_onEnable(); // call old enable
                this.old_start(); // call old start
                
                // restore original functions
                this.onEnable = this.old_onEnable;
                this.start = this.old_start;

            };
        
        }

    },

    Trigger_Audio_Action(impulse=null){ // Audio action, impulse provided onPostSolve to adjust volume of sfx

        switch(this.Action){

            case AUDIO_ACTION.PLAY: // play

                if(this.Play_Once && this.Play_Count > 0){
                    return;
                }

                let random_index = Math.floor(Math.random() * this.Audio_Source_Count); // randomize audio to play
                let play_volume = 1;//this.Audio_Source[random_index].volume;

                if(impulse){ // scale volume with impulse if present
                    play_volume = cc.lerp( this.Volume_Min , this.Volume_Max , Math.min(1,(impulse/this.Impulse_Max) ) );
                }else{
                    play_volume = this.Volume;
                }
                let vol_mult = 1;
                /* if(this.Max_Distance){ // calculate sfx volume based on max distance
                    this.Dist_Vec = this.node.convertToWorldSpaceAR(this.Zero_Vec); // USE WORLD POSITION!
                    this.Ref_Pos.x = this.Distance_Ref_Node.x;
                    this.Ref_Pos.y = this.Distance_Ref_Node.y; 

                    this.Dist_Vec.subSelf(this.Ref_Pos);
                    vol_mult = (1-cc.clamp01(this.Dist_Vec.magSqr()/this.Max_Distance_Sqr));
                    play_volume *= vol_mult;
                } */
                if(vol_mult){ // play if volume is not zero
                    //this.Audio_Source[random_index].volume = play_volume;
                    smsg.Audio_Control.Play_AudioSource(this.Audio_Source[random_index], play_volume , this.Audio_Layer );
                }
                this.Play_Count++;
            break;

            case AUDIO_ACTION.STOP: // stop all audio sources
                for(let i = 0 , n = this.Audio_Source_Count ; i < n ; i++){
                    smsg.Audio_Control.Stop_AudioSource(this.Audio_Source[i]);
                }
            break;

            case AUDIO_ACTION.DELAY_STOP: // delay 0.5 secs before stop
                var audio = this.Audio_Source;
                audio[0].scheduleOnce(function(){ // this node may be deactivated, better to use sfx component for scheduling
                    for(let i = 0 , n = audio.length ; i < n ; i++){
                        smsg.Audio_Control.Stop_AudioSource(audio[i]);
                    }
                },0.5);
            break;

            case AUDIO_ACTION.FADE_STOP: // fade out stop
                for(let i = 0 , n = this.Audio_Source_Count ; i < n ; i++){
                    smsg.Audio_Control.Stop_Fadeout_AudioSource(this.Audio_Source[i],this.Fade_Time);

                    // Disable distance update if exists
                    let distance_update_comps = this.node.getComponents("audio_action");
                    for(let i = 0 , n = distance_update_comps.length ; i < n ; i++ ){
                        if(distance_update_comps[i].Comp_Event == COMP_EVENT.Distance_Update && distance_update_comps[i].enabled){ 
                            distance_update_comps[i].enabled = false;
                        }
                    }

                }
            break;

            case AUDIO_ACTION.FADE_PLAY: // fade in play

                if(this.Play_Once && this.Play_Count > 0){
                    return;
                }

                for(let i = 0 , n = this.Audio_Source_Count ; i < n ; i++){
                    smsg.Audio_Control.Play_Fadein_AudioSource( this.Audio_Source[i] , this.Fade_Time , this.Volume , this.Audio_Layer );

                    // Disable distance update if exists until fade finishes
                    let distance_update_comps = this.node.getComponents("audio_action");
                    for(let i = 0 , n = distance_update_comps.length ; i < n ; i++ ){
                        if(distance_update_comps[i].Comp_Event == COMP_EVENT.Distance_Update && distance_update_comps[i].enabled){ 
                            distance_update_comps[i].enabled = false;
                            this.scheduleOnce(function(){
                                distance_update_comps[i].enabled = true;
                            },this.Fade_Time);
                        }
                    }

                }

                this.Play_Count++;
            break;

        }

    },

    start(){

        if(this.Comp_Event === COMP_EVENT.start){
           
            this.Trigger_Audio_Action();

        }

    },

  

    onEnable(){

        if(this.Comp_Event === COMP_EVENT.onEnable){ // if onDisable selected

            this.Trigger_Audio_Action();

        }/* else if(this.Comp_Event === COMP_EVENT.Distance_Update){ // if Distance_Update selected

            this.Distance_Update_Function();
            this.schedule(this.Distance_Update_Function,1/this.Update_Rate);

        } */

    },

    onDisable() {

        if(this.Comp_Event === COMP_EVENT.onDisable){ // if onDisable selected

            this.Trigger_Audio_Action();

        }/* else if(this.Comp_Event === COMP_EVENT.Distance_Update){ // if Distance_Update selected

            this.unschedule(this.Distance_Update_Function);

        } */

    },


    onBeginContact(contact, selfCollider, otherCollider) { 
        
        if(this.Comp_Event === COMP_EVENT.onBeginContact){ // if onBeginContact selected
            
            this.Trigger_Audio_Action();
        
        }
  
    },

    onEndContact(){

        this.Collided = false; // set flag

    },

    
    onPostSolve(contact, selfCollider, otherCollider) {// if onHit selected
     
        let total_frames = cc.director.getTotalFrames(); // prevent frequent play

        if(this.Comp_Event !== COMP_EVENT.onHit || total_frames - this.Played_Last_Frame < this.Wait_Frames || this.Collided){ // if onHit selected
            return;
        }

        this.Collided = true;// set flag

        this.Played_Last_Frame = total_frames;

        let impulse = contact.getImpulse().normalImpulses;
        
        if( impulse > this.Impulse_Min){ // minimum sfx limit
            this.Trigger_Audio_Action(impulse);
        }
        
    },

    // Dynamically set
    Distance_Update(){},

    // Save Game
    Get_Comp_Data(){

        let comp_data = {};

        comp_data.Volume = this.Volume;
        comp_data.Play_Count = this.Play_Count;

        return comp_data;
    },

    // Load Game
    Set_Comp_Data( comp_data  ){

        this.Volume = comp_data.Volume;
        this.Play_Count = comp_data.Play_Count;

    },


});
