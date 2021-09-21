import { Constants } from "../../Constants";
import { ActionType } from "../../model/Action";
import { Influence } from "../../model/Influence";
import { engine } from "../../core/GameEngine";
import { isEliminated, Player } from "../../model/Player";
import { GameMessage } from "../../core/GameMessage";
import { BlockPanel } from "./BlockPanel";
import { ChallengePanel } from "./ChallengePanel";

export class CounterActionPanel extends Phaser.GameObjects.Container {
    
    private playerMoveTitle: Phaser.GameObjects.Text;
    private blockPanel : BlockPanel;
    private challengePanel: ChallengePanel;

    static readonly PANELS_Y = [40, 70, 100, 130];

    public onPointerOver : (actionType: ActionType, pretendingInfluence?: Influence) => void;
    public onPointerUp : () => void;
    public onPointerOut : () => void;

    constructor(scene, x?, y?, children?) {
        super(scene, x, y, children);

        // Player move title
        this.playerMoveTitle = scene.add.text(0, 10, "Counter:", Constants.defaultTextCss);
        this.add(this.playerMoveTitle);

        // Block panel
        this.blockPanel = new BlockPanel(scene, 0, 0);

        // Challenge panel
        this.challengePanel = new ChallengePanel(scene, 0, 0);

        for (let actionPanel of [this.challengePanel, this.blockPanel]) {
            actionPanel.onPointerOver = (icon) => this.onPointerOver(icon.actionType, icon.influence);
            actionPanel.onPointerOut = () => this.onPointerOut();
            actionPanel.onPointerUp = () => this.onPointerUp();
            this.add(actionPanel);
        }

        this.updateActionPanels();
    }

    update() {
        this.updateActionPanels();

        if (engine.waitingForTakeCoinsConfirmation()) {
            this.iterate((obj) => obj.setAlpha(0.5));
        } else {
            this.iterate((obj) => obj.clearAlpha());
        }
    }

    updateActionPanels() {
        let panelIndex = 0;

        if (engine.canBlockMove() ) {
            this.blockPanel.setY(CounterActionPanel.PANELS_Y[panelIndex]);
            this.blockPanel.setVisible(true);
            this.blockPanel.update();
            panelIndex++;
        } else {
            this.blockPanel.setVisible(false);
        }
        
        const canChallangeMove = engine.canChallengeMove();
        if (canChallangeMove ) {
            this.challengePanel.setY(CounterActionPanel.PANELS_Y[panelIndex]);
            this.challengePanel.setVisible(true);
            this.challengePanel.update();
        } else {
            this.challengePanel.setVisible(false);
        }
    }
}