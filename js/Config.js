class Config {
    static CELL_SIZE = 128;
    
    static DEFAULT_MAP = {
        category: "",
        difficulty: "medio",
        description: "",
        itemTypes: {
            A: { width: "90%", height: "90%", color: "#FF6B6B", transparency: 0.9, borderType: "solid", borderWidth: 3, borderColor: "#EE5A6F", pickable: true, stepable: false, stackable: true },
            B: { width: "70%", height: "70%", color: "#4ECDC4", transparency: 0.9, borderType: "dashed", borderWidth: 2, borderColor: "#45B7B8", pickable: true, stepable: false, stackable: true },
            C: { width: "50%", height: "50%", color: "#FFE66D", transparency: 0.8, borderType: "solid", borderWidth: 2, borderColor: "#FFD93D", pickable: true, stepable: false, stackable: true },
            D: { width: "100%", height: "100%", color: "#B794F4", transparency: 0.3, borderType: "none", pickable: false, stepable: true, stackable: true },
            E: { width: "80%", height: "80%", color: "#F687B3", transparency: 1.0, borderType: "double", borderWidth: 3, borderColor: "#D53F8C", pickable: true, stepable: false, stackable: true }
        },
        map: [[0,0,0,0,0,0,"A:★"],[0,"A,B:8",0,0,0,0,"C:🎯"],[0,0,"A:😃","D",0,0,0],["B:♥",0,0,"B:あ",0,"A:🎮",0],["E:$",0,0,0,"C:♣",0,0]]
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
}