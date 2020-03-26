'use strict'; // ********************************
// Utility Function Library 
// ********************************

/* Usage

smsg.util.Get_World_Rotation(node);
*/
// Global data accessible from all scripts

window.smsg = window.smsg || {};
window.smsg.util = {
  bezier: function bezier(c0, c1, c2, c3, t) {
    // calculates bezier function
    return t === 1 ? 1 : t === 0 ? 0 : Math.pow(1 - t, 3) * c0 + 3 * Math.pow(1 - t, 2) * t * c1 + 3 * (1 - t) * Math.pow(t, 2) * c2 + Math.pow(t, 3) * c3;
  },
  Get_World_Rotation: function Get_World_Rotation(node) {
    // calculates world rotation of the node
    var parent_node = node.parent;
    var scene = cc.director.getScene();
    var rot = -node.angle;

    while (parent_node !== scene && parent_node !== null) {
      rot += -parent_node.angle;
      parent_node = parent_node.parent;
    }

    return rot;
  },
  Get_World_Scale: function Get_World_Scale(node) {
    // calculates world scale of the node
    var parent_node = node.parent;
    var scene = cc.director.getScene();
    var scale = [1, 1];
    scale[0] = node.scaleX;
    scale[1] = node.scaleY;

    while (parent_node !== scene && parent_node !== null) {
      scale[0] *= parent_node.scaleX;
      scale[1] *= parent_node.scaleY;
      parent_node = parent_node.parent;
    }

    return scale;
  },
  Validate_Email: function Validate_Email(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
  Setup_Spawned_Object_UUID: function Setup_Spawned_Object_UUID(spawned_object) {
    // Add .smsg_uuid_in_prefab
    spawned_object.smsg_uuid_in_prefab = spawned_object._prefab.fileId; // _prefab.fileId is persistent and used to identify nodes in a prefab

    spawned_object.smsg_uuid = spawned_object.uuid;

    for (var i = 0, n = spawned_object.children.length; i < n; i++) {
      this.Setup_Spawned_Object_UUID(spawned_object.children[i]);
    }
  },
  Get_Component_in_Node_Data: function Get_Component_in_Node_Data(node_data, comp_type) {
    // returns comp data with type
    var comp_array = node_data.components;

    for (var i = 0, n = comp_array.length; i < n; i++) {
      if (comp_array[i].type == comp_type) {
        return comp_array[i];
      }
    }

    return null;
  },
  Get_Components_in_Node_Data_Tree: function Get_Components_in_Node_Data_Tree(node_data, comp_type, res_array) {
    // gets comp data  array recursively
    var comp_array = node_data.components;

    for (var i = 0, n = comp_array.length; i < n; i++) {
      if (comp_array[i].type == comp_type) {
        res_array.push(comp_array[i]);
      }
    } // check children


    for (var _i = 0, _n = node_data.children.length; _i < _n; _i++) {
      this.Get_Components_in_Node_Data_Tree(node_data.children[_i], comp_type, res_array);
    }
  },
  Get_Current_Scene_Name: function Get_Current_Scene_Name() {
    var sceneName;
    var _sceneInfos = cc.game._sceneInfos;

    for (var i = 0; i < _sceneInfos.length; i++) {
      if (_sceneInfos[i].uuid == cc.director._scene._id) {
        sceneName = _sceneInfos[i].url;
        sceneName = sceneName.substring(sceneName.lastIndexOf('/') + 1).match(/[^\.]+/)[0];
      }
    }

    return sceneName;
  },
  // Returns integer with bit key
  Get_Bit_Key: function Get_Bit_Key(bit) {
    return Math.pow(2, bit);
  },
  // Tests if object tag matches with the key
  Test_Object_Tag: function Test_Object_Tag(object_tag, key) {
    if (object_tag === undefined) {
      // -1 is cocos default which means no tag defined
      return false;
    }

    return object_tag & key;
  },
  // Finds the node just above Space_Ship_Container in current scene, we use it to spawn objects in
  Find_Game_Objects_Node: function Find_Game_Objects_Node() {
    return smsg.Space_Ship_Container.parent.children[smsg.Space_Ship_Container.getSiblingIndex() - 1];
  },
  // Empty Area Finder ----------------------------------------------------
  // Takes start rect for searching empty area and returns suitable position
  Find_Empty_Area: function Find_Empty_Area(rect) {
    var Physics_Manager = cc.director.getPhysicsManager();
    var test_limit = 32; // enough for full screen scan

    var test_count = 0;
    var area_found = false; // flag

    var rect_result = Physics_Manager.testAABB(rect); // first test

    this.Filter_Colliders(rect_result); // filter nodes (gravity radial, force area etc...)

    var radius_count = 1; // continue testing from first orbit

    var radius = Math.sqrt(rect.width * rect.width + rect.height * rect.height); // use hypotenus for radius

    var radius_vec = cc.v2(0, radius);
    var org_pos = rect.center;
    var test_pos = cc.v2();
    var rotation = 0;
    var angle_index = -1;
    var angle_list = [];
    var angle_dif = 0.25; // test 8 sides of center point

    var ignore_angle = [];

    for (var i = 0; i < 2 / angle_dif; i++) {
      angle_list[i] = i * angle_dif * Math.PI; // make list of angles to test

      ignore_angle[i] = false; // ignore flag if encountered chain collider
    }

    if (rect_result.length == 0) {
      // first test if area empty just go
      area_found = true;
    } // while test area occupied


    while (area_found === false && test_count < test_limit) {
      angle_index++;

      if (angle_index > angle_list.length - 1) {
        // increment radius on each round
        angle_index = 0; // reset angle

        if (ignore_angle[0] === true) {
          // if skipped increment
          angle_index = 1; // skip this angle
        }

        radius_count++; // increment radius
      }

      if (ignore_angle[angle_index] === true) {
        // skip test if angle ignored
        continue;
      }

      rotation = angle_list[angle_index]; // rotate radius vector
      // rect test

      radius_vec.x = 0;
      radius_vec.y = radius * radius_count; // set vector

      radius_vec.rotateSelf(rotation); // rotate vector

      org_pos.add(radius_vec, test_pos); // get test position to "test_pos" by adding radius vector to original position

      rect.center = test_pos; // set center of rect

      rect_result = Physics_Manager.testAABB(rect); // test

      this.Filter_Colliders(rect_result); // filter nodes (gravity radial, force area etc...)

      test_count++; // count for limit
      // ray test with chain colliders

      var ray_coll = Physics_Manager.rayCast(org_pos, test_pos, cc.RayCastType.All);
      var chain_collider_found = false;

      for (var _i2 = 0; _i2 < ray_coll.length; _i2++) {
        if (ray_coll[_i2].collider.__classname__ == "cc.PhysicsChainCollider") {
          // chain collider found
          ignore_angle[angle_index] = true;
          chain_collider_found = true;
          break;
        }
      }

      if (rect_result.length == 0 && !chain_collider_found) {
        // rect result is empty, no raycast chain collider: AREA FOUND!
        area_found = true;
        break;
      }
    }

    if (area_found) {
      return rect.center; // return found position
    } else {
      return null;
    }
  },
  // Removes filtered colliders from list
  Filter_Colliders: function Filter_Colliders(rect_result) {
    // Check nodes
    for (var i = 0; i < rect_result.length; i++) {
      //Filter groups
      if (rect_result[i].node.groupIndex == 0 || // Default
      rect_result[i].node.groupIndex == 1 || // Gravity_Radial
      rect_result[i].node.groupIndex == 6 || // Force_Area
      rect_result[i].node.groupIndex == 7 // Trigger_Area
      ) {
          rect_result.splice(i, 1); // remove element

          i--;
        }
    }
  },
  // Safe eval
  Eval: function Eval(s) {
    var regex = /^[\w$][\w.]+$/,
        value;

    if (regex.test(s)) {
      try {
        value = eval(s);
      } catch (error) {
        cc.warn("smsg.util.Eval: Could not get value of " + s);
      }
    } else {
      cc.warn("smsg.util.Eval: Could not get value of " + s);
    }

    return value;
  },
  Get_Local_Storage: function Get_Local_Storage(key) {
    var data_str = cc.sys.localStorage.getItem(LZString.compressToEncodedURIComponent(key));

    if (data_str) {
      return LZString.decompressFromEncodedURIComponent(data_str);
    } else {
      return null;
    }
  },
  Set_Local_Storage: function Set_Local_Storage(key, value) {
    return cc.sys.localStorage.setItem(LZString.compressToEncodedURIComponent(key), LZString.compressToEncodedURIComponent(value));
  }
};