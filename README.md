## Note on package NPM scripts

Some of package scripts, namely `npm run deploy` and `npm run start:remote` are using `rpi` as an alias for remote Raspberry Pi host. To make sure these scripts are working correctly you might want to set up non-interactive SSH login on your RPi and add the alias in your `~/.ssh/config`, e.g.

```
Host rpi
     HostName <your rpi hostname or IP address>
     User <pi username>
     ## Forward port for rmate
     RemoteForward 52698 127.0.0.1:52698
```

## Note on running the app on remote system

Notice that the script is accessing system bus and hecne needs to be run under sudo to work properly. This adds so meadditional complexity, but in stort the following needs to be done to be able to launch the app remotely under sudo (Debian/Ubuntu):

- User which runs the app must be added to sudoers with "nopasswd" option. The following script should do the trick

  ```bash
  sudo echo $(whoami) ALL=(ALL) NOPASSWD: ALL > /etc/sudoers.d/010_$(whoami)-nopasswd
  ```

- A node executable should present in `$PATH` under sudo. For NVM users this might be achieved by running the following command:

  ```bash
  sudo ln -s "$(which node)" /usr/local/bin/node
  ```

For service to be able to register you will need to allow registration by adding the following config

```xml
<busconfig>
  <policy context="default">
    <allow own="com.github.sidorares.dbus.Example"/>
    <allow send_destination="com.github.sidorares.dbus.Example"
           send_interface="org.freedesktop.DBus.Introspectable"/>
  </policy>
</busconfig>
```

to `/etc/dbus-1/system.d/<your_config_filename>.conf`
