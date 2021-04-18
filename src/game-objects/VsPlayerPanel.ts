import { Influence } from "../model/Influence";
import { Player } from "../model/Player";
import { Constants } from "../Constants";

export class VsPlayerPanel extends Phaser.GameObjects.Container {
    private playerName: string;

    private playerDescription: Phaser.GameObjects.Text;

    private onStealPointerOver: () => void;
    set OnStealPointerOver(callback: () => void) {
        this.onStealPointerOver = callback;
    }

    private onStealPointerOut: () => void;
    set OnStealPointerOut(callback: () => void) {
        this.onStealPointerOut = callback;
    }

    private onAssassinatePointerOver: () => void;
    set OnAssassinatePointerOver(callback: () => void) {
        this.onAssassinatePointerOver = callback;
    }

    private onAssassinatePointerOut: () => void;
    set OnAssassinatePointerOut(callback: () => void) {
        this.onAssassinatePointerOut = callback;
    }

    constructor(player: Player, scene, x?, y?, children?) {
        super(scene, x, y, children);

        this.playerName = player.name;

        // Player name
        this.playerDescription = scene.add.text(0, 0, this.playerName, Constants.defaultTextCss);
        this.add(this.playerDescription);

        // Card icons
        const captainIcon = scene.add.image(140, -10, Influence[Influence.Captain].toLowerCase() + "-icon")
            .setScale(0.6)
            .setOrigin(0, 0)
            .setInteractive();

        const assassinIcon = scene.add.image(140 + captainIcon.width, -10, Influence[Influence.Assassin].toLowerCase() + "-icon")
            .setScale(0.6)
            .setOrigin(0, 0)
            .setInteractive();

        this.add(captainIcon);
        this.add(assassinIcon);

        captainIcon.on("pointerover", () => {
            this.onStealPointerOver && this.onStealPointerOver();
            this.scene.input.setDefaultCursor("pointer");
            captainIcon.setScale(0.8);
        });

        captainIcon.on("pointerout", () => {
            this.onStealPointerOut && this.onStealPointerOut();
            this.scene.input.setDefaultCursor("default");
            captainIcon.setScale(0.6);
        });

        assassinIcon.on("pointerover", () => {
            this.onAssassinatePointerOver && this.onAssassinatePointerOver();
            this.scene.input.setDefaultCursor("pointer");
            assassinIcon.setScale(0.8);
        });

        assassinIcon.on("pointerout", () => {
            this.onAssassinatePointerOut && this.onAssassinatePointerOut();
            this.scene.input.setDefaultCursor("default");
            assassinIcon.setScale(0.6);
        });
    }
}