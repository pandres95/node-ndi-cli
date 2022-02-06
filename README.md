# Example CLI for Node NDI

## Setup

To install globally, run:

```bash
npm install -g @ndi.js/cli
```

## Usage

To see the options, run: 

``` 
./ndi.ts
```

### Random Source

Sends a random video/audio source:

```
./ndi.ts random
```

| Option       | Description                 | Default |
| :----------- | :-------------------------- | :------ |
| `video`      | Send video signal           | `true`  |
| `width`      | Width of video signal       | 1920    |
| `height`     | Height of video signal      | 1080    |
| `frames`     | Frames per second           | 60      |
| `audio`      | Send audio signal           | `true`  |
| `channels`   | Channels on audio signal    | 2       |
| `sampleRate` | Sample rate of audio signal | 48000   |

### V4L2 Source

Sends a V4L2 only-video source

```
./ndi.ts v4l2 /dev/videoN
```

