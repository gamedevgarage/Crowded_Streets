
cc.Class({
    extends: cc.Component,

    properties: {

        Citizen_Prefab:{
            default:null,
            type:cc.Prefab,
        },

        Total_Citizens:{
            min:0,
            default:20,
        },

        Infected_Count:{
            min:0,
            default:3,
        },

        In_The_Street:{
            min:0,
            default:0
        },

        Spawn_Rate:{
            min:0,
            default:15,
            tooltip:"per minute"
        },


    },

    __preload(){
        smsg.Game_Control = this; // globalize
    },

    onDestroy(){
        smsg.Game_Control = null;
    },

    onLoad(){

        this.Home_List = [];
        smsg.util.Find_Nodes_With_Tag_In_Tree( smsg.Game_Layer, smsg.OBJECT_TAG_LIST.Home , this.Home_List );

        if(this.Home_List.length === 0){
            cc.error(this.name + ": Home_List is empty!" );
            return;
        }

        this.Citizens_List = [];
        this.Citizens_At_Home_List = [];
        for(let i = 0; i < this.Total_Citizens ; i++ ){
            let citizen = cc.instantiate(this.Citizen_Prefab);
            this.Citizens_List.push(citizen);
            this.Citizens_At_Home_List.push(citizen);
        }

        this.schedule( this.Spawn_Citizen , 60/this.Spawn_Rate );
    
    },

    Spawn_Citizen(){
        
        if(this.Citizens_At_Home_List.length > 0){
            let rnd_home = Math.floor(Math.random() * this.Home_List.length); // Spawn from random home
            this.Home_List[rnd_home].home_control.Spawn_Citizen(this.Citizens_At_Home_List[0]);
            this.Citizens_At_Home_List.splice(0,1);
        }

    },

    Home_Citizen(node){
        this.Citizens_At_Home_List.push(node);
    },


 
});
