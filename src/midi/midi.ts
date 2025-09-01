export type MidiMapping = {
  ccToParam: Record<number, string>; // CC number -> param key
};

export class MidiManager {
  // Use minimal types to avoid dependency on lib.dom WebMidi namespace
  private access: any | null = null;
  private mapping: MidiMapping = { ccToParam: {} };
  private onParam?: (key: string, value01: number) => void;

  constructor(onParam?: (key: string, value01: number) => void) {
    this.onParam = onParam;
  }

  async init() {
    if (!('requestMIDIAccess' in navigator)) return;
    // @ts-ignore
    this.access = await navigator.requestMIDIAccess({ sysex: false });
    this.attach();
  }

  setMapping(mapping: MidiMapping) {
    this.mapping = mapping;
  }

  private attach() {
    if (!this.access) return;
    this.access.inputs.forEach((input) => {
      input.onmidimessage = (e) => this.handleMessage(e);
    });
    this.access.onstatechange = () => this.attach();
  }

  private handleMessage(e: any) {
    const [status, data1, data2] = e.data;
    const isCC = (status & 0xf0) === 0xb0;
    if (!isCC) return;
    const param = this.mapping.ccToParam[data1];
    if (!param) return;
    const v = data2 / 127;
    this.onParam?.(param, v);
  }
}


