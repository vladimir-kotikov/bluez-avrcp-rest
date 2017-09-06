
export class MediaControl {
    private payload: { destination: string; path: string; interface: string; };
    constructor(private bus: any, adapter: string, device: string) {
        this.payload = {
            destination: "org.bluez",
            path: `/org/bluez/${adapter}/${device}`,
            interface: "org.bluez.MediaControl1"
        }

    }

    private async invokeMember (member: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.bus.invoke({ ...this.payload, member }, (err: any, result: any) => {
                err ? reject(err) : resolve(result);
            });
        });
    }

    public async Play ()        { return this.invokeMember("Play") };
    public async Pause ()       { return this.invokeMember("Pause") };
    public async Stop ()        { return this.invokeMember("Stop") };
    public async Next ()        { return this.invokeMember("Next") };
    public async Previous ()    { return this.invokeMember("Previous") };
    public async VolumeUp ()    { return this.invokeMember("VolumeUp") };
    public async VolumeDown ()  { return this.invokeMember("VolumeDown") };
    public async FastForward () { return this.invokeMember("FastForward") };
    public async Rewind ()      { return this.invokeMember("Rewind") };
}
