import {RGBELoader} from '../vendor/RGBELoader.js';
import {DataUtils} from '../vendor/three.module.js';

// Prepare the studio exposure off the scrolling thread. The buffer transfers
// to the renderer without a second copy of the panoramic image.
self.onmessage = async ({data: bounce}) => {
  try {
    const response = await fetch('./studio-small-09-1k.hdr');
    if (!response.ok) throw new Error('Missing studio exposure');
    const {data, width, height, type} = new RGBELoader().parse(await response.arrayBuffer());
    for (let pixel = 0; pixel < data.length; pixel += 4) {
      for (let channel = pixel; channel < pixel + 3; channel++) {
        const lit = DataUtils.fromHalfFloat(data[channel]) + bounce;
        data[channel] = DataUtils.toHalfFloat(Math.min(lit, 65504));
      }
    }
    self.postMessage({data, width, height, type}, [data.buffer]);
  } catch {
    self.postMessage(null);
  }
};
