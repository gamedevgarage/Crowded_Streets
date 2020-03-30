
cc.Class({
    extends: cc.Component,
    editor: CC_EDITOR && {
        menu: 'SMSG/Util/sprite_effect',
    },
    properties: {

    },

    __preload(){
        this.node.sprite_effect = this;
    },

    onLoad() {

        this.Duration = 1;
        this.Wipe_Start = 0;
        this.Wipe_End = 1;

        this.Sprite = this.node.getComponent(cc.Sprite);
        if(!this.Sprite){
            cc.error(this.name + ": No sprite component!");
            this.Start_Animation = this.Void_Func;
        }
    },

    update (dt) {
        this.Wipe_Update(dt);
    },

    Wipe_Update(){},

    Wipe_Update_Func(dt){
        let step = (dt/this.Duration)*(this.Wipe_End-this.Wipe_Start);
        this.Sprite.fillRange += step;

        if( step < 0 && this.Sprite.fillRange <= this.Wipe_End){
            this.Sprite.fillRange = this.Wipe_End;
            this.Stop_Wipe_Animation();
        }else if( step > 0 && this.Sprite.fillRange >= this.Wipe_End){
            this.Sprite.fillRange = this.Wipe_End;
            this.Stop_Wipe_Animation();
        }
    },

    Void_Func(){},

    Start_Wipe_Animation(duration, start, end){
        this.Duration = duration;
        this.Wipe_Start = start;
        this.Wipe_End = end;
        this.Sprite.fillRange = this.Wipe_Start;
        this.Wipe_Update = this.Wipe_Update_Func;
    },

    Stop_Wipe_Animation(){
        this.Sprite.fillRange = this.Wipe_End;
        this.Wipe_Update = this.Void_Func;
    },

    Set_Wipe(ratio){
        this.Stop_Wipe_Animation();
        this.Sprite.fillRange = ratio;
    }

});
