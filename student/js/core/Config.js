class Config {
    static CELL_SIZE = 128;
    static DEFAULT_MAP = {
        category: "",
        difficulty: "medio",
        description: "",
	  itemTypes: {
		"A": {
		  "width": "90%",
		  "height": "90%",
		  "color": "#FF6B6B",
		  "transparency": 0.9,
		  "borderType": "solid",
		  "borderWidth": 3,
		  "borderColor": "#EE5A6F",
		  "pickable": true,
		  "stepable": false,
		  "stackable": true,
		  "allowBiggerToStack": false
		},
		"B": {
		  "width": "70%",
		  "height": "70%",
		  "color": "#4ECDC4",
		  "transparency": 0.9,
		  "borderType": "dashed",
		  "borderWidth": 2,
		  "borderColor": "#45B7B8",
		  "pickable": true,
		  "stepable": false,
		  "stackable": true,
		  "allowBiggerToStack": false
		},
		"C": {
		  "width": "50%",
		  "height": "50%",
		  "color": "#FFE66D",
		  "transparency": 0.8,
		  "borderType": "solid",
		  "borderWidth": 2,
		  "borderColor": "#FFD93D",
		  "pickable": true,
		  "stepable": false,
		  "stackable": true,
		  "allowBiggerToStack": true
		},
		"D": {
		  "width": "100%",
		  "height": "100%",
		  "color": "#B794F4",
		  "transparency": 0.3,
		  "borderType": "none",
		  "pickable": false,
		  "stepable": true,
		  "stackable": true,
		  "allowBiggerToStack": true
		},
		"E": {
		  "width": "80%",
		  "height": "80%",
		  "color": "#F687B3",
		  "transparency": 1.0,
		  "borderType": "double",
		  "borderWidth": 3,
		  "borderColor": "#D53F8C",
		  "pickable": true,
		  "stepable": false,
		  "stackable": true,
		  "allowBiggerToStack": false
		},
		"W": {
		  "width": "100%",
		  "height": "100%",
		  "color": "#BC4A3C",
		  "transparency": 1.0,
		  "borderType": "none",
		  "pickable": false,
		  "stepable": false,
		  "stackable": false,
		  "allowBiggerToStack": false
		},
		"G": {
		  "width": "70%",
		  "height": "70%",
		  "color": "#4CAF50",
		  "transparency": 0.8,
		  "borderType": "solid",
		  "borderWidth": 2,
		  "borderColor": "#2E7D32",
		  "pickable": false,
		  "stepable": true,
		  "stackable": false,
		  "allowBiggerToStack": false
		}
	  },
	  map: [
		[0, 0, "W", "W", "W", "W", "W", "W", "W", "W"],
		["W", 0, 0, 0, "W", 0, 0, 0, 0, "W"],
		["W", 0, "W", 0, "W", 0, "W", "W", 0, "W"],
		["W", 0, "W", 0, 0, 0, "W", 0, 0, "W"],
		["W", 0, "W", "W", "W", "W", "W", 0, "W", "W"],
		["W", 0, 0, 0, 0, 0, 0, 0, 0, "W"],
		["W", "W", "W", "W", 0, "W", "W", "W", 0, "W"],
		["W", 0, 0, 0, 0, "W", 0, 0, 0, "W"],
		["W", 0, "W", "W", "W", "W", 0, "W", "G:🏁", "W"],
		["W", "W", "W", "W", "W", "W", "W", "W", "W", "W"]
	  ]
    };
    static HERO_FRAMES = {
        down: [[2,1], [2,2], [2,3]],
        left: [[0,2], [0,3], [0,1]],
        right: [[1,0], [1,1], [1,2]],
        up: [[0,0], [1,3], [2,0]]
    };
    static HERO_ANIMATION_SPEED = 0.15;
    static HERO_FRAME_DELAY = 100;
    static HERO_IDLE_DELAY = 400;
    static MIN_ZOOM = 0.25;
    static MAX_ZOOM = 4;
    static ZOOM_SPEED = 0.001;
    static PINCH_ZOOM_SPEED = 0.01;
    static VIEWPORT_PADDING = 40;
    static PROGRAM_SPEED_MIN = 1;
    static PROGRAM_SPEED_MAX = 30;
    static PROGRAM_SPEED_DEFAULT = 5;
    static MAX_CALL_STACK_DEPTH = 100;
    static MAX_PROGRAM_STEPS = 50000;
    static SAVE_ENDPOINT = 'saveMap.php';
    static LOAD_ENDPOINT = 'loadMap.php';
}