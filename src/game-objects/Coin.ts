import {Constants} from "../Constants";
import { engine } from "../core/GameEngine";

export class Coin extends Phaser.GameObjects.Image {
    static readonly defaultTextureName : String = "coin";

    public isInBank: boolean = true;
    public isDragging: boolean = false;
    public waitingChallenge: boolean = false;

    public tableX: number;
    public tableY: number;

    constructor(scene, x, y, texture?, frame?) {
        super(scene, x, y, texture || Coin.defaultTextureName, frame);

        this.tableX = x;
        this.tableY = y;

        this.setInteractive();
        this.setOrigin(0,0);
        this.setupEvents();
    }

    private setupEvents() {
        this.on("pointerdown", () =>  {
            if (!this.canBeTaken()) {
                return;
            }
            
            this.scene.children.bringToTop(this);
            this.scene.input.setDefaultCursor("url(assets/hand-move-grab.cur), pointer");
        });
        
        this.on("pointerup", () => {
            if (!this.canBeTaken()) {
                return;
            }

            this.scene.input.setDefaultCursor("url(assets/hand-move-no-grab.cur), pointer");
            this.clearTint();
            
            this.isDragging = true;
            this.waitingChallenge = true;
            (this.scene as any).HeroPlayer.getCoinFromBank(this, true);
        });

        this.on("pointerover", () => {
            if (!this.canBeTaken()) {
                return;
            }

            this.scene.input.setDefaultCursor("url(assets/hand-move-no-grab.cur), pointer");
            this.setTint(Constants.greenTint);
        });

        this.on("pointerout", () => {
            this.scene.input.setDefaultCursor("default");
            
            if (this.isInBank) {
                this.clearTint();
            }
        });
    }

    private canBeTaken() {
        return engine.canTakeCoin() && this.isInBank && !this.isDragging;
    }
}