
// Sdkbox controller

// From SDKBOX
var AD_ACTION_TYPE = cc.Enum({
    LOADED:0,               // content loaded
    LOAD_FAILED:1,          // content failed to load

    CLICKED:2,              // clicked on content (chartboost,unity)

    REWARD_STARTED:3,       // reward started      (chartboost)
    REWARD_ENDED:4,         // reward achieved (chartboost)
    REWARD_CANCELED:5,      // reward aborted

    AD_STARTED:6,           // start showing
    AD_CANCELED:7,          // start showing.
    AD_ENDED:8,             // content shown

    ADACTIONTYPE_UNKNOWN:9  // mostly on error situations.
});

var SDK_BOX = {

    // Init all plugins
    getInstance(){
        return this;
    },

    initAllPlugins(){

        // IAP
        // this.initIAP();

        // ADS
        this.initPluginSdkboxAds();

        // Init Share
        this.initPluginShare();

        // Init OneSignal
        // this.initPluginOneSignal();

    },

    // ADS ======================================
    initPluginSdkboxAds(){
        if (typeof sdkbox == 'undefined') {
            cc.log('sdkbox is undefined');
            this.Ads_Initialized = false;
            return;
        }

        if (typeof sdkbox.PluginSdkboxAds == 'undefined') {
            cc.log('sdkbox.PluginSdkboxAds is undefined');
            this.Ads_Initialized = false;
            return;
        }

        sdkbox.PluginSdkboxAds.setListener({
            onAdAction : function(ad_unit_id, place, action_type) {

                  // AdMob interstitial
                if( ad_unit_id == "AdMob" && place == "interstitial" && 
                ( action_type == AD_ACTION_TYPE.AD_ENDED || action_type == AD_ACTION_TYPE.AD_CANCELED) ){

                    smsg.Monetization_Control.node.emit("ad_show_completed") // Emit event 

                } // UnityAds video (interstitial)
                else if( ad_unit_id == "UnityAds" && place == "video" &&  
                ( action_type == AD_ACTION_TYPE.AD_ENDED || action_type == AD_ACTION_TYPE.AD_CANCELED) ){

                    smsg.Monetization_Control.node.emit("ad_show_completed") // Emit event 

                } // Chartboost interstitial
                else if( ad_unit_id == "Chartboost" && place == "interstitial" &&  
                ( action_type == AD_ACTION_TYPE.AD_ENDED || action_type == AD_ACTION_TYPE.AD_CANCELED) ){

                    smsg.Monetization_Control.node.emit("ad_show_completed") // Emit event 

                } // UnityAds rewardedVideo
                else if( ad_unit_id == "UnityAds" && place == "rewardedVideo" &&  
                ( action_type == AD_ACTION_TYPE.AD_ENDED ) ){

                    smsg.Monetization_Control.node.emit("video_reward_achieved") // Emit event 

                }

                cc.log("onAdAction:" + String(ad_unit_id) + ":" + String(place) + ":" + String(action_type));

            },
            onRewardAction : function(ad_unit_id, place, reward_amount, reward_succeed) {

                
                if( ad_unit_id == "AdMob" && place == "rewarded_video" &&  reward_succeed == true ){ // AdMob rewarded_video
        
                    smsg.Monetization_Control.node.emit("video_reward_achieved") // Emit event 
                    
                }else if( ad_unit_id == "Chartboost" && place == "rewarded_video" &&  reward_succeed == true ){ // Chartboost rewarded_video
        
                    smsg.Monetization_Control.node.emit("video_reward_achieved") // Emit event 
        
                }
        
                cc.log("onRewardAction:" + String(ad_unit_id) + ":" + String(place) + ":" + String(reward_amount) + ":" + String(reward_succeed));
            }
        });
        sdkbox.PluginSdkboxAds.init();
        this.Ads_Initialized = true;
    },

    // Monetization Control may check
    Interstitial_Available(){

        /* // DEBUG
        return true; */

        if(!this.Ads_Initialized){
            return false;
        }

        if(sdkbox.PluginSdkboxAds.isAvailable("interstitial")) {
            return true;
        }else{
            return false;
        }

    },

    Show_Interstitial() {

        // DEBUG
        /* setTimeout(function(){
            smsg.Monetization_Control.node.emit("ad_show_completed") // Emit event 
        },3000);
        return; */

        if(!this.Ads_Initialized){
            return false;
        }

        if(sdkbox.PluginSdkboxAds.isAvailable("interstitial")) {
            sdkbox.PluginSdkboxAds.placement("interstitial");
        }else{
            cc.log(placement + ' is not available');
        }

    },

    // Monetization Control may check
    Rewarded_Video_Available(){

        /* // DEBUG
        return true; */

        if(!this.Ads_Initialized){
            return false;
        }

        if(sdkbox.PluginSdkboxAds.isAvailable("rewarded_video")) {
            return true;
        }else{
            return false;
        }

    },

    Show_Rewarded_Video() {

        // DEBUG
        /* setTimeout(function(){
            smsg.Monetization_Control.node.emit("video_reward_achieved") // Emit event 
        },3000);
        return; */

        if(!this.Ads_Initialized){
            return false;
        }

        if(sdkbox.PluginSdkboxAds.isAvailable("rewarded_video")) {
            sdkbox.PluginSdkboxAds.placement("rewarded_video");
        }else{
            cc.log(placement + ' is not available');
        }
    },
 
    // IAP ======================================
    initIAP() {
        if ('undefined' == typeof sdkbox) {
            cc.log('sdkbox is undefined');
            this.IAP_Initialized = false;
            return;
        }

        if ('undefined' == typeof sdkbox.IAP) {
            cc.log('sdkbox.IAP is undefined');
            this.IAP_Initialized = false;
            return;
        }

        /* if (sdkbox.setConfig) {
            sdkbox.setConfig(JSON.stringify(sdkbox_config));
        } */

        const self = this;
        sdkbox.IAP.setListener({
            onInitialized : function (success) {
                cc.log("sdkbox.IAP initialized: " + success);
                self.IAP_Initialized = true;
                self.Restore_All_Purchases(); // Restore non-consuming items
            },
            onSuccess : function (product) {
                //Purchase success
                smsg.Monetization_Control.IAP_Completed( product.name , product.priceValue , product.currencyCode );
                cc.log("Purchase successful: " + product.name);
                self.printProduct(product);
            },
            onFailure : function (product, msg) {
                //Purchase failed
                smsg.Main_Game_Control.Show_Alert( "Purchase failed!" , smsg.Global_Settings.Text_Yellow , false );
                cc.log("Purchase failed: " + product.name + " error: " + msg);
            },
            onCanceled : function (product) {
                //Purchase was canceled by user
                smsg.Main_Game_Control.Show_Alert( "Purchase canceled!" , smsg.Global_Settings.Text_Yellow , false );
                cc.log("Purchase canceled: " + product.name);
            },
            onRestored : function (product) {
                //Purchase restored
                self.Restore_Purchase(product.name)
                cc.log("Purchase restored: " + product.name);
                self.printProduct(product);
            },
            onProductRequestSuccess : function (products) { // Retrieves data after "sdkbox.IAP.refresh()" called
                //Returns you the data for all the iap products
                //You can get each item using following method
                cc.log("onProductRequestSuccess:");
                for (var i = 0; i < products.length; i++) {
                    self.printProduct(products[i]);
                }
            },
            onProductRequestFailure : function (msg) { // Error if "sdkbox.IAP.refresh()" fails
                //When product refresh request fails.
                cc.log("Failed to get products");
            },
            onShouldAddStorePayment: function(productId) { // Not necessary
                cc.log("onShouldAddStorePayment:" + productId);
                return true;
            },
            onFetchStorePromotionOrder : function (productIds, error) { // Not necessary
                cc.log("onFetchStorePromotionOrder:" + " " + " e:" + error);
            },
            onFetchStorePromotionVisibility : function (productId, visibility, error) { // Not necessary
                cc.log("onFetchStorePromotionVisibility:" + productId + " v:" + visibility + " e:" + error);
            },
            onUpdateStorePromotionOrder : function (error) { // Not necessary
                cc.log("onUpdateStorePromotionOrder:" + error);
            },
            onUpdateStorePromotionVisibility : function (error) { // Not necessary
                cc.log("onUpdateStorePromotionVisibility:" + error);
            },
        });
        sdkbox.IAP.init();
        // sdkbox.IAP.setAutoFinishTransaction(false);
        sdkbox.IAP.setDebug(true);
    },
 
    // Debug
    printProduct: function(p) {
        cc.log("======Product Info======");
        // cc.log(p.name + ":" + p.price);
        cc.log("name=" + p.name);
        cc.log("title=" + p.title);
        cc.log("description=" + p.description);
        // cc.log("price=" + p.price);
        cc.log("priceValue=" + p.priceValue);
        cc.log("currencyCode=" + p.currencyCode);
        // cc.log("receipt=" + p.receipt);
        // cc.log("receiptCipheredPayload=" + p.receiptCipheredPayload);
        // cc.log("transactionID=" + p.transactionID);
        cc.log("");
    },

    Purchase_Item(item_name){ // Called from "monetization_control"
        
        // DEBUG
        // smsg.Monetization_Control.IAP_Completed( item_name , 100 , "USD" );
        // return;

        if(!this.IAP_Initialized){
            return false;
        }
        sdkbox.IAP.purchase(item_name);
    },

    Restore_All_Purchases(){ // Called from "monetization_control"
        if(!this.IAP_Initialized){
            return false;
        }
        sdkbox.IAP.restore();
    },

    Restore_Purchase(item_name){ // Called by sdk box onRestore
        smsg.Monetization_Control.Restore_Purchase(item_name);
    },


    // SHARE ====================================

    initPluginShare(){

        if (typeof sdkbox == 'undefined') {
            cc.log('sdkbox is undefined');
            this.Share_Initialized = false;
            return;
        }

        if (typeof sdkbox.PluginShare == 'undefined') {
            cc.log('sdkbox.PluginShare is undefined');
            this.Share_Initialized = false;
            return;
        }

        sdkbox.PluginShare.setListener({
            onShareState: function(response) {
                cc.log("PluginShare onSharestate:" + response.state + " error:" + response.error);
                if (response.state == sdkbox.SocialShareState.SocialShareStateSuccess) {
                    cc.log("Share success");
                }
            }
        });

        sdkbox.PluginShare.init();
        sdkbox.PluginShare.setFileProviderAuthorities("net.focuscreative.crowdedstreets.fileprovider");
        this.Share_Initialized = true;
    },

    Share_Available(){
        return this.Share_Initialized;
    },

    Native_Share(shareInfo){

        if(this.Share_Initialized){
            sdkbox.PluginShare.nativeShare(shareInfo);
        }else{
            cc.log("Share plugin not initialized!");
        }

    },

    // OneSignal ================================

    initPluginOneSignal(){

        if (typeof sdkbox == 'undefined') {
            cc.log('sdkbox is undefined');
            this.OneSignal_Initialized = false;
            return;
        }

        if (typeof sdkbox.PluginOneSignal == 'undefined') {
            cc.log('sdkbox.PluginOneSignal is undefined');
            this.OneSignal_Initialized = false;
            return;
        }

        sdkbox.PluginOneSignal.init();

    }

}

smsg.Sdkbox_Control = smsg.Sdkbox_Control || SDK_BOX.getInstance();
module.exports = SDK_BOX;