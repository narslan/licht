import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/chips/suggestion-chip.js";
import "@material/web/chips/assist-chip.js";

import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

document.adoptedStyleSheets.push(typescaleStyles.styleSheet!);

@customElement("pgn_fen_item-element")
export class PGNFENItem extends LitElement {
    @property({ attribute: false, type: String })
    beforeMove = "";
    @property({ attribute: false, type: String })
    afterMove = "";
    @property({ attribute: false, type: String })
    best = "";
    @property({ attribute: false, type: String })
    score = "";
    @property({ attribute: false, type: String })
    depth = "";

    @property({ attribute: false, type: String })
    index = "";
    @property({ attribute: false, type: String })
    move = "";

    getEngineMove() {
        if (this.best !== "") {
            return html`<md-assist-chip
label="${this.best} / ${this.score}"
></md-assist-chip>`;
        }
    }

    render() {
        return html`<p>
<md-suggestion-chip
@click=${{
handleEvent: () => this._setBoard(),
bubble: true,
}}
label="${this.index}. ${this.move}"
elevated=true
>
</md-suggestion-chip>    
${this.getEngineMove()}</p>`;
    }

    static styles = [
        typescaleStyles,
        css`

`,
    ];

    private _setBoard() {
        const options = {
            detail: this.afterMove,
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("myclick", options));

        const fen = this.beforeMove;

        if (fen) {
            // Set board.

            // Talk to server to obtain engines idea .
            const ws = new WebSocket(`ws://localhost:8000/_hamle`);

            ws.onopen = () => {
                const fens = { action: "onOpen", data: fen };
                ws.send(JSON.stringify(fens));
            };

            ws.onmessage = (msg: MessageEvent) => {
                const { action, data } = msg.data.startsWith("{")
                    ? (JSON.parse(msg.data) as {
                        action: string;
                        data: {
                            score: string;
                            depth: string;
                            best: string;
                        };
                    })
                    : { action: "", data: { score: "", depth: "", best: "" } };

                if (action === "onData") {
                    this.score = data["score"];
                    this.depth = data["depth"];
                    this.best = data["best"];
                    ws.close();
                }
            };
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "pgn_fen_item-element": PGNFENItem;
    }
}
