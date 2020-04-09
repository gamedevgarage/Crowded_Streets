
cc.Class({
    extends: cc.Component,

    properties: {

    },

    __preload(){
        smsg.Camera_Control = this;
    },

    onDestroy(){
        smsg.Camera_Control = null;
    },

    onLoad () {},

    start () {

    },

    update (dt) {

        let pos = this.node.convertToWorldSpaceAR(cc.Vec3.ZERO);
        let target_pos = smsg.Player_Control.node.convertToWorldSpaceAR(cc.Vec3.ZERO);
        
        pos.lerp(target_pos, 1*dt, pos);

        pos = this.node.parent.convertToNodeSpaceAR(pos);

        this.node.setPosition(pos);

    },
});
