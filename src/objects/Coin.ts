export class Coin extends Phaser.GameObjects.Image {
    static readonly defaultTextureName : String = "coin";
    static readonly onHoverTint : number = 0x44ff44;

    private isInBank: boolean = true;

    constructor(scene, x, y, texture?, frame?) {
        super(scene, x, y, texture || Coin.defaultTextureName, frame);

        this.setInteractive();
        this.setAngle(Phaser.Math.Between(0, 360));
        this.setOrigin(0,0);
        this.setupEvents();
    }

    private setupEvents() {
        this.on("pointerdown", () =>  {
            if (!this.isInBank) {
                return;
            }

            this.scene.input.setDefaultCursor("url(assets/hand-move-grab.cur), pointer");
        });
        
        this.on("pointerup", () => {
            if (!this.isInBank) {
                return;
            }

            this.scene.input.setDefaultCursor("url(assets/hand-move-no-grab.cur), pointer");
            (this.scene as any).heroPlayer.addCoin(this);
        });

        this.on("pointerover", () => {
            if (!this.isInBank) {
                return;
            }
            this.setTint(Coin.onHoverTint);
        });

        this.on("pointerout", () => {
            if (!this.isInBank) {
                return;
            }

            this.clearTint();
        });
    }
}