

// Game Analytics API
require("gameanalytics"); // defines window.ga for global usage

var ANALYTICS_EVENT_TYPE = require("analytics_event_type");

cc.Class({
    extends: cc.Component,

    properties: {

        Info_Log:false,

        Analytics_Enabled:true,

        Analytics_Initialized:{
            default:false,
            visible:false,
        },

    },

    __preload(){
        // Globalize
        smsg.Analytics_Control = this;
    },

    onLoad () {

        // Game goes background
        cc.game.on(cc.game.EVENT_HIDE, function () {
            this.End_Analytics_Session();
        }.bind(this));

        // Game comes foreground back
        cc.game.on(cc.game.EVENT_SHOW, function () {
            this.Start_Analytics_Session();
        }.bind(this));

        // For offline event logging
        this.Offline_Log_List = [];

        // Load log data if present before
        this.Load_Offline_Log_List();

    },

    start () {
        smsg.Main_Game_Control.node.once("internet_connected",this.Init_Analytics,this); // init once when online
    },

    Init_Analytics(force = false){// Force it if you're sure that you need

        if(force || !this.Analytics_Initialized){

            if(this.Info_Log){
                ga.GameAnalytics.setEnabledInfoLog(true);
            }

            if(!this.Analytics_Enabled){
                ga.GameAnalytics.setEnabledEventSubmission(false);
            }

            // if(smsg.User_Info.email){ // if email exists use as analytics id
            //     ga.GameAnalytics.configureUserId(smsg.User_Info.email);
            // }

            // ga.GameAnalytics.configureAvailableResourceCurrencies(["CrystalEnergy"]);
            // ga.GameAnalytics.configureAvailableResourceItemTypes(["CollectCrystalEnergy","RepairSpaceship","UpgradeSpaceship","RefuelSpaceship"]);

            ga.GameAnalytics.configureBuild( smsg.Build_Platform + " " + smsg.Build_Number );
            ga.GameAnalytics.initialize("6d7cdd1e14609f0d4bbef8ae1dec13f5", "cfe51b1ac1c0dbb95f79a30340097b55876ef0a5");

            this.Analytics_Initialized = true;

            this.scheduleOnce(this.Handle_Offline_Log,10);

        }

    },

    // GameAnalytics SDK initialized and ready
    Analytics_Ready(){
        return ga.GameAnalytics.isSdkReady(true, false);
    },

    Start_Analytics_Session(){
        ga.GameAnalytics.startSession(); // Start session on game start
    },

    End_Analytics_Session(){
        ga.GameAnalytics.endSessionImmediate(); // End session on game end or went to background
    },

    Get_User_ID(){
        return ga.GameAnalytics.Get_User_ID();
    },

    Offline_Log( func_name , args ){
        
        // Save to data storage rather than this!
        this.Offline_Log_List.push({
            func:func_name,
            args:args,
        });

        let storage_key="analytics_offline_log";
        let data_string = JSON.stringify(this.Offline_Log_List);

        cc.sys.localStorage.setItem( LZString.compressToEncodedURIComponent(storage_key) , LZString.compressToEncodedURIComponent(data_string) );

        cc.log("Offline Logged: " + func_name);

    },

    Load_Offline_Log_List(){

        let storage_key="analytics_offline_log";
        
        let data_string = cc.sys.localStorage.getItem( LZString.compressToEncodedURIComponent(storage_key));
        
        if(data_string){ // data exists

            try{
                data_string = LZString.decompressFromEncodedURIComponent(data_string);
                try{
                    this.Offline_Log_List = JSON.parse(data_string);
                }catch(e){
                    cc.log("analytics_control:Load_Offline_Log_List: Local storage JSON error!");
                }
            }catch(e){
                cc.log("analytics_control:Load_Offline_Log_List: Local storage LZString error!");
            }
        }
        
    },

    Handle_Offline_Log(){

        // Send offline logged events if exist 
        for( let i = 0 , n = this.Offline_Log_List.length ; i<n ; i++ ){
            this[this.Offline_Log_List[i].func].apply(this, this.Offline_Log_List[i].args );
        }

        this.Offline_Log_List = []; // empty list
        
        // Remove from local storage
        let storage_key="analytics_offline_log";
        cc.sys.localStorage.removeItem( LZString.compressToEncodedURIComponent(storage_key));

    },

    // Game Events =================================================================================

    Handle_Analytics_Event( event_type , event_detail ){ // Called from "standard_action"

        switch(event_type) {

            case ANALYTICS_EVENT_TYPE.Level_Start:
                this.Level_Start( event_detail );
            break;

            case ANALYTICS_EVENT_TYPE.Level_Complete:
                this.Level_Complete( event_detail );
            break;

            case ANALYTICS_EVENT_TYPE.Level_Fail:
                this.Level_Fail( event_detail );
            break;

            case ANALYTICS_EVENT_TYPE.Custom_Event:
                this.Custom_Event( event_detail );
            break;

        }

    },

    Level_Start(event_detail,scene_name){

        scene_name = scene_name || smsg.util.Get_Current_Scene_Name();

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Level_Start" , [event_detail,scene_name] );            
            return;
        }

        ga.GameAnalytics.addProgressionEvent( ga.EGAProgressionStatus.Start, scene_name , event_detail );
    },

    Level_Complete(event_detail,scene_name,score){

        scene_name = scene_name || smsg.util.Get_Current_Scene_Name();
        score = score || 0;

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Level_Complete" , [event_detail,scene_name,score] );            
            return;
        }

        ga.GameAnalytics.addProgressionEvent( ga.EGAProgressionStatus.Complete, scene_name , event_detail , null , score );
    },

    Level_Fail(event_detail,scene_name,score){

        scene_name = scene_name || smsg.util.Get_Current_Scene_Name();
        score = score || 0;

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Level_Fail" , [event_detail,scene_name,score] );            
            return;
        }

        ga.GameAnalytics.addProgressionEvent( ga.EGAProgressionStatus.Fail, scene_name , event_detail , null , score ); // event_detail can be empty
    },

    Save_Game(scene_name){
        scene_name = scene_name || smsg.util.Get_Current_Scene_Name();

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Save_Game" , [scene_name] );            
            return;
        }
        
        ga.GameAnalytics.addDesignEvent( "Save_Game" + ":" + scene_name );
    },

    Load_Game(scene_name){
        scene_name = scene_name || smsg.util.Get_Current_Scene_Name();

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Load_Game" , [scene_name] );            
            return;
        }

        ga.GameAnalytics.addDesignEvent( "Load_Game" + ":" + scene_name );

    },

    Repair_Spaceship(repair_price,scene_name){

        scene_name = scene_name || smsg.util.Get_Current_Scene_Name();
        
        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Repair_Spaceship" , [repair_price,scene_name] );            
            return;
        }

        ga.GameAnalytics.addResourceEvent(ga.EGAResourceFlowType.Sink, "CrystalEnergy", repair_price, "RepairSpaceship", "StandardRepair");
        ga.GameAnalytics.addDesignEvent( "Repair_Spaceship" + ":" + scene_name );
    },

    Upgrade_Spaceship(upgrade_name,upgrade_price,scene_name){

        scene_name = scene_name || smsg.util.Get_Current_Scene_Name();

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Upgrade_Spaceship" , [upgrade_name,upgrade_price,scene_name] );            
            return;
        }

        ga.GameAnalytics.addResourceEvent(ga.EGAResourceFlowType.Sink, "CrystalEnergy", upgrade_price, "UpgradeSpaceship", upgrade_name);
        ga.GameAnalytics.addDesignEvent( "Upgrade_Spaceship:"+upgrade_name+":"+scene_name);

    },

    Refuel_Spaceship(refuel_price,scene_name){

        scene_name = scene_name || smsg.util.Get_Current_Scene_Name();
        
        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Refuel_Spaceship" , [refuel_price,scene_name] );            
            return;
        }

        ga.GameAnalytics.addResourceEvent(ga.EGAResourceFlowType.Sink, "CrystalEnergy", refuel_price, "RefuelSpaceship", "StandardRefuel");
        ga.GameAnalytics.addDesignEvent( "Refuel_Spaceship:" + scene_name);

    },

    Collect_Crystal_Energy( type , amount ,scene_name){ // type = "DockingArm" || "Rope"

        scene_name = scene_name || smsg.util.Get_Current_Scene_Name();

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Collect_Crystal_Energy" , [type , amount ,scene_name] );            
            return;
        }

        ga.GameAnalytics.addResourceEvent( ga.EGAResourceFlowType.Source , "CrystalEnergy" , amount, "CollectCrystalEnergy" , type );
        ga.GameAnalytics.addDesignEvent( "Collect_Crystal_Energy:"+ type + ":" + scene_name);

    },

    Custom_Event(event_name,scene_name){ // Called by "standard_action"

        scene_name = scene_name || smsg.util.Get_Current_Scene_Name();

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Custom_Event" , [event_name,scene_name] );            
            return;
        }

        ga.GameAnalytics.addDesignEvent( scene_name + ":" + event_name );

    },

    Error_Event( error_level , message ){

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Error_Event" , [error_level , message] );            
            return;
        }

        let severity = ga.EGAErrorSeverity.Error;
        switch (error_level){
            case "debug":
                severity = ga.EGAErrorSeverity.Debug;
            break;
            case "info":
                severity = ga.EGAErrorSeverity.Info;
            break;
            case "warning":
                severity = ga.EGAErrorSeverity.Warning;
            break;
            case "error":
                severity = ga.EGAErrorSeverity.Error;
            break;
            case "critical":
                severity = ga.EGAErrorSeverity.Critical;
            break;
        }

        ga.GameAnalytics.addErrorEvent( ga.EGAErrorSeverity.Error, message );
    },

    User_Registered(){

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "User_Registered" , [] );            
            return;
        }

        ga.GameAnalytics.addDesignEvent( "User:Register");
    },

    User_Logged_In(){

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "User_Logged_In" , [] );            
            return;
        }
        
        ga.GameAnalytics.addDesignEvent( "User:Login");
    },

    User_Logged_Out(){

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "User_Logged_Out" , [] );            
            return;
        }

        ga.GameAnalytics.addDesignEvent( "User:Logout");
    },

    // Monetization Events =================================================================================
    
    Show_Offer(offer_name , scene_name){ // Called by monetization_control

        scene_name = scene_name || smsg.util.Get_Current_Scene_Name();

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Show_Offer" , [offer_name] );            
            return;
        }

        ga.GameAnalytics.addDesignEvent( "Monetization:ShowOffer" + ":" + offer_name + ":" + scene_name );

    },

    Rewarded_Video( event_name , offer_name){ 

        let scene_name = smsg.util.Get_Current_Scene_Name();

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Rewarded_Video" , [event_name,offer_name] );            
            return;
        }

        ga.GameAnalytics.addDesignEvent( "Monetization:RewardedVideo" + ":" + event_name + ":" + offer_name + ":" + scene_name );

    },

    Rewarded_Video_Show(offer_name){ // Called by monetization_control
        this.Rewarded_Video("Show",offer_name);
    },

    Rewarded_Video_Complete(offer_name){ // Called by monetization_control
        this.Rewarded_Video("Complete",offer_name);
    },

    Interstitial(place_name, scene_name){ // Called by monetization_control

        scene_name = scene_name || smsg.util.Get_Current_Scene_Name();

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "Interstitial" , [place_name] );            
            return;
        }

        ga.GameAnalytics.addDesignEvent( "Monetization:Interstitial" + ":" + place_name );

    },


    IAP_Completed( currency , amount , item_category , item_name , place ){

        if(!this.Analytics_Ready()){ // Not ready - log offline
            this.Offline_Log( "IAP_Completed" , [ currency , amount , item_category , item_name , place ]);            
            return;
        }

        ga.GameAnalytics.addBusinessEvent( currency , amount , item_category , item_name , place );
        
    },

    
    
});
