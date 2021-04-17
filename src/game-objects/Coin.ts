import {Constants} from "../Constants";

export class Coin extends Phaser.GameObjects.Image {
    static readonly defaultTextureName : String = "coin";

    public isInBank: boolean = true;
    public isDragging: boolean = false;
    public waitingChallenge: boolean = false;

    constructor(scene, x, y, texture?, frame?) {
        super(scene, x, y, texture || Coin.defaultTextureName, frame);

        this.setInteractive();
        this.setOrigin(0,0);
        this.setupEvents();
    }

    private setupEvents() {
        this.on("pointerdown", () =>  {
            if (!this.isInBank) {
                return;
            }
            
            this.isDragging = true;
            this.scene.children.bringToTop(this);
            this.scene.input.setDefaultCursor("url(assets/hand-move-grab.cur), pointer");
        });
        
        this.on("pointerup", () => {
            if (!this.isInBank || !this.isDragging) {
                return;
            }

            this.scene.input.setDefaultCursor("url(assets/hand-move-no-grab.cur), pointer");
            this.clearTint();
            (this.scene as any).heroPlayer.pushCoin(this);
        });

        this.on("pointerover", () => {
            if (!this.isInBank || this.isDragging) {
                return;
            }
            this.scene.input.setDefaultCursor("url(assets/hand-move-no-grab.cur), pointer");
            this.setTint(Constants.greenTint);
        });

        this.on("pointerout", () => {
            if (!this.isInBank) {
                return;
            }
            
            this.isDragging = false;
            this.scene.input.setDefaultCursor("default");
            this.clearTint();
        });
    }
}