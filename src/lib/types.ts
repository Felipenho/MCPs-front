export interface Preset {
  id: string;
  name: string;
  command: string;
}

export type OutputLine = {
  id: number;
  type: 'in' | 'out' | 'system';
  text: string;
};

    