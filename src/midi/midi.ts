export type MidiMapping = {
  ccToParam: Record<number, string>; // CC number -> param key
};

type MidiMessageEventLike = { data: Uint8Array };
type MidiInputLike = { onmidimessage: ((e: MidiMessageEventLike) => void) | null };
type MidiInputMapLike = { forEach(cb: (input: MidiInputLike, key: string) => void): void } | Map<string, MidiInputLike>;
type MidiAccessLike = { inputs: MidiInputMapLike; onstatechange?: (() => void) | null };

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
    this.access = await navWithMidi.requestMIDIAccess({ sysex: false }) as unknown as MidiAccessLike;
    this.attach();
  }

  setMapping(mapping: MidiMapping) {
    this.mapping = mapping;
  }

  private attach() {
    if (!this.access) return;
    const inputs = this.access.inputs;
    if (inputs instanceof Map) {
      inputs.forEach((input) => {
        input.onmidimessage = (e: MidiMessageEventLike) => this.handleMessage(e);
      });
    } else {
      (inputs as { forEach(cb: (input: MidiInputLike, key: string) => void): void }).forEach((input) => {
        input.onmidimessage = (e: MidiMessageEventLike) => this.handleMessage(e);
      });
    }
    this.access.onstatechange = () => this.attach();
  }

  private handleMessage(e: MidiMessageEventLike) {
    const [status, data1, data2] = e.data as unknown as [number, number, number];
    const isCC = (status & 0xf0) === 0xb0;
    if (!isCC) return;
    const param = this.mapping.ccToParam[data1];
    if (!param) return;
    const v = data2 / 127;
    this.onParam?.(param, v);
  }
}


