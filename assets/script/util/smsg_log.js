'use strict'; // =================================================
// Define global smsg log functions

window.smsg = window.smsg || {};
window.smsg.log_data = "";
window.smsg.log_screen = null;

if (!CC_EDITOR) {
  // define a new console output
  (function () {
    var oldLog = console.log;

    cc.log = console.log = function (txt) {
      smsg.log_data = smsg.log_data + txt + "\n";

      if (smsg.log_screen) {
        smsg.log_screen.Add_Log_Text(txt + "\n");
        smsg.log_screen.ScrollView.scrollToBottom();
      }

      oldLog.apply(console, arguments);
    };

    // var oldInfo = console.info;

    // cc.info = console.info = function (txt) {
    //   smsg.log_data = smsg.log_data + "[INFO] " + txt + "\n";

    //   if (smsg.log_screen) {
    //     smsg.log_screen.Add_Log_Text("[INFO] " + txt + "\n");
    //     smsg.log_screen.ScrollView.scrollToBottom();
    //   }

    //   oldInfo.apply(console, arguments);
    // };

    var oldWarn = console.warn;

    cc.warn = console.warn = function (txt) {
      smsg.log_data = smsg.log_data + "[WARN] " + txt + "\n";

      if (smsg.log_screen) {
        smsg.log_screen.Add_Log_Text("[WARN] " + txt + "\n");
        smsg.log_screen.ScrollView.scrollToBottom();
      }

      oldWarn.apply(console, arguments);
    };

    var oldError = console.error;

    cc.error = console.error = function (txt) {
      smsg.log_data = smsg.log_data + "[ERROR] " + txt + "\n";

      if (smsg.log_screen) {
        smsg.log_screen.Add_Log_Text("[ERROR] " + txt + "\n");
        smsg.log_screen.ScrollView.scrollToBottom();
      }

      oldError.apply(console, arguments);
    };
  })();
} // =================================================