
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

        Spawn_Rate:{
            min:0,
            default:15,
            tooltip:"per minute",
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
        let index_list = [];
        for(let i = 0; i < this.Total_Citizens ; i++ ){
            let citizen = cc.instantiate(this.Citizen_Prefab);
            this.Citizens_List.push(citizen);
            index_list.push(i);;
        }

        this.Infected_Count = Math.min(this.Infected_Count,this.Total_Citizens);
        for( let i = 0 ; i < this.Infected_Count ; i++ ){
            let index = Math.floor(Math.random()*index_list.length);
            this.Citizens_List[index_list[index]].getComponent("citizen_control").Infected = true;
            index_list.splice(index,1);
        }

        this.Street_Count = 0;

        this.Set_Spawn_Rate(this.Spawn_Rate);

        // Indicators
        this.Update_Infected_Indicator();
        this.Update_Street_Indicator();

    },

    Spawn_Citizen(){
        
        if(this.Citizens_List.length > 0){
            let rnd_home = Math.floor(Math.random() * this.Home_List.length); // Spawn from random home
            this.Home_List[rnd_home].home_control.Spawn_Citizen(this.Citizens_List[0]);
            this.Citizens_List.splice(0,1);
            this.Street_Count++;
            this.Update_Street_Indicator();
        }

    },

    Home_Citizen(node){
        this.Citizens_List.push(node);
        this.Street_Count--;
        this.Update_Street_Indicator();
    },

    Set_Spawn_Rate(rate){

        this.Spawn_Rate = rate;

        this.unschedule(this.Spawn_Citizen);
        if(rate > 0){
            this.schedule( this.Spawn_Citizen , 60/rate );
        }

    },

    Increase_Infected_Count(number){
        this.Infected_Count += number;
        this.Update_Infected_Indicator();
    },

    Update_Infected_Indicator(){
        smsg.Infected_Indicator.getComponent(cc.Label).string = this.Infected_Count + "/" + this.Total_Citizens;
    },

    Update_Street_Indicator(){
        smsg.Street_Indicator.getComponent(cc.Label).string = this.Street_Count;
    },

 
});
