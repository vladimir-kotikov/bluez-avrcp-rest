## Recipes

### Set the default output source

Determine the name of the new source, which has a * in front of index:
```bash
$ pacmd list-sinks | grep -e 'name:' -e 'index'
  * index: 0
	    name: <alsa_output.pci-0000_04_01.0.analog-stereo>
    index: 1
        name: <combined>
```
To set it as the system wide default, add the following to `/etc/pulse/default.pa`

    set-default-sink alsa_output.pci-0000_04_01.0.analog-stereo

When done then you can logout/login or restart PulseAudio manually for these changes to take effect.

## Automatically switch audio sink

Create a script to switch to the desired audio profile if an HDMI cable is plugged in:

`/usr/local/bin/hdmi_sound_toggle.sh`

```shell
#!/bin/bash
USER_NAME=$(w -hs | awk -v vt=tty$(fgconsole) '$0 ~ vt {print $1}')
USER_ID=$(id -u "$USER_NAME")
HDMI_STATUS=$(</sys/class/drm/card0/*HDMI*/status)

export PULSE_SERVER="unix:/run/user/"$USER_ID"/pulse/native"

if [[ $HDMI_STATUS == connected ]]
then
   sudo -u "$USER_NAME" pactl --server "$PULSE_SERVER" set-card-profile 0 output:hdmi-stereo+input:analog-stereo
else
   sudo -u "$USER_NAME" pactl --server "$PULSE_SERVER" set-card-profile 0 output:analog-stereo+input:analog-stereo
fi
```

Create a udev rule to run this script when the status of the HDMI change. _Note: udev rule can't directly run a script, a workaround is to use a .service to run this script_

`/etc/udev/rules.d/99-hdmi_sound.rules`

    KERNEL=="card0", SUBSYSTEM=="drm", ACTION=="change", RUN+="/usr/bin/systemctl start hdmi_sound_toggle.service"

Finally, create the .service file required by the udev rule above:

`/etc/systemd/system/hdmi_sound_toggle.service`

```ini
[Unit]
Description=hdmi sound hotplug

[Service]
Type=simple
RemainAfterExit=no
ExecStart=/usr/local/bin/hdmi_sound_toggle.sh

[Install]
WantedBy=multi-user.target
```

To make the change effective don't forget to reload the udev rules:

    udevadm control --reload-rules

You'll also need to reload the systemd units.

    systemctl daemon-reload

A reboot can be required.


### Another way to autoredirect

To redirect the right **source** to the right **sink** each time a new Bluetooth device is connecteda dd udev rule which executes [`a2dp-autoconnect`](./a2dp-autoconnect.sh) script each time a Bluetooth device is connected:

`pi@raspberrypi:~ $ cat /etc/udev/rules.d/99-input.rules`

    KERNEL=="input[0-9]*", RUN+="/home/pi/a2dp-autoconnect"

The script I used is an extended version of http://blog.mrverrall.co.uk/2013/01/raspberry-pi-a2dp-bluetooth-audio.html. It's pretty straightforward: it redirects a new Bluetooth audio source to the right sink and sets output volume level.

I located it in `/home/pi/a2dp-autoconnect`, then made it executable:

    pi@raspberrypi:~ $ chmod +x a2dp-autoconnect

**Note**: Observe connection log "live" to debug connection issues:

    pi@raspberrypi:~ $ tail -f /var/log/a2dp-autoconnect

## References

- https://wiki.archlinux.org/index.php/PulseAudio/Examples
- https://wiki.debian.org/ru/PulseAudio
