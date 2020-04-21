
cc.Class({
    extends: cc.Component,

    properties: {

    },


    onLoad () {

        this.Canvas = cc.find("Canvas");
        this.OnResized_Bound = this.onResized.bind(this);
        if(cc.sys.isBrowser && cc.sys.isMobile){
            window.addEventListener('resize', this.OnResized_Bound);
            window.addEventListener('orientationchange', this.OnResized_Bound);
        }else{
            cc.view.on('canvas-resize', this.onResized, this);
        }
        this.onResized();
    },
    
    onDestroy(){
        if(cc.sys.isBrowser && cc.sys.isMobile){
            window.removeEventListener('resize', this.OnResized_Bound);
            window.removeEventListener('orientationchange', this.OnResized_Bound);
        }else{
            cc.view.off('canvas-resize', this.onResized, this);
        }
    },

    onResized(){
        this.scheduleOnce(()=>{
            let w_ratio = this.Canvas.width/this.node.width;
            let h_ratio = this.Canvas.height/this.node.height;
            this.node.scale = Math.max(w_ratio,h_ratio);
        },0);
    },

});
