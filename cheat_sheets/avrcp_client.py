#!/usr/bin/env python

# Dependencies:
# sudo apt-get install -y python-gobject
# sudo apt-get install -y python-smbus

import time
import signal
import dbus
import dbus.service
import dbus.mainloop.glib
import gobject
import logging

SERVICE_NAME = "org.bluez"
AGENT_IFACE = SERVICE_NAME + '.Agent1'
ADAPTER_IFACE = SERVICE_NAME + ".Adapter1"
DEVICE_IFACE = SERVICE_NAME + ".Device1"
PLAYER_IFACE = SERVICE_NAME + '.MediaPlayer1'
TRANSPORT_IFACE = SERVICE_NAME + '.MediaTransport1'

#LOG_LEVEL = logging.INFO
LOG_LEVEL = logging.DEBUG
LOG_FILE = "/dev/stdout"
LOG_FORMAT = "%(asctime)s %(levelname)s %(message)s"

"""Utility functions from bluezutils.py"""


def getManagedObjects():
    bus = dbus.SystemBus()
    manager = dbus.Interface(bus.get_object(
        "org.bluez", "/"), "org.freedesktop.DBus.ObjectManager")
    return manager.GetManagedObjects()


def findAdapter():
    objects = getManagedObjects()
    bus = dbus.SystemBus()
    for path, ifaces in objects.iteritems():
        adapter = ifaces.get(ADAPTER_IFACE)
        if adapter is None:
            continue
        obj = bus.get_object(SERVICE_NAME, path)
        return dbus.Interface(obj, ADAPTER_IFACE)
    raise Exception("Bluetooth adapter not found")


class BluePlayer(dbus.service.Object):
    AGENT_PATH = "/blueplayer/agent"
    CAPABILITY = "DisplayOnly"

    bus = None
    adapter = None
    device = None
    deviceAlias = None
    player = None
    transport = None
    connected = None
    state = None
    status = None
    discoverable = None
    track = None

    def __init__(self):
        """Initialize gobject, start the LCD, and find any current media players"""

        self.bus = dbus.SystemBus()

        dbus.service.Object.__init__(
            self, dbus.SystemBus(), BluePlayer.AGENT_PATH)

        self.bus.add_signal_receiver(self.playerHandler,
                                     bus_name="org.bluez",
                                     dbus_interface="org.freedesktop.DBus.Properties",
                                     signal_name="PropertiesChanged",
                                     path_keyword="path")

        self.registerAgent()

        # adapter_path = findAdapter().object_path
        # self.bus.add_signal_receiver(self.adapterHandler,
        #                              bus_name="org.bluez",
        #                              path=adapter_path,
        #                              dbus_interface="org.freedesktop.DBus.Properties",
        #                              signal_name="PropertiesChanged",
        #                              path_keyword="path")

        self.findPlayer()
        self.updateDisplay()

    def start(self):
        """Start the BluePlayer by running the gobject mainloop()"""
        try:
            mainloop = gobject.MainLoop()
            mainloop.run()
        except:
            self.end()

    def findPlayer(self):
        """Find any current media players and associated device"""
        manager = dbus.Interface(self.bus.get_object(
            "org.bluez", "/"), "org.freedesktop.DBus.ObjectManager")
        objects = manager.GetManagedObjects()

        player_path = None
        transport_path = None
        for path, interfaces in objects.iteritems():
            if PLAYER_IFACE in interfaces:
                player_path = path
            if TRANSPORT_IFACE in interfaces:
                transport_path = path

        if player_path:
            logging.debug("Found player on path [{}]".format(player_path))
            self.connected = True
            self.getPlayer(player_path)
            player_properties = self.player.GetAll(
                PLAYER_IFACE, dbus_interface="org.freedesktop.DBus.Properties")
            if "Status" in player_properties:
                self.status = player_properties["Status"]
            if "Track" in player_properties:
                self.track = player_properties["Track"]
        else:
            logging.debug("Could not find player")

        if transport_path:
            logging.debug("Found transport on path [{}]".format(player_path))
            self.transport = self.bus.get_object("org.bluez", transport_path)
            logging.debug("Transport [{}] has been set".format(transport_path))
            transport_properties = self.transport.GetAll(
                TRANSPORT_IFACE, dbus_interface="org.freedesktop.DBus.Properties")
            if "State" in transport_properties:
                self.state = transport_properties["State"]

    def getPlayer(self, path):
        """Get a media player from a dbus path, and the associated device"""
        self.player = self.bus.get_object("org.bluez", path)
        logging.debug("Player [{}] has been set".format(path))
        device_path = self.player.Get(
            "org.bluez.MediaPlayer1", "Device", dbus_interface="org.freedesktop.DBus.Properties")
        self.getDevice(device_path)

    def getDevice(self, path):
        """Get a device from a dbus path"""
        self.device = self.bus.get_object("org.bluez", path)
        self.deviceAlias = self.device.Get(
            DEVICE_IFACE, "Alias", dbus_interface="org.freedesktop.DBus.Properties")

    def playerHandler(self, interface, changed, invalidated, path):
        """Handle relevant property change signals"""
        logging.debug("Interface [{}] changed [{}] on path [{}]".format(
            interface, changed, path))
        iface = interface[interface.rfind(".") + 1:]

        if iface == "Device1":
            if "Connected" in changed:
                self.connected = changed["Connected"]
        if iface == "MediaControl1":
            if "Connected" in changed:
                self.connected = changed["Connected"]
                if changed["Connected"]:
                    logging.debug(
                        "MediaControl is connected [{}] and interface [{}]".format(path, iface))
                    self.findPlayer()
        elif iface == "MediaTransport1":
            if "State" in changed:
                logging.debug(
                    "State has changed to [{}]".format(changed["State"]))
                self.state = (changed["State"])
            if "Connected" in changed:
                self.connected = changed["Connected"]
        elif iface == "MediaPlayer1":
            if "Track" in changed:
                logging.debug(
                    "Track has changed to [{}]".format(changed["Track"]))
                self.track = changed["Track"]
            if "Status" in changed:
                logging.debug(
                    "Status has changed to [{}]".format(changed["Status"]))
                self.status = (changed["Status"])

        self.updateDisplay()

    def updateDisplay(self):
        """Display the current status of the device on the LCD"""
        logging.debug("Updating display for connected: [{}]; state: [{}]; status: [{}]; discoverable [{}]".format(
            self.connected, self.state, self.status, self.discoverable))

        if self.discoverable:
            self.wake()
            self.showDiscoverable()
        else:
            if self.connected:
                if self.state == "idle":
                    self.sleep()
                else:
                    self.wake()
                    if self.status == "paused":
                        self.showPaused()
                    else:
                        self.showTrack()
            else:
                self.sleep()

    def showDevice(self):
        """Display the device connection info on the LCD"""
        # self.lcd.clear()
        # self.lcd.writeLn("Connected to:", 0)
        # self.lcd.writeLn(self.deviceAlias, 1)
        print "Connected to:" + self.deviceAlias
        time.sleep(2)

    def showTrack(self):
        """Display track info on the LCD"""
        lines = []
        if "Artist" in self.track:
            lines.append(self.track["Artist"])
            if self.track["Title"]:
                lines.append(self.track["Title"])

        elif "Title" in self.track:
            lines.append(self.track["Title"])
            # lines = self.lcd.wrap(self.track["Title"])

        # self.lcd.clear()
        print " ".join(lines)
        # for i, line in enumerate(lines):
        #     if i >= self.lcd.numlines:
        #         break
        #     self.lcd.writeLn(lines[i], i)

    def showPaused(self):
        # self.lcd.clear()
        # self.lcd.writeLn("Device is paused", 0)
        print (">>> Device is paused")

    def showDiscoverable(self):
        # self.lcd.clear()
        # self.lcd.writeLn("Waiting to pair", 0)
        # self.lcd.writeLn("with device", 1)
        print (">>> Waiting to pair with device")

    def next(self):
        self.player.Next(dbus_interface=PLAYER_IFACE)

    def previous(self):
        self.player.Previous(dbus_interface=PLAYER_IFACE)

    def play(self):
        self.player.Play(dbus_interface=PLAYER_IFACE)

    def pause(self):
        self.player.Pause(dbus_interface=PLAYER_IFACE)

    def volumeUp(self):
        self.control.VolumeUp(dbus_interface=CONTROL_IFACE)
        self.transport.VolumeUp(dbus_interface=TRANSPORT_IFACE)

    def wake(self):
        print ">>> Wake"
        # """Wake up the LCD"""
        # self.lcd.backlight(Lcd.TEAL)

    def shutdown(self):
    #     self.lcd.end()
        print ">>> BYE"

    def sleep(self):
    #     """Put the LCD to sleep"""
    #     self.lcd.clear()
    #     self.lcd.backlight(Lcd.OFF)
        print ">>> Sleep"

    def getStatus(self):
        return self.status

    """Pairing agent methods"""
    @dbus.service.method(AGENT_IFACE, in_signature="ou", out_signature="")
    def RequestConfirmation(self, device, passkey):
        """Always confirm"""
        logging.debug("RequestConfirmation returns")
        self.trustDevice(device)
        return

    @dbus.service.method(AGENT_IFACE, in_signature="os", out_signature="")
    def AuthorizeService(self, device, uuid):
        """Always authorize"""
        logging.debug("Authorize service returns")
        return

    def trustDevice(self, path):
        """Set the device to trusted"""
        device_properties = dbus.Interface(self.bus.get_object(
            SERVICE_NAME, path), "org.freedesktop.DBus.Properties")
        device_properties.Set(DEVICE_IFACE, "Trusted", True)

    def registerAgent(self):
        """Register BluePlayer as the default agent"""
        manager = dbus.Interface(self.bus.get_object(
            SERVICE_NAME, "/org/bluez"), "org.bluez.AgentManager1")
        manager.RegisterAgent(BluePlayer.AGENT_PATH, BluePlayer.CAPABILITY)
        manager.RequestDefaultAgent(BluePlayer.AGENT_PATH)
        logging.debug("Blueplayer is registered as a default agent")

    def startPairing(self):
        logging.debug("Starting to pair")
        """Make the adpater discoverable"""
        adapter_path = findAdapter().object_path
        adapter = dbus.Interface(self.bus.get_object(
            SERVICE_NAME, adapter_path), "org.freedesktop.DBus.Properties")
        adapter.Set(ADAPTER_IFACE, "Discoverable", True)


def navHandler(buttons):
    logging.debug("Handling navigation for [{}]".format(buttons))
    """Handle the navigation buttons"""
    if buttons == Lcd.BUTTON_SELECT:
        player.startPairing()
    elif buttons == Lcd.BUTTON_LEFT:
        player.previous()
    elif buttons == Lcd.BUTTON_RIGHT:
        player.next()
    elif buttons == Lcd.BUTTON_UP:
        if player.getStatus() == "playing":
            player.pause()
        else:
            player.play()


logging.basicConfig(filename=LOG_FILE, format=LOG_FORMAT, level=LOG_LEVEL)
logging.info("Starting BluePlayer")

gobject.threads_init()
dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)

player = None
try:
    player = BluePlayer()
    mainloop = gobject.MainLoop()
    mainloop.run()
except KeyboardInterrupt as ex:
    logging.info("BluePlayer canceled by user")
except Exception as ex:
    logging.error(
        "How embarrassing. The following error occurred {}".format(ex))
finally:
    if player:
        player.shutdown()
