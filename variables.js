const { Gdk, Gtk } = imports.gi;
import App from "resource:///com/github/Aylur/ags/app.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
const { exec, execAsync } = Utils;

Gtk.IconTheme.get_default().append_search_path(`${App.configDir}/assets/icons`);

// Global vars for external control (through keybinds)
export const showMusicControls = Variable(false, {});
export const showColorScheme = Variable(false, {});
export const showBar = Variable(true, {});
export const workspaceBars = {};

globalThis["openMusicControls"] = showMusicControls;
globalThis["openColorScheme"] = showColorScheme;
globalThis["mpris"] = Mpris;
globalThis["toggleVisibility"] = () => {
  const workspace = Hyprland.active.workspace.id;
  workspaceBars[workspace] =
    workspaceBars[workspace] === undefined // if never been set
      ? !showBar.value // use the current value
      : !workspaceBars[workspace]; // otherwise toggle

  showBar.value = workspaceBars[workspace]; // !showBar.value;
};

// Mode switching
export const currentShellMode = Variable("normal", {}); // normal, focus
globalThis["currentMode"] = currentShellMode;
globalThis["cycleMode"] = () => {
  if (currentShellMode.value === "normal") {
    currentShellMode.value = "focus";
  } else {
    currentShellMode.value = "normal";
  }
};

// Window controls
const range = (length, start = 1) =>
  Array.from({ length }, (_, i) => i + start);
globalThis["toggleWindowOnAllMonitors"] = (name) => {
  range(Gdk.Display.get_default()?.get_n_monitors() || 1, 0).forEach((id) => {
    App.toggleWindow(`${name}${id}`);
  });
};
globalThis["closeWindowOnAllMonitors"] = (name) => {
  range(Gdk.Display.get_default()?.get_n_monitors() || 1, 0).forEach((id) => {
    App.closeWindow(`${name}${id}`);
  });
};
globalThis["openWindowOnAllMonitors"] = (name) => {
  range(Gdk.Display.get_default()?.get_n_monitors() || 1, 0).forEach((id) => {
    App.openWindow(`${name}${id}`);
  });
};

globalThis["closeEverything"] = () => {
  const numMonitors = Gdk.Display.get_default()?.get_n_monitors() || 1;
  for (let i = 0; i < numMonitors; i++) {
    App.closeWindow(`cheatsheet${i}`);
    App.closeWindow(`session${i}`);
  }
  App.closeWindow("sideleft");
  App.closeWindow("sideright");
  App.closeWindow("overview");
};
