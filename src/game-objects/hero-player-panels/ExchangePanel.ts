import { ActionPanel } from "../base-action-panel/ActionPanel";
import { ActionIcon } from "../base-action-panel/ActionIcon";
import { Influence } from "../../model/Influence";
import { ActionType } from "../../model/Action";

export class ExchangePanel extends ActionPanel {

    private ambassadorIcon: ActionIcon;

    constructor(scene, x?, y?, children?) {
        super(scene, x, y, children);

        this.description.setText("Exchange");

        // Excange icon
        this.ambassadorIcon = new ActionIcon(scene, x, y, Influence[Influence.Ambassador].toLowerCase() + "-icon")
            .setActionType(ActionType.Exchange);
        
        this.setActionIcons([this.ambassadorIcon]);

        this.update();
    }
}

