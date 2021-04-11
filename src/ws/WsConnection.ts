import {Constants} from "../Constants";

class WsConnection {
    private socket : WebSocket = null;
    get webSocket() {
        return this.socket;
    }

    constructor(){
        this.socket = new WebSocket(Constants.wsServerUrl);
    }

    sendMessage(data) {
        this.socket.send(JSON.stringify(data));
    }

    addListener(listener: any) {
        this.socket.addEventListener("message", listener);
    }

    removeListener(listener: any) {
        this.socket.removeEventListener("message", listener);
    }
}

export const wsConnection = new WsConnection();