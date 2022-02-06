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
ndi.js random [options] [timeout]
```

Where `timeout` is the amount of time it encodes the signal before closing.

#### Options

| Name.        | Description                 | Default |
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
ndi.js v4l2 <path>
```

Where `path` is the path to the video source (i.e. `/dev/videoN`).
