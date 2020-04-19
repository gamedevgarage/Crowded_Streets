


cc.Class({
    extends: cc.Component,

    properties: {

        Render_Cam:cc.Camera,

        X_min:-500,
        X_max:500,
        Y_min:-500,
        Y_max:500,

    },

    __preload(){
        smsg.Camera_Control = this;
    },

    onDestroy(){
        smsg.Camera_Control = null;
    },

    onLoad () {
        
        this.temp_aabb = cc.geomUtils.Aabb.create();

        // Frustum culling
        this.frustum = cc.geomUtils.Frustum.create();
        this._mat_proj = new cc.Mat4();
        this._mat_view = new cc.Mat4();
        this._mat_inv_view = new cc.Mat4();
        this._mat_view_proj = new cc.Mat4();
        this._mat_inv_view_proj = new cc.Mat4();

        // Get mesh list
        this.Mesh_List = [];
        this.Add_Node_Tree_To_Mesh_List(smsg.Game_Layer)
        
    },

    Add_Node_Tree_To_Mesh_List(node){
        let meshes = node.getComponentsInChildren(cc.MeshRenderer);
        for(let i = 0 , n = meshes.length ; i < n ; i++ ){
            if(this.Mesh_List.indexOf(meshes[i]) === -1){ // not in list
                this.Mesh_List.push(meshes[i]);
            }
        }
    },

    Remove_Node_Tree_To_Mesh_List(node){
        let meshes = node.getComponentsInChildren(cc.MeshRenderer);
        for(let i = 0 , n = meshes.length ; i < n ; i++ ){
            let index = this.Mesh_List.indexOf(meshes[i]);
            if(index !== -1){ // found in list
                this.Mesh_List.splice(index,1);
            }
        }
    },

    start () {

    },

    update (dt) {

        let pos = this.node.convertToWorldSpaceAR(cc.Vec3.ZERO);
        let target_pos = smsg.Player_Control.node.convertToWorldSpaceAR(cc.Vec3.ZERO);
        
        target_pos.x = cc.misc.clampf(target_pos.x,this.X_min,this.X_max);
        target_pos.y = cc.misc.clampf(target_pos.y,this.Y_min,this.Y_max);

        pos.lerp(target_pos, Math.min(1,1.5*dt), pos);

        pos = this.node.parent.convertToNodeSpaceAR(pos);

        this.node.setPosition(pos);

        this.Update_Camera_Frustum();
        this.Frustum_Cull_Meshes();
        
    },

    Update_Camera_Frustum(){
        this.Render_Cam.node.getWorldRT(this._mat_inv_view);
        cc.Mat4.invert(this._mat_view, this._mat_inv_view);
        cc.Mat4.perspective(this._mat_proj,
            cc.misc.degreesToRadians(this.Render_Cam._fov),
            cc.view._frameSize.width/cc.view._frameSize.height,
            this.Render_Cam._nearClip,
            this.Render_Cam._farClip
        );
        cc.Mat4.mul(this._mat_view_proj, this._mat_proj, this._mat_view);   // view-projection
        cc.Mat4.invert(this._mat_inv_view_proj, this._mat_view_proj);       // inv view-projection
        this.frustum.update(this._mat_view_proj, this._mat_inv_view_proj);
    },

    Frustum_Cull_Meshes(){

        // console.time("c");
        
        // Mesh Renderers
        for(let i = 0 , n = this.Mesh_List.length ; i < n ; i++ ){      

            let mesh = this.Mesh_List[i];
            let aabb = null;
            if(mesh.smsg_static_aabb){
                aabb = mesh.smsg_static_aabb;
            }else{
                cc.geomUtils.Aabb.copy( this.temp_aabb , mesh._boundingBox );
                this.temp_aabb.transform( mesh.node._worldMatrix , null , null , this.temp_aabb );
                aabb = this.temp_aabb;
            }
            
            let result = cc.geomUtils.intersect.aabb_frustum( aabb , this.frustum );
            mesh.enabled = result;
        }

        // console.timeEnd("c");

    }

});
