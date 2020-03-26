// Action type
var ACTION_TYPE = require("C:/Cocos_Projects/SMSG/project_base/SMSG_v02/assets/source/script/Physics/action_type");

//Prompt
const prompt = require('electron-prompt');

module.exports = {

    // =============================================================
    // COMMON



    Find_Selected_Node(node){

        if(node.gizmo && node.gizmo.editing){ // node is selected
            return node;
        }else{
            let found = null;
            for(let i = 0 , n = node.children.length ; i<n ; i++ ){
                let child = node.children[i];
                found = this.Find_Selected_Node(child);
                if(found)break;
            }
            return found;
        }


    },
    
    // ===============================================================
    // Check scene for errors
    /* 'check_scene': function (event) {

        let scene = cc.director.getScene();
        this.Check_Node_Data(scene);
        
        //Editor.log("Scene check done!");

    },

    // Check node data recursively
    Check_Node_Data(node){

        if(node.smsg_uuid){

            if(node.smsg_uuid != node.uuid){
                Editor.warn(node.name + ": smsg_uuid is different than uuid!");
            }

        }else{
            Editor.warn(node.name + " : " + node.uuid +" : smsg_uuid is not defined!");
        }

        for( let i = 0 ; i < node.children.length ; i++ ){
            this.Check_Node_Data(node.children[i]);
        }

    },
     */

    // ===============================================================
    // Replace Alpha Pack Sprites
    /* 'replace_alpha_packed_sprites': function (event){

        window.smsg_Sprites_Checked = 0;
        window.smsg_Sprites_Replaced = 0;
         
        
        Editor.log("*** ALPHA PACK ATLAS STARTED *** ");
        
        let Selected_Base_Node = this.Find_Selected_Node(cc.director.getScene());

        if(Selected_Base_Node){  
            if(confirm("All sprites on node and its children will be replaced?: " + Selected_Base_Node.name)){

                var self = this;
                // Get asset list
                this.Get_Sprite_Frame_Assets(function(Asset_List){

                    let Asset_Named_List={
                        name_list:[],
                        data_list:[],
                    }
                    let error = false;
                    // Setup "file_name"s in Asset_List and Asset_Named_List object for easy query
                    for(let i = 0 , n = Asset_List.length ; i<n ; i++ ){

                        let asset_data = Asset_List[i];
                        let fname = self.Get_File_Name(asset_data.url);
                        asset_data.file_name = fname;

                        let index = Asset_Named_List.name_list.indexOf(fname);
                        
                        if( index === -1){ // new name - push it

                            Asset_Named_List.name_list.push(fname);
                            Asset_Named_List.data_list.push(asset_data);

                        }else{// name conflict

                            Editor.warn("Duplicate asset name found!: "+fname+"\n" ,  [asset_data.url , " "+Asset_Named_List.data_list[index].url] );
                            error = true;
                        }

                    }

                    if(!error){
                        //Editor.log("Asset names checked, all is OK.");
                        self.Replace_Sprite_Frame_Recursive( Selected_Base_Node , Asset_Named_List );
                        Editor.log("Checked: " + window.smsg_Sprites_Checked + " - " + "Replaced: " + window.smsg_Sprites_Replaced);
                        Editor.log("Press F7 to reload sprites.");
                    }else{
                        alert("Error occured!");
                    }

                });

            }
        }else{
            Editor.warn("No node selected!");
            alert("No node selected!");
        }
    },

    Get_File_Name(url){

        return url.split('\\').pop().split('/').pop();

    },

    Get_Sprite_Frame_Assets(callback){

        var self = this;
        Editor.assetdb.queryAssets( 'db://assets/**\/*', 'sprite-frame', function ( err, results ) {
            callback(results);
        });


    },

    Replace_Sprite_Frame_Recursive( node , Asset_Named_List ){

        let sprite = node.getComponent(cc.Sprite); // get sprite comp

        if(sprite && sprite.spriteFrame && sprite.spriteFrame.name){ // valid for replace
            
            window.smsg_Sprites_Checked++; // flag

            let sf_name = sprite.spriteFrame.name;

            if(sf_name.indexOf("_rgb") !== -1){ // Already packed sprite

                Editor.log("Sprite frame is already packed: " + sf_name );
            
            }else{

                // Find in list
                let index = Asset_Named_List.name_list.indexOf(sf_name+"_rgb.png");
                if(index === -1){
                    index = Asset_Named_List.name_list.indexOf(sf_name+"_rgb.jpg");
                }

                if(index !== -1){ // found

                    let asset_name = Asset_Named_List.name_list[index];
                    let asset_data = Asset_Named_List.data_list[index];

                    //Editor.log("Packed frame found: " + asset_name );

                    cc.loader.load({uuid:asset_data.uuid, type: 'uuid'}, function (err, sprite_frame) {

                        if(!err){
                            sprite.spriteFrame = sprite_frame;
                        }else{
                            Editor.error("Error when loading sprite frame: " +asset_name + " : " + asset_data.uuid);
                        }
    
                    });

                    window.smsg_Sprites_Replaced++;

                }else{
                    Editor.warn("Packed frame not found. Node: " + sprite.node.name + " - Frame: " + sf_name );
                }

            }

        }

        for(let i = 0 , n = node.children.length ; i<n ; i++ ){
            let child = node.children[i];
            this.Replace_Sprite_Frame_Recursive( child , Asset_Named_List );
        }

    },

    Replace_With_Normal_Sprite_Frame_Recursive ( node , Asset_Named_List ){

        let sprite = node.getComponent(cc.Sprite); // get sprite comp

        if(sprite && sprite.spriteFrame && sprite.spriteFrame.name){ // valid for replace
            
            window.smsg_Sprites_Checked++; // flag

            let sf_name = sprite.spriteFrame.name;

            if(sf_name.indexOf("_rgb") !== -1){ // Already packed sprite

                sf_name = sf_name.slice(0, -4);

                // Find in list
                let index = Asset_Named_List.name_list.indexOf(sf_name);
               

                if(index !== -1){ // found

                    let asset_name = Asset_Named_List.name_list[index];
                    let asset_data = Asset_Named_List.data_list[index];

                    //Editor.log("Packed frame found: " + asset_name );

                    cc.loader.load({uuid:asset_data.uuid, type: 'uuid'}, function (err, sprite_frame) {

                        if(!err){
                            sprite.spriteFrame = sprite_frame;
                        }else{
                            Editor.error("Error when loading sprite frame: " +asset_name + " : " + asset_data.uuid);
                        }
    
                    });

                    window.smsg_Sprites_Replaced++;

                }else{
                    Editor.warn("Standard frame not found. Node: " + sprite.node.name + " - Frame: " + sf_name );
                }

            
            }else{

                Editor.log("Sprite frame is already standard: " + sf_name );

            }

        }

        for(let i = 0 , n = node.children.length ; i<n ; i++ ){
            let child = node.children[i];
            this.Replace_With_Normal_Sprite_Frame_Recursive( child , Asset_Named_List );
        }

    },

    'replace_with_normal_sprites': function (event){

        window.smsg_Sprites_Checked = 0;
        window.smsg_Sprites_Replaced = 0;
         
        
        Editor.log("*** REPLACE WITH NORMAL SPRITES STARTED *** ");
        
        let Selected_Base_Node = this.Find_Selected_Node(cc.director.getScene());

        if(Selected_Base_Node){  
            if(confirm("All sprites on node and its children will be replaced?: " + Selected_Base_Node.name)){

                var self = this;
                // Get asset list
                this.Get_Sprite_Frame_Assets(function(Asset_List){

                    let Asset_Named_List={
                        name_list:[],
                        data_list:[],
                    }
                    let error = false;
                    // Setup "file_name"s in Asset_List and Asset_Named_List object for easy query
                    for(let i = 0 , n = Asset_List.length ; i<n ; i++ ){

                        let asset_data = Asset_List[i];
                        let fname = self.Get_File_Name(asset_data.url);
                        asset_data.file_name = fname;

                        let index = Asset_Named_List.name_list.indexOf(fname);
                        
                        if( index === -1){ // new name - push it

                            Asset_Named_List.name_list.push(fname);
                            Asset_Named_List.data_list.push(asset_data);

                            //Editor.log("PUSH: " + fname );

                        }else{// name conflict

                            Editor.warn("Duplicate asset name found!: "+fname+"\n" ,  [asset_data.url , " "+Asset_Named_List.data_list[index].url] );
                            error = true;
                        }

                    }

                    if(!error){
                        //Editor.log("Asset names checked, all is OK.");
                        self.Replace_With_Normal_Sprite_Frame_Recursive( Selected_Base_Node , Asset_Named_List );
                        Editor.log("Checked: " + window.smsg_Sprites_Checked + " - " + "Replaced: " + window.smsg_Sprites_Replaced);
                        Editor.log("Press F7 to reload sprites.");
                    }else{
                        alert("Error occured!");
                    }

                });

            }
        }else{
            Editor.warn("No node selected!");
            alert("No node selected!");
        }

    }, */

    // ===============================================================
    // Fix Joints: 
    'fix_joints' : function(event){

        let node = this.Find_Selected_Node(cc.director.getScene());

        if(node){


            let joint_list = node.getComponents(cc.Joint);

            if(joint_list.length == 0){
                Editor.warn("No joints on selected node!");
                alert("No joints on selected node!");
                return;
            }

            for( let i = 0 , n = joint_list.length ; i < n ; i++ ){
    
                let joint = joint_list[i];
                if(!joint.connectedBody){ // No body
                    Editor.warn("No connected body on: " + joint.name);
                    continue;
                }
               
                let Fix_Anchor = ( Math.abs(joint.anchor.x)  < 0.001 && Math.abs(joint.anchor.y)  < 0.001 );
                let Fix_Connected_Anchor = (Math.abs(joint.connectedAnchor.x) < 0.001 && Math.abs(joint.connectedAnchor.y) < 0.001);
                let error = false;
                
                let fix_anc = cc.v2();
                let fix_conanc = cc.v2();

                let connected_node = joint.connectedBody.node;

                if(Fix_Anchor && Fix_Connected_Anchor){

                    fix_conanc = node.convertToWorldSpaceAR(fix_anc); // calculate anchor position relative to remote object
                    fix_conanc = connected_node.convertToNodeSpaceAR(fix_conanc);
                    fix_conanc.x = fix_conanc.x * connected_node.scaleX; // If object is scaled we have to calculate
                    fix_conanc.y = fix_conanc.y * connected_node.scaleY; // If object is scaled we have to calculate

                }else if(Fix_Connected_Anchor){
                    fix_anc = joint.anchor;
                    fix_conanc = node.convertToWorldSpaceAR(fix_anc); // calculate anchor position relative to remote object
                    fix_conanc = connected_node.convertToNodeSpaceAR(fix_conanc);
                    fix_conanc.x = fix_conanc.x * connected_node.scaleX; // If object is scaled we have to calculate
                    fix_conanc.y = fix_conanc.y * connected_node.scaleY; // If object is scaled we have to calculate

                }else if(Fix_Anchor){
                    fix_conanc = joint.connectedAnchor;
                    fix_anc = connected_node.convertToWorldSpaceAR(fix_conanc); // calculate anchor position relative to remote object
                    fix_anc = node.convertToNodeSpaceAR(fix_anc);
                    fix_anc.x = fix_anc.x * connected_node.scaleX; // If object is scaled we have to calculate
                    fix_anc.y = fix_anc.y * connected_node.scaleY; // If object is scaled we have to calculate

                }else{
                    error = true;
                    Editor.warn("Couldn't fix the joint!: " + joint.name);
                }

                if(!error){
                    joint.anchor = fix_anc;
                    joint.connectedAnchor = fix_conanc;

                    let ref_angle = smsg.util.Get_World_Rotation(node) - smsg.util.Get_World_Rotation(connected_node);
                    joint.referenceAngle = -ref_angle;
                }

            }

        }else{
            Editor.warn("No node selected!");
            alert("No node selected!");
        }

    },

    // ===============================================================
    // Fix Scale
    'fix_scale' : function(event){

        let node = this.Find_Selected_Node(cc.director.getScene());

        if(node){

            node.width *=  node.scaleX;
            node.height *= node.scaleY;

            // Polygon collider
            let colliders = node.getComponents(cc.PhysicsPolygonCollider);
            let colliders2 = node.getComponents(cc.PhysicsChainCollider);
            let colliders3 = node.getComponents(cc.PolygonCollider);

            colliders = colliders.concat(colliders2,colliders3);

            for( let i = 0 ; i < colliders.length ; i++ ){

                let collider = colliders[i];

                if(collider.offset !== undefined){
                    collider.offset.x *= node.scaleX;
                    collider.offset.y *= node.scaleY;
                }

                for(let j = 0 ; j < collider.points.length ; j++ ){
                    collider.points[j].x *= node.scaleX;
                    collider.points[j].y *= node.scaleY;
                }

            }

            // Box Collider
            colliders = node.getComponents(cc.PhysicsBoxCollider);
            colliders2 = node.getComponents(cc.BoxCollider);
            colliders = colliders.concat(colliders2);
            

            for( let i = 0 ; i < colliders.length ; i++ ){

                let collider = colliders[i];

                collider.offset.x *= node.scaleX;
                collider.offset.y *= node.scaleY;

                collider.size.width *= node.scaleX;
                collider.size.height *= node.scaleY;

            }

            // Circle Collider
            colliders = node.getComponents(cc.PhysicsCircleCollider);
            colliders2 = node.getComponents(cc.CircleCollider);
            colliders = colliders.concat(colliders2);

            for( let i = 0 ; i < colliders.length ; i++ ){

                let collider = colliders[i];

                collider.offset.x *= node.scaleX;
                collider.offset.y *= node.scaleY;

                collider.radius *= node.scaleX;

            }

            // Self Joints
            let joint_list = node.getComponents(cc.Joint);

            for( let i = 0 ; i < joint_list.length ; i++ ){
                joint_list[i].anchor.x *= node.scaleX;         
                joint_list[i].anchor.y *= node.scaleY;           
            }

            // Connected Joints
            let body = node.getComponent(cc.RigidBody);
            if(body){

                let joint_list = this.Get_Rigid_Body_Connected_Joint_List(body);

                for( let i = 0 ; i < joint_list.length ; i++ ){
                    joint_list[i].connectedAnchor.x *= node.scaleX;         
                    joint_list[i].connectedAnchor.y *= node.scaleY;          
                }
            }
        
            // Children
            for(let i = 0 ; i < node.children.length ; i++){

                let child = node.children[i];

                child.x *= node.scaleX;
                child.y *= node.scaleY;

            }

            node.scaleX=1;
            node.scaleY=1;

        }else{
            Editor.warn("No node selected!");
            alert("No node selected!");
        }

    },

    Get_Rigid_Body_Connected_Joint_List(body){

        let all_joints_in_scene = cc.director.getScene().getComponentsInChildren(cc.Joint);

        let joint_list = [];

        for(let i = 0 ; i < all_joints_in_scene.length ; i++ ){

            let joint = all_joints_in_scene[i];
            if(joint.connectedBody == body){
                joint_list.push(joint);
            }
        }

        return joint_list;
        
    },


    // ================================================================
    // Sort Actions
    'sort_actions' : function(event){


        let node = this.Find_Selected_Node(cc.director.getScene());

        if(node){

            let total = 0;

            // camera_trigger
            let comps = node.getComponents("camera_trigger");
            for( let i = 0 ; i < comps.length ; i++ , total++ ){
                comps[i].Visible_Actions.sort(function(a, b){return a.Delay_Time - b.Delay_Time});
                comps[i].Invisible_Actions.sort(function(a, b){return a.Delay_Time - b.Delay_Time});
            }

            // crystal_energy_collected_trigger
            comps = node.getComponents("crystal_energy_collected_trigger");
            for( let i = 0 ; i < comps.length ; i++ , total++ ){
                comps[i].Actions.sort(function(a, b){return a.Delay_Time - b.Delay_Time});
            }

            // logic_trigger
            comps = node.getComponents("logic_trigger");
            for( let i = 0 ; i < comps.length ; i++ , total++ ){
                comps[i].True_Actions.sort(function(a, b){return a.Delay_Time - b.Delay_Time});
                comps[i].False_Actions.sort(function(a, b){return a.Delay_Time - b.Delay_Time});
            }

            // object_hold_trigger
            comps = node.getComponents("object_hold_trigger");
            for( let i = 0 ; i < comps.length ; i++ , total++ ){
                comps[i].Actions.sort(function(a, b){return a.Delay_Time - b.Delay_Time});
            }

            // physics_trigger
            comps = node.getComponents("physics_trigger");
            for( let i = 0 ; i < comps.length ; i++ , total++ ){

                let triggers = comps[i].Triggers;
                for(let j = 0 ; j < triggers.length ; j++ ){
                    triggers[j].Actions.sort(function(a, b){return a.Delay_Time - b.Delay_Time});
                }
                
            }

            // simple_trigger
            comps = node.getComponents("simple_trigger");
            for( let i = 0 ; i < comps.length ; i++ , total++ ){
                comps[i].Actions.sort(function(a, b){return a.Delay_Time - b.Delay_Time});
            }

            // contact_control
            comps = node.getComponents("contact_control");
            for( let i = 0 ; i < comps.length ; i++ , total++ ){
                comps[i].Run_Actions.sort(function(a, b){return a.Delay_Time - b.Delay_Time});
            }
            
            Editor.log("Total " + total + " triggers sorted");

        }else{
            Editor.warn("No node selected!");
            alert("No node selected!");
        }

        
    
    },

    // ================================================================
    // Remove None Actions
    'remove_none_actions' : function(event){


        let node = this.Find_Selected_Node(cc.director.getScene());

        if(node){

            let total = 0;

            // camera_trigger
            let comps = node.getComponents("camera_trigger");
            for( let i = 0 ; i < comps.length ; i++ ){
                
                for( let a = 0 ; a < comps[i].Visible_Actions.length ; a++ ){
                    if(comps[i].Visible_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Visible_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }

                for( let a = 0 ; a < comps[i].Invisible_Actions.length ; a++ ){
                    if(comps[i].Invisible_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Invisible_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }

            }

            // crystal_energy_collected_trigger
            comps = node.getComponents("crystal_energy_collected_trigger");
            for( let i = 0 ; i < comps.length ; i++ ){

                for( let a = 0 ; a < comps[i].Actions.length ; a++ ){
                    if(comps[i].Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }

            }

            // logic_trigger
            comps = node.getComponents("logic_trigger");
            for( let i = 0 ; i < comps.length ; i++ ){

                for( let a = 0 ; a < comps[i].True_Actions.length ; a++ ){
                    if(comps[i].True_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].True_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }

                for( let a = 0 ; a < comps[i].False_Actions.length ; a++ ){
                    if(comps[i].False_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].False_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }

            }

            // object_hold_trigger
            comps = node.getComponents("object_hold_trigger");
            for( let i = 0 ; i < comps.length ; i++ ){

                for( let a = 0 ; a < comps[i].Actions.length ; a++ ){
                    if(comps[i].Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }

            }

            // physics_trigger
            comps = node.getComponents("physics_trigger");
            for( let i = 0 ; i < comps.length ; i++ ){

                let triggers = comps[i].Triggers;
                for(let j = 0 ; j < triggers.length ; j++ ){

                    for( let a = 0 ; a < triggers[j].Actions.length ; a++ ){
                        if(triggers[j].Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                            triggers[j].Actions.splice(a,1);
                            a--;
                            total++;
                        }
                    }

                }
                
            }

            // simple_trigger
            comps = node.getComponents("simple_trigger");
            for( let i = 0 ; i < comps.length ; i++ ){
                for( let a = 0 ; a < comps[i].Actions.length ; a++ ){
                    if(comps[i].Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }
            }

            // volcano_control
            comps = node.getComponents("volcano_control");
            for( let i = 0 ; i < comps.length ; i++ ){
                for( let a = 0 ; a < comps[i].Explode_Actions.length ; a++ ){
                    if(comps[i].Explode_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Explode_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }
            }

            // refuel_control
            comps = node.getComponents("refuel_control");
            for( let i = 0 ; i < comps.length ; i++ ){
                for( let a = 0 ; a < comps[i].Refuel_Actions.length ; a++ ){
                    if(comps[i].Refuel_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Refuel_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }
            }

            // service_station_control
            comps = node.getComponents("service_station_control");
            for( let i = 0 ; i < comps.length ; i++ ){
                for( let a = 0 ; a < comps[i].Repair_Actions.length ; a++ ){
                    if(comps[i].Repair_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Repair_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }
            }

            // upgrade_item
            comps = node.getComponents("upgrade_item");
            for( let i = 0 ; i < comps.length ; i++ ){
                for( let a = 0 ; a < comps[i].Upgrade_Actions.length ; a++ ){
                    if(comps[i].Upgrade_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Upgrade_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }
            }

            // contact_control
            comps = node.getComponents("contact_control");
            for( let i = 0 ; i < comps.length ; i++ ){
                for( let a = 0 ; a < comps[i].Run_Actions.length ; a++ ){
                    if(comps[i].Run_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Run_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }
            }

            // teleport
            comps = node.getComponents("teleport");
            for( let i = 0 ; i < comps.length ; i++ ){
                for( let a = 0 ; a < comps[i].Trigger_Actions.length ; a++ ){
                    if(comps[i].Trigger_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Trigger_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }
            }

            // generator_control
            comps = node.getComponents("generator_control");
            for( let i = 0 ; i < comps.length ; i++ ){
                for( let a = 0 ; a < comps[i].On_Actions.length ; a++ ){
                    if(comps[i].On_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].On_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }
                for( let a = 0 ; a < comps[i].Off_Actions.length ; a++ ){
                    if(comps[i].Off_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Off_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }

            }

            // object_break
            comps = node.getComponents("object_break");
            for( let i = 0 ; i < comps.length ; i++ ){
                for( let a = 0 ; a < comps[i].Trigger_Actions.length ; a++ ){
                    if(comps[i].Trigger_Actions[a].Action_Type == 0){ // ACTION_TYPE.None
                        comps[i].Trigger_Actions.splice(a,1);
                        a--;
                        total++;
                    }
                }
            }
            
            
            Editor.log("Total " + total + " actions removed");

        }else{
            Editor.warn("No node selected!");
            alert("No node selected!");
        }

        
    
    },


    // ================================================================
    // Find Action
    'find_action' : function(event){

        // Prompt action name
        prompt({
            title: 'Find Action',
            label: 'Action:',
            value: 'http://example.org',
            type: 'select',
            selectOptions:Object.keys(ACTION_TYPE)
        })
        .then((action_id) => {
            if(action_id === null) {
                //Editor.log('user cancelled');
            } else {

                Editor.log("FIND ACTIONS: " + Object.keys(ACTION_TYPE)[action_id]);

                let total = [0];

                let scene = cc.director.getScene();
                this.Find_Node_With_Action( scene , action_id , total );

                Editor.log("Total " + total[0] + " actions found");

            }
        })
        .catch(Editor.error);
    

    },

    // Find nodes with action
    Find_Node_With_Action( node , action_id , total ){

        // Check node ---------------------------
        
        // camera_trigger
        let comps = node.getComponents("camera_trigger");
        for( let i = 0 ; i < comps.length ; i++ ){
            
            for( let a = 0 ; a < comps[i].Visible_Actions.length ; a++ ){
                if(comps[i].Visible_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : camera_trigger.Visible_Actions");
                }
            }

            for( let a = 0 ; a < comps[i].Invisible_Actions.length ; a++ ){
                if(comps[i].Invisible_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : camera_trigger.Invisible_Actions");
                }
            }

        }

        // crystal_energy_collected_trigger
        comps = node.getComponents("crystal_energy_collected_trigger");
        for( let i = 0 ; i < comps.length ; i++ ){

            for( let a = 0 ; a < comps[i].Actions.length ; a++ ){
                if(comps[i].Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : crystal_energy_collected_trigger");
                }
            }

        }


        // force_area
        comps = node.getComponents("force_area");
        for( let i = 0 ; i < comps.length ; i++ ){

            for( let a = 0 ; a < comps[i].Begin_Contact_Actions.length ; a++ ){
                if(comps[i].Begin_Contact_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : force_area.Begin_Contact_Actions");
                }
            }

            for( let a = 0 ; a < comps[i].End_Contact_Actions.length ; a++ ){
                if(comps[i].End_Contact_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : force_area.End_Contact_Actions");
                }
            }

        }

        // lock_point
        comps = node.getComponents("lock_point");
        for( let i = 0 ; i < comps.length ; i++ ){

            for( let a = 0 ; a < comps[i].Lock_Actions.length ; a++ ){
                if(comps[i].Lock_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : lock_point.Lock_Actions");
                }
            }

            for( let a = 0 ; a < comps[i].Break_Actions.length ; a++ ){
                if(comps[i].Break_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : lock_point.Break_Actions");
                }
            }

        }

        // logic_trigger
        comps = node.getComponents("logic_trigger");
        for( let i = 0 ; i < comps.length ; i++ ){

            for( let a = 0 ; a < comps[i].True_Actions.length ; a++ ){
                if(comps[i].True_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : logic_trigger.True_Actions");
                }
            }

            for( let a = 0 ; a < comps[i].False_Actions.length ; a++ ){
                if(comps[i].False_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : logic_trigger.False_Actions");
                }
            }

        }

        // object_hold_trigger
        comps = node.getComponents("object_hold_trigger");
        for( let i = 0 ; i < comps.length ; i++ ){

            for( let a = 0 ; a < comps[i].Actions.length ; a++ ){
                if(comps[i].Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : object_hold_trigger");
                }
            }

        }

        // object_spawn
        comps = node.getComponents("object_spawn");
        for( let i = 0 ; i < comps.length ; i++ ){

            for( let a = 0 ; a < comps[i].Trigger_Actions.length ; a++ ){
                if(comps[i].Trigger_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : object_spawn");
                }
            }

        }

        // physics_trigger
        comps = node.getComponents("physics_trigger");
        for( let i = 0 ; i < comps.length ; i++ ){

            let triggers = comps[i].Triggers;
            for(let j = 0 ; j < triggers.length ; j++ ){
                for( let a = 0 ; a < triggers[j].Actions.length ; a++ ){
                    if(triggers[j].Actions[a].Action_Type == action_id){
                        total[0]++;
                        Editor.log(node.name + " : physics_trigger");
                    }
                }
            }
            
        }

        // prefab_spawn
        comps = node.getComponents("prefab_spawn");
        for( let i = 0 ; i < comps.length ; i++ ){
            for( let a = 0 ; a < comps[i].Trigger_Actions.length ; a++ ){
                if(comps[i].Trigger_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : prefab_spawn");
                }
            }
        }

        // simple_trigger
        comps = node.getComponents("simple_trigger");
        for( let i = 0 ; i < comps.length ; i++ ){
            for( let a = 0 ; a < comps[i].Actions.length ; a++ ){
                if(comps[i].Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : simple_trigger");
                }
            }
        }

        // volcano_control
        comps = node.getComponents("volcano_control");
        for( let i = 0 ; i < comps.length ; i++ ){
            for( let a = 0 ; a < comps[i].Explode_Actions.length ; a++ ){
                if(comps[i].Explode_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : volcano_control");
                }
            }
        }

        // refuel_control
        comps = node.getComponents("refuel_control");
        for( let i = 0 ; i < comps.length ; i++ ){
            for( let a = 0 ; a < comps[i].Refuel_Actions.length ; a++ ){
                if(comps[i].Refuel_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : refuel_control");
                }
            }
        }

        // service_station_control
        comps = node.getComponents("service_station_control");
        for( let i = 0 ; i < comps.length ; i++ ){
            for( let a = 0 ; a < comps[i].Repair_Actions.length ; a++ ){
                if(comps[i].Repair_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : service_station_control");
                }
            }
        }

        // upgrade_item
        comps = node.getComponents("upgrade_item");
        for( let i = 0 ; i < comps.length ; i++ ){
            for( let a = 0 ; a < comps[i].Upgrade_Actions.length ; a++ ){
                if(comps[i].Upgrade_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : upgrade_item");
                }
            }
        }

        // contact_control
        comps = node.getComponents("contact_control");
        for( let i = 0 ; i < comps.length ; i++ ){
            for( let a = 0 ; a < comps[i].Run_Actions.length ; a++ ){
                if(comps[i].Run_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : contact_control");
                }
            }
        }

        // teleport
        comps = node.getComponents("teleport");
        for( let i = 0 ; i < comps.length ; i++ ){
            for( let a = 0 ; a < comps[i].Trigger_Actions.length ; a++ ){
                if(comps[i].Trigger_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : teleport");
                }
            }
        }

        // weld_joint_break
        comps = node.getComponents("weld_joint_break");
        for( let i = 0 ; i < comps.length ; i++ ){
            for( let a = 0 ; a < comps[i].Trigger_Actions.length ; a++ ){
                if(comps[i].Trigger_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : weld_joint_break");
                }
            }
        }

        // generator_control
        comps = node.getComponents("generator_control");
        for( let i = 0 ; i < comps.length ; i++ ){
            for( let a = 0 ; a < comps[i].On_Actions.length ; a++ ){
                if(comps[i].On_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : generator_control.On_Actions");
                }
            }
            for( let a = 0 ; a < comps[i].Off_Actions.length ; a++ ){
                if(comps[i].Off_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : generator_control.Off_Actions");
                }
            }

        }

        // object_break
        comps = node.getComponents("object_break");
        for( let i = 0 ; i < comps.length ; i++ ){
            for( let a = 0 ; a < comps[i].Trigger_Actions.length ; a++ ){
                if(comps[i].Trigger_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : object_break");
                }
            }
        }

        // chronometer
        comps = node.getComponents("chronometer");
        for( let i = 0 ; i < comps.length ; i++ ){
            for( let a = 0 ; a < comps[i].Best_Time_Actions.length ; a++ ){
                if(comps[i].Best_Time_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : chronometer.Best_Time_Actions");
                }
            }
            for( let a = 0 ; a < comps[i].Not_Best_Time_Actions.length ; a++ ){
                if(comps[i].Not_Best_Time_Actions[a].Action_Type == action_id){
                    total[0]++;
                    Editor.log(node.name + " : chronometer.Not_Best_Time_Actions");
                }
            }

        }

        // Check children -----------------------
        for( let i = 0 ; i < node.children.length ; i++ ){
            this.Find_Node_With_Action(node.children[i] , action_id , total );
        }

    },

    // ===============================================================
    // Convert Chain to Polygon Collider

    'split_polygon_collider' : function(event){

        let node = this.Find_Selected_Node(cc.director.getScene());
        if(node){

            let polygon_colliders = node.getComponents(cc.PhysicsPolygonCollider);

            for(let i = 0 ; i < polygon_colliders.length ; i++ ){
                this.Split_Polygon_Collider(polygon_colliders[i]);
            }
            

        }else{
            Editor.warn("No node selected!");
            alert("No node selected!");
        }

    },

    Split_Polygon_Collider(polygon_collider){

        // Find touching points
        let touch_i = 0;
        let touch_j = 0;
        let found = false;
        loop:
        for(let i = 0 ; i < polygon_collider.points.length ; i++ ){
            for(let j = 0 ; j < polygon_collider.points.length ; j++){
                if( i == j ){
                    continue;
                }else if( Math.abs( polygon_collider.points[i].x - polygon_collider.points[j].x ) < 1  && Math.abs( polygon_collider.points[i].y - polygon_collider.points[j].y ) < 1){
                    Editor.log(polygon_collider.points[i].x + "," + polygon_collider.points[j].x + " : " + polygon_collider.points[i].y + "," +  polygon_collider.points[j].y  );
                    touch_i = i;
                    touch_j = j;
                    found = true;
                    break loop;
                }
            }
        }

        let split_points = polygon_collider.points.splice(touch_i, touch_j-touch_i);
        let polygon_collider_add = polygon_collider.node.addComponent(cc.PhysicsPolygonCollider);

        polygon_collider_add.density = polygon_collider.density;
        polygon_collider_add.friction = polygon_collider.friction;
        polygon_collider_add.restitution = polygon_collider.restitution;
        polygon_collider_add.points = split_points;

    },


    'reverse_polygon_collider' : function(event){

        let node = this.Find_Selected_Node(cc.director.getScene());
        if(node){

            let polygon_colliders = node.getComponent(cc.PolygonCollider);

            polygon_colliders.points = polygon_colliders.points.reverse();  

        }else{
            Editor.warn("No node selected!");
            alert("No node selected!");
        }

    },



};