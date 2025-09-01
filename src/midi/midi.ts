export type MidiMapping = {
  ccToParam: Record<number, string>; // CC number -> param key
};

type MidiInputLike = { onmidimessage: ((e: { data: Uint8Array }) => void) | null };
type MidiAccessLike = {
  inputs: Map<string, MidiInputLike> | { forEach: (cb: (input: MidiInputLike) => void) => void };
  onstatechange?: () => void;
};

export class MidiManager {
  private access: MidiAccessLike | null = null;
  private mapping: MidiMapping = { ccToParam: {} };
  private onParam?: (key: string, value01: number) => void;

  constructor(onParam?: (key: string, value01: number) => void) {
    this.onParam = onParam;
  }

  async init() {
    if (!('requestMIDIAccess' in navigator)) return;
    const navWithMidi = navigator as Navigator & { requestMIDIAccess?: (opts: { sysex: boolean }) => Promise<MidiAccessLike> };
    if (!navWithMidi.requestMIDIAccess) return;
    this.access = await navWithMidi.requestMIDIAccess({ sysex: false });
    this.attach();
  }

  setMapping(mapping: MidiMapping) {
    this.mapping = mapping;
  }

  private attach() {
    if (!this.access) return;
    const inputs = this.access.inputs as any;
    if (inputs && typeof inputs.forEach === 'function') {
      inputs.forEach((input: MidiInputLike) => {
        input.onmidimessage = (e: { data: Uint8Array }) => this.handleMessage(e);
      });
    } else if (inputs instanceof Map) {
      (inputs as Map<string, MidiInputLike>).forEach((input) => {
        input.onmidimessage = (e: { data: Uint8Array }) => this.handleMessage(e);
      });
    }
    this.access.onstatechange = () => this.attach();
  }

  private handleMessage(e: { data: Uint8Array }) {
    const [status, data1, data2] = e.data as unknown as [number, number, number];
    const isCC = (status & 0xf0) === 0xb0;
    if (!isCC) return;
    const param = this.mapping.ccToParam[data1];
    if (!param) return;
    const v = data2 / 127;
    this.onParam?.(param, v);
  }
}


