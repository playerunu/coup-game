import { ActionType } from "../../model/Action";
import { engine } from "../../core/GameEngine";
import { Influence } from "../../model/Influence";

export class ActionIcon extends Phaser.GameObjects.Image {
    public actionType: ActionType;
    public influence: Influence;

    static readonly INITIAL_SCALE: number = 0.6;
    static readonly ON_HOVER_SCALE: number = 0.8;

    public onPointerOver: () => void;
    public onPointerUp: () => void;
    public onPointerOut: () => void;

    constructor(scene, x, y, texture, frame?) {
        super(scene, x, y, texture, frame);
        
        this.setScale(ActionIcon.INITIAL_SCALE);

        this.addPointerEvent("pointerover", () => this.onPointerOver(), ActionIcon.ON_HOVER_SCALE, "pointer");
        this.addPointerEvent("pointerout", () => this.onPointerOut(), ActionIcon.INITIAL_SCALE, "default");
        this.addPointerEvent("pointerdown", null, ActionIcon.INITIAL_SCALE, "pointer");
        this.addPointerEvent("pointerup", () => this.onPointerUp(), ActionIcon.INITIAL_SCALE, "pointer");
    }

    public setActionType(actionType: ActionType) : ActionIcon {
        this.actionType = actionType;
        return this;
    }

    public setInfluence(influence: Influence) : ActionIcon {
        this.influence = influence;
        return this;
    }

    private addPointerEvent(eventName, callback, scale, cursor) {
        this.on(eventName, () => {
            if (engine.waitingForTakeCoinsConfirmation()) {
                return;
            }

            callback && callback();
            this.scene.input.setDefaultCursor(cursor);
            this.setScale(scale);
        });
    }
}