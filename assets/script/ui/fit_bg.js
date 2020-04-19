
cc.Class({
    extends: cc.Component,

    properties: {

    },


    onLoad () {
        this.Canvas = cc.find("Canvas");
        if(cc.sys.isBrowser && cc.sys.isMobile){
            let thisOnResized = this.onResized.bind(this);
            window.addEventListener('resize', thisOnResized);
            window.addEventListener('orientationchange', thisOnResized);
        }else{
            cc.view.on('canvas-resize', this.onResized, this);
        }
        this.onResized();
    },

    start () {
        
    },

    onResized(){
        this.scheduleOnce(()=>{
            let w_ratio = this.Canvas.width/this.node.width;
            let h_ratio = this.Canvas.height/this.node.height;
            this.node.scale = Math.max(w_ratio,h_ratio);
        },0);
    },

});
