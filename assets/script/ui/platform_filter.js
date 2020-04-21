

var PLATFORM_LIST = cc.Enum({
    Mobile:-1,
    Desktop:-1,
    Native:-1,
    Browser:-1
});


cc.Class({
    extends: cc.Component,

    editor: CC_EDITOR && {
        menu: 'SMSG/Util/platform_filter',
    },

    properties: {

        Active_On:{
            default:PLATFORM_LIST.Mobile,
            type:PLATFORM_LIST,
        },

    },

    onLoad () {

        if(this.enabled){

            switch(this.Active_On){

                case PLATFORM_LIST.Mobile:
                    if(cc.sys.isMobile){ // we are on mobile
                        this.node.active = true;
                    }else{
                        this.node.active = false;
                    }
                break;

                case PLATFORM_LIST.Desktop:
                    if( !cc.sys.isMobile ){ // we are on desktop
                        this.node.active = true;
                    }else{
                        this.node.active = false;
                    }
                break;

                case PLATFORM_LIST.Native:
                    if( cc.sys.isNative ){ // we are on native
                        this.node.active = true;
                    }else{
                        this.node.active = false;
                    }
                break;

                case PLATFORM_LIST.Browser:
                    if( cc.sys.isBrowser ){ // we are on browser
                        this.node.active = true;
                    }else{
                        this.node.active = false;
                    }
                break;

            }

        }
    },



});
