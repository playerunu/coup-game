import {wsConnection} from "../ws/WsConnection";

export abstract class WsScene extends Phaser.Scene {
    private OnWsMessage: any;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.OnWsMessage = this.onWsMessage.bind(this);
    }

    create() {
        // Init WS listener
        wsConnection.addListener(this.OnWsMessage);
    }

    protected abstract onWsMessage(event);

    protected sendWsMessage(message){
        wsConnection.sendMessage(message);
    }

    protected startScene(sceneName: string) {
        wsConnection.removeListener(this.OnWsMessage);
        this.scene.start(sceneName);
    }
}