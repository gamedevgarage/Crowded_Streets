
cc.Class({
    extends: cc.Component,

    properties: {
        Agreement_Panel:cc.Node,
    },


    onLoad () {
        let accepted = smsg.util.Get_Local_Storage("agreement_accepted");
        if(!accepted){
            this.Agreement_Panel.active = true;
        }
    },

    Accept_Agreement(){
        smsg.util.Set_Local_Storage("agreement_accepted","true");
        this.Agreement_Panel.active = false;
    },
    
});
