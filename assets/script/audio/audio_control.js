
/*
// USAGE
// Audio_Control
smsg.Audio_Control.Play_AudioSource( this.Contact_Console_Open_SFX , volume , audio_layer );
*/

var AUDIO_TRIGGER_TYPE = require("audio_trigger_type");

var AUDIO_LAYERS = require("audio_layers");

// Singleton Audio Control class
var Audio_Control = {

    Init(){

        this.Audio_Layers = new Object();
        this.Layer_Paused = new Object();
        this.Layer_Volume = new Object();

        for(let i = 0 ; i < Object.keys(AUDIO_LAYERS).length ; i++ ){

            // define layer array to put "cc.AudioSource"s in it later
            this.Audio_Layers[ Object.values(AUDIO_LAYERS)[i] ] = []; 
            this.Layer_Paused[ Object.values(AUDIO_LAYERS)[i] ] = false;
            this.Layer_Volume[ Object.values(AUDIO_LAYERS)[i] ] = 1; 

        }

        // Return singleton
        return this;

    },

    Release_References(){

        for(let i = 0 ; i < Object.values(AUDIO_LAYERS).length ; i++ ){
            for(let j = 0 ; j < this.Audio_Layers[Object.values(AUDIO_LAYERS)[i]].length ; j++){ // Restore original volumes of audio sources (fix for persist nodes)
                let as = this.Audio_Layers[ Object.values(AUDIO_LAYERS)[i] ][j];
                as.volume = as.smsg_original_volume || as.volume;
            }
        }
        

        this.Audio_Layers = new Object();
        this.Layer_Paused = new Object();

        for(let i = 0 ; i < Object.keys(AUDIO_LAYERS).length ; i++ ){

            // define layer array to put "cc.AudioSource"s in it later
            this.Audio_Layers[ Object.values(AUDIO_LAYERS)[i] ] = []; 
            this.Layer_Paused[ Object.values(AUDIO_LAYERS)[i] ] = false;

        }

    },

    Play_AudioSource( audio_source , volume , audio_layer=AUDIO_LAYERS.Default ){ // simple play     

        this.Add_Audio_Source_to_Layer( audio_source, audio_layer );

        // save original volume to multiply later
        if(typeof audio_source.smsg_original_volume === "undefined"){
            audio_source.smsg_original_volume = audio_source.volume; 
        }

        if (volume !== undefined && volume !== null){ // volume is defined
            audio_source.smsg_original_volume = volume;
        }
        audio_source.volume = audio_source.smsg_original_volume * this.Layer_Volume[audio_layer];

        audio_source.scheduleOnce(function(){// Space travel fix
            audio_source.play();
        },0);
        
        if( this.Layer_Paused[audio_layer] ){ // Audio belongs to a paused layer
            setTimeout(function(){ audio_source.pause(); }, 10 ); // It won't pause if called just after play(), lets delay a bit.
            audio_source.smsg_in_paused_layer = true;
        }
        
    },

    Play_Fadein_AudioSource( audio_source , fade_time , volume , audio_layer=AUDIO_LAYERS.Default ){ // fade in play

        // save original volume 
        audio_source.smsg_original_volume = volume; 

        this.Add_Audio_Source_to_Layer( audio_source, audio_layer );

        var target_volume = volume * this.Layer_Volume[audio_layer];

        var as = audio_source;
        fade_time = fade_time/target_volume;
        
        as.fade_in_func = function(dt){
            this.volume += (dt/fade_time);
            if(this.volume >= target_volume){
                this.unschedule(this.fade_in_func); // stop fading
            }
        };

        as.volume = 0;

        as.scheduleOnce(function(){// Space travel fix
            as.play();
        },0);

        as.schedule(as.fade_in_func,0); // schedule on audio source component

        if( this.Layer_Paused[audio_layer] ){ // Played after layer paused
            setTimeout(function(){ as.pause(); }, 10 ); // It won't pause if called just after play(), lets delay a bit.
            as.smsg_in_paused_layer = true;
        }
        
    },
    
    Stop_AudioSource(audio_source){ // simple stop
        audio_source.scheduleOnce(function(){// Space travel fix
            audio_source.stop();
        },0);        
    },

    Stop_Fadeout_AudioSource(audio_source,fade_time){ // fadeout stop

        var as = audio_source;

        var as_node_audio_action = as.node.getComponent("audio_action");
        if(as_node_audio_action && as_node_audio_action.Comp_Event == AUDIO_TRIGGER_TYPE.Distance_Update){ // if it has audio-action component and has distance_update then disable it so we can't fade out
            as_node_audio_action.unschedule(as_node_audio_action.Distance_Update_Function); // unschedule update function
        }

        fade_time = fade_time/as.volume;
        
        as.fade_out_func = function(dt){
            this.volume -= (dt/fade_time);
            if(this.volume < 0.001){
                this.stop();
                this.unschedule(this.fade_out_func); // stop fading
            }
        };

        as.schedule(as.fade_out_func,0); // schedule on audio source component

    },

    Add_Audio_Source_to_Layer( audio_source , audio_layer ){

        // AudioSource doesn't exist in array
        if( this.Audio_Layers[audio_layer].indexOf(audio_source) == -1 ){
            this.Audio_Layers[audio_layer].push(audio_source);
            audio_source.smsg_audio_layer = audio_layer;
        }

    },

    Pause_Layer( audio_layer ){

        for(let i = 0 ; i < this.Audio_Layers[audio_layer].length ; i++ ){
            this.Audio_Layers[audio_layer][i].pause();
            this.Audio_Layers[audio_layer][i].smsg_in_paused_layer = true;
        }

        this.Layer_Paused [audio_layer] = true;

    },

    Resume_Layer( audio_layer ){

        for(let i = 0 ; i < this.Audio_Layers[audio_layer].length ; i++ ){
            this.Audio_Layers[audio_layer][i].resume();
            this.Audio_Layers[audio_layer][i].smsg_in_paused_layer = false;
        }

        this.Layer_Paused [audio_layer] = false;
        
    },

    Resume_All_Layers(){

        for(let l = 0 ; l < Object.keys(AUDIO_LAYERS).length ; l++ ){

            let audio_layer = Object.values(AUDIO_LAYERS)[l];

            for(let i = 0 ; i < this.Audio_Layers[audio_layer].length ; i++ ){
                this.Audio_Layers[audio_layer][i].resume();
                this.Audio_Layers[audio_layer][i].smsg_in_paused_layer = false;
            }
    
            this.Layer_Paused [audio_layer] = false;
            
        }

    },

    Set_AudioSource_Volume( audio_source , volume ){ // used in distance update
    
        // multiply with audiosource's layer volume
        if(audio_source.smsg_audio_layer !== undefined){ // Played and layer set so we can multiply it
            audio_source.volume = volume * this.Layer_Volume[audio_source.smsg_audio_layer];
        }else{
            audio_source.volume = volume; // this is not needed we don't have audio without layer. I did it just to be safe.
        }
        
    },

    Set_Layer_Volume( audio_layer , volume ){

        this.Layer_Volume[audio_layer] = volume; 

        // Update audio source volumes in layer
        for(let i = 0 ; i < this.Audio_Layers[audio_layer].length ; i++ ){
            this.Audio_Layers[audio_layer][i].volume = this.Audio_Layers[audio_layer][i].smsg_original_volume * this.Layer_Volume[audio_layer];
        }

    },

};
module.exports = Audio_Control.Init();
