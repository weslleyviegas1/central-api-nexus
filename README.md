# API Nexus Hub

<!DOCTYPE html>

<html lang="pt-BR">

<head>

  <meta charset="UTF-8" />

  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Central API Hub</title>



  <style>

    * {

      box-sizing: border-box;

      margin: 0;

      padding: 0;

    }



    :root {

      --bg: #020812;

      --bg2: #030d19;

      --panel: #06101f;

      --panel2: #071526;

      --border: #12375d;

      --border-soft: rgba(30, 117, 190, .28);

      --text: #f4f8ff;

      --muted: #8ca3c3;

      --blue: #008cff;

      --cyan: #00e5ff;

      --green: #00f5a0;

      --purple: #a700ff;

      --pink: #ff20e8;

      --orange: #ff9d16;

      --danger: #ff3e78;

    }



    html,

    body,

    #app {

      width: 100%;

      height: 100%;

      overflow: hidden;

      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,

        "Segoe UI", sans-serif;

      background: var(--bg);

      color: var(--text);

    }



    body {

      background:

        radial-gradient(circle at 65% 50%, rgba(0, 70, 150, .12), transparent 30%),

        radial-gradient(circle at 30% 70%, rgba(0, 120, 255, .06), transparent 30%),

        #020812;

    }



    button {

      font: inherit;

    }



    /* ==============================

       APP SHELL

    ============================== */



    .app {

      display: grid;

      grid-template-columns: 276px 1fr;

      grid-template-rows: 56px 1fr;

      width: 100%;

      height: 100%;

      background:

        linear-gradient(90deg, rgba(0, 8, 20, .92), transparent 20%),

        #020812;

    }



    /* ==============================

       TOPBAR

    ============================== */



    .topbar {

      grid-column: 1 / -1;

      height: 56px;

      display: flex;

      align-items: center;

      padding: 0 18px 0 27px;

      border-bottom: 1px solid #113252;

      background: rgba(2, 9, 20, .96);

      z-index: 100;

    }



    .brand {

      width: 250px;

      display: flex;

      align-items: center;

      gap: 16px;

    }



    .brand-logo {

      width: 54px;

      height: 36px;

      position: relative;

      display: grid;

      place-items: center;

    }



    .infinity {

      position: relative;

      width: 46px;

      height: 25px;

    }



    .infinity::before,

    .infinity::after {

      content: "";

      position: absolute;

      width: 27px;

      height: 20px;

      top: 2px;

      border: 5px solid;

      border-radius: 50%;

      transform: rotate(-18deg);

    }



    .infinity::before {

      left: 0;

      border-color: #00aaff #6d43ff #ff5be9 #00aaff;

    }



    .infinity::after {

      right: 0;

      border-color: #d74cff #00bfff #257dff #d74cff;

    }



    .brand-info {

      display: flex;

      flex-direction: column;

      gap: 3px;

    }



    .brand-title {

      font-size: 16px;

      font-weight: 600;

      white-space: nowrap;

    }



    .online {

      display: flex;

      align-items: center;

      gap: 8px;

      color: #9eb4d5;

      font-size: 12px;

    }



    .online-dot,

    .status-dot {

      width: 8px;

      height: 8px;

      border-radius: 50%;

      background: var(--green);

      box-shadow: 0 0 10px rgba(0, 245, 160, .85);

    }



    .topbar-spacer {

      flex: 1;

    }



    .top-icon {

      width: 48px;

      height: 56px;

      border-left: 1px solid #102d4c;

      display: grid;

      place-items: center;

      color: #dce9ff;

      font-size: 21px;

    }



    .profile {

      height: 56px;

      padding-left: 15px;

      display: flex;

      align-items: center;

      gap: 11px;

      border-left: 1px solid #102d4c;

    }



    .profile-avatar {

      width: 32px;

      height: 32px;

      border-radius: 50%;

      display: grid;

      place-items: center;

      background: radial-gradient(circle, #873eff, #2c0a72);

      border: 1px solid #9e5cff;

      box-shadow: 0 0 15px rgba(123, 54, 255, .4);

    }



    .profile-name {

      font-size: 12px;

      line-height: 16px;

    }



    .profile-name small {

      color: #7f97b9;

      font-size: 10px;

    }



    .chevron {

      color: #8098ba;

      margin-left: 10px;

    }



    /* ==============================

       SIDEBAR

    ============================== */



    .sidebar {

      grid-row: 2;

      border-right: 1px solid #113252;

      background:

        linear-gradient(180deg, rgba(3, 12, 26, .98), rgba(1, 8, 18, .98));

      padding: 17px 17px 18px;

      display: flex;

      flex-direction: column;

      min-width: 0;

      z-index: 40;

    }



    .navigation {

      display: flex;

      flex-direction: column;

      gap: 5px;

    }



    .nav-item {

      height: 42px;

      border: 1px solid transparent;

      border-radius: 7px;

      display: flex;

      align-items: center;

      gap: 16px;

      padding: 0 11px;

      color: #d4e0f5;

      cursor: pointer;

      transition: .18s ease;

      font-size: 14px;

    }



    .nav-item:hover {

      background: rgba(0, 116, 255, .08);

      border-color: rgba(0, 126, 255, .16);

    }



    .nav-item.active {

      background:

        linear-gradient(90deg, rgba(0, 100, 255, .22), rgba(35, 56, 145, .2));

      border-left: 2px solid #009cff;

      box-shadow: inset 0 0 25px rgba(0, 89, 255, .08);

      color: white;

    }



    .nav-icon {

      width: 22px;

      text-align: center;

      font-size: 19px;

      color: #e2edff;

    }



    .apps-title {

      margin-top: 30px;

      border: 1px solid #15385c;

      border-bottom-color: #0c2947;

      border-radius: 8px 8px 0 0;

      height: 42px;

      display: flex;

      align-items: center;

      justify-content: space-between;

      padding: 0 9px;

      color: #cbdaf1;

      font-size: 13px;

    }



    .count {

      width: 20px;

      height: 20px;

      display: grid;

      place-items: center;

      border-radius: 5px;

      background: #08244a;

      color: #acd0ff;

      font-size: 10px;

    }



    .saas-list {

      display: flex;

      flex-direction: column;

      gap: 5px;

      margin-top: 4px;

      overflow-y: auto;

      padding-right: 2px;

    }



    .saas-item {

      height: 65px;

      border: 1px solid #143a60;

      border-radius: 8px;

      background:

        linear-gradient(110deg, rgba(7, 23, 42, .96), rgba(3, 15, 29, .96));

      display: flex;

      align-items: center;

      padding: 8px;

      cursor: grab;

      user-select: none;

      transition:

        transform .18s ease,

        border-color .18s ease,

        box-shadow .18s ease,

        background .18s ease;

    }



    .saas-item:hover {

      transform: translateX(2px);

      border-color: #008dff;

      box-shadow: 0 0 20px rgba(0, 126, 255, .1);

    }



    .saas-item.dragging {

      opacity: .45;

      transform: scale(.97);

    }



    .saas-item.selected {

      border-color: var(--cyan);

      box-shadow: 0 0 18px rgba(0, 216, 255, .15);

    }



    .app-icon {

      width: 43px;

      height: 43px;

      min-width: 43px;

      border-radius: 10px;

      display: grid;

      place-items: center;

      font-size: 21px;

      font-weight: 700;

      margin-right: 12px;

    }



    .icon-green {

      color: #00f4d0;

      background: linear-gradient(145deg, #004f55, #05302f);

      box-shadow: inset 0 0 20px rgba(0, 245, 208, .08);

    }



    .icon-purple {

      color: #e14dff;

      background: linear-gradient(145deg, #3d0575, #1c0835);

    }



    .icon-blue {

      color: #00a9ff;

      background: linear-gradient(145deg, #063d7d, #071c3e);

    }



    .icon-orange {

      color: #ffb01f;

      background: linear-gradient(145deg, #6a3c08, #36200a);

    }



    .icon-pink {

      color: #ff47dc;

      background: linear-gradient(145deg, #67085c, #350c35);

    }



    .saas-text {

      min-width: 0;

      flex: 1;

    }



    .saas-name {

      font-size: 13px;

      color: white;

      margin-bottom: 4px;

    }



    .saas-id {

      font-size: 10px;

      color: #6f8caf;

      white-space: nowrap;

    }



    .more {

      align-self: flex-start;

      color: #d8e7ff;

      font-size: 17px;

      letter-spacing: 1px;

    }



    .api-manager {

      margin-top: auto;

      height: 56px;

      border: 1px solid #15528b;

      border-radius: 8px;

      background: linear-gradient(100deg, #061a32, #051121);

      display: flex;

      align-items: center;

      gap: 12px;

      padding: 8px 10px;

      cursor: pointer;

      transition: .2s;

    }



    .api-manager:hover {

      border-color: #008dff;

      box-shadow: 0 0 22px rgba(0, 126, 255, .12);

    }



    .api-icon {

      width: 35px;

      height: 35px;

      display: grid;

      place-items: center;

      border-radius: 8px;

      color: #d7eaff;

      border: 1px solid #1b4e82;

      font-size: 17px;

    }



    .api-label {

      font-size: 12px;

      color: #dbe8fb;

      flex: 1;

    }



    .api-plus {

      font-size: 22px;

      color: #b6d4f7;

    }



    /* ==============================

       MAIN

    ============================== */



    .main {

      min-width: 0;

      min-height: 0;

      display: flex;

      flex-direction: column;

      background: #020914;

      position: relative;

    }



    .workspace-header {

      height: 87px;

      min-height: 87px;

      border-bottom: 1px solid #113252;

      display: flex;

      align-items: center;

      padding: 0 29px;

      gap: 20px;

      background: rgba(2, 10, 21, .93);

      z-index: 20;

    }



    .workspace-heading {

      flex: 1;

    }



    .workspace-heading h1 {

      font-size: 17px;

      font-weight: 600;

      margin-bottom: 6px;

    }



    .workspace-heading p {

      font-size: 12px;

      color: #94a9c8;

    }



    .workspace-stats {

      display: flex;

      align-items: center;

      gap: 23px;

      color: #bcd0ed;

      font-size: 12px;

    }



    .stat {

      display: flex;

      align-items: center;

      gap: 9px;

      white-space: nowrap;

    }



    .stat-dot {

      width: 8px;

      height: 8px;

      border-radius: 50%;

      background: #aab9d5;

    }



    .stat-dot.green {

      background: var(--green);

      box-shadow: 0 0 10px rgba(0, 245, 160, .8);

    }



    .clear-btn,

    .outline-btn {

      background: rgba(2, 15, 31, .9);

      border: 1px solid #155083;

      color: #d6e6ff;

      height: 36px;

      border-radius: 7px;

      padding: 0 14px;

      cursor: pointer;

      transition: .18s;

      font-size: 11px;

    }



    .clear-btn:hover,

    .outline-btn:hover {

      border-color: #00aaff;

      box-shadow: 0 0 17px rgba(0, 145, 255, .13);

    }



    /* ==============================

       MAP

    ============================== */



    .map {

      position: relative;

      flex: 1;

      min-height: 0;

      overflow: hidden;

      background:

        radial-gradient(circle at 50% 47%, rgba(0, 92, 255, .075), transparent 27%),

        radial-gradient(circle at 50% 47%, rgba(138, 0, 255, .035), transparent 43%),

        #020914;

      touch-action: none;

    }



    .map-grid {

      position: absolute;

      inset: 0;

      background-image:

        radial-gradient(circle, rgba(0, 132, 255, .26) 1px, transparent 1px);

      background-size: 14px 14px;

      opacity: .35;

      mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);

    }



    .connections {

      position: absolute;

      inset: 0;

      pointer-events: none;

      overflow: visible;

    }



    .connection {

      fill: none;

      stroke-width: 2.5;

      stroke-linecap: round;

      stroke-dasharray: 2 9;

      filter: drop-shadow(0 0 6px currentColor);

      opacity: .9;

    }



    .connection.inactive {

      opacity: .2;

      filter: none;

    }



    .connection-dot {

      fill: currentColor;

      filter: drop-shadow(0 0 7px currentColor);

    }



    /* ==============================

       NODES

    ============================== */



    .node {

      position: absolute;

      width: 225px;

      height: 94px;

      border-radius: 16px;

      background:

        linear-gradient(135deg, rgba(8, 26, 48, .98), rgba(3, 14, 29, .98));

      border: 2px solid var(--node-color);

      box-shadow:

        0 0 17px color-mix(in srgb, var(--node-color) 34%, transparent),

        inset 0 0 24px color-mix(in srgb, var(--node-color) 8%, transparent);

      cursor: grab;

      user-select: none;

      z-index: 10;

      transition: box-shadow .18s, transform .18s;

    }



    .node:hover {

      box-shadow:

        0 0 27px color-mix(in srgb, var(--node-color) 45%, transparent),

        inset 0 0 25px color-mix(in srgb, var(--node-color) 10%, transparent);

    }



    .node.dragging {

      cursor: grabbing;

      z-index: 50;

      transform: scale(1.025);

    }



    .node.selected {

      box-shadow:

        0 0 35px color-mix(in srgb, var(--node-color) 52%, transparent),

        inset 0 0 30px color-mix(in srgb, var(--node-color) 12%, transparent);

    }



    .node-inner {

      height: 100%;

      display: flex;

      align-items: center;

      padding: 13px 15px;

      gap: 13px;

    }



    .node-icon {

      width: 46px;

      height: 46px;

      min-width: 46px;

      border-radius: 10px;

      display: grid;

      place-items: center;

      font-size: 23px;

      background: color-mix(in srgb, var(--node-color) 17%, #06101e);

      color: var(--node-color);

      box-shadow: inset 0 0 20px color-mix(in srgb, var(--node-color) 10%, transparent);

    }



    .node-content {

      flex: 1;

      min-width: 0;

    }



    .node-name {

      font-size: 15px;

      font-weight: 600;

      margin-bottom: 8px;

    }



    .node-status {

      display: flex;

      align-items: center;

      gap: 8px;

      color: #c6d7ed;

      font-size: 11px;

    }



    .node-status .status-dot {

      width: 10px;

      height: 10px;

    }



    .node-status.disconnected .status-dot {

      background: #ff5475;

      box-shadow: 0 0 9px rgba(255, 84, 117, .8);

    }



    .node-status.available .status-dot {

      background: #bac7e0;

      box-shadow: 0 0 7px rgba(180, 198, 225, .45);

    }



    .node-menu {

      position: absolute;

      right: 10px;

      top: 9px;

      color: #d8e5fa;

      cursor: pointer;

      letter-spacing: 2px;

      font-size: 13px;

      padding: 3px;

    }



    /* ==============================

       CENTRAL NODE

    ============================== */



    .central-node {

      position: absolute;

      width: 136px;

      height: 130px;

      left: 50%;

      top: 50%;

      transform: translate(-50%, -53%);

      border-radius: 31px;

      background:

        radial-gradient(circle at 50% 25%, rgba(102, 30, 255, .18), transparent 55%),

        linear-gradient(145deg, #07162b, #0b0920);

      border: 2px solid #008cff;

      box-shadow:

        0 0 25px rgba(0, 128, 255, .45),

        0 0 60px rgba(111, 0, 255, .2),

        inset 0 0 30px rgba(0, 126, 255, .08);

      display: flex;

      flex-direction: column;

      align-items: center;

      justify-content: center;

      z-index: 15;

    }



    .central-node::after {

      content: "";

      position: absolute;

      inset: -5px;

      border-radius: 35px;

      border: 1px solid rgba(180, 30, 255, .65);

      border-left-color: rgba(0, 170, 255, .8);

      pointer-events: none;

    }



    .central-logo {

      position: relative;

      width: 54px;

      height: 31px;

      margin-bottom: 8px;

    }



    .central-logo::before,

    .central-logo::after {

      content: "";

      position: absolute;

      width: 32px;

      height: 23px;

      top: 2px;

      border: 5px solid;

      border-radius: 50%;

      transform: rotate(-18deg);

    }



    .central-logo::before {

      left: 0;

      border-color: #00c5ff #5b56ff #d840ff #00c5ff;

    }



    .central-logo::after {

      right: 0;

      border-color: #d840ff #6c48ff #00c4ff #d840ff;

    }



    .central-title {

      font-size: 15px;

      font-weight: 600;

      line-height: 18px;

      text-align: center;

    }



    .central-subtitle {

      font-size: 11px;

      color: #d9e4f5;

    }



    .pulse {

      position: absolute;

      inset: -14px;

      border-radius: 38px;

      border: 1px solid rgba(0, 146, 255, .2);

      animation: pulse 3.2s ease-out infinite;

      pointer-events: none;

    }



    @keyframes pulse {

      0% {

        opacity: .55;

        transform: scale(.96);

      }

      70% {

        opacity: 0;

        transform: scale(1.08);

      }

      100% {

        opacity: 0;

      }

    }



    /* ==============================

       BOTTOM PANELS

    ============================== */



    .bottom-panels {

      position: absolute;

      left: 16px;

      right: 16px;

      bottom: 14px;

      display: grid;

      grid-template-columns: 1fr 1.45fr;

      gap: 10px;

      z-index: 25;

    }



    .bottom-panel {

      min-height: 80px;

      border: 1px solid #155083;

      border-radius: 9px;

      background:

        linear-gradient(110deg, rgba(4, 20, 38, .97), rgba(3, 12, 25, .96));

      box-shadow: 0 10px 35px rgba(0, 0, 0, .18);

    }



    .api-card {

      display: flex;

      align-items: center;

      padding: 12px;

      gap: 12px;

    }



    .api-card-icon {

      width: 42px;

      height: 42px;

      border: 1px solid #123e68;

      border-radius: 9px;

      display: grid;

      place-items: center;

      font-size: 21px;

      color: #d9e9ff;

    }



    .api-card-copy {

      flex: 1;

    }



    .api-card-title {

      font-size: 13px;

      margin-bottom: 4px;

    }



    .api-card-sub {

      font-size: 10px;

      color: #7892b5;

    }



    .configure {

      height: 35px;

      padding: 0 13px;

      border: 1px solid #008dff;

      background: #031a32;

      color: #00aaff;

      border-radius: 7px;

      cursor: pointer;

      font-size: 11px;

      white-space: nowrap;

    }



    .traffic-card {

      display: grid;

      grid-template-columns: 1.4fr .75fr .75fr .8fr;

      align-items: center;

      padding: 10px 14px;

      overflow: hidden;

    }



    .traffic-chart {

      height: 55px;

      border-right: 1px solid #12365a;

      padding-right: 15px;

      display: flex;

      flex-direction: column;

      justify-content: center;

    }



    .traffic-title {

      display: flex;

      align-items: center;

      gap: 7px;

      font-size: 10px;

      margin-bottom: 4px;

    }



    .traffic-title span {

      width: 6px;

      height: 6px;

      border-radius: 50%;

      background: var(--green);

      box-shadow: 0 0 8px var(--green);

    }



    .fake-chart {

      width: 100%;

      height: 28px;

      position: relative;

      overflow: hidden;

    }



    .fake-chart svg {

      width: 100%;

      height: 100%;

    }



    .metric {

      height: 55px;

      border-right: 1px solid #12365a;

      padding: 2px 13px;

    }



    .metric:last-child {

      border: 0;

    }



    .metric-label {

      color: #8ca4c4;

      font-size: 9px;

      margin-bottom: 5px;

    }



    .metric-value {

      font-size: 14px;

      margin-bottom: 3px;

    }



    .metric-change {

      font-size: 9px;

      color: var(--green);

    }



    .metric-change.bad {

      color: #ff4779;

    }



    /* ==============================

       RIGHT PANEL

    ============================== */



    .right-panel {

      width: 352px;

      position: absolute;

      top: 23px;

      right: 16px;

      bottom: 16px;

      z-index: 35;

      overflow-y: auto;

      pointer-events: none;

    }



    .right-card {

      pointer-events: auto;

      border: 1px solid #155083;

      border-radius: 8px;

      background:

        linear-gradient(150deg, rgba(4, 17, 33, .98), rgba(2, 11, 23, .98));

      box-shadow: 0 15px 40px rgba(0, 0, 0, .3);

      overflow: hidden;

    }



    .selected-app-header {

      min-height: 105px;

      display: flex;

      align-items: center;

      padding: 18px;

      gap: 14px;

      position: relative;

    }



    .selected-app-copy {

      flex: 1;

    }



    .selected-app-name {

      font-size: 17px;

      font-weight: 600;

      margin-bottom: 3px;

    }



    .selected-app-id {

      color: #7c95b6;

      font-size: 11px;

      margin-bottom: 9px;

    }



    .connected

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://central-api-nexus.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eaf9f7fc-00b5-40df-8440-723a6d135515).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
