const { Gdk, Gtk } = imports.gi;
import App from "resource:///com/github/Aylur/ags/app.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
const { exec, execAsync } = Utils;
import { init as i18n_init, getString } from './i18n/i18n.js'
//init i18n, Load language file
i18n_init()
Gtk.IconTheme.get_default().append_search_path(`${App.configDir}/assets/icons`);

// Global vars for external control (through keybinds)
export const showMusicControls = Variable(false, {});
export const showColorScheme = Variable(false, {});
export const showBarDefault = Variable(true, {});
export const showBar = Variable(true, {});
export const workspaceBars = {};

globalThis["openMusicControls"] = showMusicControls;
globalThis["openColorScheme"] = showColorScheme;
globalThis["mpris"] = Mpris;
globalThis['getString'] = getString
globalThis["toggleBarVisibility"] = () => {
  const workspaceId = Hyprland.active.workspace.id;

  showBarDefault.value = !showBarDefault.value;

  if (showBarDefault.value) {
    showBar.value =
      workspaceBars[workspaceId] === undefined
        ? showBarDefault.value
        : workspaceBars[workspaceId];
  } else {
    showBar.value = false;
  }
};

globalThis["toggleCurrentWorkspaceBarVisibility"] = () => {
  if (!showBarDefault.value) return;
  const workspaceId = Hyprland.active.workspace.id;
  workspaceBars[workspaceId] =
    workspaceBars[workspaceId] === undefined // if never been set
      ? !showBar.value // invert the current value
      : !showBarDefault.value
        ? false // otherwise if it's hidden by default, hide it
        : !workspaceBars[workspaceId]; // or just toggle the existing value

  showBar.value = workspaceBars[workspaceId];
};
// load monitor shell modes from userOptions
const initialMonitorShellModes = () => {
    const numberOfMonitors = Gdk.Display.get_default()?.get_n_monitors() || 1;
    const monitorBarConfigs = [];
    for (let i = 0; i < numberOfMonitors; i++) {
        if (userOptions.bar.modes[i]) {
            monitorBarConfigs.push(userOptions.bar.modes[i])
        } else {
            monitorBarConfigs.push('normal')
        }
    }
    return monitorBarConfigs;

}
export const currentShellMode = Variable(initialMonitorShellModes(), {}) // normal, focus

// Mode switching
const updateMonitorShellMode = (monitorShellModes, monitor, mode) => {
    const newValue = [...monitorShellModes.value];
    newValue[monitor] = mode;
    monitorShellModes.value = newValue;
}
globalThis['currentMode'] = currentShellMode;
globalThis['cycleMode'] = () => {
    const monitor = Hyprland.active.monitor.id || 0;

    if (currentShellMode.value[monitor] === 'normal') {
        updateMonitorShellMode(currentShellMode, monitor, 'focus')
    }
    else if (currentShellMode.value[monitor] === 'focus') {
        updateMonitorShellMode(currentShellMode, monitor, 'nothing')
    }
    else {
        updateMonitorShellMode(currentShellMode, monitor, 'normal')
    }
}
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

globalThis['closeEverything'] = () => {
    const numMonitors = Gdk.Display.get_default()?.get_n_monitors() || 1;
    for (let i = 0; i < numMonitors; i++) {
        App.closeWindow(`cheatsheet${i}`);
        App.closeWindow(`session${i}`);
    }
    App.closeWindow('sideleft');
    App.closeWindow('sideright');
    App.closeWindow('overview');
};
