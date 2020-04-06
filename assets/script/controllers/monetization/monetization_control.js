/* Events

monetization_control:
    // sent from sdkbox_control
    "ad_show_completed" -> for regular ad
    "reward_achieved"   -> for rewarded video

*/

require("sdkbox_control");

cc.Class({
    extends: cc.Component,

    properties: {

        Show_Ad_Wait_Time:{
            default:60,
            min:0,
            tooltip:"Minimum wait time between ads in seconds",
        },

    },

    __preload(){
        smsg.Monetization_Control = this;
    },

    onDestroy(){
        smsg.Monetization_Control = null;
    },

    onLoad () {
     
        // SDK BOX Event -----------------------------------------

        // Interstitial or video ad showed and returned to game
        this.node.on("ad_show_completed", this.Ad_Show_Completed, this);

        // Rewarded video
        this.node.on("video_reward_achieved", this.Video_Reward_Achieved, this);

        // IAP
        // Functions will be called directly
        smsg.Sdkbox_Control.initAllPlugins();

        // --------------------------------------------------------

        // Flag for current offer (offer screen mode)
        this.Current_Reward_Offer = null;

        // For wait times
        this.Last_Show_Offer_Time = 0;
        this.Last_Show_Ad_Time = 0;

    },


    // Show video and wait for video completed callback
    Show_Rewarded_Video(){

        // DEBUG
        // this.Video_Reward_Achieved();
        // return;

        if(!smsg.Sdkbox_Control.Rewarded_Video_Available()){ // Don't show if not available
            return;
        }

        // Show rewarded video
        smsg.Sdkbox_Control.Show_Rewarded_Video();

        // Analytics Event
        let offer_name = "None";
        smsg.Analytics_Control.Rewarded_Video_Show(offer_name);

        cc.log("SHOW REWARDED VIDEO!");

    },

    // Called from this.node.on("video_reward_achieved") triggered by "sdkbox_control"
    Video_Reward_Achieved(){
            
        this.Give_Reward_for_Video(this.Current_Reward_Offer); // Give reward
        smsg.Analytics_Control.Rewarded_Video_Complete("None");
        this.Current_Reward_Offer = null;

    },

    // Give reward
    Give_Reward_for_Video(offer_type){

        // Give reward
        // X2Gold
        smsg.Game_Control.Gold_Count += smsg.Game_Control.Today_Gold_Count;
        smsg.Game_Control.Today_Gold_Count *= 2;
        smsg.End_Day_Screen.Set_Golds_Earned(smsg.Game_Control.Today_Gold_Count);
        smsg.End_Day_Screen.Video_Reward_Achieved();

        cc.log( "GIVE REWARD!: " + offer_type);

    },

    // Performs IAP action
    Perform_IAP(item_name){
        
        // Prevent multiple purchase for non-consumabe items
        if(item_name == "Remove_Ads" && smsg.User_Settings.IAP.indexOf(item_name) !== -1){ 
            return;
        }

        smsg.Sdkbox_Control.Purchase_Item(item_name); // Sdkbox_Control will callback IAP_Completed(item_name)

        cc.log("PERFORM IAP!");

    },

    // Called by "sdkbox_control"
    IAP_Completed( item_name , amount , currency ){

        // Give item
        switch(item_name){

            case "Remove_Ads": // non-consumable
                this.Restore_Purchase(item_name); // add item to IAP array
            break;

            case "Consumable": // consumable
                // Give action
            break;

            default:
                cc.log("monetization_control:IAP_Completed(): item type not found!:" + item_name);

        }

        // Analytics purchase place        
        let place = "None"; // store/offer
        
        smsg.Analytics_Control.IAP_Completed( currency , amount , "All" , item_name , place );

    },

    // END Offers -----------------------------------------------------

    Show_Interstitial(place_name="None",callback){

        // if "Remove_Ads" purchased or no ads available: do nothing
        if(this.is_Item_Purchased("Remove_Ads") || !smsg.Sdkbox_Control.Interstitial_Available()){
            callback(); // return
            cc.log("ADS REMOVED OR NOT AVAILABLE.");
            return;
        }

        // For interval tracking
        let now = Math.round(cc.sys.now() / 1000);
        
        if(now < this.Last_Show_Ad_Time + this.Show_Ad_Wait_Time){
            callback(); // return
            return;
        }this.Last_Show_Ad_Time = now;
        
        // Pause Game ???
        //this.scheduleOnce(function(){smsg.Main_Game_Control.Pause_Game(true);},0);

        // Save callback for Ad_Show_Completed()
        this.Ad_Show_Callback = callback;

        // Show ad
        smsg.Sdkbox_Control.Show_Interstitial();

        // Analytics Event
        smsg.Analytics_Control.Interstitial(place_name);

        cc.log("SHOW INTERSTITIAL!");

    },

    Ad_Show_Completed(){
        // Resume game ???
        // smsg.Main_Game_Control.Resume_Game(true);

        if(this.Ad_Show_Callback){
            this.Ad_Show_Callback();
            this.Ad_Show_Callback = null;
        }
    },

    // Called by Sdkbox_Control
    Restore_Purchase(item_name){ // Same function will be called when new item is purchased
        if( smsg.User_Settings.IAP.indexOf(item_name) === -1){ // if item doesn't exist in the array
            smsg.User_Settings.IAP.push(item_name); // add it
        }
    },

    Restore_All_Purchases(){
        smsg.Sdkbox_Control.Restore_All_Purchases();
    },

    // Simpe check
    is_Item_Purchased(item_name){
        return false;//smsg.User_Settings.IAP.indexOf(item_name) !== -1;
    },

});
