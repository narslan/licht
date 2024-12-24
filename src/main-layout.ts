import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./views/chess";
import "./views/chessb";
import "./views/home";
import "./views/engine-match";
import "./views/pgn_server"; // pgn comes from the server.
import "./views/pgn_client"; // pgn comes from the client.

import "@material/web/tabs/tabs";
import "@material/web/list/list";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";

import { Router } from "@vaadin/router";

@customElement("main-layout")
export class MainLayout extends LitElement {
  @property({ type: String })
  activeTab = "";
  @property({ type: Array })
  tabs = [];
  @property({ type: Boolean })
  smallScreen = false;
  @property({ type: Boolean, attribute: true })
  openDrawer = false;

  firstUpdated() {
    const router = new Router(this.shadowRoot.querySelector("main"));
    router.setRoutes([
        { path: "/", component: "home-element" },
        { path: "/home", component: "home-element" },
        { path: "/chess", component: "chess-element" },
        { path: "/black", component: "chessb-element" },
        { path: "/match", component: "engine-match" },
        { path: "/litplayground", component: "litplayground-element" },
        { path: "/pgn_server", component: "pgn_server-element" },
        { path: "/pgn_client", component: "pgn_client-element" },
        {
            path: "(.*)",
            redirect: "/",
            action: () => {
                this.activeTab = "home-element";
            },
        },
    ]);
  }
    
    render() {
        return html`
<div id="container">
<div id="lsidebar">
<md-list style="max-width: 150px;">
<md-list-item
class="md-typescale-body-medium"
@click=${() => this.switchRoute("")}
>
Home
</md-list-item>
<md-divider></md-divider>

<md-list-item
class="md-typescale-body-medium"
@click=${() => this.switchRoute("chess")}
>
Play White
</md-list-item>
<md-divider></md-divider>

<md-list-item
class="md-typescale-body-medium"
@click=${() => this.switchRoute("black")}
>
Play Black
</md-list-item>
<md-divider></md-divider>

<md-list-item
class="md-typescale-body-medium"
@click=${() => this.switchRoute("match")}
>
Engines Match
</md-list-item>
<md-divider></md-divider>

<md-list-item
class="md-typescale-body-medium"
@click=${() => this.switchRoute("pgn_server")}
>
PGN Server View
</md-list-item>
<md-divider></md-divider>
<md-list-item
class="md-typescale-body-medium"
@click=${() => this.switchRoute("pgn_client")}
>
PGN Client View
</md-list-item>
<md-list-item
class="md-typescale-body-medium"
@click=${() => this.switchRoute("litplayground")}
>
Playground
</md-list-item>
</md-list>
</div>

<div id="rsidebar">
<section slot="appContent">
<header slot="title">${this.activeTab}</header>
<main></main>
</section>
</div>
</div>
    `;
  }

  switchRoute(route) {
    this.activeTab = route;
    Router.go(`/${route}`);
    this.openDrawer = false;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static styles = [
    typescaleStyles,
    css`
      #container {
        display: flex;
      }
      #lsidebar {
        width: 250px;
      }
    `,
  ];
}
