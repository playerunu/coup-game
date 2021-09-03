import { Constants } from "../../Constants";
import { ActionType } from "../../model/Action";
import { engine } from "../../core/GameEngine";
import { isEliminated, Player } from "../../model/Player";
import { VsPlayerPanel } from "./VsPlayerPanel";
import { ExchangePanel } from "./ExchangePanel";
import { GameMessage } from "../../core/GameMessage";
import { ActionPanel } from "../base-action-panel/ActionPanel";

export class HeroPlayerPanel extends Phaser.GameObjects.Container {
    
    private playerMoveTitle: Phaser.GameObjects.Text;
    private actionPanels: ActionPanel[] = [];

    static readonly PLAYER_MOVE_Y = [40, 70, 100, 130];

    public onPointerOver : (actionType: ActionType, vsPlayer?: Player) => void;
    public onPointerUp : (vsPlayer?: Player) => void;
    public onPointerOut : (vsPlayer?: Player) => void;

    constructor(scene, x?, y?, children?) {
        super(scene, x, y, children);

        // Player move title
        this.playerMoveTitle = scene.add.text(0, 10, "Your move:", Constants.defaultTextCss);
        this.add(this.playerMoveTitle);

        // Vs player panels
        for (let player of engine.game.players) {
            if (engine.isHeroPlayer(player)) {
                continue;
            }

            let vsPlayerPanel = new VsPlayerPanel(player, scene, 0, 0);
            
            this.actionPanels.push(vsPlayerPanel);
            this.add(vsPlayerPanel);
        }

        // Exchange panel
        let exchangePanel = new ExchangePanel(scene, 0, 0);
        
        this.actionPanels.push(exchangePanel);
        this.add(exchangePanel);

        for (let actionPanel of this.actionPanels) {
            actionPanel.onPointerOver = (icon, vsPlayer) => this.onPointerOver(icon.actionType, vsPlayer);
            actionPanel.onPointerOut = (vsPlayer) => this.onPointerOut(vsPlayer);
            actionPanel.onPointerUp = (vsPlayer) => this.onPointerUp(vsPlayer);
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
        for (let actionPanel of this.actionPanels) {
            if (actionPanel.vsPlayer && isEliminated(actionPanel.vsPlayer)) {
                actionPanel.setVisible(false);
            } else {
                actionPanel.setY(HeroPlayerPanel.PLAYER_MOVE_Y[panelIndex]);
                panelIndex++;
                actionPanel.update();
            }
        }
    }
}