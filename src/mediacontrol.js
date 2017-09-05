
class MediaControl1 {
    constructor(bus, adapter, device) {
        this.bus = bus;

        this.payload = {
            destination: 'org.bluez',
            path: `/org/bluez/${adapter}/${device}`,
            interface: 'org.bluez.MediaControl1'
        }

        this.invokeMember = async (member) => {
            return new Promise((resolve, reject) => {
                this.bus.invoke({ ...this.payload, member }, (err, result) => {
                    err ? reject(err) : resolve(result);
                });
            });
        }
    }

    async Play (callback)        { return this.invokeMember('Play') };
    async Pause (callback)       { return this.invokeMember('Pause') };
    async Stop (callback)        { return this.invokeMember('Stop') };
    async Next (callback)        { return this.invokeMember('Next') };
    async Previous (callback)    { return this.invokeMember('Previous') };
    async VolumeUp (callback)    { return this.invokeMember('VolumeUp') };
    async VolumeDown (callback)  { return this.invokeMember('VolumeDown') };
    async FastForward (callback) { return this.invokeMember('FastForward') };
    async Rewind (callback)      { return this.invokeMember('Rewind') };
}

module.exports = MediaControl1
