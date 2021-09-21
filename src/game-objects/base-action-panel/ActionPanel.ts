import { Player } from "../../model/Player";
import { Constants } from "../../Constants";
import { ActionIcon } from "./ActionIcon";

export class ActionPanel extends Phaser.GameObjects.Container {
    public vsPlayer?: Player;

    protected description: Phaser.GameObjects.Text;
    private actionIcons: ActionIcon[];

    static readonly FIRST_ICON_X: number = 140;
    static readonly ICONS_Y: number = -10;

    public onPointerOver: (icon: ActionIcon, player?: Player) => void;
    public onPointerUp: (player?: Player) => void;
    public onPointerOut: (player?: Player) => void;

    constructor(scene, x?, y?, children?) {
        super(scene, x, y, children);

        // Description
        this.description = scene.add.text(0, 0, "", Constants.defaultTextCss);
        this.add(this.description);
    }

    protected setActionIcons(actionIcons: ActionIcon[]) {
        // Action icons
        this.actionIcons = actionIcons;
        for (let icon of this.actionIcons) {
            icon.setX(0)
                .setY(ActionPanel.ICONS_Y)
                .setOrigin(0, 0)
                .setInteractive()
                .setVisible(false);

            icon.onPointerOut = () => this.onPointerOut(this.vsPlayer);
            icon.onPointerUp = () => this.onPointerUp(this.vsPlayer);
            icon.onPointerOver = () => this.onPointerOver(icon, this.vsPlayer);
            
            this.add(icon);
        }

        this.actionIcons.forEach((icon, index) => {
            icon.setX(ActionPanel.FIRST_ICON_X + index * (icon.width - 10))
                .setVisible(true);
        });
    }
}