import { Influence } from "../../model/Influence";
import { Player } from "../../model/Player";
import { ActionType } from "../../model/Action";
import { ActionPanel } from "../base-action-panel/ActionPanel";
import { ActionIcon } from "../base-action-panel/ActionIcon";
import { Constants } from "../../Constants";
import { engine } from "../../core/GameEngine";

export class VsPlayerPanel extends ActionPanel {

    private captainIcon: ActionIcon;
    private assassinIcon: ActionIcon;
    private coupIcon: ActionIcon;

    constructor(player: Player, scene, x?, y?, children?) {
        super(scene, x, y, children);

        this.vsPlayer = player;
        this.description.setText("vs " + this.vsPlayer.name);

        // Captain icon
        this.captainIcon = new ActionIcon(scene, x, y, Influence[Influence.Captain].toLowerCase() + "-icon")
            .setActionType(ActionType.Steal);
        // Assassin icon
        this.assassinIcon = new ActionIcon(scene, x, y, Influence[Influence.Assassin].toLowerCase() + "-icon")
            .setActionType(ActionType.Assassinate);
        // Coup icon
        this.coupIcon = new ActionIcon(scene, x, y, "coup-icon")
            .setActionType(ActionType.Coup);

        this.update();
    }

    update() {
        if (!engine.isHeroPlayerTurn()) {
            return
        }

        const player = engine.getHeroPlayer();
        const icons = [];

        if (player.coins < 10) {
            icons.push(this.captainIcon);
            if (player.coins >= 3) {
                icons.push(this.assassinIcon);
            }
            if (player.coins >= 7) {
                icons.push(this.coupIcon);
            }
        } else {
            icons.push(this.coupIcon);
        }

        this.setActionIcons(icons);
    }
}