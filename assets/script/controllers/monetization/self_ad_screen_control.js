
cc.Class({
    extends: cc.Component,

    properties: {
        Open_URL:"http://gamedevgarage.com/games/crowded_streets/banner/",
        Banner:cc.Node,
        Close_Button: cc.Node,
        Rewarded:false,
    },

    onLoad () {

        this.Banner.on(cc.Node.EventType.TOUCH_START, function(){
            cc.sys.openURL(this.Open_URL);
        } , this);

        this.Close_Button.on(cc.Node.EventType.TOUCH_START, function(){
            if(this.Rewarded){
                smsg.Monetization_Control.node.emit("video_reward_achieved"); // notify
            }else{
                smsg.Monetization_Control.node.emit("ad_show_completed"); // notify
            }
            this.node.active = false;
        } , this);

    },
    
});
