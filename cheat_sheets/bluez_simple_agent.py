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
        dbus.service.Object.__init__(self, dbus.SystemBus(), BluePlayer.AGENT_PATH)
        self.registerAgent()

    def start(self):
        """Start the BluePlayer by running the gobject mainloop()"""
        try:
            mainloop = gobject.MainLoop()
            mainloop.run()
        except:
            self.end()

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
