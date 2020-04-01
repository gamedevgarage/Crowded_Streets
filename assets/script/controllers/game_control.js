

// EVENTS
// "start_day" -> on day started
// "end_day" -> on day completed


// var DAY_SETUP = cc.Class({
//     name: "DAY_SETUP",
//     properties:{
//         Total_Citizens:{
//             default:20,
//             step:1,
//             min:1,
//         },
//         Spawn_Rate:{
//             default:60,
//             step:1,
//             min:1,
//         },
//         Infected_Count:{
//             default:2,
//             step:1,
//         },
//         Day_Duration:{
//             default:60,
//             min:10,
//         }
//     }
// });

var DIFF_STEP = cc.Class({
    name: "DIFF_STEP",
    properties:{
        Citizen_Count:{
            default:10,
            step:1,
            min:0,
        },
        Citizen_Percent:{
            default:0,
            step:1,
            range:[0,100],
        },
        Spawn_Rate:{
            default:10,
            step:1,
            min:0,
        },
        Spawn_Rate_Percent:{
            default:0,
            step:1,
            range:[0,100],
        },
        Infected_Count:{
            default:2,
            step:1,
            min:0,
        },
        Infected_Percent:{
            default:0,
            step:1,
            range:[0,100],
        },
        Sneeze_Rate:{
            default:10,
            step:1,
            min:0,
        },
        Sneeze_Rate_Percent:{
            default:0,
            step:1,
            range:[0,100],
        },
        
    }
});


cc.Class({
    extends: cc.Component,

    properties: {

        Citizen_Prefab:{
            default:null,
            type:cc.Prefab,
        },

        Gold_Count:{
            default:0,
            step:1,
            min:0,
        },

        Total_Citizens:{
            min:0,
            default:20,
        },
        
        Spawn_Rate:{
            min:1,
            default:15,
            tooltip:"per minute",
        },

        Infected_Count:{
            min:0,
            default:3,
        },

        Sneeze_Rate:{
            default:10,
            min:1,
        },

        Day_Duration:{
            default:120,
            step:1,
            min:10,
        },

        Today:{
            default:0,
            step:1,
            min:0,
        },

        Difficulty_Step:{
            default:null,
            type:DIFF_STEP,
        },
        
        /* Days:{
            default:[],
            type:[DAY_SETUP],
        }, */

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

        this.Citizens_List = []; // nodes
        
        this.Street_Count = 0; // people in the street
        this.New_Infection_Count = 0; // for end day stats
        this.Day_Time = 0; // 0 to Day_Duration
        this.Waiting_Everybody_Home_To_End_Day = false; // flag

        this.Start_Day();
    },

    Spawn_Citizen(){
        if(this.Citizens_List.length > 0){
            let rnd_home = Math.floor(Math.random() * this.Home_List.length); // Spawn from random home
            let rnd_citizen = Math.floor(Math.random() * this.Citizens_List.length);
            this.Home_List[rnd_home].home_control.Spawn_Citizen(this.Citizens_List[rnd_citizen]);
            this.Citizens_List.splice(rnd_citizen,1);
            this.Street_Count++;
            this.Update_Street_Indicator();
        }
    },
    
    Home_Citizen(node){ // public
        this.Citizens_List.push(node);
        this.Street_Count--;
        this.Gold_Count++;
        this.Update_Street_Indicator();
        this.Update_Gold_Indicator();
        
        // Everybody at home
        if(this.Citizens_List.length === this.Total_Citizens){ 
            this.Everybody_At_Home();
        }
    },  
    
    Citizen_Infected(number){ // public
        this.Infected_Count += number;
        this.New_Infection_Count += number;
        this.Update_Infected_Indicator();
    },

    // Start day with settings
    Start_Day(){
        
        // this.Total_Citizens = this.Days[this.Today].Total_Citizens;
        // this.Spawn_Rate =  this.Days[this.Today].Spawn_Rate;
        // this.Infected_Count = this.Days[this.Today].Infected_Count;
        // this.Day_Duration = this.Days[this.Today].Day_Duration;
        this.Day_Time = 0;
        this.New_Infection_Count = 0;

        // Update Citizens ---------------------------
        // ***************** NEED TO DESTROY OLD CITIZENS ********************
        this.Citizens_List = [];
        let index_list = [];
        for(let i = 0; i < this.Total_Citizens ; i++ ){
            let citizen = cc.instantiate(this.Citizen_Prefab);
            citizen.getComponent("citizen_control").Sneeze_Rate = this.Sneeze_Rate;
            this.Citizens_List.push(citizen);
            index_list.push(i);
        }
        this.Infected_Count = Math.min(this.Infected_Count,this.Total_Citizens);
        for( let i = 0 ; i < this.Infected_Count ; i++ ){
            let index = Math.floor(Math.random()*index_list.length);
            this.Citizens_List[index_list[index]].getComponent("citizen_control").Infected = true;
            index_list.splice(index,1);
        }
        // -------------------------------------------

        
        // updates
        this.schedule(this.Update_Day_Time,1);
        this.schedule( this.Spawn_Citizen , 60/this.Spawn_Rate );

        this.Waiting_Everybody_Home_To_End_Day = false;

        // Indicators
        this.Update_Infected_Indicator();
        this.Update_Street_Indicator();
        this.Update_Day_Indicator();
        this.Update_Gold_Indicator();

        this.node.emit("start_day");

    },

    // End_Day_When_Everybody_At_Home
    End_Day_When_Everybody_At_Home(){
        this.Waiting_Everybody_Home_To_End_Day = true;
        this.unschedule(this.Update_Day_Time);
        this.unschedule(this.Spawn_Citizen);
        
        if(this.Citizens_List.length === this.Total_Citizens){ // everybody is already home
            this.Everybody_At_Home();
        }
        cc.log("Waiting everybody to go home to end the day!");
    },

    Everybody_At_Home(){
        if(this.Waiting_Everybody_Home_To_End_Day === true){
            cc.log("Day Finished!");
            this.scheduleOnce(function(){
                this.End_The_Day();
            }.bind(this),1); // Show End Day Screen
        }
    },

    // call every second
    Update_Day_Time(){ 
        this.Day_Time ++;
        if(this.Day_Time >= this.Day_Duration){ // Day end
            this.End_Day_When_Everybody_At_Home();
        }
        this.Update_Day_Indicator();
    },

    // Shows end day screen
    End_The_Day(){
        this.node.emit("end_day");

        this.Stop_Game();
        smsg.Main_Game_Control.Show_End_Day_Screen();
    },

    Stop_Game(){
        // We may need to pause all citizens, etc... I don't know :)
    },

    Start_Next_Day(){
        this.Today++;

        this.Total_Citizens = Math.ceil( this.Total_Citizens * (1+(this.Difficulty_Step.Citizen_Percent/100)));
        this.Total_Citizens += this.Difficulty_Step.Citizen_Count;
        
        this.Spawn_Rate = Math.ceil( this.Spawn_Rate * (1+(this.Difficulty_Step.Spawn_Rate_Percent/100)));
        this.Spawn_Rate += this.Difficulty_Step.Spawn_Rate;

        this.Infected_Count  = Math.ceil( this.Infected_Count * (1+(this.Difficulty_Step.Infected_Percent/100)));
        this.Infected_Count += this.Difficulty_Step.Infected_Count;

        this.Sneeze_Rate = Math.ceil( this.Sneeze_Rate * (1+(this.Difficulty_Step.Sneeze_Rate_Percent/100)));
        this.Sneeze_Rate += this.Difficulty_Step.Sneeze_Rate;

        this.Start_Day();
    },

    // UI Updates -----------------------------------------
    Update_Infected_Indicator(){
        smsg.Infected_Indicator.getComponent(cc.Label).string = this.Infected_Count + "/" + this.Total_Citizens;
    },

    Update_Street_Indicator(){
        smsg.Street_Indicator.getComponent(cc.Label).string = this.Street_Count;
    },

    Update_Day_Indicator(){
        smsg.Day_Indicator.getComponent(cc.Label).string = (this.Today+1)+"("+Math.floor( (this.Day_Time/this.Day_Duration)*100)+"%)";
    },

    Update_Gold_Indicator(){
        smsg.Gold_Indicator.getComponent(cc.Label).string = this.Gold_Count;
    },
 
});
