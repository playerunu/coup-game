import { engine } from "../core/GameEngine";

export class TakeCoinsPanel extends Phaser.GameObjects.Container {
    
    constructor(scene, x?, y?, children?) {
        super(scene, x, y, children);

        // Confirmation buttons
        const okButton = scene.add.image(0, 0, "ok-button")
            .setScale(0.7)
            .setOrigin(0, 0)
            .setInteractive();

        const cancelButton = scene.add.image(okButton.width - 18, 0, "cancel-button")
            .setScale(0.7)    
            .setOrigin(0, 0)
            .setInteractive();

        this.add(okButton);
        this.add(cancelButton);

        okButton.on("pointerover", () => {
            this.scene.input.setDefaultCursor("pointer");
            okButton.setScale(0.8);
        });

        okButton.on("pointerout", () => {
            this.scene.input.setDefaultCursor("default");
            okButton.setScale(0.7);
        });

        okButton.on("pointerup", () => {
            engine.confirmPendingAction();
        });

        cancelButton.on("pointerover", () => {
            this.scene.input.setDefaultCursor("pointer");
            cancelButton.setScale(0.8);
        });

        cancelButton.on("pointerout", () => {
            this.scene.input.setDefaultCursor("default");
            cancelButton.setScale(0.7);
        });

        cancelButton.on("pointerup", () => {
            engine.cancelPendingAction();
        });
    }
}