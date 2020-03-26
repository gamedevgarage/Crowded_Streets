'use strict';

module.exports = {
	load () {
		// When the package loaded
	},

	unload () {
		// When the package unloaded
	},

	messages: {

		

		'fix_joints' () {
			Editor.Scene.callSceneScript ('smsg', 'fix_joints');
		},

		'fix_scale' () {
			Editor.Scene.callSceneScript ('smsg', 'fix_scale');
		},

		'sort_actions' () {
			Editor.Scene.callSceneScript ('smsg', 'sort_actions');
		},

		'remove_none_actions' () {
			Editor.Scene.callSceneScript ('smsg', 'remove_none_actions');
		},

		'find_action' () {
			Editor.Scene.callSceneScript ('smsg', 'find_action');
		},
		
		'split_polygon_collider' () {
			Editor.Scene.callSceneScript ('smsg', 'split_polygon_collider');
		},
		
		'reverse_polygon_collider' () {
			Editor.Scene.callSceneScript ('smsg', 'reverse_polygon_collider');
		},
	},
};