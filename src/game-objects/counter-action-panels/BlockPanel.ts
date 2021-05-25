import { Influence } from "../../model/Influence";
import { Player } from "../../model/Player";
import { ActionType } from "../../model/Action";
import { ActionPanel } from "../base-action-panel/ActionPanel";
import { ActionIcon } from "../base-action-panel/ActionIcon";
import { Constants } from "../../Constants";
import { engine } from "../../core/GameEngine";

export class BlockPanel extends ActionPanel {

    private captainIcon: ActionIcon;
    private ambassadorIcon: ActionIcon;
    private contessaIcon: ActionIcon;
    private dukeIcon: ActionIcon;

    constructor(scene, x?, y?, children?) {
        super(scene, x, y, children);

        this.description.setText("Block:");

        // Captain icon
        this.captainIcon = new ActionIcon(scene, x, y, Influence[Influence.Captain].toLowerCase() + "-icon")
            .setActionType(ActionType.Block)
            .setInfluence(Influence.Captain);
        // Ambassador icon
        this.ambassadorIcon = new ActionIcon(scene, x, y, Influence[Influence.Ambassador].toLowerCase() + "-icon")
            .setActionType(ActionType.Block)
            .setInfluence(Influence.Ambassador);
        // Contessa icon
        this.contessaIcon = new ActionIcon(scene, x, y, Influence[Influence.Contessa].toLowerCase() + "-icon")
            .setActionType(ActionType.Block)
            .setInfluence(Influence.Contessa);
        // Duke icon
        this.dukeIcon = new ActionIcon(scene, x, y, Influence[Influence.Duke].toLowerCase() + "-icon")
            .setActionType(ActionType.Block)
            .setInfluence(Influence.Duke);

        this.update();
    }

    update() {
        if (engine.isHeroPlayerTurn()) {
            return
        }
        const icons = [];

        const currentMove = engine.game.currentMove;
        if (!currentMove) {
            return;
        }
        
        switch (currentMove.action.actionType) {
            case ActionType.TakeTwoCoins:
                icons.push(this.dukeIcon);
                break;
            case ActionType.Steal:
                icons.push(...[this.captainIcon, this.ambassadorIcon]);
                break;
            case ActionType.Assassinate:
                icons.push(this.contessaIcon)
                break;
        }

        this.setActionIcons(icons);
    }
}