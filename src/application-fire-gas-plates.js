// Pipe centre-lines traced against the finished 16:9 plates, in display units.
export const FIRE_GAS_PLATES = {
  fire: {
    paths: [
      // Across the soffit, down the riser and through the cabinet valve.
      'M 0 111 H 673 Q 696 111 696 136 V 365 Q 696 386 718 386 H 773',
      'M 365.5 111 V 184',
      'M 429.4 111 V 184',
    ],
  },
  gas: {
    paths: [
      // Incoming line to the left-hand meter port.
      'M 0 50.8 H 695.5 Q 711.2 50.8 711.2 66.8 V 125',
      // Out of the meter, through the yellow shut-off valve to the hob.
      'M 769.2 125 V 105 Q 769.2 91.5 783.5 91.5 H 814 Q 830.2 91.5 830.2 108 V 414',
    ],
  },
};
