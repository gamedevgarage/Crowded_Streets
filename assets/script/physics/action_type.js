// Action type
var ACTION_TYPE = cc.Enum({
    None:-1,
    Activate_Node:-1,
    Deactivate_Node:-1,
    Toggle_Node_Activation: -1,
    Emit_Event:-1,
    Logic_Trigger:-1,
    Trigger_Animation:-1,
    Camera_Shake:-1,
    Set_Camera_Target:-1,
    Load_Scene:-1,
    Analytics_Event:-1,
    Fade_In_Screen:-1,
    Fade_Out_Screen:-1,
    Enable_Controls:-1,
    Disable_Controls:-1,
    Show_Message:-1,
    Audio_Action:-1,
    Play_Cinematic:-1,
    Check_Objects_In_Trigger:-1,
    Remove_Objects_In_Trigger:-1,
    Remove_Objects:-1,
    Activate_Level:-1,
});

module.exports = ACTION_TYPE;

