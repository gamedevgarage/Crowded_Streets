


// Standard action
var STANDARD_ACTION = require("standard_action");

// Trigger type
var SIMPLE_TRIGGER_TYPE = cc.Enum({
    onLoad:-1,
    start:-1,
    onEnable:-1,
    onDisable:-1,
    onDestroy:-1,
    onTouchStart:-1,
    onTouchEnd:-1,
    onAnimationFinish:-1,
    onKeyDown:-1,
});

var ANIMATION_COMP_SELECT = cc.Enum({
    Self:-1,
    Custom:-1,
});

var KEY_STATE = require("key_state");

cc.Class({
    extends: cc.Component,

    editor : CC_EDITOR && {
        //executeInEditMode : true,
        menu: 'SMSG/Triggers/simple_trigger',
    },
    
    properties: {

        Trigger_Type:{
            default:SIMPLE_TRIGGER_TYPE.onEnable,
            type:SIMPLE_TRIGGER_TYPE,
        },

        Swallow_Touches:{
            default:true,
            visible(){ 
                return this.Trigger_Type === SIMPLE_TRIGGER_TYPE.onTouchStart;
            },
        },

        Animation_Comp_Select:{
            default:ANIMATION_COMP_SELECT.Self,
            type:ANIMATION_COMP_SELECT,
            visible(){ 
                return this.Trigger_Type === SIMPLE_TRIGGER_TYPE.onAnimationFinish;
            },
        },

        Animation_Comp:{
            default:null,
            type:cc.Animation,
            visible(){ 
                return this.Trigger_Type === SIMPLE_TRIGGER_TYPE.onAnimationFinish && this.Animation_Comp_Select === ANIMATION_COMP_SELECT.Custom;
            },
        },

        Trigger_Key:{
            default:KEY_STATE.KEY_NONE,
            type:KEY_STATE,
            visible(){
                return this.Trigger_Type === SIMPLE_TRIGGER_TYPE.onKeyDown;
            },
        },

        Actions:{
            default:[],
            type:[STANDARD_ACTION],
        },
        
    },


    onLoad(){
        if(CC_EDITOR){
            return;
        }

        // Set action functions to required action functions and call onLoad for each action
        for(let i = 0 , n = this.Actions.length ; i<n ; i++){
            this.Actions[i].node = this.node;
            this.Actions[i].onLoad(); // onLoad call
        }

        switch(this.Trigger_Type){

            case SIMPLE_TRIGGER_TYPE.onLoad:
                this.onLoad_Action = this.Trigger_Function;
            break;

            case SIMPLE_TRIGGER_TYPE.start:
                this.start_Action = this.Trigger_Function;
            break;

            case SIMPLE_TRIGGER_TYPE.onEnable:
                this.onEnable_Action = this.Trigger_Function;

                // First onEnable() call needs to be called in start()

                this.old_onEnable = this.onEnable;
                this.old_start = this.start;

                this.onEnable = function(){}; // null it

                this.start = function(){
                    
                    this.old_onEnable(); // call old enable
                    this.old_start(); // call old start
                    
                    // restore original functions
                    this.onEnable = this.old_onEnable;
                    this.start = this.old_start;

                };


            break;

            case SIMPLE_TRIGGER_TYPE.onDisable:
                this.onDisable_Action = this.Trigger_Function;
            break;

            case SIMPLE_TRIGGER_TYPE.onDestroy:
                this.onDestroy_Action = this.Trigger_Function;
            break;

            case SIMPLE_TRIGGER_TYPE.onTouchStart:
                this.onTouchStart_Action = this.Trigger_Function;
            break;

            case SIMPLE_TRIGGER_TYPE.onTouchEnd:
                this.onTouchEnd_Action = this.Trigger_Function;
            break;

            case SIMPLE_TRIGGER_TYPE.onAnimationFinish:

                this.onAnimationFinish_Action = this.Trigger_Function;

                if(this.Animation_Comp_Select === ANIMATION_COMP_SELECT.Self ){
                    this.Animation_Comp = this.node.getComponent(cc.Animation);
                }
                
                if(this.Animation_Comp){// Register event
                    this.Animation_Comp.on( "finished", this.onAnimationFinish_Action , this );
                }else{
                    cc.warn(this.name + ": Animation Comp doesn't exist!");
                }

            break;

            case SIMPLE_TRIGGER_TYPE.onKeyDown:
                this.onKeyDown_Action = this.Trigger_Function;
            break;

        }

        this.onLoad_Action();

    },

    Init_Touch_Events () {        

        if(this.Trigger_Type === SIMPLE_TRIGGER_TYPE.onTouchStart){

            if(this.Swallow_Touches === true){
                this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            }else{
                let listener={
                    event: cc.EventListener.TOUCH_ONE_BY_ONE,
                    swallowTouches: false,
                    onTouchBegan: function(touch,event){
                        
                        let pos = touch.getLocation();

                        if (this.node._hitTest(pos, this)) {
                            this.onTouchStart(event);
                        }
                        
                    }.bind(this)
                }
                cc.eventManager.addListener( listener , this.node);
            }
            
        }

        if(this.Trigger_Type === SIMPLE_TRIGGER_TYPE.onTouchEnd){

            if(this.Swallow_Touches === true){
                this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            }else{
                let listener={
                    event: cc.EventListener.TOUCH_ONE_BY_ONE,
                    swallowTouches: false,
                    onTouchEnded: function(touch,event){

                        let pos = touch.getLocation();

                        if (this.node._hitTest(pos, this)) {
                            this.onTouchEnd(event);
                        }
                        
                    }.bind(this)
                }
                cc.eventManager.addListener( listener , this.node);
            }

        }



    },

    Remove_Touch_Events(){
        
        if(this.Trigger_Type === SIMPLE_TRIGGER_TYPE.onTouchStart){
            if(this.Swallow_Touches === true){
                this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            }
        }
        if(this.Trigger_Type === SIMPLE_TRIGGER_TYPE.onTouchEnd){
            if(this.Swallow_Touches === true){
                this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            }
        }
        
    },

    Init_Key_Down_Events(){

        if(this.Trigger_Type === SIMPLE_TRIGGER_TYPE.onKeyDown){
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        }

    },

    Remove_Key_Down_Events(){

        if(this.Trigger_Type === SIMPLE_TRIGGER_TYPE.onKeyDown){
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        }

    },

    onKeyDown(event){

        if(event.keyCode == this.Trigger_Key){
            this.onKeyDown_Action();
        }

    },

    onDestroy(){
        for(let i = 0 , n = this.Actions.length ; i<n ; i++){
            this.Actions[i].onDestroy(); // onDestroy call
        }
    },

    update(dt){
        for(let i = 0 , n = this.Actions.length ; i<n ; i++){
            this.Actions[i].update(dt);
        }
    },

    start(){
        this.start_Action();
        //cc.log("OLD START CALLED!");
    },

    onEnable(){
        if(CC_EDITOR){
            return;
        }

        this.Init_Touch_Events();
        this.Init_Key_Down_Events();

        this.onEnable_Action();
        //cc.log("OLD ENABLE CALLED!");
    },

    onDisable(){
        if(CC_EDITOR){
            return;
        }
        this.Remove_Touch_Events();
        this.Remove_Key_Down_Events();
        this.onDisable_Action();

    },

    onDestroy(){
        this.onDestroy_Action();
    },

    onTouchStart(event){
        this.onTouchStart_Action();
        if(this.Swallow_Touches === true){
            event.stopPropagation();
        }
    },

    onTouchEnd(){
        this.onTouchEnd_Action();
    },

    onLoad_Action:function(){}, // Dynamically set

    start_Action:function(){}, // Dynamically set

    onEnable_Action:function(){}, // Dynamically set

    onDisable_Action:function(){}, // Dynamically set

    onDestroy_Action:function(){}, // Dynamically set

    onTouchStart_Action:function(){}, // Dynamically set

    onTouchEnd_Action:function(){}, // Dynamically set

    onAnimationFinish_Action(){}, // Dynamically set

    onKeyDown_Action(){}, // Dynamically set

    Trigger_Function(){

        // Tigger actions
        for(let i = 0 , n = this.Actions.length ; i<n ; i++){
            this.Actions[i].Action_Function();
        }

    },

    // Save Game
    Get_Comp_Data(){

        let comp_data = {};
        comp_data.Actions = [];

        for(let i = 0 , n = this.Actions.length ; i < n ; i++ ){
            comp_data.Actions.push( this.Actions[i].Get_Comp_Data() );
        }

        return comp_data;
    },

    // Load Game
    Set_Comp_Data( comp_data  ){

        for(let i = 0 , n = this.Actions.length ; i < n ; i++ ){
            this.Actions[i].Set_Comp_Data(comp_data.Actions[i]);
        }

    },

    

});
