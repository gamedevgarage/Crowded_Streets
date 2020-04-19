

// String compression library 
require("lz_string");

var AUDIO_LAYERS = require("audio_layers");

/* Custom events ===============================
    "internet_connected"     => emits when go online
    "internet_disconnected"  => emits when go offline
    "before_scene_load"
    "after_scene_load"
================================================ */


cc.Class({
    extends: cc.Component,

    properties: {

        End_Day_Screen:cc.Prefab,

        Game_Over_Screen:cc.Prefab,
        
        Pause_Screen:cc.Prefab,

        Audio_Sources_Prefab:cc.Prefab,

        Debug_Draw:false,
        

    },

    __preload(){

        // Make this node persist
        cc.game.addPersistRootNode(this.node);
        
        // Globalize
        smsg.Main_Game_Control = this;
        smsg.Audio_Control = require("audio_control"); // initializes itself
        smsg.OBJECT_TAG_LIST = require("object_tag_list");

    },

    onLoad(){

        this.Save_Data = null;
        this.Paused = false;

        // Scene load
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,this.Before_Scene_Load,this); 
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,this.After_Scene_Load,this); 


        // Internet connection
        this.Internet_Connection = false;
        this.Check_Internet_Connection_Loop(); // start check connection loop

        // Physics Settings
        this.physics_manager = cc.director.getPhysicsManager();
        this.physics_manager.enabled = true; // physics collision manager
        this.physics_manager.gravity = cc.v2();

        // Debug Draw
        if(this.Debug_Draw){
            var Bits = cc.PhysicsManager.DrawBits;
            cc.director.getPhysicsManager().debugDrawFlags = Bits.e_aabbBit |
            Bits.e_pairBit |
            Bits.e_centerOfMassBit |
            Bits.e_jointBit |
            Bits.e_shapeBit;
        }
    },

    Before_Scene_Load(){

        this.node.emit("before_scene_load");

        // Child nodes
        this.Children_Nodes = [];
        for(let i = 0 ; i<this.node.children.length ; i++ ){
            let child = this.node.children[i];
            this.Children_Nodes.push(child);
            child.parent = null;
        }
    },

    After_Scene_Load(){
        for(let i = 0 ; i<this.Children_Nodes.length ; i++ ){
            let child = this.Children_Nodes[i];
            child.parent = this.node;
        }

        this.node.emit("after_scene_load");
    },

    Check_Internet_Connection_Loop(){
        this.Ping_Server(
            function(res){ // if connected
                if(this.Internet_Connection === false){ // was not connected
                    this.Internet_Connection = true; // set flag
                    this.node.emit('internet_connected');// emit event
                }
                this.unschedule(this.Check_Internet_Connection_Loop);
            }.bind(this),
            function(res){ // if not connected
                if(this.Internet_Connection === true){ // was connected
                    this.Internet_Connection = false; // set flag
                    this.node.emit('internet_disconnected');// emit event
                }
                this.scheduleOnce(this.Check_Internet_Connection_Loop,10); // check every 10 secs if not online
            }.bind(this)
        );
    },
    
    Ping_Server( Connected , Not_Connected ) {
        let started = new Date().getTime();
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://gamejolt.com/api/game/v1", /*async*/true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                Connected();
            }else{
                Not_Connected();
            }
        };
        xhr.onerror = function() {
            Not_Connected();
        };
        try {
            xhr.send(null);
        } catch(exception) {
            // expected
        }
    },

    Request_Fullscreen(){
        cc.screen.requestFullScreen();
    },

    Show_End_Day_Screen(){ // called from game_control
        if(!smsg.Game_Control){ // make sure we are playing
            return;
        }

        smsg.Input_Control.Disable_Input();

        let end_day_screen = cc.instantiate(this.End_Day_Screen);
        end_day_screen.parent = smsg.UI_Layer;
        let comp = end_day_screen.getComponent("end_day_screen");
        comp.Set_Day_Number(smsg.Game_Control.Today+1);
        comp.Set_New_Infections(smsg.Game_Control.New_Infection_Count);
        comp.Set_Golds_Earned(smsg.Game_Control.Today_Gold_Count);
        comp.Show_Screen();
    },

    Start_Next_Day(){ // called from game_control
        smsg.Monetization_Control.Show_Interstitial("Next_Day",function(){
            smsg.Game_Control.Start_Next_Day();
            smsg.Input_Control.Enable_Input();
        }.bind(this));
    },

    Show_Game_Over_Screen(){// called from game_control
        if(!smsg.Game_Control){ // make sure we are playing
            return;
        }

        smsg.Input_Control.Disable_Input();

        let game_over_screen = cc.instantiate(this.Game_Over_Screen);
        game_over_screen.parent = smsg.UI_Layer;
        let comp = game_over_screen.getComponent("game_over_screen");
        comp.Set_Day_Number(smsg.Game_Control.Today+1);
        comp.Set_Golds_Earned(smsg.Game_Control.Gold_Count);
        comp.Show_Screen();
    },

    Load_Home_Screen(){// called from 
        this.Resume_Game(); // if paused
        cc.director.loadScene("Home_Screen");
    },

    Activate_Level(scene_name){ // called during gameplay or level end
        if(!this._Is_Level_Activated(scene_name)){ // Not activated
            this.Save_Data.Activated_Levels.push(
                {
                    Scene_Name:scene_name,
                    Day_Number:0,
                });
        }
        this.Write_Save_Data(); // savedata already read by this._Is_Level_Activated()
    },

    _Is_Level_Activated(scene_name){
        this.Read_Save_Data();
        for(let i = 0 ; i < this.Save_Data.Activated_Levels.length ; i++ ){
            let data = this.Save_Data.Activated_Levels[i];
            if(data.Scene_Name === scene_name){
                return data;
            }
        }
        return false;
    },

    Read_Save_Data(){
        let save_data_str = cc.sys.localStorage.getItem("Save_Data");
        let save_data = null;
        if(save_data_str){
            try{
                save_data = JSON.parse(save_data_str);
            }catch(e){
                cc.log(this.name + ":Activate_Level: JSON invalid!")
            }
        }
        if(save_data){
            // Check data validity here
            // ...
            this.Save_Data = save_data;

        }else{ // No save data
            this.Init_Save_Data();
        }
    },

    Write_Save_Data(){
        // Check data validity here
        // ...
        cc.sys.localStorage.setItem("Save_Data", JSON.stringify(this.Save_Data));
    },

    Init_Save_Data(){
        
        this.Save_Data = {
            Activated_Levels:[
                // {
                //     Scene_Name:"Game_Scene",
                //     Day_Number:0,
                // }
            ],
            Player:{
                Golds:0,
            },
            Settings:{
                SFX:true,
                Music:true,
            }
        }

    },

    Load_Level(scene_name){
        cc.director.loadScene(scene_name);
    },

    Toggle_SFX(){
        if(smsg.Audio_Control.Layer_Volume[AUDIO_LAYERS.Default]){
            smsg.Audio_Control.Set_Layer_Volume( AUDIO_LAYERS.Default , 0 );
            return 0;
        }else{
            smsg.Audio_Control.Set_Layer_Volume( AUDIO_LAYERS.Default , 1 );
            return 1;
        }      
    },

    Toggle_Music(){
        if(smsg.Audio_Control.Layer_Volume[AUDIO_LAYERS.Background_Music]){
            smsg.Audio_Control.Set_Layer_Volume( AUDIO_LAYERS.Background_Music , 0 );
            return 0;
        }else{
            smsg.Audio_Control.Set_Layer_Volume( AUDIO_LAYERS.Background_Music , 1 );
            return 1;
        }   
    },

    Share_Screenshot(){
        smsg.Native_Share.Share_Screenshot();
    },

    Toggle_Pause(){
        if(!smsg.Game_Control){ // make sure we are playing
            return;
        }
        if(!this.Paused){
            this.Pause_Game();
        }else{
            this.Resume_Game();
        }
    },

    Pause_Game(){
        if(!smsg.Game_Control){ // make sure we are playing
            return;
        }
        if(!this.Paused){

            // Physics and collisions
            this.physics_manager.enabled = false;
            //this.std_collision_manager.enabled = false;

            // Game Layer
            smsg.Game_Layer.pauseSystemEvents(true);
            this.Pause_Node_Tree(smsg.Game_Layer);

            // Audio
            smsg.Audio_Control.Pause_All_Layers();

            // Input
            smsg.Input_Control.Disable_Input();

            // Pause Screen
            let game_over_screen = cc.instantiate(this.Pause_Screen);
            game_over_screen.parent = smsg.UI_Layer;
            let comp = game_over_screen.getComponent("pause_screen_control");
            comp.Show_Screen();

            // Flag
            this.Paused = true;
        }
    },

    Resume_Game(){
        if(!smsg.Game_Control){ // make sure we are playing
            return;
        }
        if(this.Paused){

            // Physics and collisions
            this.physics_manager.enabled = true;
            //this.std_collision_manager.enabled = true;

            // Game Layer
            smsg.Game_Layer.resumeSystemEvents(true);
            this.Resume_Node_Tree(smsg.Game_Layer);
            
            // Audio
            smsg.Audio_Control.Resume_All_Layers(); // resume all layers

            smsg.Pause_Screen_Control.Hide_Screen();
            smsg.Input_Control.Enable_Input();

            // Flag
            this.Paused = false;
        }
    },

    Pause_Node_Tree(node){
        
        let that = this;

        for(let i = 0 , n = node.children.length; i < n ; i++){
            that.Pause_Node_Tree(node.children[i]);
        }

        // Don't pause if not active
        if(node.activeInHierarchy){
            node.pauseAllActions();
            cc.director.getScheduler().pauseTarget(node);

            // Pause components
            for(let i = 0 , n = node._components.length ; i < n ; i++ ){
                cc.director.getScheduler().pauseTarget(node._components[i]);   

                // pause updates
                node._components[i].old_update = node._components[i].update;
                node._components[i].update = function(){return};

                node._components[i].old_late_update = node._components[i].lateUpdate;
                node._components[i].lateUpdate = function(){return};

                switch(node._components[i].__classname__){

                    case "cc.Animation":
                        node._components[i].pause();
                    break;

                }

            }
        }

    },

    Resume_Node_Tree(node){

        let that = this;

        for(let i = 0 , n = node.children.length; i < n ; i++){
            that.Resume_Node_Tree(node.children[i]);
        }

        // Don't resume if not active because we didn't pause it
        if(node.activeInHierarchy){
            node.resumeAllActions();
            cc.director.getScheduler().resumeTarget(node);
            // Resume components
            for(let i = 0 , n = node._components.length ; i < n ; i++ ){
                cc.director.getScheduler().resumeTarget(node._components[i]);

                // resume updates
                if(node._components[i].old_update){ // we check to make sure otherwise game loop may broke
                    node._components[i].update = node._components[i].old_update;
                }
                if(node._components[i].old_late_update){ // we check to make sure otherwise game loop may broke
                    node._components[i].lateUpdate = node._components[i].old_late_update;
                }

                switch(node._components[i].__classname__){

                    case "cc.Animation":
                        node._components[i].resume();
                    break;

                }
                
            }
        }
        
    },

 
});
