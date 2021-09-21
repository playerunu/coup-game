import { ActionPanel } from "../base-action-panel/ActionPanel";
import { ActionIcon } from "../base-action-panel/ActionIcon";
import { ActionType } from "../../model/Action";

export class ChallengePanel extends ActionPanel {

    private challengeIcon: ActionIcon;

    constructor(scene, x?, y?, children?) {
        super(scene, x, y, children);

        this.description.setText("Challenge:");

        this.challengeIcon = new ActionIcon(scene, x, y, "coup-icon")
            .setActionType(ActionType.Challenge);

        this.setActionIcons([this.challengeIcon]);
    }
}

