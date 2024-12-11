import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Chess } from "chess.js";

@customElement("theme-switch")
export class ChessElement extends LitElement {

  @property({ type: String, reflect: true })
  theme = 'light';





}