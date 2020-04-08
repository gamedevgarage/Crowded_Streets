
'user strict';
//let UPNG = require("UPNG"); // Not used, we can remove from assets before release
var JPEG_Encoder = require("jpeg_js_encoder");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    __preload(){
        smsg.Native_Share = this;
    },

    onDestroy(){
        smsg.Native_Share = null;
    },

    onLoad(){
        this.Render_Texture = new cc.RenderTexture();
        this.Render_Texture.initWithSize(cc.visibleRect.width, cc.visibleRect.height, cc.gfx.RB_FMT_S8);
    },

    Share_Screenshot(){
        if(this.Busy){ // prevent multiple calls
            return;
        }
        this.Busy = true;

        if( true || smsg.Sdkbox_Control.Share_Available() ){
            this.Set_Render_Target(this.Render_Texture); // let the camera to render one frame on the texture
            this.scheduleOnce(function(){ 
                this.Capture_Screen_And_Share();
                this.Set_Render_Target(null); // remove render target
            }.bind(this),0);
        }else{
            cc.log("Share is not available!");
        }
    },

    Set_Render_Target(render_texture){
        for(let i = 0 ; i < cc.Camera.cameras.length ; i++ ){
            let cam = cc.Camera.cameras[i];
            cam.targetTexture = render_texture;
        } 
    },

    Capture_Screen_And_Share(){

        let Image_Data = this.Read_GL_Pixels();

        //let png_bytes = this.Encode_PNG( Image_Data.data , Image_Data.width , Image_Data.height , 1024 );

        let jpeg_bytes = this.Encode_JPEG( Image_Data, 85 );

        let filename = jsb.fileUtils.getWritablePath() + "Crowded_Streets_"+this.Time_Stamp()+".jpg";

        // cc.log(filename);

        this.Write_To_File( jpeg_bytes , filename , function(){

            var shareInfo = {};
            shareInfo.title = "Share the fun!";
            shareInfo.text = "Crowded Streets is awesome!";
            shareInfo.image = filename;
            shareInfo.link = "https://www.instagram.com/stayathomegame/";

            // let settings = smsg.Game_Settings.social_share; // Customize based on OS
            // if(cc.sys.os === cc.sys.OS_ANDROID){
            //     shareInfo.title = settings.Android.Title || shareInfo.title;
            //     shareInfo.text = settings.Android.Text || shareInfo.text;
            //     shareInfo.link = settings.Android.Link || shareInfo.link;
            // }else if(cc.sys.os === cc.sys.OS_IOS){
            //     shareInfo.title = settings.iOS.Title || shareInfo.title;
            //     shareInfo.text = settings.iOS.Text || shareInfo.text;
            //     shareInfo.link = settings.iOS.Link || shareInfo.link;
            // }

            // Share action
            smsg.Sdkbox_Control.Native_Share(shareInfo);

            setTimeout(function(){ // Remove flag 3 secs after share
                this.Busy = false;
            }.bind(this),5000);

            /* cc.loader.load(filename, function(err, texture) {
                if (!err && texture) {
                    let sprite = this.node.getComponent(cc.Sprite);
                    sprite.spriteFrame = new cc.SpriteFrame(texture);
                }else{
                    cc.log("Load Error: " + err);
                }
            }.bind(this)); */
            
        }.bind(this) );

    },

    Read_GL_Pixels(){

        let pixels = this.Render_Texture.readPixels();

        let width = cc.visibleRect.width;
        let height = cc.visibleRect.height;

        // Flip vertical
        let halfHeight = height / 2 | 0;  // the | 0 keeps the result an int
        let bytesPerRow = width * 4;

        // make a temp buffer to hold one row
        let temp = new Uint8Array(width * 4);
        for (let y = 0; y < halfHeight; ++y) {
            let topOffset = y * bytesPerRow;
            let bottomOffset = (height - y - 1) * bytesPerRow;

            // make copy of a row on the top half
            temp.set(pixels.subarray(topOffset, topOffset + bytesPerRow));

            // copy a row from the bottom half to the top
            pixels.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);

            // copy the copy of the top half row to the bottom half 
            pixels.set(temp, bottomOffset);
        }

        // Fix alpha to 1
        for(let i = 0 ; i < pixels.length ; i+=4){
            // pixels[i] // R
            // pixels[i+1] // G
            // pixels[i+2] // B
            pixels[i+3] = 255; // A
        }

        let Image_Data = {
            width: width,
            height: height,
            data: pixels
        }

        return Image_Data;
    },

    /* Encode_PNG( pixels , width , height , colors ){

        let png = UPNG.encode([pixels.buffer], width, height, colors );
        
        let png_bytes = new Uint8Array(png);

        return png_bytes;

    }, */

    Encode_JPEG( Image_Data , Quality ){
        let Jpeg_Image = JPEG_Encoder(Image_Data, Quality);
        return Jpeg_Image.data;
    },

    Write_To_File( data_bytes , file_name , callback ){

        if (jsb.fileUtils.writeDataToFile( data_bytes , file_name )) {

            callback();

            /* cc.loader.load(dir, (err, texture) => {
                if (!err && texture) {
                    this.target.spriteFrame = new cc.SpriteFrame(texture);
                    cc.loader.release(dir);
                }
                jsb.fileUtils.removeFile(dir);
            }); */
        }

    },

    Time_Stamp() {
        var today = new Date();
        var y = today.getFullYear();
        var m = today.getMonth() + 1;
        var d = today.getDate();
        var h = today.getHours();
        var mi = today.getMinutes();
        var s = today.getSeconds();
        return y + "" + m + "" + d + "" + h + "" + mi + "" + s;
    }

});
