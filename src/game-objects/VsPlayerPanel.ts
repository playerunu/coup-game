import { Influence } from "../model/Influence";
import { Player } from "../model/Player";
import { Constants } from "../Constants";
import { engine } from "../core/GameEngine";

export class VsPlayerPanel extends Phaser.GameObjects.Container {
    public playerName: string;

    private playerDescription: Phaser.GameObjects.Text;
    private captainIcon: Phaser.GameObjects.Image;
    private assassinIcon: Phaser.GameObjects.Image;

    static readonly INITIAL_SCALE: number = 0.6;
    static readonly ON_HOVER_SCALE: number = 0.8;

    private onStealPointerOver: () => void;
    set OnStealPointerOver(callback: () => void) {
        this.onStealPointerOver = callback;
    }

    private onStealPointerOut: () => void;
    set OnStealPointerOut(callback: () => void) {
        this.onStealPointerOut = callback;
    }

    private onStealPointerUp: () => void;
    set OnStealPointerUp(callback: () => void) {
        this.onStealPointerUp = callback;
    }

    private onAssassinatePointerOver: () => void;
    set OnAssassinatePointerOver(callback: () => void) {
        this.onAssassinatePointerOver = callback;
    }

    private onAssassinatePointerOut: () => void;
    set OnAssassinatePointerOut(callback: () => void) {
        this.onAssassinatePointerOut = callback;
    }

    private onAssassinatePointerUp: () => void;
    set OnAssassinatePointerUp(callback: () => void) {
        this.onAssassinatePointerUp = callback;
    }

    constructor(player: Player, scene, x?, y?, children?) {
        super(scene, x, y, children);

        this.playerName = player.name;

        // Player name
        this.playerDescription = scene.add.text(0, 0, "vs " + this.playerName, Constants.defaultTextCss);
        this.add(this.playerDescription);

        // Card icons
        this.captainIcon = scene.add.image(140, -10, Influence[Influence.Captain].toLowerCase() + "-icon")
            .setScale(VsPlayerPanel.INITIAL_SCALE)
            .setOrigin(0, 0)
            .setInteractive();

        this.assassinIcon = scene.add.image(140 + this.captainIcon.width, -10, Influence[Influence.Assassin].toLowerCase() + "-icon")
            .setScale(VsPlayerPanel.INITIAL_SCALE)
            .setOrigin(0, 0)
            .setInteractive();

        this.add(this.captainIcon);
        this.add(this.assassinIcon);

        this.addPointerEvent(this.captainIcon, "pointerover",() => this.onStealPointerOver(), VsPlayerPanel.ON_HOVER_SCALE, "pointer");
        this.addPointerEvent(this.captainIcon, "pointerout",() => this.onStealPointerOut(), VsPlayerPanel.INITIAL_SCALE, "default");
        this.addPointerEvent(this.captainIcon, "pointerdown", null, VsPlayerPanel.INITIAL_SCALE, "pointer");
        this.addPointerEvent(this.captainIcon, "pointerup", () => this.onStealPointerUp(), VsPlayerPanel.INITIAL_SCALE, "pointer");
        
        this.addPointerEvent(this.assassinIcon, "pointerover",() => this.onAssassinatePointerOver(), VsPlayerPanel.ON_HOVER_SCALE, "pointer");
        this.addPointerEvent(this.assassinIcon, "pointerout",() => this.onAssassinatePointerOut(), VsPlayerPanel.INITIAL_SCALE, "default");
        this.addPointerEvent(this.assassinIcon, "pointerdown", null, VsPlayerPanel.INITIAL_SCALE, "pointer");
        this.addPointerEvent(this.assassinIcon, "pointerup", () => this.onAssassinatePointerUp(), VsPlayerPanel.INITIAL_SCALE, "pointer");
    }

    update() {
        if (engine.waitingForTakeCoinsConfirmation()) {
            this.captainIcon.setAlpha(0.5);
            this.assassinIcon.setAlpha(0.5);
        } else {
            this.captainIcon.clearAlpha();
            this.assassinIcon.clearAlpha();
        }
    }

    private addPointerEvent(icon, eventName, callback, scale, cursor) {
        icon.on(eventName, () => {
            if (engine.waitingForTakeCoinsConfirmation() || engine.) {
                return;
            }

            callback && callback();
            this.scene.input.setDefaultCursor(cursor);
            icon.setScale(scale);
        });
    }
}